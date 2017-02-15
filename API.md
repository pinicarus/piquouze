# Classes

<dl>
<dt><a href="#Container">Container</a></dt>
<dd><p>A dependency container.
Each dependency is registered with a name and a caching policy.
Dependencies can be any first class value except undefined, or a factory function or class.</p>
</dd>
<dt><a href="#Policy">Policy</a></dt>
<dd><p>Parent class for all caching policies.
Children classes must re-implement the `getValue&#39; method.</p>
</dd>
<dt><a href="#Scanner">Scanner</a></dt>
<dd><p>A functor scanner.</p>
<p>Scanning is based on the textual representation of the functor. It can be
used on functions (both regular and arrow) and classes (both constructors
and methods). Any supported functor can be a generator as well.</p>
</dd>
</dl>

# Typedefs

<dl>
<dt><a href="#Iterable">Iterable</a> : <code>Object</code></dt>
<dd><p>An iterable object</p>
</dd>
</dl>

<a name="Container"></a>

# Container
A dependency container.
Each dependency is registered with a name and a caching policy.
Dependencies can be any first class value except undefined, or a factory function or class.

**Kind**: global class  

* [Container](#Container)
    * [new Container()](#new_Container_new)
    * _instance_
        * [.createChild()](#Container+createChild) ⇒ <code>[Container](#Container)</code>
        * [.registerValue(name, value)](#Container+registerValue)
        * [.registerFactory([name], functor, [policy])](#Container+registerFactory)
        * [.inject(functor, [values])](#Container+inject) ⇒ <code>function</code>
        * [.getOwnEntries()](#Container+getOwnEntries) ⇒ <code>[Iterable](#Iterable)</code>
        * [.getEntries()](#Container+getEntries) ⇒ <code>[Iterable](#Iterable)</code>
    * _static_
        * [.merge(...containers)](#Container.merge) ⇒ <code>[Container](#Container)</code>

<a name="new_Container_new"></a>

## new Container()
Constructs a new container.

<a name="Container+createChild"></a>

## container.createChild() ⇒ <code>[Container](#Container)</code>
Creates a new child container.

**Kind**: instance method of <code>[Container](#Container)</code>  
**Returns**: <code>[Container](#Container)</code> - A new child container.  
<a name="Container+registerValue"></a>

## container.registerValue(name, value)
Registers a value as a first-class item.

**Kind**: instance method of <code>[Container](#Container)</code>  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | The name of the value. |
| value | <code>\*</code> | The actual value. |

<a name="Container+registerFactory"></a>

## container.registerFactory([name], functor, [policy])
Registers a factory value.

**Kind**: instance method of <code>[Container](#Container)</code>  
**Throws**:

- <code>TypeError</code> Whenever the functor does not inherit from Function.
- <code>TypeError</code> Whenever the policy does not inherit from Policy.
- <code>TypeError</code> Whenever no name was given and none could be inferred.


| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>String</code> | The name of the factory. |
| functor | <code>function</code> | The actual factory. |
| [policy] | <code>[Policy](#Policy)</code> | The caching policy. |

<a name="Container+inject"></a>

## container.inject(functor, [values]) ⇒ <code>function</code>
Injects a functor with registered values.

**Kind**: instance method of <code>[Container](#Container)</code>  
**Returns**: <code>function</code> - The injected functor.  
**Throws**:

- <code>TypeError</code> Whenever the functor does not inherit from Function.


| Param | Type | Description |
| --- | --- | --- |
| functor | <code>function</code> | The functor to inject. |
| [values] | <code>Object.&lt;String, \*&gt;</code> | Extra injectable dependencies. |

<a name="Container+getOwnEntries"></a>

## container.getOwnEntries() ⇒ <code>[Iterable](#Iterable)</code>
Returns an iterable of [key, value, type] entries registered explicitely on the container.

**Kind**: instance method of <code>[Container](#Container)</code>  
**Returns**: <code>[Iterable](#Iterable)</code> - An iterable object over the entries of values explicitely registered on the container.  
<a name="Container+getEntries"></a>

## container.getEntries() ⇒ <code>[Iterable](#Iterable)</code>
Returns an iterable of [key, value, type] entries registered explicitely on the container.

**Kind**: instance method of <code>[Container](#Container)</code>  
**Returns**: <code>[Iterable](#Iterable)</code> - An iterable object over the entries of values registered on the container or any of its
ancestors.  
<a name="Container.merge"></a>

## Container.merge(...containers) ⇒ <code>[Container](#Container)</code>
Merges multiple container hierarchies.

**Kind**: static method of <code>[Container](#Container)</code>  
**Returns**: <code>[Container](#Container)</code> - The merged containers.  

| Param | Type | Description |
| --- | --- | --- |
| ...containers | <code>[Container](#Container)</code> | The list of containers to merge. |

<a name="Policy"></a>

# Policy
Parent class for all caching policies.
Children classes must re-implement the `getValue' method.

**Kind**: global class  
<a name="Policy+getValue"></a>

## *policy.getValue(context, factory)*
Returns a (possibly cached) value from the factory.

**Kind**: instance abstract method of <code>[Policy](#Policy)</code>  
**Throws**:

- <code>NotImplementedError</code> The method must be overridden.


| Param | Type | Description |
| --- | --- | --- |
| context | <code>Context</code> | The injection context. |
| factory | <code>function</code> | The injected factory. |

<a name="Scanner"></a>

# Scanner
A functor scanner.

Scanning is based on the textual representation of the functor. It can be
used on functions (both regular and arrow) and classes (both constructors
and methods). Any supported functor can be a generator as well.

**Kind**: global class  

* [Scanner](#Scanner)
    * [new Scanner(functor)](#new_Scanner_new)
    * [.kind](#Scanner+kind) ⇒ <code>String</code>
    * [.name](#Scanner+name) ⇒ <code>String</code>
    * [.params](#Scanner+params) ⇒ <code>Array.&lt;String&gt;</code>
    * [.defaults](#Scanner+defaults) ⇒ <code>Object.&lt;String, function()&gt;</code>

<a name="new_Scanner_new"></a>

## new Scanner(functor)
Constructs a new functor scanner.

**Throws**:

- <code>ScanError</code> Whenever scanning of the functor fails.


| Param | Type | Description |
| --- | --- | --- |
| functor | <code>function</code> | The functor to scan. |

<a name="Scanner+kind"></a>

## scanner.kind ⇒ <code>String</code>
The kind of a functor (class, function or arrow).

**Kind**: instance property of <code>[Scanner](#Scanner)</code>  
**Returns**: <code>String</code> - The functor kind.  
<a name="Scanner+name"></a>

## scanner.name ⇒ <code>String</code>
The name of a functor (named class or named function) or null (unnamed class, unnamed function or arrow).

**Kind**: instance property of <code>[Scanner](#Scanner)</code>  
**Returns**: <code>String</code> - The functor name.  
<a name="Scanner+params"></a>

## scanner.params ⇒ <code>Array.&lt;String&gt;</code>
The functor injectable parameter names.

**Kind**: instance property of <code>[Scanner](#Scanner)</code>  
**Returns**: <code>Array.&lt;String&gt;</code> - The functor parameter names.  
<a name="Scanner+defaults"></a>

## scanner.defaults ⇒ <code>Object.&lt;String, function()&gt;</code>
The functor parameter default values.

**Kind**: instance property of <code>[Scanner](#Scanner)</code>  
**Returns**: <code>Object.&lt;String, function()&gt;</code> - The default value constructors.  
<a name="Iterable"></a>

# Iterable : <code>Object</code>
An iterable object

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| @@iterator | <code>function</code> | The function returning an iterator over the iterable. |

