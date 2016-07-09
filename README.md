# Piquouze

`piquouze` is a featureful dependency injection module for
[nodejs](https://nodejs.org).

[![NPM Summary](https://nodei.co/npm/piquouze.png)](https://www.npmjs.com/package/piquouze)
[![NPM Downloads](https://nodei.co/npm-dl/piquouze.png?months=1)](https://www.npmjs.com/package/piquouze)

[![Build Status](https://travis-ci.org/pinicarus/piquouze.svg?branch=master)](https://travis-ci.org/pinicarus/piquouze)
[![Coverage Status](https://coveralls.io/repos/github/pinicarus/piquouze/badge.svg?branch=master)](https://coveralls.io/github/pinicarus/piquouze?branch=master)

## Features

- Containers hierarchy
- Registration of any first class value (including function and classes)
- Injection of function and class constructors
- Detection of contained factories names
- Detection of dependencies from parameter names
- Clean error on dependencies cycle
- Extensible dependencies caching policies

## Caveats

Because of the nature of the Javascript legacy, it is very hard to properly
determine whether a regular function (one using the `function` keyword) is
actually a prototype constructor or a simple function.

It is generally harmless to call a simple function with the `new` keyword.
However, doing so is considered a prototype instantiation and as such, the
actual value returned from the `new` keyword is the return value of the
function *if and only if* it is a an Object (of any kind). Primitive values
(`undefined`, `null`, booleans, numbers, strings, symbols) will be substituted
by the value of the receiver (the `this` value).

`piquouze` will mimic the effects of the `new` operator on calls to injected
regular function if the return value is an instance of `Object` or if the bound
receiver has own properties after the call. Otherwise it will return the
function return value.

Furthermore, bound function cannot be register as factories or injected (but
they can be registered as value). This is because there is no clean way to
retrieve the bounded function parameters and thus it cannot be injected
properly.

## Requirements

`piquouze` work with NodeJS 4.x and above. Install it the usual way:

```
npm install piquouze
```

## How To

First start by creating a dependencies container:

```javascript
const piquouze = require("piquouze");

const container = new piquouze.Container();
```

Then register some first class values and/or factories (when resolving
injection, factories will be injected too):

```javascript
container.registerValue("myConst", 42);
container.registerValue("myLog", () => console.log("hello, world"));
```

Then define a functor to inject:

```javascript
class myTargetClass {
  constructor(myConst, myLog) {
    this.value = myConst;
    myLog();
  }
}
```

Then inject it, and create an instance:

```javascript
let functor = container.inject(myTargetClass);
let instance = functor(); // -> hello, world
console.log(instance instanceof myTargetClass); // -> true
console.log(instance.value); // -> 42
```

Dependencies are automatically inferred from the name of the parameters, but
they can also be forced:

```javascript
myTargetClass.$inject = ["anotherConst", "anotherLog"];
```

Regular and arrow functions can be injected as well, and all of them can take
any number of extra parameters:

```javascript
class myTargetClassWithExtra {
  constructor(myConst, myLog, ...args) {
    this.value = myConst;
    this.extra = args;
    myLog();
  }
}

functor = container.inject(myTargetClassWithExtra);
instance = functor("extraneous"); // -> hello, world
console.log(instance.extra); // -> ["extraneous"]     
```

Of course with node version prior to 6.x, the rest operator is not supported,
so you have to either use `arguments` or name all the extra parameters and
force the injection list of dependencies.

Child containers can be created easily:

```javascript
const childContainer = container.createChild();
```

Dependencies can be redefined, however changes are not reflected to already
injected functors. Dependencies can exist anywhere in the container hierarchy
and will be resolved by name from children to parent containers.

Factories can be registered too:

```javascript
container.registerFactory("myFactory", (myConst) => ({data: myConst}));
```

Dependencies on factories will be injected as factories results (or instance if
the factory was a class):

```javascript
functor = container.inject((myFactory) => myFactory);
console.log(functor()); // -> {data: 42}
```

Factories can be register with an optional caching policy indicating how often
the factory is to be called to get new values:

```javascript
container.registerFactory("myFactory", (myConst) => ({data: myConst}), new piquouze.caching.PerContainer());
```

`piquouze` has the following policies:

- `caching.Always`: the value is cached forever
- `caching.PerContainer`: the value is cached once per container
- `caching.PerInjection`: the value is cached once per injection (this is the default)
- `caching.Never`: the value is never cached
