//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.5.2';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs, first) {
    if (_.isEmpty(attrs)) return first ? void 0 : [];
    return _[first ? 'find' : 'filter'](obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.where(obj, attrs, true);
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed > result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array, using the modern version of the 
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from an array.
  // If **n** is not specified, returns a single random element from the array.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (arguments.length < 2 || guard) {
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, value, context) {
      var result = {};
      var iterator = value == null ? _.identity : lookupIterator(value);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n == null) || guard ? array[0] : slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) {
      return array[array.length - 1];
    } else {
      return slice.call(array, Math.max(array.length - n, 0));
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, "length").concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context.
  _.partial = function(func) {
    var args = slice.call(arguments, 1);
    return function() {
      return func.apply(this, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error("bindAll must be passed function names");
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function() {
      context = this;
      args = arguments;
      timestamp = new Date();
      var later = function() {
        var last = (new Date()) - timestamp;
        if (last < wait) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

//     Backbone.js 1.1.0

//     (c) 2010-2011 Jeremy Ashkenas, DocumentCloud Inc.
//     (c) 2011-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both the browser and the server.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.0';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender || root.$;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i];
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);

          // Listen to added models' events, and index models for lookup by
          // `id` and by `cid`.
          model.on('all', this._onModelEvent, this);
          this._byId[model.cid] = model;
          if (model.id != null) this._byId[model.id] = model;
        }
        if (order) order.push(existing || model);
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }
      
      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj.id] || this._byId[obj.cid] || this._byId[obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch = typeof window !== 'undefined' && !!window.ActiveXObject && !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        callback && callback.apply(router, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param) {
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash and query.
  var pathStripper = /[?#].*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !atRoot) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + this.location.search + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && atRoot && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the fragment of the query and hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

}).call(this);

//
//  Backbone-associations.js 0.5.4
//
//  (c) 2013 Dhruva Ray, Jaynti Kanani, Persistent Systems Ltd.
//  Backbone-associations may be freely distributed under the MIT license.
//  For all details and documentation:
//  https://github.com/dhruvaray/backbone-associations/
//

// Initial Setup
// --------------
(function () {
    "use strict";

    // Save a reference to the global object (`window` in the browser, `exports`
    // on the server).
    var root = this;

    // The top-level namespace. All public Backbone classes and modules will be attached to this.
    // Exported for the browser and CommonJS.
    var _, Backbone, BackboneModel, BackboneCollection, ModelProto,
        CollectionProto, defaultEvents, AssociatedModel, pathChecker,
        collectionEvents, delimiters, pathSeparator;

    if (typeof exports !== 'undefined') {
        _ = require('underscore');
        Backbone = require('backbone');
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = Backbone;
        }
        exports = Backbone;
    } else {
        _ = root._;
        Backbone = root.Backbone;
    }
    // Create local reference `Model` prototype.
    BackboneModel = Backbone.Model;
    BackboneCollection = Backbone.Collection;
    ModelProto = BackboneModel.prototype;
    CollectionProto = BackboneCollection.prototype;

    // Built-in Backbone `events`.
    defaultEvents = ["change", "add", "remove", "reset", "sort", "destroy"];
    collectionEvents = ["reset", "sort"];

    Backbone.Associations = {
        VERSION: "0.5.4"
    };

    // Define `getter` and `setter` for `separator`
    var getSeparator = function() {
        return pathSeparator;
    };
    // Define `setSeperator`
    var setSeparator = function(value) {
        if (!_.isString(value) || _.size(value) < 1) {
            value = ".";
        }
        // set private properties
        pathSeparator = value;
        pathChecker = new RegExp("[\\" + pathSeparator + "\\[\\]]+", "g");
        delimiters = new RegExp("[^\\" + pathSeparator + "\\[\\]]+", "g");
    };

    try {
        // Define `SEPERATOR` property to Backbone.Associations
        Object.defineProperty(Backbone.Associations, 'SEPARATOR', {
            enumerable: true,
            get: getSeparator,
            set: setSeparator
        });
    } catch (e) {}

    // Backbone.AssociatedModel
    // --------------

    //Add `Many` and `One` relations to Backbone Object.
    Backbone.Associations.Many = Backbone.Many = "Many";
    Backbone.Associations.One = Backbone.One = "One";
    Backbone.Associations.Self = Backbone.Self = "Self";
    // Set default separator
    Backbone.Associations.SEPARATOR = ".";
    Backbone.Associations.getSeparator = getSeparator;
    Backbone.Associations.setSeparator = setSeparator;
    setSeparator();
    // Define `AssociatedModel` (Extends Backbone.Model).
    AssociatedModel = Backbone.AssociatedModel = Backbone.Associations.AssociatedModel = BackboneModel.extend({
        // Define relations with Associated Model.
        relations:undefined,
        // Define `Model` property which can keep track of already fired `events`,
        // and prevent redundant event to be triggered in case of cyclic model graphs.
        _proxyCalls:undefined,

        // Get the value of an attribute.
        get:function (attr) {
            var obj = ModelProto.get.call(this, attr);
            return obj ? obj : this._getAttr.apply(this, arguments);
        },

        // Set a hash of model attributes on the Backbone Model.
        set:function (key, value, options) {
            var attributes, result;
            // Duplicate backbone's behavior to allow separate key/value parameters,
            // instead of a single 'attributes' object.
            if (_.isObject(key) || key == null) {
                attributes = key;
                options = value;
            } else {
                attributes = {};
                attributes[key] = value;
            }
            result = this._set(attributes, options);
            // Trigger events which have been blocked until the entire object graph is updated.
            this._processPendingEvents();
            return result;

        },

        // Works with an attribute hash and options + fully qualified paths
        _set:function (attributes, options) {
            var attr, modelMap, modelId, obj, result = this;
            if (!attributes) return this;
            for (attr in attributes) {
                //Create a map for each unique object whose attributes we want to set
                modelMap || (modelMap = {});
                if (attr.match(pathChecker)) {
                    var pathTokens = getPathArray(attr), initials = _.initial(pathTokens),
                        last = pathTokens[pathTokens.length - 1],
                        parentModel = this.get(initials);
                    if (parentModel instanceof AssociatedModel) {
                        obj = modelMap[parentModel.cid] || (modelMap[parentModel.cid] = {'model':parentModel, 'data':{}});
                        obj.data[last] = attributes[attr];
                    }
                } else {
                    obj = modelMap[this.cid] || (modelMap[this.cid] = {'model':this, 'data':{}});
                    obj.data[attr] = attributes[attr];
                }
            }

            if (modelMap) {
                for (modelId in modelMap) {
                    obj = modelMap[modelId];
                    this._setAttr.call(obj.model, obj.data, options) || (result = false);

                }
            } else {
                result = this._setAttr.call(this, attributes, options);
            }
            return result;

        },

        // Set a hash of model attributes on the object,
        // fire Backbone `event` with options.
        // It maintains relations between models during the set operation.
        // It also bubbles up child events to the parent.
        _setAttr:function (attributes, options) {
            var attr;
            // Extract attributes and options.
            options || (options = {});
            if (options.unset) for (attr in attributes) attributes[attr] = void 0;
            this.parents = this.parents || [];

            if (this.relations) {
                // Iterate over `this.relations` and `set` model and collection values
                // if `relations` are available.
                _.each(this.relations, function (relation) {
                    var relationKey = relation.key,
                        relatedModel = relation.relatedModel,
                        collectionType = relation.collectionType,
                        map = relation.map,
                        currVal = this.attributes[relationKey],
                        idKey = currVal && currVal.idAttribute,
                        val, relationOptions, data, relationValue, newCtx = false;

                    // Call function if relatedModel is implemented as a function
                    if (relatedModel && !(relatedModel.prototype instanceof BackboneModel))
                        relatedModel = _.isFunction(relatedModel) ?
                            relatedModel.call(this, relation, attributes) :
                            relatedModel;

                    // Get class if relation and map is stored as a string.
                    if (relatedModel && _.isString(relatedModel)) {
                        relatedModel = (relatedModel === Backbone.Self) ? this.constructor : map2Scope(relatedModel);
                    }
                    collectionType && _.isString(collectionType) && (collectionType = map2Scope(collectionType));
                    map && _.isString(map) && (map = map2Scope(map));
                    // Merge in `options` specific to this relation.
                    relationOptions = relation.options ? _.extend({}, relation.options, options) : options;

                    if ((!relatedModel) && (!collectionType))
                        throw new Error('specify either a relatedModel or collectionType');

                    if (attributes[relationKey]) {
                        // Get value of attribute with relation key in `val`.
                        val = _.result(attributes, relationKey);
                        // Map `val` if a transformation function is provided.
                        val = map ? map.call(this, val, collectionType ? collectionType : relatedModel) : val;

                        // If `relation.type` is `Backbone.Many`,
                        // Create `Backbone.Collection` with passed data and perform Backbone `set`.
                        if (relation.type === Backbone.Many) {
                            // `collectionType` of defined `relation` should be instance of `Backbone.Collection`.
                            if (collectionType && !collectionType.prototype instanceof BackboneCollection) {
                                throw new Error('collectionType must inherit from Backbone.Collection');
                            }

                            if (currVal) {
                                // Setting this flag will prevent events from firing immediately. That way clients
                                // will not get events until the entire object graph is updated.
                                currVal._deferEvents = true;

                                // Use Backbone.Collection's `reset` or smart `set` method
                                currVal[relationOptions.reset ? 'reset' : 'set'](
                                    val instanceof BackboneCollection ? val.models : val, relationOptions);

                                data = currVal;

                            } else {
                                newCtx = true;

                                if (val instanceof BackboneCollection) {
                                    data = val;
                                } else {
                                    data = collectionType ? new collectionType() : this._createCollection(relatedModel);
                                    data[relationOptions.reset ? 'reset' : 'set'](val, relationOptions);
                                }
                            }

                        } else if (relation.type === Backbone.One) {

                            if (!relatedModel)
                                throw new Error('specify a relatedModel for Backbone.One type');

                            if (!(relatedModel.prototype instanceof Backbone.AssociatedModel))
                                throw new Error('specify an AssociatedModel for Backbone.One type');

                            data = val instanceof AssociatedModel ? val : new relatedModel(val, relationOptions);
                            //Is the passed in data for the same key?
                            if (currVal && data.attributes[idKey] &&
                                currVal.attributes[idKey] === data.attributes[idKey]) {
                                // Setting this flag will prevent events from firing immediately. That way clients
                                // will not get events until the entire object graph is updated.
                                currVal._deferEvents = true;
                                // Perform the traditional `set` operation
                                currVal._set(val instanceof AssociatedModel ? val.attributes : val, relationOptions);
                                data = currVal;
                            } else {
                                newCtx = true;
                            }

                        } else {
                            throw new Error('type attribute must be specified and have the values Backbone.One or Backbone.Many');
                        }


                        attributes[relationKey] = data;
                        relationValue = data;

                        // Add proxy events to respective parents.
                        // Only add callback if not defined or new Ctx has been identified.
                        if (newCtx || (relationValue && !relationValue._proxyCallback)) {
                            relationValue._proxyCallback = function () {
                                return this._bubbleEvent.call(this, relationKey, relationValue, arguments);
                            };
                            relationValue.on("all", relationValue._proxyCallback, this);
                        }

                    }
                    //Distinguish between the value of undefined versus a set no-op
                    if (attributes.hasOwnProperty(relationKey)) {
                        //Maintain reverse pointers - a.k.a parents
                        var updated = attributes[relationKey];
                        var original = this.attributes[relationKey];
                        if (updated) {
                            updated.parents = updated.parents || [];
                            (_.indexOf(updated.parents, this) == -1) && updated.parents.push(this);
                        } else if (original && original.parents.length > 0) { // New value is undefined
                            original.parents = _.difference(original.parents, [this]);
                            // Don't bubble to this parent anymore
                            original._proxyCallback && original.off("all", original._proxyCallback, this);
                        }
                    }
                }, this);
            }
            // Return results for `BackboneModel.set`.
            return  ModelProto.set.call(this, attributes, options);
        },
        // Bubble-up event to `parent` Model
        _bubbleEvent:function (relationKey, relationValue, eventArguments) {
            var args = eventArguments,
                opt = args[0].split(":"),
                eventType = opt[0],
                catch_all = args[0] == "nested-change",
                eventObject = args[1],
                colObject = args[2],
                indexEventObject = -1,
                _proxyCalls = relationValue._proxyCalls,
                cargs,
                eventPath,
                basecolEventPath,
                isDefaultEvent = _.indexOf(defaultEvents, eventType) !== -1;

            //Short circuit the listen in to the nested-graph event
            if (catch_all) return;

            // Change the event name to a fully qualified path.
            _.size(opt) > 1 && (eventPath = opt[1]);

            if (_.indexOf(collectionEvents, eventType) !== -1) {
                colObject = eventObject;
            }

            // Find the specific object in the collection which has changed.
            if (relationValue instanceof BackboneCollection && isDefaultEvent && eventObject) {
                var pathTokens = getPathArray(eventPath),
                    initialTokens = _.initial(pathTokens), colModel;

                colModel = relationValue.find(function (model) {
                    if (eventObject === model) return true;
                    if (!model) return false;
                    var changedModel = model.get(initialTokens);

                    if ((changedModel instanceof AssociatedModel || changedModel instanceof BackboneCollection)
                        && eventObject === changedModel)
                        return true;

                    changedModel = model.get(pathTokens);

                    if ((changedModel instanceof AssociatedModel || changedModel instanceof BackboneCollection)
                        && eventObject === changedModel)
                        return true;

                    if (changedModel instanceof BackboneCollection && colObject
                        && colObject === changedModel)
                        return true;
                });
                colModel && (indexEventObject = relationValue.indexOf(colModel));
            }

            // Manipulate `eventPath`.
            eventPath = relationKey + ((indexEventObject !== -1 && (eventType === "change" || eventPath)) ?
                "[" + indexEventObject + "]" : "") + (eventPath ? pathSeparator + eventPath : "");

            // Short circuit collection * events
            if (/\[\*\]/g.test(eventPath)) return this;
            basecolEventPath = eventPath.replace(/\[\d+\]/g, '[*]');

            cargs = [];
            cargs.push.apply(cargs, args);
            cargs[0] = eventType + ":" + eventPath;

            // If event has been already triggered as result of same source `eventPath`,
            // no need to re-trigger event to prevent cycle.
            _proxyCalls = relationValue._proxyCalls = (_proxyCalls || {});
            if (this._isEventAvailable.call(this, _proxyCalls, eventPath)) return this;

            // Add `eventPath` in `_proxyCalls` to keep track of already triggered `event`.
            _proxyCalls[eventPath] = true;

            // Set up previous attributes correctly.
            if ("change" === eventType) {
                this._previousAttributes[relationKey] = relationValue._previousAttributes;
                this.changed[relationKey] = relationValue;
            }

            // Bubble up event to parent `model` with new changed arguments.
            this.trigger.apply(this, cargs);

            //Only fire for change. Not change:attribute
            if ("change" === eventType && this.get(eventPath) != args[2]) {
                var ncargs = ["nested-change", eventPath, args[1]];
                args[2] && ncargs.push(args[2]); //args[2] will be options if present
                this.trigger.apply(this, ncargs);
            }

            // Remove `eventPath` from `_proxyCalls`,
            // if `eventPath` and `_proxyCalls` are available,
            // which allow event to be triggered on for next operation of `set`.
            if (_proxyCalls && eventPath) delete _proxyCalls[eventPath];

            // Create a collection modified event with wild-card
            if (eventPath !== basecolEventPath) {
                cargs[0] = eventType + ":" + basecolEventPath;
                this.trigger.apply(this, cargs);
            }

            return this;
        },

        // Has event been fired from this source. Used to prevent event recursion in cyclic graphs
        _isEventAvailable:function (_proxyCalls, path) {
            return _.find(_proxyCalls, function (value, eventKey) {
                return path.indexOf(eventKey, path.length - eventKey.length) !== -1;
            });
        },

        // Returns New `collection` of type `relation.relatedModel`.
        _createCollection:function (type) {
            var collection, relatedModel = type;
            _.isString(relatedModel) && (relatedModel = map2Scope(relatedModel));
            // Creates new `Backbone.Collection` and defines model class.
            if (relatedModel && (relatedModel.prototype instanceof AssociatedModel) || _.isFunction(relatedModel)) {
                collection = new BackboneCollection();
                collection.model = relatedModel;
            } else {
                throw new Error('type must inherit from Backbone.AssociatedModel');
            }
            return collection;
        },

        // Process all pending events after the entire object graph has been updated
        _processPendingEvents:function () {
            if (!this._processedEvents) {
                this._processedEvents = true;

                this._deferEvents = false;

                // Trigger all pending events
                _.each(this._pendingEvents, function (e) {
                    e.c.trigger.apply(e.c, e.a);
                });

                this._pendingEvents = [];

                // Traverse down the object graph and call process pending events on sub-trees
                _.each(this.relations, function (relation) {
                    var val = this.attributes[relation.key];
                    val && val._processPendingEvents();
                }, this);

                delete this._processedEvents;
            }
        },

        // Override trigger to defer events in the object graph.
        trigger:function (name) {
            // Defer event processing
            if (this._deferEvents) {
                this._pendingEvents = this._pendingEvents || [];
                // Maintain a queue of pending events to trigger after the entire object graph is updated.
                this._pendingEvents.push({c:this, a:arguments});
            } else {
                ModelProto.trigger.apply(this, arguments);
            }
        },

        // The JSON representation of the model.
        toJSON:function (options) {
            var json = {}, aJson;
            json[this.idAttribute] = this.id;
            if (!this.visited) {
                this.visited = true;
                // Get json representation from `BackboneModel.toJSON`.
                json = ModelProto.toJSON.apply(this, arguments);
                // If `this.relations` is defined, iterate through each `relation`
                // and added it's json representation to parents' json representation.
                if (this.relations) {
                    _.each(this.relations, function (relation) {
                        var attr = this.attributes[relation.key];
                        if (attr) {
                            aJson = attr.toJSON ? attr.toJSON(options) : attr;
                            json[relation.key] = _.isArray(aJson) ? _.compact(aJson) : aJson;
                        }
                    }, this);
                }
                delete this.visited;
            }
            return json;
        },

        // Create a new model with identical attributes to this one.
        clone:function () {
            return new this.constructor(this.toJSON());
        },

        // Call this if you want to set an `AssociatedModel` to a falsy value like undefined/null directly.
        // Not calling this will leak memory and have wrong parents.
        // See test case "parent relations"
        cleanup:function () {
            _.each(this.relations, function (relation) {
                var val = this.attributes[relation.key];
                val && (val.parents = _.difference(val.parents, [this]));
            }, this);
            this.off();
        },

        // Navigate the path to the leaf object in the path to query for the attribute value
        _getAttr:function (path) {

            var result = this,
            //Tokenize the path
                attrs = getPathArray(path),
                key,
                i;
            if (_.size(attrs) < 1) return;
            for (i = 0; i < attrs.length; i++) {
                key = attrs[i];
                if (!result) break;
                //Navigate the path to get to the result
                result = result instanceof BackboneCollection
                    ? (isNaN(key) ? undefined : result.at(key))
                    : result.attributes[key];
            }
            return result;
        }
    });

    // Tokenize the fully qualified event path
    var getPathArray = function (path) {
        if (path === '') return [''];
        return _.isString(path) ? (path.match(delimiters)) : path || [];
    };

    var map2Scope = function (path) {
        return _.reduce(path.split(pathSeparator), function (memo, elem) {
            return memo[elem];
        }, root);
    };

    //Infer the relation from the collection's parents and find the appropriate map for the passed in `models`
    var map2models = function (parents, target, models) {
        var relation, surrogate;
        //Iterate over collection's parents
        _.find(parents, function (parent) {
            //Iterate over relations
            relation = _.find(parent.relations, function (rel) {
                return parent.get(rel.key) === target;
            }, this);
            if (relation) {
                surrogate = parent;//surrogate for transformation
                return true;//break;
            }
        }, this);

        //If we found a relation and it has a mapping function
        if (relation && relation.map) {
            return relation.map.call(surrogate, models, target);
        }
        return models;
    };

    var proxies = {};
    // Proxy Backbone collection methods
    _.each(['set', 'remove', 'reset'], function (method) {
        proxies[method] = BackboneCollection.prototype[method];

        CollectionProto[method] = function (models, options) {
            //Short-circuit if this collection doesn't hold `AssociatedModels`
            if (this.model.prototype instanceof AssociatedModel && this.parents) {
                //Find a map function if available and perform a transformation
                arguments[0] = map2models(this.parents, this, models);
            }
            return proxies[method].apply(this, arguments);
        }
    });

    // Override trigger to defer events in the object graph.
    proxies['trigger'] = CollectionProto['trigger'];
    CollectionProto['trigger'] = function (name) {
        if (this._deferEvents) {
            this._pendingEvents = this._pendingEvents || [];
            // Maintain a queue of pending events to trigger after the entire object graph is updated.
            this._pendingEvents.push({c:this, a:arguments});
        } else {
            proxies['trigger'].apply(this, arguments);
        }
    };

    // Attach process pending event functionality on collections as well. Re-use from `AssociatedModel`
    CollectionProto._processPendingEvents = AssociatedModel.prototype._processPendingEvents;


}).call(this);
//     (c) 2012 Raymond Julin, Keyteq AS
//     Backbone.touch may be freely distributed under the MIT license.
(function (factory) {

    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'backbone'], factory);
    } else {
        // Browser globals
        factory(_, Backbone);
    }
}(function (_, Backbone) {

    "use strict";

    // The `getValue` and `delegateEventSplitter` is copied from 
    // Backbones source, unfortunately these are not available
    // in any form from Backbone itself
    var getValue = function(object, prop) {
        if (!(object && object[prop])) return null;
        return _.isFunction(object[prop]) ? object[prop]() : object[prop];
    };
    var delegateEventSplitter = /^(\S+)\s*(.*)$/;

    _.extend(Backbone.View.prototype, {
        _touching : false,

        touchPrevents : true,

        touchThreshold : 10,

        isTouch : 'ontouchstart' in document && !('callPhantom' in window),

        // Drop in replacement for Backbone.View#delegateEvent
        // Enables better touch support
        // 
        // If the users device is touch enabled it replace any `click`
        // event with listening for touch(start|move|end) in order to
        // quickly trigger touch taps
        delegateEvents: function(events) {
            if (!(events || (events = getValue(this, 'events')))) return;
            this.undelegateEvents();
            var suffix = '.delegateEvents' + this.cid;
            _(events).each(function(method, key) {
                if (!_.isFunction(method)) method = this[events[key]];
                if (!method) throw new Error('Method "' + events[key] + '" does not exist');
                var match = key.match(delegateEventSplitter);
                var eventName = match[1], selector = match[2];
                var boundHandler = _.bind(this._touchHandler,this);
                method = _.bind(method, this);
                if (this._useTouchHandlers(eventName, selector)) {
                    this.$el.on('touchstart' + suffix, selector, boundHandler);
                    this.$el.on('touchend' + suffix, selector,
                        {method:method},
                        boundHandler
                    );
                }
                else {
                    eventName += suffix;
                    if (selector === '') {
                        this.$el.bind(eventName, method);
                    } else {
                        this.$el.on(eventName, selector, method);
                    }
                }
            }, this);
        },

        // Detect if touch handlers should be used over listening for click
        // Allows custom detection implementations
        _useTouchHandlers : function(eventName, selector)
        {
            return this.isTouch && eventName === 'click';
        },

        // At the first touchstart we register touchevents as ongoing
        // and as soon as a touch move happens we set touching to false,
        // thus implying that a fastclick will not happen when
        // touchend occurs. If no touchmove happened
        // inbetween touchstart and touchend we trigger the event
        //
        // The `touchPrevents` toggle decides if Backbone.touch
        // will stop propagation and prevent default
        // for *button* and *a* elements
        _touchHandler : function(e) {
            if (!('changedTouches' in e.originalEvent)) return;
            var touch = e.originalEvent.changedTouches[0];
            var x = touch.clientX;
            var y = touch.clientY;
            switch (e.type) {
                case 'touchstart':
                    this._touching = [x, y];
                    break;
                case 'touchend':
                    var oldX = this._touching[0];
                    var oldY = this._touching[1];
                    var threshold = this.touchThreshold;
                    if (x < (oldX + threshold) && x > (oldX - threshold) &&
                        y < (oldY + threshold) && y > (oldY - threshold)) {
                        this._touching = false;
                        if (this.touchPrevents) {
                            var tagName = e.currentTarget.tagName;
                            if (tagName === 'BUTTON' ||
                                tagName === 'A') {
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        }
                        e.data.method(e);
                    }
                    break;
            }
        }
    });
    return Backbone;
}));

/**
 * @namespace
 */
var collie = collie || {};

(function () {
	/**
	 * 콜리 버전
	 * 
	 * @name collie.version
	 * @description 자동 치환되므로 직접 수정하지 않는다.
	 */
	collie.version = "1.1.0";
	
	/**
	 * 클래스 만들기
	 * 
	 * @method collie#Class
	 * @param {Object} o 클래스 멤버, $init을 이용해 생성자를 정의할 수 있다.
	 * @param {collie.Class} oParent 상속받을 부모 클래스
	 * @return {collie.Class}
	 * @example
	 * var Person = collie.Class({
	 *  gender : false,
	 * 	walk : function () { return "walking!"; }
	 * });
	 * 
	 * var Male = collie.Class({
	 * 	name : "",
	 *  gender : "male"
	 * }, Person);
	 * 
	 * var oDavid = new Male();
	 * oDavid.name = "david";
	 * 
	 * alert(oDavid.name); // david
	 * alert(oDavid.gender); // male
	 * alert(oDavid.walk()); // walking!
	 * 
	 * @example
	 * override
	 * var Person = collie.Class({
	 * 	testMethod : function () {
	 * 	
	 * 	}
	 * });
	 * 
	 * var Male = collie.Class({
	 * 	testMethod : function () {
	 * 		// blah
	 * 		this.constructor.$super.testMethod.apply(this, arguments);		
	 * 	}
	 * }, Person);
	 */
	collie.Class = function (o, oParent) {		
		var $init = null;
		
		if ("$init" in o) {
			$init = o.$init;
			delete o.$init;
		}
		
		var F = function () {
			if ($init !== null) {
				$init.apply(this, arguments);
			}
		};
		
		if (typeof oParent !== "undefined") {
			F = function () {
				// 부모의 생성자 실행
				oParent.apply(this, arguments);
				
				// 자식의 생성자 실행
				if ($init !== null) {
					$init.apply(this, arguments);
				}
			};
			
			var Parent = function () {};
			Parent.prototype = oParent.prototype;
			F.$super = oParent.prototype;
			F.prototype = new Parent();
			F.prototype.constructor = F;
		}
		
		for (var i in o) {
			if (o.hasOwnProperty(i) && i !== "prototype") {
				F.prototype[i] = o[i];
			}
		}
		
		return F;
	};
	
	/**
	 * 자주 쓰이는 유틸 모음
	 * @namespace
	 */
	collie.util = new (collie.Class(/** @lends collie.util */{
		$init : function () {
			this._sCSSPrefix = null;
			this._htDeviceInfo = null;
			this._bSupport3d = null;
			this._bSupportCSS3 = null;
			this._htBoundary = {
				left : 0,
				right : 0,
				top : 0,
				bottom : 0
			};
		},
		
		/**
		 * 아이디로 표시 객체 인스턴스를 가져온다
		 * 주로 DOM 방식일 때 사용 된다
		 * 
		 * @param {Number} nId
		 * @return {collie.DisplayObject}
		 */
		getDisplayObjectById : function (nId) {
			return collie.DisplayObject.htFactory[nId];
		},
		
		/**
		 * name으로 표시 객체 인스턴스를 가져온다
		 * 
		 * @param {String} sName
		 * @return {collie.DisplayObject}
		 */
		getDisplayObjectByName : function (sName) {
			for (var i in collie.DisplayObject.htFactory) {
				if (collie.DisplayObject.htFactory[i].get("name") === sName) {
					return collie.DisplayObject.htFactory[i];
				}
			}
			
			return false;
		},
		
		/**
		 * userAgent 값으로 현재 단말 정보를 반환 한다
		 * 값을 한번 얻어오면 다음부터는 캐시된 값을 사용 한다
		 * 
		 * @return {Object} htInfo
		 * @return {Boolean} htInfo.desktop 데스크탑 여부
		 * @return {Boolean} htInfo.supportCanvas 캔버스 지원 여부
		 * @return {Boolean|Number} htInfo.android 안드로이드라면 두번째까지의 버젼, 안드로이드가 아니라면 false
		 * @return {Boolean|Number} htInfo.ios iOS라면 두번째까지의 버젼, iOS가 아니라면 false
		 * @return {Boolean|Number} htInfo.ie IE 브라우저라면 첫번째까지의 버전, IE 브라우저가 아니라면 false
		 * @return {Boolean|Number} htInfo.chrome Agent에 Chrome이 포함돼 있는지 여부
		 */
		getDeviceInfo : function (sAgent) {
			if (this._htDeviceInfo !== null && typeof sAgent === "undefined") {
				return this._htDeviceInfo;
			}
			
			var aMat = null;
			var bIsDesktop = false;
			var bSupportCanvas = typeof CanvasRenderingContext2D !== "undefined";
			var bIsAndroid = false;
			var bIsIOS = false;
			var bIsIE = false;
			var bHasChrome = (/chrome/i.test(sAgent)) ? true : false;
			var sAgent = sAgent || navigator.userAgent;
			var nVersion = 0;
			
			if (/android/i.test(sAgent)) { // android
				bIsAndroid = true;
				aMat = sAgent.toString().match(/android ([0-9]\.[0-9])\.?([0-9]?)/i);
				
				if (aMat && aMat[1]) {
					nVersion = (parseFloat(aMat[1]) + (aMat[2] ? aMat[2] * 0.01 : 0)).toFixed(2);
				}
			} else if (/(iphone|ipad|ipod)/i.test(sAgent)) { // iOS
				bIsIOS = true;
				aMat = sAgent.toString().match(/([0-9]_[0-9])/i);
				
				if (aMat && aMat[1]) {
					nVersion = parseFloat(aMat[1].replace(/_/, '.'));
				}
			} else { // PC
				bIsDesktop = true;
				
				if (/(MSIE)/i.test(sAgent)) { // IE
					bIsIE = true;
					aMat = sAgent.toString().match(/MSIE ([0-9])/i);
					
					if (aMat && aMat[1]) {
						nVersion = parseInt(aMat[1], 10);
					}
				}
			}
			
			this._htDeviceInfo = {
				supportCanvas : bSupportCanvas,
				desktop : bIsDesktop,
				android : bIsAndroid ? nVersion : false,
				ios : bIsIOS ? nVersion : false,
				ie : bIsIE ? nVersion : false,
				chrome : bHasChrome
			};
			
			return this._htDeviceInfo;
		},
		
		/**
		 * 브라우저에 따른 CSS Prefix를 반환
		 * 
		 * @param {String} sName 대상 CSS 속성 명 (- 포함), 값이 없으면 prefix만 반환
		 * @param {Boolean} bJavascript 자바스크립트 속성 타입으로 반환
		 * @example
		 * collie.util.getCSSPrefix("transform"); // -webkit-transform
		 * collie.util.getCSSPrefix("transform", true); // webkitTransform
		 * 
		 * // prefix가 없을 때
		 * collie.util.getCSSPrefix("transform"); // transform
		 * collie.util.getCSSPrefix("transform", true); // transform
		 * @return {String} 조합된 CSS Prefix, 혹은 속성 명
		 */
		getCSSPrefix : function (sName, bJavascript) {
			var sResult = '';
			
			if (this._sCSSPrefix === null) {
				this._sCSSPrefix = '';
				
				// webkit이 가장 먼저 쓰일 것 같아서 webkit을 최상단으로 옮김
				if (typeof document.body.style.webkitTransform !== "undefined") {
					this._sCSSPrefix = "-webkit-";
				} else if (typeof document.body.style.MozTransform !== "undefined") {
					this._sCSSPrefix = "-moz-";
				} else if (typeof document.body.style.OTransform !== "undefined") {
					this._sCSSPrefix = "-o-";
				} else if (typeof document.body.style.msTransform !== "undefined") {
					this._sCSSPrefix = "-ms-";
				}
			}
			
			sResult = this._sCSSPrefix + (sName ? sName : '');
			
			// - 빼기
			if (bJavascript) {
				var aTmp = sResult.split("-");
				sResult = '';
				
				for (var i = 0, len = aTmp.length; i < len; i++) {
					if (aTmp[i]) {
						sResult += sResult ? aTmp[i].substr(0, 1).toUpperCase() + aTmp[i].substr(1) : aTmp[i];
					}
				}
				
				if (this._sCSSPrefix === "-moz-" || this._sCSSPrefix === "-o-") {
					sResult = sResult.substr(0, 1).toUpperCase() + sResult.substr(1);
				}
			}
			
			return sResult;
		},
		
		/**
		 * CSS3를 지원하는지 여부
		 * 
		 * @return {Boolean}
		 */
		getSupportCSS3 : function () {
			if (this._bSupportCSS3 === null) {
				this._bSupportCSS3 = typeof document.body.style[collie.util.getCSSPrefix("transform", true)] !== "undefined" || typeof document.body.style.transform != "undefined";
			}
			
			return this._bSupportCSS3;
		},
		
		/**
		 * CSS3d를 지원하는지 여부
		 * 
		 * @return {Boolean}
		 */
		getSupportCSS3d : function () {
			if (this._bSupport3d === null) {
				this._bSupport3d = (typeof document.body.style[collie.util.getCSSPrefix("perspective", true)] !== "undefined" || typeof document.body.style.perspective != "undefined") && (!collie.util.getDeviceInfo().android || collie.util.getDeviceInfo().android >= 4);
			}
			
			return this._bSupport3d;
		},
		
		/**
		 * 각도를 라디안으로 변환
		 * 
		 * @param {Number} nDeg
		 * @return {Number}
		 */
		toRad : function (nDeg) {
			return nDeg * Math.PI / 180;
		},
		
		/**
		 * 라디안을 각도로 변환
		 * 
		 * @param {Number} nRad
		 * @return {Number}
		 */
		toDeg : function (nRad) {
			return nRad * 180 / Math.PI;
		},
		
		/**
		 * 근사값 구함(소수 7자리 미만은 버림)
		 * - javascript 소숫점 연산 오류로 인한 근사값 연산임
		 * 
		 * @param {Number} nValue 값
		 * @return {Number}
		 */
		approximateValue : function (nValue) {
			return Math.round(nValue * 10000000) / 10000000;
		},
		
		/**
		 * 각도를 0~360 값 사이로 맞춤
		 * 
		 * @param {Number} nAngleRad 라디안 값
		 * @return {Number}
		 */
		fixAngle : function (nAngleRad) {
			var nAngleDeg = collie.util.toDeg(nAngleRad);
			nAngleDeg -= Math.floor(nAngleDeg / 360) * 360;
			return collie.util.toRad(nAngleDeg);
		},
		
		/**
		 * 거리를 반환
		 * 
		 * @param {Number} x1
		 * @param {Number} y1
		 * @param {Number} x2
		 * @param {Number} y2
		 * @return {Number} 거리
		 */
		getDistance : function (x1, y1, x2, y2) {
			return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		},
		
		/**
		 * 점 배열에서 최소 사각형 영역을 구한다
		 * 
		 * @param {Array} aPoints 대상 배열 [[x1, y1], [x2, y2], ... ]
		 * @return {Object} htResult
		 * @return {Number} htResult.left
		 * @return {Number} htResult.right
		 * @return {Number} htResult.bottom
		 * @return {Number} htResult.top
		 */
		getBoundary : function (aPoints) {
			var nMinX = aPoints[0][0];
			var nMaxX = aPoints[0][0];
			var nMinY = aPoints[0][1];
			var nMaxY = aPoints[0][1];
			
			for (var i = 1, len = aPoints.length; i < len; i++) {
				nMinX = Math.min(nMinX, aPoints[i][0]);
				nMaxX = Math.max(nMaxX, aPoints[i][0]);
				nMinY = Math.min(nMinY, aPoints[i][1]);
				nMaxY = Math.max(nMaxY, aPoints[i][1]);
			}
			
			return {
				left : nMinX,
				right : nMaxX,
				top : nMinY,
				bottom : nMaxY
			};
		},
		
		/**
		 * boundary를 points로 변환한다
		 * 
		 * @param {Object} htBoundary
		 * @param {Number} htBoundary.left
		 * @param {Number} htBoundary.right
		 * @param {Number} htBoundary.top
		 * @param {Number} htBoundary.bottom
		 * @return {Array} points [[left, top], [right, top], [right, bottom], [left, bottom]]
		 */
		getBoundaryToPoints : function (htBoundary) {
			return [[htBoundary.left, htBoundary.top], [htBoundary.right, htBoundary.top], [htBoundary.right, htBoundary.bottom], [htBoundary.left, htBoundary.bottom]];
		},
		
		/**
		 * 주소의 queryString을 객체화 한다
		 * @return {Object}
		 */
		queryString : function () {
			var htResult = {};
			
			if (location.search) {
				var aParam = location.search.substr(1).split("&");
				
				for (var i = 0, len = aParam.length; i < len; i++) {
					var aKeyValue = aParam[i].split("=");
					htResult[aKeyValue.shift()] = aKeyValue.join("=");
				}
			}
			
			return htResult;
		},
		
		/**
		 * 객체를 복사
		 * 
		 * @param {Object} oSource 원본 객체
		 * @return {Object}
		 */
		cloneObject : function (oSource) {
			var oReturn = {};
			
			for (var i in oSource) {
				oReturn[i] = oSource[i];
			}
			
			return oReturn;
		},
		
		/**
		 * zIndex에 따라 오름차순 정렬된 순서로 배열에 넣는다
		 * 
		 * @private
		 * @param {Array} aTarget
		 * @param {collie.DisplayObject} oDisplayObject
		 */
		pushWithSort : function (aTarget, oDisplayObject) {
			var bAdded = false;
			
			for (var i = 0, len = aTarget.length; i < len; i++) {
				if (aTarget[i]._htOption.zIndex > oDisplayObject._htOption.zIndex) {
					aTarget.splice(i, 0, oDisplayObject);
					bAdded = true;
					break;
				}
			}
			
			if (!bAdded) {
				aTarget.push(oDisplayObject);
			}
		},
		
		/**
		 * DOM의 addEventListener
		 * 
		 * @param {HTMLElement} el
		 * @param {String} sName 이벤트 이름, on을 제외한 이름
		 * @param {Function} fHandler 바인딩할 함수
		 * @param {Boolean} bUseCapture 캡쳐 사용 여부
		 */
		addEventListener : function (el, sName, fHandler, bUseCapture) {
			if ("addEventListener" in el) {
				el.addEventListener(sName, fHandler, bUseCapture);
			} else {
				el.attachEvent("on" + sName, fHandler, bUseCapture);
			}
		},
		
		/**
		 * DOM의 removeEventListener
		 * 
		 * @param {HTMLElement} el
		 * @param {String} sName 이벤트 이름, on을 제외한 이름
		 * @param {Function} fHandler 바인딩할 함수
		 * @param {Boolean} bUseCapture 캡쳐 사용 여부
		 */
		removeEventListener : function (el, sName, fHandler, bUseCapture) {
			if ("removeEventListener" in el) {
				el.removeEventListener(sName, fHandler, bUseCapture);
			} else {
				el.detachEvent("on" + sName, fHandler, bUseCapture);
			}
		},
		
		/**
		 * 이벤트의 기본 동작을 멈춘다
		 * 
		 * @param {HTMLEvent} e
		 */
		stopEventDefault : function (e) {
			e = e || window.event;
			
			if ("preventDefault" in e) {
				e.preventDefault();
			}
			
			e.returnValue = false;
		},
		
		/**
		 * 엘리먼트의 위치를 구한다
		 * 
		 * @param {HTMLElement}
		 * @return {Object} htResult
		 * @return {Number} htResult.x 
		 * @return {Number} htResult.y
		 * @return {Number} htResult.width
		 * @return {Number} htResult.height
		 */
		getPosition : function (el) {
			var elDocument = el.ownerDocument || el.document || document;
			var elHtml = elDocument.documentElement;
			var elBody = elDocument.body;
			var htPosition = {};
			
			if ("getBoundingClientRect" in el) {
				var htBox = el.getBoundingClientRect();
				htPosition.x = htBox.left;
				htPosition.x += elHtml.scrollLeft || elBody.scrollLeft;
				htPosition.y = htBox.top;
				htPosition.y += elHtml.scrollTop || elBody.scrollTop;
				htPosition.width = htBox.width;
				htPosition.height = htBox.height;
			} else {
				htPosition.x = 0;
				htPosition.y = 0;
				htPosition.width = el.offsetWidth;
				htPosition.height = el.offsetHeight;
				
				for (var o = el; o; o = o.offsetParent) {
					htPosition.x += o.offsetLeft;
					htPosition.y += o.offsetTop;
				}
	
				for (var o = el.parentNode; o; o = o.parentNode) {
					if (o.tagName === 'BODY') {
						break;
					}
					
					if (o.tagName === 'TR') {
						htPosition.y += 2;
					}
										
					htPosition.x -= o.scrollLeft;
					htPosition.y -= o.scrollTop;
				}
			}
			
			return htPosition;
		}
	}))();
	
	// iOS에서 상단바 숨기기
	if (collie.util.getDeviceInfo().ios) {
		window.addEventListener("load", function () {
			setTimeout(function () {
				document.body.scrollTop = 0;
			}, 300);
		});
	}
	
	// bind polyfill, https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (oThis) {
			if (typeof this !== "function") {
				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}
	
			var aArgs = Array.prototype.slice.call(arguments, 1), 
				fToBind = this, 
				fNOP = function () {},
				fBound = function () {
					return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
				};
	
			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
			return fBound;
		};
	}
	
	// Implementation the dashedLine method in Canvas
	// I had fix some difference with Raphael.js
	// special thanks to Phrogz and Rod MacDougall
	// http://stackoverflow.com/questions/4576724/dotted-stroke-in-canvas
	var CP = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
	if (CP && CP.lineTo) {
		CP._dashedLineProperty = {
			index : 0,
			length : 0
		};
		
		CP.resetDashedLine = function () {
			this._dashedLineProperty = {
				index : 0,
				length : 0
			};
		};
		
	    CP.dashedLine = function(x, y, x2, y2, da, width) {
	        if (!da) da = [10, 5];
	        var dx = (x2-x), dy = (y2-y);
	        var len = Math.sqrt(dx * dx + dy * dy);
	        var rot = Math.atan2(dy, dx);
	        var dc = da.length;
	        var di = this._dashedLineProperty.index || 0;
	        var cx = this._dashedLineProperty.length || 0;
	        var cy = 0;
	        var sx = 0;
	        var sy = 0;
	        
	        while (len > cx) {
	        	if (sx !== 0 || cx === 0) {
		            cx += da[di++ % dc] * width;
	        	}
	            
	            if (cx > len) {
	        		this._dashedLineProperty.length = cx - len;
	            	cx = len;
	            }
	            
	            sx = x + cx * Math.cos(rot);
	            sy = y + cx * Math.sin(rot);
	            di % 2 === 1 ? this.lineTo(sx, sy) : this.moveTo(sx, sy);
	        }
	        
	        this._dashedLineProperty.index = di;
	    }
	}
	
	collie.raphaelDashArray = {
        "": [0],
        "none": [0],
        "-": [3, 1],
        ".": [1, 1],
        "-.": [3, 1, 1, 1],
        "-..": [3, 1, 1, 1, 1, 1],
        ". ": [1, 3],
        "- ": [4, 3],
        "--": [8, 3],
        "- .": [4, 3, 1, 3],
        "--.": [8, 3, 1, 3],
        "--..": [8, 3, 1, 3, 1, 3]
	};
})();
/*
 * TERMS OF USE - EASING EQUATIONS
 * Open source under the BSD License.
 * Copyright (c) 2001 Robert Penner, all rights reserved.
 */
/**
 * 새로운 이펙트 함수를 생성한다.
 * 진도 프레임워크의 jindo.Effect를 사용
 * @namespace 수치의 중간값을 쉽게 얻을 수 있게 하는 static 컴포넌트
 * @function
 * @param {Function} fEffect 0~1 사이의 숫자를 인자로 받아 정해진 공식에 따라 0~1 사이의 값을 리턴하는 함수
 * @return {Function} 이펙트 함수. 이 함수는 시작값과 종료값을 입력하여 특정 시점에 해당하는 값을 구하는 타이밍 함수를 생성한다.
 */
collie.Effect = function(fEffect) {
	if (this instanceof arguments.callee) {
		throw new Error("You can't create a instance of this");
	}
	
	var rxNumber = /^(\-?[0-9\.]+)(%|px|pt|em)?$/,
		rxRGB = /^rgb\(([0-9]+)\s?,\s?([0-9]+)\s?,\s?([0-9]+)\)$/i,
		rxHex = /^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i,
		rx3to6 = /^#([0-9A-F])([0-9A-F])([0-9A-F])$/i;
	
	var getUnitAndValue = function(v) {
		var nValue = v, sUnit;
		
		if (rxNumber.test(v)) {
			nValue = parseFloat(v); 
			sUnit = RegExp.$2 || "";
		} else if (rxRGB.test(v)) {
			nValue = [parseInt(RegExp.$1, 10), parseInt(RegExp.$2, 10), parseInt(RegExp.$3, 10)];
			sUnit = 'color';
		} else if (rxHex.test(v = v.replace(rx3to6, '#$1$1$2$2$3$3'))) {
			nValue = [parseInt(RegExp.$1, 16), parseInt(RegExp.$2, 16), parseInt(RegExp.$3, 16)];
			sUnit = 'color';
		} 
				
		return { 
			nValue : nValue, 
			sUnit : sUnit 
		};
	};
	
	return function(nStart, nEnd) {
		var sUnit;
		if (arguments.length > 1) {
			nStart = getUnitAndValue(nStart);
			nEnd = getUnitAndValue(nEnd);
			sUnit = nEnd.sUnit;
		} else {
			nEnd = getUnitAndValue(nStart);
			nStart = null;
			sUnit = nEnd.sUnit;
		} 
		
		// 두개의 단위가 다르면
		if (nStart && nEnd && nStart.sUnit != nEnd.sUnit) {
			throw new Error('unit error');
		}
		
		nStart = nStart && nStart.nValue;
		nEnd = nEnd && nEnd.nValue;
		
		var fReturn = function(p) {
			var nValue = fEffect(p),
				getResult = function(s, d) {
					return (d - s) * nValue + s + sUnit; 
				};
			
			if (sUnit == 'color') {
				var r = Math.max(0, Math.min(255, parseInt(getResult(nStart[0], nEnd[0]), 10))) << 16;
				r |= Math.max(0, Math.min(255, parseInt(getResult(nStart[1], nEnd[1]), 10))) << 8;
				r |= Math.max(0, Math.min(255, parseInt(getResult(nStart[2], nEnd[2]), 10)));
				
				r = r.toString(16).toUpperCase();
				for (var i = 0; 6 - r.length; i++) {
					r = '0' + r;
				}
					
				return '#' + r;
			}
			return getResult(nStart, nEnd);
		};
		
		if (nStart === null) {
			fReturn.setStart = function(s) {
				s = getUnitAndValue(s);
				
				if (s.sUnit != sUnit) {
					throw new Error('unit eror');
				}
				nStart = s.nValue;
			};
		}
		return fReturn;
	};
};

/**
 * linear 이펙트 함수
 */
collie.Effect.linear = collie.Effect(function(s) {
	return s;
});

/**
 * easeInSine 이펙트 함수
 */
collie.Effect.easeInSine = collie.Effect(function(s) {
	return (s == 1) ? 1 : -Math.cos(s * (Math.PI / 2)) + 1;
});
/**
 * easeOutSine 이펙트 함수
 */
collie.Effect.easeOutSine = collie.Effect(function(s) {
	return Math.sin(s * (Math.PI / 2));
});
/**
 * easeInOutSine 이펙트 함수
 */
collie.Effect.easeInOutSine = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInSine(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInSine 이펙트 함수
 */
collie.Effect.easeOutInSine = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutSine(0, 1)(2 * s) * 0.5 : collie.Effect.easeInSine(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInQuad 이펙트 함수
 */
collie.Effect.easeInQuad = collie.Effect(function(s) {
	return s * s;
});
/**
 * easeOutQuad 이펙트 함수
 */
collie.Effect.easeOutQuad = collie.Effect(function(s) {
	return -(s * (s - 2));
});
/**
 * easeInOutQuad 이펙트 함수
 */
collie.Effect.easeInOutQuad = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInQuad(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInQuad 이펙트 함수
 */
collie.Effect.easeOutInQuad = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutQuad(0, 1)(2 * s) * 0.5 : collie.Effect.easeInQuad(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInCubic 이펙트 함수
 */
collie.Effect.easeInCubic = collie.Effect(function(s) {
	return Math.pow(s, 3);
});
/**
 * easeOutCubic 이펙트 함수
 */
collie.Effect.easeOutCubic = collie.Effect(function(s) {
	return Math.pow((s - 1), 3) + 1;
});
/**
 * easeInOutCubic 이펙트 함수
 */
collie.Effect.easeInOutCubic = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeIn(0, 1)(2 * s) * 0.5 : collie.Effect.easeOut(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInCubic 이펙트 함수
 */
collie.Effect.easeOutInCubic = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOut(0, 1)(2 * s) * 0.5 : collie.Effect.easeIn(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInQuart 이펙트 함수
 */
collie.Effect.easeInQuart = collie.Effect(function(s) {
	return Math.pow(s, 4);
});
/**
 * easeOutQuart 이펙트 함수
 */
collie.Effect.easeOutQuart = collie.Effect(function(s) {
	return -(Math.pow(s - 1, 4) - 1);
});
/**
 * easeInOutQuart 이펙트 함수
 */
collie.Effect.easeInOutQuart = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInQuart(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInQuart 이펙트 함수
 */
collie.Effect.easeOutInQuart = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutQuart(0, 1)(2 * s) * 0.5 : collie.Effect.easeInQuart(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInQuint 이펙트 함수
 */
collie.Effect.easeInQuint = collie.Effect(function(s) {
	return Math.pow(s, 5);
});
/**
 * easeOutQuint 이펙트 함수
 */
collie.Effect.easeOutQuint = collie.Effect(function(s) {
	return Math.pow(s - 1, 5) + 1;
});
/**
 * easeInOutQuint 이펙트 함수
 */
collie.Effect.easeInOutQuint = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInQuint(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInQuint 이펙트 함수
 */
collie.Effect.easeOutInQuint = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutQuint(0, 1)(2 * s) * 0.5 : collie.Effect.easeInQuint(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInCircle 이펙트 함수
 */
collie.Effect.easeInCircle = collie.Effect(function(s) {
	return -(Math.sqrt(1 - (s * s)) - 1);
});
/**
 * easeOutCircle 이펙트 함수
 */
collie.Effect.easeOutCircle = collie.Effect(function(s) {
	return Math.sqrt(1 - (s - 1) * (s - 1));
});
/**
 * easeInOutCircle 이펙트 함수
 */
collie.Effect.easeInOutCircle = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInCircle(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutInCircle 이펙트 함수
 */
collie.Effect.easeOutInCircle = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutCircle(0, 1)(2 * s) * 0.5 : collie.Effect.easeInCircle(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInBack 이펙트 함수
 */
collie.Effect.easeInBack = collie.Effect(function(s) {
	var n = 1.70158;
	return (s == 1) ? 1 : (s / 1) * (s / 1) * ((1 + n) * s - n);
});
/**
 * easeOutBack 이펙트 함수
 */
collie.Effect.easeOutBack = collie.Effect(function(s) {
	var n = 1.70158;
	return (s === 0) ? 0 : (s = s / 1 - 1) * s * ((n + 1) * s + n) + 1;
});
/**
 * easeInOutBack 이펙트 함수
 */
collie.Effect.easeInOutBack = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInBack(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutBack(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInElastic 이펙트 함수
 */
collie.Effect.easeInElastic = collie.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return -(a * Math.pow(2, 10 * (s -= 1)) * Math.sin((s - 1) * (2 * Math.PI) / p));
});

/**
 * easeOutElastic 이펙트 함수
 */
collie.Effect.easeOutElastic = collie.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1) == 1) {
		return 1;
	}
	if (!p) {
		p = 0.3;
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	return (a * Math.pow(2, -10 * s) * Math.sin((s - n) * (2 * Math.PI) / p ) + 1);
});
/**
 * easeInOutElastic 이펙트 함수
 */
collie.Effect.easeInOutElastic = collie.Effect(function(s) {
	var p = 0, a = 0, n;
	if (s === 0) {
		return 0;
	}
	if ((s/=1/2) == 2) {
		return 1;
	}
	if (!p) {
		p = (0.3 * 1.5);
	}
	if (!a || a < 1) { 
		a = 1; n = p / 4; 
	} else {
		n = p / (2 * Math.PI) * Math.asin(1 / a);
	}
	if (s < 1) {
		return -0.5 * (a * Math.pow(2, 10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ));
	}
	return a * Math.pow(2, -10 * (s -= 1)) * Math.sin( (s - n) * (2 * Math.PI) / p ) * 0.5 + 1;
});

/**
 * easeOutBounce 이펙트 함수
 */
collie.Effect.easeOutBounce = collie.Effect(function(s) {
	if (s < (1 / 2.75)) {
		return (7.5625 * s * s);
	} else if (s < (2 / 2.75)) {
		return (7.5625 * (s -= (1.5 / 2.75)) * s + 0.75);
	} else if (s < (2.5 / 2.75)) {
		return (7.5625 * (s -= (2.25 / 2.75)) * s + 0.9375);
	} else {
		return (7.5625 * (s -= (2.625 / 2.75)) * s + 0.984375);
	} 
});
/**
 * easeInBounce 이펙트 함수
 */
collie.Effect.easeInBounce = collie.Effect(function(s) {
	return 1 - collie.Effect.easeOutBounce(0, 1)(1 - s);
});
/**
 * easeInOutBounce 이펙트 함수
 */
collie.Effect.easeInOutBounce = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInBounce(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutBounce(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * easeInExpo 이펙트 함수
 */
collie.Effect.easeInExpo = collie.Effect(function(s) {
	return (s === 0) ? 0 : Math.pow(2, 10 * (s - 1));
});
/**
 * easeOutExpo 이펙트 함수
 */
collie.Effect.easeOutExpo = collie.Effect(function(s) {
	return (s == 1) ? 1 : -Math.pow(2, -10 * s / 1) + 1;
});
/**
 * easeInOutExpo 이펙트 함수
 */
collie.Effect.easeInOutExpo = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeInExpo(0, 1)(2 * s) * 0.5 : collie.Effect.easeOutExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});
/**
 * easeOutExpo 이펙트 함수
 */
collie.Effect.easeOutInExpo = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.easeOutExpo(0, 1)(2 * s) * 0.5 : collie.Effect.easeInExpo(0, 1)((2 * s) - 1) * 0.5 + 0.5;
});

/**
 * Cubic-Bezier curve
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} x2
 * @param {Number} y2
 * @see http://www.netzgesta.de/dev/cubic-bezier-timing-function.html
 */
collie.Effect._cubicBezier = function(x1, y1, x2, y2){
	return function(t){
		var cx = 3.0 * x1, 
	    	bx = 3.0 * (x2 - x1) - cx, 
	    	ax = 1.0 - cx - bx, 
	    	cy = 3.0 * y1, 
	    	by = 3.0 * (y2 - y1) - cy, 
	    	ay = 1.0 - cy - by;
		
	    function sampleCurveX(t) {
	    	return ((ax * t + bx) * t + cx) * t;
	    }
	    function sampleCurveY(t) {
	    	return ((ay * t + by) * t + cy) * t;
	    }
	    function sampleCurveDerivativeX(t) {
	    	return (3.0 * ax * t + 2.0 * bx) * t + cx;
	    }
	    function solveCurveX(x,epsilon) {
	    	var t0, t1, t2, x2, d2, i;
	    	for (t2 = x, i = 0; i<8; i++) {
	    		x2 = sampleCurveX(t2) - x; 
	    		if (Math.abs(x2) < epsilon) {
	    			return t2;
	    		} 
	    		d2 = sampleCurveDerivativeX(t2); 
	    		if(Math.abs(d2) < 1e-6) {
	    			break;
	    		} 
	    		t2 = t2 - x2 / d2;
	    	}
		    t0 = 0.0; 
		    t1 = 1.0; 
		    t2 = x; 
		    if (t2 < t0) {
		    	return t0;
		    } 
		    if (t2 > t1) {
		    	return t1;
		    }
		    while (t0 < t1) {
		    	x2 = sampleCurveX(t2); 
		    	if (Math.abs(x2 - x) < epsilon) {
		    		return t2;
		    	} 
		    	if (x > x2) {
		    		t0 = t2;
		    	} else {
		    		t1 = t2;
		    	} 
		    	t2 = (t1 - t0) * 0.5 + t0;
		    }
	    	return t2; // Failure.
	    }
	    return sampleCurveY(solveCurveX(t, 1 / 200));
	};
};

/**
 * Cubic-Bezier 함수를 생성한다.
 * @see http://en.wikipedia.org/wiki/B%C3%A9zier_curve
 * @param {Number} x1 control point 1의 x좌표
 * @param {Number} y1 control point 1의 y좌표
 * @param {Number} x2 control point 2의 x좌표
 * @param {Number} y2 control point 2의 y좌표
 * @return {Function} 생성된 이펙트 함수
 */
collie.Effect.cubicBezier = function(x1, y1, x2, y2){
	return collie.Effect(collie.Effect._cubicBezier(x1, y1, x2, y2));
};

/**
 * Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 ease 함수
 * collie.Effect.cubicBezier(0.25, 0.1, 0.25, 1);
 * @see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
collie.Effect.cubicEase = collie.Effect.cubicBezier(0.25, 0.1, 0.25, 1);

/**
 * Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeIn 함수
 * collie.Effect.cubicBezier(0.42, 0, 1, 1);
 * @see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
collie.Effect.cubicEaseIn = collie.Effect.cubicBezier(0.42, 0, 1, 1);

/**
 * Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeOut 함수
 * collie.Effect.cubicBezier(0, 0, 0.58, 1);
 * @see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
collie.Effect.cubicEaseOut = collie.Effect.cubicBezier(0, 0, 0.58, 1);

/**
 * Cubic-Bezier 커브를 이용해 CSS3 Transition Timing Function과 동일한 easeInOut 함수
 * collie.Effect.cubicBezier(0.42, 0, 0.58, 1);
 * @see http://www.w3.org/TR/css3-transitions/#transition-timing-function_tag
 */
collie.Effect.cubicEaseInOut = collie.Effect.cubicBezier(0.42, 0, 0.58, 1);

/**
 * Cubic-Bezier 커브를 이용해 easeOutIn 함수를 구한다.
 * collie.Effect.cubicBezier(0, 0.42, 1, 0.58);
 */
collie.Effect.cubicEaseOutIn = collie.Effect.cubicBezier(0, 0.42, 1, 0.58);

/**
 * overphase 이펙트 함수
 */
collie.Effect.overphase = collie.Effect(function(s){
	s /= 0.652785;
	return (Math.sqrt((2 - s) * s) + (0.1 * s)).toFixed(5);	
});

/**
 * sin 곡선의 일부를 이용한 sinusoidal 이펙트 함수
 */
collie.Effect.sinusoidal = collie.Effect(function(s) {
	return (-Math.cos(s * Math.PI) / 2) + 0.5;
});

/**
 * mirror 이펙트 함수
 * sinusoidal 이펙트 함수를 사용한다.
 */
collie.Effect.mirror = collie.Effect(function(s) {
	return (s < 0.5) ? collie.Effect.sinusoidal(0, 1)(s * 2) : collie.Effect.sinusoidal(0, 1)(1 - (s - 0.5) * 2);
});

/**
 * nPulse의 진동수를 가지는 cos 함수를 구한다.
 * @param {Number} nPulse 진동수
 * @return {Function} 생성된 이펙트 함수
 * @example
var f = collie.Effect.pulse(3); //진동수 3을 가지는 함수를 리턴
//시작 수치값과 종료 수치값을 설정해 collie.Effect 함수를 생성
var fEffect = f(0, 100);
fEffect(0); => 0
fEffect(1); => 100
 */
collie.Effect.pulse = function(nPulse) {
    return collie.Effect(function(s){
		return (-Math.cos((s * (nPulse - 0.5) * 2) * Math.PI) / 2) + 0.5;	
	});
};

/**
 * nPeriod의 주기와 nHeight의 진폭을 가지는 sin 함수를 구한다.
 * @param {Number} nPeriod 주기
 * @param {Number} nHeight 진폭
 * @return {Function} 생성된 이펙트 함수
 * @example
var f = collie.Effect.wave(3, 1); //주기 3, 높이 1을 가지는 함수를 리턴
//시작 수치값과 종료 수치값을 설정해 collie.Effect 함수를 생성
var fEffect = f(0, 100);
fEffect(0); => 0
fEffect(1); => 0
 */
collie.Effect.wave = function(nPeriod, nHeight) {
    return collie.Effect(function(s){
    	return (nHeight || 1) * (Math.sin(nPeriod * (s * 360) * Math.PI / 180)).toFixed(5);
	});
};

/**
 * easeIn 이펙트 함수
 * easeInCubic 함수와 동일하다.
 * @see easeInCubic
 */
collie.Effect.easeIn = collie.Effect.easeInCubic;
/**
 * easeOut 이펙트 함수
 * easeOutCubic 함수와 동일하다.
 * @see easeOutCubic
 */
collie.Effect.easeOut = collie.Effect.easeOutCubic;
/**
 * easeInOut 이펙트 함수
 * easeInOutCubic 함수와 동일하다.
 * @see easeInOutCubic
 */
collie.Effect.easeInOut = collie.Effect.easeInOutCubic;
/**
 * easeOutIn 이펙트 함수
 * easeOutInCubic 함수와 동일하다.
 * @see easeOutInCubic
 */
collie.Effect.easeOutIn = collie.Effect.easeOutInCubic;
/**
 * bounce 이펙트 함수
 * easeOutBounce 함수와 동일하다.
 * @see easeOutBounce
 */
collie.Effect.bounce = collie.Effect.easeOutBounce;
/**
 * elastic 이펙트 함수
 * easeInElastic 함수와 동일하다.
 * @see easeInElastic
 */
collie.Effect.elastic = collie.Effect.easeInElastic;
/**
 * 별도의 이벤트를 다룰 수 있고 옵션 값을 갖는 컴포넌트 클래스
 * @class collie.Component
 */
collie.Component = collie.Class(/** @lends collie.Component.prototype */{
	/**
	 * @constructs
	 */
	$init : function () {
		this._bInitOption = false;
		this._htOption = {};
		this._htOptionSetter = {};
		this._htHandler = {};
	},
	
	/**
	 * 컴포넌트의 옵션을 설정한다.
	 * @example
	 * component.option({
	 * 	a : 1,
	 * 	b : true
	 * });
	 * 
	 * component.option("a", 1);
	 * component.option("a"); // return 1
	 * @param {Object|String} vName 옵션 이름이나 여러 옵션을 설정할 수 있는 객체를 넣을 수 있다.
	 * @param {Variables} [vValue] 옵션 값, 값이 없다면 해당 옵션 값을 반환한다.
	 * @param {Boolean} [bNotOverwrite] 이 값이 true면 기존에 값이 있을 경우 덮이 씌우지 않는다
	 */
	option : function (vName, vValue, bNotOverwrite) {
		if (typeof vName === "object") {
			// 초기에 넣을 때는 기본 값으로 설정
			if (!this._bInitOption) {
				this._htOption = collie.util.cloneObject(vName);
				this._bInitOption = true;
			} else {
				for (var i in vName) {
					this.option(i, vName[i], bNotOverwrite);
				}
			}
		} else if (typeof vName === "string") {
			// setter
			if (vValue !== undefined) {
				if (!bNotOverwrite || typeof this._htOption[vName] === "undefined") {
					this._htOption[vName] = vValue;
					
					if (this._htOptionSetter[vName] !== undefined) {
						this._htOptionSetter[vName](vValue);
					}
					
					this._bInitOption = true;
				}
			} else { // getter
				return this._htOption[vName];
			}
		} else {
			return this._htOption;
		}
	},
	
	/**
	 * DisplayObject와 Layer의 서로 다른 인터페이스를 맞추기 위한 임시 메서드
	 * 
	 * @see collie.Component#option
	 * @param {String} sName
	 * @return {Variables}
	 */
	get : function (sName) {
		return this.option(sName);
	},
	
	/**
	 * DisplayObject와 Layer의 서로 다른 인터페이스를 맞추기 위한 임시 메서드
	 * 
	 * @see collie.Component#option
	 * @param {String} sName
	 * @param {Variables} vValue
	 * @param {Boolean} [bNotOverwrite]
	 * @return {Object} For method chaining
	 */
	set : function (sName, vValue, bNotOverwrite) {
		this.option(sName, vValue, bNotOverwrite);
		return this;
	},
	
	/**
	 * 옵션을 제거한다
	 * 
	 * @param {String} sKey
	 */
	unset : function (sKey) {
		if (this._htOption && typeof this._htOption[sKey] !== "undefined") {
			delete this._htOption[sKey];
		}
	},
	
	/**
	 * 옵션 값이 설정될 때 실행될 함수를 지정한다. Setter는 한 속성 당 한 개의 함수만 설정할 수 있다.
	 * 
	 * @param {String} sName
	 * @param {Function} fSetter
	 */
	optionSetter : function (sName, fSetter) {
		this._htOptionSetter[sName] = fSetter;
	},
	
	/**
	 * 이벤트 발생
	 * 
	 * @param {String} sName
	 * @param {Object} oEvent
	 * @return {Boolean} 이벤트 발생 중 collie.ComponentEvent의 stop 메소드가 실행될 경우 false를 반환한다
	 */
	fireEvent : function (sName, oEvent) {
		if (typeof this._htHandler[sName] !== "undefined" && this._htHandler[sName].length > 0) {
			oEvent = oEvent || {};
			oCustomEvent = new collie.ComponentEvent(sName, oEvent);
			var aHandler = this._htHandler[sName].concat();
			var bCanceled = false;
			
			for (var i = 0, len = aHandler.length; i < len; i++) {
				this._htHandler[sName][i](oCustomEvent);
				
				// stop했으면 false를 반환
				if (oCustomEvent.isStop()) {
					bCanceled = true;
				}
			}
			
			if (bCanceled) {
				return false;
			}
		}
		
		return true;
	},
	
	/**
	 * 이벤트 핸들러 추가
	 * 
	 * @param {Object|String} vEvent
	 * @param {Function} fHandler
	 * @return {collie.Component} 메소드 체이닝 지원
	 */
	attach : function (vEvent, fHandler) {
		if (typeof vEvent !== "string") {
			for (var i in vEvent) {
				this.attach(i, vEvent[i]);
			}
		} else {
			this._htHandler[vEvent] = this._htHandler[vEvent] || [];
			var aHandler = this._htHandler[vEvent];
			
			// 핸들러가 있을 때만 등록
			if (!fHandler) {
				return this;
			}
			
			// 중복된 핸들러는 등록하지 않음
			for (var i = 0, len = aHandler.length; i < len; i++) {
				if (aHandler[i] === fHandler) {
					return this;
				}
			}
			
			// 핸들러 등록
			aHandler.push(fHandler);
		}
		
		return this;
	},
	
	/**
	 * 이벤트 핸들러를 해제한다
	 * 
	 * @param {Object|String} vEvent
	 * @param {Function} fHandler 값이 없을 경우 이 이벤트에 할당된 전체 핸들러를 해제한다
	 */
	detach : function (vEvent, fHandler) {
		if (typeof vEvent !== "string") {
			for (var i in vEvent) {
				this.detach(i, vEvent[i]);
			}
		} else if (this._htHandler[vEvent] !== undefined) {
			var aHandler = this._htHandler[vEvent];
			
			// 두번째 인자가 없을 때 전체를 detach
			if (!fHandler) {
				delete this._htHandler[vEvent];
			} else {
				for (var i = 0, len = aHandler.length; i < len; i++) {
					if (aHandler[i] === fHandler) {
						this._htHandler[vEvent].splice(i, 1);
						
						// 배열이 다 없어졌다면 제거
						if (this._htHandler[vEvent].length < 1) {
							delete this._htHandler[vEvent];
						}
						break;
					}
				}
			}
		}
	},
	
	/**
	 * 모든 이벤트 핸들러를 해제
	 * 
	 * @param {String} sName 이벤트 이름, 값이 없으면 이 컴포넌트에 할당된 모든 이벤트를 해제한다
	 */
	detachAll : function (sName) {
		if (sName) {
			if (this._htHandler[sName] !== undefined) {
				this._htHandler[sName] = [];
			}
		} else {
			this._htHandler = {};
		}
	}
});

/**
 * 컴포넌트 클래스의 이벤트가 발생될 때 생성되는 이벤트 클래스
 * @class
 * @private
 * @param {String} sName 이벤트 이름
 * @param {Object} oEvent
 */
collie.ComponentEvent = collie.Class(/** @lends collie.ComponentEvent.prototype */{
	/**
	 * @constructs
	 */
	$init : function (sName, oEvent) {
		this.type = sName;
		this._bCanceled = false;
		
		//TODO 향후에 이 구조를 바꾸는게 좋음
		if (oEvent) {
			for (var i in oEvent) {
				this[i] = oEvent[i];
			}
		}
	},
	
	/**
	 * 이벤트를 멈추고 싶은 경우 실행
	 */
	stop : function () {
		this._bCanceled = true;
	},
	
	/**
	 * 이벤트가 멈췄는지 확인
	 * 
	 * @return {Boolean} 멈췄으면 true
	 */
	isStop : function () {
		return this._bCanceled;
	}
});
/**
 * @class
 * @private
 * @example
 * collie.ImageManager.add({
 * 	"sample" : "sample.png"
 * });
 * collie.ImageManager.addSprite("sample", {
 * 	normal : [0, 0],
 * 	action : [30, 0]
 * });
 * new collie.DisplayObject({
 * 	spriteSheet : "normal",
 * 	backgroundImage : "sample"
 * });
 */
collie.SpriteSheet = collie.Class(/** @lends collie.SpriteSheet.prototype */{
	$init : function () {
		this._htSpriteSheet = {};
	},

	/**
	 * 스프라이트를 추가
	 * 
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 * @param {String|Object} vSpriteName 객체로 한 번에 여러 개의 정보를 등록할 수 있음
	 * @param {Number} nOffsetX
	 * @param {Number} nOffsetY
	 * @param {Number} [nWidth]
	 * @param {Number} [nHeight]
	 * @param {Number} [nSpriteLength]
	 */
	add : function (sImageName, vSpriteName, nOffsetX, nOffsetY, nWidth, nHeight, nSpriteLength) {
		if (typeof vSpriteName === "object") {
			if (vSpriteName instanceof Array) {
				for (var i = 0, l = vSpriteName.length; i < l; i++) {
					this.add.apply(this, [sImageName, i].concat(vSpriteName[i]));
				}
			} else {
				for (var i in vSpriteName) {
					this.add.apply(this, [sImageName, i].concat(vSpriteName[i]));
				}
			}
		} else {
			this._htSpriteSheet[sImageName] = this._htSpriteSheet[sImageName] || {};
			
			if (typeof nWidth !== "undefined") {
				collie.ImageManager.getImage(sImageName, function (el) {
					this._addWithSpriteLength(el, sImageName, vSpriteName, nOffsetX, nOffsetY, nWidth, nHeight, nSpriteLength);
				}.bind(this));
			} else {
				this._htSpriteSheet[sImageName][vSpriteName] = [nOffsetX, nOffsetY];
			}
		}
	},
	
	/**
	 * @private
	 */
	_addWithSpriteLength : function (elImage, sImageName, sSpriteName, nOffsetX, nOffsetY, nWidth, nHeight, nSpriteLength) {
		var aSpriteList = this._htSpriteSheet[sImageName][sSpriteName] = [];
		var nImageWidth = elImage.width;
		var nImageHeight = elImage.height;
		
		// 레티나 이미지면 반으로 나눔
		if (collie.Renderer.isRetinaDisplay()) {
			nImageWidth /= 2;
			nImageHeight /= 2;
		}
		
		var x = nOffsetX;
		var y = nOffsetY;
		
		for (i = 0; i < nSpriteLength; i++) {
			// 이미지를 넘어서면 줄을 바꿈
			// 다음 줄은 nOffsetX 부터 시작하는 것이 아니라 0부터 시작함
			if (x >= nImageWidth) {
				x = 0;
				y += nHeight;
			}
			
			// 이미지를 넘어서면 끝남
			if (y >= nImageHeight) {
				break;
			}
			
			aSpriteList.push([x, y]);
			x += nWidth;
		}
	},
	
	/**
	 * 해당 이미지에 등록돼 있는 스프라이트 정보를 제거
	 * 
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 */
	remove : function (sImageName) {
		if (this._htSpriteSheet[sImageName]) {
			delete this._htSpriteSheet[sImageName];
		}
	},
	
	/**
	 * SpriteSheet 정보를 반환
	 * 
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 * @return {Object}
	 */
	get : function (sImageName) {
		return this._htSpriteSheet[sImageName] ? this._htSpriteSheet[sImageName] : false;
	},
	
	/**
	 * 스프라이트 시트 정보를 초기화 한다
	 */
	reset : function () {
		this._htSpriteSheet = {};
	}
});
/**
 * 이미지 리소스 관리
 * @example
 * // 한 개의 이미지를 로딩
 * collie.ImageManager.add("key", "sample.png");
 * new collie.DisplayObject({
 * 	backgroundImage: "key"
 * });
 * @example
 * // 여러 이미지를 한 번에 로딩
 * collie.ImageManager.add({
 * 	image1 : "image1.png",
 * 	image2 : "image2.png"
 * }, function () {
 * 	alert("complete");
 * });
 * @namespace
 */
collie.ImageManager = collie.ImageManager || new (collie.Class(/** @lends collie.ImageManager */{
	/**
	 * 이미지 로딩 실패시 재시도 횟수
	 * @type {Number}
	 */
	RETRY_COUNT : 3,
	
	/**
	 * 이미지 로딩 실패시 재시도 딜레이 ms
	 * @type {Number}
	 */
	RETRY_DELAY : 500,
	
	/**
	 * DOM일 때 css3d 엘리먼트를 미리 만들어놓는지 여부
	 * - 기능 불안정으로 기본 사용 false로 변경, top, left를 멀리 보내버리면 3d 렌더링에 부담이 될 수 있다.
	 * @type {Boolean} 
	 */
	USE_PRERENDERING_DOM : false,
	
	$init : function () {
		this._aImages = [];
		this._htImageNames = {};
		this._htImageRetryCount = {};
		this._htImageWhileLoading = {};
		this._nCount = 0;
		this._oSpriteSheet = new collie.SpriteSheet();
	},
	
	/**
	 * 이미지를 추가
	 * - 외부에서 직접 사용하면 count가 어긋나기 때문에 private 처리
	 * 
	 * @private
	 * @param {String} sName 리소스 이름, 나중에 이 이름으로 리소스를 찾는다
	 * @param {HTMLElement} elImage 저장할 엘리먼트
	 */
	_addImage : function (elImage, sName) {
		var nLength = this._aImages.push({
			element : elImage,
			name : sName
		});
		
		var aCallback = this._htImageNames[sName];
		this._htImageNames[sName] = nLength - 1;
		delete this._htImageRetryCount[sName];
		
		// callback 실행
		if (aCallback && aCallback instanceof Array) {
			for (var i = 0, len = aCallback.length; i < len; i++) {
				aCallback[i](elImage, sName);
			}
			
			aCallback = null;
		}
		
		/**
		 * 한개의 이미지가 로딩되었을 때 발생
		 * @name collie.ImageManager#process
		 * @event
		 * @param {Object} oEvent
		 * @param {String} oEvent.name 이미지 이름
		 * @param {String} oEvent.url 이미지 URL
		 * @param {Number} oEvent.count 현재 로딩된 갯수
		 * @param {Number} oEvent.total 전체 이미지 갯수
		 * @param {Number} oEvent.ratio 로딩된 이미지의 비율 (0~1)
		 */
		this.fireEvent("process", {
			name : sName,
			url : elImage.src,
			count : nLength,
			total : this._nCount,
			ratio : Math.round((nLength / this._nCount) * 1000) / 1000
		});
		
		if (this._nCount === nLength) {
			/**
			 * 등록된 이미지가 모두 로드 되었을 경우
			 * @name collie.ImageManager#complete
			 * @event
			 * @param {Object} oEvent
			 */
			this.fireEvent("complete");
		}
	},
	
	/**
	 * 자리를 찜, 이미 자리가 있는 경우에는 아무것도 하지 않는다
	 * 
	 * @private
	 * @param {String} sName 이미지 이름
	 */
	_markImage : function (sName) {
		if (!this._htImageNames[sName]) {
			this._htImageNames[sName] = [];
		}
		
		if (!this._htImageRetryCount[sName]) {
			this._htImageRetryCount[sName] = 0;
		} 
	},
	
	/**
	 * 해쉬를 다시 만듦
	 * @private
	 */
	_makeHash : function () {
		this._htImageNames = {};
		
		for (var i = 0, len = this._aImages.length; i < len; i++) {
			this._htImageNames[this._aImages[i].name] = i;
		}
	},
	
	/**
	 * 이미지를 가져온다
	 * 
	 * @static
	 * @param {String} sName 리소스 이름
	 * @param {Function} fCallback 리소스가 로드되지 않았을 수도 있으므로 콜백으로 처리
	 * @return {HTMLElement}
	 */
	getImage : function (sName, fCallback) {
		if (!sName && sName !== 0) {
			return false;
		}
		
		// 마크되지 않은 이름이라면 마크함
		if (!(sName in this._htImageNames)) {
			this._markImage(sName);
		}
		
		// 마크가 된 상황이고 아직 로딩되지 않았다면
		if (this._htImageNames[sName] instanceof Array) {
			return (fCallback && this._addMarkCallback(sName, fCallback));
		} else {
			if (fCallback) {
				fCallback(this._aImages[this._htImageNames[sName]].element);
			} else {
				return this._aImages[this._htImageNames[sName]].element;
			}
		}
	},
	
	/**
	 * 마크된 영역에 콜백을 등록, 로딩이 완료되면 콜백이 실행된다
	 * @private
	 * @param {String} sName
	 * @param {Function} fCallback
	 * @param {Function} fFail
	 * @return {Boolean} callback이 등록될 경우 true를 반환
	 */
	_addMarkCallback : function (sName, fCallback, fFail) {
		if ((sName in this._htImageNames) && this._htImageNames[sName] instanceof Array) {
			if (fFail) {
				var fError = function fError(oEvent) {
					if (oEvent.name === sName) {
						fFail();
						this.detach("error", fError);
					}
				};
				
				this.attach("error", fError);
			}
			
			if (fCallback) {
				this._htImageNames[sName].push(fCallback);
			}
			
			return true;
		} else {
			return false;
		}
	},
	
	/**
	 * 이미지를 삭제한다
	 * @param {String} sName 리소스 이름
	 */
	removeImage : function (sName) {
		if (!(sName in this._htImageNames)) {
			return false;
		}
		
		var elImage = this._aImages.splice(this._htImageNames[sName], 1);
		this._makeHash();
		elImage.onload = null;
		elImage.onerror = null;
		elImage.src = null;
		elImage = null;
		this._oSpriteSheet.remove(sName);
	},
	
	/**
	 * 이미지를 삭제한다
	 * @see collie.ImageManager.removeImage
	 */
	remove : function (sName) {
		this.removeImage(sName);
	},
	
	/**
	 * 이미지 리소스를 추가한다
	 * 
	 * @example
	 * // 1개의 이미지를 추가
	 * collie.ImageManager.add("key", "sample.png", function () {
	 * 	// callback
	 * });
	 * @example
	 * // 여러 개의 이미지를 추가
	 * collie.ImageManager.add({
	 * 	key : "sample.png",
	 * 	key2 : "sample2.png"
	 * }, function () {
	 * 	// callback
	 * });
	 * 
	 * @see collie.ImageManager.addImage
	 * @see collie.ImageManager.addImages
	 */
	add : function () {
		if (typeof arguments[0] === "object") {
			this.addImages.apply(this, arguments);
		} else {
			this.addImage.apply(this, arguments);
		}
	},
	
	/**
	 * 여러 개의 이미지 리소스를 한번에 추가 한다.
	 * 
	 * @param {Object} htList { sName : sURL , sName2 : sURL2 }
	 * @param {Function} fCallback 선택한 파일이 모두 로드될 때 실행될 함수. 없으면 실행되지 않는다. 인자로 htList를 반환
	 * @param {Function} fFail 선택한 파일 중에 한개라도 로드되지 않았을 때 실행될 함수. 실패한 이미지의 [el, sName, sURL] 배열 목록을 인자로 갖는다
	 */
	addImages : function (htList, fCallback, fFail) {
		var fOnComplete = null;
		var fOnFail = null;
		var nTotalCount = 0;
		var nCurrentCount = 0;
		var aFailedImages = [];
		
		// 돌면서 갯수 먼저 파악
		for (var i in htList) {
			nTotalCount++;
		}
		
		// 콜백
		if (fCallback && fCallback !== null) {
			fOnComplete = (function () {
				nCurrentCount++;
				
				if (nCurrentCount >= nTotalCount) {
					fCallback(htList);	
				}
			}).bind(this);
		}
		
		// 실패했을 경우
		if (fFail && fFail !== null) {
			fOnFail = (function (el, sName, sURL) {
				aFailedImages.push([el, sName, sURL]);
				
				if (aFailedImages.length + nCurrentCount >= nTotalCount) {
					fFail(aFailedImages);
				}
			}).bind(this);
		}
		
		// 로드
		for (var i in htList) {
			this.addImage(i, htList[i], fOnComplete, fOnFail);
		}
	},
	
	/**
	 * 비동기로 이미지를 로딩
	 * 
	 * @param {String} sName 이미지 이름, 이름이 없을 경우 Loader에 저장하지 않는다
	 * @param {String} sURL 이미지 주소
	 * @param {Function} fCallback 성공시 실행될 함수
	 * @param {HTMLElement} fCallback.elImage 엘리먼트
	 * @param {String} fCallback.sName 리소스 이름
	 * @param {String} fCallback.sURL URL
	 * @param {Function} fFail 실패시 실행될 함수
	 */
	addImage : function (sName, sURL, fCallback, fFail) {
		// 이미 이미지가 있으면 바로 콜백 실행
		if (this.getImage(sName)) {
			if (fCallback && fCallback !== null) {
				fCallback(this.getImage(sName), sName, sURL);
			}
			return;
		}
		
		// 이미 로딩 중이고 마크가 된 상황이라면 콜백 등록하고 멈춤
		if ((sName in this._htImageWhileLoading) && this._addMarkCallback(sName, fCallback, fFail)) {
			return;
		}
		
		this._nCount++;
		this._markImage(sName);
		var el = new Image();
		
		// DOM모드면 미리 OpenGL 레이어로 변환해 놓는다
		if (this.USE_PRERENDERING_DOM && collie.Renderer.getRenderingMode() === "dom" && collie.util.getSupportCSS3d() && !collie.util.getDeviceInfo().android) {
			el.style.webkitTransform = "translateZ(0)";
			el.style.position = "absolute";
			el.style.visibility = "hidden";
			collie.Renderer.getElement().appendChild(el);
		}
		
		this._htImageWhileLoading[sName] = el;
		
		el.onload = (function (e) {
			this._addImage(el, sName);
			
			if (fCallback && fCallback !== null) {
				fCallback(el, sName, sURL);
			}
			
			el.onerror = el.onload = null;
			this._deleteWhileLoading(sName);
		}).bind(this);
		
		el.onerror = (function (e) {
			// 재시도
			if (this._htImageRetryCount[sName] < this.RETRY_COUNT) {
				this._htImageRetryCount[sName]++;
				
				/**
				 * 한 개의 이미지가 로딩 실패 했을 때 실행
				 * @name collie.ImageManager#retry
				 * @event
				 * @param {Object} oEvent
				 * @param {String} oEvent.name 실패된 이미지 이름
				 * @param {String} oEvent.url 실패된 이미지 URL
				 * @param {Number} oEvent.count 현재 로딩된 갯수
				 * @param {Number} oEvent.total 전체 이미지 갯수
				 */
				this.fireEvent("retry", {
					count : this._aImages.length,
					total : this._nCount,
					name : sName,
					url : sURL,
					delay : this.RETRY_DELAY,
					retryCount : this._htImageRetryCount[sName]
				});
				
				setTimeout(function () {
					// workaround http://code.google.com/p/chromium/issues/detail?id=7731
					el.src = "about:blank";
					el.src = sURL;
				}, this.RETRY_DELAY);
				return;
			}
			
			if (fFail && fFail !== null) {
				fFail(el, sName, sURL);
			}
			
			/**
			 * 한 개의 이미지가 로딩 실패 했을 때 실행
			 * @name collie.ImageManager#error
			 * @event
			 * @param {Object} oEvent
			 * @param {String} oEvent.name 실패된 이미지 이름
			 * @param {String} oEvent.url 실패된 이미지 URL
			 * @param {Number} oEvent.count 현재 로딩된 갯수
			 * @param {Number} oEvent.total 전체 이미지 갯수
			 */
			this.fireEvent("error", {
				count : this._aImages.length,
				total : this._nCount,
				name : sName,
				url : sURL
			});
			
			el.onerror = el.onload = null;
			this._deleteWhileLoading(sName);
		}).bind(this);
		
		// Webkit 버그로 인해서 CORS 주석 처리
		// el.crossOrigin = "";
		el.src = sURL;
	},
	
	/**
	 * 로딩 중에 임시로 담아놓는 변수를 제거
	 * @private
	 * @param {String} sName
	 */
	_deleteWhileLoading : function (sName) {
		delete this._htImageWhileLoading[sName];
	},
	
	/**
	 * 로드되고 있는 파일을 모두 멈춤
	 */
	abort : function () {
		for (var i in this._htImageWhileLoading) {
			this._htImageWhileLoading[i].onload = this._htImageWhileLoading[i].onerror = null; 
			this._htImageWhileLoading[i].src = null;
			this._htImageWhileLoading[i] = null;
		}
		
		this._htImageWhileLoading = {};
		this._htImageStartedLoading = {};
	},
	
	/**
	 * 등록된 파일을 모두 제거
	 */
	reset : function () {
		this.abort();
		this._aImages = [];
		this._htImageNames = {};
		this._htImageRetryCount = {};
		this._htImageWhileLoading = {};
		this._nCount = 0;
		this._oSpriteSheet.reset();
	},
	
	/**
	 * 비동기로 등록된 이미지 콜백을 취소 한다
	 * DisplayObject에서 setImage처리할 때 자동으로 호출 된다
	 * @private
	 * @arguments collie.ImageManager.getImage
	 */
	cancelGetImage : function (sName, fCallback) {
		if (this._htImageNames[sName] instanceof Array) {
			for (var i = 0, len = this._htImageNames[sName].length; i < len; i++) {
				if (this._htImageNames[sName][i] === fCallback) {
					this._htImageNames[sName].splice(i, 1);
					return;
				}
			}
		}
	},
	
	/**
	 * 이미지에 스프라이트 시트 정보를 추가한다
	 * 
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 * @param {String|Object} vSpriteName 객체로 한 번에 여러 개의 정보를 등록할 수 있음
	 * @example
	 * collie.ImageManager.add({
	 * 	"sample" : "sample.png"
	 * });
	 * 
	 * // Add Sprites with key-value object
	 * collie.ImageManager.addSprite("sample", {
	 * 	normal : [0, 0], // [offsetX, offsetY]
	 * 	action : [30, 0],
	 *  jump : [60, 0, 30, 30, 8] // [startOffsetX, startOffsetY, a width per one frame, a height per one frame, spriteLength] 
	 * });
	 * 
	 * // or Add Sprites with array
	 * collie.ImageManager.addSprite("sample", [
	 * 	[0, 0], // key 0
	 * 	[30, 0], // key 1
	 * 	[60, 0, 30, 30, 8] // key 2 and [startOffsetX, startOffsetY, a width per one frame, a height per one frame, spriteLength]
	 * ]);
	 * 
	 * var item = new collie.DisplayObject({
	 * 	spriteSheet : "normal", // or 0
	 * 	backgroundImage : "sample"
	 * });
	 * 
	 * // with Timer
	 * collie.Timer.cycle(item, 1000, {
	 * 	from: 0, 
	 * 	to: 1,
	 * 	set: "spriteSheet"
	 * });
	 * 
	 * // If you use five parameters in the addSprite method, you can use spriteX option with spriteSheet 
	 * item.set("spriteSheet", "jump");
	 * collie.Timer.cycle(item, 1000, {
	 * 	from: 0,
	 * 	to: 7 // spriteLength 8
	 * });
	 */
	addSprite : function (sImageName, vSpriteName, nOffsetX, nOffsetY) {
		this._oSpriteSheet.add(sImageName, vSpriteName, nOffsetX, nOffsetY);
	},
	
	/**
	 * 스프라이트 시트 정보를 반환한다
	 * 
	 * @private
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 * @return {Object} 
	 */
	getSprite : function (sImageName) {
		return this._oSpriteSheet.get(sImageName);
	},
	
	/**
	 * 스프라이트 정보를 제거한다
	 * 
	 * @param {String} sImageName collie.ImageManager에 등록된 이미지 이름
	 */
	removeSprite : function (sImageName) {
		this._oSpriteSheet.remove(sImageName);
	}
	
	/**
	 * 이미지를 사용 가능한 상태로 미리 만들어 놓는다. mark된 이미지는 DisplayObject에서 사용할 수 있다
	 *
	 * @name collie.ImageManager.mark 
	 * @param {Object|String} vName 점찍을 이미지 이름, load에서 쓰이는 sName을 뜻하며 addImages의 HashTable 형태로 넣을 경우 키 값이 이름으로 들어가게 된다
	 * @deprecated 정의되지 않은 이름을 부를 때 자동으로 mark되도록 수정
	 */
	/**
	 * @name collie.ImageManager.load 
	 * @deprecated add로 변경
	 */
}, collie.Component))();
/**
 * 행렬
 * @namespace
 */
collie.Matrix = {
	/**
	 * 행렬 곱셈
	 * 
	 * @param {Array} a1
	 * @param {Array} a2
	 */
	multiple : function (a1, a2) {
		var matrix = [];
		
		for (var row2 = 0, len = a2.length; row2 < len; row2++) {
			var r = [];
			
			for (var col2 = 0, len2 = a2[0].length; col2 < len2; col2++) {
				var s = 0;
				
				for (var col1 = 0, len3 = a1[0].length; col1 < len3; col1++) {
					s += a1[row2][col1] * a2[col1][col2];
				}
				
				r.push(s);
			}
			
			matrix.push(r);
		}
		
		return matrix;
	},
	
	/**
	 * translate와 관련된 계산 행렬을 반환
	 * 
	 * @param {Number} nX
	 * @param {Number} nY
	 * @return {Array}
	 */
	translate : function (nX, nY) {
		return [
			[1, 0, nX],
			[0, 1, nY],
			[0, 0, 1]
		];
	},
	
	/**
	 * scale 계산 행렬 반환
	 * 
	 * @param {Number} nX
	 * @param {Number} nY
	 * @return {Array}
	 */
	scale : function (nX, nY) {
		return [
			[nX, 0, 0],
			[0, nY, 0],
			[0, 0, 1]
		];
	},
	
	/**
	 * 회전 계산 행렬 반환
	 * 
	 * @param {Number} nAngle
	 * @return {Array}
	 */
	rotate : function (nAngle) {
		var nRad = collie.util.toRad(nAngle);
		var nCos = Math.cos(nRad);
		var nSin = Math.sin(nRad);
		
		return [
			[nCos, -nSin, 0],
			[nSin, nCos, 0],
			[0, 0, 1]
		];
	},
	
	/**
	 * 대상 point를 변형
	 * 
	 * @param {Array} a 적용할 계산 행렬
	 * @param {Number} nX 대상 x좌표
	 * @param {Number} nY 대상 y좌표
	 * @return {Object} htResult
	 * @return {Number} htResult.x 변경된 x좌표
	 * @return {Number} htResult.y 변경된 y좌표
	 */
	transform : function (a, nX, nY) {
		var aResult = this.multiple(a, [
			[nX],
			[nY],
			[1]
		]);
		
		return {
			x : aResult[0][0],
			y : aResult[1][0]
		};
	}
};
/**
 * Transform Matrix
 * - 기본으로 상대 좌표로 계산한다
 * - getBoundary와 같은 특수한 경우만 절대좌표로 반환
 * - 나중에 IE filter로 사용할 때는 points에 절대좌표 기능을 넣어야 함
 * @namespace
 */
collie.Transform = {
	_htBoundary : {
		left : 0,
		top : 0,
		right : 0,
		bottom : 0
	},
	_bIsIEUnder8 : collie.util.getDeviceInfo().ie && collie.util.getDeviceInfo().ie < 9,
	
	/**
	 * Transform된 표시 객체의 Boundary를 반환 한다 (0, 0에서 시작)
	 * TODO Transform 상속 구현 안됨!
	 * 
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Boolean} bWithPoints 좌표를 반환하는지 여부, Sensor의 box hittest에서 쓰임
	 * @return {Object} htResult 상대 좌표 영역
	 * @return {Number} htResult.left
	 * @return {Number} htResult.right
	 * @return {Number} htResult.top
	 * @return {Number} htResult.bottom
	 * @return {Number} htResult.isTransform
	 * @return {Number} htResult.points
	 */
	getBoundary : function (oDisplayObject, bWithPoints) {
		var htInfo = oDisplayObject.get();
		var aPoints = [[0, 0], [htInfo.width, 0], [htInfo.width, htInfo.height], [0, htInfo.height]];
		var aTransformedPoints = this.points(oDisplayObject, aPoints);
		var htBoundary = collie.util.getBoundary(aTransformedPoints);
		this._htBoundary.left = htBoundary.left;
		this._htBoundary.right = htBoundary.right;
		this._htBoundary.bottom = htBoundary.bottom;
		this._htBoundary.top = htBoundary.top;
		this._htBoundary.isTransform = this.isUseTransform(oDisplayObject);
		
		if (bWithPoints) {
			this._htBoundary.points = aTransformedPoints; // sensor용 point
		}
		
		return this._htBoundary;
	},
	
	/**
	 * 해당 표시 객체에 맞게 점들을 transform한 결과를 반환 한다
	 * 
	 * @param {collie.DisplayObject} oDisplayObject 대상 표시 객체
	 * @param {Array} aPoints transform을 적용할 점들 (ex: [[x1, y1], [x2, y2], ...])
	 */
	points : function (oDisplayObject, aPoints) {
		var aMatrix
		
		if (!this._bIsIEUnder8) {
			aMatrix = this.getMatrixRecusively(oDisplayObject);
		}

		// 계산할 필요가 없다면 그대로 반환
		if (!aMatrix) {
			return aPoints;
		}
		
		var aPointsAfter = [];
		
		for (var i = 0, len = aPoints.length; i < len; i++) {
			var htPoint = collie.Matrix.transform(aMatrix, aPoints[i][0], aPoints[i][1]);
			aPointsAfter.push([htPoint.x, htPoint.y]);
		}
		
		return aPointsAfter;
	},
	
	/**
	 * 상속된 Transform을 적용한 Matrix를 반환
	 * TODO 속도 체크해 봐야 함!
	 * 
	 * @param {collie.DisplayObject} oDisplayObject 최하위 객체
	 * @return {Array} Matrix
	 */
	getMatrixRecusively : function (oDisplayObject) {
		var self = oDisplayObject;
		var aMatrix = null;
		var nX = 0;
		var nY = 0;
		
		while (self) {
			if (this.isUseTransform(self)) {
				var aSelfMatrix = this.getMatrix(self, nX, nY);
				aMatrix = aMatrix !== null ? collie.Matrix.multiple(aMatrix, aSelfMatrix) : aSelfMatrix;
			}
			
			nX -= self._htOption.x;
			nY -= self._htOption.y;
			self = self.getParent();
		}
		
		return aMatrix;
	},
	
	/**
	 * 대상 표시 객체에 맞는 Matrix를 구한다
	 * 상대좌표의 matrix로 반환되며 최종 결과의 translate는 별도로 적용해야 한다
	 * 
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Number} nX 좌표 보정치
	 * @param {Number} nY
	 * @return {Array} Matrix
	 */
	getMatrix : function (oDisplayObject, nX, nY) {
		if (typeof nX === "undefined") {
			nX = 0;
		}
		
		if (typeof nY === "undefined") {
			nY = 0;
		}
		
		var htOrigin = oDisplayObject.getOrigin();
		var htInfo = oDisplayObject.get();
		var aMatrix = collie.Matrix.translate(htOrigin.x + nX, htOrigin.y + nY);
		
		if (htInfo.angle !== 0) {
			aMatrix = collie.Matrix.multiple(aMatrix, collie.Matrix.rotate(htInfo.angle));
		}
		
		if (htInfo.scaleX !== 1 || htInfo.scaleY !== 1) {
			aMatrix = collie.Matrix.multiple(aMatrix, collie.Matrix.scale(htInfo.scaleX, htInfo.scaleY));
		}
		
		aMatrix = collie.Matrix.multiple(aMatrix, collie.Matrix.translate(-(htOrigin.x + nX), -(htOrigin.y + nY)));
		return aMatrix;
	},
	
	/**
	 * Transform을 사용하고 있는 경우
	 * @return {Boolean}
	 */
	isUseTransform : function (oDisplayObject) {
		return (oDisplayObject._htOption.scaleX !== 1 || oDisplayObject._htOption.scaleY !== 1 || oDisplayObject._htOption.angle !== 0);
	}
};
/**
 * 캔버스 방식의 렌더링
 * 
 * @private
 * @class collie.LayerCanvas
 * @param {collie.Layer} oLayer
 */
collie.LayerCanvas = collie.Class(/** @lends collie.LayerCanvas.prototype */{
	/**
	 * @private
	 * @constructs
	 */
	$init : function (oLayer) {
		this._oLayer = oLayer;
		this._oEvent = oLayer.getEvent();
		this._htDeviceInfo = collie.util.getDeviceInfo();
		this._initCanvas();
	},
	
	_initCanvas : function () {
		var htSize = this._getLayerSize();
		this._elCanvas = document.createElement("canvas");
		this._elCanvas.width = htSize.width;
		this._elCanvas.height = htSize.height;
		this._elCanvas.className = "_collie_layer";
		this._elCanvas.style.position = "absolute";
		this._elCanvas.style.left = this._oLayer.option("x") + "px";
		this._elCanvas.style.top = this._oLayer.option("y") + "px";
		
		if (collie.Renderer.isRetinaDisplay()) {
			this._elCanvas.style.width = (htSize.width / 2) + "px";
			this._elCanvas.style.height = (htSize.height / 2) + "px";
		}
		
		this._oContext = this._elCanvas.getContext('2d');
	},
	
	/**
	 * 현재 레이어 사이즈를 반환, 레티나일 경우에는 두배로 반환 한다 (캔버스일 경우에만)
	 * 
	 * @param {Number} nWidth 레이어 너비, 지정하지 않으면 Layer에서 값을 가져온다
	 * @param {Number} nHeight 레이어 높이, 지정하지 않으면 Layer에서 값을 가져온다
	 * @return {Object} htSize
	 * @return {Number} htSize.width
	 * @return {Number} htSize.height
	 */
	_getLayerSize : function (nWidth, nHeight) {
		nWidth = nWidth || this._oLayer.option("width");
		nHeight = nHeight || this._oLayer.option("height");
		
		// 레티나 디스플레이 대응
		if (collie.Renderer.isRetinaDisplay()) {
			nWidth *= 2;
			nHeight *= 2;
		}
		
		return {
			width : nWidth,
			height : nHeight
		};
	},
	
	/**
	 * Canvas Context를 반환
	 * @private
	 * @return {Boolean|Object}
	 */
	getContext : function () {
		return this._oContext;
	},
	
	/**
	 * @private
	 */
	getElement : function () {
		return this._elCanvas;
	},

	/**
	 * @private
	 */
	clear : function (oContext) {
		oContext = oContext || this.getContext();
		
		// workaround: samsung galaxy s3 LTE 4.0.4, LG Optimus G pro 4.1.1에서 딱 맞춰서 clear하면 잔상이 생기거나 오류가 생김		
		if (!this._htDeviceInfo.android || (this._htDeviceInfo.android < 4.12 && this._htDeviceInfo.android >= 4.2)) {
			oContext.clearRect(0, 0, this._elCanvas.width + 1, this._elCanvas.height + 1);
		} else {
			// but 4.1.2 still has problem with the clearRect method
			this._elCanvas.width = this._elCanvas.width;
		}
	},
	
	/**
	 * 캔버스 리사이즈
	 * 
	 * @param {Number} nWidth
	 * @param {Number} nHeight
	 * @param {Boolean} bExpand
	 */
	resize : function (nWidth, nHeight, bExpand) {
		var htSize = this._getLayerSize(nWidth, nHeight);

		if (bExpand) {
			this._elCanvas.style.width = nWidth + "px";
			this._elCanvas.style.height = nHeight + "px";
			var nRatioWidth = nWidth / this._oLayer.option("width");
			var nRatioHeight = nHeight / this._oLayer.option("height");			
			this._oEvent.setEventRatio(nRatioWidth, nRatioHeight);
		} else {
			var nCanvasWidth = typeof nWidth === 'number' ? htSize.width : this._elCanvas.width;
			var nCanvasHeight = typeof nHeight === 'number' ? htSize.height : this._elCanvas.height;
			this.clear(this._oContext);
			this._oLayer.setChanged();
			this._elCanvas.width = nCanvasWidth;
			this._elCanvas.height = nCanvasHeight;
			
			if (collie.Renderer.isRetinaDisplay()) {
				this._elCanvas.style.width = nCanvasWidth / 2 + "px";
				this._elCanvas.style.height = nCanvasHeight / 2 + "px";
			}
		}
	}
});
/**
 * DOM 방식의 렌더링
 * 
 * @private
 * @class collie.LayerDOM
 * @param {collie.Layer} oLayer
 */
collie.LayerDOM = collie.Class(/** @lends collie.LayerDOM.prototype */{
	/**
	 * @private
	 * @constructs
	 */
	$init : function (oLayer) {
		this._oLayer = oLayer;
		this._oEvent = oLayer.getEvent();
		this._htOption = oLayer.option();
		this._initElement();
		this._rxDisplayObjectId = new RegExp(collie.DisplayObjectDOM.ID + '([0-9]+)');
	},
	
	_initElement : function () {
		this._el = document.createElement("div");
		this._el.className = "_collie_layer";
		this._el.style.position = "absolute";
		this._el.style.left = this._htOption.x + "px";
		this._el.style.top = this._htOption.y + "px";
		this._el.style.width = this._htOption.width + "px";
		this._el.style.height = this._htOption.height + "px";
	},
	
	/**
	 * 부모를 탐색하면서 표시 객체 엘리먼트를 찾는다
	 * 
	 * @deprecated
	 * @private
	 * @param {HTMLElement} el
	 * @return {HTMLElement|Boolean}
	 */
	findDisplayObjectElement : function (el) {
		while (el && el.nodeType == 1) {
			if (this.isDisplayObjectElement(el) && el.parentNode === this._el) {
				return el;
			}
			
			el = el.parentNode;
		}
		
		return false;
	},
	
	/**
	 * 표시 객체 엘리먼트인 경우
	 * 
	 * @deprecated
	 * @private
	 * @param {HTMLElement} el
	 * @return {Boolean} 표시 객체 엘리먼트일 때 true
	 */
	isDisplayObjectElement : function (el) {
		if ("classList" in el) {
			return el.classList.contains(collie.DisplayObjectDOM.CLASSNAME);
		} else {
			return (" " + el.className + " ").indexOf(" " + collie.DisplayObjectDOM.CLASSNAME + " ") > -1;
		}
	},
	
	/**
	 * 현재 레이어 엘리먼트를 반환
	 * 
	 * @private
	 * @return {HTMLElement}
	 */
	getElement : function () {
		return this._el;
	},
	
	/**
	 * 화면을 갱신
	 * @private
	 */
	clear : function () {
		return true;		
	},
	
	/**
	 * 리사이즈
	 * @private
	 * @param {Number} nWidth 너비
	 * @param {Number} nHeight 높이
	 * @param {Boolean} bExpand 확장 여부
	 */
	resize : function (nWidth, nHeight, bExpand) {
		if (bExpand) {
			var nRatioWidth = nWidth / this._oLayer.option("width");
			var nRatioHeight = nHeight / this._oLayer.option("height");
			this._oEvent.setEventRatio(nRatioWidth, nRatioHeight);
			this._el.style[collie.util.getCSSPrefix("transform-origin", true)] = "0 0";
			
			if (collie.util.getSupportCSS3d()) {
				this._el.style[collie.util.getCSSPrefix("transform", true)] = "scale3d(" + nRatioWidth + ", " + nRatioHeight + ", 1)";
			} else if (collie.util.getSupportCSS3()) {
				this._el.style[collie.util.getCSSPrefix("transform", true)] = "scale(" + nRatioWidth + ", " + nRatioHeight + ")";
			} else {
				// support IE, This method is very heavy.
				this._el.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand',M11=" + nRatioWidth + ",M12=0,M21=0,M22=" + nRatioHeight + ");";
			}
		} else {
			this._el.style.width = nWidth + 'px';
			this._el.style.height = nHeight + 'px';
		}
	}
});
/**
 * 레이어 이벤트 처리
 * 
 * @class collie.LayerEvent
 * @param {collie.Layer} oLayer
 */
collie.LayerEvent = collie.Class(/** @lends collie.LayerEvent.prototype */{
	/**
	 * 클릭 탐지 값 (px)
	 * TODO Androind에서는 반응이 느껴질 수 있으므로 수치를 크게 하는 것이 좋다. (약 12정도?)
	 * @constant
	 */
	THRESHOLD_CLICK : 7,

	/**
	 * @constructs
	 */
	$init : function (oLayer) {
		this._oLayer = oLayer;
		this._bHasTouchEvent = !!('ontouchstart' in window);
		this._fOnEvent = this._onEvent.bind(this);
		this._oMousedownObject = null;
		this._htEventRatio = {
			width : 1,
			height : 1
		};
		this._bAttached = false;
	},
	
	/**
	 * @private
	 */
	attachEvent : function () {
		var el = this._oLayer.getParent();
		
		if (this._bHasTouchEvent) {
			collie.util.addEventListener(el, "touchstart", this._fOnEvent);
			collie.util.addEventListener(el, "touchend", this._fOnEvent);
			collie.util.addEventListener(el, "touchmove", this._fOnEvent);
			collie.util.addEventListener(el, "touchcancel", this._fOnEvent);
		} else {
			collie.util.addEventListener(el, "mousedown", this._fOnEvent);
			collie.util.addEventListener(el, "mouseup", this._fOnEvent);
			collie.util.addEventListener(el, "mousemove", this._fOnEvent);
		}
		
		this._bAttached = true;
	},
	
	/**
	 * @private
	 */
	detachEvent : function () {
		var el = this._oLayer.getParent();
		
		if (this._bAttached) {
			if (this._bHasTouchEvent) {
				collie.util.removeEventListener(el, "touchstart", this._fOnEvent);
				collie.util.removeEventListener(el, "touchend", this._fOnEvent);
				collie.util.removeEventListener(el, "touchmove", this._fOnEvent);
				collie.util.removeEventListener(el, "touchcancel", this._fOnEvent);
			} else {
				collie.util.removeEventListener(el, "mousedown", this._fOnEvent);
				collie.util.removeEventListener(el, "mouseup", this._fOnEvent);
				collie.util.removeEventListener(el, "mousemove", this._fOnEvent);
			}
			
			this._bAttached = false;
		}
	},
	
	/**
	 * 이벤트 핸들러
	 * @private
	 * @param {HTMLEvent} e
	 */
	_onEvent : function (e) {
		// 이벤트를 사용하지 않으면 무시
		if (!this._oLayer._htOption.useEvent) {
			return;
		}
		
		e = e || window.event;
		var oEvent = this._bHasTouchEvent ? e.changedTouches[0] : e || window.event;
		var el =  this._bHasTouchEvent ? this._getEventTargetElement(e) : e.target || e.srcElement;
		var oDocument = el.ownerDocument || document;
		var oBody = oDocument.body || oDocument.documentElement;
		var nPageX = this._bHasTouchEvent ? oEvent.pageX : oEvent.pageX || oEvent.clientX + oBody.scrollLeft - oDocument.body.clientLeft;
		var nPageY = this._bHasTouchEvent ? oEvent.pageY : oEvent.pageY || oEvent.clientY + oBody.scrollTop - oDocument.body.clientTop;
		var sType = e.type;
		var oDisplayObject = null;
		
		// 이벤트가 일어난 곳의 상대 좌표를 계산
		var htPosition = this._oLayer.getParentPosition();
		var nRelatedX = nPageX - htPosition.x - this._oLayer._htOption.x;
		var nRelatedY = nPageY - htPosition.y - this._oLayer._htOption.y;
		nRelatedX = nRelatedX / this._htEventRatio.width;		
		nRelatedY = nRelatedY / this._htEventRatio.height;		
		
		if (sType === "touchcancel") {
			if (this._htEventStartPos !== null) {
				nRelatedX = this._htEventStartPos.x;
				nRelatedY = this._htEventStartPos.y;
			}
		}
		
		sType = this._convertEventType(sType);
		
		// 기본 액션을 멈춘다(isPreventDefault 상태일 때만)
		if (sType === "mousemove" || sType === "mousedown") {
			if (collie.Renderer.isPreventDefault()) {
				collie.util.stopEventDefault(e);
			}
		}
		
		// 좌표 기록
		//@TODO 객체 재 사용 해야 함
		if (sType === "mousedown") {
			this._htEventStartPos = {
				x : nRelatedX,
				y : nRelatedY
			};
		}

		// Layer 표현 방식대로 이벤트를 발생한다
		var bFiredEventOnTarget = this._fireEvent(e, sType, nRelatedX, nRelatedY);
		
		// 클릭 처리
		if (sType === "mouseup") {
			// 탐지 영역도 resize에 맞춰서 변경한다
			var nThresholdX = this.THRESHOLD_CLICK;
			var nThresholdY = this.THRESHOLD_CLICK;
			
			if (
				this._htEventStartPos &&
				this._htEventStartPos.x - nThresholdX <= nRelatedX &&
				nRelatedX <= this._htEventStartPos.x + nThresholdX &&
				this._htEventStartPos.y - nThresholdY <= nRelatedY &&
				nRelatedY <= this._htEventStartPos.y + nThresholdY
				) {
				this._fireEvent(e, "click", nRelatedX, nRelatedY);
			}
			
			this._htEventStartPos = null;
		}
		
		// 이벤트 상태를 저장해서 다른 레이어에 표시객체 이벤트가 통과되지 않도록 방어한다
		collie.Renderer.setEventStatus(sType, bFiredEventOnTarget);
	},
	
	/**
	 * 레이어에서 이벤트가 일어났을 때 표시 객체에 이벤트를 발생 시킨다
	 * 
	 * @param {Object} e 이벤트 원본
	 * @param {String} sType 이벤트 타입, mouse 이벤트로 변형되서 들어온다
	 * @param {Number} nX 이벤트가 일어난 상대좌표
	 * @param {Number} nY 이벤트가 일어난 상대좌표
	 * @return {Boolean} 표시 객체에 이벤트가 발생했는지 여부 
	 * @private
	 */
	_fireEvent : function (e, sType, nX, nY) {
		var oDisplayObject = null;
		var bIsNotStoppedBubbling = true;
		
		// 캔버스에서 이전 레이어에 객체에 이벤트가 일어났으면 다음 레이어의 객체에 전달되지 않는다
		if (sType !== "mousemove" && !collie.Renderer.isStopEvent(sType)) {
			var aDisplayObjects = this._oLayer.getChildren();
			oDisplayObject = this._getTargetOnHitEvent(aDisplayObjects, nX, nY);
			
			// mousedown일 경우 객체를 저장한다
			if (oDisplayObject) {
				bIsNotStoppedBubbling = this._bubbleEvent(oDisplayObject, sType, e, nX, nY);
				
				if (sType === "mousedown") {
					this._setMousedownObject(oDisplayObject);
				}
				if (sType === "mouseup") {
					this._unsetMousedownObject(oDisplayObject);
				}
			}
		}
		
		// mouseup 처리가 안된 경우 임의 발생
		if (sType === "mouseup" && this._getMousedownObject() !== null) {
			oDisplayObject = this._getMousedownObject();
			this._bubbleEvent(oDisplayObject, sType, e, nX, nY);
			this._unsetMousedownObject(oDisplayObject);
		}
		
		/**
		 * click 이벤트, 모바일 환경일 때는 touchstart, touchend를 비교해서 좌표가 일정 이내로 움직였을 경우 click 이벤트를 발생한다d
		 * @name collie.Layer#click
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 상대 x좌표
		 * @param {Number} htEvent.y 상대 y좌표
		 */
		/**
		 * mousedown 이벤트, 모바일 환경일 때는 touchstart 이벤트도 해당 된다.
		 * @name collie.Layer#mousedown
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 상대 x좌표
		 * @param {Number} htEvent.y 상대 y좌표
		 */
		/**
		 * mouseup 이벤트, 모바일 환경일 때는 touchend 이벤트도 해당 된다.
		 * @name collie.Layer#mouseup
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 상대 x좌표
		 * @param {Number} htEvent.y 상대 y좌표
		 */
		/**
		 * mousemove 이벤트, 모바일 환경일 때는 touchmove 이벤트도 해당 된다.
		 * @name collie.Layer#mouseup
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 상대 x좌표
		 * @param {Number} htEvent.y 상대 y좌표
		 */
		if (bIsNotStoppedBubbling) { // stop되면 Layer이벤트도 일어나지 않는다
			this._oLayer.fireEvent(sType, {
				event : e,
				displayObject : oDisplayObject,
				x : nX,
				y : nY
			});
		}
		
		return !!oDisplayObject;
	},
	
	/**
	 * 이벤트 대상을 고른다
	 * - 가장 위에 있는 대상이 선정되어야 한다
	 * @private
	 * @param {Array|collie.DisplayObject} vDisplayObject
	 * @param {Number} nX 이벤트 상대 x 좌표
	 * @param {Number} nY 이벤트 상대 y 좌표
	 * @return {collie.DisplayObject|Boolean}
	 */
	_getTargetOnHitEvent : function (vDisplayObject, nX, nY) {
		var oTargetObject = null;
		
		if (vDisplayObject instanceof Array) {
			for (var i = vDisplayObject.length - 1; i >= 0; i--) {
				// 자식부터
				if (vDisplayObject[i].hasChild()) {
					oTargetObject = this._getTargetOnHitEvent(vDisplayObject[i].getChildren(), nX, nY);
					
					// 찾았으면 멈춤
					if (oTargetObject) {
						return oTargetObject;
					}
				}

				// 본인도
				oTargetObject = this._getTargetOnHitEvent(vDisplayObject[i], nX, nY);
				
				// 찾았으면 멈춤
				if (oTargetObject) {
					return oTargetObject;
				}
			}
		} else {
			return this._isPointInDisplayObjectBoundary(vDisplayObject, nX, nY) ? vDisplayObject : false;
		}
	},
	
	/**
	 * 이벤트명 보정
	 * 
	 * @private
	 * @param {String} sType 이벤트 타입
	 * @return {String} 변환된 이벤트 타입
	 */
	_convertEventType : function (sType) {
		var sConvertedType = sType;
		
		switch (sType) {
			case "touchstart" :
				sConvertedType = "mousedown";
				break;
				
			case "touchmove" :
				sConvertedType = "mousemove";
				break;
				
			case "touchend" :
			case "touchcancel" :
				sConvertedType = "mouseup";
				break;
				
			case "tap" :
				sConvertedType = "click";
				break;
		}
		
		return sConvertedType;
	},
	
	_getEventTargetElement : function (e) {
		var el = e.target;
		
		while (el.nodeType != 1) {
			el = el.parentNode;
		}
		
		return el;
	},
	
	/**
	 * 이벤트 대상의 이벤트를 버블링으로 처리 한다
	 * 
	 * @private
	 * @param {collie.DisplayObject} oDisplayObject 버블링 대상
	 * @param {String} sType 이벤트명
	 * @param {HTMLEvent} e
	 * @param {Number} nX 이벤트 상대 x 좌표
	 * @param {Number} nY 이벤트 상대 y 좌표
	 * @param {collie.DisplayObject} oCurrentObject 이벤트 대상
	 * @return {Boolean} 이벤트가 도중에 멈췄으면 false를 반환
	 */
	_bubbleEvent : function (oDisplayObject, sType, e, nX, nY, oCurrentObject) {
		/**
		 * click 이벤트, 모바일 환경일 때는 touchstart, touchend를 비교해서 좌표가 일정 이내로 움직였을 경우 click 이벤트를 발생한다d
		 * @name collie.DisplayObject#click
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 이벤트 상대 x 좌표
		 * @param {Number} htEvent.y 이벤트 상대 y 좌표
		 */
		/**
		 * mousedown 이벤트, 모바일 환경일 때는 touchstart 이벤트도 해당 된다.
		 * @name collie.DisplayObject#mousedown
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 이벤트 상대 x 좌표
		 * @param {Number} htEvent.y 이벤트 상대 y 좌표
		 */
		/**
		 * mouseup 이벤트, 모바일 환경일 때는 touchend 이벤트도 해당 된다.
		 * @name collie.DisplayObject#mouseup
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject 대상 객체
		 * @param {Event} htEvent.event 이벤트 객체
		 * @param {HTMLEvent} htEvent.event 이벤트 객체
		 * @param {Number} htEvent.x 이벤트 상대 x 좌표
		 * @param {Number} htEvent.y 이벤트 상대 y 좌표
		 */
		if (oDisplayObject.fireEvent(sType, { // stop() 하게 되면 버블링 멈춘다
			displayObject : oCurrentObject || oDisplayObject,
			event : e,
			x : nX,
			y : nY
		}) === false) {
			return false;
		}
		
		// 부모에 이벤트가 전달된다
		if (oDisplayObject.getParent() && !this._bubbleEvent(oDisplayObject.getParent(), sType, e, nX, nY, oDisplayObject)) {
			return false;
		}
		
		return true;
	},
	
	/**
	 * DisplayObject 범위 안에 PointX, PointY가 들어가는지 확인
	 * 
	 * @private
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Number} nPointX 확인할 포인트 X 좌표
	 * @param {Number} nPointY 확인할 포인트 Y 좌표
	 * @return {Boolean} 들어간다면 true
	 */
	_isPointInDisplayObjectBoundary : function (oDisplayObject, nPointX, nPointY) {
		// 안보이는 상태거나 이벤트를 받지 않는다면 지나감
		if (
			!oDisplayObject._htOption.useEvent ||
			!oDisplayObject._htOption.visible ||
			!oDisplayObject._htOption.width ||
			!oDisplayObject._htOption.height ||
			(oDisplayObject._htOption.useEvent === "auto" && !oDisplayObject.hasAttachedHandler())
			) {
			return false;
		}
		
		var htHitArea = oDisplayObject.getHitAreaBoundary();
		
		// 영역 안에 들어왔을 경우
		if (
			htHitArea.left <= nPointX && nPointX <= htHitArea.right &&
			htHitArea.top <= nPointY && nPointY <= htHitArea.bottom
		) {
			// hitArea 설정이 없으면 사각 영역으로 체크
			if (!oDisplayObject._htOption.hitArea) {
				return true;
			} else {
				var htPos = oDisplayObject.getRelatedPosition();
				
				// 대상 Point를 상대 좌표로 변경
				nPointX -= htPos.x;
				nPointY -= htPos.y;
				
				// transform 적용
				var aHitArea = oDisplayObject._htOption.hitArea;
				aHitArea = collie.Transform.points(oDisplayObject, aHitArea);
				return this._isPointInPolygon(aHitArea, nPointX, nPointY);
			}
		}
		
		return false;
	},
	
	/**
	 * 대상 Point가 폴리곤 안에 있는지 여부를 반환
	 *
	 * @private
	 * @param {Array} 꼭지점 모음 [[x1, y1], [x2, y2], ... ]
	 * @param {Number} nX 대상 점 x 좌표
	 * @param {Number} nY 대상 점 y 좌표
	 * @return {Boolean} true면 안에 있음
	 */
	_isPointInPolygon : function (aVertices, nX, nY) {
		var bIntersects = false;
		
		for (var i = 0, j = aVertices.length - 1, len = aVertices.length; i < len; j = i++) {
    		if (
    			(aVertices[i][1] > nY) !== (aVertices[j][1] > nY) &&
	 			(nX < (aVertices[j][0] - aVertices[i][0]) * (nY - aVertices[i][1]) / (aVertices[j][1] - aVertices[i][1]) + aVertices[i][0])
	 		) {
		       bIntersects = !bIntersects;
	 		}
		}
		
		return bIntersects;
	},
	
	/**
	 * mousedown 객체를 설정 한다
	 * 이 객체를 설정하면 mouseup 이벤트가 나왔을 때 해당 객체에서 하지 않더라도 해당 객체에 mouseup을 일으켜준다
	 * @param {collie.DisplayObject} oDisplayObject
	 * @private
	 */
	_setMousedownObject : function (oDisplayObject) {
		this._oMousedownObject = oDisplayObject;
	},
	
	/**
	 * 지정된 mousedown 객체를 해제 한다. 같은 객체여야만 해제 된다
	 * @private
	 */
	_unsetMousedownObject : function (oDisplayObject) {
		if (this._oMousedownObject === oDisplayObject) {
			this._oMousedownObject = null;
		}
	},
	
	/**
	 * mousedown 객체를 반환 한다
	 * @private
	 * @return {collie.DisplayObject}
	 */
	_getMousedownObject : function () {
		return this._oMousedownObject;
	},
	
	/**
	 * 이벤트 좌표 보정치를 설정 한다
	 * 
	 * @param {Number} nWidth
	 * @param {Number} nHeight
	 */
	setEventRatio : function (nWidth, nHeight) {
		this._htEventRatio.width = nWidth || this._htEventRatio.width;
		this._htEventRatio.height = nHeight || this._htEventRatio.height;
	},
	
	/**
	 * 이벤트 좌표 보정치가 있다면 반환 한다
	 * @private
	 * @deprecated
	 * @return {Object} htEventRatio
	 * @return {Number} htEventRatio.width
	 * @return {Number} htEventRatio.height
	 */
	getEventRatio : function () {
		return this._htEventRatio;
	}
});
/**
 * 표시 객체를 담고 있는 레이어, Stage 개념
 * @class collie.Layer
 * @extends collie.Component
 * @param {Object} [htOption]
 * @param {Number} [htOption.width=320] 너비 (px)
 * @param {Number} [htOption.height=480] 높이 (px)
 * @param {Number} [htOption.x=0] x좌표 (px)
 * @param {Number} [htOption.y=0] y좌표 (px)
 * @param {Boolean} [htOption.useEvent=true] 이벤트를 사용한다. 속도를 위해 현재 레이어에서 이벤트를 사용하지 않을 수 있다
 * @param {Boolean} [htOption.visible=true] 화면 표시 여부
 * @param {Boolean} [htOption.freeze=false] true로 설정하면 해당 레이어를 업데이트를 하지 않는다
 * @param {Boolean} [htOption.renderingMode=inherit] 레이어 별로 렌더링 모드를 설정 함 [inherit|dom|canvas]
 */
collie.Layer = collie.Class(/** @lends collie.Layer.prototype */{
	/**
	 * 클래스 타입
	 * @type {String}
	 */
	type : "layer",
	
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this.option({
			x : 0,
			y : 0,
			width : 320, // 너비
			height : 480, // 높이
			useEvent : true,
			visible : true,
			freeze : false,
			renderingMode : "inherit"
		});
		
		// 정렬을 해야한다면 일단 0으로 만들어 놓고 load될 때 정렬함
		this._sAlignLeft = null;
		this._sAlignTop = null;
		
		
		if (htOption !== undefined) {
			if (("x" in htOption) && (htOption.x === "left" || htOption.x === "right" || htOption.x === "center")) {
				this._sAlignLeft = htOption.x;
				htOption.x = 0;
			}
			 
			if (("y" in htOption) && (htOption.y === "top" || htOption.y === "bottom" || htOption.y === "center")) {
				this._sAlignTop = htOption.y;
				htOption.y = 0;
			}
			
			this.option(htOption);
		}
		
		this._renderingMode = this._htOption.renderingMode === "inherit" ? collie.Renderer.getRenderingMode() : this._htOption.renderingMode;
		
		if (this._renderingMode === "canvas" && !collie.util.getDeviceInfo().supportCanvas) {
			this._renderingMode = "dom";
		}
		
		this.drawCount = 0; // debugging 용 draw count
		this.optionSetter("visible", this._setVisible.bind(this)); // 처음 set은 Drawing이 생성된 후에 실행 된다
		this._elParent = null;
		this._bChanged = false;
		this._aDisplayObjects = [];
		this._bLoaded = false;
		this._oEvent = new collie.LayerEvent(this);
		this._makeDrawing();
		this._setVisible();
	},
	
	/**
	 * 렌더링 방법을 선택해서 Drawing 객체를 생성 한다
	 * @private
	 */
	_makeDrawing : function () {
		this._oDrawing = this._renderingMode === "dom" ? new collie.LayerDOM(this) : new collie.LayerCanvas(this);
	},
	
	/**
	 * 드로잉 객체를 반환 한다
	 * @return {collie.LayerCanvas|collie.LayerDOM}
	 */
	getDrawing : function () {
		return this._oDrawing;
	},
	
	/**
	 * 현재 레이어의 렌더링 모드를 반환
	 * 
	 * @return {String} [dom|canvas]
	 */
	getRenderingMode : function () {
		return this._renderingMode;
	},
	
	/**
	 * 이벤트 객체를 반환 한다
	 * @return {collie.LayerEvent}
	 */
	getEvent : function () {
		return this._oEvent;
	},
	
	/**
	 * 부모를 반환
	 * 
	 * @return {HTMLElement}
	 */
	getParent : function () {
		return this._elParent || false;
	},
	
	/**
	 * 컨테이너에 엘리먼트 추가. 렌더러에서 load할 때 실행 된다
	 * - 로드할 때 가장 큰 레이어를 기준으로 컨테이너의 크기를 정함
	 * 
	 * @private
	 * @param {HTMLElement} elParent
	 * @param {Number} nZIndex
	 */
	load : function (elParent, nZIndex) {
		this.unload();
		this._bLoaded = true;
		this._elParent = this._elParent || elParent;
		this._elParent.style.width = Math.max(parseInt(this._elParent.style.width || 0, 10), this.option("width")) + "px";
		this._elParent.style.height = Math.max(parseInt(this._elParent.style.height || 0, 10), this.option("height")) + "px";
		this.getElement().style.zIndex = nZIndex;
		
		// 생성자 옵션에 정렬이 포함돼 있으면 load, unload를 반복하더라도 정렬을 계속한다.
		// 하지만 사용자가 직접 offset을 사용하는 경우에는 reset되도록 세 번째 인자를 통해 조치한다.
		if (this._sAlignLeft !== null) {
			this.offset(this._sAlignLeft, null, true);
		}
		
		if (this._sAlignTop !== null) {
			this.offset(null, this._sAlignTop, true);
		}
		
		this._elParent.appendChild(this.getElement());
	},
	
	/**
	 * @private
	 */
	unload : function () {
		if (this.isLoaded()) {
			this._oEvent.detachEvent();
			this._elParent.removeChild(this.getElement());
			this._elParent = null;
			this._bLoaded = false;
		}
	},
	
	/**
	 * Layer의 attach Event를 순서 조작을 위해 Layer가 하지 않고 Renderer가 한다
	 * - 개발용
	 * @private
	 */
	attachEvent : function () {
		this._oEvent.attachEvent();
	},
	
	/**
	 * Layer의 detach Event를 순서 조작을 위해 Layer가 하지 않고 Renderer가 한다
	 * - 개발용
	 * @private
	 */
	detachEvent : function () {
		this._oEvent.detachEvent();
	},
	
	/**
	 * CSS의 display 속성과 유사
	 * @private
	 */
	_setVisible : function () {
		// Drawing이 생성되기 전에 옵션이 설정될 수도 있음
		if (this.getElement()) {
			this.getElement().style.display = this.option("visible") ? "block" : "none";
		}
	},
	
	/**
	 * @private
	 * @return {Boolean} 로딩 되어있는지 여부
	 */
	isLoaded : function () {
		return this._bLoaded;
	},
	
	/**
	 * 자식으로 DisplayObject를 추가한다
	 * 
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Boolean} bSkipSort 정렬이나 기타 처리를 스킵한다. private용
	 */
	addChild : function (oDisplayObject) {
		// 추가할 때마다 정렬하기
		collie.util.pushWithSort(this._aDisplayObjects, oDisplayObject);
		oDisplayObject.setLayer(this);
		this.setChanged();
	},
	
	/**
	 * 배열로 자식을 여러개 한꺼번에 넣는다. 속도 측면에서 한개씩 넣는 것 보다 이득이다
	 * 
	 * @param {Array} aList DisplayObject 배열
	 */
	addChildren : function (aList) {
		for (var i = 0, len = aList.length; i < len; i++) {
			this.addChild(aList[i]);
		}
	},
	
	/**
	 * 자식에서 제거한다
	 * 
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Number} nIdx 인덱스 번호를 알고 있다면 인덱스 번호를 지정
	 */
	removeChild : function (oDisplayObject, nIdx) {
		oDisplayObject.unsetLayer();
		
		if (typeof nIdx !== "undefined") {
			this._aDisplayObjects.splice(nIdx, 1);
		} else {
			for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
				if (this._aDisplayObjects[i] === oDisplayObject) {
					this._aDisplayObjects.splice(i, 1);
					break;
				}
			}
		}
		
		this.setChanged();
	},
	
	/**
	 * 목록을 받아서 자식에서 제거한다
	 *
	 * @param {Array} aList
	 */
	removeChildren : function (aList) {
		for (var i = aList.length - 1; i >= 0; i--) {
			if (aList[i]) {
				this.removeChild(aList[i], i);
			}
		}
	},
	
	/**
	 * 렌더러에 레이어를 추가한다 (DisplayObject와 유사)
	 * @TODO 추후 collie.Renderer가 다중 인스턴스가 될 경우 파라미터를 넣읋 수 있음
	 * @example before
	 * var layer = new collie.Layer();
	 * collie.Renderer.addLayer(layer);
	 * @example after
	 * var layer = new collie.Layer().addTo();
	 * 
	 * @param {collie.Renderer} [oRenderer] 추가될 렌더러를 지정, 없으면 collie.Renderer를 기본으로 한다
	 * @return {collie.Layer} 자기 자신을 반환
	 */
	addTo : function (oRenderer) {
		oRenderer = oRenderer || collie.Renderer;
		oRenderer.addLayer(this);
		return this;
	},
	
	/**
	 * zIndex가 변경되었다면 이 메소드를 호출
	 * 
	 * @private
	 * @param {collie.DisplayObject} oDisplayObject
	 */
	changeDisplayObjectZIndex : function (oDisplayObject) {
		this.removeChild(oDisplayObject);
		this.addChild(oDisplayObject);
	},
	
	/**
	 * 자식을 반환 한다
	 * 
	 * @return {Array}
	 */
	getChildren : function () {
		return this._aDisplayObjects;
	},
	
	/**
	 * 자식이 있는지 여부를 반환
	 * 
	 * @return {Boolean} true면 자식이 있음
	 */
	hasChild : function () {
		return this._aDisplayObjects && this._aDisplayObjects.length > 0;
	},
	
	/**
	 * 변경된 사항이 있을 경우 DisplayObject에서 Layer에 setChanged를 해서 알린다. setChange된 레이어만 그리기 대상
	 * 
	 * @private
	 */
	setChanged : function () {
		this._bChanged = true;
	},
	
	/**
	 * 변경된 내용이 있는지 여부를 반환
	 * 
	 * @return {Boolean} true면 변경된 점 있음
	 */
	isChanged : function () {
		return this._bChanged;
	},
	
	/**
	 * 변경되지 않은 상태로 되돌린다
	 * 
	 * @private
	 */
	unsetChanged : function () {
		this._bChanged = false;
	},
	
	/**
	 * Canvas Context를 반환
	 * 
	 * @return {Boolean|Object}
	 */
	getContext : function () {
		return ("getContext" in this._oDrawing) ? this._oDrawing.getContext() : false;
	},
	
	/**
	 * 레이어의 엘리먼트를 반환
	 * @return {HTMLElement}
	 */
	getElement : function () {
		return ("getElement" in this._oDrawing) ? this._oDrawing.getElement() : false;
	},
	
	/**
	 * Layer에 등록된 DisplayObject를 업데이트
	 * 
	 * @private
	 * @param {Number} nFrameDuration 진행된 프레임 시간
	 */
	update : function (nFrameDuration) {
		this.drawCount = 0;
		
		// 바뀐게 없으면 지나감
		if (!this.isChanged() || this.option("freeze")) {
			return;
		}
		
		this.clear();
		this.unsetChanged();
		var nWidth = this.option("width");
		var nHeight = this.option("height");
		
		// 등록된 객체 업데이트
		for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
			this._aDisplayObjects[i].update(nFrameDuration, 0, 0, nWidth, nHeight);
		}
	},
	
	/**
	 * 화면을 지운다. Canvas일 때만 작동
	 */
	clear : function () {
		this._oDrawing.clear();
	},
	
	/**
	 * 레이어의 크기를 변경 한다
	 * 모든 레이어의 크기를 변경하고 싶은 경우 Renderer의 resize를 이용한다
	 * 
	 * @param {Number} nWidth 너비
	 * @param {Number} nHeight 높이
	 * @param {Boolean} bExpand 확장 여부
	 * @see collie.Renderer#resize
	 */ 
	resize : function (nWidth, nHeight, bExpand) {
		if (!bExpand) {
			this.option("width", nWidth || this._htOption.width);
			this.option("height", nHeight || this._htOption.height);
		}
		
		if (this._oDrawing) {
			this._oDrawing.resize(nWidth, nHeight, bExpand);
		}
		
		if (this._elParent) {
			this._elParent.style.width = Math.max(parseInt(this._elParent.style.width || 0, 10), nWidth || this.option("width")) + "px";
			this._elParent.style.height = Math.max(parseInt(this._elParent.style.height || 0, 10), nHeight || this.option("height")) + "px";
		}
		
		/**
		 * resize 메서드가 실행될 때 발생
		 * @event
		 * @name collie.Layer#resize
		 */
		this.fireEvent("resize");
	},
	
	/**
	 * 레이어의 위치를 변경 한다
	 * 레이어의 부모의 크기는 등록된 레이어 중 가장 큰 레이어의 크기에 맞게 변경된다.
	 * 
	 * @param {Number|String} [nX] x좌표(px), left, right, center를 입력하면 Renderer의 크기 기준으로 정렬된다. 렌더러의 크기가 변하더라도 자동으로 움직이지 않는다.
	 * @param {Number|String} [nY] y좌표(px), top, bottom, center를 입력하면 Renderer의 크기 기준으로 정렬된다. 렌더러의 크기가 변하더라도 자동으로 움직이지 않는다.
	 * @param {Boolean} [bSkipResetInitAlign] private용 변수, 직접 쓰지 않는다.
	 */
	offset : function (nX, nY, bSkipResetInitAlign) {
		var el = this.getElement();
		
		if (typeof nX !== "undefined" && nX !== null) {
			switch (nX) {
				case "left" :
					nX = 0;
					break;
					
				case "right" :
					nX = parseInt(this._elParent.style.width, 10) - this._htOption.width;
					break;
					
				case "center" :
					nX = parseInt(this._elParent.style.width, 10) / 2 - this._htOption.width / 2;
					break;
			}
			
			this.option("x", nX);
			el.style.left = nX + "px";
			
			if (!bSkipResetInitAlign) {
				this._sAlignLeft = null;
			}
		}
		
		if (typeof nY !== "undefined" && nY !== null) {
			switch (nY) {
				case "top" :
					nY = 0;
					break;
					
				case "bottom" :
					nY = parseInt(this._elParent.style.height, 10) - this._htOption.height;
					break;
					
				case "center" :
					nY = parseInt(this._elParent.style.height, 10) / 2 - this._htOption.height / 2;
					break;
			}
			
			this.option("y", nY);
			el.style.top = nY + "px";
			
			if (!bSkipResetInitAlign) {
				this._sAlignTop = null;
			}
		}
	},
	
	/**
	 * 고민 중... 부모를 렌더러가 아닌 다른 엘리먼트에 붙이는 행위
	 * 
	 * @param {HTMLElement} elParent
	 */
	setParent : function (elParent) {
		if (this._bLoaded) {
			this._oEvent.detachEvent();
			this._elParent.removeChild(this.getElement());
			this._elParent = elParent;
			this._elParent.appendChild(this.getElement());
			this._oEvent.attachEvent();
		} else {
			this._elParent = elParent;
		}
	},
	
	/**
	 * @private
	 * @return {Object}
	 */
	getParentPosition : function () {
		if (this._elParent !== null) {
			return this._elParent === collie.Renderer.getElement() ? collie.Renderer.getPosition() : collie.util.getPosition(this._elParent);
		}
	},
	
	/**
	 * 레이어를 복사
	 * 
	 * @param {Boolean} bRecursive 등록돼 있는 객체까지 복사할지 여부
	 * @return {collie.Layer}
	 */
	clone : function (bRecursive) {
		var oLayer = new this.constructor(this._htOption);
		
		if (bRecursive && this._aDisplayObjects.length) {
			for (var i = 0, l = this._aDisplayObjects.length; i < l; i++) {
				this._aDisplayObjects[i].clone(true).addTo(oLayer);
			}
		}
		
		return oLayer;
	}
}, collie.Component);
/**
 * Canvas에 객체를 그릴 경우 사용할 Drawing 클래스
 * - 직접 사용되지 않는 클래스
 * 
 * @private
 * @class collie.DisplayObjectCanvas
 * @param {collie.DisplayObject} oDisplayObject
 */
collie.DisplayObjectCanvas = collie.Class(/** @lends collie.DisplayObjectCanvas.prototype */{
	/**
	 * @private
	 * @constructs
	 */
	$init : function (oDisplayObject) {
		this._oDisplayObject = oDisplayObject;
		this._bUseCache = false;
		this._oDebugHitArea = null;
		this._htEvent = {};
		this._oLayer = null;
		this._htInfo = this._oDisplayObject.get();
		this._bIsRetinaDisplay = null;
		
		// 캐시 사용
		if (this._htInfo.useCache) {
			this.loadCache();
		}
	},

	/**
	 * 캔버스 캐시 사용
	 * 
	 * @private
	 */
	loadCache : function () {
		if (!this._bUseCache) {
			this._bUseCache = true;
			this._elCache = document.createElement("canvas");
			this._elCache.width = this._htInfo.width;
			this._elCache.height = this._htInfo.height;
			this._oContextCache = this._elCache.getContext("2d");
		}
	},
	
	/**
	 * 캔버스 버퍼 해제
	 * @private
	 */
	unloadCache : function () {
		if (this._bUseCache) {
			this._oContextCache = null;
			this._elCache = null;
			this._bUseCache = false;
		}
	},

	/**
	 * 버퍼를 비움
	 * @private
	 */
	clearCache : function () {
		if (this._bUseCache) {
			this._oContextCache.clearRect(0, 0, this._elCache.width, this._elCache.height);
			this._elCache.width = this._htInfo.width * (this._bIsRetinaDisplay ? 2 : 1);
			this._elCache.height = this._htInfo.height * (this._bIsRetinaDisplay ? 2 : 1);
		}
	},
		
	/**
	 * 이미지를 그린다
	 * - 인자는 drawImage의 첫번째만 다른 인자
	 * 직접 호출하지 않음
	 * @private
	 * @param {CanvasRenderingContext2D} oContext canvas Context
	 * @param {Number} sx
	 * @param {Number} sy
	 * @param {Number} sw
	 * @param {Number} sh
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} dw
	 * @param {Number} dh
	 */
	drawImage : function (oContext, sx, sy, sw, sh, dx, dy, dw, dh) {
		var oSource = this._oDisplayObject.getImage();
		var nImageWidth = this._oDisplayObject._nImageWidth; //TODO 임시
		var nImageHeight = this._oDisplayObject._nImageHeight;
		
		// 레티나 디스플레이일 경우 두배씩 증가
		if (collie.Renderer.isRetinaDisplay()) {
			for (i = 1, len = arguments.length; i < len; i++) {
				arguments[i] *= 2;
			}
			
			nImageWidth *= 2;
			nImageHeight *= 2;
		}
		
		try {
			oContext.drawImage(oSource, sx, sy, sw, sh, dx, dy, dw, dh);
		} catch (e) {
			throw new Error('invalid drawImage value : ' + sx + ',' + sy + ',' + sw + ',' + sh + ',' + dx + ',' + dy + ',' + dw + ',' + dh + ',' + this._oDisplayObject.getImage().src + ', original : ' + this._oDisplayObject.getImage().width + ',' + this._oDisplayObject.getImage().height + ',source : ' + oSource.width + ',' + oSource.height + ', isCached : ' + (this._elImageCached !== null ? 'true' : 'false'));
		}
	},
	
	/**
	 * Layer에 붙을 때 실행
	 * 
	 * @private
	 */
	load : function () {
		this._oLayer = this._oDisplayObject.getLayer();
		this._oContext = this._oDisplayObject.getLayer().getContext();
		this._bIsRetinaDisplay = collie.Renderer.isRetinaDisplay();
	},
	
	/**
	 * Layer에서 빠질 때
	 * 
	 * @private
	 */
	unload : function () {
		this._oLayer = null;
		this._oContext = null;
	},
	
	/**
	 * 그리기
	 * 
	 * @param {Number} nFrameDuration 진행된 프레임 시간
	 * @param {Number} nX 객체의 절대 x좌표
	 * @param {Number} nY 객체의 절대 y좌표
	 * @param {Number} nLayerWidth 레이어 너비, update는 tick안에 있는 로직이기 때문에 성능 극대화를 위해 전달
	 * @param {Number} nLayerHeight 레이어 높이 
	 * @param {Object} oContext Canvas Context, 없으면 기본 Context를 사용. 부모의 버퍼 Context를 물려 받을 때 사용
	 * @private
	 */
	draw : function (nFrameDuration, nX, nY, nLayerWidth, nLayerHeight, oContext) {
		var bUseParentContext = oContext ? true : false;
		oContext = oContext || this._oContext;
		var oTargetContext = this._bUseCache ? this._oContextCache : oContext; 
		var oParentContext = oContext;
		var htInfo = this._htInfo;
		var htDirty = this._oDisplayObject.getDirty();
		var htOrigin = this._oDisplayObject.getOrigin();
		var nTargetWidth = htInfo.width; 
		var nTargetHeight = htInfo.height;
		var nOriginX = htOrigin.x;
		var nOriginY = htOrigin.y;
		var nSavedX = nX;
		var nSavedY = nY;
		var nRatio = (this._bIsRetinaDisplay ? 2 : 1);
		var nSavedXRatio = nX * nRatio;
		var nSavedYRatio = nY * nRatio;
		var nSavedOpacity = 0;
		var bUseTransform = false;
		var oTransformContext = oContext;
		
		// 캐시를 사용 중이면 oContext 값을 자신의 버퍼로 변경
		if (htInfo.useCache) {
			oContext = this._oContextCache;
		}
		
		// 레티나 디스플레이 대응
		if (this._bIsRetinaDisplay) {
			nX *= 2;
			nY *= 2;
			nOriginX *= 2;
			nOriginY *= 2;
			nTargetWidth *= 2;
			nTargetHeight *= 2; 
		}
		
		// transform 값을 써야할 경우에만 사용
		if (this._bUseCache || htInfo.scaleX !== 1 || htInfo.scaleY !== 1 || htInfo.angle !== 0 || htInfo.opacity !== 1) {
			bUseTransform = true;
			
			if (this._bUseCache) {
				oTransformContext = !bUseParentContext ? this._oContext : oParentContext;
			}
			
			oTransformContext.save();
			oTransformContext.translate(nX + nOriginX, nY + nOriginY);
		
			if (htInfo.opacity !== 1) {
				nSavedOpacity = oTransformContext.globalAlpha;
				oTransformContext.globalAlpha = oTransformContext.globalAlpha === 0 ? htInfo.opacity : oTransformContext.globalAlpha * htInfo.opacity;
			}
			
			if (htInfo.angle !== 0) {
				oTransformContext.rotate(collie.util.toRad(htInfo.angle));
			}
			
			if (htInfo.scaleX !== 1 || htInfo.scaleY !== 1) {
				oTransformContext.scale(htInfo.scaleX, htInfo.scaleY);
			}
			
			oTransformContext.translate(-nOriginX, -nOriginY);
			nX = nY = 0;
		}
		
		// 이벤트 객체 재사용
		this._htEvent.displayObject = this;
		this._htEvent.context = oTargetContext;
		this._htEvent.x = nX;
		this._htEvent.y = nY;
		
		// 캐시를 사용하지 않거나 변경되었을 때만 처리
		if (!this._bUseCache || (this._oDisplayObject.isChanged() && !this._oDisplayObject.isChanged(true))) {
			// 캐시 그리기 전에 비워줌
			this.clearCache();
			
			// 배경색 처리
			if (htInfo.backgroundColor) {
				oTargetContext.fillStyle = htInfo.backgroundColor;
				oTargetContext.fillRect(nX, nY, nTargetWidth, nTargetHeight);
			}
			
			if (this._oDisplayObject.getImage()) {
				var elSourceImage = this._oDisplayObject.getImage();
				var htImageSize = this._oDisplayObject.getImageSize();
				
				// 반복 처리
				if (htInfo.backgroundRepeat && htInfo.backgroundRepeat !== 'no-repeat') {
					var nCountWidth = (htInfo.backgroundRepeat === 'repeat' || htInfo.backgroundRepeat === 'repeat-x') ? Math.ceil(htInfo.width / htImageSize.width) : 1;
					var nCountHeight = (htInfo.backgroundRepeat === 'repeat' || htInfo.backgroundRepeat === 'repeat-y') ? Math.ceil(htInfo.height / htImageSize.height) : 1;
					
					// 이미지 반복 처리
					if (nCountWidth > 0 || nCountHeight > 0) {
						for (var nLeftOffset = 0; nLeftOffset < nCountWidth; nLeftOffset++) {
							for (var nTopOffset = 0; nTopOffset < nCountHeight; nTopOffset++) {
								var nOffsetX = nLeftOffset * htImageSize.width + htImageSize.width;
								var nOffsetY = nTopOffset * htImageSize.height + htImageSize.height;
								var nPieceWidth = nOffsetX > htInfo.width ? htImageSize.width - (nOffsetX - htInfo.width) : htImageSize.width;
								var nPieceHeight = nOffsetY > htInfo.height ? htImageSize.height - (nOffsetY - htInfo.height) : htImageSize.height;
								
								this.drawImage(
									oTargetContext,
									0,
									0,
									nPieceWidth,
									nPieceHeight,
									(nX / nRatio) + nLeftOffset * htImageSize.width,
									(nY / nRatio) + nTopOffset * htImageSize.height,
									nPieceWidth,
									nPieceHeight
								);
							}
						}
					}
				} else {
					var nDrawingWidth = Math.min(htImageSize.width, htInfo.width);
					var nDrawingHeight = Math.min(htImageSize.height, htInfo.height);
					
					//TODO 사이트 이펙트 디바이스 테스트 해야 함 1.0.8
					this.drawImage(
						oTargetContext,
						htInfo.offsetX,
						htInfo.offsetY,
						htInfo.fitImage ? htImageSize.width : nDrawingWidth,
						htInfo.fitImage ? htImageSize.height : nDrawingHeight,
						nX / nRatio, //TODO floating value 어떻게 해야할까... 처리하면 계단현상 생김
						nY / nRatio,
						htInfo.fitImage ? htInfo.width : nDrawingWidth,
						htInfo.fitImage ? htInfo.height : nDrawingHeight
					);
				}
			}
			
			/**
			 * Delegate
			 * @name collie.DisplayObject#onCanvasDraw
			 * @event
			 * @delegate
			 * @param {Object} htEvent
			 * @param {collie.DisplayObject} htEvent.displayObject
			 * @param {Object} htEvent.context 캔버스 Context 객체
			 * @param {Number} htEvent.x 상대 x좌표
			 * @param {Number} htEvent.y 상대 y좌표
			 */
			if ("onCanvasDraw" in this._oDisplayObject) {
				this._oDisplayObject.onCanvasDraw(this._htEvent);
			}
		}
		
		// hitArea 그리기
		if (htInfo.debugHitArea && htInfo.hitArea) {
			if (this._oDebugHitArea === null) {
				this._oDebugHitArea = new collie.Polyline({
					x : 0,
					y : 0,
					width : htInfo.width,
					height : htInfo.height,
					strokeColor : htInfo.debugHitArea === true ? "yellow" : htInfo.debugHitArea,
					strokeWidth : 3
				}).addTo(this._oDisplayObject);
				this._oDebugHitArea.setPointData(htInfo.hitArea);
			}
		}
		
		// 자식에게 전파
		// 부모에게서 Context를 물려 받았거나, 자신이 useCache를 사용하고 있다면 자식에게 Context를 물려줌. 부모의 설정이 우선시 됨
		if (this._oDisplayObject.hasChild() && (!htInfo.useCache || (this._oDisplayObject.isChanged() && !this._oDisplayObject.isChanged(true)))) {
			var aDisplayObjects = this._oDisplayObject.getChildren();
			
			for (var i = 0, len = aDisplayObjects.length; i < len; i++) {
				aDisplayObjects[i].update(
					nFrameDuration,
					// 0,
					// 0,
					// htInfo.useCache ? 0 : nSavedX, // cache를 사용하면 현재 기준으로 절대 좌표를 넘김
					// htInfo.useCache ? 0 : nSavedY,
					htInfo.useCache || bUseTransform ? 0 : nSavedX, // cache를 사용하면 현재 기준으로 절대 좌표를 넘김
					htInfo.useCache || bUseTransform ? 0 : nSavedY,
					nLayerWidth,
					nLayerHeight,
					bUseParentContext || htInfo.useCache ? oContext : null
				);
				aDisplayObjects[i].unsetChanged();
				aDisplayObjects[i]._resetDirty();
			}
		}
		
		// 캐시 기능을 사용하면 자식까지 그린 후에 자기를 그림
		if (htInfo.useCache) {
			// (bUseParentContext ? oParentContext : this._oContext).drawImage(oContext.canvas, nSavedXRatio, nSavedYRatio);
			// (bUseParentContext ? oParentContext : this._oContext).drawImage(oContext.canvas, bUseParentContext ? nSavedXRatio : 0, bUseParentContext ? nSavedYRatio : 0);
			(bUseParentContext ? oParentContext : this._oContext).drawImage(oContext.canvas, 0, 0);
		}
		
		this._oLayer.drawCount++;

		// 원위치
		if (bUseTransform) {
			oTransformContext.restore();
		}
	}
});
/**
 * DisplayObject의 DOM 표시 부분
 * @todo 갤럭시 넥서스 ICS에서 CSS3d rotate 사용 시 overflow boundary가 잘못되는 문제점이 있어서 그 부분만 css2d로 동작하도록 변경 했지만, 렌더링 속도가 2d, 3d 차이나는 버그가 남아 있음.
 * @private
 * @class collie.DisplayObjectDOM
 * @param {collie.DisplayObject} oDisplayObject
 */
collie.DisplayObjectDOM = collie.Class(/** @lends collie.DisplayObjectDOM.prototype */{
	/**
	 * @private
	 * @constructs
	 */
	$init : function (oDisplayObject) {
		this._oDisplayObject = oDisplayObject;
		this._htInfo = this._oDisplayObject.get();
		this._oLayer = null;
		this._elImage = null;
		this._aTransformValue = [];
		this._sTransformValue = null;
		this._sTransform = collie.util.getCSSPrefix("transform", true);
		this._sOrigin = collie.util.getCSSPrefix("transform-origin", true);
		this._bSupportCSS3 = collie.util.getSupportCSS3();
		this._bSupportCSS3d = collie.util.getSupportCSS3d();
		this._bUseTransform = this._bSupportCSS3 || this._bSupportCSS3d;
		this._htDeviceInfo = collie.util.getDeviceInfo();
		this._bIsAndroid = !!this._htDeviceInfo.android;
		this._nAndroidVersion = this._htDeviceInfo.android;
		this._bIsIEUnder8 = this._htDeviceInfo.ie && this._htDeviceInfo.ie < 9;
		this._bUseTranslateZ = true;
		this._bIsRetinaDisplay = null;
		this._htEvent = {};
		this._oEmptyObject = {};
		this._sCacheTransformValue = null;
		this._initElement();
	},
	
	_initElement : function () {
		// container
		this._elContainer = document.createElement("div");
		this._elContainer.id = collie.DisplayObjectDOM.ID + this._oDisplayObject.getId() + (this._htInfo.name ? "_" + this._htInfo.name : "");
		this._elContainer.className = collie.DisplayObjectDOM.CLASSNAME;
		this._elContainerStyle = this._elContainer.style;
		this._elContainerStyle.position = "absolute";
		
		// IE의 경우 크기가 정해져 있지 않으면 filter가 정상적으로 작동하지 않음
		if (this._bIsIEUnder8) {
			this._elContainerStyle.width = this._htInfo.width + "px";
			this._elContainerStyle.height = this._htInfo.height + "px"; 
		}
		
		// element
		this._el = document.createElement("div");
		this._elStyle = this._el.style;
		
		if (this._bSupportCSS3d) {
			this._elStyle[this._sTransform] = "translateZ(0)";
		}
		
		this._elStyle.position = "absolute";
		this._elStyle.width = this._htInfo.width + "px";
		this._elStyle.height = this._htInfo.height + "px";
		this._elStyle.overflow = "hidden";
		this._elContainer.appendChild(this._el);
	},
		
	load : function () {
		this._oLayer = this._oDisplayObject.getLayer();
		
		// 부모가 있으면 부모 엘리먼트에 직접 붙임
		if (this._oDisplayObject.getParent()) {
			this._oDisplayObject.getParent().getDrawing().getElement().appendChild(this._elContainer);
		} else {
			this._oLayer.getElement().appendChild(this._elContainer);
		}
		
		this._bIsRetinaDisplay = collie.Renderer.isRetinaDisplay();
	},
	
	unload : function () {
		this._oLayer = null;
		this._elContainer.parentNode.removeChild(this._elContainer);
	},
	
	/**
	 * 현재 객체의 엘리먼트를 반환
	 * 
	 * @return {HTMLElement}
	 */
	getElement : function () {
		return this._elContainer;
	},
	
	/**
	 * 현재 객체의 아이템 엘리먼트를 반환
	 * 
	 * @return {HTMLElement}
	 */
	getItemElement : function () {
		return this._el;
	},
	
	/**
	 * 그리기
	 * 
	 * @private
	 * @param {Number} nFrameDuration 진행된 프레임 시간
	 * @param {Number} nX 객체의 절대 x좌표
	 * @param {Number} nY 객체의 절대 y좌표
	 * @param {Number} nLayerWidth 레이어 너비, update는 tick안에 있는 로직이기 때문에 성능 극대화를 위해 전달
	 * @param {Number} nLayerHeight 레이어 높이
	 */
	draw : function (nFrameDuration, nX, nY, nLayerWidth, nLayerHeight) {
		// 객체 재사용
		this._htEvent.displayObject = this;
		this._htEvent.element = this._el;
		this._htEvent.x = nX;
		this._htEvent.y = nY;
		
		var htInfo = this._htInfo;
		var htDirty = this._oDisplayObject.getDirty() || this._oEmptyObject;
		var htOrigin = this._oDisplayObject.getOrigin();
		var nRatio = (this._bIsRetinaDisplay ? 2 : 1);
		
		if (htDirty.visible) {
			this._elContainerStyle.display = htInfo.visible ? "block" : "none";
		}
		
		if (htDirty.width) {
			this._elStyle.width = htInfo.width + "px";
			
			if (this._bIsIEUnder8) {
				this._elContainerStyle.width = htInfo.width + "px";
			}
		}
		
		if (htDirty.height) {
			this._elStyle.height = htInfo.height + "px";
		}
		
		if (htDirty.opacity) {
			if (this._bIsIEUnder8) {
				this._elContainerStyle.filter = "alpha(opacity=" + (htInfo.opacity * 100) + ")";
			} else {
				this._elContainerStyle.opacity = htInfo.opacity;
				
				// Androind 4.1 workaround
				// TODO Androind 4.2에서 없어졌는지 확인해봐야 함
				if (this._elImage && this._nAndroidVersion && this._nAndroidVersion >= 4.1) {
					this._elImage.style.opacity = htInfo.opacity;
				}
			}
		}
		
		if (htDirty.zIndex) {
			this._elContainerStyle.zIndex = htInfo.zIndex;
		}
		
		if (htDirty.backgroundColor) {
			this._elStyle.backgroundColor = htInfo.backgroundColor;
		}
		
		// 이동
		// transform은 여러 항목을 동시에 사용하기 때문에 겹쳐도 계산해야 한다.
		// 하지만 직접 style에 접근하는 경우는 변경될 때에만 값에 접근해 reflow를 줄인다
		if (this._bUseTransform) {
			this._aTransformValue.push(this._makeTranslate(htInfo.x, htInfo.y, htInfo.zIndex));
		} else if (htDirty.x || htDirty.y) {
			this._elContainerStyle.left = htInfo.x + "px";
			this._elContainerStyle.top = htInfo.y + "px";
		}
		
		//48~49
		
		// origin 적용
		if (this._bUseTransform) {
			if (htDirty.originX || htDirty.originY || htDirty.width || htDirty.height) {
				this._elContainerStyle[this._sOrigin] = htOrigin.x + "px " + htOrigin.y + "px";
			}
			
			if (htInfo.angle !== 0) {
				this._aTransformValue.push("rotate", (this._bSupportCSS3d && !this._bIsAndroid ? "Z" : ""), "(", htInfo.angle, "deg) ");
			}
			
			// scale이 translate보다 나중에 되야 한다
			if (htInfo.scaleX !== 1 || htInfo.scaleY !== 1) {
				this._aTransformValue.push("scale(", htInfo.scaleX, ", ", htInfo.scaleY, ") ");
			}
		}
		
		//46~47
		if (this._bUseTransform) {
			this._applyTransform();
		}
		
		//24
		this._drawImage(htInfo, htDirty);
		
		/**
		 * Delegate
		 * @name collie.DisplayObject#onDOMDraw
		 * @delegate
		 * @event
		 * @param {Object} htEvent
		 * @param {collie.DisplayObject} htEvent.displayObject
		 * @param {HTMLElement} htEvent.element 현재 엘리먼트
		 * @param {Number} htEvent.x 객체의 절대 x 좌표
		 * @param {Number} htEvent.y 객체의 절대 y 좌표
		 */
		if ("onDOMDraw" in this._oDisplayObject) {
			this._oDisplayObject.onDOMDraw(this._htEvent);
		}
		
		this._oLayer.drawCount++;
	},
	
	/**
	 * 이미지와 관련된 작업을 수행
	 * 
	 * @private
	 */
	_drawImage : function (htInfo, htDirty) {
		var elSourceImage = this._oDisplayObject.getImage();
		var bUseRepeat = htInfo.backgroundRepeat && htInfo.backgroundRepeat !== 'no-repeat';
		var nImageWidth = 0;
		var nImageHeight = 0;
		
		// 이미지 늘리기
		if (this._oDisplayObject._htOption.fitImage) {
			nImageWidth = this._oDisplayObject._htOption.width;
			nImageHeight = this._oDisplayObject._htOption.height;
		} else {
			var htImageSize = this._oDisplayObject.getImageSize();
			nImageWidth = htImageSize.width;
			nImageHeight = htImageSize.height;
		}
		
		// CSSText를 쓰면 Dirty는 빼야 한다
		if (htDirty.backgroundImage || htDirty.backgroundRepeat) {
			
			// android trasnform에서 엘리먼트를 지우면 깜빡거림, 최대한 재사용 함
			if (this._elImage !== null && (!htInfo.backgroundImage || (htInfo.backgroundRepeat && htInfo.backgroundRepeat !== "no-repeat"))) {
			// if (this._elImage !== null) {
				this._el.removeChild(this._elImage);
				this._elImage = null;
			}
			
			if (htInfo.backgroundImage && elSourceImage) {
				if (!bUseRepeat && htInfo.backgroundImage) {
					var elImageStyle;
					
					if (this._elImage === null) {
						// android 3d trasnforms 버그 때문에 div로 감쌈
						this._elImage = elSourceImage.cloneNode();
						elImageStyle = this._elImage.style;
						elImageStyle.position = "absolute";
						elImageStyle.top = 0;
						elImageStyle.left = 0;
						elImageStyle.width = nImageWidth + "px";
						elImageStyle.height = nImageHeight + "px";
						elImageStyle.visibility = "visible";
						
						// Androind 4.1 workaround
						// TODO Androind 4.2에서 없어졌는지 확인해봐야 함
						if (this._nAndroidVersion && this._nAndroidVersion >= 4.1) {
							elImageStyle.opacity = htInfo.opacity;
						}
						
						if (this._bSupportCSS3d && this._bUseTranslateZ) {
							elImageStyle[this._sTransform] = "translateZ(0)";
						}
						
						if (this._el.hasChildNodes()) {
							this._el.insertBefore(this._elImage, this._el.childNodes[0]);
						} else {
							this._el.appendChild(this._elImage);
						}
					} else {
						this._elImage.src = elSourceImage.src;
						elImageStyle = this._elImage.style;
						elImageStyle.width = nImageWidth + "px";
						elImageStyle.height = nImageHeight + "px";
						elImageStyle.visibility = "visible";
					}
				} else if (bUseRepeat) {
					this._elStyle.backgroundImage = 'url("' + elSourceImage.src + '")';				
					this._elStyle.backgroundRepeat = htInfo.backgroundRepeat;
				}
			}
		}
		
		if (htInfo.backgroundImage && this._elImage !== null) {
			// 레티나 이미지 처리
			if (this._bIsRetinaDisplay && bUseRepeat && (htDirty.width || htDirth.height || htDirty.backgroundRepeat || htDirty.backgroundImage)) {
				this._elStyle.backgroundSize = htInfo.width + "px " + htInfo.height + "px";
			}
			
			if (htDirty.offsetX || htDirty.offsetY) {
				if (this._bUseTransform) {
					this._elImage.style[this._sTransform] = this._makeTranslate(-htInfo.offsetX, -htInfo.offsetY, 1);
				} else {
					this._elImage.style.left = -htInfo.offsetX + "px";
					this._elImage.style.top = -htInfo.offsetY + "px";
				}
			}
		}
	},
		
	/**
	 * translate 구문 생성, 2d, 3d를 구분해서 생성한다
	 * 
	 * @private
	 * @param {Number} nX
	 * @param {Number} nY
	 * @param {Number} nZ
	 * @return {String} transform에 입력할 translate 값
	 */
	_makeTranslate : function (nX, nY, nZ) {
		var sTranslate = '';
		var bUseCSS3d = (this._htInfo.angle !== 0 && this._bIsAndroid) ? false : this._bSupportCSS3d;
		// getAngle
		
		if (bUseCSS3d) {
			sTranslate = "translate3d(" + nX + "px, " + nY + "px, " + nZ + "px) ";
		} else if (this._bSupportCSS3) {
			sTranslate = "translate(" + nX + "px, " + nY + "px) ";
		}
		
		return sTranslate;
	},
	
	/**
	 * 누적된 transform 속성을 적용한다
	 * @private
	 */
	_applyTransform : function () {
		var sValue = this._aTransformValue.join("");
		
		if (this._sCacheTransformValue !== sValue) {
			this._elContainerStyle[this._sTransform] = sValue;
			this._sCacheTransformValue = sValue;
			
			if (this._bIsAndroid && this._bUseTranslateZ && this._htInfo.angle !== 0) {
				this._elStyle[this._sTransform] = "";
				
				if (this._elImage) {
					this._oDisplayObject.setChanged();
				}
				
				this._bUseTranslateZ = false;
			} else if (!this._bUseTranslateZ && (this._htInfo.angle === 0 || !this._bIsAndroid) && this._bSupportCSS3d) {
				this._elStyle[this._sTransform] = "translateZ(0)";
				
				if (this._elImage) {
					this._oDisplayObject.setChanged();
				}
				
				this._bUseTranslateZ = true;
			}
		}
		
		this._aTransformValue = [];
	}
}, collie.Component);

/**
 * 엘리먼트 클래스 이름
 * @constants
 * @memberOf collie.DisplayObjectDOM
 */
collie.DisplayObjectDOM.CLASSNAME = "_collie_displayObject";
		
/**
 * 엘리먼트 아이디 prefixt
 * @constants
 * @memberOf collie.DisplayObjecDOM
 */
collie.DisplayObjectDOM.ID = "_collie_displayObject_";
/**
 * - A DisplayObject is basic class for display object.
 * - A DisplayObject can have one or many displayObject like a DOM Element.
 * - A offset values changed by when you set a spriteX and spriteY options, but there is no change when you set offsetX and offsetY values.
 * - You can use the addTo method with the method chaining
 * - A DisplayObject should be set useCache option as true if it doesn't change frequently.
 * 
 * @class collie.DisplayObject
 * @extends collie.Component
 * @param {Object} [htOption] Options
 * @param {String} [htOption.name] 객체 이름, 중복 가능
 * @param {Number|String} [htOption.width="auto"] 너비, auto 값일 경우 backgroundImage가 설정되면 해당 이미지 너비 만큼 자동으로 변경 된다
 * @param {Number|String} [htOption.height="auto"] 높이, auto 값일 경우 backgroundImage가 설정되면 해당 이미지 높이 만큼 자동으로 변경 된다
 * @param {Number|String} [htOption.x=0] x축 위치, left, right, center 값을 사용하면 부모를 기준으로 정렬
 * @param {Number|String} [htOption.y=0] y축 위치, top, bottom, center 값을 사용하면 부모를 기준으로 정렬
 * @param {Number} [htOption.zIndex=0] 표시 순서. 높을 수록 위에 있음. 같으면 추가한 순서대로
 * @param {Number} [htOption.opacity=1] 투명도(0~1)
 * @param {Number} [htOption.angle=0] 회전각(0~360 deg)
 * @param {Number} [htOption.scaleX=1] x축 비율
 * @param {Number} [htOption.scaleY=1] y축 비율
 * @param {Number} [htOption.originX=center] scale, angle 적용 가로 기준 [left, right, center, 숫자]
 * @param {Number} [htOption.originY=center] scale, angle 적용 세로 기준 [top, bottom, center, 숫자]
 * @param {Number} [htOption.offsetX=0] 배경 이미지 시작 x좌표
 * @param {Number} [htOption.offsetY=0] 배경 이미지 시작 y좌표
 * @param {Number} [htOption.spriteX=null] 배경 가로 스프라이트 index, 너비 * index 값으로 offsetX가 설정된다
 * @param {Number} [htOption.spriteY=null] 배경 세로 스프라이트 index, 높이 * index 값으로 offsetY가 설정된다
 * @param {Number} [htOption.spriteLength=0] 배경 스프라이트 frame수, 가로폭 제한 스프라이트일 경우에 전체 프레임 수를 지정한다. 높이가 height보다 크지 않은 경우 적용되지 않는다
 * @param {Number} [htOption.spriteSheet=null] 배경 스프라이트 시트 이름, ImageManager에서 addSprite로 정보를 넣었을 경우 사용할 수 있다
 * @param {Array} [htOption.rangeX=null] X좌표 가용 범위. 배열로 최소, 최대값을 설정 [min, max], 상대 좌표임(현재 객체의 x, y좌표와 동일)
 * @param {Array} [htOption.rangeY=null] Y좌표 가용 범위. 배열로 최소, 최대값을 설정 [min, max], 상대 좌표임(현재 객체의 x, y좌표와 동일)
 * @param {Boolean} [htOption.positionRepeat=false] x,y 좌표의 범위 설정(rangeX, rangeY)이 되어 있는 경우 범위를 벗어나면 원점으로 돌아오는지 여부를 설정. fasle면 경계값까지만 움직이고 멈춤
 * @param {String} [htOption.backgroundColor] 배경색
 * @param {String} [htOption.backgroundImage] 배경이미지, 이미지매니져 리소스 이름이나 엘리먼트
 * @param {String} [htOption.backgroundRepeat='no-repeat'] 배경 이미지 반복 방법 repeat, repeat-x, repeat-y, no-repeat, no-repeat이 아니라면 useCache가 자동으로 true로 변함
 * @param {Boolean} [htOption.fitImage=false] 이미지를 객체 크기에 맞추기 
 * @param {collie.DisplayObject|Array} [htOption.hitArea] 이벤트 영역으로 사용될 다른 객체나 Polyline Path를 배열로 설정한다. 이 때 좌표는 상대 좌표 [[x1, y1], [x2, y2], ...] 
 * @param {Boolean} [htOption.debugHitArea=false] 이벤트 영역으로 사용된 hitArea를 화면에서 직접 확인할 수 있다. 성능에 좋지 않기 때문에 디버깅할 때만 사용해야 한다. 
 * @param {Number} [htOption.velocityX=0] x축 속도(초당 px)
 * @param {Number} [htOption.velocityY=0] y축 속도(초당 px)
 * @param {Number} [htOption.velocityRotate=0] 회전 속도(초당 1도)
 * @param {Number} [htOption.forceX=0] x축 힘(초당 px)
 * @param {Number} [htOption.forceY=0] y축 힘(초당 px)
 * @param {Number} [htOption.forceRotate=0] 회전 힘(초당 1도)
 * @param {Number} [htOption.mass=1] 질량
 * @param {Number} [htOption.friction=0] 마찰력
 * @param {Boolean} [htOption.useRealTime=true] SkippedFrame을 적용해서 싸이클을 현재 시간과 일치 
 * @param {Boolean} [htOption.useCache=false] 타일 캐시 사용 여부. 자식 객체를 모두 자신의 Context에 그려 놓는다.
 * @param {String|Boolean} [htOption.useEvent="auto"] 이벤트 사용 여부, Layer옵션과 DisplayObject 옵션 중에 하나라도 false라면 동작하지 않는다. auto면 attach된 이벤트가 있을 경우에만 동작한다 
 * @param {Boolean} [htOption.visible=true] 화면 표시 여부. false면 자식 객체도 보이지 않는다. "hidden" 값으로 설정하면 자식 객체는 표시하고 자신만 보이지 않게 한다
 */
collie.DisplayObject = collie.Class(/** @lends collie.DisplayObject.prototype */{
	/**
	 * 클래스 타입
	 * @type {String}
	 */
	type : "displayobject",

	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this._bInitOption = true;
		this._htOption = {
			name : "", // 객체 이름
			width : 'auto',
			height : 'auto',
			x : 0,
			y : 0,
			zIndex : 0, // 표시 순서
			opacity : 1, // 투명도
			angle : 0, // 로테이션(각도)
			scaleX : 1,
			scaleY : 1,
			originX : "center",
			originY : "center",
			offsetX : 0,
			offsetY : 0,
			spriteX : null,
			spriteY : null,
			spriteLength : 0,
			spriteSheet : null,
			rangeX : null, // X좌표 가용 범위를 설정, 배열로 min, max 설정함 [min, max]
			rangeY : null, // Y좌표 가용 범위를 설정, 배열로 min, max 설정함 [min, max]
			positionRepeat : false, // x,y 좌표의 범위 설정이 되어 있는 경우 범위를 벗어나면 원점으로 돌아오는지 여부를 설정. fasle면 경계값까지만 움직이고 멈춤
			backgroundColor : '', // 배경색
			backgroundImage : '', // 배경이미지, 이미지매니져 리소스 이름이나 엘리먼트
			backgroundRepeat : 'no-repeat', // 배경 이미지 반복 repeat, repeat-x, repeat-y, no-repeat
			hitArea : null,
			debugHitArea : false,
			useCache : false,
			useEvent : "auto",
			fitImage : false, // 이미지를 객체 크기에 맞게 늘리기
			velocityX : 0,
			velocityY : 0,
			velocityRotate : 0,
			forceX : 0,
			forceY : 0,
			forceRotate : 0,
			mass : 1, // 질량
			friction : 0, // 마찰
			useRealTime : true,
			visible : true // 화면 표시 여부
		};
		
		if (htOption) {
			this.option(htOption);
		}
		
		this._htDirty = {};
		this._htMatrix = {};
		this._sId = ++collie.DisplayObject._idx;
		this._elImage = null;
		this._aDisplayObjects = [];
		this._oLayer = null;
		this._oParent = null;
		this._oDrawing = null;
		this._bIsSetOption = false;
		this._bChanged = true;
		this._bChangedTransforms = true;
		this._bCustomSize = false;
		this._aChangedQueue = null;
		this._htGetImageData = null;
		this._htRelatedPosition = {};
		this._htParentRelatedPosition = {};
		this._htBoundary = {};
		this._sRenderingMode = null;
		this._bRetinaDisplay = collie.Renderer.isRetinaDisplay();
		this._oTimerMove = null;
		this._nPositionRight = null;
		this._nPositionBottom = null;
		this._nImageWidth = 0;
		this._nImageHeight = 0;
		this._htImageSize = null;
		this._htSpriteSheet = null;
		this._htOrigin = {
			x : 0,
			y : 0
		};
		
		this.set(this._htOption);
		this._bIsSetOption = true;
	},
	
	/**
	 * 설정 값을 변경한다
	 * @example
	 * oDisplayObject.set({
	 * 	visible : false,
	 *  opacity : 1
	 * });
	 * 
	 * oDisplayObject.set("visible", true);
	 * 
	 * @param {String|Object} vKey 설정 이름. 여러개의 값을 Object로 한번에 설정할 수 있다.
	 * @param {Variables} vValue 값
	 * @param {Boolean} [bSkipSetter] setter를 수행하지 않음. 일반적으로 사용하는 것은 권장하지 않는다
	 * @param {Boolean} [bSkipChanged] 상태 변경을 하지 않는다. 상태변경을 하지 않게 되면 다시 그리지 않는다
	 * @return {collie.DisplayObject} For Method Chaining
	 */
	set : function (vKey, vValue, bSkipSetter, bSkipChanged) {
		if (typeof vKey === "object") {
			// 나머지 실행
			for (var i in vKey) {
				this.set(i, vKey[i]);
			}
		} else {
			// 값이 변하지 않았다면 처리하지 않음
			if (this._bIsSetOption && this._htOption[vKey] === vValue) {
				return;
			}
			
			// 크기 자동 변경 값 적용
			if (vKey === "width" || vKey === "height") {
				if (vValue !== "auto") {
					this._bCustomSize = true;
				} else if (vValue === "auto" && this.getImage() !== null) {
					vValue = this.getImageSize()[vKey];
				} else {
					vValue = 100;
				}
			}
			
			this._htOption[vKey] = vValue;
			this.setDirty(vKey); // record value to find
			
			if (!bSkipSetter) {
				this._setter(vKey, vValue);
			}
			
			if (!bSkipChanged) {
				// check if DisplayObject changed only transform values
				this.setChanged((vKey === 'x' || vKey === 'y' || vKey === 'angle' || vKey === 'scaleX' || vKey === 'scaleY' || vKey === 'opacity') ? true : false);
			}
		}
		
		return this;
	},
	
	/**
	 * setter
	 * @private
	 * @param {String} vKey 설정 이름
	 * @param {Variables} vValue 값
	 */
	_setter : function (vKey, vValue) {
		// zIndex hash 갱신
		if (vKey === "zIndex") {
			if (this._oParent) {
				this._oParent.changeDisplayObjectZIndex(this);
			} else if (this.getLayer()) {
				this._oLayer.changeDisplayObjectZIndex(this);
			}
		}
		
		// 값 보정
		if (vKey === "x" || vKey === "y") {
			if (typeof vValue === "string") {
				this.align(vKey === "x" ? vValue : false, vKey === "y" ? vValue : false);
			}
			
			this._fixPosition();
			this.resetPositionCache();
		}
		
		// 이미지 설정
		if (vKey === "backgroundImage") {
			this.setImage(vValue);
		}
		
		// 스프라이트 속성 적용
		if (vKey === 'spriteX' || vKey === 'spriteY' || vKey === 'spriteSheet') {
			this._setSpritePosition(vKey, vValue);
		}
		
		// hitArea 배열 캐싱
		if (vKey === 'hitArea' && vValue instanceof Array) {
			this._makeHitAreaBoundary();
		}
		
		// origin 변환
		if (vKey === 'width' || vKey === 'height' || vKey === 'originX' || vKey === 'originY') {
			this._setOrigin();
		}
		
		// 배경 반복 상태면 캐시 사용
		if ((vKey === 'backgroundRepeat' && vValue !== 'no-repeat')) {
			this.set("useCache", true);
		}
		
		// 캔버스 캐시 생성
		if (vKey === 'useCache' && this._oDrawing !== null && this._oDrawing.loadCache) {
			if (vValue) {
				this._oDrawing.loadCache();
			} else {
				this._oDrawing.unloadCache();
			}
		}
	},
	
	/**
	 * 설정 값을 가져온다
	 * @param {String} sKey 값이 없으면 전체 값을 반환
	 * @return {Variable|Object} 설정 값
	 * @example
	 * var htData = oDisplayObject.get();
	 * var bVisible = oDisplayObject.get("visible");
	 * @example
	 * <caption>성능을 올리기 위해서는 메서드 호출을 최소한으로 줄이는 것이 좋다
	 * If you want to improve performance to your service, you should use less method call.</caption>
	 * // before
	 * var x = oDisplayObject.get("x");
	 * var y = oDisplayObject.get("y");
	 * var width = oDisplayObject.get("width");
	 * var height = oDisplayObject.get("height");
	 * 
	 * // after
	 * var htInfo = oDisplayObject.get();
	 * htInfo.x;
	 * htInfo.y;
	 * htInfo.width;
	 * htInfo.height;
	 * 
	 * // or you can access a htOption object directly. It's not recommend but It's better than frequently method call.
	 * oDisplayObject._htOption.x;
	 * oDisplayObject._htOption.y;
	 * oDisplayObject._htOption.width;
	 * oDisplayObject._htOption.height;
	 */
	get : function (sKey) {
		if (!sKey) {
			return this._htOption;
		} else {
			return this._htOption[sKey];
		}
	},
	
	/**
	 * 값이 변경된 것으로 설정
	 * 
	 * @param {String} sKey 키 이름, 값이 없으면 모든 값을 다시 적용함
	 */
	setDirty : function (sKey) {
		if (this._htDirty === null) {
			this._htDirty = {};
		}
		
		if (typeof sKey === "undefined") {
			for (var i in this._htOption) {
				this._htDirty[i] = true; 				
			}
		} else {
			this._htDirty[sKey] = true; 				
		}
	},
	
	/**
	 * 값이 변경된 것을 알림
	 *
	 * @param {String} sKey 키 이름
	 * @return {Boolean} true면 값이 변경 됐음
	 */
	getDirty : function (sKey) {
		if (!sKey) {
			return this._htDirty;
		} else {
			return this._htDirty[sKey] ? true : false;
		}
	},
	
	/**
	 * Dirty 값을 초기화, 다 그리고 난 후에 실행 한다
	 * @private
	 */
	_resetDirty : function () {
		this._htDirty = null;
	},
	
	/**
	 * DisplayObject의 자식을 추가 한다
	 * - 자식으로 들어간 DisplayObject는 현재 DisplayObject의 zIndex 영향을 받게 된다
	 * 
	 * @param {collie.DisplayObject} oDisplayObject
	 */
	addChild : function (oDisplayObject) {
		collie.util.pushWithSort(this._aDisplayObjects, oDisplayObject);
		oDisplayObject.setParent(this);
		
		if (this._oLayer !== null) {
			oDisplayObject.setLayer(this._oLayer);
		}
		
		this.setChanged();
	},
	
	/**
	 * 자식을 제거 한다
	 * @param {collie.DisplayObject} oDisplayObject
	 * @param {Number} nIdx 인덱스 번호를 알고 있다면 인덱스 번호를 지정
	 */
	removeChild : function (oDisplayObject, nIdx) {
		if (typeof nIdx !== "undefined") {
			this._aDisplayObjects[nIdx].unsetLayer();
			this._aDisplayObjects[nIdx].unsetParent();			
			this._aDisplayObjects.splice(nIdx, 1);
		} else {
			for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
				if (this._aDisplayObjects[i] === oDisplayObject) {
					this._aDisplayObjects[i].unsetLayer();
					this._aDisplayObjects[i].unsetParent();
					this._aDisplayObjects.splice(i, 1);
					break;
				}
			}
		}
		
		this.setChanged();
	},
	
	/**
	 * zIndex가 변경되었다면 이 메소드를 호출
	 * 
	 * @private
	 * @param {collie.DisplayObject} oDisplayObject
	 */
	changeDisplayObjectZIndex : function (oDisplayObject) {
		this.removeChild(oDisplayObject);
		this.addChild(oDisplayObject);
	},
	
	/**
	 * 레이어나 DisplayObject 객체에 현재 객체를 추가 한다.
	 * 
	 * @param {collie.Layer|collie.DisplayObject} oTarget
	 * @return {collie.DisplayObject}
	 */
	addTo : function (oTarget) {
		// 이미 추가돼 있다면 빼고 다시 넣음
		if (this._oLayer || this._oParent) {
			// 같은데라면 동작 취소
			if (this._oLayer === oTarget || this._oParent === oTarget) {
				return this;
			} else {
				this.leave();
			}
		}
		
		oTarget.addChild(this);
		return this;
	},
	
	/**
	 * 자식이 있는지 반환
	 * 
	 * @return {Boolean} 자식이 있다면 true
	 */
	hasChild : function () {
		return this._aDisplayObjects.length > 0;
	},
	
	/**
	 * 자식을 반환
	 * 
	 * @return {Array}
	 */
	getChildren : function () {
		return this._aDisplayObjects;
	},
	
	/**
	 * 부모를 반환
	 * 
	 * @return {collie.DisplayObject}
	 */
	getParent : function () {
		return this._oParent || false;
	},
	
	/**
	 * 부모를 설정
	 * - 직접 호출하지 않는다
	 * @private
	 * @param {collie.DisplayObject} oDisplayObject
	 */
	setParent : function (oDisplayObject) {
		this._oParent = oDisplayObject;	
	},
	
	/**
	 * 부모를 해제
	 * @private
	 */
	unsetParent : function () {
		this._oParent = null;
	},
	
	/**
	 * 부모가 있을 경우 부모에서 자신을 뺀다
	 * @return {collie.DisplayObject} 자신을 반환
	 */
	leave : function () {
		var oParent = null;
		
		if (this._oParent !== null) {
			oParent = this._oParent;
		} else if (this._oLayer) {
			oParent = this.getLayer();
		}
		
		if (oParent) {
			oParent.removeChild(this);
		}
		
		return this;
	},
	
	/**
	 * 아이디를 반환 한다
	 * 
	 * @return {String}
	 */
	getId : function () {
		return this._sId;
	},
	
	/**
	 * 현재 객체의 배경 이미지를 가져온다
	 * 
	 * @return {HTMLElement}
	 */
	getImage : function () {
		return this._elImage || null;
	},
	
	/**
	 * 이미지 크기를 반환, 레티나일 경우 보정된 값을 반환 한다
	 * Return a size of the image set to backgroundImage property.
	 * If The User has a retina display, this method would return a half of size.
	 * ex) 640*940 -> 320*480
	 * 
	 * @return {Boolean|Object} htSize 이미지가 로드되지 않았으면 false를 반환. It would return as false when it has not loaded the image yet.
	 * @return {Number} htSize.width
	 * @return {Number} htSize.height
	 */
	getImageSize : function () {
		return this._htImageSize || false;
	},
	
	/**
	 * 이미지를 설정한다
	 * - TODO 비동기 주의해야 함
	 * - TODO setImage 바로 못하게 해야 함 backgroundImage로... 값이 어긋남
	 * @param {String|HTMLImageElement} vImage ImageManager의 리소스 이름이나 이미지 엘리먼트
	 * @private
	 */
	setImage : function (vImage) {
		if (typeof vImage === "string" || !vImage) {
			// 이미 걸어놓은 이미지가 있다면 취소
			if (this._htGetImageData !== null && this._htGetImageData.name !== vImage) {
				collie.ImageManager.cancelGetImage(this._htGetImageData.name, this._htGetImageData.callback);
				this._htGetImageData = null;
			}
			
			if (!vImage) {
				this._elImage = null;
				this.setChanged();
			} else {
				this._htGetImageData = {
					name : vImage,
					callback : (function (elImage) {
						this.setImage(elImage);
					}).bind(this)
				};
				
				collie.ImageManager.getImage(this._htGetImageData.name, this._htGetImageData.callback);
			}
			
			return;
		}
		
		// 같은 이미지면 적용하지 않음
		if (this._elImage && this._elImage === vImage) {
			return;
		}
		
		// reflow 예방을 위한 이미지 크기 캐시
		this._elImage = vImage;
		this._nImageWidth = vImage.width;
		this._nImageHeight = vImage.height;
		this._htImageSize = {
			width : this._bRetinaDisplay ? this._nImageWidth / 2 : this._nImageWidth,
			height : this._bRetinaDisplay ? this._nImageHeight / 2 : this._nImageHeight
		};
		this._htSpriteSheet = collie.ImageManager.getSprite(this._htOption.backgroundImage);
		
		// 사용자가 크기를 설정 안했으면 자동으로 이미지 크기로 설정 됨
		if (!this._bCustomSize) {
			this.set({
				width : this._htImageSize.width,
				height : this._htImageSize.height
			});
		}
		
		this._setSpritePosition("spriteSheet", this._htOption.spriteSheet);
		this._setSpritePosition("spriteX", this._htOption.spriteX);
		this._setSpritePosition("spriteY", this._htOption.spriteY);
		this.setDirty("backgroundImage");
		this.setChanged();
	},
	
	/**
	 * 드로잉 객체를 반환
	 * @return {collie.DisplayObjectCanvas|collie.DisplayObjectDOM}
	 */
	getDrawing : function () {
		return this._oDrawing;
	},
	
	/**
	 * 변경된 내용이 있을 경우 Layer에 알린다
	 * - 개발용
	 * TODO setChanged 실행 횟수가 많은데 중복 실행을 줄이면 성능이 향상되나?
	 * -> flag만 두고 실제 setChanged 전파는 draw하기 전에 하는 것임
	 * 
	 * @private
	 * @param {Boolean} bChangedTransforms transform 값이 변경되는지 여부
	 */
	setChanged : function (bChangedTransforms) {
		// 이미 변경된 것으로 돼 있다면 실행하지 않음
		if (this._bChanged || (bChangedTransforms && this._bChangedTransforms)) {
			return;
		}
		
		if (this._oLayer !== null) {
			this._oLayer.setChanged();
		}
		
		if (!bChangedTransforms) {
			this._bChanged = true;
		}
		
		this._bChangedTransforms = true;
		
		// 부모가 있다면 부모도 바뀐 상태로 변경, 반복적으로 부모에게 전달됨
		if (this._oParent) {
			this._oParent.setChanged(false); // transforms만 바꼈어도 부모에게는 전체가 바뀐것으로 통보
		}
	},
	
	/**
	 * 변경된 내용이 반영 되었을 때
	 * TODO changed라는 이름 변경할 필요성 있음
	 * @private
	 */
	unsetChanged : function () {
		this._bChanged = false;
		this._bChangedTransforms = false;
	},
	
	/**
	 * 현재 객체에 변경된 내용 여부를 반환
	 * DOM일 경우 변경된게 없으면 다시 안그림
	 * 
	 * @param {Boolean} bChangedOnlyTranforms
	 * @return {Boolean}
	 */
	isChanged : function (bChangedOnlyTranforms) {
		return !bChangedOnlyTranforms ? (this._bChanged || this._bChangedTransforms) : !this._bChanged && this._bChangedTransforms;
	},
	
	/**
	 * 레이어에 객체를 추가
	 * 
	 * - 직접 사용하지 않는다
	 * @private
	 * @param {collie.Layer} oLayer
	 */
	setLayer : function (oLayer) {
		// 중복된 값이 있으면 에러
		if (this._sId in collie.DisplayObject.htFactory) {
			throw new Error('Exists DisplayObject Id ' + this._sId);
		}
		
		collie.DisplayObject.htFactory[this._sId] = this;
		this._oLayer = oLayer;
		this._sRenderingMode = this._oLayer.getRenderingMode();
		this._makeDrawing();
		this._oDrawing.load();
		this.setChanged();
		
		// 정렬 적용
		if (typeof this._htOption.x === "string" || typeof this._htOption.y === "string") {
			this.align(typeof this._htOption.x === "string" ? this._htOption.x : false, typeof this._htOption.y === "string" ? this._htOption.y : false);
		}
		
		if (this._nPositionRight !== null) {
			this.right(this._nPositionRight);
			this._nPositionRight = null;
		}
		
		if (this._nPositionBottom !== null) {
			this.bottom(this._nPositionBottom);
			this._nPositionBottom = null;
		}
		
		// 자식도 setLayer 적용
		for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
			this._aDisplayObjects[i].setLayer(oLayer);
		}
	},

	/**
	 * 레이어에서 객체를 뺌
	 * @private
	 */	
	unsetLayer : function () {
		if (this.getLayer()) {
			for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
				this._aDisplayObjects[i].unsetLayer();
			}
		
			this._oDrawing.unload();
			this.setDirty();
			this.setChanged();
			this._sRenderingMode = null;
			this._oDrawing = null;
			this._oLayer = null;
			delete collie.DisplayObject.htFactory[this._sId];
		}
	},
	
	/**
	 * @private
	 */
	_makeDrawing : function () {
		if (this._oDrawing === null) {
			this._oDrawing = this._sRenderingMode === "dom" ? new collie.DisplayObjectDOM(this) : new collie.DisplayObjectCanvas(this);
		}
	},
	
	/**
	 * 레이어 반환
	 * 
	 * @return {collie.Layer|Boolean}
	 */
	getLayer : function () {
		return this._oLayer || false;
	},
	
	/**
	 * 다양한 속성을 변경하며 사용할 경우 addMatrix를 이용해 설정을 미리 만들고 changeMatrix로 변경해 사용할 수 있다.
	 * 
	 * @param {Array|Object} vMatrix 배열로 여러개를 한번에 넣을 수 있음
	 * @param {String} vMatrix.name Matrix 이름
	 * @param {Number} vMatrix.property 변경할 설정을 입력한다 
	 * @example
	 * oDisplayObject.addMatrix({
	 * 	name : "test"
	 * 	offsetX : 0,
	 * 	offsetY : 100
	 * });
	 * oDisplayObject.addMatrix([
	 * 	{ name : "test2", offsetX : 100, offsetY : 100, width : 50, height : 50 },
	 * 	{ name : "test3", offsetX : 200, offsetY : 100, width : 80, height : 80 }
	 * ]);
	 * 
	 * oDisplayObject.changeMatrix("test2");
	 * oDisplayObject.changeMatrix("test3");
	 */
	addMatrix : function (vMatrix) {
		if (vMatrix instanceof Array) {
			for (var i = 0, len = vMatrix.length; i < len; i++) {
				this.addMatrix(vMatrix[i]);
			}
			return;
		}
		
		this._htMatrix[vMatrix.name] = vMatrix;
		delete this._htMatrix[vMatrix.name].name;
	},
	
	/**
	 * 해당 Matrix로 변경한다
	 * 
	 * @param {String} sName 매트릭스 이름
	 */
	changeMatrix : function (sName) {
		if (sName in this._htMatrix) {
			this.set(this._htMatrix[sName]);
		}
	},
	
	/**
	 * DisplayObject를 갱신한다.
	 * 
	 * @param {Number} nFrameDuration 진행된 프레임 시간
	 * @param {Number} nX 부모로 부터 내려온 x좌표
	 * @param {Number} nY 부모로 부터 내려온 y좌표
	 * @param {Number} nLayerWidth 레이어 너비, update는 tick안에 있는 로직이기 때문에 성능 극대화를 위해 전달
	 * @param {Number} nLayerHeight 레이어 높이
	 * @param {Object} oContext 부모의 Canvas Context, useCache를 사용하면 넘어온다
	 * @return {Boolean} true를 반환하면 계속 바뀔게 있다는 뜻
	 * @private
	 */
	update : function (nFrameDuration, nX, nY, nLayerWidth, nLayerHeight, oContext) {
		this._updateMovableOption(nFrameDuration);
		
		// Canvas 방식이고, 보이지 않는 객체면 그린걸로 친다, 자식도 그리지 않아도 된다.
		if (this._sRenderingMode === "canvas" && !this._htOption.visible) {
			this.unsetChanged();
			return;
		}
		
		nX += this._htOption.x;
		nY += this._htOption.y;
		
		// Canvas에서 화면 밖으로 나가거나 DOM에서 바뀐게 있을 떄 그림
		if (
				(this._sRenderingMode === "dom" && this.isChanged()) || (
				this._sRenderingMode === "canvas" && (
					nX + this._htOption.width >= 0 ||
					nX <= nLayerWidth ||
					nY + this._htOption.height >= 0 ||
					nY <= nLayerHeight
				)
			)) {
			this._oDrawing.draw(nFrameDuration, nX, nY, nLayerWidth, nLayerHeight, oContext);
		}
		
		this.unsetChanged();
		this._resetDirty();
		
		// 움직임이 있으면 다시 바뀐 상태로 둠
		if (
			this._htOption.velocityX !== 0 ||
			this._htOption.velocityY !== 0 ||
			this._htOption.velocityRotate !== 0 ||
			this._htOption.forceX !== 0 ||
			this._htOption.forceY !== 0 ||
			this._htOption.forceRotate !== 0
		) {
			this.setChanged(true);
		}
		
		// Canvas 방식은 자식을 직접 그리고, DOM 방식이면 부모가 보이지 않는 상태면 자식도 그리지 않는다
		if (this._sRenderingMode === "canvas" || !this._htOption.visible) {
			return;
		}
		
		// update 자식에게 전파
		if (this.hasChild()) {
			for (var i = 0, len = this._aDisplayObjects.length; i < len; i++) {
				this._aDisplayObjects[i].update(nFrameDuration, nX, nY, nLayerWidth, nLayerHeight);
			}
		}
	},
	
	_updateMovableOption : function (nFrameDuration) {
		if (
			this._htOption.velocityX !== 0 ||
			this._htOption.velocityY !== 0 ||
			this._htOption.velocityRotate !== 0 ||
			this._htOption.forceX !== 0 ||
			this._htOption.forceY !== 0 ||
			this._htOption.forceRotate !== 0
		) {
			var nFrame = Math.max(17, nFrameDuration) / 1000;
			
			// skippedFrame 적용을 하지 않는다면 1frame 씩만 그림
			if (!this._htOption.useRealTime) {
				nFrame = 1;
			}
			
			var nVelocityX = this._htOption.velocityX;
			var nVelocityY = this._htOption.velocityY;
			var nX = this._htOption.x;
			var nY = this._htOption.y;
			
			// 힘 적용 a = F / m
			nVelocityX += (this._htOption.forceX / this._htOption.mass) * nFrame;
			nVelocityY += (this._htOption.forceY / this._htOption.mass) * nFrame;
			
			// 마찰력 적용
			var nForceFrictionX = this._htOption.friction * nVelocityX * this._htOption.mass * nFrame;
			var nForceFrictionY = this._htOption.friction * nVelocityY * this._htOption.mass * nFrame;
			
			if (nVelocityX !== 0) {
				nVelocityX = (Math.abs(nVelocityX) / nVelocityX !== Math.abs(nVelocityX - nForceFrictionX) / (nVelocityX - nForceFrictionX)) ? 0 : nVelocityX - nForceFrictionX;
			}
			
			if (nVelocityY !== 0) {
				nVelocityY = (Math.abs(nVelocityY) / nVelocityY !== Math.abs(nVelocityY - nForceFrictionY) / (nVelocityY - nForceFrictionY)) ? 0 : nVelocityY - nForceFrictionY;
			}
			
			nX += nVelocityX * nFrame;
			nY += nVelocityY * nFrame;
			nVelocityX = Math.floor(nVelocityX * 1000) / 1000;
			nVelocityY = Math.floor(nVelocityY * 1000) / 1000;
			
			if (this._htOption.friction && Math.abs(nVelocityX) < 0.05) {
				nVelocityX = 0;
			}
			
			if (this._htOption.friction && Math.abs(nVelocityY) < 0.05) {
				nVelocityY = 0;
			}
		
			// 변경이 있을 때만 설정
			if (
				nX !== this._htOption.x ||
				nY !== this._htOption.y ||
				nVelocityX !== this._htOption.velocityX ||
				nVelocityY !== this._htOption.velocityY
			) {
				this.set("x", nX);
				this.set("y", nY);
				this.set("velocityX", nVelocityX);
				this.set("velocityY", nVelocityY);
			}
			
			if (this._htOption.forceRotate !== 0) {
				this.set("velocityRotate", this._htOption.velocityRotate + this._htOption.forceRotate);
			}
			
			if (this._htOption.velocityRotate !== 0) {
				var nAngleRad = collie.util.fixAngle(collie.util.toRad(this._htOption.angle + this._htOption.velocityRotate * nFrame));
				this.set("angle", Math.round(collie.util.toDeg(nAngleRad) * 1000) / 1000);
			}
		}
	},
	
	/**
	 * 부모와 연관된 전체 좌표를 구한다(절대좌표)
	 * @todo 메소드 명이 직관적이지 못하다
	 * 
	 * @return {Object} htPos
	 * @return {Number} htPos.x
	 * @return {Number} htPos.y
	 */
	getRelatedPosition : function () {
		if (this._htRelatedPosition.x === null) {
			this._htRelatedPosition.x = this._htOption.x;
			this._htRelatedPosition.y = this._htOption.y;
			
			if (this._oParent) {
				var htPosition = this._oParent.getRelatedPosition();
				this._htRelatedPosition.x += htPosition.x;
				this._htRelatedPosition.y += htPosition.y;
			}
		}
		
		return this._htRelatedPosition;
	},
	
	/**
	 * 현재 표시 객체의 사각형 영역을 반환 한다
	 * - transform된 영역을 반환
	 * TODO Transform Matrix의 origin에 상대좌표를 적용해야 하기 때문에 캐시를 적용할 수 없음
	 * TODO Transform 안 된지도 부모를 타고 가봐야 알 수 있음!
	 * 
	 * @param {Boolean} bWithRelatedPosition 절대좌표로 변경해서 반환하는지 여부
	 * @param {Boolean} bWithPoints 좌표를 반환하는지 여부, Sensor의 box hittest에서 쓰임
	 * @return {Object} oBoundary
	 * @return {Number} oBoundary.left
	 * @return {Number} oBoundary.right
	 * @return {Number} oBoundary.top
	 * @return {Number} oBoundary.bottom
	 * @return {Number} oBoundary.isTransform 트랜스폼 사용 여부
	 * @return {Array} oBoundary.points bWithPoints를 true로 하면 좌표 배열이 넘어옴, [[x, y], [x, y], ...]
	 */
	getBoundary : function (bWithRelatedPosition, bWithPoints) {
		var htBoundary = collie.Transform.getBoundary(this, bWithPoints);
		this._htBoundary.left = htBoundary.left;
		this._htBoundary.right = htBoundary.right;
		this._htBoundary.top = htBoundary.top;
		this._htBoundary.bottom = htBoundary.bottom;
		this._htBoundary.isTransform = htBoundary.isTransform;
		this._htBoundary.points = htBoundary.points;
		
		// 절대 좌표로 변환해서 반환
		if (bWithRelatedPosition) {
			var htPos = this.getRelatedPosition();
			
			if (this._htBoundary.points) {
				for (var i = 0, l = this._htBoundary.points.length; i < l; i++) {
					this._htBoundary.points[i][0] += htPos.x;
					this._htBoundary.points[i][1] += htPos.y;
				}
			}
			
			this._htBoundary.left += htPos.x;
			this._htBoundary.right += htPos.x;
			this._htBoundary.top += htPos.y;
			this._htBoundary.bottom += htPos.y;
		}
		
		return this._htBoundary;
	},
	
	/**
	 * 위치가 변경되는 경우 캐시를 초기화 해 줌
	 * @private
	 */
	resetPositionCache : function () {
		this._htRelatedPosition.x = null;
		this._htRelatedPosition.y = null;
		
		// 자체적으로 전파
		// TODO 속도 차이 반드시 확인해 봐야 함!!
		if (this.hasChild()) {
			for (var i = 0, l = this._aDisplayObjects.length; i < l; i++) {
				this._aDisplayObjects[i].resetPositionCache();
			}
		}
	},

	/**
	 * 이벤트와 관련된 영역을 반환 한다
	 * - transform된 영역을 반환
	 * - 절대 좌표로 변환해서 반환한다
	 * 
	 * @return {Object} htReturn
	 * @return {Number} htReturn.left minX
	 * @return {Number} htReturn.right maxX
	 * @return {Number} htReturn.top minY
	 * @return {Number} htReturn.bottom maxY
	 */
	getHitAreaBoundary : function () {
		if (!this._htOption.hitArea) {
			return this.getBoundary(true);
		} else if (this._htOption.hitArea instanceof Array) {
			var aPoints = collie.Transform.points(this, collie.util.getBoundaryToPoints(this._htHitAreaBoundary));
			var htBoundary = collie.util.getBoundary(aPoints);
			var htPos = this.getRelatedPosition();
			
			return {
				left : htBoundary.left + htPos.x,
				right : htBoundary.right + htPos.x,
				top : htBoundary.top + htPos.y,
				bottom : htBoundary.bottom + htPos.y
			};
		} else { // displayObject일 경우
			return this._htOption.hitArea.getBoundary(true);
		}
	},
	
	/**
	 * Scale, Angle 변경의 중심점을 구한다
	 * 
	 * @private
	 * @return {Object} htResult
	 * @return {Number} htResult.x x축 Origin
	 * @return {Number} htResult.y y축 Origin
	 */
	getOrigin : function () {
		return this._htOrigin;
	},
	
	/**
	 * origin을 px로 설정한다
	 * @private
	 */
	_setOrigin : function () {
		switch (this._htOption.originX) {
			case "left" :
				this._htOrigin.x = 0;
				break;
				
			case "right" :
				this._htOrigin.x = this._htOption.width;
				break;
				
			case "center" :
				this._htOrigin.x = this._htOption.width / 2;
				break;
				
			default :
				this._htOrigin.x = parseInt(this._htOption.originX, 10);
		}
				
		switch (this._htOption.originY) {
			case "top" :
				this._htOrigin.y = 0;
				break;
				
			case "bottom" :
				this._htOrigin.y = this._htOption.height;
				break;
				
			case "center" :
				this._htOrigin.y = this._htOption.height / 2;
				break;
				
			default :
				this._htOrigin.y = parseInt(this._htOption.originY, 10);
		}
	},
	
	/**
	 * range를 사용하고 있는 경우 range에 맞게 포지션을 변경 한다
	 * 
	 * @private
	 */
	_fixPosition : function () {
		var nX = this._htOption.x;
		var nY = this._htOption.y;
		var nMinX;
		var nMaxX;
		var nMinY;
		var nMaxY;
		
		if (this._htOption.rangeX) {
			// 상대를 절대 값으로
			nMinX = this._htOption.rangeX[0];
			nMaxX = this._htOption.rangeX[1];
			
			if (this._htOption.positionRepeat) {
				if (nX < nMinX) { // 최소값 보다 작을 때
					do {
						nX += (nMaxX - nMinX);
					} while (nX < nMinX); 
				} else if (nX > nMaxX) { // 최대값 보다 클 때
					do {
						nX -= (nMaxX - nMinX);
					} while (nX > nMaxX);
				}
			} else {
				nX = Math.max(nMinX, nX);
				nX = Math.min(nMaxX, nX);
			}
			
			if (nX !== this._htOption.x) {
				// 절대를 상대 값으로
				this.set("x", nX, true);
			}
		}
		
		if (this._htOption.rangeY) {
			nMinY = this._htOption.rangeY[0];
			nMaxY = this._htOption.rangeY[1];
			
			if (this._htOption.positionRepeat) {
				if (nY < nMinY) { // 최소값 보다 작을 때
					do {
						nY += (nMaxY - nMinY);
					} while (nY < nMinY); 
				} else if (nY > nMaxY) { // 최대값 보다 클 때
					do {
						nY -= (nMaxY - nMinY);
					} while (nY > nMaxY);
				}
			} else {
				nY = Math.max(nMinY, nY);
				nY = Math.min(nMaxY, nY);
			}
			
			if (nY !== this._htOption.y) {
				this.set("y", nY, true);
			}
		}
	},
	
	/**
	 * hitArea 옵션이 배열로 들어올 경우 boundary를 구해서 저장해놓는다
	 * @private
	 */
	_makeHitAreaBoundary : function () {
		this._htHitAreaBoundary = collie.util.getBoundary(this._htOption.hitArea);
	},
	
	/**
	 * 객체의 위치를 정렬한다.
	 * 
	 * @param {String|Boolean} [sHorizontal=center] 수평 정렬 [left|right|center], false면 정렬하지 않음
	 * @param {String|Boolean} [sVertical=center] 수직 정렬 [top|bottom|center], false면 정렬하지 않음
	 * @param {collie.DisplayObject} [oBaseObject] 기준 객체, 값이 없을 경우 부모, 부모가 없을 경우 레이어를  기준으로 정렬 한다.
	 */
	align : function (sHorizontal, sVertical, oBaseObject) {
		if (!this.getLayer()) {
			return;
		}
		
		oBaseObject = oBaseObject || this.getParent();
		var nWidth = 0;
		var nHeight = 0;
		var nX = 0;
		var nY = 0;
		
		// 기준 크기 구함
		if (oBaseObject) {
			nWidth = oBaseObject._htOption.width;
			nHeight = oBaseObject._htOption.height;
		} else {
			nWidth = this._oLayer._htOption.width;
			nHeight = this._oLayer._htOption.height;
		}
		
		if (sHorizontal !== false) {
			nX = (sHorizontal === "right") ? nWidth - this._htOption.width : nWidth / 2 - this._htOption.width / 2;
			this.set("x", nX);
		}

		if (sVertical !== false) {
			nY = (sVertical === "bottom") ? nHeight - this._htOption.height : nHeight / 2 - this._htOption.height / 2;
			this.set("y", nY);
		}
	},
	
	/**
	 * 객체의 위치를 우측 기준으로 좌표만큼 이동한다
	 * 만일 Layer에 붙은 상태가 아니라면 붙은 후에 이동할 수 있도록 해 준다
	 * 
	 * @param {Number} nPosition 우측 기준 x좌표
	 * @return {collie.DisplayObject} 자기 자신을 반환
	 */
	right : function (nPosition) {
		var nWidth = 0;
		
		// 기준 크기 구함
		if (this._oParent) {
			nWidth = this._oParent._htOption.width;
		}
		
		if (!nWidth && this._oLayer) {
			nWidth = this._oLayer._htOption.width;
		}
		
		// 크기가 구해졌을 때만 정렬
		if (nWidth) {
			this.set("x", nWidth - (this._htOption.width + nPosition));
		} else {
			this._nPositionRight = nPosition;
		}
		
		return this;
	},
	
	/**
	 * 객체의 위치를 하단 기준으로 좌표만큼 이동한다
	 * 만일 Layer에 붙은 상태가 아니라면 붙은 후에 이동할 수 있도록 해 준다
	 * 
	 * @param {Number} nPosition 하단 기준 x좌표
	 * @return {collie.DisplayObject} 자기 자신을 반환
	 */
	bottom : function (nPosition) {
		var nHeight = 0;
		
		// 기준 크기 구함
		if (this._oParent) {
			nHeight = this._oParent.get("height");
		}
		
		if (!nHeight && this._oLayer) {
			nHeight = this._oLayer.option("height");
		}
		
		// 크기가 구해졌을 때만 정렬
		if (nHeight) {
			this.set("y", nHeight - (this._htOption.height + nPosition));
		} else {
			this._nPositionBottom = nPosition;
		}
		
		return this;
	},
	
	/**
	 * 지정한 비율에 맞게 크기를 변경 한다. 리샘플링과는 다르다
	 * 인자 둘 중 하나를 설정하면 설정한 부분의 비율에 맞춰서 크기를 변경 한다
	 * 
	 * @param {Number} [nWidth] 너비
	 * @param {Number} [nHeight] 높이
	 */
	resizeFixedRatio : function (nWidth, nHeight) {
		if (this.getImage()) {
			var nImageWidth = this.getImage().width;
			var nImageHeight = this.getImage().height;
			
			if (nWidth) {
				nHeight = nWidth * (nImageHeight / nImageWidth);
			} else if (nHeight) {
				nWidth = nHeight * (nImageWidth / nImageHeight);
			}
			
			this.set("width", Math.round(nWidth));
			this.set("height", Math.round(nHeight));
		}
	},
	
	/**
	 * Sprite 위치를 설정
	 * offsetX, offsetY로 값을 설정할 경우에 spriteX, spriteY는 정상적으로 동기화되지 못하는 문제가 있음 역추적 불가능
	 * @private
	 * @param {String} sKey 속성 이름
	 * @param {Number} nValue 값
	 */
	_setSpritePosition : function (sKey, nValue) {
		if (this._elImage && nValue !== null) {
			// spriteSheet 사용 시
			if (this._htOption.spriteSheet !== null) {
				var sheet = this._htSpriteSheet[this._htOption.spriteSheet];
				var nOffsetX; 
				var nOffsetY;
				
				if (sKey === "spriteSheet" && this._htSpriteSheet && this._htSpriteSheet[nValue]) {
					if (typeof sheet[0][0] !== "undefined") {
						if (this._htOption.spriteX !== null) { // 이미 spriteX가 있다면
							nOffsetX = sheet[this._htOption.spriteX][0];
							nOffsetY = sheet[this._htOption.spriteX][1];
						} else {
							nOffsetX = sheet[0][0];
							nOffsetY = sheet[0][1];
						}
					} else {
						nOffsetX = sheet[0];
						nOffsetY = sheet[1];
					}
					
					// 초기 위치 잡아줌
					this.set("offsetX", nOffsetX, true);
					this.set("offsetY", nOffsetY, true);
				} else if (sKey === "spriteX" && typeof sheet[nValue] !== "undefined") {
					this.set("offsetX", sheet[nValue][0], true);
					this.set("offsetY", sheet[nValue][1], true);
				}
			} else {
				var htImageSize = this.getImageSize();
				var nWidth = this._htOption.width;
				var nHeight = this._htOption.height;
				var nSpriteLength = this._htOption.spriteLength - 1; // 0부터 시작
				var nMaxSpriteX = (htImageSize.width / this._htOption.width) - 1;
				var nMaxSpriteY = (htImageSize.height / this._htOption.height) - 1;
				var nMaxOffsetX = htImageSize.width - 1;
				var nMaxOffsetY = htImageSize.height - 1;
				
				// spriteLength가 적용되어 있는 경우 최대 offset이 변경 됨
				if (nSpriteLength >= 0 && nHeight < htImageSize.height) {
					nMaxOffsetX = nMaxSpriteX * htImageSize.width;
					nMaxOffsetY = nMaxSpriteY * htImageSize.height;
				}
				
				switch (sKey) {
					case "spriteX" :
						var nOffsetX = 0;
						var nOffsetY = 0;
						
						// sprite길이를 지정했고 그게 최대 스프라이트 수보다 크다면 그것을 따라감
						if (nSpriteLength > nMaxSpriteX && nHeight < htImageSize.height) {
							nOffsetY = Math.floor(nValue / (nMaxSpriteX + 1)) * nHeight;
							nOffsetX = (nValue % (nMaxSpriteX + 1)) * nWidth;
						} else {
							nOffsetX = Math.min(nValue, nMaxSpriteX) * nWidth;
						}
						
						//TODO android 성능 문제, DisplayObject#set, timer, Animation#triggerCallback, spriteX 처리
						this.set("offsetX", nOffsetX, true);
						this.set("offsetY", nOffsetY, true);
						break;
						
					case "spriteY" :
						nValue = Math.min(nValue, nMaxSpriteY);
						this.set("offsetY", nValue * nHeight, true);
						break;
				}
			}
		}
	},
	
	/**
	 * attach된 이벤트 핸들러가 있는지 여부를 반환
	 *
	 * @return {Boolean}
	 */
	hasAttachedHandler : function () {
		if (
			this._htHandler && 
			(("click" in this._htHandler) && this._htHandler.click.length > 0) ||  
			(("mousedown" in this._htHandler) && this._htHandler.mousedown.length > 0) ||  
			(("mouseup" in this._htHandler) && this._htHandler.mouseup.length > 0)  
			) {
			return true;
		} else {
			return false;
		}
	},
	
	/**
	 * 특정 속도로 해당 지점까지 이동
	 * 
	 * @param {Number} nX 가고자 하는 곳의 x 좌표
	 * @param {Number} nY 가고자 하는 곳의 y 좌표
	 * @param {Number} nVelocity 초당 이동 거리(px), 속도가 0 이면 바로 이동한다.
	 * @param {Function} fCallback 이동이 끝난 후 실행될 콜백
	 * @param {collie.DisplayObject} fCallback.displayobject 현재 객체가 인자로 넘어감=
	 * @return {collie.AnimationTransition} 이동에 사용되는 타이머를 반환
	 */
	move : function (nX, nY, nVelocity, fCallback) {
		var nCurrentX = this._htOption.x;
		var nCurrentY = this._htOption.y;
		var nDistance = collie.util.getDistance(nCurrentX, nCurrentY, nX, nY);
		var nDuration = Math.round((nDistance / nVelocity) * 1000);
		
		if (this._oTimerMove !== null) {
			this._oTimerMove.stop();
			this._oTimerMove = null;
		}
		
		// duration이 없을 정도로 짧거나 속도가 0일 경우 Timer를 이용하지 않고 바로 이동
		if (!nVelocity || nDuration < collie.Renderer.getInfo().fps) {
			this.set({
				x : nX,
				y : nY
			});
			
			
			if (fCallback) {
				fCallback(this);
			}
		} else {
			var htOption = {
				from : [nCurrentX, nCurrentY],
				to : [nX, nY],
				set : ["x", "y"]
			};
			
			if (fCallback) {
				htOption.onComplete = function () {
					fCallback(this);
				};
			}
			
			this._oTimerMove = collie.Timer.transition(this, nDuration, htOption);
			return this._oTimerMove;
		}
	},
	
	/**
	 * 상대 경로로 이동
	 * 
	 * @param {Number} nX 가고자 하는 곳의 x 좌표
	 * @param {Number} nY 가고자 하는 곳의 y 좌표
	 * @param {Number} nVelocity 초당 이동 거리(px), 속도가 0 이면 바로 이동한다.
	 * @param {Function} fCallback 이동이 끝난 후 실행될 콜백
	 * @return {collie.AnimationTransition} 이동에 사용되는 타이머를 반환
	 */
	moveBy : function (nX, nY, nVelocity, fCallback) {
		var nCurrentX = this._htOption.x;
		var nCurrentY = this._htOption.y;
		return this.move(nCurrentX + nX, nCurrentY + nY, nVelocity, fCallback);
	},
	
	/**
	 * 문자열로 클래스 정보 반환
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "DisplayObject" + (this._htOption.name ? " " + this._htOption.name : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	},
	
	/**
	 * 객체 복사
	 * 이벤트는 복사되지 않는다.
	 * @param {Boolean} bRecursive 자식까지 모두 복사하는지 여부
	 * @return {collie.DisplayObject}
	 * @example
	 * var box = new collie.DisplayObject({
	 * 	width: 100,
	 * 	height: 100,
	 * 	backgroundColor: "blue"
	 * }).addTo(layer);
	 * 
	 * var box2 = box.clone().addTo(layer);
	 */
	clone : function (bRecursive) {
		var oDisplayObject = new this.constructor(this._htOption);
		
		if (bRecursive && this._aDisplayObjects.length) {
			for (var i = 0, l = this._aDisplayObjects.length; i < l; i++) {
				this._aDisplayObjects[i].clone(true).addTo(oDisplayObject);
			}
		}
		
		return oDisplayObject;
	}
}, collie.Component);

/**
 * 표시 객체 아이디를 할당한다. 1씩 늘어남
 * 
 * @static
 * @private
 */
collie.DisplayObject._idx = 0;

/**
 * 생성된 표시 객체를 담는다. Layer에 추가하지 않아도 표시 객체를 아이디로만 가져올 수 있다
 * 
 * @static
 * @private
 */
collie.DisplayObject.htFactory = {};
/**
 * 속도, 가속도, 마찰력, 질량을 포함한 표시 객체
 * - rotate는 마찰력이 없다
 * @class collie.MovableObject
 * @deprecated DisplayObject에 기능 추가
 * @extends collie.DisplayObject
 * @param {Object} [htOption] 설정
 * @param {Number} [htOption.velocityX=0] x축 속도(초당 px)
 * @param {Number} [htOption.velocityY=0] y축 속도(초당 px)
 * @param {Number} [htOption.velocityRotate=0] 회전 속도(초당 1도)
 * @param {Number} [htOption.forceX=0] x축 힘(초당 px)
 * @param {Number} [htOption.forceY=0] y축 힘(초당 px)
 * @param {Number} [htOption.forceRotate=0] 회전 힘(초당 1도)
 * @param {Number} [htOption.mass=1] 질량
 * @param {Number} [htOption.friction=0] 마찰력
 * @param {Boolean} [htOption.useRealTime=true] SkippedFrame을 적용해서 싸이클을 현재 시간과 일치
 */
collie.MovableObject = collie.Class(/** @lends collie.MovableObject.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		// this.option({
			// velocityX : 0,
			// velocityY : 0,
			// velocityRotate : 0,
			// forceX : 0,
			// forceY : 0,
			// forceRotate : 0,
			// mass : 1, // 질량
			// friction : 0, // 마찰
			// useRealTime : true
		// }, null, true);
	}
	
	/**
	 * 화면을 업데이트
	 * 
	 * @private
	 */
	// update : function (nFrameDuration, nX, nY, nLayerWidth, nLayerHeight) {
		// var nFrame = Math.max(17, nFrameDuration) / 1000;
// 		
		// // skippedFrame 적용을 하지 않는다면 1frame 씩만 그림
		// if (!this._htOption.useRealTime) {
			// nFrame = 1;
		// }
// 		
		// this._applyForce(nFrame);
		// this._applyRotation(nFrame);
		// this.constructor.$super.update.call(this, nFrameDuration, nX, nY, nLayerWidth, nLayerHeight);
// 		
		// // 움직임이 있으면 다시 바뀐 상태로 둠
		// if (
				// this._htOption.velocityX !== 0 ||
				// this._htOption.velocityY !== 0 ||
				// this._htOption.velocityRotate !== 0 ||
				// this._htOption.forceX !== 0 ||
				// this._htOption.forceY !== 0 ||
				// this._htOption.forceRotate !== 0
				// ) {
			// this.setChanged(true);
		// }
	// },
	
	/**
	 * @private
	 */
	// _getValueDirection : function (nValue) {
		// return Math.abs(nValue) / nValue;
	// },
	
	/**
	 * 회전 힘, 속도를 반영
	 * @private
	 */
	// _applyRotation : function (nFrame) {
		// if (this._htOption.forceRotate !== 0) {
			// this.set("velocityRotate", this._htOption.velocityRotate + this._htOption.forceRotate);
		// }
// 		
		// if (this._htOption.velocityRotate !== 0) {
			// var nAngleRad = collie.util.fixAngle(collie.util.toRad(this._htOption.angle + this._htOption.velocityRotate * nFrame));
			// this.set("angle", Math.round(collie.util.toDeg(nAngleRad) * 1000) / 1000);
		// }
	// },
	
	/**
	 * 힘을 속도에 반영
	 *  
	 * @private
	 */
	// _applyForce : function (nFrame) {
		// var htInfo = this.get();
		// var nVelocityX = htInfo.velocityX;
		// var nVelocityY = htInfo.velocityY;
		// var nX = htInfo.x;
		// var nY = htInfo.y;
// 		
		// // 힘 적용 a = F / m
		// nVelocityX += (htInfo.forceX / htInfo.mass) * nFrame;
		// nVelocityY += (htInfo.forceY / htInfo.mass) * nFrame;
// 		
		// // 마찰력 적용
		// var nForceFrictionX = htInfo.friction * nVelocityX * htInfo.mass * nFrame;
		// var nForceFrictionY = htInfo.friction * nVelocityY * htInfo.mass * nFrame;
// 		
		// if (nVelocityX !== 0) {
			// nVelocityX = (this._getValueDirection(nVelocityX) !== this._getValueDirection(nVelocityX - nForceFrictionX)) ? 0 : nVelocityX - nForceFrictionX;
		// }
// 		
		// if (nVelocityY !== 0) {
			// nVelocityY = (this._getValueDirection(nVelocityY) !== this._getValueDirection(nVelocityY - nForceFrictionY)) ? 0 : nVelocityY - nForceFrictionY;
		// }
// 		
		// nX += nVelocityX * nFrame;
		// nY += nVelocityY * nFrame;
		// nVelocityX = Math.floor(nVelocityX * 1000) / 1000;
		// nVelocityY = Math.floor(nVelocityY * 1000) / 1000;
// 		
		// if (htInfo.friction && Math.abs(nVelocityX) < 0.05) {
			// nVelocityX = 0;
		// }
// 		
		// if (htInfo.friction && Math.abs(nVelocityY) < 0.05) {
			// nVelocityY = 0;
		// }
// 	
		// // 변경이 있을 때만 설정
		// if (
			// nX != htInfo.x ||
			// nY != htInfo.y ||
			// nVelocityX != htInfo.velocityX ||
			// nVelocityY != htInfo.velocityY
		// ) {
			// this.set({
				// x : nX,
				// y : nY,
				// velocityX : nVelocityX,
				// velocityY : nVelocityY
			// });
		// }
	// },
	
	/**
	 * 문자열로 클래스 정보 반환
	 * 
	 * @deprecated
	 * @return {String}
	 */
	// toString : function () {
		// return "MovableObject" + (this._htOption.name ? " " + this._htOption.name : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	// }
}, collie.DisplayObject);
/**
 * Rectangle
 * - Rounded
 * @class collie.Rectangle
 * @extends collie.DisplayObject
 * @param {Object} [htOption] 설정
 * @param {Number} [htOption.radius=0] 테두리 굴림 값 (px)
 * @param {String} [htOption.strokeColor] 테두리 색상
 * @param {Number} [htOption.strokeWidth=0] 테두리 굵기(0이면 테두리 없음)
 * @param {String} [htOption.fillColor] 채울 색상(없으면 투명)
 * @param {String} [htOption.fillImage] 채울 이미지
 */
collie.Rectangle = collie.Class(/** @lends collie.Rectangle.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this.option({
			radius : 0,
			strokeColor : '',
			strokeWidth : 0,
			fillColor : '',
			fillImage : ''
		}, null, true);
		
		this._sBorderRadius = collie.util.getCSSPrefix("border-radius", true);
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onDOMDraw : function (oEvent) {
		if (this._bChanged) {
			if (this._htOption.radius) {
				oEvent.element.style[this._sBorderRadius] = this._htOption.radius + "px";
				oEvent.element.style.borderRadius = this._htOption.radius + "px";
			}
			
			if (this._htOption.fillImage) {
				collie.ImageManager.getImage(this._htOption.fillImage, function (el) {
					oEvent.element.style.backgroundImage = "url('" + el.src + "')";
				});
			} else if (this._htOption.fillColor) {
				oEvent.element.style.backgroundColor = this._htOption.fillColor;
			}
			
			if (this._htOption.strokeWidth) {
				oEvent.element.style.border = this._htOption.strokeWidth + "px solid " + this._htOption.strokeColor;
			}
			
			this._bChanged = false;
		}		
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onCanvasDraw : function (oEvent) {
		var oContext = oEvent.context;
		var nRadius = this._htOption.radius;
		var bIsRetinaDisplay = collie.Renderer.isRetinaDisplay();
		var nWidth = this._htOption.width;
		var nHeight = this._htOption.height;
		var nStrokeWidth = this._htOption.strokeWidth;
		
		// 레티나 디스플레이 대응
		if (bIsRetinaDisplay) {
			nWidth *= 2;
			nHeight *= 2;
			nRadius *= 2;
			nStrokeWidth *= 2;
		}
		
		if (htInfo.fillImage) {
			var el = collie.ImageManager.getImage(htInfo.fillImage);
			
			if (!el) {
				collie.ImageManager.getImage(htInfo.fillImage, function () {
					this.setChanged();
				}.bind(this));
			} else {
				var pattern = oContext.createPattern(el, "repeat");
				oContext.fillStyle = pattern;
			}
		} else if (htInfo.fillColor) {
			oContext.fillStyle = htInfo.fillColor;
		}
		
		if (this._htOption.strokeColor) {
			oContext.strokeStyle = this._htOption.strokeColor;
		}
		
		if (this._htOption.strokeWidth) {
			oContext.lineWidth = nStrokeWidth;
		}
		
		if (nRadius) {
			oContext.save();
			oContext.translate(oEvent.x, oEvent.y);
			oContext.beginPath();
			oContext.moveTo(nRadius, 0);
			oContext.lineTo(nWidth - nRadius, 0);
			oContext.quadraticCurveTo(nWidth, 0, nWidth, nRadius);
			oContext.lineTo(nWidth, nHeight - nRadius);
			oContext.quadraticCurveTo(nWidth, nHeight, nWidth - nRadius, nHeight);
			oContext.lineTo(nRadius, nHeight);
			oContext.quadraticCurveTo(0, nHeight, 0, nHeight - nRadius);
			oContext.lineTo(0, nRadius);
			oContext.quadraticCurveTo(0, 0, nRadius, 0);
			oContext.closePath();
			oContext.restore();
			
			if (this._htOption.fillColor || this._htOption.fillImage) {
				oContext.fill();
			}    
			
			if (this._htOption.strokeWidth) {
				oContext.stroke();
			}
		} else {
			if (this._htOption.fillColor || this._htOption.fillImage) {
				oContext.fillRect(oEvent.x, oEvent.y, nWidth, nHeight);
			}
			
			if (this._htOption.strokeWidth) {
				oContext.strokeRect(oEvent.x, oEvent.y, nWidth, nHeight);
			}
		}
		
		this._bChanged = false;
	},
	
	/**
	 * 문자열로 클래스 정보 반환
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "Rectangle" + (this.get("name") ? " " + this.get("name") : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	}
}, collie.DisplayObject);
/**
 * Drawing Circle
 * If you want to see a circle using DOM Rendering, you need the <a href="http://raphaeljs.com" target="_blank">Raphael.js</a> 2.1.0 or above.
 * 
 * @class
 * @extends collie.DisplayObject
 * @requires http://raphaeljs.com
 * @param {Object} [htOption] Options
 * @param {Number} [htOption.radius=0] Radius(px)
 * @param {String} [htOption.strokeColor] Stroke color
 * @param {Number} [htOption.strokeWidth=0] Border width. It'll be disappear when you set this option as 0.
 * @param {String} [htOption.fillColor] Inside color. The Default value is a transparent color.
 * @param {String} [htOption.fillImage] Fill the image inside a polyline
 * @param {Number} [htOption.startAngle=0] Starting Angle(degree)
 * @param {Number} [htOption.endAngle=360] Ending Angle(degree), The Circle would be fully filled when you set starting angle as 0 and set ending angle as 360.
 * @param {Boolean} [htOption.closePath=false] Closing a Path. like a pac-man.
 * @param {Boolean} [htOption.autoExpand=true] When this options set as true, the circle object expands to fit size to diameter.
 * @param {Boolean} [htOption.anticlockwise=false] The Circle will be filled anticlockwise when you set this option as true.
 * @example
 * // Draw a Circle
 * var circle = new collie.Circle({
 * 	radius : 20 // The circle object just expands to fit size to diameter. (width:40, height:40)
 * }).addTo(layer);
 * 
 * // arc
 * circle.set({
 * 	startAngle : 0,
 * 	endAngle : 270
 * });
 * 
 * // a pac-man
 * circle.set({
 * 	startAngle : 45,
 * 	endAngle : 315,
 * 	closePath : true
 * });
 */
collie.Circle = collie.Class(/** @lends collie.Circle.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this.option({
			radius : 0,
			strokeColor : '#000000',
			strokeWidth : 0,
			fillColor : '',
			fillImage : '',
			startAngle : 0,
			endAngle : 360,
			closePath : false,
			anticlockwise : false,
			autoExpand : true
		}, null, true);
		
		this._oPaper = null;
		this.optionSetter("radius", this._expandSize.bind(this));
		this._expandSize();
	},
	
	_expandSize : function () {
		if (this._htOption.autoExpand && this._htOption.radius) {
			var size = this._htOption.radius * 2 + this._htOption.strokeWidth;
			this.set("width", size);
			this.set("height", size);
		}
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onDOMDraw : function (oEvent) {
		var el = oEvent.element;
		
		if (typeof Raphael === "undefined") {
			return;
		}
		
		var htInfo = this.get();
		var nStrokeWidth = htInfo.strokeWidth;
		var nRadius = htInfo.radius;
		var nWidth = htInfo.width;
		var nHeight = htInfo.height;
		var htDirty = this.getDirty();
		var circle;
		
		if (this._oPaper === null) {
			this._oPaper = Raphael(el, nWidth + nStrokeWidth, nHeight + nStrokeWidth);
			this._oPaper.canvas.style.zIndex = 10;
		} else if (htDirty && (htDirty.width || htDirty.height)) {
			this._oPaper.setSize(nWidth, nHeight);
		}
		
		el.style.left = -(nStrokeWidth / 2) + "px";
		el.style.top = -(nStrokeWidth / 2) + "px";
		this._oPaper.clear();
		
		if (nRadius) {
			var rx = nRadius;
			var ry = nRadius;
			var x1 = rx + nRadius * Math.cos(collie.util.toRad(htInfo.startAngle));
			var y1 = ry + nRadius * Math.sin(collie.util.toRad(htInfo.startAngle));
			var x2 = rx + nRadius * Math.cos(collie.util.toRad(htInfo.endAngle));
			var y2 = ry + nRadius * Math.sin(collie.util.toRad(htInfo.endAngle));
			var angle = htInfo.anticlockwise ? htInfo.startAngle - htInfo.endAngle : htInfo.endAngle - htInfo.startAngle;
			
			if (Math.abs(angle) >= 360) {
			  angle = 360;
			} else if (angle < 0) {
			  angle += 360;
			}
			
			var flag1 = (angle > 180 ? 1 : 0);
			var flag2 = htInfo.anticlockwise ? 0 : 1;
			
			if (angle >= 360) {
				circle = this._oPaper.circle(rx, ry, nRadius);
			} else {
				circle = this._oPaper.path("M" + x1 + "," + y1 + "a" + nRadius + "," + nRadius + ",0," + flag1 + "," + flag2 + "," + (x2 -x1) + "," + (y2 -y1) + (htInfo.closePath ? "L" + rx + "," + ry + "L" + x1 + "," + y1 + "Z" : ""));
			}
		}
		
		if (circle) {
			circle.transform("t" + (nStrokeWidth / 2) + "," + (nStrokeWidth / 2));
			
			if (htInfo.fillImage) {
				collie.ImageManager.getImage(htInfo.fillImage, function (el) {
					circle.attr("fill", "url('" + el.src + "')");
				});
			} else if (htInfo.fillColor) {
				circle.attr("fill", htInfo.fillColor);
			}
			
			if (htInfo.strokeColor) {
				circle.attr("stroke", htInfo.strokeColor);
			}
			
			circle.attr("stroke-width", htInfo.strokeWidth);
		}
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onCanvasDraw : function (oEvent) {
		var htInfo = this.get();		
		var oContext = oEvent.context;
		var nX = oEvent.x;
		var nY = oEvent.y;
		var bIsRetinaDispaly = collie.Renderer.isRetinaDisplay();
		var nRadius = htInfo.radius;
		var nStrokeWidth = htInfo.strokeWidth;
		var nWidth = htInfo.width;
		var nHeight = htInfo.height;
		
		if (bIsRetinaDispaly) {
			nWidth *= 2;
			nHeight *= 2;
			nRadius *= 2;
			nStrokeWidth *= 2;
		}
		
		if (htInfo.fillImage) {
			var el = collie.ImageManager.getImage(htInfo.fillImage);
			
			if (!el) {
				collie.ImageManager.getImage(htInfo.fillImage, function () {
					this.setChanged();
				}.bind(this));
			} else {
				var pattern = oContext.createPattern(el, "repeat");
				oContext.fillStyle = pattern;
			}
		} else if (htInfo.fillColor) {
			oContext.fillStyle = htInfo.fillColor;
		}
		
		if (htInfo.strokeColor) {
			oContext.strokeStyle = htInfo.strokeColor;
		}
		
		if (nStrokeWidth) {
			oContext.lineWidth = nStrokeWidth;
		}
		
		if (nRadius) {
			var rx = nX + nRadius;
			var ry = nY + nRadius;
			var bFullCircle = Math.abs(htInfo.startAngle - htInfo.endAngle) >= 360;
			
			oContext.beginPath();
			
			if (htInfo.closePath && !bFullCircle) {
				oContext.moveTo(rx, ry);
			}
			
			oContext.arc(rx, ry, nRadius, collie.util.toRad(htInfo.startAngle), collie.util.toRad(htInfo.endAngle), htInfo.anticlockwise);			
			
			if (htInfo.closePath) {
				oContext.closePath();
			}
			
			if (htInfo.fillColor || htInfo.fillImage) {
				oContext.fill();
			}    
			
			if (htInfo.strokeWidth) {
				oContext.stroke();
			}
			
		}
	},
	
	/**
	 * Move a position by a center of the circle.
	 * 
	 * @param {Number} nCenterX
	 * @param {Number} nCenterY
	 * @return {collie.Circle} For the method chaining
	 */
	center : function (nCenterX, nCenterY) {
		this.set("x", nCenterX - this._htOption.radius);
		this.set("y", nCenterY - this._htOption.radius);
		return this;
	},
	
	/**
	 * Returns information of The Class as String
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "Circle" + (this._htOption.name ? " " + this._htOption.name : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	}
}, collie.DisplayObject);
/**
 * Drawing Polyline
 * If you want to see a polyline using DOM Rendering, you need the <a href="http://raphaeljs.com" target="_blank">Raphael.js</a> 2.1.0 or above.
 * 
 * @class collie.Polyline
 * @extends collie.DisplayObject
 * @requires http://raphaeljs.com
 * @param {Object} [htOption] Options
 * @param {String} [htOption.strokeColor]
 * @param {Number} [htOption.strokeWidth=0] When this option set as 0, The stroke disappears.
 * @param {String} [htOption.fillColor]
 * @param {String} [htOption.fillImage] Fill the image inside a polyline
 * @param {String} [htOption.closePath=false] Closing a Path
 * @param {String} [htOption.dashArray] ["", "-", ".", "-.", "-..", ". ", "- ", "--", "- .", "--.", "--.."]
 * @param {String} [htOption.lineCap="butt"] ["butt", "square", "round"]
 * @param {String} [htOption.lineJoin="miter"] ["bevel", "round", "miter"]
 * @param {Number} [htOption.miterLimit=10]
 * @example
 * // Draw a Rectangle
 * var line = new collie.Polyline({
 * 	closePath : true
 * }).addTo(layer);
 * line.setPointData([
 * 	[0, 0],
 * 	[100, 0],
 * 	[100, 100],
 * 	[0, 100]
 * ]);
 * 
 * // using moveTo
 * line.moveTo(200, 0);
 * line.lineTo(300, 0);
 * line.lineTo(300, 100);
 * line.lineTo(200, 100);
 * line.lineTo(200, 0); // expand boundary and set change status.
 */
collie.Polyline = collie.Class(/** @lends collie.Polyline.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this.option({
			strokeColor : '#000000',
			strokeWidth : 1,
			fillColor : '',
			fillImage : '',
			lineCap : "butt",
			lineJoin : "miter",
			miterLimit : 10,
			dashArray : "",	
			closePath : false // 마지막을 자동으로 연결해 줌
		}, null, true);
		this._aPointData = [];
		this._oPaper = null;
		this._htPointBoundary = {
			right : null,
			bottom : null
		};
	},
	
	/**
	 * Set points for drawing
	 * 
	 * @param {Array} aPointData [[x1, y1, bMoveTo], [x2, y2, bMoveTo], ...]
	 * @param {Boolean} bSkipExpandSize You can this option set as true if you don't want to expand size
	 */
	setPointData : function (aPointData, bSkipExpandSize) {
		this._aPointData = aPointData;
		this.setChanged();
		
		if (!bSkipExpandSize) {
			this._expandBoundary(aPointData);
		}
	},
	
	/**
	 * Return points
	 * 
	 * @return {Array}
	 */
	getPointData : function () {
		return this._aPointData;
	},
	
	/**
	 * Add a point
	 * @param {Number} nX
	 * @param {Number} nY
	 * @param {Boolean} bSkipExpandSize You can this option set as true if you don't want to expand size
	 */	
	addPoint : function (nX, nY, bSkipExpandSize) {
		this._aPointData.push([nX, nY]);
		this.setChanged();
		
		if (!bSkipExpandSize) {
			this._expandBoundary(nX, nY);
		}
	},
	
	/**
	 * Move a cursor position
	 * 
	 * @param {Number} nX
	 * @param {Number} nY
	 */
	moveTo : function (nX, nY) {
		this._aPointData.push([nX, nY, true]);
	},
	
	/**
	 * Alias for the addPoint method
	 * @see collie.Polyline#addPoint
	 */
	lineTo : function (nX, nY, bSkipExpandSize) {
		this.addPoint(nX, nY, bSkipExpandSize);
	},
	
	/**
	 * Reset points
	 */
	resetPointData : function () {
		this._aPointData = [];
		this._htPointBoundary = {
			right : null,
			bottom : null
		};
		this.setChanged();
	},
	
	/**
	 * 포인트 영역을 늘린다
	 * @private
	 * 
	 * @param {Array|Number} nX 배열로 들어오면 배열을 돌면서 확장 한다
	 * @param {Number} nY
	 * @param {Boolean} bSkipAdoptSize 크기를 객체에 적용하는 것을 생략한다
	 */
	_expandBoundary : function (nX, nY, bSkipAdoptSize) {
		if (nX instanceof Array) {
			for (var i = 0, len = nX.length; i < len; i++) {
				this._expandBoundary(nX[i][0], nX[i][1], true);
			}
		} else {
			this._htPointBoundary.right = this._htPointBoundary.right === null ? nX : Math.max(nX, this._htPointBoundary.right);
			this._htPointBoundary.bottom = this._htPointBoundary.bottom === null ? nY : Math.max(nY, this._htPointBoundary.bottom);
		}
		
		// 크기 적용
		if (!bSkipAdoptSize) {
			var nStrokeWidth = this._htOption.strokeWidth * (collie.Renderer.isRetinaDisplay() ? 2 : 1);
			var nWidth = this._htPointBoundary.right + nStrokeWidth * 2;
			var nHeight = this._htPointBoundary.bottom + nStrokeWidth * 2; 
			this.set({
				width : nWidth,
				height : nHeight
			});
			
			
			if (this._oPaper !== null) {
				this._oPaper.setSize(nWidth, nHeight);
			}
		}
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onDOMDraw : function (oEvent) {
		var el = oEvent.element;
		
		// 점이 2개 미만이면 그리지 않는다
		if (this._aPointData.length < 2) {
			return;
		}
		
		if (typeof Raphael === "undefined") {
			return;
		}
		
		var htInfo = this.get();
		var nStrokeWidth = htInfo.strokeWidth;
		var htDirty = this.getDirty();
		
		if (this._oPaper === null) {
			this._oPaper = Raphael(el, htInfo.width, htInfo.height);
			this._oPaper.canvas.style.zIndex = 10;
		} else if (htDirty && (htDirty.width || htDirty.height)) {
			this._oPaper.setSize(htInfo.width, htInfo.height);
		}
		
		el.style.left = -(nStrokeWidth / 2) + "px";
		el.style.top = -(nStrokeWidth / 2) + "px";
		this._oPaper.clear();
		
		var str = "M" + this._aPointData[0][0] + "," + this._aPointData[0][1];
		
		for (var i = 1, len = this._aPointData.length; i < len; i++) {
			str += (this._aPointData[i][2] ? "M" : "L") + this._aPointData[i][0] + "," + this._aPointData[i][1];
		}
		
		// 마지막이 연결되어 있지 않다면
		if (
			htInfo.closePath && (
				this._aPointData[0][0] !== this._aPointData[this._aPointData.length - 1][0] || 
				this._aPointData[0][1] !== this._aPointData[this._aPointData.length - 1][1]
			) 
		) {
			str += "L" + this._aPointData[0][0] + "," + this._aPointData[0][1];
		}
		
		var line = this._oPaper.path(str + (htInfo.closePath ? "Z" : ""));
		line.transform("t" + (nStrokeWidth / 2) + "," + (nStrokeWidth / 2));
		
		if (htInfo.fillImage) {
			collie.ImageManager.getImage(htInfo.fillImage, function (el) {
				line.attr("fill", "url('" + el.src + "')");
			});
		} else if (htInfo.fillColor) {
			line.attr("fill", htInfo.fillColor);
		}
		
		if (htInfo.lineCap) {
			line.attr("stroke-linecap", htInfo.lineCap);
		}
		
		if (htInfo.lineJoin) {
			line.attr("stroke-linejoin", htInfo.lineJoin);
		}
		
		if (htInfo.miterLimit !== null) {
			line.attr("stroke-miterlimit", htInfo.miterLimit);
		}
		
		if (htInfo.strokeColor) {
			line.attr("stroke", htInfo.strokeColor);
		}
		
		line.attr("stroke-width", nStrokeWidth);
		
		if (htInfo.dashArray) {
			line.attr("stroke-dasharray", htInfo.dashArray);
		}
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onCanvasDraw : function (oEvent) {
		// 점이 2개 미만이면 그리지 않는다
		if (this._aPointData.length < 2) {
			return;
		}
		
		var htInfo = this.get();		
		var oContext = oEvent.context;
		var bIsRetinaDisplay = collie.Renderer.isRetinaDisplay();
		var nStrokeWidth = htInfo.strokeWidth;
		var nRatio = (bIsRetinaDisplay ? 2 : 1);
		
		oContext.save();
		oContext.translate(oEvent.x, oEvent.y);
		
		// 레티나 디스플레이 대응
		if (bIsRetinaDisplay) {
			nStrokeWidth *= 2;
		}
		
		if (htInfo.fillImage) {
			var el = collie.ImageManager.getImage(htInfo.fillImage);
			
			if (!el) {
				collie.ImageManager.getImage(htInfo.fillImage, function () {
					this.setChanged();
				}.bind(this));
			} else {
				var pattern = oContext.createPattern(el, "repeat");
				oContext.fillStyle = pattern;
			}
		} else if (htInfo.fillColor) {
			oContext.fillStyle = htInfo.fillColor;
		}
		
		if (htInfo.strokeColor) {
			oContext.strokeStyle = htInfo.strokeColor;
		}
		
		oContext.lineWidth = nStrokeWidth;
		
		if (htInfo.lineCap) {
			oContext.lineCap = htInfo.lineCap;
		}
		
		if (htInfo.lineJoin) {
			oContext.lineJoin = htInfo.lineJoin;
		}
		
		if (htInfo.miterLimit) {
			oContext.miterLimit = htInfo.miterLimit;
		}
		
		if (htInfo.dashArray) {
			// moveTo를 하면 fill이 안된다 연결된 선을 하나 더 그려서 해결한다
			if (htInfo.fillColor || htInfo.fillImage) {
				oContext.beginPath();
				oContext.moveTo(this._aPointData[0][0] * nRatio, this._aPointData[0][1] * nRatio);
				
				for (var i = 1, len = this._aPointData.length; i < len; i++) {
					if (this._aPointData[i][2]) {
						oContext.moveTo(this._aPointData[i][0] * nRatio, this._aPointData[i][1] * nRatio);
						continue;
					}
		
					oContext.lineTo(this._aPointData[i][0] * nRatio, this._aPointData[i][1] * nRatio);
				}
				
				if (htInfo.closePath) {
					oContext.closePath();
				}
				
				oContext.fill();
			}
			
			oContext.resetDashedLine();
		}		
		
		// 앞에 그린 선은 지워진다
		oContext.beginPath();
		oContext.moveTo(this._aPointData[0][0] * nRatio, this._aPointData[0][1] * nRatio);
		
		for (var i = 1, len = this._aPointData.length; i < len; i++) {
			// moveTo
			if (this._aPointData[i][2]) {
				oContext.moveTo(this._aPointData[i][0] * nRatio, this._aPointData[i][1] * nRatio);
				continue;
			}

			if (htInfo.dashArray) {
				oContext.dashedLine(this._aPointData[i - 1][0] * nRatio, this._aPointData[i - 1][1] * nRatio, this._aPointData[i][0] * nRatio, this._aPointData[i][1] * nRatio, collie.raphaelDashArray[htInfo.dashArray], nStrokeWidth);
			} else {
				oContext.lineTo(this._aPointData[i][0] * nRatio, this._aPointData[i][1] * nRatio);
			}
		}
		
		// 마지막이 연결되어 있지 않다면
		if (
			htInfo.dashArray && htInfo.closePath && (
			this._aPointData[0][0] !== this._aPointData[this._aPointData.length - 1][0] || 
			this._aPointData[0][1] !== this._aPointData[this._aPointData.length - 1][1]
		)) {
			oContext.dashedLine(this._aPointData[i - 1][0] * nRatio, this._aPointData[i - 1][1] * nRatio, this._aPointData[0][0] * nRatio, this._aPointData[0][1] * nRatio, collie.raphaelDashArray[htInfo.dashArray], nStrokeWidth);
		}
		
		if (htInfo.closePath) {
			oContext.closePath();
		}
		
		if (!htInfo.dashArray && (htInfo.fillColor || htInfo.fillImage)) {
			oContext.fill();
		}
		
		if (htInfo.strokeWidth) {
			oContext.stroke();
		}
		
		oContext.restore();
	},
	
	/**
	 * Returns information of The Class as String
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "Polyline" + (this._htOption.name ? " " + this._htOption.name : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	}
}, collie.DisplayObject);
/**
 * Text
 * - 말줄임은 Canvas일 때만 된다. DOM은 미구현
 * TODO Text는 말줄임과 자동 줄바꿈 때문에 모바일에서 사용하면 굉장히 느리다. WebWorker를 쓸 수 있는지 확인해 봐야 할 것
 * 
 * @class collie.Text
 * @extends collie.DisplayObject
 * @param {Object} [htOption]
 * @param {Object} [htOption.fontFamily='Arial'] 글꼴
 * @param {Object} [htOption.fontWeight=''] 스타일, bold 면 진하게
 * @param {Object} [htOption.fontSize=12] 크기 (px)
 * @param {Object} [htOption.fontColor='#000000'] 글꼴 색상
 * @param {Object} [htOption.lineHeight="auto"] 라인 간격 (px), auto면 자동으로 맞춰짐
 * @param {Object} [htOption.textAlign='left'] 텍스트 정렬  left, center, right
 * @param {Object} [htOption.padding="0 0 0 0"] 텍스트 패딩 (px) top right bottom left
 * @param {Object} [htOption.ellipsisMaxLine=0] 최대 라인 수. 라인 수를 넘을 경우 말줄임 함. (0이면 사용 안함)
 * @param {Object} [htOption.ellipsisString='...'] 말줄임 할 때 대체할 텍스트
 * @param {Object} [htOption.useEllipsis=false] 말줄임 사용 여부
 * @example
 * 기본적인 사용법
 * <code>
 * var oText = new collie.Text({
 * 	width : 100, // 너비와 높이를 반드시 지정해야 합니다.
 * 	height : 100,
 * 	x : 0,
 * 	y : 0,
 * 	fontColor : "#000000"
 * }).text("테스트 입니다");
 * </code>
 */
collie.Text = collie.Class(/** @lends collie.Text.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this._sText = "";
		this.option({
			fontFamily : 'Arial', // 글꼴 스타일
			fontWeight : '', // bold
			fontSize : 12, // px
			fontColor : '#000000', // 글꼴 색상
			lineHeight : "auto", // 라인 간격, px null이면 auto면 자동
			textAlign : 'left', // 텍스트 정렬 left, center, right
			padding : "0 0 0 0", // 텍스트 패딩
			ellipsisMaxLine : 0, // 최대 라인 수. 지정하면 말줄임 함
			ellipsisString : '...', // 말줄임 텍스트
			useEllipsis : false, // 말줄임 사용 여부
			useCache : true // useCache 기본값 true
		}, null, true /* Don't overwrite options */);
		
		this._elText = null;
		this._nTextWidth = 0;
		this._nRatio = 1;
		this._aCallbackTextWidth = [];
	},
	
	_initElement : function () {
		if (this._elText === null) {
			this._elText = document.createElement("div");
			this._elText.style.display = "inline";
			this.getDrawing().getItemElement().appendChild(this._elText);
		}
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onCanvasDraw : function (oEvent) {
		this._nRatio = this._sRenderingMode === "canvas" && this._bRetinaDisplay ? 2 : 1;
		this._oContext = oEvent.context;
		var nMaxWidth = this._getMaxWidth();
		this._oContext.font = this._getFontText();
		this._oContext.fillStyle = this._htOption.fontColor;
		this._oContext.textBaseline = "top";
		this._fillTextMultiline(this._wordWrap(nMaxWidth).split("\n"), oEvent.x, oEvent.y);
		this._triggerGetTextWidth();
	},
	
	/**
	 * Delegate
	 * @private
	 */
	onDOMDraw : function (oEvent) {
		this._initElement();
		var oDrawing = this.getDrawing();
		var el = oEvent.element;
		var sText = this._sText.replace(/\n/g, "<br />");
		var elStyle = el.style;
		elStyle.font = this._getFontText();
		elStyle.color = this._htOption.fontColor;
		elStyle.padding = this._getPadding().replace(/ /g, "px ") + "px";
		elStyle.width = this._getMaxWidth() + "px";
		elStyle.height = this._getMaxHeight() + "px";
		elStyle.lineHeight = this._getLineHeight() + "px";
		elStyle.textAlign = this._htOption.textAlign;
		
		if (this._elText.innerHTML != sText) {
			this._elText.innerHTML = sText;
		}
		
		this.unsetChanged();
		this._getDOMTextWidth();
		this._triggerGetTextWidth();
	},
	
	_getDOMTextWidth : function () {
		if (this._elText !== null) {
			this._nTextWidth = this._elText.offsetWidth;
		}
	},
	
	_getFontText : function () {
		return this._htOption.fontWeight + " " + (this._htOption.fontSize * this._nRatio) + "px " + this._htOption.fontFamily;
	},
	
	_getLineHeight : function () {
		return this._htOption.lineHeight === "auto" ? (this._htOption.fontSize * this._nRatio) : this._htOption.lineHeight * this._nRatio;
	},
	
	/**
	 * 여러 줄의 텍스트를 연달아 쓴다
	 * 
	 * @private
	 * @param {Array} aText 한 배열 당 한 줄
	 */
	_fillTextMultiline : function (aText, nX, nY) {
		var nLeft = this._getPadding("left");
		var nMaxLine = this._htOption.ellipsisMaxLine;
		this._nTextWidth = 0;
		
		for (var i = 0; i < aText.length; i++) {
			if (nMaxLine && i >= nMaxLine - 1) {
				// 말줄임이 필요하면
				if (aText.length > nMaxLine) {
					aText[i] = this._insertEllipsisText(aText[i]);
					aText.splice(i + 1, aText.length - (i + 1)); // 멈춤
				}
			}
			
			var nTextWidth = this._oContext.measureText(aText[i]).width;
			
			if (this._htOption.textAlign === "center") {
				nLeft = this._getMaxWidth() / 2 - nTextWidth / 2 + this._getPadding("left");
			} else if (this._htOption.textAlign === "right") {
				nLeft = ((this._htOption.width * this._nRatio) - this._getPadding("right")) - nTextWidth;
			}
			
			this._oContext.fillText(aText[i], nX + nLeft, nY + this._getTopPosition(i + 1));
			this._nTextWidth = Math.max(this._nTextWidth, nTextWidth);
		}
	},
	
	_getMaxWidth : function () {
		return (this._htOption.width * this._nRatio) - (this._getPadding("left") + this._getPadding("right"));
	},
	
	_getMaxHeight : function () {
		return (this._htOption.height * this._nRatio) - (this._getPadding("top") + this._getPadding("bottom"));
	},
	
	/**
	 * 시작 top 위치를 반환
	 * 
	 * @private
	 * @param {Number} nLine 라인번호, 1부터 시작
	 */
	_getTopPosition : function (nLine) {
		return this._getLineHeight() * (nLine - 1) + this._getPadding("top");
	},
	
	/**
	 * 해당 포지션의 패딩 값을 반환한다
	 * 
	 * @param {String} sPositionName top, right, bottom, left, 값이 없으면 전체 문자열을 반환, 단위는 쓰지 않는다. px
	 * @return {Number|String}
	 * @private
	 */
	_getPadding : function (sPositionName) {
		var sPadding = this._htOption.padding || "0 0 0 0";
		var aPadding = sPadding.split(" ");
		
		for (var i = 0, len = aPadding.length; i < len; i++) {
			aPadding[i] = parseInt(aPadding[i], 10) * this._nRatio;
		}
		
		switch (sPositionName) {
			case "top" :
				return aPadding[0];
				
			case "right" :
				return aPadding[1];
				
			case "bottom" :
				return aPadding[2];
				
			case "left" :
				return aPadding[3];
				
			default :
				return aPadding.join(" ");
		}
	},
	
	/**
	 * 말줄임된 텍스트를 반환
	 * @private
	 */
	_insertEllipsisText : function (sText) {
		var nWidth = this._getMaxWidth();
		var sEllipsizedText = '';
		
		for (var i = sText.length; i > 0; i--) {
			sEllipsizedText = sText.substr(0, i) + this._htOption.ellipsisString;
			
			if (this._oContext.measureText(sEllipsizedText).width <= nWidth) {
				return sEllipsizedText;
			}
		}
		
		return sText;
	},
	
	/**
	 * 자동 줄바꿈
	 * - 재귀 호출
	 *
	 * @ignore
	 * @param {Number} nWidth 줄바꿈 될 너비
	 * @param {String} sText 텍스트, 재귀호출 되면서 나머지 길이의 텍스트가 들어간다
	 * @return {String} 줄바꿈된 테스트
	 */
	_wordWrap : function (nWidth, sText) {
		var sOriginalText = sText || this._sText;
		var nCount = 1;
		
		// 원본 문자가 없으면
		if (!sOriginalText) {
			return '';
		}
		
		sText = sOriginalText.substr(0, 1);
		
		// 첫자부터 시작해서 해당 너비까지 도달하면 자르기
		while (this._oContext.measureText(sText).width <= nWidth) {
			nCount++;
			
			// 더이상 못자르면 반환
			if (nCount > sOriginalText.length) {
				return sText;
			}
			
			// 자르기
			sText = sOriginalText.substr(0, nCount);
			
			// 줄바꿈 문자면 지나감
			if (sOriginalText.substr(nCount - 1, 1) === "\n") {
				break;
			}
		}
		
		nCount = Math.max(1, nCount - 1);
		sText = sOriginalText.substr(0, nCount);
		
		// 다음 문자가 줄바꿈문자면 지나감
		if (sOriginalText.substr(nCount, 1) === "\n") {
			nCount++;
		}
		
		// 뒤에 더 남아있다면 재귀 호출
		if (sOriginalText.length > nCount) {
			sText += "\n" + (this._wordWrap(nWidth, sOriginalText.substr(nCount)));
		}
		
		return sText;
	},
	
	/**
	 * 텍스트를 쓴다
	 * Write text
	 * 
	 * @param {String} sText 출력할 데이터 text data
	 * @return {collie.Text} 메서드 체이닝을 위해 자기 자신을 반환. return self instance for method chaining
	 */
	text : function (sText) {
		this._nTextWidth = 0;
		this._aCallbackTextWidth = [];
		this._sText = sText.toString();
		this.setChanged();
		return this;
	},
	
	/**
	 * 텍스트 최대 너비를 반환, 그려지기 전에는 반환이 되지 않기 때문에 callback 함수를 넣어 그려진 후에 값을 받아올 수 있다
	 * 콜백 함수 첫번째 인자가 너비 값
	 * @param {Function} fCallback
	 * @return {Number} 텍스트 최대 너비
	 */
	getTextWidth : function (fCallback) {
		if (fCallback) {
			this._aCallbackTextWidth.push(fCallback);
		}
		
		if (this._nTextWidth) {
			this._triggerGetTextWidth();
			return this._nTextWidth / this._nRatio;
		}
	},
	
	_triggerGetTextWidth : function () {
		if (this._aCallbackTextWidth.length > 0) {
			for (var i = 0, len = this._aCallbackTextWidth.length; i < len; i++) {
				this._aCallbackTextWidth[i](this._nTextWidth / this._nRatio);
			}
			
			this._aCallbackTextWidth = [];
		}
	},
	
	/**
	 * 문자열로 클래스 정보 반환
	 * 
	 * @return {String}
	 */
	toString : function () {
		return "Text" + (this._htOption.name ? " " + this._htOption.name : "")+ " #" + this.getId() + (this.getImage() ? "(image:" + this.getImage().src + ")" : "");
	}
}, collie.DisplayObject);
/**
 * 애니메이션 부모 클래스
 * 
 * @class collie.Animation
 * @extends collie.Component
 * @param {Function} fCallback 타이머 콜백 함수
 * @param {Number} nDuration 타이머 실행 시간, 지연 시간 (ms)
 * @param {Object} htOption 설정
 * @param {Boolean} htOption.useAutoStart TimerList에 추가될 때 자동으로 시작 된다
 * @param {Function} [htOption.on이벤트명] onComplete와 같이 이벤트명을 사용해서 attach를 직접하지 않고 옵션으로 할 수 있다
 */
collie.Animation = collie.Class(/** @lends collie.Animation.prototype */{
	/**
	 * @constructs
	 */
	$init : function (fCallback, nDuration, htOption) {
		this._nId = ++collie.Animation._idx;
		this._bIsPlaying = false;
		this._fCallback = fCallback;
		this._oTimerList = null;
		
		// AnimationQueue의 경우 nDuration자리에 htOption이 들어간다
		this.option("useAutoStart", true);
		this.option((typeof nDuration === "object" ? nDuration : htOption) || {});
		this.setDuration(nDuration);
		
		// 이벤트 핸들러 할당
		this.setOptionEvent(htOption);
	},
	
	/**
	 * Option 설정을 event로 만듦
	 * @private
	 */
	setOptionEvent : function (htOption) {
		if (htOption) {
			for (var i in htOption) {
				if (i.toString().indexOf("on") === 0) {
					this.attach(i.toString().replace(/^on/, '').toLowerCase(), htOption[i]);
				}
			}
		}
	},
	
	/**
	 * Callback을 형태에 맞게 실행
	 * 
	 * @private
	 * @param {Object} htParam
	 */
	triggerCallback : function (htParam) {
		// callback에 DisplayObject 객체를 넘길 경우
		if (typeof this._fCallback !== "function" && this._htOption.set) {
			var htOption = {};
			
			// 배열 값 처리
			if (this._htOption.set instanceof Array) {
				for (var i = 0, len = this._htOption.set.length; i < len; i++) {
					htOption[this._htOption.set[i]] = (htParam.value instanceof Array) ? htParam.value[i] : htParam.value;
				}
			} else {
				htOption[this._htOption.set] = htParam.value;
			}
			
			// 실행
			if (this._fCallback instanceof Array) {
				for (var j = 0, len = this._fCallback.length; j < len; j++) {
					this._fCallback[j].set(htOption);
				}
			} else {
				this._fCallback.set(htOption);
			}
		} else if (this._fCallback) {
			this._fCallback(htParam);
		}
	},
	
	/**
	 * Duration을 설정
	 * 
	 * @param {Number|String} nDuration 실행 시간, 지연 시간 설정 (ms)
	 */
	setDuration : function (nDuration) {
		this._nDuration = parseInt(nDuration, 10);
	},
	
	/**
	 * Duration을 반환
	 * 
	 * @return {Number} (ms)
	 */
	getDuration : function () {
		return this._nDuration;
	},
	
	/**
	 * TimerList에 추가될 때 알려 줌. stop할 때 목록에서 빼기 위함
	 * 
	 * @param {collie.TimerList}
	 * @private
	 */
	setTimerList : function (oTimerList) {
		this._oTimerList = oTimerList;
		
		if (this._htOption.useAutoStart) {
			this.start();
		}
	},
	
	/**
	 * 애니메이션 인스턴스를 식별하는 아이디를 반환
	 * 
	 * @private
	 * @return {Number} 아이디 (1...)
	 */
	getId : function () {
		return this._nId;
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @abstract
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nDrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		throw new Error('abstract method');
	},
	
	/**
	 * 설정 값을 초기화 할 때 사용
	 * 
	 * @abstract
	 */
	reset : function () {
		throw new Error('abstract method');
	},
	
	/**
	 * 애니메이션을 정지
	 * @example
	 * // stop/start
	 * var timer = collie.Timer.repeat(function () {}, 1000);
	 * timer.stop();
	 * timer.start();
	 * 
	 * @param {Boolean} bSkipEvent 이벤트를 발생하지 않는다
	 */
	stop : function (bSkipEvent) {
		if (this.isPlaying()) {
			if (this._oTimerList !== null) {
				this._oTimerList.remove(this);
			}
			
			this._bIsPlaying = false;
			this.reset();
			
			/**
			 * 타이머를 정지할 때 발생. 정상적으로 complete된 경우에는 발생하지 않는다
			 * @name collie.Animation#stop
			 * @event
			 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
			 */
			if (!bSkipEvent) {
				this.fireEvent("stop");
			}
		}
	},
	
	/**
	 * 애니메이션을 일시정지
	 * @example
	 * // pause/start
	 * var timer = collie.Timer.repeat(function () {}, 1000);
	 * timer.pause();
	 * timer.start();
	 */
	pause : function () {
		if (this.isPlaying()) {
			this._bIsPlaying = false;
			
			/**
			 * 타이머를 일시 정지할 때 발생
			 * @name collie.Animation#pause
			 * @event
			 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
			 */
			this.fireEvent("pause");
			
			if (this._oTimerList !== null) {
				this._oTimerList.remove(this);
			}
		}
	},

	/**
	 * 정지 상태인 타이머를 다시 실행
	 */
	start : function () {
		if (!this.isPlaying()) {
			this._bIsPlaying = true;
			
			if (this._oTimerList !== null) {
				this._oTimerList.add(this);
			}
			
			/**
			 * 타이머를 실행할 때 발생. Timer를 이용해서 생성할 때는 생성하는 순간 시작 상태이다.
			 * @name collie.Animation#start
			 * @event
			 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
			 */
			this.fireEvent("start");
		}
	},
	
	/**
	 * 타이머가 진행 중인지 여부를 반환
	 * 
	 * @return {Boolean} true면 실행 중
	 */
	isPlaying : function () {
		return this._bIsPlaying;
	},
	
	/**
	 * 애니메이션이 완료 됐을 때 실행
	 */
	complete : function () {
		if (this.isPlaying()) {
			if (this._fCallbackComplete) {
				this._fCallbackComplete();
			}
			
			// complete 이벤트 발생 전에 멈춤
			this.stop(true);
			
			/**
			 * 타이머가 정상적으로 종료되면 발생, repeat나 cycle의 loop가 0과 같이 지속적으로 반복되는 타이머에서는 일어나지 않는다
			 * @name collie.Animation#complete
			 * @event
			 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
			 */
			this.fireEvent("complete");
		}
	}
	
	/**
	 * 현재 타이머를 제거한다
	 * 
	 * @name collie.Animation#remove
	 * @deprecated start, stop할 때 List에 추가되고 제거되기 때문에 별도로 remove를 할 필요가 없어졌다.
	 */
}, collie.Component);

/**
 * @private
 */
collie.Animation._idx = 0;
/**
 * collie.Effect를 사용한 Transition 타이머
 * <a href="../tutorial/timer_transition.html" target="_blank">튜토리얼 보기</a>
 *
 * @example
 * <code>
 * 여러 개의 값으로 트랜지션
 * collie.Timer.transition(function (oEvent) {
 * 	oDisplayObject.set("opacity", oEvent.value[0]);
 *  oDisplayObject.set("x", oEvent.value[1]);
 * }, 1000, {
 * 	from : [1, 100],
 *  to : [0, 300]
 * });
 * </code>
 * 
 * @example
 * DisplayObject를 callback으로 사용해서 여러 속성을 변경하는 방법
 * <code>
 * collie.Timer.transition(oDisplayObject, 1000, {
 * 	from : [10, 10], // from 은 생략 가능, 생략하면 현재 값이 자동으로 입력 됨
 * 	to : [100, 200],
 * 	set : ["x", "y"]
 * });  
 * </code>
 * 하지만 이 때에는 DisplayObject의 move 메서드를 사용하는 것이 좋음
 * 
 * @example
 * 여러 개의 DisplayObject를 한꺼번에 실행할 수도 있음
 * <code>
 * collie.Timer.transition([oDisplayObjectA, oDisplayObjectB], 1000, {
 * 	from : 0, // 이 때에는 from 생략 불가능
 * 	to : 1,
 * 	set : "opacity"
 * });
 * </code>
 * 
 * @see collie.Timer
 * @class collie.AnimationTransition
 * @extends collie.Animation
 * @param {Function|collie.DisplayObject|Array} fCallback 실행될 콜백 함수, DisplayObject를 넣게 되면 해당 객체에 관한 내용만 변경함. htOption의 set 참조.
 * @param {collie.AnimationCycle} fCallback.timer 현재 타이머 인스턴스
 * @param {Number} fCallback.frame 현재 프레임
 * @param {Number} fCallback.duration 타이머에 설정된 duraiton 값
 * @param {Number} fCallback.cycle 반복 횟수
 * @param {Number} fCallback.runningTime 타이머 시작 후 실행된 시간 (ms)
 * @param {Number|Array} fCallback.value 적용할 값. from, to 값이 배열일 경우 이 값도 배열로 반환
 * @param {Number|Array} fCallback.from 시작 값, 시작 값을 입력하지 않고 fCallback에 DisplayObject를 넣으면 해당 객체의 현재 값이 자동으로 입력됨
 * @param {Number|Array} fCallback.to 끝 값
 * @param {Number} nDuration 실행 시간
 * @param {Object} htOption 설정
 * @param {Number|Array} htOption.from 시작 값(배열로 넣을 수 있음)
 * @param {Number|Array} htOption.to 끝 값(배열로 넣을 수 있음)
 * @param {Number} [htOption.loop=1] 반복 횟수
 * @param {collie.Effect} [htOption.effect=collie.Effect.linear] 효과 함수
 * @param {String|Array} [htOption.set] fCallback에 DisplayObject를 넣을 경우 set을 이용해서 특정 값을 변경한다. 배열로 넣을 경우 여러 속성을 변경할 수 있다
 * @see collie.Effect
 */
collie.AnimationTransition = collie.Class(/** @lends collie.AnimationTransition.prototype */{
	/**
	 * @constructs
	 */
	$init : function (fCallback, nDuration, htOption) {
		this.option({
			from : null, // 시작 값(배열로 넣을 수 있음)
			to : null, // 끝 값(배열로 넣을 수 있음)
			set : "",
			loop : 1,
			effect : collie.Effect.linear // 이펙트 함수
		});
		this._htCallback = {};
		this.option(htOption || {});
		var fReset = this.reset.bind(this);
		this.optionSetter("from", fReset);
		this.optionSetter("to", fReset);
		this._nCount = 0;
		this._nCountCycle = 0;
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;
		this._bIsArrayValue = false;
	},
	
	/**
	 * 시작할 때 실행되는 메서드
	 * @override
	 */
	start : function () {
		// 시작 값이 없을 떄 객체의 현재 값을 입력
		if (this._htOption.from === null && typeof this._fCallback !== "function") {
			this._setDefaultFromValues();
		}
		
		if (this._nFrameAtRunLastest === null) {
			this.reset();
		}
		
		this.constructor.$super.start.call(this);
	},
	
	/**
	 * @private
	 */
	_setDefaultFromValues : function () {
		var vFrom = null;
		
		if (this._htOption.set) {
			if (this._htOption.set instanceof Array) {
				vFrom = [];
				for (var i = 0, len = this._htOption.set.length; i < len; i++) {
					vFrom.push(this._fCallback.get(this._htOption.set[i]));
				}
			} else {
				vFrom = this._fCallback.get(this._htOption.set)
			}
			
			this.option("from", vFrom);
		}
	},
	
	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;
		this._nValue = this._htOption.from;
		this._bIsArrayValue = this._htOption.from instanceof Array;
		this._nCount = 0;
		this._nCountCycle = 0;
		
		// 값이 배열일 경우 처리
		if (this._bIsArrayValue) {
			this._fEffect = [];
			var fEffect = null;
			
			for (var i = 0, len = this._htOption.from.length; i < len; i++) {
				fEffect = (this._htOption.effect instanceof Array) ? this._htOption.effect[i] : this._htOption.effect; 
				this._fEffect[i] = fEffect(this._htOption.from[i], this._htOption.to[i]);
			}
		} else {
			this._fEffect = this._htOption.effect(this._htOption.from, this._htOption.to);
		}
	},
	
	/**
	 * 현재 값을 설정
	 * 
	 * @param {Variables} vValue
	 */
	setValue : function (vValue) {
		this._nValue = vValue;
	},
	
	/**
	 * 현재 값을 반환
	 * 
	 * @return {Variables}
	 */
	getValue : function () {
		return this._nValue;
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		if (nCurrentFrame === undefined) {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// 렌더러가 stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		// 시작 프레임 저장
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunningTime = 0;
			nFrameDuration = 0;
		}
		
		this._nRunningTime += nFrameDuration;
		this._nCount++;
		
		// 시간이 지났으면 멈춤
		if (this._nRunningTime >= this._nDuration) {
			this._nCountCycle++;
			
			// 끝나는 값이 아니면 끝나는 값으로 만듦(한번 더 실행), 루프의 마지막일 때만 보정함.
			if (!this._isEndValue() && this._htOption.loop && this._htOption.loop <= this._nCountCycle) {
				this._setEndValue();
			} else if (!this._htOption.loop || this._htOption.loop > this._nCountCycle) {
				/**
				 * loop가 있을 경우 트랜지션이 한번 끝났을 때 발생
				 * @name collie.AnimationTransition#end
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.fireEvent("end");
				this._nFrameAtRunLastest = nCurrentFrame;
				this._nRunningTime = this._nRunningTime - this._nDuration; // loop면 처음부터 다시 시작이 아니라 이어서 시작
				this._nValue = this._htOption.from;
				this._transitionValue(this._nRunningTime);
			} else {
				/**
				 * 트랜지션이 끝난 후 발생
				 * @name collie.AnimationTransition#complete
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.complete();
				return;
			}
		} else if (this._nRunningTime > 0) {
			this._transitionValue(this._nRunningTime);
		}
		
		// 객체 재활용
		this._htCallback.timer = this;
		this._htCallback.frame = nCurrentFrame;
		this._htCallback.duration = this._nDuration;
		this._htCallback.cycle = this._nCountCycle;
		this._htCallback.runningTime = this._nRunningTime;
		this._htCallback.from = this._htOption.from;
		this._htCallback.to = this._htOption.to;
		this._htCallback.value = this._nValue; // 값이 배열이면 이것도 배열로 반환됨
		this.triggerCallback(this._htCallback);
		
		if (this._nRunningTime > 0) {
			this._nFrameAtRunLastest = nCurrentFrame;
		}
	},
	
	/**
	 * 현재 프레임 값을 받아 현재 값을 transition된 값으로 변경 한다
	 * @private
	 * @param {Number} nCurrentRunningTime 현재 진행된 시간(ms)
	 */
	_transitionValue : function (nCurrentRunningTime) {
		if (this._bIsArrayValue) {
			this._nValue = [];
			
			for (var i = 0, len = this._htOption.from.length; i < len; i++) {
				this._nValue[i] = parseFloat(this._fEffect[i](Math.max(0, Math.min(1, nCurrentRunningTime / this._nDuration))));
			}
		} else {
			this._nValue = parseFloat(this._fEffect(Math.max(0, Math.min(1, nCurrentRunningTime / this._nDuration))));
		}
	},
	
	/**
	 * 끝 값인지 여부를 반환
	 * @private
	 * @return {Boolean} true면 끝 값
	 */
	_isEndValue : function () {
		if (this._bIsArrayValue) {
			for (var i = 0, len = this._htOption.to.length; i < len; i++) {
				if (this._nValue[i] !== parseFloat(this._fEffect[i](1))) {
					return false;
				}
			}
			
			return true;
		} else {
			return this._nValue === parseFloat(this._fEffect(1));
		}
	},
	
	/**
	 * 현재 값을 끝 값으로 설정 한다
	 * @private
	 * @param {Number} nValue
	 */
	_setEndValue : function () {
		if (this._bIsArrayValue) {
			for (var i = 0, len = this._htOption.to.length; i < len; i++) {
				this._nValue[i] = parseFloat(this._fEffect[i](1));
			}
		} else {
			this._nValue = parseFloat(this._fEffect(1));
		}
	}
}, collie.Animation);

/**
 * 이벤트 효과 함수
 * @namespace
 * @name collie.Effect
 */
/**
 * 특정 시간 간격으로 계속 반복되는 타이머
 * <a href="../tutorial/timer_repeat.html" target="_blank">튜토리얼 보기</a>
 * 
 * timeline	---------------------------------&gt;
 * action	* duration * duration * duration *
 * @see collie.Timer
 * @class collie.AnimationRepeat
 * @extends collie.Animation
 * @param {Function} fCallback 실행될 콜백 함수
 * @param {collie.AnimationCycle} fCallback.timer 현재 타이머 인스턴스
 * @param {Number} fCallback.frame 현재 프레임
 * @param {Number} fCallback.duration 타이머에 설정된 duraiton 값
 * @param {Number} fCallback.count 실행 횟수
 * @param {Number} fCallback.skippedCount 지나간 실행 횟수
 * @param {Number} fCallback.runningTime 타이머 시작 후 실행된 시간 (ms)
 * @param {Number} nDuration 시간 간격 ms
 * @param {Object} [htOption]
 * @param {Number} [htOption.beforeDelay=0] 시작되기 전에 지연시간(ms)
 * @param {Number} [htOption.loop=0] 반복 횟수(0이면 무한 반복, complete 이벤트가 일어나지 않는다)
 * @param {Number} [htOption.useRealTime=true] SkippedFrame을 적용해서 count 값을 보정한다
 */
collie.AnimationRepeat = collie.Class(/** @lends collie.AnimationRepeat.prototype */{
	/**
	 * @constructs
	 */
	$init : function (fCallback, nDuration, htOption) {
		this.option({
			beforeDelay : 0,
			afterDelay : 0,
			loop : 0,
			useRealTime : true
		});
		this.option(htOption || {});
		this.reset();
		this.setDuration(nDuration);
		this._nFrameAtRunLastest = null;
	},

	/**
	 * Duration을 설정
	 * Repeat는 Renderer의 Duration보다 짧게 실행할 수 없기 때문에 값을 보정한다
	 * 
	 * @param {Number} nDuration 실행 시간, 지연 시간 설정 (ms)
	 */
	setDuration : function (nDuration) {
		nDuration = parseInt(nDuration, 10);
		
		if (nDuration < collie.Renderer.getDuration()) {
			nDuration = collie.Renderer.getDuration();
		}
		
		this._nDuration = nDuration;
	},
	
	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nCount = 0;
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;
		this._nRunLastestTime = null;
		this._nBeforeDelay = this._htOption.beforeDelay;
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		if (nCurrentFrame === undefined) {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		// 시작되지 않았을 때 시작 시점 기록
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunningTime = 0;
			this._nRunLastestTime = 0;
			nFrameDuration = 0;
		}
		
		this._nRunningTime += nFrameDuration;
		var nSkippedCount = Math.max(1, Math.floor((this._nRunningTime - this._nRunLastestTime) / this._nDuration)) - 1;
		
		// 시작 지연시간
		if (this._nCount === 0 && this._nBeforeDelay) {
			// 끝날 때 되면 처리
			if (this._nRunLastestTime + this._nBeforeDelay <= this._nRunningTime) {
				this.reset();
				this._nBeforeDelay = 0;
			}
			return;
		}
		
		// 실행되어야 할 시간이 지났다면 실행
		if (this._nRunningTime === 0 || this._nRunLastestTime + this._nDuration <= this._nRunningTime) {
			this._nCount += this._htOption.useRealTime ? 1 + nSkippedCount : 1;
			this._fCallback({
				timer : this,
				frame : nCurrentFrame,
				duration : this._nDuration,
				count : this._nCount,
				skippedCount : nSkippedCount,
				runningTime : this._nRunningTime
			});
			
			if (this._htOption.loop && this._htOption.loop <= this._nCount) {
				/**
				 * 계획된 모든 애니메이션과 반복 횟수가 끝나면 발생. loop=0으로 설정하면 발생하지 않는다.
				 * @name collie.AnimationRepeat#complete
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.complete();
				return;
			}
			
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunLastestTime = this._nRunningTime;
		}
	}
}, collie.Animation);
/**
 * 특정 시간 동안 실행된 후 대기 시간 이후에 다시 실행되는 싸이클 애니메이션
 * 주로 Sprite 애니메이션에 사용 된다.
 * <a href="../tutorial/timer_cycle.html" target="_blank">튜토리얼 보기</a>
 * 
 * timeline	------------------------------------&gt;
 * action	*-duration-* delay *-duration-* delay
 * 
 * @see collie.Timer
 * @class collie.AnimationCycle
 * @extends collie.Animation
 * @param {Function|collie.DisplayObject|Array} fCallback 실행될 콜백 함수, DisplayObject를 넣게 되면 해당 객체에 관한 내용만 변경함. htOption의 set 참조.
 * @param {collie.AnimationCycle} fCallback.timer 현재 타이머 인스턴스
 * @param {Number} fCallback.frame 현재 프레임
 * @param {Number} fCallback.duration 타이머에 설정된 duraiton 값
 * @param {Number} fCallback.count 실행 횟수
 * @param {Number} fCallback.skippedCount 지나간 실행 횟수
 * @param {Number} fCallback.runningTime 타이머 시작 후 실행된 시간 (ms)
 * @param {Variables} fCallback.value 싸이클 값
 * @param {Number} fCallback.cycle 싸이클 반복 횟수
 * @param {Number} fCallback.step 단계 값
 * @param {Number} fCallback.from 시작 값
 * @param {Number} fCallback.to 끝 값
 * @param {Number|String} nDuration 시간 간격 (ms), fps 단위를 사용할 수 있다.
 * @param {Number} htOption 설정
 * @param {Number} htOption.from=0 싸이클 시작 값
 * @param {Number} htOption.to=0 싸이클 끝 값
 * @param {Number} [htOption.step=1] 증감 값
 * @param {Number} [htOption.loop=0] 0이 아니면 해당 횟수만큼 반복
 * @param {Number} [htOption.useRealTime=true] SkippedFrame을 적용해서 싸이클을 현재 시간과 일치
 * @param {Array} [htOption.valueSet] 비 규칙적 cycle을 사용할 때 valueSet에 배열을 넣고 순서대로 값을 꺼내 쓸 수 있다
 * @param {String|Array} [htOption.set="spriteX"] fCallback에 DisplayObject를 넣을 경우 set을 이용해서 특정 값을 변경한다. 배열로 넣을 경우 여러 속성을 변경할 수 있다  
 * @param {Number} [htOption.start] from 값이 아닌 값부터 시작할 경우 값을 설정. ex) from:0, to:3 일 때 2, 3, 0, 1, 2, 3... 으로 진행할 경우 start:2 값을 설정
 * @example
 * valueSet 사용 방법, step, from, to 옵션은 자동으로 설정된다
 * <code>
 * collie.Timer.cycle(function () {
 * 	// 0, 1, 2, 1, 0 순으로 플레이
 * }, 1000, {
 * 	valueSet : [0, 1, 2, 1, 0]
 * });
 * </code>
 * 
 * DisplayObject를 callback으로 사용해서 스프라이트 애니메이션을 구현하는 방법
 * <code>
 * collie.Timer.cycle(oDisplayObject, 1000, {
 * 	valueSet : [0, 1, 2, 1, 0]
 * });
 * </code>
 * 
 * fps 단위를 쓰면 프레임 당 재생 속도를 설정할 수 있다. 8프레임이니 이 경우에 24fps는 (1000 / 24 * 8)ms가 된다.
 * <code>
 * collie.Timer.cycle(oDisplayObject, "24fps", {
 * 	from : 0,
 *  to : 7
 * });
 * </code>
 */
collie.AnimationCycle = collie.Class(/** @lends collie.AnimationCycle.prototype */{
	/**
	 * @constructs
	 */
	$init : function (fCallback, nDuration, htOption) {
		this._nFPS = null;
		this._htCallback = {};
		var fSetterFPS = this._setterFPS.bind(this);
		this.optionSetter("valueSet", this._setterValueSet.bind(this));
		this.optionSetter("to", fSetterFPS);
		this.optionSetter("from", fSetterFPS);
		this.option({
			delay : 0, // 다음 싸이클 까지의 대기 시간 ms
			from : 0, // 시작 값
			to : 0, // 끝 값
			step : 1, // 단계 값
			loop : 0, // 0이 아니면 반복횟수 제한
			set : "spriteX",
			useRealTime : true,
			valueSet : null,
			start : null // 시작값이 아닌 값부터 시작할 경우 지정
		});
		this.option(htOption || {});
		this._nFrameAtRunLastest = null;
		this._nRunLastestTime = null;
		this._nRunningTime = null;
		this._nCountCycle = 0;
		this._nCountCycleBefore = 0;
		this.setDuration(nDuration);
		this.reset();
	},
	
	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nCount = 0;
		this._nCountCycle = 0;
		this._nCountCycleBefore = 0;
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;
		this._nRunLastestTime = null;
		this._nValue = (this._htOption.start !== null ? this._htOption.start : this._htOption.from) - this._htOption.step;		
	},
	
	/**
	 * valueSet의 setter
	 * @private
	 */
	_setterValueSet : function () {
		var aValueSet = this._htOption.valueSet;
		
		// valueSet에 맞춰서 나머지 옵션을 변경 한다
		if (aValueSet && aValueSet instanceof Array) {
			this.option({
				from : 0,
				to : aValueSet.length - 1,
				step : 1
			});
		} 
	},
	
	/**
	 * @private
	 */
	_setterFPS : function () {
		if (this._nFPS !== null && typeof this._htOption.to !== "undefined" && typeof this._htOption.from !== "undefined") {
			var nCount = (this._htOption.to - this._htOption.from) + 1;
			this._nDuration = Math.round(1000 / this._nFPS * nCount); 
		}
	},
	
	/**
	 * fps 처리
	 * 
	 * @param {Number|String} nDuration 
	 * @private
	 */
	setDuration : function (nDuration) {
		this._nDuration = parseInt(nDuration, 10);
		
		if (/fps/i.test(nDuration) && typeof this._htOption.to !== "undefined" && typeof this._htOption.from !== "undefined") {
			this._nFPS = parseInt(nDuration, 10);
			this._setterFPS();
		} else {
			this._nFPS = null;
		}
	},
	
	/**
	 * 현재 값을 설정
	 * 
	 * @param {Variables} vValue
	 */
	setValue : function (vValue) {
		this._nValue = vValue;
	},
	
	/**
	 * 현재 값을 반환
	 * 
	 * @return {Variables}
	 */
	getValue : function () {
		return this._htOption.valueSet ? this._htOption.valueSet[this._nValue] : this._nValue;
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		if (typeof nCurrentFrame === "undefined") {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		// 시작되지 않았을 때 시작 시점 기록
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunLastestTime = 0; // 마지막으로 실행됐던 시간
			this._nRunningTime = 0;
			nFrameDuration = 0; // 시작 시점에는 FrameDuration을 계산하지 않는다
		}
		
		if (!nFrameDuration) {
			nFrameDuration = 0;
		}
		
		var htOption = this._htOption;
		var nDiff = htOption.to - htOption.from;
		this._nTotalCount = nDiff / htOption.step; // 총 횟수
		this._nTerm = this._nDuration / this._nTotalCount; // 시간 간격
		this._nRunningTime += nFrameDuration; // 시작 시점부터 총 진행된 시간
		var nSkippedCount = (!htOption.useRealTime) ? 0 : Math.max(1, Math.floor((this._nRunningTime - this._nRunLastestTime) / this._nTerm)) - 1;
		
		// 실행되어야 할 시간이 지났다면 실행
		if (this._nRunningTime === 0 || this._nRunLastestTime + this._nTerm <= this._nRunningTime) {
			// 사이클이 끝나면 end 발생
			if (this._nCountCycleBefore !== this._nCountCycle) {
				/**
				 * 한 싸이클이 끝나면 발생함
				 * @name collie.AnimationCycle#end
				 * @event
				 * @param {Object} oEvent 컴포넌트 기본 이벤트 객체
				 */
				this.fireEvent("end");
			}
			
			// 반복 횟수를 넘었다면 종료
			if (htOption.loop && this._nCountCycle >= htOption.loop) {
				this.complete();
				return;
			}
			
			// 끝 값이면 시작 값으로 되돌림
			if (this._nValue === htOption.to) {
				this._nValue = htOption.from - htOption.step;
			}
			
			this._nValue += (htOption.step * (1 + nSkippedCount));
			this._nCount += (1 + nSkippedCount);
			this._nCountCycleBefore = this._nCountCycle;
			
			// 값을 벗어났을 때 처리
			if (htOption.from <= htOption.to ? this._nValue >= htOption.to : this._nValue <= htOption.to) {
				var nOverCount = (this._nValue - htOption.to) / htOption.step;
				var nOverCountCycle = Math.ceil(nOverCount / (this._nTotalCount + 1)); // 전체 숫자 카운트
				nOverCount = nOverCount % (this._nTotalCount + 1);
				
				if (nOverCount) { // 지나간 것
					this._nCountCycle += nOverCountCycle; 	
					this._nValue = htOption.from + (nOverCount - 1) * htOption.step;
				} else { // 정확히 끝난 것
					this._nCountCycle += 1;
					this._nValue = htOption.to;
				}
			}
			
			// 객체 재활용
			this._htCallback.timer = this;
			this._htCallback.frame = nCurrentFrame;
			this._htCallback.duration = this._nDuration;
			this._htCallback.count = this._nCount;
			this._htCallback.skippedCount = nSkippedCount;
			this._htCallback.runningTime = this._nRunningTime;
			this._htCallback.value = this.getValue();
			this._htCallback.cycle = this._nCountCycle;
			this._htCallback.step = htOption.step;
			this._htCallback.from = htOption.from;
			this._htCallback.to = htOption.to;
			this.triggerCallback(this._htCallback);
			
			// 시간 진행
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunLastestTime = this._nRunningTime;
		}
	}
}, collie.Animation);
/**
 * 설정된 시간동안 지연 후에 실행되는 타이머
 * <a href="../tutorial/timer_delay.html" target="_blank">튜토리얼 보기</a>
 * 
 * timeline	----------&gt;
 * action	duration *
 * @see collie.Timer
 * @class collie.AnimationDelay
 * @extends collie.Animation
 * @param {Function} fCallback 실행될 콜백 함수
 * @param {collie.AnimationDelay} fCallback.timer 현재 타이머 인스턴스
 * @param {Number} fCallback.frame 현재 프레임
 * @param {Number} fCallback.duration 타이머에 설정된 duraiton 값
 * @param {Number} fCallback.runningTime 타이머 시작 후 실행된 시간 (ms)
 * @param {Number} nDuration 시간 간격 ms
 */
collie.AnimationDelay = collie.Class(/** @lends collie.AnimationDelay.prototype */{
	/**
	 * @constructs
	 */
	$init : function (fCallback, nDuration) {
		this.reset();
	},

	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;
		this._nRunLastestTime = null;
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		if (nCurrentFrame === undefined) {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunLastestTime = 0;
			this._nRunningTime = 0;
			nFrameDuration = 0;
		}
		
		this._nRunningTime += nFrameDuration;

		// 처음 실행되면 기록
		if (this._nRunLastestTime + this._nDuration <= this._nRunningTime) {
			if (this._fCallback) {
				this._fCallback({
					timer : this,
					frame : nCurrentFrame,
					duration : this._nDuration,
					runningTime : this._nRunningTime
				});
			}
			
			/**
			 * 애니메이션이 끝났을 때 발생
			 * @name collie.AnimationDelay#complete
			 * @event
			 */
			this.complete();
		}
	}
}, collie.Animation);
/**
 * 타임라인 기반으로 애니메이션을 실행시킴
 * <a href="../tutorial/timer_timeline.html" target="_blank">튜토리얼 보기</a>
 *  
 * @see collie.Timer
 * @class collie.AnimationTimeline
 * @extends collie.Animation
 * @param {Array} aTimeline 타임라인 배열
 * @param {Object} [htOption]
 * @param {Object} [htOption.loop=1] 반복 횟수, 0일 경우 무한 반복 한다
 * @example
 * // 생성과 동시에 타임라인을 정의
 * collie.Timer.timeline([
 * 		[0, "delay", function () {}, 1000],
 * 		[10, "transition", function () {}, 1000, { from:1, to:1 }],
 * ]);
 * 
 * @example
 * // 생성 후 타임라인을 정의
 * var timeline = collie.Timer.timeline();
 * timeline.add(0, "delay", function () {}, 1000);
 * timeline.add(10, "transition", function () {}, 1000, { from:1, to:1 });
 * 
 * @example
 * // 타임라인 액션을 삭제
 * var timeline = collie.Timer.timeline();
 * var action = timeline.add(0, "delay", function () {}, 1000);
 * timeline.remove(10); // 10ms에 실행되는 모든 액션을 삭제
 * timeline.remove(10, action); // action만 삭제 
 */
collie.AnimationTimeline = collie.Class(/** @lends collie.AnimationTimeline.prototype */{
	/**
	 * @constructs
	 */
	$init : function (aTimeline, htOption) {
		this.option("loop", 1);
		this.option(htOption || {});
		this.setOptionEvent(htOption);
		this._htAnimations = {};
		this._aTimeline = null;
		this._aRunningAnimation = null;
		this._nRunningTime = null;
		this._nCountCycle = 0;
		
		if (aTimeline) {
			for (var i = 0, l = aTimeline.length; i < l; i++) {
				this.addTimeline.apply(this, aTimeline[i]);
			}
		}
				
		this.reset();
	},
	
	/**
	 * 타임라인에 애니메이션을 추가
	 * 
	 * @param {Number} nStartTime 시작 시간(ms) 
	 * @param {String|collie.Animation} 애니메이션 이름이나 애니메이션 객체를 지정한다.
	 * @param {Function|Object} fCallback 각 애니메이션에 쓰이는 인자, queue 애니메이션일 경우 첫 번째 안자가 htOption이 된다
	 * @param {Number} nDuration 각 애니메이션에 쓰이는 인자
	 * @param {Object} htOption 각 애니메이션에 쓰이는 인자
	 * @return {collie.Animation} 만들어진 애니메이션
	 * @example
	 * var timeline = collie.Timer.timeline();
	 * 
	 * // queue를 사용하는 방법
	 * var queue = timeline.add(0, "queue");
	 * queue.cycle(item, 1000, { from:0, to:9 });
	 * 
	 * // 직접 Animation 객체를 생성
	 * timeline.add(100, new collie.AnimationCycle(item, 1000, { from:0, to:9 }));
	 */
	add : function (nStartTime, vType, fCallback, nDuration, htOption) {
		var oAnimation;
		
		// 애니메이션 인스턴스 생성
		switch (vType) {
			case "delay" :
				oAnimation = new collie.AnimationDelay(fCallback, nDuration, htOption);					
				break;
				
			case "repeat" :
				oAnimation = new collie.AnimationRepeat(fCallback, nDuration, htOption);
				break;
				
			case "transition" :
				oAnimation = new collie.AnimationTransition(fCallback, nDuration, htOption);
				break;
				
			case "cycle" :
				oAnimation = new collie.AnimationCycle(fCallback, nDuration, htOption);
				break;
				
			case "queue" :
				oAnimation = new collie.AnimationQueue(fCallback /* htOption임 */);
				break;
				
			default :
				if (vType instanceof collie.Animation) {
					oAnimation = vType;
				} else {
					throw new Error(vType + ' timer is not defined');
				}
		}
		
		this._addTimeline(nStartTime, oAnimation);
		return oAnimation;
	},
	
	/**
	 * 애니메이션 인스턴스를 추가
	 * 
	 * @private
	 * @param {Number} nStartTime 시작 시간(ms) 
	 * @param {collie.Animation} oAnimation 추가될 애니메이션
	 */
	_addTimeline : function (nStartTime, oAnimation) {
		nStartTime = parseInt(nStartTime, 10); // 정수로 변환
		this._htAnimations[nStartTime] = this._htAnimations[nStartTime] || []; 
		this._htAnimations[nStartTime].push(oAnimation);
		
		// 이미 초기화 됐다면 다시 초기화
		if (this._aTimeline !== null) {
			this.reset();
		}
	},
	
	/**
	 * 등록된 타임라인을 제거한다
	 * 
	 * @param {Number} nStartTime 시작 시간(ms)
	 * @param {collie.Animation} oTimer 지울 타이머, 값이 없으면 해당 시간대 전부를 지움
	 */
	remove : function (nStartTime, oTimer) {
		nStartTime = parseInt(nStartTime, 10); // 정수로 변환
		
		if (this._htAnimations && this._htAnimations[nStartTime]) {
			for (var i = 0; i < this._htAnimations[nStartTime].length; i++) {
				if (typeof oTimer === "undefined" || oTimer === this._htAnimations[nStartTime][i]) {
					this._htAnimations[nStartTime][i].stop();
					this._htAnimations[nStartTime].splice(i, 1);
					i--;
					
					if (typeof oTimer !== "undefined") {
						break;
					}
				}
			}
			
			// 지웠는데 더 이상 그 시간대에 타이머가 없을 경우 생성된 Timeline도 지움
			if (this._htAnimations[nStartTime].length < 1) {
				delete this._htAnimations[nStartTime];
				this._removeTimelineStartTime(nStartTime);
			}
		}
	},
	
	_removeTimelineStartTime : function (nStartTime) {
		if (this._aTimeline) {
			for (var i = 0, l = this._aTimeline.length; i < l; i++) {
				if (this._aTimeline[i] === nStartTime) {
					this._aTimeline.splice(i, 1);
					break;
				}
			}
		}
	},
	
	/**
	 * 타임라인을 초기화
	 * @private
	 */
	_initTimeline : function () {
		this._aTimeline = [];
		this._aRunningAnimation = [];
		
		// 시작 시간을 넣음
		for (var i in this._htAnimations) {
			this._aTimeline.push(parseInt(i, 10));
		} 
		
		// 정렬
		this._aTimeline.sort(function (a, b) {
			return a - b;
		});
	},
	
	/**
	 * 등록된 애니메이션 인스턴스를 반환한다
	 * 
	 * @param {Number} nStartTime 시작 시간(ms) 
	 * @return {Array|Boolean} 등록된 애니메이션이 없으면 false를 반환, 반환 형식은 항상 배열임
	 */
	getAnimation : function (nStartTime) {
		nStartTime = parseInt(nStartTime, 10); // 정수로 변환
		return (this._htAnimations && this._htAnimations[nStartTime]) ? this._htAnimations[nStartTime] : false;
	},
	
	/**
	 * 현재까지 진행된 시간을 반환
	 * @return {Number} ms 진행이 안된 상태면 0을 반환
	 */
	getRunningTime : function () {
		return this._nRunningTime || 0;
	},
	
	/**
	 * 현재까지 반복된 횟수
	 * @return {Number}
	 */
	getCycle : function () {
		return this._nCountCycle || 0;
	},
	
	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nFrameAtRunLastest = null;
		this._nRunningTime = null;		
		this._aTimeline = null;
		this._aRunningAnimation = null;
		this._nCountCycle = 0;
		this._initTimeline();
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		if (nCurrentFrame === undefined) {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// 렌더러가 stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		// 시작 프레임 저장
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
			this._nRunningTime = 0;
			nFrameDuration = 0;
		}
		
		this._nRunningTime += nFrameDuration;
		
		// 진행될 액션이 있을 경우 추가
		if (this._aTimeline.length > 0) {
			while (this._aTimeline[0] <= this._nRunningTime) {
				var nStartTime = this._aTimeline.shift();
				
				for (var i = 0, l = this._htAnimations[nStartTime].length; i < l; i++) {
					this._aRunningAnimation.push(this._htAnimations[nStartTime][i]);
					this._htAnimations[nStartTime][i].start();
				}
			}
		}
		
		// 진행중인 액션이 있을 경우 run 전달
		if (this._aRunningAnimation.length > 0) {
			for (var i = 0; i < this._aRunningAnimation.length; i++) {
				if (this._aRunningAnimation[i]) {
					this._aRunningAnimation[i].run(nCurrentFrame, nFrameDuration);
				}
				
				if (!this._aRunningAnimation[i] || !this._aRunningAnimation[i].isPlaying()) {
					if (this._aRunningAnimation[i]) {
						this._aRunningAnimation[i].reset();
					}
					
					this._aRunningAnimation.splice(i, 1);
					i--;
					this._checkComplete();
				}
			}
		}
	},
	
	_checkComplete : function () {
		// 끝났으면
		if (this._aRunningAnimation.length < 1 && this._aTimeline.length < 1) {
			this._nCountCycle++;
			
			if (this._htOption.loop && this._htOption.loop <= this._nCountCycle) {
				/**
				 * 계획된 모든 애니메이션과 반복 횟수가 끝나면 발생. loop=0으로 설정하면 발생하지 않는다.
				 * @name collie.AnimationTimeline#complete
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.complete();
			} else {
				/**
				 * loop가 있을 경우 모든 타임라인 액션이 한 번 끝났을 때 발생
				 * @name collie.AnimationTimeline#end
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.fireEvent("end");
				this._nFrameAtRunLastest = null;
				this._nRunningTime = null;		
				this._aTimeline = null;
				this._aRunningAnimation = null;
				this._initTimeline();
			}
		}
	}
}, collie.Animation);
/**
 * 계획된 여러 애니메이션을 다룰 수 있는 Queue
 * <a href="../tutorial/timer_queue.html" target="_blank">튜토리얼 보기</a>
 * 
 * @see collie.Timer
 * @class collie.AnimationQueue
 * @extends collie.Animation
 * @param {Object} [htOption]
 * @param {Object} [htOption.loop=1] 큐 반복 횟수, 0일 경우 무한 반복 한다
 * @example
 * collie.Timer.queue({ loop : 1 }).
 * 				delay(function () {}, 1000).
 *				transition(function () {}, 1000, { from : 1, to : 1 });
 */
collie.AnimationQueue = collie.Class(/** @lends collie.AnimationQueue.prototype */{
	/**
	 * @constructs
	 */
	$init : function (htOption) {
		this.option("loop", 1);
		this.option(htOption || {});
		this.setOptionEvent(htOption);
		this._aAnimations = [];
		this._fOnCompleteAnimation = this._onCompleteAnimation.bind(this);
		this.reset();
	},
	
	/**
	 * queue에 delay 애니메이션을 추가한다
	 * @see collie.AnimationDelay
	 * @return {collie.AnimationQueue} 메서드 체이닝 사용 가능
	 */
	delay : function (fCallback, nDuration, htOption) {
		this._add(new collie.AnimationDelay(fCallback, nDuration, htOption));
		return this;
	},
	
	/**
	 * queue에 repeat 애니메이션을 추가한다
	 * @see collie.AnimationRepeat
	 * @return {collie.AnimationQueue} 메서드 체이닝 사용 가능
	 */
	repeat : function (fCallback, nDuration, htOption) {
		this._add(new collie.AnimationRepeat(fCallback, nDuration, htOption));
		return this;
	},
	
	/**
	 * queue에 transition 애니메이션을 추가한다
	 * @see collie.AnimationTransition
	 * @return {collie.AnimationQueue} 메서드 체이닝 사용 가능
	 */
	transition : function (fCallback, nDuration, htOption) {
		this._add(new collie.AnimationTransition(fCallback, nDuration, htOption));
		return this;
	},
	
	/**
	 * queue에 cycle 애니메이션을 추가한다
	 * @see collie.AnimationCycle
	 * @return {collie.AnimationQueue} 메서드 체이닝 사용 가능
	 */
	cycle : function (fCallback, nDuration, htOption) {
		this._add(new collie.AnimationCycle(fCallback, nDuration, htOption));
		return this;
	},
	
	/**
	 * 등록된 애니메이션 인스턴스를 반환한다
	 * 
	 * @param {Number} nIdx 등록 순서 (0~)
	 * @return {collie.Animation}
	 */
	getAnimation : function (nIdx) {
		return this._aAnimations[nIdx] || false;
	},
	
	/**
	 * 애니메이션 인스턴스를 추가
	 * 
	 * @private
	 * @param {collie.Animation} oAnimation 추가될 애니메이션
	 */
	_add : function (oAnimation) {
		oAnimation.attach("complete", this._fOnCompleteAnimation);
		this._aAnimations.push(oAnimation);
	},
	
	/**
	 * 각 애니메이션이 종료되었을 때 처리하는 이벤트 핸들러
	 * @private
	 */
	_onCompleteAnimation : function () {
		this.next();
	},

	/**
	 * 다음 애니메이션으로 넘긴다
	 */
	next : function () {
		if (this._nAnimationIdx === null) {
			this._nAnimationIdx = 0;
		} else {
			this._nAnimationIdx++;
		}
		
		// 종료되면
		if (this._nAnimationIdx >= this._aAnimations.length) {
			this._nCount++;
			
			/**
			 * 계획된 모든 애니메이션이 끝날 때 마다 발생, loop 설정과 관계 없이 매번 일어난다
			 * @name collie.AnimationQueue#end
			 * @event
			 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
			 * @param {Object} oEvent.count 현재까지 반복된 횟수
			 */
			this.fireEvent("end", {
				count : this._nCount
			});
			
			// loop 설정이 있으면 되돌림
			if (!this._htOption.loop || this._htOption.loop > this._nCount) {
				this._nAnimationIdx = 0;
			} else {
				/**
				 * 계획된 모든 애니메이션과 반복 횟수가 끝나면 발생. loop=0으로 설정하면 발생하지 않는다.
				 * @name collie.AnimationQueue#complete
				 * @event
				 * @param {Object} oEvent 기본 컴포넌트 이벤트 객체
				 */
				this.complete();
				return;
			}
		}
		
		this._aAnimations[this._nAnimationIdx].stop();
		this._aAnimations[this._nAnimationIdx].start();
	},
	
	/**
	 * 값을 초기화
	 */
	reset : function () {
		this._nFrameAtRunLastest = null;
		this._nAnimationIdx = null;
		this._nCount = 0;
	},
	
	/**
	 * 등록된 모든 애니메이션을 제거
	 */
	removeAll : function () {
		this._aAnimations = [];
		this.reset();
	},
	
	/**
	 * 현재 진행 중인 애니메이션까지 남기고 나머지를 지움
	 */
	removeAfter : function () {
		if (this._nAnimationIdx + 1 <= this._aAnimations.length - 1) {
			var count = this._aAnimations.length - (this._nAnimationIdx + 1); 
			this._aAnimations.splice(this._nAnimationIdx + 1, count);
		}
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} [nCurrentFrame] 현재 렌더러 프레임, 값이 없으면 자동으로 현재 렌더러 프레임을 가져 온다
	 * @param {Number} [nFrameDuration] 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		// 등록된 애니메이션이 없는 경우에는 지나감
		if (this._aAnimations.length < 1) {
			return; 
		}
		
		if (nCurrentFrame === undefined) {
			nCurrentFrame = collie.Renderer.getInfo().frame;
		}
		
		// 렌더러가 stop 된 경우
		if (this._nFrameAtRunLastest > nCurrentFrame) {
			this.reset();
			return;
		}
		
		// 시작되지 않았을 때 시작 시점 기록
		if (this._nFrameAtRunLastest === null) {
			this._nFrameAtRunLastest = nCurrentFrame;
		}
		
		if (this._nAnimationIdx === null) {
			this.next();
		}
		
		this._aAnimations[this._nAnimationIdx].run(nCurrentFrame, nFrameDuration);
	}
}, collie.Animation);
/**
 * Timer 목록
 * 
 * @private
 * @class collie.TimerList
 */
collie.TimerList = collie.Class(/** @lends collie.TimerList.prototype */{
	/**
	 * @constructs
	 * @private
	 */
	$init : function () {
		this._aList = [];
	},
	
	/**
	 * 애니메이션 추가
	 * 
	 * @param {collie.Animation} oAnimation
	 */
	add : function (oAnimation) {
		this._aList.unshift(oAnimation); // for문을 거꾸로 돌리기 위해 앞에서부터 삽입
	},
	
	/**
	 * 애니메이션 제거(멈춤이라고 보면 됨)
	 * 
	 * @param {collie.Animation} oAnimation 제거할 애니메이션 인스턴스 
	 */
	remove : function (oAnimation) {
		for (var i = 0, len = this._aList.length; i < len; i++) {
			if (this._aList[i] === oAnimation) {
				this._aList.splice(i, 1);
				break;
			}
		}
	},
	
	/**
	 * 애니메이션을 모두 제거
	 */
	removeAll : function () {
		this._aList = [];
	},
	
	/**
	 * 애니메이션을 모두 멈춤
	 */
	stopAll : function () {
		for (var i = 0, len = this._aList.length; i < len; i++) {
			this._aList[i].stop();
		}
	},
	
	/**
	 * 애니메이션을 실행
	 * 
	 * @param {Number} nCurrentFrame 현재 프레임을 Animation 인스턴스에 전달함
	 * @param {Number} nFrameDuration 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		// 뒤에서 부터 실행해서 중간에 삭제되도 for문이 동작하도록 함
		for (var i = this._aList.length - 1; i >= 0; i--) {
			if (this._aList[i]) {
				if (this._aList[i].isPlaying()) {
					this._aList[i].run(nCurrentFrame, nFrameDuration);
				} else {
					// 애니메이션이 실행 중이 아닌데도 리스트에 있다면 제거
					this._aList.splice(i, 1);
				}
			} 
		}
	}
});
/**
 * 타이머를 생성 / 관리. 모든 타이머는 collie.Timer에서 생성한다
 * @namespace
 */
collie.Timer = collie.Timer || new (collie.Class(/** @lends collie.Timer */{
	$init : function () {
		this._oList = new collie.TimerList();
	},
	
	/**
	 * 렌더러에서 렌더링 하기 전에 타이머를 실행 한다.
	 * 
	 * @param {Number} nCurrentFrame 현재 프레임
	 * @param {Number} nFrameDuration 진행된 프레임 시간(ms)
	 */
	run : function (nCurrentFrame, nFrameDuration) {
		this._oList.run(nCurrentFrame, nFrameDuration);
	},
	
	/**
	 * 전체를 멈춘다
	 * - 개별적으로 멈추는건 각각 타이머 인스턴스에서 stop을 호출
	 */
	stopAll : function () {
		this._oList.stopAll();
	},
	
	/**
	 * 전체 타이머를 제거 한다
	 */
	removeAll : function () {
		this._oList.removeAll();
	},
	
	/**
	 * @see collie.AnimationQueue
	 * @arguments collie.AnimationQueue
	 * @return {collie.AnimationQueue}
	 */
	queue : function (htOption) {
		var oAnimation = new collie.AnimationQueue(htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	},
	
	/**
	 * @see collie.AnimationRepeat
	 * @arguments collie.AnimationRepeat
	 * @return {collie.AnimationRepeat}
	 */
	repeat : function (fCallback, nDuration, htOption) {
		var oAnimation = new collie.AnimationRepeat(fCallback, nDuration, htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	},
	
	/**
	 * @see collie.AnimationTransition
	 * @arguments collie.AnimationTransition
	 * @return {collie.AnimationTransition}
	 */
	transition : function (fCallback, nDuration, htOption) {
		var oAnimation = new collie.AnimationTransition(fCallback, nDuration, htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	},
	
	/**
	 * @see collie.AnimationCycle
	 * @arguments collie.AnimationCycle
	 * @return {collie.AnimationCycle}
	 */
	cycle : function (fCallback, nDuration, htOption) {
		var oAnimation = new collie.AnimationCycle(fCallback, nDuration, htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	},
	
	/**
	 * @see collie.AnimationDelay
	 * @arguments collie.AnimationDelay
	 * @return {collie.AnimationDelay}
	 */
	delay : function (fCallback, nDuration, htOption) {
		var oAnimation = new collie.AnimationDelay(fCallback, nDuration, htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	},
	
	/**
	 * @see collie.AnimationTimeline
	 * @arguments collie.AnimationTimeline
	 * @return {collie.AnimationTimeline}
	 */
	timeline : function (aTimeline, htOption) {
		var oAnimation = new collie.AnimationTimeline(aTimeline, htOption);
		oAnimation.setTimerList(this._oList);
		return oAnimation;
	}
}))();
/**
 * Layer를 등록해서 그리는 렌더링 파이프라인
 * @namespace
 * @TODO frame을 기록하는 클래스의 경우 stop되고 다시 시작되면 0부터 시작하므로
자기가 기록한 frame이 현재 frame보다 클 때 보정 처리를 반드시 해줘야 한다.
이는 나중에 frame이 int 풀카운트가 되었을 때 처리가 있을지도 모르므로 필수
 */
collie.Renderer = collie.Renderer || new (collie.Class(/** @lends collie.Renderer */{
	/**
	 * 기본 렌더링 FPS
	 * @type {String}
	 */
	DEFAULT_FPS : "60fps",
	
	/**
	 * 레티나 디스플레이 여부 auto 값일 경우 자동 판단, true/false 값은 수동
	 * @type {String|Boolean} auto 일 때 자동 판단 됨
	 */
	RETINA_DISPLAY : false,
	
	/**
	 * 이 값을 true로 변경하면 가상 딜레이를 발생할 수 있다.
	 * 가상 딜레이 발생 상태에서는 requestAnimationFrame이 동작하지 않으며
	 * 타이머 등이 스킵될 때 어떻게 동작하는지 확인할 수 있다.
	 *
	 * @type {Boolean}
	 * @example
	 * collie.Renderer.DEBUG_USE_DELAY = true;
	 * collie.Renderer.DEBUG_MAX_DELAY = 200;
	 * collie.Renderer.start();
	 */
	DEBUG_USE_DELAY : false,
	
	/**
	 * 가상 딜레이 최대값(랜덤하게 발생, ms)
	 * @type {Number}
	 */
	DEBUG_MAX_DELAY : 200,
	
	/**
	 * 렌더링 모드 [auto|canvas|dom]
	 * @type {String}
	 */
	DEBUG_RENDERING_MODE : "auto",
	
	$init : function () {
		this._sVisibilityChange = this._getNamePageVisibility();
		this._bPlaying = false;
		this._bPause = false;
		this._nFPS = 0;
		this._nDuration = 0; // ms
		this._nCurrentFrame = 0;
		this._nSkippedFrame = 0;
		this._nBeforeFrameTime = null; // ms
		this._nBeforeRenderingTime = 0; // ms
		this._aLayerList = [];
		this._fRender = this._render.bind(this);
		this._fCallback = null;
		this._htCallback = {};
		this._elContainer = document.createElement("div");
		this._elContainer.className = "_collie_container";
		this._elContainer.style.position = "relative";
		this._elContainer.style.overflow = "hidden";
		this._elParent = null;
		this._nDebugDelayedTime = 0;
		this._oRenderingTimer = null;
		this._bLoaded = false;
		this._sRenderingMode = null;
		this._bUseRetinaDisplay = null;
		this._htEventStatus = {};
		this._htPosition = {};
		this._bIsPreventDefault = true;
		this._htDeviceInfo = collie.util.getDeviceInfo();
		
		// PageVisibility API를 사용할 수 있다면 사용
		if (this._sVisibilityChange) {
			collie.util.addEventListener(document, this._sVisibilityChange, this._onChangeVisibility.bind(this));
		// 모바일이라면 pageshow/pagehide를 사용
		// In-App Browser일 때 pageshow/pagehide가 정상적으로 호출 안되는 문제점이 있음
		} else if (!this._htDeviceInfo.desktop) {
			collie.util.addEventListener(window, "pageshow", this._onPageShow.bind(this));
			collie.util.addEventListener(window, "pagehide", this._onPageHide.bind(this));
		}
		
		// 렌더러 엘리먼트의 위치를 저장해 놓는다
		collie.util.addEventListener(window, "resize", this.refresh.bind(this));
	},
	
	/**
	 * 페이지를 진입할 때 렌더러 처리
	 * @private
	 */
	_onPageShow : function () {
		if (!this.isPlaying() && this._bPause) {
			this.resume();
		}
	},
	
	/**
	 * 페이지를 이탈할 때 렌더러 처리
	 * @private
	 */
	_onPageHide : function () {
		if (this.isPlaying()) {
			this.pause();
		}
	},
	
	/**
	 * @private
	 */
	_onChangeVisibility : function () {
		var state = document.visibilityState || document.webkitVisibilityState || document.mozVisibilityState;

		if (state === "hidden") {
			this.pause();
		} else if (state === "visible") {
			this.resume();
		}
	},
	
	/**
	 * 렌더링 엘리먼트의 위치를 갱신한다
	 * 만일 렌더링 엘리먼트의 위치가 load 후에 변경될 경우 refresh 메소드를 실행시켜줘야 한다
	 */
	refresh : function () {
		if (this._elParent !== null) {
			this._htPosition = collie.util.getPosition(this._elParent);
		}
	},
	
	/**
	 * 렌더러 엘리먼트의 현재 위치를 반환
	 * 렌더러가 load되지 않았다면 false를 반환
	 * 
	 * @private
	 * @return {Object|Boolean} htResult
	 * @return {Number} htResult.x 페이지 처음부터의 x좌표
	 * @return {Number} htResult.y 페이지 처음부터의 y좌표 
	 * @return {Number} htResult.width 너비
	 * @return {Number} htResult.height 높이
	 */
	getPosition : function () {
		return this._bLoaded ? this._htPosition : false;
	},
	
	/**
	 * 렌더러에 적용할 레이어를 추가 한다
	 * 
	 * @param {collie.Layer} oLayer
	 */
	addLayer : function (oLayer) {
		if (!oLayer || !("type" in oLayer) || oLayer.type !== "layer") {
			throw new Error('oLayer is not Layer instnace');
		}
		
		// 이미 추가된 레이어라면 무시
		for (var i = 0, len = this._aLayerList.length; i < len; i++) {
			if (this._aLayerList[i] === oLayer) {
				return;
			}
		}
		
		this._aLayerList.push(oLayer);
		
		// 로드된 상태에서는 자동으로 붙기
		if (this._bLoaded) {
			oLayer.load(this._elContainer, this._aLayerList.length);
			this.resetLayerEvent();
		}
	},
	
	/**
	 * 렌더러에 적용한 레이어를 제거 한다
	 * 
	 * @param {collie.Layer} oLayer
	 */
	removeLayer : function (oLayer) {
		for (var i = 0, len = this._aLayerList.length; i < len; i++) {
			if (this._aLayerList[i] === oLayer) {
				this._aLayerList[i].unload(); // 로딩되어 있으면 해제 시킴
				this._aLayerList.splice(i, 1);
				return;
			}
		}
	},
	
	/**
	 * 등록된 모든 레이어를 제거 한다
	 */
	removeAllLayer : function () {
		for (var i = this._aLayerList.length - 1; i >= 0; i--) {
			this._aLayerList[i].unload();
		}
		
		this._aLayerList = [];
	},
	
	/**
	 * 등록된 레이어를 모두 반환
	 * 
	 * @return {Array}
	 */
	getLayers : function () {
		return this._aLayerList;
	},
	
	/**
	 * 이벤트를 모두 해제하고 다시 건다
	 * @private
	 */
	resetLayerEvent : function () {
		for (var i = 0, len = this._aLayerList.length; i < len; i++) {
			this._aLayerList[i].detachEvent();
		}

		// 레이어 역순으로 이벤트가 동작해야 하기 때문에 이벤트는 역순으로 건다
		for (var i = this._aLayerList.length - 1; i >= 0; i--) {
			this._aLayerList[i].attachEvent();
		}
	},
	
	/**
	 * 렌더러의 컨테이너 엘리먼트를 반환
	 * @return {HTMLElement}
	 */
	getElement : function () {
		return this._elContainer;
	},
	
	/**
	 * 렌더러에 적용된 시간을 반환
	 * 
	 * @return {Number} ms
	 */
	getDuration : function () {
		return this._nDuration;
	},
	
	/**
	 * 렌더러 정보를 반환
	 * 
	 * @return {Object} htInfo
	 * @return {Number} htInfo.frame 현재 프레임 수
	 * @return {Number} htInfo.skippedFrame 지나간 누적 프레임 수
	 * @return {Number} htInfo.fps
	 * @return {Number} htInfo.duration 지연시간(ms)
	 * @return {Number} htInfo.renderingTime 이전에 발생했던 렌더링 시간(ms)
	 * @return {Number} htInfo.beforeFrameTime 이전에 렌더러가 실행됐던 시간(timestamp)
	 */
	getInfo : function () {
		// 객체 재활용
		this._htCallback.frame = this._nCurrentFrame;
		this._htCallback.skippedFrame = this._nSkippedFrame;
		this._htCallback.fps = this._nFPS;
		this._htCallback.duration = this._nDuration;
		this._htCallback.renderingTime = this._nBeforeRenderingTime;
		this._htCallback.beforeFrameTime = this._nBeforeFrameTime;
		return this._htCallback;
	},
	
	/**
	 * 렌더링 모드를 반환
	 * - 두개의 방식을 섞어 쓰는 것은 속도가 느려서 1가지 방식을 사용하는 것이 낫다
	 * @return {String} [dom|canvas]
	 */
	getRenderingMode : function () {
		if (this._sRenderingMode === null) {
			var htDeviceInfo = collie.util.getDeviceInfo();
			this._sRenderingMode = this.DEBUG_RENDERING_MODE;

			if (!this._sRenderingMode || this._sRenderingMode === "auto") {
				// 안드로이드 2.2 미만, 캔버스를 지원하지 않거나 ios 5 미만인 경우
				// 안드로이드 4 버전대에서 DOM 불안정성이 발견됨
				// 안드로이드 4.2.2 galaxy S4 부터 canvas가 더 빨라짐			
				if (
					(
						htDeviceInfo.android && !htDeviceInfo.chrome && (
							(htDeviceInfo.android < 4.2 && htDeviceInfo.android >= 3) ||
							htDeviceInfo.android < 2.2
						)
					) ||
					!htDeviceInfo.supportCanvas ||
					(htDeviceInfo.ios && htDeviceInfo.ios < 5)
				) {
					this._sRenderingMode = "dom";
				} else {
					this._sRenderingMode = "canvas";
				}
			}
			
			// 캔버스를 지원하지 않으면 무조건 DOM 모드로
			if (!htDeviceInfo.supportCanvas) {
				this._sRenderingMode = "dom";
			}
		}
		
		return this._sRenderingMode;
	},
	
	/**
	 * 렌더링 모드를 변경 한다
	 * 
	 * @param {String} sMode [auto|dom|canvas]
	 * @example collie를 사용하기 전에 사용해야 한다.
	 * collie.Renderer.setRenderingMode("dom");
	 * collie.ImageManager.add({
	 * 	...
	 * }, function () {
	 * 	...
	 * });
	 */
	setRenderingMode : function (sMode) {
		this.DEBUG_RENDERING_MODE = sMode.toString().toLowerCase();
		this._sRenderingMode = null;
	},
	
	/**
	 * 레티나 디스플레이를 사용하고 있는지 여부
	 * IE9 미만에서는 무조건 false를 반환
	 * 
	 * @return {Boolean}
	 */
	isRetinaDisplay : function () {
		if (this._bUseRetinaDisplay === null) {
			// android 4.0 이상도 retina 지원 추가
			this._bUseRetinaDisplay = this.RETINA_DISPLAY !== "auto" ? this.RETINA_DISPLAY : window.devicePixelRatio >= 2 && (!collie.util.getDeviceInfo().android || collie.util.getDeviceInfo().android >= 4);
			var htDeviceInfo = collie.util.getDeviceInfo();
			
			// background-size를 지원하지 않는 상태에서 고해상도 디스플레이 모드 사용할 수 없음
			if (htDeviceInfo.ie && htDeviceInfo.ie < 9) {
				this._bUseRetinaDisplay = false;
			}
		}
		
		return this._bUseRetinaDisplay;
	},
	
	/**
	 * 레티나 디스플레이 방식을 변경 한다
	 * @param {Boolean|String} vMode [false|true|"auto"]
	 * @example collie를 사용하기 전에 사용해야 한다.
	 * collie.Renderer.setRetinaDisplay(true);
	 * collie.ImageManager.add({
	 * 	...
	 * }, function () {
	 * 	...
	 * });
	 */
	setRetinaDisplay : function (vMode) {
		this.RETINA_DISPLAY = vMode;
		this._bUseRetinaDisplay = null;
	},
	
	/**
	 * requestAnimationFrame 사용 여부 반환
	 * 
	 * @private
	 * @param {Boolean} bCancelName true면 CancelAnimationFrame 이름을 반환
	 * @return {bool|String} 사용 가능하면 함수명을 반환
	 */
	_getNameAnimationFrame : function (bCancelName) {
		if (typeof window.requestAnimationFrame !== "undefined") {
			return bCancelName ? "cancelAnimationFrame" : "requestAnimationFrame";
		} else if (typeof window.webkitRequestAnimationFrame !== "undefined") {
			return bCancelName ? "webkitCancelAnimationFrame" : "webkitRequestAnimationFrame";
		} else if (typeof window.msRequestAnimationFrame !== "undefined") {
			return bCancelName ? "msCancelAnimationFrame" : "msRequestAnimationFrame";
		} else if (typeof window.mozRequestAnimationFrame !== "undefined") {
			return bCancelName ? "mozCancelAnimationFrame" : "mozRequestAnimationFrame";
		} else if (typeof window.oRequestAnimationFrame !== "undefined") {
			return bCancelName ? "oCancelAnimationFrame" : "oRequestAnimationFrame";
		} else {
			return false;
		}
	},
	
	/**
	 * Page Visibility Event 이름을 반환
	 * @private
	 * @return {String|Boolean}
	 */
	_getNamePageVisibility : function () {
		if ("hidden" in document) {
			return "visibilitychange";
		} else if ("webkitHidden" in document) {
			return "webkitvisibilitychange";
		} else if ("mozHidden" in document) {
			return "mozvisibilitychange";
		} else {
			return false;
		} 
	},
	
	/**
	 * 표현할 레이어를 elParent에 붙인다 시작전에 반드시 해야함
	 * 
	 * @param {HTMLElement} elParent
	 */
	load : function (elParent) {
		this.unload();
		this._bLoaded = true;
		this._elParent = elParent;
		this._elParent.appendChild(this._elContainer);
		this.refresh();
		
		if (this._aLayerList.length) {
			for (var i = 0, len = this._aLayerList.length; i < len; i++) {
				this._aLayerList[i].load(this._elContainer, i);
			}
			
			// 레이어 역순으로 이벤트가 동작해야 하기 때문에 이벤트는 역순으로 건다
			for (var i = this._aLayerList.length - 1; i >= 0; i--) {
				this._aLayerList[i].attachEvent();
			}
		}
		
	},
	
	/**
	 * 부모 엘리먼트에 붙인 레이어를 지움
	 */
	unload : function () {
		if (this._bLoaded) {
			for (var i = 0, len = this._aLayerList.length; i < len; i++) {
				this._aLayerList[i].unload();
			}
	
			this._elParent.removeChild(this._elContainer);
			this._elParent = null;
			this._bLoaded = false;
		}
	},
	
	/**
	 * 렌더링 시작
	 * - callback 안에서 false를 반환하면 rendering을 멈춘다
	 * 
	 * @param {Number|String} vDuration 렌더러의 시간 간격(ms), fps를 붙이면 fps 단위로 입력된다.
	 * @param {Function} fCallback 프레임마다 실행할 함수, 없어도 되고 process 이벤트를 받아서 처리해도 된다.
	 * @param {Number} fCallback.frame 현재 프레임
	 * @param {Number} fCallback.skippedFrame 시간이 밀려서 지나간 프레임 수
	 * @param {Number} fCallback.fps FPS
	 * @param {Number} fCallback.duration 지연 시간 (ms)
	 * @example
	 * fps를 붙이면 FPS단위로 입력할 수 있다.
	 * <code>
	 * collie.Renderer.start("30fps");
	 * collie.Renderer.start(1000 / 30);
	 * </code>
	 */
	start : function (vDuration, fCallback) {
		if (!this._bPlaying) {
			// this.stop();
			vDuration = vDuration || this.DEFAULT_FPS;
			this._nDuration = (/fps$/i.test(vDuration)) ? 1000 / parseInt(vDuration, 10) : Math.max(16, vDuration);
			this._fCallback = fCallback || null;
			this._bPlaying = true;
			
			// FPS가 60일 때만 requestAnimationFrame을 사용한다
			if (this._nDuration < 17) {
				this._sRequestAnimationFrameName = this._getNameAnimationFrame();
				this._sCancelAnimationFrameName = this._getNameAnimationFrame(true);
			} else {
				this._sRequestAnimationFrameName = false;
				this._sCancelAnimationFrameName = false;
			}
			
			/**
			 * 렌더링 시작
			 * @name collie.Renderer#start
			 * @event
			 * @param {Object} oEvent
			 */
			this.fireEvent("start");
			this._trigger(0);
		}
		
	},
	
	_trigger : function (nDelay) {
		if (!this._sVisibilityChange) {
			if (window.screenTop < -30000) {
				this.pause();
			}
		}
		
		if (typeof nDelay === "undefined") {
			nDelay = 0;
		} else {
			nDelay = parseInt(nDelay, 10);
		}
		
		// 가상 딜레이를 적용하려면 requestAnimationFrame을 제거
		if (this._sRequestAnimationFrameName !== false && !this.DEBUG_USE_DELAY) {
			this._oRenderingTimer = window[this._sRequestAnimationFrameName](this._fRender);
		} else {
			this._oRenderingTimer = setTimeout(this._fRender, nDelay);
		}
	},
	
	/**
	 * 실제 화면을 렌더링
	 * 
	 * @private
	 * @param {Number} nSkippedFrame collie.Renderer#draw 에서 넘어온 인자
	 * @param {Boolean} 실행중 여부와 관계 없이 그림
	 */
	_render : function (nSkippedFrame, bForcePlay) {
		// stop 시점이 비동기라서 시점이 안맞을 수도 있음. 렌더링이 바로 중단되야 함
		if (!this._bPlaying && !bForcePlay) {
			return;
		}
		
		var nTime = this._getDate();
		var nRealDuration = 0;
		var nFrameStep = 1; // 진행할 프레임 단계
		
		// 진행된 프레임이면 시간 계산
		if (this._nBeforeFrameTime !== null) {
			nRealDuration = nTime - this._nBeforeFrameTime; // 실제 걸린 시간
			nFrameStep = nSkippedFrame || Math.max(1, Math.round(nRealDuration / this._nDuration)); // 60fps 미만으로는 버린다
			
			// requestAnimationFrame 인자가 들어옴
			if (this._sRequestAnimationFrameName !== false) {
				nSkippedFrame = 0;
				nFrameStep = 1;
			}
			
			this._nSkippedFrame += Math.max(0, nFrameStep - 1);
			this._nFPS = Math.round(1000 / (nTime - this._nBeforeFrameTime));
		}
		
		this._nCurrentFrame += nFrameStep;
		var htInfo = this.getInfo();
		
		// callback이 없거나 callback 실행 결과가 false가 아니거나 process 이벤트 stop이 발생 안한 경우에만 진행
		/**
		 * 렌더링 진행
		 * @name collie.Renderer#process
		 * @event
		 * @param {Object} oEvent
		 * @param {Function} oEvent.stop stop 하면 렌더링이 멈춘다
		 */		
		if ((this._fCallback === null || this._fCallback(htInfo) !== false) && this.fireEvent("process", htInfo) !== false) {
			collie.Timer.run(this._nCurrentFrame, nRealDuration);
			this._update(nRealDuration);
			var nDebugDelayedTime = 0; 
			
			// 가상 딜레이 적용
			if (this.DEBUG_USE_DELAY) {
				nDebugDelayedTime = Math.round(Math.random() * this.DEBUG_MAX_DELAY);
				this._nDebugDelayedTime += nDebugDelayedTime;
			}
						
			this._nBeforeRenderingTime = this._getDate() - nTime;
			this._nBeforeFrameTime = nTime;
			
			if (this._bPlaying) {
				this._trigger(Math.max(0, this._nDuration - this._nBeforeRenderingTime + nDebugDelayedTime * 2));
			}
		} else {
			this.stop();
		}
	},
	
	/**
	 * 원하는 프레임으로 스킵해서 그린다
	 * 
	 * @param {Number} nSkippedFrame 값이 없으면 스킵 없이, 값이 있으면 그 값만큼 프레임을 스킵해서 그린다
	 */
	draw : function (nSkippedFrame) {
		this._fRender(nSkippedFrame, true);
	},
	
	/**
	 * 현재 시간을 가져 온다
	 * @private
	 * @return {Number} timestamp
	 */
	_getDate : function () {
		return (+new Date()) + (this.DEBUG_USE_DELAY ? this._nDebugDelayedTime : 0);
	},

	/**
	 * 렌더링을 멈춘다
	 */
	stop : function () {
		if (this._bPlaying) {
			this._bPlaying = false;
			this._resetTimer();
			
			/**
			 * 렌더링 멈춤
			 * @name collie.Renderer#stop
			 * @event
			 * @param {Object} oEvent
			 */
			this.fireEvent("stop", this.getInfo());

			this._sRenderingMode = null;
			this._bUseRetinaDisplay = null;			
			this._fCallback = null;
			this._nCurrentFrame = 0;
			this._nBeforeRenderingTime = 0;
			this._nSkippedFrame = 0;
			this._nBeforeFrameTime = null;			
		}
	},
	
	_resetTimer : function () {
		if (this._oRenderingTimer !== null) {
			if (this._sCancelAnimationFrameName !== false) {
				window[this._sCancelAnimationFrameName](this._oRenderingTimer);
			} else {
				clearTimeout(this._oRenderingTimer);
			}

			//TODO debug			
			window.tempTimer = window.tempTimer || [];
			window.tempTimer.push(this._oRenderingTimer);
			this._oRenderingTimer = null;
		}
	},
	
	/**
	 * 잠시 멈춘다
	 */
	pause : function () {
		if (this._bPlaying) {
			this._bPlaying = false;
			this._bPause = true;
			
			/**
			 * 렌더러가 일시 정지 때 발생. getInfo 값이 이벤트 인자로 넘어간다
			 * @name collie.Renderer#pause
			 * @event
			 * @see collie.Renderer.getInfo
			 */
			this.fireEvent("pause", this.getInfo());
			
			// 진행되고 있는 타이머를 해제
			this._resetTimer();			
		}
	},
	
	/**
	 * 잠시 멈춘것을 다시 실행 한다
	 */
	resume : function () {
		if (this._bPause) {
			this._nBeforeFrameTime = this._getDate();
			this._nBeforeRenderingTime = 0;
			this._bPlaying = true;
			this._bPause = false;
			
			/**
			 * 렌더러가 일시 정지에서 해제될 때 발생. getInfo 값이 이벤트 인자로 넘어간다
			 * @name collie.Renderer#resume
			 * @event
			 * @see collie.Renderer.getInfo
			 */
			this.fireEvent("resume", this.getInfo());
			this._trigger(0);
		}
	},
	
	/**
	 * 현재 실행 중인지 여부를 반환
	 * 
	 * @return {Boolean}
	 */
	isPlaying : function () {
		return this._bPlaying;
	},
	
	/**
	 * 레이어 업데이트, 주로 다시 그리거나 동작 등을 업데이트 한다
	 * 
	 * @param {Number} nFrameDuration 실제 진행된 시간
	 * @private
	 */
	_update : function (nFrameDuration) {
		for (var i = 0, len = this._aLayerList.length; i < len; i++) {
			this._aLayerList[i].update(nFrameDuration);
		}
	},
	
	/**
	 * 이벤트의 레이어간 전달을 막기 위한 이벤트 상태를 설정 한다
	 * 
	 * @private
	 * @param {String} sEventType 이벤트 타입
	 * @param {Boolean} bFiredOnTarget 이벤트가 대상에 발생했는지 여부
	 */
	setEventStatus : function (sEventType, bFiredOnTarget) {
		this._htEventStatus = {
			type : sEventType,
			firedOnTarget : bFiredOnTarget
		};
	},
	
	/**
	 * 객체 이벤트를 멈춰야 하는지 여부
	 * @private
	 * @param {String} sEventType 이벤트 타입
	 * @return {Boolean} 이벤트를 멈춰야 하는지 여부
	 */
	isStopEvent : function (sEventType) {
		// click 이벤트는 임의로 발생시키기 때문에 mouseup 으로 간주
		if (sEventType === "click") {
			sEventType = "mouseup";
		}
		
		return sEventType === this._htEventStatus.type && this._htEventStatus.firedOnTarget;
	},
	
	/**
	 * 이벤트의 레이어간 전달을 막기 위한 이벤트 상태를 가져 온다
	 * 
	 * @private
	 * @return {Object} htEventStatus
	 * @return {String} htEventStatus.type 이벤트 타입
	 * @return {Boolean} htEventStatus.firedOnTarget 이벤트가 대상에 발생했는지 여부
	 */
	getEventStatus : function () {
		return this._htEventStatus;
	},
	
	/**
	 * 레이어 위에서 기본 이벤트(mousemove, mousedown) 동작을 막을지 여부를 설정 한다.
	 * 
	 * @param {Boolean} bPreventDefault true면 기본 동작을 막는다.
	 */
	setPreventDefault : function (bPreventDefault) {
		this._bIsPreventDefault = !!bPreventDefault;
	},
	
	/**
	 * 기본 동작을 막는지 여부를 반환
	 * 
	 * @return {Boolean} true일 때 막는다, 기본값이 true
	 */
	isPreventDefault : function () {
		return this._bIsPreventDefault;
	},
	
	/**
	 * 렌더러에 등록된 모든 레이어의 크기를 변경 한다
	 * 
	 * @param {Number} nWidth
	 * @param {Number} nHeight
	 * @param {Boolean} bExpand 확장할지 크기만 변경할지 여부
	 */
	resize : function (nWidth, nHeight, bExpand) {
		for (var i = 0, len = this._aLayerList.length; i < len; i++) {
			this._aLayerList[i].resize(nWidth, nHeight, bExpand);
		}
	}
}, collie.Component))();

// Console wrapper
window.log=function(){log.history=log.history||[];log.history.push(arguments);if(this.console){console.log(Array.prototype.slice.call(arguments))}};
/*!

 handlebars v1.1.2

Copyright (C) 2011 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
var Handlebars = (function() {
// handlebars/safe-string.js
var __module4__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module3__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr] || "&amp;";
  }

  function extend(obj, value) {
    for(var key in value) {
      if(value.hasOwnProperty(key)) {
        obj[key] = value[key];
      }
    }
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (!string && string !== 0) {
      return "";
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;
  return __exports__;
})(__module4__);

// handlebars/exception.js
var __module5__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(/* message */) {
    var tmp = Error.prototype.constructor.apply(this, arguments);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module2__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  /*globals Exception, Utils */
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "1.1.2";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 4;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '>= 1.0.0'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn, inverse) {
      if (toString.call(name) === objectType) {
        if (inverse || fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        if (inverse) { fn.not = inverse; }
        this.helpers[name] = fn;
      }
    },

    registerPartial: function(name, str) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = str;
      }
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(arg) {
      if(arguments.length === 2) {
        return undefined;
      } else {
        throw new Error("Missing helper: '" + arg + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse || function() {}, fn = options.fn;

      if (isFunction(context)) { context = context.call(this); }

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        return fn(context);
      }
    });

    instance.registerHelper('each', function(context, options) {
      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0)
              data.last  = (i === (context.length-1));
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) { data.key = key; }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      if (!Utils.isEmpty(context)) return options.fn(context);
    });

    instance.registerHelper('log', function(context, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, context);
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, obj) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, obj);
        }
      }
    }
  };
  __exports__.logger = logger;
  function log(level, obj) { logger.log(level, obj); }

  __exports__.log = log;var createFrame = function(object) {
    var obj = {};
    Utils.extend(obj, object);
    return obj;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module3__, __module5__);

// handlebars/runtime.js
var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  /*global Utils */
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Error("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Error("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  // TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    if (!env) {
      throw new Error("No environment passed to template");
    }

    var invokePartialWrapper;
    if (env.compile) {
      invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
        // TODO : Check this for all inputs and the options handling (partial flag, etc). This feels
        // like there should be a common exec path
        var result = invokePartial.apply(this, arguments);
        if (result) { return result; }

        var options = { helpers: helpers, partials: partials, data: data };
        partials[name] = env.compile(partial, { data: data !== undefined }, env);
        return partials[name](context, options);
      };
    } else {
      invokePartialWrapper = function(partial, name /* , context, helpers, partials, data */) {
        var result = invokePartial.apply(this, arguments);
        if (result) { return result; }
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      };
    }

    // Just add water
    var container = {
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      programs: [],
      program: function(i, fn, data) {
        var programWrapper = this.programs[i];
        if(data) {
          programWrapper = program(i, fn, data);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(i, fn);
        }
        return programWrapper;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = {};
          Utils.extend(ret, common);
          Utils.extend(ret, param);
        }
        return ret;
      },
      programWithDepth: programWithDepth,
      noop: noop,
      compilerInfo: null
    };

    return function(context, options) {
      options = options || {};
      var namespace = options.partial ? options : env,
          helpers,
          partials;

      if (!options.partial) {
        helpers = options.helpers;
        partials = options.partials;
      }
      var result = templateSpec.call(
            container,
            namespace, context,
            helpers,
            partials,
            options.data);

      if (!options.partial) {
        checkRevision(container.compilerInfo);
      }

      return result;
    };
  }

  __exports__.template = template;function programWithDepth(i, fn, data /*, $depth */) {
    var args = Array.prototype.slice.call(arguments, 3);

    var prog = function(context, options) {
      options = options || {};

      return fn.apply(this, [context, options.data || data].concat(args));
    };
    prog.program = i;
    prog.depth = args.length;
    return prog;
  }

  __exports__.programWithDepth = programWithDepth;function program(i, fn, data) {
    var prog = function(context, options) {
      options = options || {};

      return fn(context, options.data || data);
    };
    prog.program = i;
    prog.depth = 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;
  return __exports__;
})(__module3__, __module5__, __module2__);

// handlebars.runtime.js
var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module2__, __module4__, __module5__, __module3__, __module6__);

// handlebars/compiler/ast.js
var __module7__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;

  function ProgramNode(statements, inverseStrip, inverse) {
    this.type = "program";
    this.statements = statements;
    this.strip = {};

    if(inverse) {
      this.inverse = new ProgramNode(inverse, inverseStrip);
      this.strip.right = inverseStrip.left;
    } else if (inverseStrip) {
      this.strip.left = inverseStrip.right;
    }
  }

  __exports__.ProgramNode = ProgramNode;function MustacheNode(rawParams, hash, open, strip) {
    this.type = "mustache";
    this.hash = hash;
    this.strip = strip;

    var escapeFlag = open[3] || open[2];
    this.escaped = escapeFlag !== '{' && escapeFlag !== '&';

    var id = this.id = rawParams[0];
    var params = this.params = rawParams.slice(1);

    // a mustache is an eligible helper if:
    // * its id is simple (a single part, not `this` or `..`)
    var eligibleHelper = this.eligibleHelper = id.isSimple;

    // a mustache is definitely a helper if:
    // * it is an eligible helper, and
    // * it has at least one parameter or hash segment
    this.isHelper = eligibleHelper && (params.length || hash);

    // if a mustache is an eligible helper but not a definite
    // helper, it is ambiguous, and will be resolved in a later
    // pass or at runtime.
  }

  __exports__.MustacheNode = MustacheNode;function PartialNode(partialName, context, strip) {
    this.type         = "partial";
    this.partialName  = partialName;
    this.context      = context;
    this.strip = strip;
  }

  __exports__.PartialNode = PartialNode;function BlockNode(mustache, program, inverse, close) {
    if(mustache.id.original !== close.path.original) {
      throw new Exception(mustache.id.original + " doesn't match " + close.path.original);
    }

    this.type = "block";
    this.mustache = mustache;
    this.program  = program;
    this.inverse  = inverse;

    this.strip = {
      left: mustache.strip.left,
      right: close.strip.right
    };

    (program || inverse).strip.left = mustache.strip.right;
    (inverse || program).strip.right = close.strip.left;

    if (inverse && !program) {
      this.isInverse = true;
    }
  }

  __exports__.BlockNode = BlockNode;function ContentNode(string) {
    this.type = "content";
    this.string = string;
  }

  __exports__.ContentNode = ContentNode;function HashNode(pairs) {
    this.type = "hash";
    this.pairs = pairs;
  }

  __exports__.HashNode = HashNode;function IdNode(parts) {
    this.type = "ID";

    var original = "",
        dig = [],
        depth = 0;

    for(var i=0,l=parts.length; i<l; i++) {
      var part = parts[i].part;
      original += (parts[i].separator || '') + part;

      if (part === ".." || part === "." || part === "this") {
        if (dig.length > 0) { throw new Exception("Invalid path: " + original); }
        else if (part === "..") { depth++; }
        else { this.isScoped = true; }
      }
      else { dig.push(part); }
    }

    this.original = original;
    this.parts    = dig;
    this.string   = dig.join('.');
    this.depth    = depth;

    // an ID is simple if it only has one part, and that part is not
    // `..` or `this`.
    this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

    this.stringModeValue = this.string;
  }

  __exports__.IdNode = IdNode;function PartialNameNode(name) {
    this.type = "PARTIAL_NAME";
    this.name = name.original;
  }

  __exports__.PartialNameNode = PartialNameNode;function DataNode(id) {
    this.type = "DATA";
    this.id = id;
  }

  __exports__.DataNode = DataNode;function StringNode(string) {
    this.type = "STRING";
    this.original =
      this.string =
      this.stringModeValue = string;
  }

  __exports__.StringNode = StringNode;function IntegerNode(integer) {
    this.type = "INTEGER";
    this.original =
      this.integer = integer;
    this.stringModeValue = Number(integer);
  }

  __exports__.IntegerNode = IntegerNode;function BooleanNode(bool) {
    this.type = "BOOLEAN";
    this.bool = bool;
    this.stringModeValue = bool === "true";
  }

  __exports__.BooleanNode = BooleanNode;function CommentNode(comment) {
    this.type = "comment";
    this.comment = comment;
  }

  __exports__.CommentNode = CommentNode;
  return __exports__;
})(__module5__);

// handlebars/compiler/parser.js
var __module9__ = (function() {
  "use strict";
  var __exports__;
  /* Jison generated parser */
  var handlebars = (function(){
  var parser = {trace: function trace() { },
  yy: {},
  symbols_: {"error":2,"root":3,"statements":4,"EOF":5,"program":6,"simpleInverse":7,"statement":8,"openInverse":9,"closeBlock":10,"openBlock":11,"mustache":12,"partial":13,"CONTENT":14,"COMMENT":15,"OPEN_BLOCK":16,"inMustache":17,"CLOSE":18,"OPEN_INVERSE":19,"OPEN_ENDBLOCK":20,"path":21,"OPEN":22,"OPEN_UNESCAPED":23,"CLOSE_UNESCAPED":24,"OPEN_PARTIAL":25,"partialName":26,"partial_option0":27,"inMustache_repetition0":28,"inMustache_option0":29,"dataName":30,"param":31,"STRING":32,"INTEGER":33,"BOOLEAN":34,"hash":35,"hash_repetition_plus0":36,"hashSegment":37,"ID":38,"EQUALS":39,"DATA":40,"pathSegments":41,"SEP":42,"$accept":0,"$end":1},
  terminals_: {2:"error",5:"EOF",14:"CONTENT",15:"COMMENT",16:"OPEN_BLOCK",18:"CLOSE",19:"OPEN_INVERSE",20:"OPEN_ENDBLOCK",22:"OPEN",23:"OPEN_UNESCAPED",24:"CLOSE_UNESCAPED",25:"OPEN_PARTIAL",32:"STRING",33:"INTEGER",34:"BOOLEAN",38:"ID",39:"EQUALS",40:"DATA",42:"SEP"},
  productions_: [0,[3,2],[3,1],[6,2],[6,3],[6,2],[6,1],[6,1],[6,0],[4,1],[4,2],[8,3],[8,3],[8,1],[8,1],[8,1],[8,1],[11,3],[9,3],[10,3],[12,3],[12,3],[13,4],[7,2],[17,3],[17,1],[31,1],[31,1],[31,1],[31,1],[31,1],[35,1],[37,3],[26,1],[26,1],[26,1],[30,2],[21,1],[41,3],[41,1],[27,0],[27,1],[28,0],[28,2],[29,0],[29,1],[36,1],[36,2]],
  performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

  var $0 = $$.length - 1;
  switch (yystate) {
  case 1: return new yy.ProgramNode($$[$0-1]); 
  break;
  case 2: return new yy.ProgramNode([]); 
  break;
  case 3:this.$ = new yy.ProgramNode([], $$[$0-1], $$[$0]);
  break;
  case 4:this.$ = new yy.ProgramNode($$[$0-2], $$[$0-1], $$[$0]);
  break;
  case 5:this.$ = new yy.ProgramNode($$[$0-1], $$[$0], []);
  break;
  case 6:this.$ = new yy.ProgramNode($$[$0]);
  break;
  case 7:this.$ = new yy.ProgramNode([]);
  break;
  case 8:this.$ = new yy.ProgramNode([]);
  break;
  case 9:this.$ = [$$[$0]];
  break;
  case 10: $$[$0-1].push($$[$0]); this.$ = $$[$0-1]; 
  break;
  case 11:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1].inverse, $$[$0-1], $$[$0]);
  break;
  case 12:this.$ = new yy.BlockNode($$[$0-2], $$[$0-1], $$[$0-1].inverse, $$[$0]);
  break;
  case 13:this.$ = $$[$0];
  break;
  case 14:this.$ = $$[$0];
  break;
  case 15:this.$ = new yy.ContentNode($$[$0]);
  break;
  case 16:this.$ = new yy.CommentNode($$[$0]);
  break;
  case 17:this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], $$[$0-2], stripFlags($$[$0-2], $$[$0]));
  break;
  case 18:this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], $$[$0-2], stripFlags($$[$0-2], $$[$0]));
  break;
  case 19:this.$ = {path: $$[$0-1], strip: stripFlags($$[$0-2], $$[$0])};
  break;
  case 20:this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], $$[$0-2], stripFlags($$[$0-2], $$[$0]));
  break;
  case 21:this.$ = new yy.MustacheNode($$[$0-1][0], $$[$0-1][1], $$[$0-2], stripFlags($$[$0-2], $$[$0]));
  break;
  case 22:this.$ = new yy.PartialNode($$[$0-2], $$[$0-1], stripFlags($$[$0-3], $$[$0]));
  break;
  case 23:this.$ = stripFlags($$[$0-1], $$[$0]);
  break;
  case 24:this.$ = [[$$[$0-2]].concat($$[$0-1]), $$[$0]];
  break;
  case 25:this.$ = [[$$[$0]], null];
  break;
  case 26:this.$ = $$[$0];
  break;
  case 27:this.$ = new yy.StringNode($$[$0]);
  break;
  case 28:this.$ = new yy.IntegerNode($$[$0]);
  break;
  case 29:this.$ = new yy.BooleanNode($$[$0]);
  break;
  case 30:this.$ = $$[$0];
  break;
  case 31:this.$ = new yy.HashNode($$[$0]);
  break;
  case 32:this.$ = [$$[$0-2], $$[$0]];
  break;
  case 33:this.$ = new yy.PartialNameNode($$[$0]);
  break;
  case 34:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0]));
  break;
  case 35:this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0]));
  break;
  case 36:this.$ = new yy.DataNode($$[$0]);
  break;
  case 37:this.$ = new yy.IdNode($$[$0]);
  break;
  case 38: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2]; 
  break;
  case 39:this.$ = [{part: $$[$0]}];
  break;
  case 42:this.$ = [];
  break;
  case 43:$$[$0-1].push($$[$0]);
  break;
  case 46:this.$ = [$$[$0]];
  break;
  case 47:$$[$0-1].push($$[$0]);
  break;
  }
  },
  table: [{3:1,4:2,5:[1,3],8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[3]},{5:[1,16],8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],22:[1,13],23:[1,14],25:[1,15]},{1:[2,2]},{5:[2,9],14:[2,9],15:[2,9],16:[2,9],19:[2,9],20:[2,9],22:[2,9],23:[2,9],25:[2,9]},{4:20,6:18,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{4:20,6:22,7:19,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,8],22:[1,13],23:[1,14],25:[1,15]},{5:[2,13],14:[2,13],15:[2,13],16:[2,13],19:[2,13],20:[2,13],22:[2,13],23:[2,13],25:[2,13]},{5:[2,14],14:[2,14],15:[2,14],16:[2,14],19:[2,14],20:[2,14],22:[2,14],23:[2,14],25:[2,14]},{5:[2,15],14:[2,15],15:[2,15],16:[2,15],19:[2,15],20:[2,15],22:[2,15],23:[2,15],25:[2,15]},{5:[2,16],14:[2,16],15:[2,16],16:[2,16],19:[2,16],20:[2,16],22:[2,16],23:[2,16],25:[2,16]},{17:23,21:24,30:25,38:[1,28],40:[1,27],41:26},{17:29,21:24,30:25,38:[1,28],40:[1,27],41:26},{17:30,21:24,30:25,38:[1,28],40:[1,27],41:26},{17:31,21:24,30:25,38:[1,28],40:[1,27],41:26},{21:33,26:32,32:[1,34],33:[1,35],38:[1,28],41:26},{1:[2,1]},{5:[2,10],14:[2,10],15:[2,10],16:[2,10],19:[2,10],20:[2,10],22:[2,10],23:[2,10],25:[2,10]},{10:36,20:[1,37]},{4:38,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,7],22:[1,13],23:[1,14],25:[1,15]},{7:39,8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,21],20:[2,6],22:[1,13],23:[1,14],25:[1,15]},{17:23,18:[1,40],21:24,30:25,38:[1,28],40:[1,27],41:26},{10:41,20:[1,37]},{18:[1,42]},{18:[2,42],24:[2,42],28:43,32:[2,42],33:[2,42],34:[2,42],38:[2,42],40:[2,42]},{18:[2,25],24:[2,25]},{18:[2,37],24:[2,37],32:[2,37],33:[2,37],34:[2,37],38:[2,37],40:[2,37],42:[1,44]},{21:45,38:[1,28],41:26},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],38:[2,39],40:[2,39],42:[2,39]},{18:[1,46]},{18:[1,47]},{24:[1,48]},{18:[2,40],21:50,27:49,38:[1,28],41:26},{18:[2,33],38:[2,33]},{18:[2,34],38:[2,34]},{18:[2,35],38:[2,35]},{5:[2,11],14:[2,11],15:[2,11],16:[2,11],19:[2,11],20:[2,11],22:[2,11],23:[2,11],25:[2,11]},{21:51,38:[1,28],41:26},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,3],22:[1,13],23:[1,14],25:[1,15]},{4:52,8:4,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,5],22:[1,13],23:[1,14],25:[1,15]},{14:[2,23],15:[2,23],16:[2,23],19:[2,23],20:[2,23],22:[2,23],23:[2,23],25:[2,23]},{5:[2,12],14:[2,12],15:[2,12],16:[2,12],19:[2,12],20:[2,12],22:[2,12],23:[2,12],25:[2,12]},{14:[2,18],15:[2,18],16:[2,18],19:[2,18],20:[2,18],22:[2,18],23:[2,18],25:[2,18]},{18:[2,44],21:56,24:[2,44],29:53,30:60,31:54,32:[1,57],33:[1,58],34:[1,59],35:55,36:61,37:62,38:[1,63],40:[1,27],41:26},{38:[1,64]},{18:[2,36],24:[2,36],32:[2,36],33:[2,36],34:[2,36],38:[2,36],40:[2,36]},{14:[2,17],15:[2,17],16:[2,17],19:[2,17],20:[2,17],22:[2,17],23:[2,17],25:[2,17]},{5:[2,20],14:[2,20],15:[2,20],16:[2,20],19:[2,20],20:[2,20],22:[2,20],23:[2,20],25:[2,20]},{5:[2,21],14:[2,21],15:[2,21],16:[2,21],19:[2,21],20:[2,21],22:[2,21],23:[2,21],25:[2,21]},{18:[1,65]},{18:[2,41]},{18:[1,66]},{8:17,9:5,11:6,12:7,13:8,14:[1,9],15:[1,10],16:[1,12],19:[1,11],20:[2,4],22:[1,13],23:[1,14],25:[1,15]},{18:[2,24],24:[2,24]},{18:[2,43],24:[2,43],32:[2,43],33:[2,43],34:[2,43],38:[2,43],40:[2,43]},{18:[2,45],24:[2,45]},{18:[2,26],24:[2,26],32:[2,26],33:[2,26],34:[2,26],38:[2,26],40:[2,26]},{18:[2,27],24:[2,27],32:[2,27],33:[2,27],34:[2,27],38:[2,27],40:[2,27]},{18:[2,28],24:[2,28],32:[2,28],33:[2,28],34:[2,28],38:[2,28],40:[2,28]},{18:[2,29],24:[2,29],32:[2,29],33:[2,29],34:[2,29],38:[2,29],40:[2,29]},{18:[2,30],24:[2,30],32:[2,30],33:[2,30],34:[2,30],38:[2,30],40:[2,30]},{18:[2,31],24:[2,31],37:67,38:[1,68]},{18:[2,46],24:[2,46],38:[2,46]},{18:[2,39],24:[2,39],32:[2,39],33:[2,39],34:[2,39],38:[2,39],39:[1,69],40:[2,39],42:[2,39]},{18:[2,38],24:[2,38],32:[2,38],33:[2,38],34:[2,38],38:[2,38],40:[2,38],42:[2,38]},{5:[2,22],14:[2,22],15:[2,22],16:[2,22],19:[2,22],20:[2,22],22:[2,22],23:[2,22],25:[2,22]},{5:[2,19],14:[2,19],15:[2,19],16:[2,19],19:[2,19],20:[2,19],22:[2,19],23:[2,19],25:[2,19]},{18:[2,47],24:[2,47],38:[2,47]},{39:[1,69]},{21:56,30:60,31:70,32:[1,57],33:[1,58],34:[1,59],38:[1,28],40:[1,27],41:26},{18:[2,32],24:[2,32],38:[2,32]}],
  defaultActions: {3:[2,2],16:[2,1],50:[2,41]},
  parseError: function parseError(str, hash) {
      throw new Error(str);
  },
  parse: function parse(input) {
      var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
      this.lexer.setInput(input);
      this.lexer.yy = this.yy;
      this.yy.lexer = this.lexer;
      this.yy.parser = this;
      if (typeof this.lexer.yylloc == "undefined")
          this.lexer.yylloc = {};
      var yyloc = this.lexer.yylloc;
      lstack.push(yyloc);
      var ranges = this.lexer.options && this.lexer.options.ranges;
      if (typeof this.yy.parseError === "function")
          this.parseError = this.yy.parseError;
      function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
      }
      function lex() {
          var token;
          token = self.lexer.lex() || 1;
          if (typeof token !== "number") {
              token = self.symbols_[token] || token;
          }
          return token;
      }
      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
      while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
              action = this.defaultActions[state];
          } else {
              if (symbol === null || typeof symbol == "undefined") {
                  symbol = lex();
              }
              action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
              var errStr = "";
              if (!recovering) {
                  expected = [];
                  for (p in table[state])
                      if (this.terminals_[p] && p > 2) {
                          expected.push("'" + this.terminals_[p] + "'");
                      }
                  if (this.lexer.showPosition) {
                      errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                  } else {
                      errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                  }
                  this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
              }
          }
          if (action[0] instanceof Array && action.length > 1) {
              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
          case 1:
              stack.push(symbol);
              vstack.push(this.lexer.yytext);
              lstack.push(this.lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                  yyleng = this.lexer.yyleng;
                  yytext = this.lexer.yytext;
                  yylineno = this.lexer.yylineno;
                  yyloc = this.lexer.yylloc;
                  if (recovering > 0)
                      recovering--;
              } else {
                  symbol = preErrorSymbol;
                  preErrorSymbol = null;
              }
              break;
          case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
              if (ranges) {
                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
              }
              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
              if (typeof r !== "undefined") {
                  return r;
              }
              if (len) {
                  stack = stack.slice(0, -1 * len * 2);
                  vstack = vstack.slice(0, -1 * len);
                  lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
          case 3:
              return true;
          }
      }
      return true;
  }
  };


  function stripFlags(open, close) {
    return {
      left: open[2] === '~',
      right: close[0] === '~' || close[1] === '~'
    };
  }

  /* Jison generated lexer */
  var lexer = (function(){
  var lexer = ({EOF:1,
  parseError:function parseError(str, hash) {
          if (this.yy.parser) {
              this.yy.parser.parseError(str, hash);
          } else {
              throw new Error(str);
          }
      },
  setInput:function (input) {
          this._input = input;
          this._more = this._less = this.done = false;
          this.yylineno = this.yyleng = 0;
          this.yytext = this.matched = this.match = '';
          this.conditionStack = ['INITIAL'];
          this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
          if (this.options.ranges) this.yylloc.range = [0,0];
          this.offset = 0;
          return this;
      },
  input:function () {
          var ch = this._input[0];
          this.yytext += ch;
          this.yyleng++;
          this.offset++;
          this.match += ch;
          this.matched += ch;
          var lines = ch.match(/(?:\r\n?|\n).*/g);
          if (lines) {
              this.yylineno++;
              this.yylloc.last_line++;
          } else {
              this.yylloc.last_column++;
          }
          if (this.options.ranges) this.yylloc.range[1]++;

          this._input = this._input.slice(1);
          return ch;
      },
  unput:function (ch) {
          var len = ch.length;
          var lines = ch.split(/(?:\r\n?|\n)/g);

          this._input = ch + this._input;
          this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
          //this.yyleng -= len;
          this.offset -= len;
          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
          this.match = this.match.substr(0, this.match.length-1);
          this.matched = this.matched.substr(0, this.matched.length-1);

          if (lines.length-1) this.yylineno -= lines.length-1;
          var r = this.yylloc.range;

          this.yylloc = {first_line: this.yylloc.first_line,
            last_line: this.yylineno+1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
                this.yylloc.first_column - len
            };

          if (this.options.ranges) {
              this.yylloc.range = [r[0], r[0] + this.yyleng - len];
          }
          return this;
      },
  more:function () {
          this._more = true;
          return this;
      },
  less:function (n) {
          this.unput(this.match.slice(n));
      },
  pastInput:function () {
          var past = this.matched.substr(0, this.matched.length - this.match.length);
          return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
      },
  upcomingInput:function () {
          var next = this.match;
          if (next.length < 20) {
              next += this._input.substr(0, 20-next.length);
          }
          return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
      },
  showPosition:function () {
          var pre = this.pastInput();
          var c = new Array(pre.length + 1).join("-");
          return pre + this.upcomingInput() + "\n" + c+"^";
      },
  next:function () {
          if (this.done) {
              return this.EOF;
          }
          if (!this._input) this.done = true;

          var token,
              match,
              tempMatch,
              index,
              col,
              lines;
          if (!this._more) {
              this.yytext = '';
              this.match = '';
          }
          var rules = this._currentRules();
          for (var i=0;i < rules.length; i++) {
              tempMatch = this._input.match(this.rules[rules[i]]);
              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                  match = tempMatch;
                  index = i;
                  if (!this.options.flex) break;
              }
          }
          if (match) {
              lines = match[0].match(/(?:\r\n?|\n).*/g);
              if (lines) this.yylineno += lines.length;
              this.yylloc = {first_line: this.yylloc.last_line,
                             last_line: this.yylineno+1,
                             first_column: this.yylloc.last_column,
                             last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
              this.yytext += match[0];
              this.match += match[0];
              this.matches = match;
              this.yyleng = this.yytext.length;
              if (this.options.ranges) {
                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
              }
              this._more = false;
              this._input = this._input.slice(match[0].length);
              this.matched += match[0];
              token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
              if (this.done && this._input) this.done = false;
              if (token) return token;
              else return;
          }
          if (this._input === "") {
              return this.EOF;
          } else {
              return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                      {text: "", token: null, line: this.yylineno});
          }
      },
  lex:function lex() {
          var r = this.next();
          if (typeof r !== 'undefined') {
              return r;
          } else {
              return this.lex();
          }
      },
  begin:function begin(condition) {
          this.conditionStack.push(condition);
      },
  popState:function popState() {
          return this.conditionStack.pop();
      },
  _currentRules:function _currentRules() {
          return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
      },
  topState:function () {
          return this.conditionStack[this.conditionStack.length-2];
      },
  pushState:function begin(condition) {
          this.begin(condition);
      }});
  lexer.options = {};
  lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


  function strip(start, end) {
    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
  }


  var YYSTATE=YY_START
  switch($avoiding_name_collisions) {
  case 0:
                                     if(yy_.yytext.slice(-2) === "\\\\") {
                                       strip(0,1);
                                       this.begin("mu");
                                     } else if(yy_.yytext.slice(-1) === "\\") {
                                       strip(0,1);
                                       this.begin("emu");
                                     } else {
                                       this.begin("mu");
                                     }
                                     if(yy_.yytext) return 14;
                                   
  break;
  case 1:return 14;
  break;
  case 2:
                                     if(yy_.yytext.slice(-1) !== "\\") this.popState();
                                     if(yy_.yytext.slice(-1) === "\\") strip(0,1);
                                     return 14;
                                   
  break;
  case 3:strip(0,4); this.popState(); return 15;
  break;
  case 4:return 25;
  break;
  case 5:return 16;
  break;
  case 6:return 20;
  break;
  case 7:return 19;
  break;
  case 8:return 19;
  break;
  case 9:return 23;
  break;
  case 10:return 22;
  break;
  case 11:this.popState(); this.begin('com');
  break;
  case 12:strip(3,5); this.popState(); return 15;
  break;
  case 13:return 22;
  break;
  case 14:return 39;
  break;
  case 15:return 38;
  break;
  case 16:return 38;
  break;
  case 17:return 42;
  break;
  case 18:/*ignore whitespace*/
  break;
  case 19:this.popState(); return 24;
  break;
  case 20:this.popState(); return 18;
  break;
  case 21:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 32;
  break;
  case 22:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 32;
  break;
  case 23:return 40;
  break;
  case 24:return 34;
  break;
  case 25:return 34;
  break;
  case 26:return 33;
  break;
  case 27:return 38;
  break;
  case 28:yy_.yytext = strip(1,2); return 38;
  break;
  case 29:return 'INVALID';
  break;
  case 30:return 5;
  break;
  }
  };
  lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|$)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s])))/,/^(?:false(?=([~}\s])))/,/^(?:-?[0-9]+(?=([~}\s])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
  lexer.conditions = {"mu":{"rules":[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[3],"inclusive":false},"INITIAL":{"rules":[0,1,30],"inclusive":true}};
  return lexer;})()
  parser.lexer = lexer;
  function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
  return new Parser;
  })();__exports__ = handlebars;
  return __exports__;
})();

// handlebars/compiler/base.js
var __module8__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var parser = __dependency1__;
  var AST = __dependency2__;

  __exports__.parser = parser;

  function parse(input) {
    // Just return if an already-compile AST was passed in.
    if(input.constructor === AST.ProgramNode) { return input; }

    parser.yy = AST;
    return parser.parse(input);
  }

  __exports__.parse = parse;
  return __exports__;
})(__module9__, __module7__);

// handlebars/compiler/javascript-compiler.js
var __module11__ = (function(__dependency1__) {
  "use strict";
  var __exports__;
  var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
  var log = __dependency1__.log;

  function Literal(value) {
    this.value = value;
  }

  function JavaScriptCompiler() {}

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name /* , type*/) {
      var wrap,
          ret;
      if (parent.indexOf('depth') === 0) {
        wrap = true;
      }

      if (/^[0-9]+$/.test(name)) {
        ret = parent + "[" + name + "]";
      } else if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        ret = parent + "." + name;
      }
      else {
        ret = parent + "['" + name + "']";
      }

      if (wrap) {
        return '(' + parent + ' && ' + ret + ')';
      } else {
        return ret;
      }
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return {
          appendToBuffer: true,
          content: string,
          toString: function() { return "buffer += " + string + ";"; }
        };
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options || {};

      log('debug', this.environment.disassemble() + "\n\n");

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        environments: [],
        aliases: { }
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.registers = { list: [] };
      this.compileStack = [];
      this.inlineStack = [];

      this.compileChildren(environment, options);

      var opcodes = environment.opcodes, opcode;

      this.i = 0;

      for(var l=opcodes.length; this.i<l; this.i++) {
        opcode = opcodes[this.i];

        if(opcode.opcode === 'DECLARE') {
          this[opcode.name] = opcode.value;
        } else {
          this[opcode.opcode].apply(this, opcode.args);
        }

        // Reset the stripNext flag if it was not set by this operation.
        if (opcode.opcode !== this.stripNext) {
          this.stripNext = false;
        }
      }

      // Flush any trailing content that might be pending.
      this.pushSource('');

      return this.createFunctionContext(asObject);
    },

    preamble: function() {
      var out = [];

      if (!this.isChild) {
        var namespace = this.namespace;

        var copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
        if (this.environment.usePartial) { copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"; }
        if (this.options.data) { copies = copies + " data = data || {};"; }
        out.push(copies);
      } else {
        out.push('');
      }

      if (!this.environment.isSimple) {
        out.push(", buffer = " + this.initializeBuffer());
      } else {
        out.push("");
      }

      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = out;
    },

    createFunctionContext: function(asObject) {
      var locals = this.stackVars.concat(this.registers.list);

      if(locals.length > 0) {
        this.source[1] = this.source[1] + ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      if (!this.isChild) {
        for (var alias in this.context.aliases) {
          if (this.context.aliases.hasOwnProperty(alias)) {
            this.source[1] = this.source[1] + ', ' + alias + '=' + this.context.aliases[alias];
          }
        }
      }

      if (this.source[1]) {
        this.source[1] = "var " + this.source[1].substring(2) + ";";
      }

      // Merge children
      if (!this.isChild) {
        this.source[1] += '\n' + this.context.programs.join('\n') + '\n';
      }

      if (!this.environment.isSimple) {
        this.pushSource("return buffer;");
      }

      var params = this.isChild ? ["depth0", "data"] : ["Handlebars", "depth0", "helpers", "partials", "data"];

      for(var i=0, l=this.environment.depths.list.length; i<l; i++) {
        params.push("depth" + this.environment.depths.list[i]);
      }

      // Perform a second pass over the output to merge content when possible
      var source = this.mergeSource();

      if (!this.isChild) {
        var revision = COMPILER_REVISION,
            versions = REVISION_CHANGES[revision];
        source = "this.compilerInfo = ["+revision+",'"+versions+"'];\n"+source;
      }

      if (asObject) {
        params.push(source);

        return Function.apply(this, params);
      } else {
        var functionSource = 'function ' + (this.name || '') + '(' + params.join(',') + ') {\n  ' + source + '}';
        log('debug', functionSource + "\n\n");
        return functionSource;
      }
    },
    mergeSource: function() {
      // WARN: We are not handling the case where buffer is still populated as the source should
      // not have buffer append operations as their final action.
      var source = '',
          buffer;
      for (var i = 0, len = this.source.length; i < len; i++) {
        var line = this.source[i];
        if (line.appendToBuffer) {
          if (buffer) {
            buffer = buffer + '\n    + ' + line.content;
          } else {
            buffer = line.content;
          }
        } else {
          if (buffer) {
            source += 'buffer += ' + buffer + ';\n  ';
            buffer = undefined;
          }
          source += line + '\n  ';
        }
      }
      return source;
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#foo}}...{{/foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      this.replaceStack(function(current) {
        params.splice(1, 0, current);
        return "blockHelperMissing.call(" + params.join(", ") + ")";
      });
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.context.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = ["depth0"];
      this.setupParams(0, params);

      var current = this.topStack();
      params.splice(1, 0, current);

      // Use the options value generated from the invocation
      params[params.length-1] = 'options';

      this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      if (this.pendingContent) {
        content = this.pendingContent + content;
      }
      if (this.stripNext) {
        content = content.replace(/^\s+/, '');
      }

      this.pendingContent = content;
    },

    // [strip]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Removes any trailing whitespace from the prior content node and flags
    // the next operation for stripping if it is a content node.
    strip: function() {
      if (this.pendingContent) {
        this.pendingContent = this.pendingContent.replace(/\s+$/, '');
      }
      this.stripNext = 'strip';
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      // Force anything that is inlined onto the stack so we don't have duplication
      // when we examine local
      this.flushInline();
      var local = this.popStack();
      this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }");
      if (this.environment.isSimple) {
        this.pushSource("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      this.context.aliases.escapeExpression = 'this.escapeExpression';

      this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      if(this.lastContext !== depth) {
        this.lastContext = depth;
      }
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(name) {
      this.push(this.nameLookup('depth' + this.lastContext, name, 'context'));
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral('depth' + this.lastContext);
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.context.aliases.functionType = '"function"';

      this.replaceStack(function(current) {
        return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
      });
    },

    // [lookup]
    //
    // On stack, before: value, ...
    // On stack, after: value[name], ...
    //
    // Replace the value on the stack with the result of looking
    // up `name` on `value`
    lookup: function(name) {
      this.replaceStack(function(current) {
        return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, 'context');
      });
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data, ...
    //
    // Push the data lookup operator
    lookupData: function() {
      this.push('data');
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushStackLiteral('depth' + this.lastContext);

      this.pushString(type);

      if (typeof string === 'string') {
        this.pushString(string);
      } else {
        this.pushStackLiteral(string);
      }
    },

    emptyHash: function() {
      this.pushStackLiteral('{}');

      if (this.options.stringParams) {
        this.register('hashTypes', '{}');
        this.register('hashContexts', '{}');
      }
    },
    pushHash: function() {
      this.hash = {values: [], types: [], contexts: []};
    },
    popHash: function() {
      var hash = this.hash;
      this.hash = undefined;

      if (this.options.stringParams) {
        this.register('hashContexts', '{' + hash.contexts.join(',') + '}');
        this.register('hashTypes', '{' + hash.types.join(',') + '}');
      }
      this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.inlineStack.push(expr);
      return expr;
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name) {
      this.context.aliases.helperMissing = 'helpers.helperMissing';

      var helper = this.lastHelper = this.setupHelper(paramSize, name, true);
      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');

      this.push(helper.name + ' || ' + nonHelper);
      this.replaceStack(function(name) {
        return name + ' ? ' + name + '.call(' +
            helper.callParams + ") " + ": helperMissing.call(" +
            helper.helperMissingParams + ")";
      });
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name, helperCall) {
      this.context.aliases.functionType = '"function"';

      this.pushStackLiteral('{}');    // Hash value
      var helper = this.setupHelper(0, name, helperCall);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

      var nonHelper = this.nameLookup('depth' + this.lastContext, name, 'context');
      var nextStack = this.nextStack();

      this.pushSource('if (' + nextStack + ' = ' + helperName + ') { ' + nextStack + ' = ' + nextStack + '.call(' + helper.callParams + '); }');
      this.pushSource('else { ' + nextStack + ' = ' + nonHelper + '; ' + nextStack + ' = typeof ' + nextStack + ' === functionType ? ' + nextStack + '.call(' + helper.callParams + ') : ' + nextStack + '; }');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + name + "'", this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      }

      this.context.aliases.self = "this";
      this.push("self.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, hash, ...
    // On stack, after: hash, ...
    //
    // Pops a value and hash off the stack, assigns `hash[key] = value`
    // and pushes the hash back onto the stack.
    assignToHash: function(key) {
      var value = this.popStack(),
          context,
          type;

      if (this.options.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }

      var hash = this.hash;
      if (context) {
        hash.contexts.push("'" + key + "': " + context);
      }
      if (type) {
        hash.types.push("'" + key + "': " + type);
      }
      hash.values.push("'" + key + "': (" + value + ")");
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        var index = this.matchExistingProgram(child);

        if (index == null) {
          this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
          index = this.context.programs.length;
          child.index = index;
          child.name = 'program' + index;
          this.context.programs[index] = compiler.compile(child, options, this.context);
          this.context.environments[index] = child;
        } else {
          child.index = index;
          child.name = 'program' + index;
        }
      }
    },
    matchExistingProgram: function(child) {
      for (var i = 0, len = this.context.environments.length; i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return i;
        }
      }
    },

    programExpression: function(guid) {
      this.context.aliases.self = "this";

      if(guid == null) {
        return "self.noop";
      }

      var child = this.environment.children[guid],
          depths = child.depths.list, depth;

      var programParams = [child.index, child.name, "data"];

      for(var i=0, l = depths.length; i<l; i++) {
        depth = depths[i];

        if(depth === 1) { programParams.push("depth0"); }
        else { programParams.push("depth" + (depth - 1)); }
      }

      return (depths.length === 0 ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
    },

    register: function(name, val) {
      this.useRegister(name);
      this.pushSource(name + " = " + val + ";");
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      return this.push(new Literal(item));
    },

    pushSource: function(source) {
      if (this.pendingContent) {
        this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
        this.pendingContent = undefined;
      }

      if (source) {
        this.source.push(source);
      }
    },

    pushStack: function(item) {
      this.flushInline();

      var stack = this.incrStack();
      if (item) {
        this.pushSource(stack + " = " + item + ";");
      }
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var prefix = '',
          inline = this.isInline(),
          stack;

      // If we are currently inline then we want to merge the inline statement into the
      // replacement statement via ','
      if (inline) {
        var top = this.popStack(true);

        if (top instanceof Literal) {
          // Literals do not need to be inlined
          stack = top.value;
        } else {
          // Get or create the current stack name for use by the inline
          var name = this.stackSlot ? this.topStackName() : this.incrStack();

          prefix = '(' + this.push(name) + ' = ' + top + '),';
          stack = this.topStack();
        }
      } else {
        stack = this.topStack();
      }

      var item = callback.call(this, stack);

      if (inline) {
        if (this.inlineStack.length || this.compileStack.length) {
          this.popStack();
        }
        this.push('(' + prefix + item + ')');
      } else {
        // Prevent modification of the context depth variable. Through replaceStack
        if (!/^stack/.test(stack)) {
          stack = this.nextStack();
        }

        this.pushSource(stack + " = (" + prefix + item + ");");
      }
      return stack;
    },

    nextStack: function() {
      return this.pushStack();
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return this.topStackName();
    },
    topStackName: function() {
      return "stack" + this.stackSlot;
    },
    flushInline: function() {
      var inlineStack = this.inlineStack;
      if (inlineStack.length) {
        this.inlineStack = [];
        for (var i = 0, len = inlineStack.length; i < len; i++) {
          var entry = inlineStack[i];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            this.pushStack(entry);
          }
        }
      }
    },
    isInline: function() {
      return this.inlineStack.length;
    },

    popStack: function(wrapped) {
      var inline = this.isInline(),
          item = (inline ? this.inlineStack : this.compileStack).pop();

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        if (!inline) {
          this.stackSlot--;
        }
        return item;
      }
    },

    topStack: function(wrapped) {
      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
          item = stack[stack.length - 1];

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        return item;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
        .replace(/\u2029/g, '\\u2029') + '"';
    },

    setupHelper: function(paramSize, name, missingParams) {
      var params = [];
      this.setupParams(paramSize, params, missingParams);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        name: foundHelper,
        callParams: ["depth0"].concat(params).join(", "),
        helperMissingParams: missingParams && ["depth0", this.quotedString(name)].concat(params).join(", ")
      };
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(paramSize, params, useRegister) {
      var options = [], contexts = [], types = [], param, inverse, program;

      options.push("hash:" + this.popStack());

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          this.context.aliases.self = "this";
          program = "self.noop";
        }

        if (!inverse) {
         this.context.aliases.self = "this";
          inverse = "self.noop";
        }

        options.push("inverse:" + inverse);
        options.push("fn:" + program);
      }

      for(var i=0; i<paramSize; i++) {
        param = this.popStack();
        params.push(param);

        if(this.options.stringParams) {
          types.push(this.popStack());
          contexts.push(this.popStack());
        }
      }

      if (this.options.stringParams) {
        options.push("contexts:[" + contexts.join(",") + "]");
        options.push("types:[" + types.join(",") + "]");
        options.push("hashContexts:hashContexts");
        options.push("hashTypes:hashTypes");
      }

      if(this.options.data) {
        options.push("data:data");
      }

      options = "{" + options.join(",") + "}";
      if (useRegister) {
        this.register('options', options);
        params.push('options');
      } else {
        params.push(options);
      }
      return params.join(", ");
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    if(!JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]+$/.test(name)) {
      return true;
    }
    return false;
  };

  __exports__ = JavaScriptCompiler;
  return __exports__;
})(__module2__);

// handlebars/compiler/compiler.js
var __module10__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;
  var parse = __dependency2__.parse;
  var JavaScriptCompiler = __dependency3__;
  var AST = __dependency4__;

  function Compiler() {}

  __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    disassemble: function() {
      var opcodes = this.opcodes, opcode, out = [], params, param;

      for (var i=0, l=opcodes.length; i<l; i++) {
        opcode = opcodes[i];

        if (opcode.opcode === 'DECLARE') {
          out.push("DECLARE " + opcode.name + "=" + opcode.value);
        } else {
          params = [];
          for (var j=0; j<opcode.args.length; j++) {
            param = opcode.args[j];
            if (typeof param === "string") {
              param = "\"" + param.replace("\n", "\\n") + "\"";
            }
            params.push(param);
          }
          out.push(opcode.opcode + " " + params.join(" "));
        }
      }

      return out.join("\n");
    },

    equals: function(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }

      for (var i = 0; i < len; i++) {
        var opcode = this.opcodes[i],
            otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) {
          return false;
        }
        for (var j = 0; j < opcode.args.length; j++) {
          if (opcode.args[j] !== otherOpcode.args[j]) {
            return false;
          }
        }
      }

      len = this.children.length;
      if (other.children.length !== len) {
        return false;
      }
      for (i = 0; i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }

      return true;
    },

    guid: 0,

    compile: function(program, options) {
      this.opcodes = [];
      this.children = [];
      this.depths = {list: []};
      this.options = options;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.accept(program);
    },

    accept: function(node) {
      var strip = node.strip || {},
          ret;
      if (strip.left) {
        this.opcode('strip');
      }

      ret = this[node.type](node);

      if (strip.right) {
        this.opcode('strip');
      }

      return ret;
    },

    program: function(program) {
      var statements = program.statements;

      for(var i=0, l=statements.length; i<l; i++) {
        this.accept(statements[i]);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var type = this.classifyMustache(mustache);

      if (type === "helper") {
        this.helperMustache(mustache, program, inverse);
      } else if (type === "simple") {
        this.simpleMustache(mustache);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('blockValue');
      } else {
        this.ambiguousMustache(mustache, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, pair, val;

      this.opcode('pushHash');

      for(var i=0, l=pairs.length; i<l; i++) {
        pair = pairs[i];
        val  = pair[1];

        if (this.options.stringParams) {
          if(val.depth) {
            this.addDepth(val.depth);
          }
          this.opcode('getContext', val.depth || 0);
          this.opcode('pushStringParam', val.stringModeValue, val.type);
        } else {
          this.accept(val);
        }

        this.opcode('assignToHash', pair[0]);
      }
      this.opcode('popHash');
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if(partial.context) {
        this.ID(partial.context);
      } else {
        this.opcode('push', 'depth0');
      }

      this.opcode('invokePartial', partialName.name);
      this.opcode('append');
    },

    content: function(content) {
      this.opcode('appendContent', content.string);
    },

    mustache: function(mustache) {
      var options = this.options;
      var type = this.classifyMustache(mustache);

      if (type === "simple") {
        this.simpleMustache(mustache);
      } else if (type === "helper") {
        this.helperMustache(mustache);
      } else {
        this.ambiguousMustache(mustache);
      }

      if(mustache.escaped && !options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousMustache: function(mustache, program, inverse) {
      var id = mustache.id,
          name = id.parts[0],
          isBlock = program != null || inverse != null;

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.opcode('invokeAmbiguous', name, isBlock);
    },

    simpleMustache: function(mustache) {
      var id = mustache.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperMustache: function(mustache, program, inverse) {
      var params = this.setupFullMustacheParams(mustache, program, inverse),
          name = mustache.id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new Error("You specified knownHelpersOnly, but used the unknown helper " + name);
      } else {
        this.opcode('invokeHelper', params.length, name);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts[0]);
      }

      for(var i=1, l=id.parts.length; i<l; i++) {
        this.opcode('lookup', id.parts[i]);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      if (data.id.isScoped || data.id.depth) {
        throw new Exception('Scoped data references are not supported: ' + data.original);
      }

      this.opcode('lookupData');
      var parts = data.id.parts;
      for(var i=0, l=parts.length; i<l; i++) {
        this.opcode('lookup', parts[i]);
      }
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    INTEGER: function(integer) {
      this.opcode('pushLiteral', integer.integer);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: [].slice.call(arguments, 1) });
    },

    declare: function(name, value) {
      this.opcodes.push({ opcode: 'DECLARE', name: name, value: value });
    },

    addDepth: function(depth) {
      if(isNaN(depth)) { throw new Error("EWOT"); }
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifyMustache: function(mustache) {
      var isHelper   = mustache.isHelper;
      var isEligible = mustache.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      if (isEligible && !isHelper) {
        var name = mustache.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      var i = params.length, param;

      while(i--) {
        param = params[i];

        if(this.options.stringParams) {
          if(param.depth) {
            this.addDepth(param.depth);
          }

          this.opcode('getContext', param.depth || 0);
          this.opcode('pushStringParam', param.stringModeValue, param.type);
        } else {
          this[param.type](param);
        }
      }
    },

    setupMustacheParams: function(mustache) {
      var params = mustache.params;
      this.pushParams(params);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('emptyHash');
      }

      return params;
    },

    // this will replace setupMustacheParams when we're done
    setupFullMustacheParams: function(mustache, program, inverse) {
      var params = mustache.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if(mustache.hash) {
        this.hash(mustache.hash);
      } else {
        this.opcode('emptyHash');
      }

      return params;
    }
  };

  function precompile(input, options) {
    if (input == null || (typeof input !== 'string' && input.constructor !== AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }

    var ast = parse(input);
    var environment = new Compiler().compile(ast, options);
    return new JavaScriptCompiler().compile(environment, options);
  }

  __exports__.precompile = precompile;function compile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};

    if (!('data' in options)) {
      options.data = true;
    }

    var compiled;

    function compileInput() {
      var ast = parse(input);
      var environment = new Compiler().compile(ast, options);
      var templateSpec = new JavaScriptCompiler().compile(environment, options, undefined, true);
      return env.template(templateSpec);
    }

    // Template is only compiled on first use and cached after that point.
    return function(context, options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, options);
    };
  }

  __exports__.compile = compile;
  return __exports__;
})(__module5__, __module8__, __module11__, __module7__);

// handlebars.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  var Handlebars = __dependency1__;

  // Compiler imports
  var AST = __dependency2__;
  var Parser = __dependency3__.parser;
  var parse = __dependency3__.parse;
  var Compiler = __dependency4__.Compiler;
  var compile = __dependency4__.compile;
  var precompile = __dependency4__.precompile;
  var JavaScriptCompiler = __dependency5__;

  var _create = Handlebars.create;
  var create = function() {
    var hb = _create();

    hb.compile = function(input, options) {
      return compile(input, options, hb);
    };
    hb.precompile = precompile;

    hb.AST = AST;
    hb.Compiler = Compiler;
    hb.JavaScriptCompiler = JavaScriptCompiler;
    hb.Parser = Parser;
    hb.parse = parse;

    return hb;
  };

  Handlebars = create();
  Handlebars.create = create;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module7__, __module8__, __module10__, __module11__);

  return __module0__;
})();

// https://github.com/ifandelse/TrafficCop
(function(a,b){var c={};a.trafficCop=function(b,d){var e=b,f;arguments.length===2&&(e=a.extend(!0,d,{url:b})),f=JSON.stringify(e);if(f in c)for(i in{success:1,error:1,complete:1})c[f][i](e[i]);else c[f]=a.ajax(e).always(function(){delete c[f]});return c[f]}})(jQuery)