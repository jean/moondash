(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var dependencies = [
  // Our submodules
  'md.common', 'md.config', 'md.layout', 'md.mockapi', 'md.notice',
  'md.auth', 'md.forms', 'md.nav', 'md.dispatch', 'md.resourcetypes',

  // External stuff
  'ngSanitize', 'ui.router', 'restangular', 'satellizer',
  'ui.bootstrap.modal', 'ui.bootstrap.collapse', 'schemaForm'];

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

// dist/moondash-vendors.js does NOT include ngMockE2E. Only add that
// dependency and md.mockapi if we have ngMockE2E.
if (angular.mock) {
  dependencies.push('ngMockE2E');
  dependencies.push('md.mockapi');
}

angular.module('moondash', dependencies);

// Require the Moondash components
require('./common');
require('./layout');
require('./configurator');
require('./mockapi');
require('./auth');
require('./notice');
require('./forms');
require('./nav');
require('./dispatch');
require('./resourcetypes');
require('./common');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./auth":10,"./common":18,"./configurator":20,"./dispatch":23,"./forms":31,"./layout":35,"./mockapi":43,"./nav":48,"./notice":54,"./resourcetypes":58}],2:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],7:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":5,"./encode":6}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":4,"querystring":7}],9:[function(require,module,exports){
function LoginCtrl($auth, $notice) {
  var _this = this;
  this.errorMessage = false;

  this.login = function ($valid, username, password) {
    $auth.login({username: username, password: password})
      .then(function () {
              _this.errorMessage = false;
              $notice.show('You have successfully logged in');
            })
      .catch(function (response) {
               _this.errorMessage = response.data.message;
             });
  }
}

function LogoutCtrl($auth, $notice) {
  $auth.logout()
    .then(function () {
            $notice.show('You have been logged out');
          });
}

function ProfileCtrl(profile) {
  this.profile = profile;
}

module.exports = {
  LoginCtrl: LoginCtrl,
  LogoutCtrl: LogoutCtrl,
  ProfileCtrl: ProfileCtrl
};

},{}],10:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.auth', [])
  .controller('LoginCtrl', require('./controllers').LoginCtrl)
  .controller('LogoutCtrl', require('./controllers').LogoutCtrl)
  .controller('ProfileCtrl', require('./controllers').ProfileCtrl)
  .factory('MdProfile', require('./services').Profile);

require('./states');
require('./controllers');
require('./services');
require('./interceptors');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":9,"./interceptors":11,"./services":12,"./states":13}],11:[function(require,module,exports){
function AuthzResponseRedirect($q, $injector) {

  return {
    responseError: function (rejection) {
      var
        $state = $injector.get('$state'),
        $notice = $injector.get('$notice');

      // We can get an /api/ response of forbidden for
      // some data needed in a view. Flash a notice saying that this
      // data was requested.
      var url = rejection.config.url;
      if (rejection.status == 403 || rejection.status == 401) {
        // Redirect to the login form
        $state.go('auth.login');
        var msg = 'Login required for data at: ' + url;
        $notice.show(msg);
      }
      return $q.reject(rejection);
    }
  };
}

function ModuleConfig($httpProvider, $authProvider) {
  $httpProvider.interceptors.push('authzRedirect');

  var baseUrl = '';

  // Satellizer setup
  $authProvider.loginUrl = baseUrl + '/api/auth/login';
}

function ModuleRun($rootScope, $state, $auth, $notice) {
  // A state can be annotated with a value indicating
  // the state requires login.

  $rootScope.$on(
    "$stateChangeStart",
    function (event, toState, toParams, fromState) {
      if (toState.authenticate && !$auth.isAuthenticated()) {
        // User isn’t authenticated and this state wants auth
        var t = toState.title || toState.name;
        var msg = 'The page ' + t + ' requires a login';
        $notice.show(msg)
        $state.transitionTo("auth.login");
        event.preventDefault();
      }
    });
}


angular.module('moondash')
  .factory('authzRedirect', AuthzResponseRedirect)
  .config(ModuleConfig)
  .run(ModuleRun);
},{}],12:[function(require,module,exports){
function Profile(Restangular) {
  return {
    getProfile: function () {
      return Restangular.one('/api/auth/me').get();
    }
  };
}

module.exports = {
  Profile: Profile
};

},{}],13:[function(require,module,exports){
function ModuleConfig($stateProvider) {
  $stateProvider
    .state('auth', {
             url: '/auth',
             parent: 'root'
           })
    .state('auth.login', {
             url: '/login',
             views: {
               'md-content@root': {
                 template: require('./templates/login.html'),
                 controller: 'LoginCtrl as ctrl'
               }
             }
           })
    .state('auth.logout', {
             url: '/logout',
             views: {
               'md-content@root': {
                 controller: 'LogoutCtrl as ctrl',
                 template: require('./templates/logout.html')
               }
             }
           })
    .state('auth.profile', {
             url: '/profile',
             //authenticate: true,
             views: {
               'md-content@root': {
                 template: require('./templates/profile.html'),
                 controller: 'ProfileCtrl as ctrl'
               }
             },
             resolve: {
               profile: function (MdProfile) {
                 return MdProfile.getProfile();
               }
             }
           });
}

angular.module('moondash')
  .config(ModuleConfig);
},{"./templates/login.html":14,"./templates/logout.html":15,"./templates/profile.html":16}],14:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-offset-3 col-md-4 text-center">\n    <div class="panel-body">\n      <h2 class="text-center">Local Login</h2>\n\n      <form method="post"\n\n            ng-init="username=\'admin\';password=\'1\'"\n\n            ng-submit="ctrl.login(loginForm.$valid, username, password)"\n            name="loginForm">\n        <div class="alert alert-danger" role="alert"\n            ng-if="ctrl.errorMessage"\n            ng-bind="ctrl.errorMessage">Error message</div>\n        <div class="form-group">\n          <input class="form-control input-lg" type="text" name="username"\n                 ng-model="username" placeholder="Username" required\n                 autofocus>\n        </div>\n\n        <div class="form-group has-feedback">\n          <input class="form-control input-lg" type="password"\n                 name="password" ng-model="password"\n                 placeholder="Password" required>\n        </div>\n\n        <button type="submit" ng-disabled="loginForm.$invalid"\n                class="btn btn-lg  btn-block btn-success">Log in\n        </button>\n\n      </form>\n    </div>\n  </div>\n</div>\n';
},{}],15:[function(require,module,exports){
module.exports = '<h1>Logged Out</h1>\n<p>You have been logged out.</p>';
},{}],16:[function(require,module,exports){
module.exports = '<div class="container">\n  <div class="row">\n    <div class="col-md-3">\n      <h2 class="text-center">Profile</h2>\n\n      <p ng-if="ctrl.profile">\n\n        <div>id: {{ ctrl.profile.id }}</div>\n        <div>twitter: {{ ctrl.profile.twitter }}</div>\n        <div>First Name: {{ ctrl.profile.first_name }}</div>\n        <div>Last Name: {{ ctrl.profile.last_name }}</div>\n        <div>Email: {{ ctrl.profile.email }}</div>\n      </p>\n\n    </div>\n  </div>\n</div>\n';
},{}],17:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function OrderObjectByFilter() {
  return function (items, field, reverse) {
    var filtered = [];
    _(items).forEach(function (item) {
      filtered.push(item);
    });
    function index(obj, i) {
      return obj[i];
    }

    filtered.sort(function (a, b) {
      var comparator;
      var reducedA = field.split('.').reduce(index, a);
      var reducedB = field.split('.').reduce(index, b);
      if (reducedA === reducedB) {
        comparator = 0;
      } else {
        comparator = (reducedA > reducedB ? 1 : -1);
      }
      return comparator;
    });
    if (reverse) {
      filtered.reverse();
    }
    return filtered;
  }
}

module.exports = {
  OrderObjectByFilter: OrderObjectByFilter
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],18:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.common', [])
  .filter('mdOrderObjectBy', require('./filters').OrderObjectByFilter);

// Jamming this on here. Patching String.prototype to add some
// utility functions that aren't in lodash (and I don't want to
// add 7Kb minified to get underscore.string.)

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str) {
    return this.substring(0, str.length) === str;
  }
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str) {
    return this.substring(this.length - str.length, this.length) === str;
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./filters":17}],19:[function(require,module,exports){
function InitCtrl(Restangular, MdConfig, MdNav, MdRTypes, MdSchemas, MdForms) {
    Restangular.one('full/siteconfig.json').get()
      .then(
      function (siteconfig) {

        // Set the site name
        MdConfig.site.name = siteconfig.site.name;

        // Add resource types and nav menus
        MdRTypes.init(siteconfig.resourcetypes);
        MdNav.init(siteconfig.navMenus);
        MdForms.init(siteconfig.forms);
        MdSchemas.init(siteconfig.schemas);
      },
      function (failure) {
        var msg = 'Failed to get siteconfig.json';
        $notice.show(msg);
      });
}

function Init () {
  return {
    restrict: 'A',
    template: '',
    scope: {
      url: '@mdInit'
    },
    controller: InitCtrl,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

angular.module('md.config')
  .directive('mdInit', Init);

},{}],20:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.config', []);

require('./services');
require('./directives');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":19,"./services":21}],21:[function(require,module,exports){
'use strict';

function MdConfig() {
  var _this = this;

  this.site = {name: 'Moondash'};

}

angular.module("moondash")
  .service('MdConfig', MdConfig);
},{}],22:[function(require,module,exports){
'use strict';

function DispatcherCtrl($state, resolvedPath, MdDispatcher) {

  /*

   resolvedPath will return a dictionary such as:

   {
   error: 'Some Error Condition'
   schema: 'Some Schema Identifier'
   data: {
   viewName: the name of the view,
   context: the context object,
   parents: the parents array,
   view: the dict returned by any custom view
   items: sequence of children if it is a folder
   ordering: if ordered folder, the ordering of the item ids
   }

   }

   */

  // First hande the case where resolvedPath says it couldn't
  // find anything.

  if (resolvedPath.error) {
    // This should be a not found
    $state.go('notfound');
    return;
  }

  var data = resolvedPath.data;
  MdDispatcher.context = data.context;
  MdDispatcher.viewName = data.viewName;
  MdDispatcher.parents = data.parents;

  // Get the next state. Look in all the registered states at
  // view_config information.
  var nextState = MdDispatcher.resolveState(
    MdDispatcher.context, MdDispatcher.viewName, MdDispatcher.parents);

  if (nextState) {
    $state.go(nextState);
  } else {
    // MdDispatcher failed to find a matching view
    $state.go('notfound');
  }

}

function NotFoundCtrl($location) {
  this.path = $location.path();
}

function ErrorCtrl($stateParams) {
  this.toState = $stateParams.toState;
  this.error = $stateParams.error;
}


module.exports = {
  NotFoundCtrl: NotFoundCtrl,
  ErrorCtrl: ErrorCtrl,
  DispatcherCtrl: DispatcherCtrl
};
},{}],23:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.dispatch', ['ui.router'])
  .controller('NotFoundCtrl', require('./controllers').NotFoundCtrl)
  .controller('ErrorCtrl', require('./controllers').ErrorCtrl)
  .controller('DispatcherCtrl', require('./controllers').DispatcherCtrl)
  .service('MdDispatcher', require('./services').Dispatcher);

require('./init');
require('./controllers');
require('./services');
require('./states');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":22,"./init":24,"./services":25,"./states":26}],24:[function(require,module,exports){
'use strict';

function ModuleConfig($urlRouterProvider) {
  $urlRouterProvider.otherwise(function ($injector) {
    // The URL failed to resolve. Let's give a try at traversal.
    var
      $state = $injector.get('$state'),
      MdDispatcher = $injector.get('MdDispatcher');


    // XXX TODO Can't do this on every request
    // Grab all the registered view_config info from the states. Make
    // a dict with a key of the view name, value all the view_config
    // info.
    MdDispatcher.makeViewMap($state.get());


    // If there are viewConfig settings on any states, use traversal
    // unless configuration wants it disabled.
    if (!MdDispatcher.disableDispatch) {
      $state.go('dispatch');
    } else {
      $state.go('notfound', {unfoundStateTo: 'dispatch'});
    }
  });
}

function ModuleRun($rootScope, $state, MdDispatcher) {
    // Put the MdDispatcher on the root scope so that it is available in
    // all templates.
    $rootScope.dispatcher = MdDispatcher;

    // Not Found. Tried to go to a state that doesn't exist.
    $rootScope
      .$on(
      '$stateNotFound',
      function (event, unfoundState, fromState, fromParams) {
        event.preventDefault();
        $state.go('notfound', {unfoundStateTo: unfoundState.to});
      });

    // Error handler. Display errors that occur in state resolves etc.
    $rootScope
      .$on(
      '$stateChangeError',
      function (event, toState, toParams, fromState, fromParams, error) {
        console.debug('stateChangeError', error);
        event.preventDefault();
        $state.go('error', {toState: toState.name, error: error});
      });
}


angular.module('md.dispatch')
  .config(ModuleConfig)
  .run(ModuleRun);
},{}],25:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function Dispatcher() {
  var _this = this;

  // At startup, take the list of states and make a viewMap. The
  // viewMap will look like:
  // default:
  //   [
  //      {resourceType: 'Folder', containment: something,
  //       stateName: 'folder-default'
  //      }
  //   ]
  // Meaning, it has the predicate information used in Pyramid
  // views. We key on viewName just to speed up the resolution.
  this.viewMap = {};
  this.resetViewMap = function () {
    // Reset viewMap
    _this.viewMap = {};
  };
  this.addStateToViewMap = function (state) {
    // Add a new state to viewMap (without best-match ordering)
    var vc = state.viewConfig;
    var viewName;
    var tmpElem;
    if (vc) {
      // This state has a viewConfig
      viewName = vc.name;
      tmpElem = {
        name: viewName,
        resourceType: vc.resourceType,
        stateName: state.name,
        containment: vc.containment,
        pathInfo: vc.pathInfo,
        marker: vc.marker
      };

      // If the viewMap doesn't yet have this
      // viewName, add it with an empty seq
      if (!_this.viewMap[viewName]) {
        _this.viewMap[viewName] = [tmpElem];
      }
      else {
        _this.viewMap[viewName].push(tmpElem);
      }
    }
  };
  this.updateTraversal = function () {
    // Update _this.disableDispatch property if _this.viewMap is empty
    _this.disableDispatch = _.isEmpty(_this.viewMap);
  };
  this.orderViewMap = function () {
    // Post processing of viewMap with best match order
    _(_this.viewMap)
      .forEach(function (value, key) {
                 _this.viewMap[key] = _(_this.viewMap[key])
                   .chain()
                   .sortBy(function (item) {
                             return item.marker;
                           })
                   .sortBy(function (item) {
                             return item.resourceType;
                           })
                   .sortBy(function (item) {
                             return item.containment;
                           })
                   .sortBy(function (item) {
                             return item.pathInfo;
                           })
                   .sortBy(function (item) {
                             return item.marker;
                           })
                   .value();
               });
  };
  this.makeViewMap = function (states) {
    // reset view map
    _this.resetViewMap();

    // add (only viewConfig based) states to viewMap
    _(states)
      .filter(function (state) {
                return _.has(state, "viewConfig");
              })
      .forEach(_this.addStateToViewMap);

    // Post processing of viewMap with best match order
    _this.orderViewMap();

    // Update _this.disableDispatch property if _this.viewMap is empty
    _this.updateTraversal();
  };

  this.resolveState = function (context, viewName, parents) {
    // Based on request info, find the matching view in the view
    // map based on priority.
    var views, parentTypes, matchingView, i, view, parentMarkers, viewConfigMarker;

    // Get the view matching this resolved viewName from the viewMap
    views = _this.viewMap[viewName];

    if (views) {
      // Get some of the data needed by the predicates
      parentsChain = _(parents)
        .chain()
        .map(function (p) {
               return [p.resourceType, p.markers];
             })
        .zip()
        .value();
      parentTypes = _.uniq(parentsChain[0]);
      parentMarkers = _.uniq(_.flatten(parentsChain[1]));
      markers = context.markers;
      pathInfo = context.path;

      // Go through all the views, assigning a score
      matchingView = null;
      for (i = 0; i < views.length; i++) {
        viewConfig = views[i];
        viewConfigMarker = viewConfig.marker;

        if (viewConfig.resourceType) {
          if (viewConfig.resourceType !== context.resourceType) {
            continue;
          }
        }
        if (viewConfig.containment) {
          if (!_.contains(parentTypes, viewConfig.containment)) {
            continue;
          }
        }
        if (viewConfig.marker) {
          if (!_.contains(markers, viewConfigMarker)) {
            if (!_.contains(parentMarkers, viewConfigMarker)) {
              continue;
            }
          }
        }
        if (viewConfig.pathInfo) {
          if (!_.contains(pathInfo, viewConfig.pathInfo)) {
            continue;
          }
        }

        return viewConfig.stateName;

      }
    }
    else {
      return undefined;
    }
  };
}

module.exports = {
  Dispatcher: Dispatcher
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],26:[function(require,module,exports){
'use strict';

function ModuleConfig($stateProvider) {

  $stateProvider
    .state('notfound', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: require('./templates/notfound.html'),
                 controller: 'NotFoundCtrl as ctrl'

               }
             },
             params: {unfoundStateTo: ''}
           })
    .state('error', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: require('./templates/error.html'),
                 controller: 'ErrorCtrl as ctrl'
               }
             },
             params: {
               toState: '',
               error: ''
             }
           })
    .state('dispatch', {
             parent: 'root',
             views: {
               'md-content@root': {
                 template: '',
                 controller: 'DispatcherCtrl as DispatcherCtrl',
                 resolve: {
                   resolvedPath: function ($location, $http) {
                     var path = $location.path();
                     // Guard against going to index.html without the
                     // #. This leads to a path that is an empty string.
                     if (path === '') {
                       $location.path('/');
                     }
                     return $http.get(path)
                       .then(
                       function (success) {
                         return success.data;
                       });
                   }

                 }
               }
             }
           });
}

angular.module('md.dispatch')
  .config(ModuleConfig);
},{"./templates/error.html":27,"./templates/notfound.html":28}],27:[function(require,module,exports){
module.exports = '<div>\n  <h1>Error</h1>\n\n  <p>Error when procesing state <code>{{ctrl.toState}}</code>:</p>\n  <pre>\n{{ctrl.error}}\n  </pre>\n  \n</div>';
},{}],28:[function(require,module,exports){
module.exports = '<div>\n  <h1>Not Found</h1>\n\n  <p>The requested URL <code>{{ctrl.path}}</code> could\n    not be found.</p>\n</div>';
},{}],29:[function(require,module,exports){
'use strict';

function FormController(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}

module.exports = {
  FormController: FormController
};
},{}],30:[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function Form() {
  return {
    restrict: 'E',
    template: require('./templates/form.html'),
    scope: {
      mdModel: '=mdModel',
      mdSchema: '@mdSchema',
      mdForm: '@mdForm'
    },
    controller: controllers.FormController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}

module.exports = {
  FormDirective: Form
};
},{"./controllers":29,"./templates/form.html":33}],31:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.forms', ['ui.router', 'restangular'])
  .service('MdSchemas', require('./services').SchemasService)
  .service('MdForms', require('./services').FormsService)
  .directive('mdForm', require('./directives').FormDirective);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":30,"./services":32}],32:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function SchemasService() {
  var _this = this;
  this.schemas = {};

  this.get = function (schemaId) {
    return this.schemas[schemaId];
  };

  this.init = function (schemas) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "schemas" part of the JSON.

    _(schemas).forEach(
      function (schema, id) {
        _this.schemas[id] = schema;
      }
    );

  }

}

function FormsService() {
  var _this = this;
  this.forms = {};

  this.get = function (formId) {
    return _this.forms[formId];
  };

  this.init = function (forms) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "forms" part of the JSON.

    _(forms).forEach(
      function (form, id) {
        _this.forms[id] = form;
      }
    );

  }
}

module.exports = {
  SchemasService: SchemasService,
  FormsService: FormsService
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],33:[function(require,module,exports){
module.exports = '<form\n    sf-schema="ctrl.schema"\n    sf-form="ctrl.form"\n    sf-model="ctrl.model"></form>\n';
},{}],34:[function(require,module,exports){
'use strict';

function LayoutController($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

function HeaderController(MdConfig, $auth) {
  this.$auth = $auth;
  this.siteName = MdConfig.site.name;
}

function FooterController(MdConfig) {
  this.siteName = MdConfig.site.name;
}

function NavController() {
}

module.exports = {
  LayoutController: LayoutController,
  HeaderController: HeaderController,
  FooterController: FooterController,
  NavController: NavController
};
},{}],35:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.layout', ['ui.router'])
  .service('MdLayout', require('./services').LayoutService)
  .config(require('./states').Config)
  .run(require('./services').Run);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./services":36,"./states":37}],36:[function(require,module,exports){
'use strict';

function LayoutService($rootScope, MdConfig) {
  var _this, siteName;
  _this = this;
  siteName = MdConfig.site.name;
  this.pageTitle = siteName;

  // Whenever the state changes, update the pageTitle
  function changeTitle(evt, toState) {
    if (toState.title) {
      // Sure would like to automatically put in resource.title but
      // unfortunately ui-router doesn't give me access to the resolve
      // from this event.
      _this.pageTitle = siteName + ' - ' + toState.title;
    } else {
      // Reset to default
      _this.pageTitle = siteName;
    }
  }

  // TODO Expose so unit tests can reach it. Try to change
  // changeTitle below to use this.changeTitle and write a
  // midway test for $on
  this.changeTitle = changeTitle;

  $rootScope.$on('$stateChangeSuccess', changeTitle);
}

function ModuleRun($rootScope, MdLayout) {
  $rootScope.layout = MdLayout;
}

module.exports = {
 LayoutService: LayoutService,
 Run: ModuleRun
};

},{}],37:[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('layout', {
             abstract: true,
             template: require('./templates/md-layout.html'),
             controller: controllers.LayoutController,
             controllerAs: 'ctrl'
           })
    .state('root', {
             parent: 'layout',
             views: {
               'md-header': {
                 template: require('./templates/md-header.html'),
                 controller: controllers.HeaderController,
                 controllerAs: 'ctrl'
               },
               'md-nav': {
                 template: require('./templates/md-nav.html'),
                 controller: controllers.NavController,
                 controllerAs: 'ctrl'
               },
               'md-content': {
                 template: '<div ui-view="md-content"></div>'
               },
               'md-footer': {
                 template: require('./templates/md-footer.html'),
                 controller: controllers.FooterController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};

},{"./controllers":34,"./templates/md-footer.html":38,"./templates/md-header.html":39,"./templates/md-layout.html":40,"./templates/md-nav.html":41}],38:[function(require,module,exports){
module.exports = '<div>\n  Welcome to <span ng-bind="ctrl.siteName">Moondash</span>.\n</div>';
},{}],39:[function(require,module,exports){
module.exports = '<div class="container" role="navigation">\n  <div class="navbar navbar-inverse navbar-fixed-top"\n       role="navigation">\n    <div class="navbar-header">\n      <a class="navbar-brand"\n         href="#/"\n         ng-bind="ctrl.siteName">Site Name</a>\n    </div>\n    \n        <ul ng-if="!ctrl.$auth.isAuthenticated()"\n        class="nav navbar-nav pull-right">\n      <li ui-sref-active="active">\n        <a ui-sref="auth.login">Login</a></li>\n    </ul>\n    <ul ng-if="ctrl.$auth.isAuthenticated()"\n        class="nav navbar-nav pull-right">\n      <li ui-sref-active="active">\n        <a ui-sref="auth.profile">Profile</a>\n      </li>\n      <li><a ui-sref="auth.logout">Logout</a></li>\n    </ul>\n\n  </div>\n</div>\n';
},{}],40:[function(require,module,exports){
module.exports = '<div id="md-header" ui-view="md-header"></div>\n<div id="md-main">\n  <div class="row">\n    <div id="md-nav" class="col-sm-4 col-md-3"\n         ui-view="md-nav"></div>\n    <div id="md-content" class="col-sm-8 col-md-9"\n         ui-view="md-content"></div>\n  </div>\n</div>\n<div id="md-footer" ui-view="md-footer"></div>\n<script type="text/ng-template" id="template/modal/backdrop.html">\n  <div class="modal-backdrop fade {{ backdropClass }}"\n       ng-class="{in: animate}"\n       ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n      ></div>\n</script>\n<script type="text/ng-template" id="template/modal/window.html">\n  <div tabindex="-1" role="dialog" class="modal fade"\n       ng-class="{in: animate}"\n       ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}"\n       ng-click="close($event)">\n    <div class="modal-dialog"\n         ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}">\n      <div class="modal-content" modal-transclude></div>\n    </div>\n  </div>\n</script>';
},{}],41:[function(require,module,exports){
module.exports = '<md-navpanel></md-navpanel>';
},{}],42:[function(require,module,exports){
/*

 Standard HTTP exceptions that can be thrown in mock implementations
 and have the correct status code returned.

 */

// Custom exceptions that can be used by mocks, stored later on
// the service
function HTTPNotFound(message) {
  this.name = 'HTTPNotFound';
  this.statusCode = 404;
  this.message = message || 'Not Found';
}
function HTTPUnauthorized(message) {
  this.name = 'HTTPUnauthorized';
  this.statusCode = 401;
  this.message = message || 'Login Required';
}
function HTTPNoContent() {
  this.name = 'HTTPNoContent';
  this.statusCode = 204;
}

module.exports = {
  HTTPNotFound: HTTPNotFound,
  HTTPUnauthorized: HTTPUnauthorized,
  HTTPNoContent: HTTPNoContent
};
},{}],43:[function(require,module,exports){
'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

angular.module('md.mockapi', [])
  .provider('MdMockRest', require('./providers').MockRest)
  .run(require('./providers').Run);
},{"./providers":45}],44:[function(require,module,exports){
(function (global){
/*

 Base class to quickly build up a mock REST API for a resource type:

 - Collections and documents
 - Standard operations with default (but overridable) implementations
 - Extensible, custom operations

 */

'use strict';

var
  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  path = require('path'),
  exceptions = require('./exceptions');

function makePatternRegExp(prefix, id, suffix) {
  if (suffix == null) suffix = '';
  var p = path.join(prefix, id, suffix);
  p = p.replace(/\//g, '\\/');
  return new RegExp(p);
}


function MockResourceType(prefix, id, items) {
  // A prototype/class that can generate the mocks for all the
  // actions on a type, with default methods that can be overriden as
  // well as custom actions with methods to extend the REST API.

  this.prefix = path.join('/', prefix); // e.g. /api/resourcetypes
  this.id = id;                         // e.g. invoices (plural)
  this.items = items ? items : {};

  this.getId = function (pathname) {
    // Helper function to analyze /prefix/resourcetype/id/maybeMore
    // and return just the id part

    var basePos = path.join(this.prefix, this.id).split('/').length;
    return pathname.trim().split('/')[basePos];

  };

  this.getDocument = function (pathname) {
    // Given a pathname from the request, find and return the
    // correct document. Throw a HTTPNotFound if no match

    var resourceId = this.getId(pathname);

    var document = this.items[resourceId];
    if (document == null) {
      var msg = 'No document at: ' + pathname;
      throw new exceptions.HTTPNotFound(msg)
    }

    return document;
  };

  this.collectionLIST = function (request) {
    // Return the items in this collection as a mapping
    // TODO implement pagination, filtering, etc.

    // Flatten this list
    return _(this.items).values().value();
  };

  this.collectionREAD = function (request) {
    // Only provide the properties of this collection, not items

    // Let's do some assertions and throw errors to make writing
    // mocks more reliable and thus productive

    var clone = _(this).clone();
    delete clone.items;

    return clone;
  };

  this.collectionUPDATE = function (request) {
    // Handle a PATCH

    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           this);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.collectionREPLACE = function (request) {
    // Handle a PUT

    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           this);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.documentREAD = function (request) {
    // Handle a GET to a leaf

    return this.getDocument(request.pathname);
  };

  this.documentDELETE = function (request) {
    // Handle a DELETE to a leaf

    var resourceId = this.getId(request.pathname);
    delete this.items[resourceId];

    return null;
  };


  this.documentUPDATE = function (request) {
    // Handle a PATCH to a leaf

    var document = this.getDocument(request.pathname);
    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           document);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.documentREPLACE = function (request) {
    // Handle a PUT to a leaf

    var document = this.getDocument(request.pathname);
    // For each key/value in the request.json_body, update
    _(request.json_body)
      .map(function (value, key) {
             this[key] = value;
           },
           document);

    // TODO If null is returned, we should throw exceptions.HTTPNoContent
    // However, since later we will obey HATEOAS/JSON-LD and return
    // a 200 with links to the "next" view, going with the simplest.
    return null;
  };

  this.listMocks = function () {
    // Get a list of MdMockRest-compatible registrations

    var
      mocks = [],
      prefix = this.prefix,
      id = this.id;

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id, '/items'),
                 responder: this.collectionLIST
               });

    mocks.push({
                 mockInstance: this,
                 method: 'DELETE',
                 pattern: makePatternRegExp(prefix, id + '/*'),
                 responder: this.documentDELETE
               });

    mocks.push({
                 mockInstance: this,
                 method: 'GET',
                 pattern: makePatternRegExp(prefix, id + '/*'),
                 responder: this.documentREAD
               });

    //mocks.push({
    //             mockInstance: this,
    //             method: 'GET',
    //             pattern: makePatternRegExp(prefix, id),
    //             responder: this.collectionREAD
    //           });

    return mocks;
  };

}

module.exports = {
  makePatternRegExp: makePatternRegExp,
  MockResourceType: MockResourceType
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./exceptions":42,"path":2}],45:[function(require,module,exports){
(function (global){
'use strict';

var
  _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  url = require('url'),
  MockResourceType = require('./mock_resource_type').MockResourceType,
  exceptions = require('./exceptions');


function Dispatcher(mock, method, thisUrl, data, headers) {
  // Called by $httpBackend whenever this mock's pattern is matched.

  var responder, responseData, request;

  // If the mock says to authenticate and we don't have
  // an Authorization header, return 401.
  if (mock.authenticate) {
    var authz = headers['Authorization'];
    if (!authz) {
      return [401, {'message': 'Login required'}];
    }
  }

  responder = mock.responder;
  responseData = mock.responseData;

  // A generic responder for handling the case where the
  // mock just wanted the basics and supplied responseData
  var resultCode = 200,
    resultData;
  if (responseData) {
    return [200, responseData];
  }

  // Package up request information into a convenient data,
  // call the responder, and return the response.
  request = url.parse(thisUrl, true);
  request.url = thisUrl;
  request.method = method;
  request.headers = headers;
  request.data = data;
  if (data) request.json_body = JSON.parse(data);

  // Run the responder. If it generates an exception, handle
  // it with the appropriate status code.
  try {
    resultCode = 200;
    if (mock.mockInstance) {
      // Supply a "this" to the mock function
      resultData = responder.call(mock.mockInstance, request);
    } else {
      resultData = responder(request);
    }
  } catch (e) {
    if (e instanceof exceptions.HTTPNotFound) {
      resultCode = e.statusCode;
      resultData = {message: e.message};
    } else if (e instanceof exceptions.HTTPUnauthorized) {
      resultCode = e.statusCode;
      resultData = {message: e.message};
    } else if (e instanceof exceptions.HTTPNoContent) {
      resultCode = e.statusCode;
      resultData = null;
    }
  }

  return [resultCode, resultData];
}

function MockRest() {
  var _this = this;
  this.mocks = [];
  this.MockResourceType = MockResourceType;
  this.exceptions = exceptions;

  this.$get = function () {
    var mocks = this.mocks;
    return {
      registerMocks: registerMocks
    };
  };

  this.addMocks = function (mocks) {
    this.mocks = this.mocks.concat(mocks);
  };

  function registerMocks($httpBackend) {
    // Iterate over all the registered mocks and register them
    _(_this.mocks).forEach(function (mock) {

      // To register with $httpBackend's matchers, we need two things
      // from the mock: the method and the URL pattern.
      var method = mock.method || 'GET',
        pattern = mock.pattern;

      var wrappedResponder = function (method, url, data, headers) {
        return Dispatcher(mock, method, url, data, headers);
      };

      $httpBackend.when(method, pattern)
        .respond(wrappedResponder);
    });
  }

}


function ModuleRun($httpBackend, MdMockRest) {
  MdMockRest.registerMocks($httpBackend);

  // pass through everything else
  $httpBackend.whenGET(/\/*/).passThrough();
  $httpBackend.whenPOST(/\/*/).passThrough();
  $httpBackend.whenPUT(/\/*/).passThrough();
  $httpBackend.whenPATCH(/\/*/).passThrough();

}


module.exports = {
  MockRest: MockRest,
  Run: ModuleRun,
  Dispatcher: Dispatcher
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./exceptions":42,"./mock_resource_type":44,"url":8}],46:[function(require,module,exports){
'use strict';

function NavPanelController(MdNav) {
  this.menus = MdNav.menus;
}

function NavMenuController() {
  this.sref = function (menuitem) {
    // Generating the ui-sref has some logic. Let's do it here instead
    // of inline.
    var uiSref = menuitem.state;
    if (menuitem.params) {
      uiSref = uiSref + '({' + menuitem.params + '})';
    }
    return uiSref;
  }
}

function NavSubmenuController() {
  this.isCollapsed = true;
}

module.exports = {
  NavPanelController: NavPanelController,
  NavMenuController: NavMenuController,
  NavSubmenuController: NavSubmenuController
};
},{}],47:[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function NavPanel() {
  return {
    restrict: 'E',
    template: require('./templates/navpanel.html'),
    scope: {},
    controller: controllers.NavPanelController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}


function NavMenu() {
  return {
    restrict: 'E',
    template: require('./templates/navmenu.html'),
    scope: {
      menuitem: '=ngModel'
    },
    controller: controllers.NavMenuController,
    controllerAs: 'ctrl',
    bindToController: true
  };
}


function NavSubmenu() {
  return {
    restrict: 'E',
    template: require('./templates/submenu.html'),
    require: '^ngModel',
    scope: {
      menuitem: '=ngModel'
    },
    controller: controllers.NavSubmenuController,
    controllerAs: 'ctrl',
    bindToController: true
  }
}

module.exports = {
  NavMenu: NavMenu,
  NavSubmenu: NavSubmenu,
  NavPanel: NavPanel
};

},{"./controllers":46,"./templates/navmenu.html":50,"./templates/navpanel.html":51,"./templates/submenu.html":52}],48:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.nav', [])
  .service('MdNav', require('./services').NavService)
  .directive('mdNavmenu', require('./directives').NavMenu)
  .directive('mdNavsubmenu', require('./directives').NavSubmenu)
  .directive('mdNavpanel', require('./directives').NavPanel);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":47,"./services":49}],49:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function NavMenu(id, label, priority) {
  /* Prototype class that manages a nav menu */

  var _this = this;
  this.id = id;
  this.label = label;
  this.priority = priority ? priority : 99;
  this.items = {};

  this.addMenuItem = function (menuItem) {
    var newMenuItem = new NavMenuItem(menuItem);
    _this.items[menuItem.id] = newMenuItem;

    return newMenuItem;
  }
}

function NavMenuItem(menuItem) {
  var _this = this;
  this.id = menuItem.id;
  this.label = menuItem.label;
  this.priority = menuItem.priority ? menuItem.priority : 99;
  this.state = menuItem.state;
  this.params = menuItem.params;
  this.items = menuItem.items;

  // A NavMenuItem can have a submenu
  this.addMenuItem = function (menuItem) {
    var newSubMenuItem = new NavMenuItem(menuItem);
    if (!this.items) {
      this.items = {};
    }
    this.items[menuItem.id] = newSubMenuItem;

    return newSubMenuItem;
  }
}

function NavService() {

  var _this = this;
  // By default, we have a built-in "root" menu

  var rootMenu = new NavMenu('root', false, -1);
  this.menus = {
    root: rootMenu
  };

  // Handle top-level menus, aka menu groups
  this.addMenu = function (id, label, priority) {

    var nm = new NavMenu(id, label, priority);
    _this.menus[id] = nm;

    return nm;
  };

  this.init = function (menus) {
    // Given the "navMenus" key in siteconfig.json, wire things up

    // Pluck out the items.root, if it exists, and add any entries to
    // the centrally-defined "root" menu.
    if (menus.root) {
      _(menus.root).forEach(function (menuItem) {
        rootMenu.addMenuItem(menuItem);
      });
      delete menus.root;
    }

    // Top-level menus
    _(menus).forEach(
      function (menu) {

        // Does this menu already exist?
        var newMenu = _this.menus[menu.id];
        if (!newMenu) {
          // Make the new menu
          newMenu = _this.addMenu(menu.id, menu.label, menu.priority);
        }

        // Now next level menus
        _(menu.items).forEach(function (menuItem) {
          newMenu.addMenuItem(menuItem);

        });

      }
    );

  }

}

module.exports = {
  NavService: NavService,
  NavMenu: NavMenu,
  NavMenuItem: NavMenuItem
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],50:[function(require,module,exports){
module.exports = '<div>\n  <h5 class="text-muted"\n      ng-if="ctrl.menuitem.label"\n      ng-bind="ctrl.menuitem.label">Menu Title</h5>\n  <ul class="list-group">\n    <li class="list-group-item"\n        ng-repeat="(id, menuitem) in ctrl.menuitem.items | mdOrderObjectBy: \'priority\'">\n      <a\n          ng-if="!menuitem.items"\n          ng-bind="menuitem.label"\n          ui-sref="{{ ctrl.sref(menuitem) }}">\n        Menu Item </a>\n      <md-navsubmenu ng-model="menuitem"\n                     ng-if="menuitem.items"></md-navsubmenu>\n    </li>\n  </ul>\n</div>';
},{}],51:[function(require,module,exports){
module.exports = '<div ng-repeat="(id, menu) in ctrl.menus | mdOrderObjectBy: \'priority\'">\n  <md-navmenu id="md-navmenu-{{id}}" ng-model="menu"></md-navmenu>\n</div>';
},{}],52:[function(require,module,exports){
module.exports = '<button\n    class="btn btn-xs btn-default pull-right"\n    ng-click="ctrl.isCollapsed = !ctrl.isCollapsed"\n    >\n  <span class="glyphicon glyphicon-chevron-left"\n        ng-if="ctrl.isCollapsed"></span>\n  <span class="glyphicon glyphicon-chevron-down"\n        ng-if="!ctrl.isCollapsed"></span>\n</button>\n<span class="list-group-item-heading"\n      ng-bind="ctrl.menuitem.label">Navmenu Heading</span>\n<div class="list-group" collapse="ctrl.isCollapsed"\n     style="margin-top: 1em; margin-bottom: 0">\n  <a class="list-group-item"\n     ng-repeat="(id, menuitem) in ctrl.menuitem.items | mdOrderObjectBy: \'priority\'"\n     ui-sref="{{ menuitem.state }}"\n     ng-bind="menuitem.label">\n    Navmenu Label\n  </a>\n</div>\n';
},{}],53:[function(require,module,exports){
function NoticeController($scope, $modalInstance, $timeout, message) {
  this.message = message;
  var seconds = 3;
  var timer = $timeout(
    function () {
      $modalInstance.dismiss();
    }, seconds * 1000
  );
  $scope.$on(
    'destroy',
    function () {
      $timeout.cancel(timer);
    });
}

module.exports = {
  NoticeController: NoticeController
};

},{}],54:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.notice', ['ui.bootstrap.modal'])
  .controller('NoticeController', require('./controllers').NoticeController)
  .service('$notice', require('./services').NoticeService);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":53,"./services":55}],55:[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function NoticeService($modal) {
  this.show = function (message) {
    var modalInstance = $modal.open(
      {
        template: require('./templates/notice.html'),
        controller: controllers.NoticeController,
        controllerAs: 'ctrl',
        size: 'sm',
        resolve: {
          message: function () {
            return message;
          }
        }
      });

    modalInstance.result.then(function () {

    });

  }
}

module.exports = {
  NoticeService: NoticeService
};

},{"./controllers":53,"./templates/notice.html":56}],56:[function(require,module,exports){
module.exports = '<div class="modal-body" ng-bind="ctrl.message">\n  The message\n</div>\n';
},{}],57:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function ManageController(resourceTypes) {
  this.flag = 9;
  this.resourceTypes = resourceTypes;
}

function ListController($stateParams, items) {
  var _this = this;
  this.resourcetype = $stateParams.resourcetype;
  this.items = items;

  this.deleteResource = function (resourceId) {
    var resource = _(items).find({id: resourceId});
    resource.remove()
      .then(function () {
              _(_this.items).remove({id: resourceId});
            });
  }
}

function ResourceReadController(resource) {
  this.resource = resource.plain();
  this.pairs = _.pairs(resource.plain());
}

function ResourceEditController(resource) {
  this.item = resource;
  this.schemaId = 'schema1';
  this.formId = 'form1';
}

module.exports = {
  ManageController: ManageController,
  ListController: ListController,
  ResourceReadController: ResourceReadController,
  ResourceEditController: ResourceEditController
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],58:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.resourcetypes', ['md.forms', 'ui.router'])
  .service('MdRTypes', require('./services').RTypesService)
  .config(require('./states').Config);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./services":59,"./states":60}],59:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null),
  path = require('path');

function LocalRestangular(Restangular, baseUrl) {
  return Restangular.withConfig(function (RestangularConfigurer) {
    RestangularConfigurer.setBaseUrl(baseUrl);
  });
}

function RTypesService(MdNav, Restangular) {
  var _this = this;

  // Set the base REST prefix for this site's resourcetypes entry point
  this.urlPrefix = 'api/resourcetypes';

  // Initialize the navmenu
  var menu = MdNav.addMenu('resourcetypes', 'Resource Types', 2);
  menu.addMenuItem({
                     id: 'manage',
                     label: 'Manage',
                     state: 'resourcetypes.manage',
                     priority: 99
                   });

  this.items = {};

  this.init = function (config) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "resourcetypes" part of the JSON.

    // Extract relevant stuff from config, perhaps validating
    //this.urlPrefix = config.urlPrefix;
    var items = config.items;

    _(items).forEach(
      function (resourcetype) {
        menu.addMenuItem(
          {
            id: resourcetype.id,
            label: resourcetype.label,
            state: 'resourcetype.list',
            params: 'resourcetype: "' + resourcetype.id + '"',
            priority: 5
          }
        );
      }
    );

  }
}

module.exports = {
  RTypesService: RTypesService,
  LocalRestangular: LocalRestangular
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"path":2}],60:[function(require,module,exports){
'use strict';

var controllers = require('./controllers'),
  LocalRestangular = require('./services').LocalRestangular;

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('resourcetypes', {
             parent: 'root',
             url: '/resourcetypes',
             resolve: {
               baseResourceTypes: function (Restangular) {
                 return Restangular.all('api/resourcetypes');
               }
             }
           })

    // Custom action
    .state('resourcetypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 template: require('./templates/resourcetypes-manage.html'),
                 controller: controllers.ManageController,
                 controllerAs: 'ctrl',
                 resolve: {
                   resourceTypes: function (baseResourceTypes) {
                     return baseResourceTypes.all('items').getList();
                   }
                 }
               }
             }
           })

    // A resource type, e.g. /api/resourcetypes/invoices
    .state('resourcetype', {
             parent: 'resourcetypes',
             url: '/{resourcetype}',
             resolve: {
               baseResourceType: function ($stateParams, baseResourceTypes) {
                 var resourceType = $stateParams.resourcetype;
                 return baseResourceTypes.all(resourceType);
               }
             }
           })

    // LIST action of resources of a resource type
    .state('resourcetype.list', {
             url: '/list',
             title: 'List Resources',
             views: {
               'md-content@root': {
                 template: require('./templates/resourcetypes-list.html'),
                 controller: controllers.ListController,
                 controllerAs: 'ctrl',
                 resolve: {
                   items: function ($stateParams, baseResourceType) {
                     var id = $stateParams.id;
                     return baseResourceType.all('items').getList();
                   }
                 }
               }
             }
           })

    // READ a resource
    .state('resource', {
             url: '/{id}',
             parent: 'resourcetype',
             views: {
               'md-content@root': {
                 template: require('./templates/resource-read.html'),
                 controller: controllers.ResourceReadController,
                 controllerAs: 'ctrl'
               }
             },
             resolve: {
               resource: function ($stateParams, baseResourceType) {
                 var id = $stateParams.id;
                 return baseResourceType.one(id).get();
               }
             }
           })

    // The "replace" (PUT) action
    .state('resource.replace', {
             url: '/replace',
             title: 'Edit Resource',
             views: {
               'md-content@root': {
                 template: require('./templates/resource-replace.html'),
                 controller: controllers.ResourceEditController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};

},{"./controllers":57,"./services":59,"./templates/resource-read.html":61,"./templates/resource-replace.html":62,"./templates/resourcetypes-list.html":63,"./templates/resourcetypes-manage.html":64}],61:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-8">\n    <h1>View {{ctrl.item.title}}</h1>\n  <table class="table table-striped">\n    <thead>\n    <tr>\n      <th>Property</th>\n      <th>Value</th>\n    </tr>\n    </thead>\n    <tbody>\n    <tr ng-repeat="pair in ctrl.pairs">\n      <td width="20%" ng-bind="pair[0]"></td>\n      <td width="20%" ng-bind="pair[1]"></td>\n    </tr>\n    </tbody>\n  </table>  </div>\n</div>';
},{}],62:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-8">\n    <h1>Edit {{ctrl.item.title}}</h1>\n    <md-form md-model="ctrl.item"\n             md-schema="{{ctrl.schemaId}}"\n             md-form="{{ctrl.formId}}"></md-form>\n  </div>\n</div>';
},{}],63:[function(require,module,exports){
module.exports = '<div>\n  <a class="pull-right btn btn-primary"\n     ui-sref="resourcetype.create({resourcetype: ctrl.resourcetype})">\n    <i class="glyphicon glyphicon-plus"></i>\n  </a>\n\n  <h1>List <code>{{ ctrl.resourcetype }}</code></h1>\n  <table class="table table-striped">\n    <thead>\n    <tr>\n      <th>ID</th>\n      <th>Title</th>\n      <th>Action</th>\n    </tr>\n    </thead>\n    <tbody>\n    <tr ng-repeat="item in ctrl.items">\n      <td width="20%">\n        <a title="View"\n           ui-sref="resource({resourcetype: ctrl.resourcetype, id: item.id})"\n           ng-bind="item.id">\n          id\n        </a>\n\n      </td>\n      <td ng-bind="item.title" width="60%">title</td>\n      <td>\n        <a class="btn btn-default btn-xs"\n           title="Edit"\n           ui-sref="resource.replace({resourcetype: ctrl.resourcetype, id: item.id})">\n          <i class="glyphicon glyphicon-pencil"></i>\n        </a>\n        <button class="btn btn-default btn-xs"\n                title="Delete"\n                ng-click="ctrl.deleteResource(item.id)">\n          <i class="glyphicon glyphicon-trash"></i>\n        </button>\n      </td>\n    </tr>\n    </tbody>\n  </table>\n</div>';
},{}],64:[function(require,module,exports){
module.exports = '<div>\n  <h1>Manage Resource Types</h1>\n <table class="table table-striped">\n    <thead>\n    <tr>\n      <th>ID</th>\n      <th>Label</th>\n      <th>Action</th>\n    </tr>\n    </thead>\n    <tbody>\n    <tr ng-repeat="item in ctrl.resourceTypes">\n      <td ng-bind="item.id" width="20%">id</td>\n      <td ng-bind="item.label" width="60%">Label</td>\n      <td>\n        <a class="btn btn-default btn-xs"\n           title="Edit"\n           ui-sref="resourcetypes.item.edit({resourcetype: ctrl.resourcetype, id: item.id})">\n          <i class="glyphicon glyphicon-pencil"></i>\n        </a>\n        <button class="btn btn-default btn-xs"\n                title="Delete"\n                ng-click="ctrl.deleteResource(item.id)">\n          <i class="glyphicon glyphicon-trash"></i>\n        </button>\n      </td>\n    </tr>\n    </tbody>\n  </table>\n</div>';
},{}]},{},[1])


//# sourceMappingURL=moondash.js.map