# 4.0.1:
  - Migrate to facies 2.x

# 4.0.0:
  - Drop Node 4.x support (#33)
  - Allow post-injection binding

# 3.1.1:
  - Allow container hierarchies to be merged (#29)
  - Expose registration type in iterable entries (#28)

# 3.0.0:
  - Allow iterations over containers content (#24)
  - Suppress in-place functors marking (#23)

# 2.0.0:

  - Migrate parameter checking to facies (#20)
  - Remove container constructor parameter

# 1.3.0:

  - Allow injection with one-shot extra dependencies (#16)
  - Fix injectability of (falsy) primitive values (#15)

# 1.2.0:

  - Assume base classes w/o constructor have an empty one (#13)

# 1.1.0:

  - Automatically detect name of factories (#3)
  - Allow optional dependencies with injectable default value constructors (#4)

# 1.0.4

  - Apply new operator on regular function expected to behave as prototype
	 constructors.

# 1.0.3

  - Parse functors parameters with esprima to allow more patterns to be
	 correctly detected.

# 1.0.2

  - Allow sharing of caching policies instances among registrations
  - Add continuous integration

# 1.0.1

  - First release
