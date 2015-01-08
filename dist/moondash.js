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

},{"./auth":8,"./common":16,"./configurator":18,"./dispatch":21,"./forms":29,"./layout":33,"./mockapi":40,"./nav":44,"./notice":50,"./resourcetypes":54}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":3,"./encode":4}],6:[function(require,module,exports){
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

},{"punycode":2,"querystring":5}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./controllers":7,"./interceptors":9,"./services":10,"./states":11}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{"./templates/login.html":12,"./templates/logout.html":13,"./templates/profile.html":14}],12:[function(require,module,exports){
module.exports = '<div class="row">\n  <div class="col-md-offset-3 col-md-4 text-center">\n    <div class="panel-body">\n      <h2 class="text-center">Local Login</h2>\n\n      <form method="post"\n\n            ng-init="username=\'admin\';password=\'1\'"\n\n            ng-submit="ctrl.login(loginForm.$valid, username, password)"\n            name="loginForm">\n        <div class="alert alert-danger" role="alert"\n            ng-if="ctrl.errorMessage"\n            ng-bind="ctrl.errorMessage">Error message</div>\n        <div class="form-group">\n          <input class="form-control input-lg" type="text" name="username"\n                 ng-model="username" placeholder="Username" required\n                 autofocus>\n        </div>\n\n        <div class="form-group has-feedback">\n          <input class="form-control input-lg" type="password"\n                 name="password" ng-model="password"\n                 placeholder="Password" required>\n        </div>\n\n        <button type="submit" ng-disabled="loginForm.$invalid"\n                class="btn btn-lg  btn-block btn-success">Log in\n        </button>\n\n      </form>\n    </div>\n  </div>\n</div>\n';
},{}],13:[function(require,module,exports){
module.exports = '<h1>Logged Out</h1>\n<p>You have been logged out.</p>';
},{}],14:[function(require,module,exports){
module.exports = '<div class="container">\n  <div class="row">\n    <div class="col-md-3">\n      <h2 class="text-center">Profile</h2>\n\n      <p ng-if="ctrl.profile">\n\n        <div>id: {{ ctrl.profile.id }}</div>\n        <div>twitter: {{ ctrl.profile.twitter }}</div>\n        <div>First Name: {{ ctrl.profile.first_name }}</div>\n        <div>Last Name: {{ ctrl.profile.last_name }}</div>\n        <div>Email: {{ ctrl.profile.email }}</div>\n      </p>\n\n    </div>\n  </div>\n</div>\n';
},{}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{"./filters":15}],17:[function(require,module,exports){
function InitCtrl(Restangular, MdConfig, MdNav, MdRTypes, MdSchemas, MdForms) {
    Restangular.one('full/siteconfig.json').get()
      .then(
      function (siteconfig) {

        // Set the site name
        MdConfig.site.name = siteconfig.site.name;

        // Add resource types and nav menus
        MdRTypes.init(siteconfig.rtypes);
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

},{}],18:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.config', []);

require('./services');
require('./directives');


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":17,"./services":19}],19:[function(require,module,exports){
'use strict';

function MdConfig() {
  var _this = this;

  this.site = {name: 'Moondash'};

}

angular.module("moondash")
  .service('MdConfig', MdConfig);
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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

},{"./controllers":20,"./init":22,"./services":23,"./states":24}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
'use strict';

var url = require('url');

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
},{"./templates/error.html":25,"./templates/notfound.html":26,"url":6}],25:[function(require,module,exports){
module.exports = '<div>\n  <h1>Error</h1>\n\n  <p>Error when procesing state <code>{{ctrl.toState}}</code>:</p>\n  <pre>\n{{ctrl.error}}\n  </pre>\n  \n</div>';
},{}],26:[function(require,module,exports){
module.exports = '<div>\n  <h1>Not Found</h1>\n\n  <p>The requested URL <code>{{ctrl.path}}</code> could\n    not be found.</p>\n</div>';
},{}],27:[function(require,module,exports){
'use strict';

function FormController(MdSchemas, MdForms) {
  this.model = this.mdModel;
  this.schema = MdSchemas.get(this.mdSchema);
  this.form = MdForms.get(this.mdForm);
}

module.exports = {
  FormController: FormController
};
},{}],28:[function(require,module,exports){
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
},{"./controllers":27,"./templates/form.html":31}],29:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.forms', ['ui.router', 'restangular'])
  .service('MdSchemas', require('./services').SchemasService)
  .service('MdForms', require('./services').FormsService)
  .directive('mdForm', require('./directives').FormDirective);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":28,"./services":30}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
module.exports = '<form\n    sf-schema="ctrl.schema"\n    sf-form="ctrl.form"\n    sf-model="ctrl.model"></form>\n';
},{}],32:[function(require,module,exports){
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
},{}],33:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);

angular.module('md.layout', ['ui.router'])
  .service('MdLayout', require('./services').LayoutService)
  .config(require('./states').Config)
  .run(require('./services').Run);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./services":34,"./states":35}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./controllers":32,"./templates/md-footer.html":36,"./templates/md-header.html":37,"./templates/md-layout.html":38,"./templates/md-nav.html":39}],36:[function(require,module,exports){
module.exports = '<div>\n  Welcome to <span ng-bind="ctrl.siteName">Moondash</span>.\n</div>';
},{}],37:[function(require,module,exports){
module.exports = '<div class="container" role="navigation">\n  <div class="navbar navbar-inverse navbar-fixed-top"\n       role="navigation">\n    <div class="navbar-header">\n      <a class="navbar-brand"\n         href="#/"\n         ng-bind="ctrl.siteName">Site Name</a>\n    </div>\n    \n        <ul ng-if="!ctrl.$auth.isAuthenticated()"\n        class="nav navbar-nav pull-right">\n      <li ui-sref-active="active">\n        <a ui-sref="auth.login">Login</a></li>\n    </ul>\n    <ul ng-if="ctrl.$auth.isAuthenticated()"\n        class="nav navbar-nav pull-right">\n      <li ui-sref-active="active">\n        <a ui-sref="auth.profile">Profile</a>\n      </li>\n      <li><a ui-sref="auth.logout">Logout</a></li>\n    </ul>\n\n  </div>\n</div>\n';
},{}],38:[function(require,module,exports){
module.exports = '<div id="md-header" ui-view="md-header"></div>\n<div id="md-main">\n  <div class="row">\n    <div id="md-nav" class="col-sm-4 col-md-3"\n         ui-view="md-nav"></div>\n    <div id="md-content" class="col-sm-8 col-md-9"\n         ui-view="md-content"></div>\n  </div>\n</div>\n<div id="md-footer" ui-view="md-footer"></div>\n<script type="text/ng-template" id="template/modal/backdrop.html">\n  <div class="modal-backdrop fade {{ backdropClass }}"\n       ng-class="{in: animate}"\n       ng-style="{\'z-index\': 1040 + (index && 1 || 0) + index*10}"\n      ></div>\n</script>\n<script type="text/ng-template" id="template/modal/window.html">\n  <div tabindex="-1" role="dialog" class="modal fade"\n       ng-class="{in: animate}"\n       ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}"\n       ng-click="close($event)">\n    <div class="modal-dialog"\n         ng-class="{\'modal-sm\': size == \'sm\', \'modal-lg\': size == \'lg\'}">\n      <div class="modal-content" modal-transclude></div>\n    </div>\n  </div>\n</script>';
},{}],39:[function(require,module,exports){
module.exports = '<md-navpanel></md-navpanel>';
},{}],40:[function(require,module,exports){
'use strict';

/*

 When running in dev mode, mock the calls to the REST API, then
 pass everything else through.

 */

angular.module('md.mockapi', [])
  .provider('MdMockRest', require('./providers').MockRest)
  .run(require('./providers').Run);
},{"./providers":41}],41:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);
var url = require('url');

function MockRest() {
  var _this = this;
  this.mocks = {};

  this.$get = function () {
    var mocks = this.mocks;
    return {
      registerMocks: registerMocks
    };
  };

  this.addMocks = function (k, v) {
    this.mocks[k] = v;
  };

  function registerMocks($httpBackend) {
    // Iterate over all the registered mocks and register them
    _.map(_this.mocks, function (moduleMocks) {
      _(moduleMocks).forEach(function (mock) {

        // To register with $httpBackend's matchers, we need two things
        // from the mock: the method and the URL pattern.
        var method = mock.method || 'GET',
          pattern = mock.pattern;

        var wrappedResponder = function (method, url, data, headers) {
          return dispatch(mock, method, url, data, headers);
        };

        $httpBackend.when(method, pattern)
          .respond(wrappedResponder);
      });
    });
  }

  function dispatch(mock, method, thisUrl, data, headers) {
    // Called by $httpBackend whenever this mock's pattern is matched.

    var responder, responseData, response, request, parsedUrl;

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
    if (responseData) {
      response = [200, responseData]
    } else {
      // Package up request information into a convenient data,
      // call the responder, and return the response.
      request = url.parse(thisUrl, true);
      request.url = thisUrl;
      request.headers = headers;
      request.data = data;
      if (data) request.json_body = JSON.parse(data);
      response = responder(request);
    }

    return response;
  }
}


function ModuleRun($httpBackend, MdMockRest) {
  MdMockRest.registerMocks($httpBackend);

  // pass through everything else
  $httpBackend.whenGET(/\/*/).passThrough();
  $httpBackend.whenPOST(/\/*/).passThrough();
  $httpBackend.whenPUT(/\/*/).passThrough();

}


module.exports = {
  MockRest: MockRest,
  Run: ModuleRun
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"url":6}],42:[function(require,module,exports){
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
},{}],43:[function(require,module,exports){
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

},{"./controllers":42,"./templates/navmenu.html":46,"./templates/navpanel.html":47,"./templates/submenu.html":48}],44:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.nav', [])
  .service('MdNav', require('./services').NavService)
  .directive('mdNavmenu', require('./directives').NavMenu)
  .directive('mdNavsubmenu', require('./directives').NavSubmenu)
  .directive('mdNavpanel', require('./directives').NavPanel);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./directives":43,"./services":45}],45:[function(require,module,exports){
'use strict';

function NavService() {

  var _this = this;

  this.menus = {
    root: {label: false, priority: -1, items: {}}
  };

  // Handle top-level menus, aka menu groups
  this.addMenu = function (menu) {

    // Unpack and repack, just to enforce schema. Later, do this as
    // an actual schema.
    var id = menu.id,
      label = menu.label,
      priority = menu.priority ? menu.priority : 99;

    _this.menus[id] = {
      id: id,
      label: label,
      priority: priority,
      items: {}
    }
  };

  this.addMenuItem = function (menuId, menuItem) {
    // Add a menu item to a top-level menu

    // Unpack and repack, just to enforce schema. Later, do this as
    // an actual schema.
    var id = menuItem.id,
      label = menuItem.label,
      priority = menuItem.priority ? menuItem.priority : 99,
      state = menuItem.state,
      params = menuItem.params,
      items = menuItem.items,
      parentItems = _this.menus[menuId].items;

    parentItems[id] = {
      id: id,
      label: label,
      priority: priority,
      state: state,
      items: items
    };

    if (params) parentItems[id].params = params;
  };

  this.init = function (siteconfig) {
    // Given the "nav" key in siteconfig.json, wire things up

    // Extract relevant stuff from config, perhaps validating
    var urlPrefix = siteconfig.urlPrefix,
      items = siteconfig.items;

    // Pluck out the items.root, if it exists, and add any entries to
    // the centrally-defined "root" menu.
    if (items.root) {
      _(items.root).forEach(function (menuItem) {
        var id = menuItem.id,
          label = menuItem.label,
          priority = menuItem.priority,
          state = menuItem.state,
          params = menuItem.params,
          items = menuItem.items;
        _this.addMenuItem(
          'root',
          {
            id: id, label: label, priority: priority, state: state,
            params: params, items: items
          }
        );
      });
      delete items.root;
    }

    // Top-level menus
    _(items).forEach(
      function (menu) {
        var id = menu.id,
          label = menu.label,
          priority = menu.priority,
          items = menu.items;
        _this.addMenu(
          {id: id, label: label, priority: priority}
        );

        // Now next level menus
        _(items).forEach(function (menuItem) {
          var id = menuItem.id,
            label = menuItem.label,
            priority = menuItem.priority,
            state = menuItem.state,
            params = menuItem.params,
            items = menuItem.items;
          _this.addMenuItem(
            menu.id,
            {
              id: id, label: label, priority: priority, state: state,
              params: params, items: items
            }
          );

        });

      }
    );
    _this.urlPrefix = _this.urlPrefix;

  }

}

module.exports = {
  NavService: NavService
};


},{}],46:[function(require,module,exports){
module.exports = '<div>\n  <h5 class="text-muted"\n      ng-if="ctrl.menuitem.label"\n      ng-bind="ctrl.menuitem.label">Menu Title</h5>\n  <ul class="list-group">\n    <li class="list-group-item"\n        ng-repeat="(id, menuitem) in ctrl.menuitem.items | mdOrderObjectBy: \'priority\'">\n      <a\n          ng-if="!menuitem.items"\n          ng-bind="menuitem.label"\n          ui-sref="{{ ctrl.sref(menuitem) }}">\n        Menu Item </a>\n      <md-navsubmenu ng-model="menuitem"\n                     ng-if="menuitem.items"></md-navsubmenu>\n    </li>\n  </ul>\n</div>';
},{}],47:[function(require,module,exports){
module.exports = '<div ng-repeat="(id, menu) in ctrl.menus | mdOrderObjectBy: \'priority\'">\n  <md-navmenu id="md-navmenu-{{id}}" ng-model="menu"></md-navmenu>\n</div>';
},{}],48:[function(require,module,exports){
module.exports = '<button\n    class="btn btn-xs btn-default pull-right"\n    ng-click="ctrl.isCollapsed = !ctrl.isCollapsed"\n    >\n  <span class="glyphicon glyphicon-chevron-left"\n        ng-if="ctrl.isCollapsed"></span>\n  <span class="glyphicon glyphicon-chevron-down"\n        ng-if="!ctrl.isCollapsed"></span>\n</button>\n<span class="list-group-item-heading"\n      ng-bind="ctrl.menuitem.label">Navmenu Heading</span>\n<div class="list-group" collapse="ctrl.isCollapsed"\n     style="margin-top: 1em; margin-bottom: 0">\n  <a class="list-group-item"\n     ng-repeat="(id, menuitem) in ctrl.menuitem.items | mdOrderObjectBy: \'priority\'""\n     ui-sref="{{ menuitem.state }}"\n     ng-bind="menuitem.label">\n    Navmenu Label\n  </a>\n</div>\n';
},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.notice', ['ui.bootstrap.modal'])
  .controller('NoticeController', require('./controllers').NoticeController)
  .service('$notice', require('./services').NoticeService);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers":49,"./services":51}],51:[function(require,module,exports){
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

},{"./controllers":49,"./templates/notice.html":52}],52:[function(require,module,exports){
module.exports = '<div class="modal-body" ng-bind="ctrl.message">\n  The message\n</div>\n';
},{}],53:[function(require,module,exports){
'use strict';

function ManageController() {
  this.flag = 9;
}

function ListController($stateParams, items) {
  this.rtype = $stateParams.rtype;
  this.items = items;
}

function EditController(item) {
  this.item = item;
  this.schemaId = 'schema1';
  this.formId = 'form1';
}

module.exports = {
  ManageController: ManageController,
  ListController: ListController,
  EditController: EditController
};

},{}],54:[function(require,module,exports){
(function (global){
'use strict';

var angular = (typeof window !== "undefined" ? window.angular : typeof global !== "undefined" ? global.angular : null);
angular.module('md.resourcetypes', ['md.forms', 'ui.router'])
  .service('MdRTypes', require('./services').RTypesService)
  .config(require('./states').Config);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./services":55,"./states":56}],55:[function(require,module,exports){
(function (global){
'use strict';

var _ = (typeof window !== "undefined" ? window._ : typeof global !== "undefined" ? global._ : null);

function RTypesService(MdNav) {
  var _this = this;

  // Set the base REST prefix for this site's rtypes entry point
  this.urlPrefix = 'api/rtypes';

  // Initialize the navmenu
  MdNav.addMenu(
    {id: 'rtypes', label: 'Resource Types', priority: 2}
  );
  MdNav.addMenuItem('rtypes', {
    id: 'manage', label: 'Manage', state: 'rtypes.manage', priority: 99
  });

  this.items = {};

  this.add = function (id, label, schema) {
    _this.items[id] = {
      id: id,
      label: label,
      schema: schema
    };
    MdNav.addMenuItem('rtypes', {
      id: id,
      label: label,
      state: 'rtypes.list',
      params: 'rtype: "' + id + '"',
      priority: 5
    });
  };

  this.init = function (siteconfig) {
    // Given some JSON, pick out the pieces and do some config. We
    // are passed in the "rtypes" part of the JSON.

    // Extract relevant stuff from config, perhaps validating
    var urlPrefix = siteconfig.urlPrefix,
      items = siteconfig.items;


    _(items).forEach(
      function (rtype) {
        _this.add(rtype.id, rtype.label);

      }
    );
    _this.urlPrefix = _this.urlPrefix;

  }
}

module.exports = {
  RTypesService: RTypesService
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],56:[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function ModuleConfig($stateProvider) {
  $stateProvider
    .state('rtypes', {
             parent: 'root',
             url: '/rtypes'
           })

    // Generic list of resources of a resource type
    .state('rtypes.list', {
             url: '/{rtype}', // Will need regex that omits "manage"
             title: 'List Resources',
             views: {
               'md-content@root': {
                 template: require('./templates/list.html'),
                 controller: controllers.ListController,
                 controllerAs: 'ctrl',
                 resolve: {
                   items: function (Restangular, $stateParams, MdRTypes) {
                     var rtype = $stateParams.rtype;
                     var url = MdRTypes.urlPrefix + '/' + rtype + '/items';
                     return Restangular.all(url).getList();
                   }
                 }
               }
             }
           })
    .state('rtypes.item', {
             url: '/{rtype}/{id}',
             resolve: {
               item: function (Restangular, $stateParams, MdRTypes) {
                 var rtype = $stateParams.rtype;
                 var id = $stateParams.id;
                 var url = MdRTypes.urlPrefix + '/' + rtype + '/' + id;
                 return Restangular.one(url).get();
               }
             }
           })
    .state('rtypes.item.edit', {
             url: '/edit',
             title: 'Edit Resource',
             views: {
               'md-content@root': {
                 template: require('./templates/edit.html'),
                 controller: controllers.EditController,
                 controllerAs: 'ctrl'
               }
             }
           })
    .state('rtypes.manage', {
             url: '/manage',
             title: 'Manage',
             views: {
               'md-content@root': {
                 template: require('./templates/manage.html'),
                 controller: controllers.ManageController,
                 controllerAs: 'ctrl'
               }
             }
           });
}

module.exports = {
  Config: ModuleConfig
};

},{"./controllers":53,"./templates/edit.html":57,"./templates/list.html":58,"./templates/manage.html":59}],57:[function(require,module,exports){
module.exports = '<div>\n  <h1>Edit {{ctrl.item.title}}</h1>\n  <md-form md-model="ctrl.item"\n           md-schema="{{ctrl.schemaId}}"\n           md-form="{{ctrl.formId}}"></md-form>\n</div>';
},{}],58:[function(require,module,exports){
module.exports = '<div style="margin-right: 2em">\n  <h1>List <code>{{ ctrl.rtype }}</code></h1>\n  <table class="table table-striped">\n    <thead>\n    <tr>\n      <th>ID</th>\n      <th>Title</th>\n      <th>Action</th>\n    </tr>\n    </thead>\n    <tbody>\n    <tr ng-repeat="item in ctrl.items">\n      <td ng-bind="item.id">id</td>\n      <td ng-bind="item.title">title</td>\n      <td>\n        <a class="btn btn-default btn-xs"\n            ui-sref="rtypes.item.edit({rtype: ctrl.rtype, id: item.id})">\n          <i class="glyphicon glyphicon-pencil"></i>\n        </a>\n      </td>\n    </tr>\n    </tbody>\n  </table>\n</div>';
},{}],59:[function(require,module,exports){
module.exports = '<div>\n  <h1>Manage Resource Types</h1>\n</div>';
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbW9kdWxlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3B1bnljb2RlL3B1bnljb2RlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5nLWVzMy9kZWNvZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcXVlcnlzdHJpbmctZXMzL2VuY29kZS5qcyIsIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9xdWVyeXN0cmluZy1lczMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvdXJsL3VybC5qcyIsInNyYy9hdXRoL2NvbnRyb2xsZXJzLmpzIiwic3JjL2F1dGgvaW5kZXguanMiLCJzcmMvYXV0aC9pbnRlcmNlcHRvcnMuanMiLCJzcmMvYXV0aC9zZXJ2aWNlcy5qcyIsInNyYy9hdXRoL3N0YXRlcy5qcyIsInNyYy9hdXRoL3RlbXBsYXRlcy9sb2dpbi5odG1sIiwic3JjL2F1dGgvdGVtcGxhdGVzL2xvZ291dC5odG1sIiwic3JjL2F1dGgvdGVtcGxhdGVzL3Byb2ZpbGUuaHRtbCIsInNyYy9jb21tb24vZmlsdGVycy5qcyIsInNyYy9jb21tb24vaW5kZXguanMiLCJzcmMvY29uZmlndXJhdG9yL2RpcmVjdGl2ZXMuanMiLCJzcmMvY29uZmlndXJhdG9yL2luZGV4LmpzIiwic3JjL2NvbmZpZ3VyYXRvci9zZXJ2aWNlcy5qcyIsInNyYy9kaXNwYXRjaC9jb250cm9sbGVycy5qcyIsInNyYy9kaXNwYXRjaC9pbmRleC5qcyIsInNyYy9kaXNwYXRjaC9pbml0LmpzIiwic3JjL2Rpc3BhdGNoL3NlcnZpY2VzLmpzIiwic3JjL2Rpc3BhdGNoL3N0YXRlcy5qcyIsInNyYy9kaXNwYXRjaC90ZW1wbGF0ZXMvZXJyb3IuaHRtbCIsInNyYy9kaXNwYXRjaC90ZW1wbGF0ZXMvbm90Zm91bmQuaHRtbCIsInNyYy9mb3Jtcy9jb250cm9sbGVycy5qcyIsInNyYy9mb3Jtcy9kaXJlY3RpdmVzLmpzIiwic3JjL2Zvcm1zL2luZGV4LmpzIiwic3JjL2Zvcm1zL3NlcnZpY2VzLmpzIiwic3JjL2Zvcm1zL3RlbXBsYXRlcy9mb3JtLmh0bWwiLCJzcmMvbGF5b3V0L2NvbnRyb2xsZXJzLmpzIiwic3JjL2xheW91dC9pbmRleC5qcyIsInNyYy9sYXlvdXQvc2VydmljZXMuanMiLCJzcmMvbGF5b3V0L3N0YXRlcy5qcyIsInNyYy9sYXlvdXQvdGVtcGxhdGVzL21kLWZvb3Rlci5odG1sIiwic3JjL2xheW91dC90ZW1wbGF0ZXMvbWQtaGVhZGVyLmh0bWwiLCJzcmMvbGF5b3V0L3RlbXBsYXRlcy9tZC1sYXlvdXQuaHRtbCIsInNyYy9sYXlvdXQvdGVtcGxhdGVzL21kLW5hdi5odG1sIiwic3JjL21vY2thcGkvaW5kZXguanMiLCJzcmMvbW9ja2FwaS9wcm92aWRlcnMuanMiLCJzcmMvbmF2L2NvbnRyb2xsZXJzLmpzIiwic3JjL25hdi9kaXJlY3RpdmVzLmpzIiwic3JjL25hdi9pbmRleC5qcyIsInNyYy9uYXYvc2VydmljZXMuanMiLCJzcmMvbmF2L3RlbXBsYXRlcy9uYXZtZW51Lmh0bWwiLCJzcmMvbmF2L3RlbXBsYXRlcy9uYXZwYW5lbC5odG1sIiwic3JjL25hdi90ZW1wbGF0ZXMvc3VibWVudS5odG1sIiwic3JjL25vdGljZS9jb250cm9sbGVycy5qcyIsInNyYy9ub3RpY2UvaW5kZXguanMiLCJzcmMvbm90aWNlL3NlcnZpY2VzLmpzIiwic3JjL25vdGljZS90ZW1wbGF0ZXMvbm90aWNlLmh0bWwiLCJzcmMvcmVzb3VyY2V0eXBlcy9jb250cm9sbGVycy5qcyIsInNyYy9yZXNvdXJjZXR5cGVzL2luZGV4LmpzIiwic3JjL3Jlc291cmNldHlwZXMvc2VydmljZXMuanMiLCJzcmMvcmVzb3VyY2V0eXBlcy9zdGF0ZXMuanMiLCJzcmMvcmVzb3VyY2V0eXBlcy90ZW1wbGF0ZXMvZWRpdC5odG1sIiwic3JjL3Jlc291cmNldHlwZXMvdGVtcGxhdGVzL2xpc3QuaHRtbCIsInNyYy9yZXNvdXJjZXR5cGVzL3RlbXBsYXRlcy9tYW5hZ2UuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbnNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTs7QUNBQTs7QUNBQTs7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25EQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTs7QUNBQTs7QUNBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZXBlbmRlbmNpZXMgPSBbXG4gIC8vIE91ciBzdWJtb2R1bGVzXG4gICdtZC5jb21tb24nLCAnbWQuY29uZmlnJywgJ21kLmxheW91dCcsICdtZC5tb2NrYXBpJywgJ21kLm5vdGljZScsXG4gICdtZC5hdXRoJywgJ21kLmZvcm1zJywgJ21kLm5hdicsICdtZC5kaXNwYXRjaCcsICdtZC5yZXNvdXJjZXR5cGVzJyxcblxuICAvLyBFeHRlcm5hbCBzdHVmZlxuICAnbmdTYW5pdGl6ZScsICd1aS5yb3V0ZXInLCAncmVzdGFuZ3VsYXInLCAnc2F0ZWxsaXplcicsXG4gICd1aS5ib290c3RyYXAubW9kYWwnLCAndWkuYm9vdHN0cmFwLmNvbGxhcHNlJywgJ3NjaGVtYUZvcm0nXTtcblxudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5cbi8vIGRpc3QvbW9vbmRhc2gtdmVuZG9ycy5qcyBkb2VzIE5PVCBpbmNsdWRlIG5nTW9ja0UyRS4gT25seSBhZGQgdGhhdFxuLy8gZGVwZW5kZW5jeSBhbmQgbWQubW9ja2FwaSBpZiB3ZSBoYXZlIG5nTW9ja0UyRS5cbmlmIChhbmd1bGFyLm1vY2spIHtcbiAgZGVwZW5kZW5jaWVzLnB1c2goJ25nTW9ja0UyRScpO1xuICBkZXBlbmRlbmNpZXMucHVzaCgnbWQubW9ja2FwaScpO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnLCBkZXBlbmRlbmNpZXMpO1xuXG4vLyBSZXF1aXJlIHRoZSBNb29uZGFzaCBjb21wb25lbnRzXG5yZXF1aXJlKCcuL2NvbW1vbicpO1xucmVxdWlyZSgnLi9sYXlvdXQnKTtcbnJlcXVpcmUoJy4vY29uZmlndXJhdG9yJyk7XG5yZXF1aXJlKCcuL21vY2thcGknKTtcbnJlcXVpcmUoJy4vYXV0aCcpO1xucmVxdWlyZSgnLi9ub3RpY2UnKTtcbnJlcXVpcmUoJy4vZm9ybXMnKTtcbnJlcXVpcmUoJy4vbmF2Jyk7XG5yZXF1aXJlKCcuL2Rpc3BhdGNoJyk7XG5yZXF1aXJlKCcuL3Jlc291cmNldHlwZXMnKTtcbnJlcXVpcmUoJy4vY29tbW9uJyk7XG4iLCIvKiEgaHR0cDovL210aHMuYmUvcHVueWNvZGUgdjEuMi40IGJ5IEBtYXRoaWFzICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGVzICovXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBgcHVueWNvZGVgIG9iamVjdC5cblx0ICogQG5hbWUgcHVueWNvZGVcblx0ICogQHR5cGUgT2JqZWN0XG5cdCAqL1xuXHR2YXIgcHVueWNvZGUsXG5cblx0LyoqIEhpZ2hlc3QgcG9zaXRpdmUgc2lnbmVkIDMyLWJpdCBmbG9hdCB2YWx1ZSAqL1xuXHRtYXhJbnQgPSAyMTQ3NDgzNjQ3LCAvLyBha2EuIDB4N0ZGRkZGRkYgb3IgMl4zMS0xXG5cblx0LyoqIEJvb3RzdHJpbmcgcGFyYW1ldGVycyAqL1xuXHRiYXNlID0gMzYsXG5cdHRNaW4gPSAxLFxuXHR0TWF4ID0gMjYsXG5cdHNrZXcgPSAzOCxcblx0ZGFtcCA9IDcwMCxcblx0aW5pdGlhbEJpYXMgPSA3Mixcblx0aW5pdGlhbE4gPSAxMjgsIC8vIDB4ODBcblx0ZGVsaW1pdGVyID0gJy0nLCAvLyAnXFx4MkQnXG5cblx0LyoqIFJlZ3VsYXIgZXhwcmVzc2lvbnMgKi9cblx0cmVnZXhQdW55Y29kZSA9IC9eeG4tLS8sXG5cdHJlZ2V4Tm9uQVNDSUkgPSAvW14gLX5dLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1xceDJFfFxcdTMwMDJ8XFx1RkYwRXxcXHVGRjYxL2csIC8vIFJGQyAzNDkwIHNlcGFyYXRvcnNcblxuXHQvKiogRXJyb3IgbWVzc2FnZXMgKi9cblx0ZXJyb3JzID0ge1xuXHRcdCdvdmVyZmxvdyc6ICdPdmVyZmxvdzogaW5wdXQgbmVlZHMgd2lkZXIgaW50ZWdlcnMgdG8gcHJvY2VzcycsXG5cdFx0J25vdC1iYXNpYyc6ICdJbGxlZ2FsIGlucHV0ID49IDB4ODAgKG5vdCBhIGJhc2ljIGNvZGUgcG9pbnQpJyxcblx0XHQnaW52YWxpZC1pbnB1dCc6ICdJbnZhbGlkIGlucHV0J1xuXHR9LFxuXG5cdC8qKiBDb252ZW5pZW5jZSBzaG9ydGN1dHMgKi9cblx0YmFzZU1pbnVzVE1pbiA9IGJhc2UgLSB0TWluLFxuXHRmbG9vciA9IE1hdGguZmxvb3IsXG5cdHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGUsXG5cblx0LyoqIFRlbXBvcmFyeSB2YXJpYWJsZSAqL1xuXHRrZXk7XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0LyoqXG5cdCAqIEEgZ2VuZXJpYyBlcnJvciB1dGlsaXR5IGZ1bmN0aW9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUaGUgZXJyb3IgdHlwZS5cblx0ICogQHJldHVybnMge0Vycm9yfSBUaHJvd3MgYSBgUmFuZ2VFcnJvcmAgd2l0aCB0aGUgYXBwbGljYWJsZSBlcnJvciBtZXNzYWdlLlxuXHQgKi9cblx0ZnVuY3Rpb24gZXJyb3IodHlwZSkge1xuXHRcdHRocm93IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHdoaWxlIChsZW5ndGgtLSkge1xuXHRcdFx0YXJyYXlbbGVuZ3RoXSA9IGZuKGFycmF5W2xlbmd0aF0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJyYXk7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZS5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHJldHVybiBtYXAoc3RyaW5nLnNwbGl0KHJlZ2V4U2VwYXJhdG9ycyksIGZuKS5qb2luKCcuJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBkZWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZyBUaGUgVW5pY29kZSBpbnB1dCBzdHJpbmcgKFVDUy0yKS5cblx0ICogQHJldHVybnMge0FycmF5fSBUaGUgbmV3IGFycmF5IG9mIGNvZGUgcG9pbnRzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpIHtcblx0XHR2YXIgb3V0cHV0ID0gW10sXG5cdFx0ICAgIGNvdW50ZXIgPSAwLFxuXHRcdCAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuXHRcdCAgICB2YWx1ZSxcblx0XHQgICAgZXh0cmE7XG5cdFx0d2hpbGUgKGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdHZhbHVlID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdGlmICh2YWx1ZSA+PSAweEQ4MDAgJiYgdmFsdWUgPD0gMHhEQkZGICYmIGNvdW50ZXIgPCBsZW5ndGgpIHtcblx0XHRcdFx0Ly8gaGlnaCBzdXJyb2dhdGUsIGFuZCB0aGVyZSBpcyBhIG5leHQgY2hhcmFjdGVyXG5cdFx0XHRcdGV4dHJhID0gc3RyaW5nLmNoYXJDb2RlQXQoY291bnRlcisrKTtcblx0XHRcdFx0aWYgKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKSB7IC8vIGxvdyBzdXJyb2dhdGVcblx0XHRcdFx0XHRvdXRwdXQucHVzaCgoKHZhbHVlICYgMHgzRkYpIDw8IDEwKSArIChleHRyYSAmIDB4M0ZGKSArIDB4MTAwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG5cdFx0XHRcdFx0Ly8gY29kZSB1bml0IGlzIHRoZSBoaWdoIHN1cnJvZ2F0ZSBvZiBhIHN1cnJvZ2F0ZSBwYWlyXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0XHRcdGNvdW50ZXItLTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b3V0cHV0LnB1c2godmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBzdHJpbmcgYmFzZWQgb24gYW4gYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHNlZSBgcHVueWNvZGUudWNzMi5kZWNvZGVgXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZS51Y3MyXG5cdCAqIEBuYW1lIGVuY29kZVxuXHQgKiBAcGFyYW0ge0FycmF5fSBjb2RlUG9pbnRzIFRoZSBhcnJheSBvZiBudW1lcmljIGNvZGUgcG9pbnRzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgbmV3IFVuaWNvZGUgc3RyaW5nIChVQ1MtMikuXG5cdCAqL1xuXHRmdW5jdGlvbiB1Y3MyZW5jb2RlKGFycmF5KSB7XG5cdFx0cmV0dXJuIG1hcChhcnJheSwgZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRcdGlmICh2YWx1ZSA+IDB4RkZGRikge1xuXHRcdFx0XHR2YWx1ZSAtPSAweDEwMDAwO1xuXHRcdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdFx0dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgYmFzaWMgY29kZSBwb2ludCBpbnRvIGEgZGlnaXQvaW50ZWdlci5cblx0ICogQHNlZSBgZGlnaXRUb0Jhc2ljKClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlUG9pbnQgVGhlIGJhc2ljIG51bWVyaWMgY29kZSBwb2ludCB2YWx1ZS5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIG51bWVyaWMgdmFsdWUgb2YgYSBiYXNpYyBjb2RlIHBvaW50IChmb3IgdXNlIGluXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaW4gdGhlIHJhbmdlIGAwYCB0byBgYmFzZSAtIDFgLCBvciBgYmFzZWAgaWZcblx0ICogdGhlIGNvZGUgcG9pbnQgZG9lcyBub3QgcmVwcmVzZW50IGEgdmFsdWUuXG5cdCAqL1xuXHRmdW5jdGlvbiBiYXNpY1RvRGlnaXQoY29kZVBvaW50KSB7XG5cdFx0aWYgKGNvZGVQb2ludCAtIDQ4IDwgMTApIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSAyMjtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDY1IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA2NTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCAtIDk3IDwgMjYpIHtcblx0XHRcdHJldHVybiBjb2RlUG9pbnQgLSA5Nztcblx0XHR9XG5cdFx0cmV0dXJuIGJhc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBkaWdpdC9pbnRlZ2VyIGludG8gYSBiYXNpYyBjb2RlIHBvaW50LlxuXHQgKiBAc2VlIGBiYXNpY1RvRGlnaXQoKWBcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtOdW1iZXJ9IGRpZ2l0IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHJldHVybnMge051bWJlcn0gVGhlIGJhc2ljIGNvZGUgcG9pbnQgd2hvc2UgdmFsdWUgKHdoZW4gdXNlZCBmb3Jcblx0ICogcmVwcmVzZW50aW5nIGludGVnZXJzKSBpcyBgZGlnaXRgLCB3aGljaCBuZWVkcyB0byBiZSBpbiB0aGUgcmFuZ2Vcblx0ICogYDBgIHRvIGBiYXNlIC0gMWAuIElmIGBmbGFnYCBpcyBub24temVybywgdGhlIHVwcGVyY2FzZSBmb3JtIGlzXG5cdCAqIHVzZWQ7IGVsc2UsIHRoZSBsb3dlcmNhc2UgZm9ybSBpcyB1c2VkLiBUaGUgYmVoYXZpb3IgaXMgdW5kZWZpbmVkXG5cdCAqIGlmIGBmbGFnYCBpcyBub24temVybyBhbmQgYGRpZ2l0YCBoYXMgbm8gdXBwZXJjYXNlIGZvcm0uXG5cdCAqL1xuXHRmdW5jdGlvbiBkaWdpdFRvQmFzaWMoZGlnaXQsIGZsYWcpIHtcblx0XHQvLyAgMC4uMjUgbWFwIHRvIEFTQ0lJIGEuLnogb3IgQS4uWlxuXHRcdC8vIDI2Li4zNSBtYXAgdG8gQVNDSUkgMC4uOVxuXHRcdHJldHVybiBkaWdpdCArIDIyICsgNzUgKiAoZGlnaXQgPCAyNikgLSAoKGZsYWcgIT0gMCkgPDwgNSk7XG5cdH1cblxuXHQvKipcblx0ICogQmlhcyBhZGFwdGF0aW9uIGZ1bmN0aW9uIGFzIHBlciBzZWN0aW9uIDMuNCBvZiBSRkMgMzQ5Mi5cblx0ICogaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzQ5MiNzZWN0aW9uLTMuNFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gYWRhcHQoZGVsdGEsIG51bVBvaW50cywgZmlyc3RUaW1lKSB7XG5cdFx0dmFyIGsgPSAwO1xuXHRcdGRlbHRhID0gZmlyc3RUaW1lID8gZmxvb3IoZGVsdGEgLyBkYW1wKSA6IGRlbHRhID4+IDE7XG5cdFx0ZGVsdGEgKz0gZmxvb3IoZGVsdGEgLyBudW1Qb2ludHMpO1xuXHRcdGZvciAoLyogbm8gaW5pdGlhbGl6YXRpb24gKi87IGRlbHRhID4gYmFzZU1pbnVzVE1pbiAqIHRNYXggPj4gMTsgayArPSBiYXNlKSB7XG5cdFx0XHRkZWx0YSA9IGZsb29yKGRlbHRhIC8gYmFzZU1pbnVzVE1pbik7XG5cdFx0fVxuXHRcdHJldHVybiBmbG9vcihrICsgKGJhc2VNaW51c1RNaW4gKyAxKSAqIGRlbHRhIC8gKGRlbHRhICsgc2tldykpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scyB0byBhIHN0cmluZyBvZiBVbmljb2RlXG5cdCAqIHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuXHRcdC8vIERvbid0IHVzZSBVQ1MtMlxuXHRcdHZhciBvdXRwdXQgPSBbXSxcblx0XHQgICAgaW5wdXRMZW5ndGggPSBpbnB1dC5sZW5ndGgsXG5cdFx0ICAgIG91dCxcblx0XHQgICAgaSA9IDAsXG5cdFx0ICAgIG4gPSBpbml0aWFsTixcblx0XHQgICAgYmlhcyA9IGluaXRpYWxCaWFzLFxuXHRcdCAgICBiYXNpYyxcblx0XHQgICAgaixcblx0XHQgICAgaW5kZXgsXG5cdFx0ICAgIG9sZGksXG5cdFx0ICAgIHcsXG5cdFx0ICAgIGssXG5cdFx0ICAgIGRpZ2l0LFxuXHRcdCAgICB0LFxuXHRcdCAgICAvKiogQ2FjaGVkIGNhbGN1bGF0aW9uIHJlc3VsdHMgKi9cblx0XHQgICAgYmFzZU1pbnVzVDtcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHM6IGxldCBgYmFzaWNgIGJlIHRoZSBudW1iZXIgb2YgaW5wdXQgY29kZVxuXHRcdC8vIHBvaW50cyBiZWZvcmUgdGhlIGxhc3QgZGVsaW1pdGVyLCBvciBgMGAgaWYgdGhlcmUgaXMgbm9uZSwgdGhlbiBjb3B5XG5cdFx0Ly8gdGhlIGZpcnN0IGJhc2ljIGNvZGUgcG9pbnRzIHRvIHRoZSBvdXRwdXQuXG5cblx0XHRiYXNpYyA9IGlucHV0Lmxhc3RJbmRleE9mKGRlbGltaXRlcik7XG5cdFx0aWYgKGJhc2ljIDwgMCkge1xuXHRcdFx0YmFzaWMgPSAwO1xuXHRcdH1cblxuXHRcdGZvciAoaiA9IDA7IGogPCBiYXNpYzsgKytqKSB7XG5cdFx0XHQvLyBpZiBpdCdzIG5vdCBhIGJhc2ljIGNvZGUgcG9pbnRcblx0XHRcdGlmIChpbnB1dC5jaGFyQ29kZUF0KGopID49IDB4ODApIHtcblx0XHRcdFx0ZXJyb3IoJ25vdC1iYXNpYycpO1xuXHRcdFx0fVxuXHRcdFx0b3V0cHV0LnB1c2goaW5wdXQuY2hhckNvZGVBdChqKSk7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBkZWNvZGluZyBsb29wOiBzdGFydCBqdXN0IGFmdGVyIHRoZSBsYXN0IGRlbGltaXRlciBpZiBhbnkgYmFzaWMgY29kZVxuXHRcdC8vIHBvaW50cyB3ZXJlIGNvcGllZDsgc3RhcnQgYXQgdGhlIGJlZ2lubmluZyBvdGhlcndpc2UuXG5cblx0XHRmb3IgKGluZGV4ID0gYmFzaWMgPiAwID8gYmFzaWMgKyAxIDogMDsgaW5kZXggPCBpbnB1dExlbmd0aDsgLyogbm8gZmluYWwgZXhwcmVzc2lvbiAqLykge1xuXG5cdFx0XHQvLyBgaW5kZXhgIGlzIHRoZSBpbmRleCBvZiB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgY29uc3VtZWQuXG5cdFx0XHQvLyBEZWNvZGUgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlciBpbnRvIGBkZWx0YWAsXG5cdFx0XHQvLyB3aGljaCBnZXRzIGFkZGVkIHRvIGBpYC4gVGhlIG92ZXJmbG93IGNoZWNraW5nIGlzIGVhc2llclxuXHRcdFx0Ly8gaWYgd2UgaW5jcmVhc2UgYGlgIGFzIHdlIGdvLCB0aGVuIHN1YnRyYWN0IG9mZiBpdHMgc3RhcnRpbmdcblx0XHRcdC8vIHZhbHVlIGF0IHRoZSBlbmQgdG8gb2J0YWluIGBkZWx0YWAuXG5cdFx0XHRmb3IgKG9sZGkgPSBpLCB3ID0gMSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cblx0XHRcdFx0aWYgKGluZGV4ID49IGlucHV0TGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ2ludmFsaWQtaW5wdXQnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRpZ2l0ID0gYmFzaWNUb0RpZ2l0KGlucHV0LmNoYXJDb2RlQXQoaW5kZXgrKykpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA+PSBiYXNlIHx8IGRpZ2l0ID4gZmxvb3IoKG1heEludCAtIGkpIC8gdykpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGkgKz0gZGlnaXQgKiB3O1xuXHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblxuXHRcdFx0XHRpZiAoZGlnaXQgPCB0KSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRiYXNlTWludXNUID0gYmFzZSAtIHQ7XG5cdFx0XHRcdGlmICh3ID4gZmxvb3IobWF4SW50IC8gYmFzZU1pbnVzVCkpIHtcblx0XHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHcgKj0gYmFzZU1pbnVzVDtcblxuXHRcdFx0fVxuXG5cdFx0XHRvdXQgPSBvdXRwdXQubGVuZ3RoICsgMTtcblx0XHRcdGJpYXMgPSBhZGFwdChpIC0gb2xkaSwgb3V0LCBvbGRpID09IDApO1xuXG5cdFx0XHQvLyBgaWAgd2FzIHN1cHBvc2VkIHRvIHdyYXAgYXJvdW5kIGZyb20gYG91dGAgdG8gYDBgLFxuXHRcdFx0Ly8gaW5jcmVtZW50aW5nIGBuYCBlYWNoIHRpbWUsIHNvIHdlJ2xsIGZpeCB0aGF0IG5vdzpcblx0XHRcdGlmIChmbG9vcihpIC8gb3V0KSA+IG1heEludCAtIG4pIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdG4gKz0gZmxvb3IoaSAvIG91dCk7XG5cdFx0XHRpICU9IG91dDtcblxuXHRcdFx0Ly8gSW5zZXJ0IGBuYCBhdCBwb3NpdGlvbiBgaWAgb2YgdGhlIG91dHB1dFxuXHRcdFx0b3V0cHV0LnNwbGljZShpKyssIDAsIG4pO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHVjczJlbmNvZGUob3V0cHV0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMgdG8gYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seVxuXHQgKiBzeW1ib2xzLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgcmVzdWx0aW5nIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqL1xuXHRmdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcblx0XHR2YXIgbixcblx0XHQgICAgZGVsdGEsXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50LFxuXHRcdCAgICBiYXNpY0xlbmd0aCxcblx0XHQgICAgYmlhcyxcblx0XHQgICAgaixcblx0XHQgICAgbSxcblx0XHQgICAgcSxcblx0XHQgICAgayxcblx0XHQgICAgdCxcblx0XHQgICAgY3VycmVudFZhbHVlLFxuXHRcdCAgICBvdXRwdXQgPSBbXSxcblx0XHQgICAgLyoqIGBpbnB1dExlbmd0aGAgd2lsbCBob2xkIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgaW4gYGlucHV0YC4gKi9cblx0XHQgICAgaW5wdXRMZW5ndGgsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsXG5cdFx0ICAgIGJhc2VNaW51c1QsXG5cdFx0ICAgIHFNaW51c1Q7XG5cblx0XHQvLyBDb252ZXJ0IHRoZSBpbnB1dCBpbiBVQ1MtMiB0byBVbmljb2RlXG5cdFx0aW5wdXQgPSB1Y3MyZGVjb2RlKGlucHV0KTtcblxuXHRcdC8vIENhY2hlIHRoZSBsZW5ndGhcblx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblxuXHRcdC8vIEluaXRpYWxpemUgdGhlIHN0YXRlXG5cdFx0biA9IGluaXRpYWxOO1xuXHRcdGRlbHRhID0gMDtcblx0XHRiaWFzID0gaW5pdGlhbEJpYXM7XG5cblx0XHQvLyBIYW5kbGUgdGhlIGJhc2ljIGNvZGUgcG9pbnRzXG5cdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdGN1cnJlbnRWYWx1ZSA9IGlucHV0W2pdO1xuXHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IDB4ODApIHtcblx0XHRcdFx0b3V0cHV0LnB1c2goc3RyaW5nRnJvbUNoYXJDb2RlKGN1cnJlbnRWYWx1ZSkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGhhbmRsZWRDUENvdW50ID0gYmFzaWNMZW5ndGggPSBvdXRwdXQubGVuZ3RoO1xuXG5cdFx0Ly8gYGhhbmRsZWRDUENvdW50YCBpcyB0aGUgbnVtYmVyIG9mIGNvZGUgcG9pbnRzIHRoYXQgaGF2ZSBiZWVuIGhhbmRsZWQ7XG5cdFx0Ly8gYGJhc2ljTGVuZ3RoYCBpcyB0aGUgbnVtYmVyIG9mIGJhc2ljIGNvZGUgcG9pbnRzLlxuXG5cdFx0Ly8gRmluaXNoIHRoZSBiYXNpYyBzdHJpbmcgLSBpZiBpdCBpcyBub3QgZW1wdHkgLSB3aXRoIGEgZGVsaW1pdGVyXG5cdFx0aWYgKGJhc2ljTGVuZ3RoKSB7XG5cdFx0XHRvdXRwdXQucHVzaChkZWxpbWl0ZXIpO1xuXHRcdH1cblxuXHRcdC8vIE1haW4gZW5jb2RpbmcgbG9vcDpcblx0XHR3aGlsZSAoaGFuZGxlZENQQ291bnQgPCBpbnB1dExlbmd0aCkge1xuXG5cdFx0XHQvLyBBbGwgbm9uLWJhc2ljIGNvZGUgcG9pbnRzIDwgbiBoYXZlIGJlZW4gaGFuZGxlZCBhbHJlYWR5LiBGaW5kIHRoZSBuZXh0XG5cdFx0XHQvLyBsYXJnZXIgb25lOlxuXHRcdFx0Zm9yIChtID0gbWF4SW50LCBqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRcdGlmIChjdXJyZW50VmFsdWUgPj0gbiAmJiBjdXJyZW50VmFsdWUgPCBtKSB7XG5cdFx0XHRcdFx0bSA9IGN1cnJlbnRWYWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJbmNyZWFzZSBgZGVsdGFgIGVub3VnaCB0byBhZHZhbmNlIHRoZSBkZWNvZGVyJ3MgPG4saT4gc3RhdGUgdG8gPG0sMD4sXG5cdFx0XHQvLyBidXQgZ3VhcmQgYWdhaW5zdCBvdmVyZmxvd1xuXHRcdFx0aGFuZGxlZENQQ291bnRQbHVzT25lID0gaGFuZGxlZENQQ291bnQgKyAxO1xuXHRcdFx0aWYgKG0gLSBuID4gZmxvb3IoKG1heEludCAtIGRlbHRhKSAvIGhhbmRsZWRDUENvdW50UGx1c09uZSkpIHtcblx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHR9XG5cblx0XHRcdGRlbHRhICs9IChtIC0gbikgKiBoYW5kbGVkQ1BDb3VudFBsdXNPbmU7XG5cdFx0XHRuID0gbTtcblxuXHRcdFx0Zm9yIChqID0gMDsgaiA8IGlucHV0TGVuZ3RoOyArK2opIHtcblx0XHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA8IG4gJiYgKytkZWx0YSA+IG1heEludCkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA9PSBuKSB7XG5cdFx0XHRcdFx0Ly8gUmVwcmVzZW50IGRlbHRhIGFzIGEgZ2VuZXJhbGl6ZWQgdmFyaWFibGUtbGVuZ3RoIGludGVnZXJcblx0XHRcdFx0XHRmb3IgKHEgPSBkZWx0YSwgayA9IGJhc2U7IC8qIG5vIGNvbmRpdGlvbiAqLzsgayArPSBiYXNlKSB7XG5cdFx0XHRcdFx0XHR0ID0gayA8PSBiaWFzID8gdE1pbiA6IChrID49IGJpYXMgKyB0TWF4ID8gdE1heCA6IGsgLSBiaWFzKTtcblx0XHRcdFx0XHRcdGlmIChxIDwgdCkge1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHFNaW51c1QgPSBxIC0gdDtcblx0XHRcdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0XHRcdG91dHB1dC5wdXNoKFxuXHRcdFx0XHRcdFx0XHRzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHQgKyBxTWludXNUICUgYmFzZU1pbnVzVCwgMCkpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cSA9IGZsb29yKHFNaW51c1QgLyBiYXNlTWludXNUKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoZGlnaXRUb0Jhc2ljKHEsIDApKSk7XG5cdFx0XHRcdFx0YmlhcyA9IGFkYXB0KGRlbHRhLCBoYW5kbGVkQ1BDb3VudFBsdXNPbmUsIGhhbmRsZWRDUENvdW50ID09IGJhc2ljTGVuZ3RoKTtcblx0XHRcdFx0XHRkZWx0YSA9IDA7XG5cdFx0XHRcdFx0KytoYW5kbGVkQ1BDb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQrK2RlbHRhO1xuXHRcdFx0KytuO1xuXG5cdFx0fVxuXHRcdHJldHVybiBvdXRwdXQuam9pbignJyk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgZG9tYWluIG5hbWUgdG8gVW5pY29kZS4gT25seSB0aGVcblx0ICogUHVueWNvZGVkIHBhcnRzIG9mIHRoZSBkb21haW4gbmFtZSB3aWxsIGJlIGNvbnZlcnRlZCwgaS5lLiBpdCBkb2Vzbid0XG5cdCAqIG1hdHRlciBpZiB5b3UgY2FsbCBpdCBvbiBhIHN0cmluZyB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gY29udmVydGVkIHRvXG5cdCAqIFVuaWNvZGUuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBQdW55Y29kZSBkb21haW4gbmFtZSB0byBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoZG9tYWluKSB7XG5cdFx0cmV0dXJuIG1hcERvbWFpbihkb21haW4sIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4UHVueWNvZGUudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gZGVjb2RlKHN0cmluZy5zbGljZSg0KS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFVuaWNvZGUgc3RyaW5nIHJlcHJlc2VudGluZyBhIGRvbWFpbiBuYW1lIHRvIFB1bnljb2RlLiBPbmx5IHRoZVxuXHQgKiBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLCBpLmUuIGl0IGRvZXNuJ3Rcblx0ICogbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW4gQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gZG9tYWluIFRoZSBkb21haW4gbmFtZSB0byBjb252ZXJ0LCBhcyBhIFVuaWNvZGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfSBUaGUgUHVueWNvZGUgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGRvbWFpbiBuYW1lLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShkb21haW4pIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGRvbWFpbiwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gcmVnZXhOb25BU0NJSS50ZXN0KHN0cmluZylcblx0XHRcdFx0PyAneG4tLScgKyBlbmNvZGUoc3RyaW5nKVxuXHRcdFx0XHQ6IHN0cmluZztcblx0XHR9KTtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8qKiBEZWZpbmUgdGhlIHB1YmxpYyBBUEkgKi9cblx0cHVueWNvZGUgPSB7XG5cdFx0LyoqXG5cdFx0ICogQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IFB1bnljb2RlLmpzIHZlcnNpb24gbnVtYmVyLlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIFN0cmluZ1xuXHRcdCAqL1xuXHRcdCd2ZXJzaW9uJzogJzEuMi40Jyxcblx0XHQvKipcblx0XHQgKiBBbiBvYmplY3Qgb2YgbWV0aG9kcyB0byBjb252ZXJ0IGZyb20gSmF2YVNjcmlwdCdzIGludGVybmFsIGNoYXJhY3RlclxuXHRcdCAqIHJlcHJlc2VudGF0aW9uIChVQ1MtMikgdG8gVW5pY29kZSBjb2RlIHBvaW50cywgYW5kIGJhY2suXG5cdFx0ICogQHNlZSA8aHR0cDovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBPYmplY3Rcblx0XHQgKi9cblx0XHQndWNzMic6IHtcblx0XHRcdCdkZWNvZGUnOiB1Y3MyZGVjb2RlLFxuXHRcdFx0J2VuY29kZSc6IHVjczJlbmNvZGVcblx0XHR9LFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQndG9BU0NJSSc6IHRvQVNDSUksXG5cdFx0J3RvVW5pY29kZSc6IHRvVW5pY29kZVxuXHR9O1xuXG5cdC8qKiBFeHBvc2UgYHB1bnljb2RlYCAqL1xuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZSgncHVueWNvZGUnLCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBwdW55Y29kZTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gcHVueWNvZGU7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAoa2V5IGluIHB1bnljb2RlKSB7XG5cdFx0XHRcdHB1bnljb2RlLmhhc093blByb3BlcnR5KGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBwdW55Y29kZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LnB1bnljb2RlID0gcHVueWNvZGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyBJZiBvYmouaGFzT3duUHJvcGVydHkgaGFzIGJlZW4gb3ZlcnJpZGRlbiwgdGhlbiBjYWxsaW5nXG4vLyBvYmouaGFzT3duUHJvcGVydHkocHJvcCkgd2lsbCBicmVhay5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2lzc3Vlcy8xNzA3XG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHFzLCBzZXAsIGVxLCBvcHRpb25zKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICB2YXIgb2JqID0ge307XG5cbiAgaWYgKHR5cGVvZiBxcyAhPT0gJ3N0cmluZycgfHwgcXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciByZWdleHAgPSAvXFwrL2c7XG4gIHFzID0gcXMuc3BsaXQoc2VwKTtcblxuICB2YXIgbWF4S2V5cyA9IDEwMDA7XG4gIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLm1heEtleXMgPT09ICdudW1iZXInKSB7XG4gICAgbWF4S2V5cyA9IG9wdGlvbnMubWF4S2V5cztcbiAgfVxuXG4gIHZhciBsZW4gPSBxcy5sZW5ndGg7XG4gIC8vIG1heEtleXMgPD0gMCBtZWFucyB0aGF0IHdlIHNob3VsZCBub3QgbGltaXQga2V5cyBjb3VudFxuICBpZiAobWF4S2V5cyA+IDAgJiYgbGVuID4gbWF4S2V5cykge1xuICAgIGxlbiA9IG1heEtleXM7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgdmFyIHggPSBxc1tpXS5yZXBsYWNlKHJlZ2V4cCwgJyUyMCcpLFxuICAgICAgICBpZHggPSB4LmluZGV4T2YoZXEpLFxuICAgICAgICBrc3RyLCB2c3RyLCBrLCB2O1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBrc3RyID0geC5zdWJzdHIoMCwgaWR4KTtcbiAgICAgIHZzdHIgPSB4LnN1YnN0cihpZHggKyAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAga3N0ciA9IHg7XG4gICAgICB2c3RyID0gJyc7XG4gICAgfVxuXG4gICAgayA9IGRlY29kZVVSSUNvbXBvbmVudChrc3RyKTtcbiAgICB2ID0gZGVjb2RlVVJJQ29tcG9uZW50KHZzdHIpO1xuXG4gICAgaWYgKCFoYXNPd25Qcm9wZXJ0eShvYmosIGspKSB7XG4gICAgICBvYmpba10gPSB2O1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICBvYmpba10ucHVzaCh2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JqW2tdID0gW29ialtrXSwgdl07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHN0cmluZ2lmeVByaW1pdGl2ZSA9IGZ1bmN0aW9uKHYpIHtcbiAgc3dpdGNoICh0eXBlb2Ygdikge1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gdjtcblxuICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgcmV0dXJuIHYgPyAndHJ1ZScgOiAnZmFsc2UnO1xuXG4gICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIHJldHVybiBpc0Zpbml0ZSh2KSA/IHYgOiAnJztcblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gJyc7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLCBzZXAsIGVxLCBuYW1lKSB7XG4gIHNlcCA9IHNlcCB8fCAnJic7XG4gIGVxID0gZXEgfHwgJz0nO1xuICBpZiAob2JqID09PSBudWxsKSB7XG4gICAgb2JqID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIG1hcChvYmplY3RLZXlzKG9iaiksIGZ1bmN0aW9uKGspIHtcbiAgICAgIHZhciBrcyA9IGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUoaykpICsgZXE7XG4gICAgICBpZiAoaXNBcnJheShvYmpba10pKSB7XG4gICAgICAgIHJldHVybiBtYXAob2JqW2tdLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgcmV0dXJuIGtzICsgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZSh2KSk7XG4gICAgICAgIH0pLmpvaW4oc2VwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBrcyArIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUob2JqW2tdKSk7XG4gICAgICB9XG4gICAgfSkuam9pbihzZXApO1xuXG4gIH1cblxuICBpZiAoIW5hbWUpIHJldHVybiAnJztcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmdpZnlQcmltaXRpdmUobmFtZSkpICsgZXEgK1xuICAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHN0cmluZ2lmeVByaW1pdGl2ZShvYmopKTtcbn07XG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoeHMpIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG5mdW5jdGlvbiBtYXAgKHhzLCBmKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIHJlcy5wdXNoKGYoeHNbaV0sIGkpKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIHJlcy5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuZGVjb2RlID0gZXhwb3J0cy5wYXJzZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5leHBvcnRzLmVuY29kZSA9IGV4cG9ydHMuc3RyaW5naWZ5ID0gcmVxdWlyZSgnLi9lbmNvZGUnKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgcHVueWNvZGUgPSByZXF1aXJlKCdwdW55Y29kZScpO1xuXG5leHBvcnRzLnBhcnNlID0gdXJsUGFyc2U7XG5leHBvcnRzLnJlc29sdmUgPSB1cmxSZXNvbHZlO1xuZXhwb3J0cy5yZXNvbHZlT2JqZWN0ID0gdXJsUmVzb2x2ZU9iamVjdDtcbmV4cG9ydHMuZm9ybWF0ID0gdXJsRm9ybWF0O1xuXG5leHBvcnRzLlVybCA9IFVybDtcblxuZnVuY3Rpb24gVXJsKCkge1xuICB0aGlzLnByb3RvY29sID0gbnVsbDtcbiAgdGhpcy5zbGFzaGVzID0gbnVsbDtcbiAgdGhpcy5hdXRoID0gbnVsbDtcbiAgdGhpcy5ob3N0ID0gbnVsbDtcbiAgdGhpcy5wb3J0ID0gbnVsbDtcbiAgdGhpcy5ob3N0bmFtZSA9IG51bGw7XG4gIHRoaXMuaGFzaCA9IG51bGw7XG4gIHRoaXMuc2VhcmNoID0gbnVsbDtcbiAgdGhpcy5xdWVyeSA9IG51bGw7XG4gIHRoaXMucGF0aG5hbWUgPSBudWxsO1xuICB0aGlzLnBhdGggPSBudWxsO1xuICB0aGlzLmhyZWYgPSBudWxsO1xufVxuXG4vLyBSZWZlcmVuY2U6IFJGQyAzOTg2LCBSRkMgMTgwOCwgUkZDIDIzOTZcblxuLy8gZGVmaW5lIHRoZXNlIGhlcmUgc28gYXQgbGVhc3QgdGhleSBvbmx5IGhhdmUgdG8gYmVcbi8vIGNvbXBpbGVkIG9uY2Ugb24gdGhlIGZpcnN0IG1vZHVsZSBsb2FkLlxudmFyIHByb3RvY29sUGF0dGVybiA9IC9eKFthLXowLTkuKy1dKzopL2ksXG4gICAgcG9ydFBhdHRlcm4gPSAvOlswLTldKiQvLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgcmVzZXJ2ZWQgZm9yIGRlbGltaXRpbmcgVVJMcy5cbiAgICAvLyBXZSBhY3R1YWxseSBqdXN0IGF1dG8tZXNjYXBlIHRoZXNlLlxuICAgIGRlbGltcyA9IFsnPCcsICc+JywgJ1wiJywgJ2AnLCAnICcsICdcXHInLCAnXFxuJywgJ1xcdCddLFxuXG4gICAgLy8gUkZDIDIzOTY6IGNoYXJhY3RlcnMgbm90IGFsbG93ZWQgZm9yIHZhcmlvdXMgcmVhc29ucy5cbiAgICB1bndpc2UgPSBbJ3snLCAnfScsICd8JywgJ1xcXFwnLCAnXicsICdgJ10uY29uY2F0KGRlbGltcyksXG5cbiAgICAvLyBBbGxvd2VkIGJ5IFJGQ3MsIGJ1dCBjYXVzZSBvZiBYU1MgYXR0YWNrcy4gIEFsd2F5cyBlc2NhcGUgdGhlc2UuXG4gICAgYXV0b0VzY2FwZSA9IFsnXFwnJ10uY29uY2F0KHVud2lzZSksXG4gICAgLy8gQ2hhcmFjdGVycyB0aGF0IGFyZSBuZXZlciBldmVyIGFsbG93ZWQgaW4gYSBob3N0bmFtZS5cbiAgICAvLyBOb3RlIHRoYXQgYW55IGludmFsaWQgY2hhcnMgYXJlIGFsc28gaGFuZGxlZCwgYnV0IHRoZXNlXG4gICAgLy8gYXJlIHRoZSBvbmVzIHRoYXQgYXJlICpleHBlY3RlZCogdG8gYmUgc2Vlbiwgc28gd2UgZmFzdC1wYXRoXG4gICAgLy8gdGhlbS5cbiAgICBub25Ib3N0Q2hhcnMgPSBbJyUnLCAnLycsICc/JywgJzsnLCAnIyddLmNvbmNhdChhdXRvRXNjYXBlKSxcbiAgICBob3N0RW5kaW5nQ2hhcnMgPSBbJy8nLCAnPycsICcjJ10sXG4gICAgaG9zdG5hbWVNYXhMZW4gPSAyNTUsXG4gICAgaG9zdG5hbWVQYXJ0UGF0dGVybiA9IC9eW2EtejAtOUEtWl8tXXswLDYzfSQvLFxuICAgIGhvc3RuYW1lUGFydFN0YXJ0ID0gL14oW2EtejAtOUEtWl8tXXswLDYzfSkoLiopJC8sXG4gICAgLy8gcHJvdG9jb2xzIHRoYXQgY2FuIGFsbG93IFwidW5zYWZlXCIgYW5kIFwidW53aXNlXCIgY2hhcnMuXG4gICAgdW5zYWZlUHJvdG9jb2wgPSB7XG4gICAgICAnamF2YXNjcmlwdCc6IHRydWUsXG4gICAgICAnamF2YXNjcmlwdDonOiB0cnVlXG4gICAgfSxcbiAgICAvLyBwcm90b2NvbHMgdGhhdCBuZXZlciBoYXZlIGEgaG9zdG5hbWUuXG4gICAgaG9zdGxlc3NQcm90b2NvbCA9IHtcbiAgICAgICdqYXZhc2NyaXB0JzogdHJ1ZSxcbiAgICAgICdqYXZhc2NyaXB0Oic6IHRydWVcbiAgICB9LFxuICAgIC8vIHByb3RvY29scyB0aGF0IGFsd2F5cyBjb250YWluIGEgLy8gYml0LlxuICAgIHNsYXNoZWRQcm90b2NvbCA9IHtcbiAgICAgICdodHRwJzogdHJ1ZSxcbiAgICAgICdodHRwcyc6IHRydWUsXG4gICAgICAnZnRwJzogdHJ1ZSxcbiAgICAgICdnb3BoZXInOiB0cnVlLFxuICAgICAgJ2ZpbGUnOiB0cnVlLFxuICAgICAgJ2h0dHA6JzogdHJ1ZSxcbiAgICAgICdodHRwczonOiB0cnVlLFxuICAgICAgJ2Z0cDonOiB0cnVlLFxuICAgICAgJ2dvcGhlcjonOiB0cnVlLFxuICAgICAgJ2ZpbGU6JzogdHJ1ZVxuICAgIH0sXG4gICAgcXVlcnlzdHJpbmcgPSByZXF1aXJlKCdxdWVyeXN0cmluZycpO1xuXG5mdW5jdGlvbiB1cmxQYXJzZSh1cmwsIHBhcnNlUXVlcnlTdHJpbmcsIHNsYXNoZXNEZW5vdGVIb3N0KSB7XG4gIGlmICh1cmwgJiYgaXNPYmplY3QodXJsKSAmJiB1cmwgaW5zdGFuY2VvZiBVcmwpIHJldHVybiB1cmw7XG5cbiAgdmFyIHUgPSBuZXcgVXJsO1xuICB1LnBhcnNlKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpO1xuICByZXR1cm4gdTtcbn1cblxuVXJsLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKHVybCwgcGFyc2VRdWVyeVN0cmluZywgc2xhc2hlc0Rlbm90ZUhvc3QpIHtcbiAgaWYgKCFpc1N0cmluZyh1cmwpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlBhcmFtZXRlciAndXJsJyBtdXN0IGJlIGEgc3RyaW5nLCBub3QgXCIgKyB0eXBlb2YgdXJsKTtcbiAgfVxuXG4gIHZhciByZXN0ID0gdXJsO1xuXG4gIC8vIHRyaW0gYmVmb3JlIHByb2NlZWRpbmcuXG4gIC8vIFRoaXMgaXMgdG8gc3VwcG9ydCBwYXJzZSBzdHVmZiBsaWtlIFwiICBodHRwOi8vZm9vLmNvbSAgXFxuXCJcbiAgcmVzdCA9IHJlc3QudHJpbSgpO1xuXG4gIHZhciBwcm90byA9IHByb3RvY29sUGF0dGVybi5leGVjKHJlc3QpO1xuICBpZiAocHJvdG8pIHtcbiAgICBwcm90byA9IHByb3RvWzBdO1xuICAgIHZhciBsb3dlclByb3RvID0gcHJvdG8udG9Mb3dlckNhc2UoKTtcbiAgICB0aGlzLnByb3RvY29sID0gbG93ZXJQcm90bztcbiAgICByZXN0ID0gcmVzdC5zdWJzdHIocHJvdG8ubGVuZ3RoKTtcbiAgfVxuXG4gIC8vIGZpZ3VyZSBvdXQgaWYgaXQncyBnb3QgYSBob3N0XG4gIC8vIHVzZXJAc2VydmVyIGlzICphbHdheXMqIGludGVycHJldGVkIGFzIGEgaG9zdG5hbWUsIGFuZCB1cmxcbiAgLy8gcmVzb2x1dGlvbiB3aWxsIHRyZWF0IC8vZm9vL2JhciBhcyBob3N0PWZvbyxwYXRoPWJhciBiZWNhdXNlIHRoYXQnc1xuICAvLyBob3cgdGhlIGJyb3dzZXIgcmVzb2x2ZXMgcmVsYXRpdmUgVVJMcy5cbiAgaWYgKHNsYXNoZXNEZW5vdGVIb3N0IHx8IHByb3RvIHx8IHJlc3QubWF0Y2goL15cXC9cXC9bXkBcXC9dK0BbXkBcXC9dKy8pKSB7XG4gICAgdmFyIHNsYXNoZXMgPSByZXN0LnN1YnN0cigwLCAyKSA9PT0gJy8vJztcbiAgICBpZiAoc2xhc2hlcyAmJiAhKHByb3RvICYmIGhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dKSkge1xuICAgICAgcmVzdCA9IHJlc3Quc3Vic3RyKDIpO1xuICAgICAgdGhpcy5zbGFzaGVzID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhvc3RsZXNzUHJvdG9jb2xbcHJvdG9dICYmXG4gICAgICAoc2xhc2hlcyB8fCAocHJvdG8gJiYgIXNsYXNoZWRQcm90b2NvbFtwcm90b10pKSkge1xuXG4gICAgLy8gdGhlcmUncyBhIGhvc3RuYW1lLlxuICAgIC8vIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiAvLCA/LCA7LCBvciAjIGVuZHMgdGhlIGhvc3QuXG4gICAgLy9cbiAgICAvLyBJZiB0aGVyZSBpcyBhbiBAIGluIHRoZSBob3N0bmFtZSwgdGhlbiBub24taG9zdCBjaGFycyAqYXJlKiBhbGxvd2VkXG4gICAgLy8gdG8gdGhlIGxlZnQgb2YgdGhlIGxhc3QgQCBzaWduLCB1bmxlc3Mgc29tZSBob3N0LWVuZGluZyBjaGFyYWN0ZXJcbiAgICAvLyBjb21lcyAqYmVmb3JlKiB0aGUgQC1zaWduLlxuICAgIC8vIFVSTHMgYXJlIG9ibm94aW91cy5cbiAgICAvL1xuICAgIC8vIGV4OlxuICAgIC8vIGh0dHA6Ly9hQGJAYy8gPT4gdXNlcjphQGIgaG9zdDpjXG4gICAgLy8gaHR0cDovL2FAYj9AYyA9PiB1c2VyOmEgaG9zdDpjIHBhdGg6Lz9AY1xuXG4gICAgLy8gdjAuMTIgVE9ETyhpc2FhY3MpOiBUaGlzIGlzIG5vdCBxdWl0ZSBob3cgQ2hyb21lIGRvZXMgdGhpbmdzLlxuICAgIC8vIFJldmlldyBvdXIgdGVzdCBjYXNlIGFnYWluc3QgYnJvd3NlcnMgbW9yZSBjb21wcmVoZW5zaXZlbHkuXG5cbiAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBhbnkgaG9zdEVuZGluZ0NoYXJzXG4gICAgdmFyIGhvc3RFbmQgPSAtMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhvc3RFbmRpbmdDaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGhlYyA9IHJlc3QuaW5kZXhPZihob3N0RW5kaW5nQ2hhcnNbaV0pO1xuICAgICAgaWYgKGhlYyAhPT0gLTEgJiYgKGhvc3RFbmQgPT09IC0xIHx8IGhlYyA8IGhvc3RFbmQpKVxuICAgICAgICBob3N0RW5kID0gaGVjO1xuICAgIH1cblxuICAgIC8vIGF0IHRoaXMgcG9pbnQsIGVpdGhlciB3ZSBoYXZlIGFuIGV4cGxpY2l0IHBvaW50IHdoZXJlIHRoZVxuICAgIC8vIGF1dGggcG9ydGlvbiBjYW5ub3QgZ28gcGFzdCwgb3IgdGhlIGxhc3QgQCBjaGFyIGlzIHRoZSBkZWNpZGVyLlxuICAgIHZhciBhdXRoLCBhdFNpZ247XG4gICAgaWYgKGhvc3RFbmQgPT09IC0xKSB7XG4gICAgICAvLyBhdFNpZ24gY2FuIGJlIGFueXdoZXJlLlxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBhdFNpZ24gbXVzdCBiZSBpbiBhdXRoIHBvcnRpb24uXG4gICAgICAvLyBodHRwOi8vYUBiL2NAZCA9PiBob3N0OmIgYXV0aDphIHBhdGg6L2NAZFxuICAgICAgYXRTaWduID0gcmVzdC5sYXN0SW5kZXhPZignQCcsIGhvc3RFbmQpO1xuICAgIH1cblxuICAgIC8vIE5vdyB3ZSBoYXZlIGEgcG9ydGlvbiB3aGljaCBpcyBkZWZpbml0ZWx5IHRoZSBhdXRoLlxuICAgIC8vIFB1bGwgdGhhdCBvZmYuXG4gICAgaWYgKGF0U2lnbiAhPT0gLTEpIHtcbiAgICAgIGF1dGggPSByZXN0LnNsaWNlKDAsIGF0U2lnbik7XG4gICAgICByZXN0ID0gcmVzdC5zbGljZShhdFNpZ24gKyAxKTtcbiAgICAgIHRoaXMuYXV0aCA9IGRlY29kZVVSSUNvbXBvbmVudChhdXRoKTtcbiAgICB9XG5cbiAgICAvLyB0aGUgaG9zdCBpcyB0aGUgcmVtYWluaW5nIHRvIHRoZSBsZWZ0IG9mIHRoZSBmaXJzdCBub24taG9zdCBjaGFyXG4gICAgaG9zdEVuZCA9IC0xO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9uSG9zdENoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaGVjID0gcmVzdC5pbmRleE9mKG5vbkhvc3RDaGFyc1tpXSk7XG4gICAgICBpZiAoaGVjICE9PSAtMSAmJiAoaG9zdEVuZCA9PT0gLTEgfHwgaGVjIDwgaG9zdEVuZCkpXG4gICAgICAgIGhvc3RFbmQgPSBoZWM7XG4gICAgfVxuICAgIC8vIGlmIHdlIHN0aWxsIGhhdmUgbm90IGhpdCBpdCwgdGhlbiB0aGUgZW50aXJlIHRoaW5nIGlzIGEgaG9zdC5cbiAgICBpZiAoaG9zdEVuZCA9PT0gLTEpXG4gICAgICBob3N0RW5kID0gcmVzdC5sZW5ndGg7XG5cbiAgICB0aGlzLmhvc3QgPSByZXN0LnNsaWNlKDAsIGhvc3RFbmQpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKGhvc3RFbmQpO1xuXG4gICAgLy8gcHVsbCBvdXQgcG9ydC5cbiAgICB0aGlzLnBhcnNlSG9zdCgpO1xuXG4gICAgLy8gd2UndmUgaW5kaWNhdGVkIHRoYXQgdGhlcmUgaXMgYSBob3N0bmFtZSxcbiAgICAvLyBzbyBldmVuIGlmIGl0J3MgZW1wdHksIGl0IGhhcyB0byBiZSBwcmVzZW50LlxuICAgIHRoaXMuaG9zdG5hbWUgPSB0aGlzLmhvc3RuYW1lIHx8ICcnO1xuXG4gICAgLy8gaWYgaG9zdG5hbWUgYmVnaW5zIHdpdGggWyBhbmQgZW5kcyB3aXRoIF1cbiAgICAvLyBhc3N1bWUgdGhhdCBpdCdzIGFuIElQdjYgYWRkcmVzcy5cbiAgICB2YXIgaXB2Nkhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZVswXSA9PT0gJ1snICYmXG4gICAgICAgIHRoaXMuaG9zdG5hbWVbdGhpcy5ob3N0bmFtZS5sZW5ndGggLSAxXSA9PT0gJ10nO1xuXG4gICAgLy8gdmFsaWRhdGUgYSBsaXR0bGUuXG4gICAgaWYgKCFpcHY2SG9zdG5hbWUpIHtcbiAgICAgIHZhciBob3N0cGFydHMgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KC9cXC4vKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gaG9zdHBhcnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IGhvc3RwYXJ0c1tpXTtcbiAgICAgICAgaWYgKCFwYXJ0KSBjb250aW51ZTtcbiAgICAgICAgaWYgKCFwYXJ0Lm1hdGNoKGhvc3RuYW1lUGFydFBhdHRlcm4pKSB7XG4gICAgICAgICAgdmFyIG5ld3BhcnQgPSAnJztcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgayA9IHBhcnQubGVuZ3RoOyBqIDwgazsgaisrKSB7XG4gICAgICAgICAgICBpZiAocGFydC5jaGFyQ29kZUF0KGopID4gMTI3KSB7XG4gICAgICAgICAgICAgIC8vIHdlIHJlcGxhY2Ugbm9uLUFTQ0lJIGNoYXIgd2l0aCBhIHRlbXBvcmFyeSBwbGFjZWhvbGRlclxuICAgICAgICAgICAgICAvLyB3ZSBuZWVkIHRoaXMgdG8gbWFrZSBzdXJlIHNpemUgb2YgaG9zdG5hbWUgaXMgbm90XG4gICAgICAgICAgICAgIC8vIGJyb2tlbiBieSByZXBsYWNpbmcgbm9uLUFTQ0lJIGJ5IG5vdGhpbmdcbiAgICAgICAgICAgICAgbmV3cGFydCArPSAneCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBuZXdwYXJ0ICs9IHBhcnRbal07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIHRlc3QgYWdhaW4gd2l0aCBBU0NJSSBjaGFyIG9ubHlcbiAgICAgICAgICBpZiAoIW5ld3BhcnQubWF0Y2goaG9zdG5hbWVQYXJ0UGF0dGVybikpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZFBhcnRzID0gaG9zdHBhcnRzLnNsaWNlKDAsIGkpO1xuICAgICAgICAgICAgdmFyIG5vdEhvc3QgPSBob3N0cGFydHMuc2xpY2UoaSArIDEpO1xuICAgICAgICAgICAgdmFyIGJpdCA9IHBhcnQubWF0Y2goaG9zdG5hbWVQYXJ0U3RhcnQpO1xuICAgICAgICAgICAgaWYgKGJpdCkge1xuICAgICAgICAgICAgICB2YWxpZFBhcnRzLnB1c2goYml0WzFdKTtcbiAgICAgICAgICAgICAgbm90SG9zdC51bnNoaWZ0KGJpdFsyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm90SG9zdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmVzdCA9ICcvJyArIG5vdEhvc3Quam9pbignLicpICsgcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaG9zdG5hbWUgPSB2YWxpZFBhcnRzLmpvaW4oJy4nKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmhvc3RuYW1lLmxlbmd0aCA+IGhvc3RuYW1lTWF4TGVuKSB7XG4gICAgICB0aGlzLmhvc3RuYW1lID0gJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGhvc3RuYW1lcyBhcmUgYWx3YXlzIGxvd2VyIGNhc2UuXG4gICAgICB0aGlzLmhvc3RuYW1lID0gdGhpcy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cblxuICAgIGlmICghaXB2Nkhvc3RuYW1lKSB7XG4gICAgICAvLyBJRE5BIFN1cHBvcnQ6IFJldHVybnMgYSBwdW55IGNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIFwiZG9tYWluXCIuXG4gICAgICAvLyBJdCBvbmx5IGNvbnZlcnRzIHRoZSBwYXJ0IG9mIHRoZSBkb21haW4gbmFtZSB0aGF0XG4gICAgICAvLyBoYXMgbm9uIEFTQ0lJIGNoYXJhY3RlcnMuIEkuZS4gaXQgZG9zZW50IG1hdHRlciBpZlxuICAgICAgLy8geW91IGNhbGwgaXQgd2l0aCBhIGRvbWFpbiB0aGF0IGFscmVhZHkgaXMgaW4gQVNDSUkuXG4gICAgICB2YXIgZG9tYWluQXJyYXkgPSB0aGlzLmhvc3RuYW1lLnNwbGl0KCcuJyk7XG4gICAgICB2YXIgbmV3T3V0ID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRvbWFpbkFycmF5Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIHZhciBzID0gZG9tYWluQXJyYXlbaV07XG4gICAgICAgIG5ld091dC5wdXNoKHMubWF0Y2goL1teQS1aYS16MC05Xy1dLykgP1xuICAgICAgICAgICAgJ3huLS0nICsgcHVueWNvZGUuZW5jb2RlKHMpIDogcyk7XG4gICAgICB9XG4gICAgICB0aGlzLmhvc3RuYW1lID0gbmV3T3V0LmpvaW4oJy4nKTtcbiAgICB9XG5cbiAgICB2YXIgcCA9IHRoaXMucG9ydCA/ICc6JyArIHRoaXMucG9ydCA6ICcnO1xuICAgIHZhciBoID0gdGhpcy5ob3N0bmFtZSB8fCAnJztcbiAgICB0aGlzLmhvc3QgPSBoICsgcDtcbiAgICB0aGlzLmhyZWYgKz0gdGhpcy5ob3N0O1xuXG4gICAgLy8gc3RyaXAgWyBhbmQgXSBmcm9tIHRoZSBob3N0bmFtZVxuICAgIC8vIHRoZSBob3N0IGZpZWxkIHN0aWxsIHJldGFpbnMgdGhlbSwgdGhvdWdoXG4gICAgaWYgKGlwdjZIb3N0bmFtZSkge1xuICAgICAgdGhpcy5ob3N0bmFtZSA9IHRoaXMuaG9zdG5hbWUuc3Vic3RyKDEsIHRoaXMuaG9zdG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBpZiAocmVzdFswXSAhPT0gJy8nKSB7XG4gICAgICAgIHJlc3QgPSAnLycgKyByZXN0O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIG5vdyByZXN0IGlzIHNldCB0byB0aGUgcG9zdC1ob3N0IHN0dWZmLlxuICAvLyBjaG9wIG9mZiBhbnkgZGVsaW0gY2hhcnMuXG4gIGlmICghdW5zYWZlUHJvdG9jb2xbbG93ZXJQcm90b10pIHtcblxuICAgIC8vIEZpcnN0LCBtYWtlIDEwMCUgc3VyZSB0aGF0IGFueSBcImF1dG9Fc2NhcGVcIiBjaGFycyBnZXRcbiAgICAvLyBlc2NhcGVkLCBldmVuIGlmIGVuY29kZVVSSUNvbXBvbmVudCBkb2Vzbid0IHRoaW5rIHRoZXlcbiAgICAvLyBuZWVkIHRvIGJlLlxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXV0b0VzY2FwZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhZSA9IGF1dG9Fc2NhcGVbaV07XG4gICAgICB2YXIgZXNjID0gZW5jb2RlVVJJQ29tcG9uZW50KGFlKTtcbiAgICAgIGlmIChlc2MgPT09IGFlKSB7XG4gICAgICAgIGVzYyA9IGVzY2FwZShhZSk7XG4gICAgICB9XG4gICAgICByZXN0ID0gcmVzdC5zcGxpdChhZSkuam9pbihlc2MpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gY2hvcCBvZmYgZnJvbSB0aGUgdGFpbCBmaXJzdC5cbiAgdmFyIGhhc2ggPSByZXN0LmluZGV4T2YoJyMnKTtcbiAgaWYgKGhhc2ggIT09IC0xKSB7XG4gICAgLy8gZ290IGEgZnJhZ21lbnQgc3RyaW5nLlxuICAgIHRoaXMuaGFzaCA9IHJlc3Quc3Vic3RyKGhhc2gpO1xuICAgIHJlc3QgPSByZXN0LnNsaWNlKDAsIGhhc2gpO1xuICB9XG4gIHZhciBxbSA9IHJlc3QuaW5kZXhPZignPycpO1xuICBpZiAocW0gIT09IC0xKSB7XG4gICAgdGhpcy5zZWFyY2ggPSByZXN0LnN1YnN0cihxbSk7XG4gICAgdGhpcy5xdWVyeSA9IHJlc3Quc3Vic3RyKHFtICsgMSk7XG4gICAgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAgIHRoaXMucXVlcnkgPSBxdWVyeXN0cmluZy5wYXJzZSh0aGlzLnF1ZXJ5KTtcbiAgICB9XG4gICAgcmVzdCA9IHJlc3Quc2xpY2UoMCwgcW0pO1xuICB9IGVsc2UgaWYgKHBhcnNlUXVlcnlTdHJpbmcpIHtcbiAgICAvLyBubyBxdWVyeSBzdHJpbmcsIGJ1dCBwYXJzZVF1ZXJ5U3RyaW5nIHN0aWxsIHJlcXVlc3RlZFxuICAgIHRoaXMuc2VhcmNoID0gJyc7XG4gICAgdGhpcy5xdWVyeSA9IHt9O1xuICB9XG4gIGlmIChyZXN0KSB0aGlzLnBhdGhuYW1lID0gcmVzdDtcbiAgaWYgKHNsYXNoZWRQcm90b2NvbFtsb3dlclByb3RvXSAmJlxuICAgICAgdGhpcy5ob3N0bmFtZSAmJiAhdGhpcy5wYXRobmFtZSkge1xuICAgIHRoaXMucGF0aG5hbWUgPSAnLyc7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gIGlmICh0aGlzLnBhdGhuYW1lIHx8IHRoaXMuc2VhcmNoKSB7XG4gICAgdmFyIHAgPSB0aGlzLnBhdGhuYW1lIHx8ICcnO1xuICAgIHZhciBzID0gdGhpcy5zZWFyY2ggfHwgJyc7XG4gICAgdGhpcy5wYXRoID0gcCArIHM7XG4gIH1cblxuICAvLyBmaW5hbGx5LCByZWNvbnN0cnVjdCB0aGUgaHJlZiBiYXNlZCBvbiB3aGF0IGhhcyBiZWVuIHZhbGlkYXRlZC5cbiAgdGhpcy5ocmVmID0gdGhpcy5mb3JtYXQoKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBmb3JtYXQgYSBwYXJzZWQgb2JqZWN0IGludG8gYSB1cmwgc3RyaW5nXG5mdW5jdGlvbiB1cmxGb3JtYXQob2JqKSB7XG4gIC8vIGVuc3VyZSBpdCdzIGFuIG9iamVjdCwgYW5kIG5vdCBhIHN0cmluZyB1cmwuXG4gIC8vIElmIGl0J3MgYW4gb2JqLCB0aGlzIGlzIGEgbm8tb3AuXG4gIC8vIHRoaXMgd2F5LCB5b3UgY2FuIGNhbGwgdXJsX2Zvcm1hdCgpIG9uIHN0cmluZ3NcbiAgLy8gdG8gY2xlYW4gdXAgcG90ZW50aWFsbHkgd29ua3kgdXJscy5cbiAgaWYgKGlzU3RyaW5nKG9iaikpIG9iaiA9IHVybFBhcnNlKG9iaik7XG4gIGlmICghKG9iaiBpbnN0YW5jZW9mIFVybCkpIHJldHVybiBVcmwucHJvdG90eXBlLmZvcm1hdC5jYWxsKG9iaik7XG4gIHJldHVybiBvYmouZm9ybWF0KCk7XG59XG5cblVybC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBhdXRoID0gdGhpcy5hdXRoIHx8ICcnO1xuICBpZiAoYXV0aCkge1xuICAgIGF1dGggPSBlbmNvZGVVUklDb21wb25lbnQoYXV0aCk7XG4gICAgYXV0aCA9IGF1dGgucmVwbGFjZSgvJTNBL2ksICc6Jyk7XG4gICAgYXV0aCArPSAnQCc7XG4gIH1cblxuICB2YXIgcHJvdG9jb2wgPSB0aGlzLnByb3RvY29sIHx8ICcnLFxuICAgICAgcGF0aG5hbWUgPSB0aGlzLnBhdGhuYW1lIHx8ICcnLFxuICAgICAgaGFzaCA9IHRoaXMuaGFzaCB8fCAnJyxcbiAgICAgIGhvc3QgPSBmYWxzZSxcbiAgICAgIHF1ZXJ5ID0gJyc7XG5cbiAgaWYgKHRoaXMuaG9zdCkge1xuICAgIGhvc3QgPSBhdXRoICsgdGhpcy5ob3N0O1xuICB9IGVsc2UgaWYgKHRoaXMuaG9zdG5hbWUpIHtcbiAgICBob3N0ID0gYXV0aCArICh0aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSA9PT0gLTEgP1xuICAgICAgICB0aGlzLmhvc3RuYW1lIDpcbiAgICAgICAgJ1snICsgdGhpcy5ob3N0bmFtZSArICddJyk7XG4gICAgaWYgKHRoaXMucG9ydCkge1xuICAgICAgaG9zdCArPSAnOicgKyB0aGlzLnBvcnQ7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRoaXMucXVlcnkgJiZcbiAgICAgIGlzT2JqZWN0KHRoaXMucXVlcnkpICYmXG4gICAgICBPYmplY3Qua2V5cyh0aGlzLnF1ZXJ5KS5sZW5ndGgpIHtcbiAgICBxdWVyeSA9IHF1ZXJ5c3RyaW5nLnN0cmluZ2lmeSh0aGlzLnF1ZXJ5KTtcbiAgfVxuXG4gIHZhciBzZWFyY2ggPSB0aGlzLnNlYXJjaCB8fCAocXVlcnkgJiYgKCc/JyArIHF1ZXJ5KSkgfHwgJyc7XG5cbiAgaWYgKHByb3RvY29sICYmIHByb3RvY29sLnN1YnN0cigtMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIC8vIG9ubHkgdGhlIHNsYXNoZWRQcm90b2NvbHMgZ2V0IHRoZSAvLy4gIE5vdCBtYWlsdG86LCB4bXBwOiwgZXRjLlxuICAvLyB1bmxlc3MgdGhleSBoYWQgdGhlbSB0byBiZWdpbiB3aXRoLlxuICBpZiAodGhpcy5zbGFzaGVzIHx8XG4gICAgICAoIXByb3RvY29sIHx8IHNsYXNoZWRQcm90b2NvbFtwcm90b2NvbF0pICYmIGhvc3QgIT09IGZhbHNlKSB7XG4gICAgaG9zdCA9ICcvLycgKyAoaG9zdCB8fCAnJyk7XG4gICAgaWYgKHBhdGhuYW1lICYmIHBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nKSBwYXRobmFtZSA9ICcvJyArIHBhdGhuYW1lO1xuICB9IGVsc2UgaWYgKCFob3N0KSB7XG4gICAgaG9zdCA9ICcnO1xuICB9XG5cbiAgaWYgKGhhc2ggJiYgaGFzaC5jaGFyQXQoMCkgIT09ICcjJykgaGFzaCA9ICcjJyArIGhhc2g7XG4gIGlmIChzZWFyY2ggJiYgc2VhcmNoLmNoYXJBdCgwKSAhPT0gJz8nKSBzZWFyY2ggPSAnPycgKyBzZWFyY2g7XG5cbiAgcGF0aG5hbWUgPSBwYXRobmFtZS5yZXBsYWNlKC9bPyNdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChtYXRjaCk7XG4gIH0pO1xuICBzZWFyY2ggPSBzZWFyY2gucmVwbGFjZSgnIycsICclMjMnKTtcblxuICByZXR1cm4gcHJvdG9jb2wgKyBob3N0ICsgcGF0aG5hbWUgKyBzZWFyY2ggKyBoYXNoO1xufTtcblxuZnVuY3Rpb24gdXJsUmVzb2x2ZShzb3VyY2UsIHJlbGF0aXZlKSB7XG4gIHJldHVybiB1cmxQYXJzZShzb3VyY2UsIGZhbHNlLCB0cnVlKS5yZXNvbHZlKHJlbGF0aXZlKTtcbn1cblxuVXJsLnByb3RvdHlwZS5yZXNvbHZlID0gZnVuY3Rpb24ocmVsYXRpdmUpIHtcbiAgcmV0dXJuIHRoaXMucmVzb2x2ZU9iamVjdCh1cmxQYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpKS5mb3JtYXQoKTtcbn07XG5cbmZ1bmN0aW9uIHVybFJlc29sdmVPYmplY3Qoc291cmNlLCByZWxhdGl2ZSkge1xuICBpZiAoIXNvdXJjZSkgcmV0dXJuIHJlbGF0aXZlO1xuICByZXR1cm4gdXJsUGFyc2Uoc291cmNlLCBmYWxzZSwgdHJ1ZSkucmVzb2x2ZU9iamVjdChyZWxhdGl2ZSk7XG59XG5cblVybC5wcm90b3R5cGUucmVzb2x2ZU9iamVjdCA9IGZ1bmN0aW9uKHJlbGF0aXZlKSB7XG4gIGlmIChpc1N0cmluZyhyZWxhdGl2ZSkpIHtcbiAgICB2YXIgcmVsID0gbmV3IFVybCgpO1xuICAgIHJlbC5wYXJzZShyZWxhdGl2ZSwgZmFsc2UsIHRydWUpO1xuICAgIHJlbGF0aXZlID0gcmVsO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IG5ldyBVcmwoKTtcbiAgT2JqZWN0LmtleXModGhpcykuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgcmVzdWx0W2tdID0gdGhpc1trXTtcbiAgfSwgdGhpcyk7XG5cbiAgLy8gaGFzaCBpcyBhbHdheXMgb3ZlcnJpZGRlbiwgbm8gbWF0dGVyIHdoYXQuXG4gIC8vIGV2ZW4gaHJlZj1cIlwiIHdpbGwgcmVtb3ZlIGl0LlxuICByZXN1bHQuaGFzaCA9IHJlbGF0aXZlLmhhc2g7XG5cbiAgLy8gaWYgdGhlIHJlbGF0aXZlIHVybCBpcyBlbXB0eSwgdGhlbiB0aGVyZSdzIG5vdGhpbmcgbGVmdCB0byBkbyBoZXJlLlxuICBpZiAocmVsYXRpdmUuaHJlZiA9PT0gJycpIHtcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLy8gaHJlZnMgbGlrZSAvL2Zvby9iYXIgYWx3YXlzIGN1dCB0byB0aGUgcHJvdG9jb2wuXG4gIGlmIChyZWxhdGl2ZS5zbGFzaGVzICYmICFyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgIC8vIHRha2UgZXZlcnl0aGluZyBleGNlcHQgdGhlIHByb3RvY29sIGZyb20gcmVsYXRpdmVcbiAgICBPYmplY3Qua2V5cyhyZWxhdGl2ZSkuZm9yRWFjaChmdW5jdGlvbihrKSB7XG4gICAgICBpZiAoayAhPT0gJ3Byb3RvY29sJylcbiAgICAgICAgcmVzdWx0W2tdID0gcmVsYXRpdmVba107XG4gICAgfSk7XG5cbiAgICAvL3VybFBhcnNlIGFwcGVuZHMgdHJhaWxpbmcgLyB0byB1cmxzIGxpa2UgaHR0cDovL3d3dy5leGFtcGxlLmNvbVxuICAgIGlmIChzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXSAmJlxuICAgICAgICByZXN1bHQuaG9zdG5hbWUgJiYgIXJlc3VsdC5wYXRobmFtZSkge1xuICAgICAgcmVzdWx0LnBhdGggPSByZXN1bHQucGF0aG5hbWUgPSAnLyc7XG4gICAgfVxuXG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGlmIChyZWxhdGl2ZS5wcm90b2NvbCAmJiByZWxhdGl2ZS5wcm90b2NvbCAhPT0gcmVzdWx0LnByb3RvY29sKSB7XG4gICAgLy8gaWYgaXQncyBhIGtub3duIHVybCBwcm90b2NvbCwgdGhlbiBjaGFuZ2luZ1xuICAgIC8vIHRoZSBwcm90b2NvbCBkb2VzIHdlaXJkIHRoaW5nc1xuICAgIC8vIGZpcnN0LCBpZiBpdCdzIG5vdCBmaWxlOiwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBob3N0LFxuICAgIC8vIGFuZCBpZiB0aGVyZSB3YXMgYSBwYXRoXG4gICAgLy8gdG8gYmVnaW4gd2l0aCwgdGhlbiB3ZSBNVVNUIGhhdmUgYSBwYXRoLlxuICAgIC8vIGlmIGl0IGlzIGZpbGU6LCB0aGVuIHRoZSBob3N0IGlzIGRyb3BwZWQsXG4gICAgLy8gYmVjYXVzZSB0aGF0J3Mga25vd24gdG8gYmUgaG9zdGxlc3MuXG4gICAgLy8gYW55dGhpbmcgZWxzZSBpcyBhc3N1bWVkIHRvIGJlIGFic29sdXRlLlxuICAgIGlmICghc2xhc2hlZFByb3RvY29sW3JlbGF0aXZlLnByb3RvY29sXSkge1xuICAgICAgT2JqZWN0LmtleXMocmVsYXRpdmUpLmZvckVhY2goZnVuY3Rpb24oaykge1xuICAgICAgICByZXN1bHRba10gPSByZWxhdGl2ZVtrXTtcbiAgICAgIH0pO1xuICAgICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHJlc3VsdC5wcm90b2NvbCA9IHJlbGF0aXZlLnByb3RvY29sO1xuICAgIGlmICghcmVsYXRpdmUuaG9zdCAmJiAhaG9zdGxlc3NQcm90b2NvbFtyZWxhdGl2ZS5wcm90b2NvbF0pIHtcbiAgICAgIHZhciByZWxQYXRoID0gKHJlbGF0aXZlLnBhdGhuYW1lIHx8ICcnKS5zcGxpdCgnLycpO1xuICAgICAgd2hpbGUgKHJlbFBhdGgubGVuZ3RoICYmICEocmVsYXRpdmUuaG9zdCA9IHJlbFBhdGguc2hpZnQoKSkpO1xuICAgICAgaWYgKCFyZWxhdGl2ZS5ob3N0KSByZWxhdGl2ZS5ob3N0ID0gJyc7XG4gICAgICBpZiAoIXJlbGF0aXZlLmhvc3RuYW1lKSByZWxhdGl2ZS5ob3N0bmFtZSA9ICcnO1xuICAgICAgaWYgKHJlbFBhdGhbMF0gIT09ICcnKSByZWxQYXRoLnVuc2hpZnQoJycpO1xuICAgICAgaWYgKHJlbFBhdGgubGVuZ3RoIDwgMikgcmVsUGF0aC51bnNoaWZ0KCcnKTtcbiAgICAgIHJlc3VsdC5wYXRobmFtZSA9IHJlbFBhdGguam9pbignLycpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQucGF0aG5hbWUgPSByZWxhdGl2ZS5wYXRobmFtZTtcbiAgICB9XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgICByZXN1bHQuaG9zdCA9IHJlbGF0aXZlLmhvc3QgfHwgJyc7XG4gICAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoO1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3Q7XG4gICAgcmVzdWx0LnBvcnQgPSByZWxhdGl2ZS5wb3J0O1xuICAgIC8vIHRvIHN1cHBvcnQgaHR0cC5yZXF1ZXN0XG4gICAgaWYgKHJlc3VsdC5wYXRobmFtZSB8fCByZXN1bHQuc2VhcmNoKSB7XG4gICAgICB2YXIgcCA9IHJlc3VsdC5wYXRobmFtZSB8fCAnJztcbiAgICAgIHZhciBzID0gcmVzdWx0LnNlYXJjaCB8fCAnJztcbiAgICAgIHJlc3VsdC5wYXRoID0gcCArIHM7XG4gICAgfVxuICAgIHJlc3VsdC5zbGFzaGVzID0gcmVzdWx0LnNsYXNoZXMgfHwgcmVsYXRpdmUuc2xhc2hlcztcbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgdmFyIGlzU291cmNlQWJzID0gKHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuY2hhckF0KDApID09PSAnLycpLFxuICAgICAgaXNSZWxBYnMgPSAoXG4gICAgICAgICAgcmVsYXRpdmUuaG9zdCB8fFxuICAgICAgICAgIHJlbGF0aXZlLnBhdGhuYW1lICYmIHJlbGF0aXZlLnBhdGhuYW1lLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgICApLFxuICAgICAgbXVzdEVuZEFicyA9IChpc1JlbEFicyB8fCBpc1NvdXJjZUFicyB8fFxuICAgICAgICAgICAgICAgICAgICAocmVzdWx0Lmhvc3QgJiYgcmVsYXRpdmUucGF0aG5hbWUpKSxcbiAgICAgIHJlbW92ZUFsbERvdHMgPSBtdXN0RW5kQWJzLFxuICAgICAgc3JjUGF0aCA9IHJlc3VsdC5wYXRobmFtZSAmJiByZXN1bHQucGF0aG5hbWUuc3BsaXQoJy8nKSB8fCBbXSxcbiAgICAgIHJlbFBhdGggPSByZWxhdGl2ZS5wYXRobmFtZSAmJiByZWxhdGl2ZS5wYXRobmFtZS5zcGxpdCgnLycpIHx8IFtdLFxuICAgICAgcHN5Y2hvdGljID0gcmVzdWx0LnByb3RvY29sICYmICFzbGFzaGVkUHJvdG9jb2xbcmVzdWx0LnByb3RvY29sXTtcblxuICAvLyBpZiB0aGUgdXJsIGlzIGEgbm9uLXNsYXNoZWQgdXJsLCB0aGVuIHJlbGF0aXZlXG4gIC8vIGxpbmtzIGxpa2UgLi4vLi4gc2hvdWxkIGJlIGFibGVcbiAgLy8gdG8gY3Jhd2wgdXAgdG8gdGhlIGhvc3RuYW1lLCBhcyB3ZWxsLiAgVGhpcyBpcyBzdHJhbmdlLlxuICAvLyByZXN1bHQucHJvdG9jb2wgaGFzIGFscmVhZHkgYmVlbiBzZXQgYnkgbm93LlxuICAvLyBMYXRlciBvbiwgcHV0IHRoZSBmaXJzdCBwYXRoIHBhcnQgaW50byB0aGUgaG9zdCBmaWVsZC5cbiAgaWYgKHBzeWNob3RpYykge1xuICAgIHJlc3VsdC5ob3N0bmFtZSA9ICcnO1xuICAgIHJlc3VsdC5wb3J0ID0gbnVsbDtcbiAgICBpZiAocmVzdWx0Lmhvc3QpIHtcbiAgICAgIGlmIChzcmNQYXRoWzBdID09PSAnJykgc3JjUGF0aFswXSA9IHJlc3VsdC5ob3N0O1xuICAgICAgZWxzZSBzcmNQYXRoLnVuc2hpZnQocmVzdWx0Lmhvc3QpO1xuICAgIH1cbiAgICByZXN1bHQuaG9zdCA9ICcnO1xuICAgIGlmIChyZWxhdGl2ZS5wcm90b2NvbCkge1xuICAgICAgcmVsYXRpdmUuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmUucG9ydCA9IG51bGw7XG4gICAgICBpZiAocmVsYXRpdmUuaG9zdCkge1xuICAgICAgICBpZiAocmVsUGF0aFswXSA9PT0gJycpIHJlbFBhdGhbMF0gPSByZWxhdGl2ZS5ob3N0O1xuICAgICAgICBlbHNlIHJlbFBhdGgudW5zaGlmdChyZWxhdGl2ZS5ob3N0KTtcbiAgICAgIH1cbiAgICAgIHJlbGF0aXZlLmhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBtdXN0RW5kQWJzID0gbXVzdEVuZEFicyAmJiAocmVsUGF0aFswXSA9PT0gJycgfHwgc3JjUGF0aFswXSA9PT0gJycpO1xuICB9XG5cbiAgaWYgKGlzUmVsQWJzKSB7XG4gICAgLy8gaXQncyBhYnNvbHV0ZS5cbiAgICByZXN1bHQuaG9zdCA9IChyZWxhdGl2ZS5ob3N0IHx8IHJlbGF0aXZlLmhvc3QgPT09ICcnKSA/XG4gICAgICAgICAgICAgICAgICByZWxhdGl2ZS5ob3N0IDogcmVzdWx0Lmhvc3Q7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gKHJlbGF0aXZlLmhvc3RuYW1lIHx8IHJlbGF0aXZlLmhvc3RuYW1lID09PSAnJykgP1xuICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aXZlLmhvc3RuYW1lIDogcmVzdWx0Lmhvc3RuYW1lO1xuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgc3JjUGF0aCA9IHJlbFBhdGg7XG4gICAgLy8gZmFsbCB0aHJvdWdoIHRvIHRoZSBkb3QtaGFuZGxpbmcgYmVsb3cuXG4gIH0gZWxzZSBpZiAocmVsUGF0aC5sZW5ndGgpIHtcbiAgICAvLyBpdCdzIHJlbGF0aXZlXG4gICAgLy8gdGhyb3cgYXdheSB0aGUgZXhpc3RpbmcgZmlsZSwgYW5kIHRha2UgdGhlIG5ldyBwYXRoIGluc3RlYWQuXG4gICAgaWYgKCFzcmNQYXRoKSBzcmNQYXRoID0gW107XG4gICAgc3JjUGF0aC5wb3AoKTtcbiAgICBzcmNQYXRoID0gc3JjUGF0aC5jb25jYXQocmVsUGF0aCk7XG4gICAgcmVzdWx0LnNlYXJjaCA9IHJlbGF0aXZlLnNlYXJjaDtcbiAgICByZXN1bHQucXVlcnkgPSByZWxhdGl2ZS5xdWVyeTtcbiAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQocmVsYXRpdmUuc2VhcmNoKSkge1xuICAgIC8vIGp1c3QgcHVsbCBvdXQgdGhlIHNlYXJjaC5cbiAgICAvLyBsaWtlIGhyZWY9Jz9mb28nLlxuICAgIC8vIFB1dCB0aGlzIGFmdGVyIHRoZSBvdGhlciB0d28gY2FzZXMgYmVjYXVzZSBpdCBzaW1wbGlmaWVzIHRoZSBib29sZWFuc1xuICAgIGlmIChwc3ljaG90aWMpIHtcbiAgICAgIHJlc3VsdC5ob3N0bmFtZSA9IHJlc3VsdC5ob3N0ID0gc3JjUGF0aC5zaGlmdCgpO1xuICAgICAgLy9vY2NhdGlvbmFseSB0aGUgYXV0aCBjYW4gZ2V0IHN0dWNrIG9ubHkgaW4gaG9zdFxuICAgICAgLy90aGlzIGVzcGVjaWFseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAgIC8vdXJsLnJlc29sdmVPYmplY3QoJ21haWx0bzpsb2NhbDFAZG9tYWluMScsICdsb2NhbDJAZG9tYWluMicpXG4gICAgICB2YXIgYXV0aEluSG9zdCA9IHJlc3VsdC5ob3N0ICYmIHJlc3VsdC5ob3N0LmluZGV4T2YoJ0AnKSA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgICBpZiAoYXV0aEluSG9zdCkge1xuICAgICAgICByZXN1bHQuYXV0aCA9IGF1dGhJbkhvc3Quc2hpZnQoKTtcbiAgICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5zZWFyY2ggPSByZWxhdGl2ZS5zZWFyY2g7XG4gICAgcmVzdWx0LnF1ZXJ5ID0gcmVsYXRpdmUucXVlcnk7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmICghaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIWlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgICAgcmVzdWx0LnBhdGggPSAocmVzdWx0LnBhdGhuYW1lID8gcmVzdWx0LnBhdGhuYW1lIDogJycpICtcbiAgICAgICAgICAgICAgICAgICAgKHJlc3VsdC5zZWFyY2ggPyByZXN1bHQuc2VhcmNoIDogJycpO1xuICAgIH1cbiAgICByZXN1bHQuaHJlZiA9IHJlc3VsdC5mb3JtYXQoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgaWYgKCFzcmNQYXRoLmxlbmd0aCkge1xuICAgIC8vIG5vIHBhdGggYXQgYWxsLiAgZWFzeS5cbiAgICAvLyB3ZSd2ZSBhbHJlYWR5IGhhbmRsZWQgdGhlIG90aGVyIHN0dWZmIGFib3ZlLlxuICAgIHJlc3VsdC5wYXRobmFtZSA9IG51bGw7XG4gICAgLy90byBzdXBwb3J0IGh0dHAucmVxdWVzdFxuICAgIGlmIChyZXN1bHQuc2VhcmNoKSB7XG4gICAgICByZXN1bHQucGF0aCA9ICcvJyArIHJlc3VsdC5zZWFyY2g7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdC5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0LmhyZWYgPSByZXN1bHQuZm9ybWF0KCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8vIGlmIGEgdXJsIEVORHMgaW4gLiBvciAuLiwgdGhlbiBpdCBtdXN0IGdldCBhIHRyYWlsaW5nIHNsYXNoLlxuICAvLyBob3dldmVyLCBpZiBpdCBlbmRzIGluIGFueXRoaW5nIGVsc2Ugbm9uLXNsYXNoeSxcbiAgLy8gdGhlbiBpdCBtdXN0IE5PVCBnZXQgYSB0cmFpbGluZyBzbGFzaC5cbiAgdmFyIGxhc3QgPSBzcmNQYXRoLnNsaWNlKC0xKVswXTtcbiAgdmFyIGhhc1RyYWlsaW5nU2xhc2ggPSAoXG4gICAgICAocmVzdWx0Lmhvc3QgfHwgcmVsYXRpdmUuaG9zdCkgJiYgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSB8fFxuICAgICAgbGFzdCA9PT0gJycpO1xuXG4gIC8vIHN0cmlwIHNpbmdsZSBkb3RzLCByZXNvbHZlIGRvdWJsZSBkb3RzIHRvIHBhcmVudCBkaXJcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHNyY1BhdGgubGVuZ3RoOyBpID49IDA7IGktLSkge1xuICAgIGxhc3QgPSBzcmNQYXRoW2ldO1xuICAgIGlmIChsYXN0ID09ICcuJykge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBzcmNQYXRoLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgc3JjUGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cC0tO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSBwYXRoIGlzIGFsbG93ZWQgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIHJlc3RvcmUgbGVhZGluZyAuLnNcbiAgaWYgKCFtdXN0RW5kQWJzICYmICFyZW1vdmVBbGxEb3RzKSB7XG4gICAgZm9yICg7IHVwLS07IHVwKSB7XG4gICAgICBzcmNQYXRoLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKG11c3RFbmRBYnMgJiYgc3JjUGF0aFswXSAhPT0gJycgJiZcbiAgICAgICghc3JjUGF0aFswXSB8fCBzcmNQYXRoWzBdLmNoYXJBdCgwKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoaGFzVHJhaWxpbmdTbGFzaCAmJiAoc3JjUGF0aC5qb2luKCcvJykuc3Vic3RyKC0xKSAhPT0gJy8nKSkge1xuICAgIHNyY1BhdGgucHVzaCgnJyk7XG4gIH1cblxuICB2YXIgaXNBYnNvbHV0ZSA9IHNyY1BhdGhbMF0gPT09ICcnIHx8XG4gICAgICAoc3JjUGF0aFswXSAmJiBzcmNQYXRoWzBdLmNoYXJBdCgwKSA9PT0gJy8nKTtcblxuICAvLyBwdXQgdGhlIGhvc3QgYmFja1xuICBpZiAocHN5Y2hvdGljKSB7XG4gICAgcmVzdWx0Lmhvc3RuYW1lID0gcmVzdWx0Lmhvc3QgPSBpc0Fic29sdXRlID8gJycgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjUGF0aC5sZW5ndGggPyBzcmNQYXRoLnNoaWZ0KCkgOiAnJztcbiAgICAvL29jY2F0aW9uYWx5IHRoZSBhdXRoIGNhbiBnZXQgc3R1Y2sgb25seSBpbiBob3N0XG4gICAgLy90aGlzIGVzcGVjaWFseSBoYXBwZW5zIGluIGNhc2VzIGxpa2VcbiAgICAvL3VybC5yZXNvbHZlT2JqZWN0KCdtYWlsdG86bG9jYWwxQGRvbWFpbjEnLCAnbG9jYWwyQGRvbWFpbjInKVxuICAgIHZhciBhdXRoSW5Ib3N0ID0gcmVzdWx0Lmhvc3QgJiYgcmVzdWx0Lmhvc3QuaW5kZXhPZignQCcpID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICByZXN1bHQuaG9zdC5zcGxpdCgnQCcpIDogZmFsc2U7XG4gICAgaWYgKGF1dGhJbkhvc3QpIHtcbiAgICAgIHJlc3VsdC5hdXRoID0gYXV0aEluSG9zdC5zaGlmdCgpO1xuICAgICAgcmVzdWx0Lmhvc3QgPSByZXN1bHQuaG9zdG5hbWUgPSBhdXRoSW5Ib3N0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgbXVzdEVuZEFicyA9IG11c3RFbmRBYnMgfHwgKHJlc3VsdC5ob3N0ICYmIHNyY1BhdGgubGVuZ3RoKTtcblxuICBpZiAobXVzdEVuZEFicyAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHNyY1BhdGgudW5zaGlmdCgnJyk7XG4gIH1cblxuICBpZiAoIXNyY1BhdGgubGVuZ3RoKSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gbnVsbDtcbiAgICByZXN1bHQucGF0aCA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmVzdWx0LnBhdGhuYW1lID0gc3JjUGF0aC5qb2luKCcvJyk7XG4gIH1cblxuICAvL3RvIHN1cHBvcnQgcmVxdWVzdC5odHRwXG4gIGlmICghaXNOdWxsKHJlc3VsdC5wYXRobmFtZSkgfHwgIWlzTnVsbChyZXN1bHQuc2VhcmNoKSkge1xuICAgIHJlc3VsdC5wYXRoID0gKHJlc3VsdC5wYXRobmFtZSA/IHJlc3VsdC5wYXRobmFtZSA6ICcnKSArXG4gICAgICAgICAgICAgICAgICAocmVzdWx0LnNlYXJjaCA/IHJlc3VsdC5zZWFyY2ggOiAnJyk7XG4gIH1cbiAgcmVzdWx0LmF1dGggPSByZWxhdGl2ZS5hdXRoIHx8IHJlc3VsdC5hdXRoO1xuICByZXN1bHQuc2xhc2hlcyA9IHJlc3VsdC5zbGFzaGVzIHx8IHJlbGF0aXZlLnNsYXNoZXM7XG4gIHJlc3VsdC5ocmVmID0gcmVzdWx0LmZvcm1hdCgpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcblxuVXJsLnByb3RvdHlwZS5wYXJzZUhvc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGhvc3QgPSB0aGlzLmhvc3Q7XG4gIHZhciBwb3J0ID0gcG9ydFBhdHRlcm4uZXhlYyhob3N0KTtcbiAgaWYgKHBvcnQpIHtcbiAgICBwb3J0ID0gcG9ydFswXTtcbiAgICBpZiAocG9ydCAhPT0gJzonKSB7XG4gICAgICB0aGlzLnBvcnQgPSBwb3J0LnN1YnN0cigxKTtcbiAgICB9XG4gICAgaG9zdCA9IGhvc3Quc3Vic3RyKDAsIGhvc3QubGVuZ3RoIC0gcG9ydC5sZW5ndGgpO1xuICB9XG4gIGlmIChob3N0KSB0aGlzLmhvc3RuYW1lID0gaG9zdDtcbn07XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gXCJzdHJpbmdcIjtcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gIGFyZyA9PSBudWxsO1xufVxuIiwiZnVuY3Rpb24gTG9naW5DdHJsKCRhdXRoLCAkbm90aWNlKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuZXJyb3JNZXNzYWdlID0gZmFsc2U7XG5cbiAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uICgkdmFsaWQsIHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICRhdXRoLmxvZ2luKHt1c2VybmFtZTogdXNlcm5hbWUsIHBhc3N3b3JkOiBwYXNzd29yZH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLmVycm9yTWVzc2FnZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAkbm90aWNlLnNob3coJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBsb2dnZWQgaW4nKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICBfdGhpcy5lcnJvck1lc3NhZ2UgPSByZXNwb25zZS5kYXRhLm1lc3NhZ2U7XG4gICAgICAgICAgICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTG9nb3V0Q3RybCgkYXV0aCwgJG5vdGljZSkge1xuICAkYXV0aC5sb2dvdXQoKVxuICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRub3RpY2Uuc2hvdygnWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0Jyk7XG4gICAgICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIFByb2ZpbGVDdHJsKHByb2ZpbGUpIHtcbiAgdGhpcy5wcm9maWxlID0gcHJvZmlsZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIExvZ2luQ3RybDogTG9naW5DdHJsLFxuICBMb2dvdXRDdHJsOiBMb2dvdXRDdHJsLFxuICBQcm9maWxlQ3RybDogUHJvZmlsZUN0cmxcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21kLmF1dGgnLCBbXSlcbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5Mb2dpbkN0cmwpXG4gIC5jb250cm9sbGVyKCdMb2dvdXRDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLkxvZ291dEN0cmwpXG4gIC5jb250cm9sbGVyKCdQcm9maWxlQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5Qcm9maWxlQ3RybClcbiAgLmZhY3RvcnkoJ01kUHJvZmlsZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5Qcm9maWxlKTtcblxucmVxdWlyZSgnLi9zdGF0ZXMnKTtcbnJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vc2VydmljZXMnKTtcbnJlcXVpcmUoJy4vaW50ZXJjZXB0b3JzJyk7XG5cbiIsImZ1bmN0aW9uIEF1dGh6UmVzcG9uc2VSZWRpcmVjdCgkcSwgJGluamVjdG9yKSB7XG5cbiAgcmV0dXJuIHtcbiAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbiAocmVqZWN0aW9uKSB7XG4gICAgICB2YXJcbiAgICAgICAgJHN0YXRlID0gJGluamVjdG9yLmdldCgnJHN0YXRlJyksXG4gICAgICAgICRub3RpY2UgPSAkaW5qZWN0b3IuZ2V0KCckbm90aWNlJyk7XG5cbiAgICAgIC8vIFdlIGNhbiBnZXQgYW4gL2FwaS8gcmVzcG9uc2Ugb2YgZm9yYmlkZGVuIGZvclxuICAgICAgLy8gc29tZSBkYXRhIG5lZWRlZCBpbiBhIHZpZXcuIEZsYXNoIGEgbm90aWNlIHNheWluZyB0aGF0IHRoaXNcbiAgICAgIC8vIGRhdGEgd2FzIHJlcXVlc3RlZC5cbiAgICAgIHZhciB1cmwgPSByZWplY3Rpb24uY29uZmlnLnVybDtcbiAgICAgIGlmIChyZWplY3Rpb24uc3RhdHVzID09IDQwMyB8fCByZWplY3Rpb24uc3RhdHVzID09IDQwMSkge1xuICAgICAgICAvLyBSZWRpcmVjdCB0byB0aGUgbG9naW4gZm9ybVxuICAgICAgICAkc3RhdGUuZ28oJ2F1dGgubG9naW4nKTtcbiAgICAgICAgdmFyIG1zZyA9ICdMb2dpbiByZXF1aXJlZCBmb3IgZGF0YSBhdDogJyArIHVybDtcbiAgICAgICAgJG5vdGljZS5zaG93KG1zZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHEucmVqZWN0KHJlamVjdGlvbik7XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJGh0dHBQcm92aWRlciwgJGF1dGhQcm92aWRlcikge1xuICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKCdhdXRoelJlZGlyZWN0Jyk7XG5cbiAgdmFyIGJhc2VVcmwgPSAnJztcblxuICAvLyBTYXRlbGxpemVyIHNldHVwXG4gICRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBiYXNlVXJsICsgJy9hcGkvYXV0aC9sb2dpbic7XG59XG5cbmZ1bmN0aW9uIE1vZHVsZVJ1bigkcm9vdFNjb3BlLCAkc3RhdGUsICRhdXRoLCAkbm90aWNlKSB7XG4gIC8vIEEgc3RhdGUgY2FuIGJlIGFubm90YXRlZCB3aXRoIGEgdmFsdWUgaW5kaWNhdGluZ1xuICAvLyB0aGUgc3RhdGUgcmVxdWlyZXMgbG9naW4uXG5cbiAgJHJvb3RTY29wZS4kb24oXG4gICAgXCIkc3RhdGVDaGFuZ2VTdGFydFwiLFxuICAgIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSkge1xuICAgICAgaWYgKHRvU3RhdGUuYXV0aGVudGljYXRlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAvLyBVc2VyIGlzbuKAmXQgYXV0aGVudGljYXRlZCBhbmQgdGhpcyBzdGF0ZSB3YW50cyBhdXRoXG4gICAgICAgIHZhciB0ID0gdG9TdGF0ZS50aXRsZSB8fCB0b1N0YXRlLm5hbWU7XG4gICAgICAgIHZhciBtc2cgPSAnVGhlIHBhZ2UgJyArIHQgKyAnIHJlcXVpcmVzIGEgbG9naW4nO1xuICAgICAgICAkbm90aWNlLnNob3cobXNnKVxuICAgICAgICAkc3RhdGUudHJhbnNpdGlvblRvKFwiYXV0aC5sb2dpblwiKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9KTtcbn1cblxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuZmFjdG9yeSgnYXV0aHpSZWRpcmVjdCcsIEF1dGh6UmVzcG9uc2VSZWRpcmVjdClcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5ydW4oTW9kdWxlUnVuKTsiLCJmdW5jdGlvbiBQcm9maWxlKFJlc3Rhbmd1bGFyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UHJvZmlsZTogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLm9uZSgnL2FwaS9hdXRoL21lJykuZ2V0KCk7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUHJvZmlsZTogUHJvZmlsZVxufTtcbiIsImZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXV0aCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvYXV0aCcsXG4gICAgICAgICAgICAgcGFyZW50OiAncm9vdCdcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2F1dGgubG9naW4nLCB7XG4gICAgICAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xvZ2luLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ2F1dGgubG9nb3V0Jywge1xuICAgICAgICAgICAgIHVybDogJy9sb2dvdXQnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG9nb3V0Q3RybCBhcyBjdHJsJyxcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xvZ291dC5odG1sJylcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdhdXRoLnByb2ZpbGUnLCB7XG4gICAgICAgICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgICAgICAgIC8vYXV0aGVudGljYXRlOiB0cnVlLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvcHJvZmlsZS5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9maWxlQ3RybCBhcyBjdHJsJ1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgcHJvZmlsZTogZnVuY3Rpb24gKE1kUHJvZmlsZSkge1xuICAgICAgICAgICAgICAgICByZXR1cm4gTWRQcm9maWxlLmdldFByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbW9vbmRhc2gnKVxuICAuY29uZmlnKE1vZHVsZUNvbmZpZyk7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgPGRpdiBjbGFzcz1cImNvbC1tZC1vZmZzZXQtMyBjb2wtbWQtNCB0ZXh0LWNlbnRlclwiPlxcbiAgICA8ZGl2IGNsYXNzPVwicGFuZWwtYm9keVwiPlxcbiAgICAgIDxoMiBjbGFzcz1cInRleHQtY2VudGVyXCI+TG9jYWwgTG9naW48L2gyPlxcblxcbiAgICAgIDxmb3JtIG1ldGhvZD1cInBvc3RcIlxcblxcbiAgICAgICAgICAgIG5nLWluaXQ9XCJ1c2VybmFtZT1cXCdhZG1pblxcJztwYXNzd29yZD1cXCcxXFwnXCJcXG5cXG4gICAgICAgICAgICBuZy1zdWJtaXQ9XCJjdHJsLmxvZ2luKGxvZ2luRm9ybS4kdmFsaWQsIHVzZXJuYW1lLCBwYXNzd29yZClcIlxcbiAgICAgICAgICAgIG5hbWU9XCJsb2dpbkZvcm1cIj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJhbGVydCBhbGVydC1kYW5nZXJcIiByb2xlPVwiYWxlcnRcIlxcbiAgICAgICAgICAgIG5nLWlmPVwiY3RybC5lcnJvck1lc3NhZ2VcIlxcbiAgICAgICAgICAgIG5nLWJpbmQ9XCJjdHJsLmVycm9yTWVzc2FnZVwiPkVycm9yIG1lc3NhZ2U8L2Rpdj5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJmb3JtLWdyb3VwXCI+XFxuICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC1sZ1wiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInVzZXJuYW1lXCJcXG4gICAgICAgICAgICAgICAgIG5nLW1vZGVsPVwidXNlcm5hbWVcIiBwbGFjZWhvbGRlcj1cIlVzZXJuYW1lXCIgcmVxdWlyZWRcXG4gICAgICAgICAgICAgICAgIGF1dG9mb2N1cz5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPGRpdiBjbGFzcz1cImZvcm0tZ3JvdXAgaGFzLWZlZWRiYWNrXCI+XFxuICAgICAgICAgIDxpbnB1dCBjbGFzcz1cImZvcm0tY29udHJvbCBpbnB1dC1sZ1wiIHR5cGU9XCJwYXNzd29yZFwiXFxuICAgICAgICAgICAgICAgICBuYW1lPVwicGFzc3dvcmRcIiBuZy1tb2RlbD1cInBhc3N3b3JkXCJcXG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiUGFzc3dvcmRcIiByZXF1aXJlZD5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgbmctZGlzYWJsZWQ9XCJsb2dpbkZvcm0uJGludmFsaWRcIlxcbiAgICAgICAgICAgICAgICBjbGFzcz1cImJ0biBidG4tbGcgIGJ0bi1ibG9jayBidG4tc3VjY2Vzc1wiPkxvZyBpblxcbiAgICAgICAgPC9idXR0b24+XFxuXFxuICAgICAgPC9mb3JtPlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGgxPkxvZ2dlZCBPdXQ8L2gxPlxcbjxwPllvdSBoYXZlIGJlZW4gbG9nZ2VkIG91dC48L3A+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XFxuICA8ZGl2IGNsYXNzPVwicm93XCI+XFxuICAgIDxkaXYgY2xhc3M9XCJjb2wtbWQtM1wiPlxcbiAgICAgIDxoMiBjbGFzcz1cInRleHQtY2VudGVyXCI+UHJvZmlsZTwvaDI+XFxuXFxuICAgICAgPHAgbmctaWY9XCJjdHJsLnByb2ZpbGVcIj5cXG5cXG4gICAgICAgIDxkaXY+aWQ6IHt7IGN0cmwucHJvZmlsZS5pZCB9fTwvZGl2PlxcbiAgICAgICAgPGRpdj50d2l0dGVyOiB7eyBjdHJsLnByb2ZpbGUudHdpdHRlciB9fTwvZGl2PlxcbiAgICAgICAgPGRpdj5GaXJzdCBOYW1lOiB7eyBjdHJsLnByb2ZpbGUuZmlyc3RfbmFtZSB9fTwvZGl2PlxcbiAgICAgICAgPGRpdj5MYXN0IE5hbWU6IHt7IGN0cmwucHJvZmlsZS5sYXN0X25hbWUgfX08L2Rpdj5cXG4gICAgICAgIDxkaXY+RW1haWw6IHt7IGN0cmwucHJvZmlsZS5lbWFpbCB9fTwvZGl2PlxcbiAgICAgIDwvcD5cXG5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG4nOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG5cbmZ1bmN0aW9uIE9yZGVyT2JqZWN0QnlGaWx0ZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaXRlbXMsIGZpZWxkLCByZXZlcnNlKSB7XG4gICAgdmFyIGZpbHRlcmVkID0gW107XG4gICAgXyhpdGVtcykuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgZmlsdGVyZWQucHVzaChpdGVtKTtcbiAgICB9KTtcbiAgICBmdW5jdGlvbiBpbmRleChvYmosIGkpIHtcbiAgICAgIHJldHVybiBvYmpbaV07XG4gICAgfVxuXG4gICAgZmlsdGVyZWQuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgdmFyIGNvbXBhcmF0b3I7XG4gICAgICB2YXIgcmVkdWNlZEEgPSBmaWVsZC5zcGxpdCgnLicpLnJlZHVjZShpbmRleCwgYSk7XG4gICAgICB2YXIgcmVkdWNlZEIgPSBmaWVsZC5zcGxpdCgnLicpLnJlZHVjZShpbmRleCwgYik7XG4gICAgICBpZiAocmVkdWNlZEEgPT09IHJlZHVjZWRCKSB7XG4gICAgICAgIGNvbXBhcmF0b3IgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcGFyYXRvciA9IChyZWR1Y2VkQSA+IHJlZHVjZWRCID8gMSA6IC0xKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb21wYXJhdG9yO1xuICAgIH0pO1xuICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICBmaWx0ZXJlZC5yZXZlcnNlKCk7XG4gICAgfVxuICAgIHJldHVybiBmaWx0ZXJlZDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgT3JkZXJPYmplY3RCeUZpbHRlcjogT3JkZXJPYmplY3RCeUZpbHRlclxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGFuZ3VsYXIgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5hbmd1bGFyIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5hbmd1bGFyIDogbnVsbCk7XG5cbmFuZ3VsYXIubW9kdWxlKCdtZC5jb21tb24nLCBbXSlcbiAgLmZpbHRlcignbWRPcmRlck9iamVjdEJ5JywgcmVxdWlyZSgnLi9maWx0ZXJzJykuT3JkZXJPYmplY3RCeUZpbHRlcik7XG5cbi8vIEphbW1pbmcgdGhpcyBvbiBoZXJlLiBQYXRjaGluZyBTdHJpbmcucHJvdG90eXBlIHRvIGFkZCBzb21lXG4vLyB1dGlsaXR5IGZ1bmN0aW9ucyB0aGF0IGFyZW4ndCBpbiBsb2Rhc2ggKGFuZCBJIGRvbid0IHdhbnQgdG9cbi8vIGFkZCA3S2IgbWluaWZpZWQgdG8gZ2V0IHVuZGVyc2NvcmUuc3RyaW5nLilcblxuaWYgKHR5cGVvZiBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggIT0gJ2Z1bmN0aW9uJykge1xuICBTdHJpbmcucHJvdG90eXBlLnN0YXJ0c1dpdGggPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgcmV0dXJuIHRoaXMuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGgpID09PSBzdHI7XG4gIH1cbn1cblxuaWYgKHR5cGVvZiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoICE9ICdmdW5jdGlvbicpIHtcbiAgU3RyaW5nLnByb3RvdHlwZS5lbmRzV2l0aCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICByZXR1cm4gdGhpcy5zdWJzdHJpbmcodGhpcy5sZW5ndGggLSBzdHIubGVuZ3RoLCB0aGlzLmxlbmd0aCkgPT09IHN0cjtcbiAgfVxufVxuIiwiZnVuY3Rpb24gSW5pdEN0cmwoUmVzdGFuZ3VsYXIsIE1kQ29uZmlnLCBNZE5hdiwgTWRSVHlwZXMsIE1kU2NoZW1hcywgTWRGb3Jtcykge1xuICAgIFJlc3Rhbmd1bGFyLm9uZSgnZnVsbC9zaXRlY29uZmlnLmpzb24nKS5nZXQoKVxuICAgICAgLnRoZW4oXG4gICAgICBmdW5jdGlvbiAoc2l0ZWNvbmZpZykge1xuXG4gICAgICAgIC8vIFNldCB0aGUgc2l0ZSBuYW1lXG4gICAgICAgIE1kQ29uZmlnLnNpdGUubmFtZSA9IHNpdGVjb25maWcuc2l0ZS5uYW1lO1xuXG4gICAgICAgIC8vIEFkZCByZXNvdXJjZSB0eXBlcyBhbmQgbmF2IG1lbnVzXG4gICAgICAgIE1kUlR5cGVzLmluaXQoc2l0ZWNvbmZpZy5ydHlwZXMpO1xuICAgICAgICBNZE5hdi5pbml0KHNpdGVjb25maWcubmF2TWVudXMpO1xuICAgICAgICBNZEZvcm1zLmluaXQoc2l0ZWNvbmZpZy5mb3Jtcyk7XG4gICAgICAgIE1kU2NoZW1hcy5pbml0KHNpdGVjb25maWcuc2NoZW1hcyk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGZhaWx1cmUpIHtcbiAgICAgICAgdmFyIG1zZyA9ICdGYWlsZWQgdG8gZ2V0IHNpdGVjb25maWcuanNvbic7XG4gICAgICAgICRub3RpY2Uuc2hvdyhtc2cpO1xuICAgICAgfSk7XG59XG5cbmZ1bmN0aW9uIEluaXQgKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgdGVtcGxhdGU6ICcnLFxuICAgIHNjb3BlOiB7XG4gICAgICB1cmw6ICdAbWRJbml0J1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogSW5pdEN0cmwsXG4gICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICB9O1xufVxuXG5hbmd1bGFyLm1vZHVsZSgnbWQuY29uZmlnJylcbiAgLmRpcmVjdGl2ZSgnbWRJbml0JywgSW5pdCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21kLmNvbmZpZycsIFtdKTtcblxucmVxdWlyZSgnLi9zZXJ2aWNlcycpO1xucmVxdWlyZSgnLi9kaXJlY3RpdmVzJyk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTWRDb25maWcoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgdGhpcy5zaXRlID0ge25hbWU6ICdNb29uZGFzaCd9O1xuXG59XG5cbmFuZ3VsYXIubW9kdWxlKFwibW9vbmRhc2hcIilcbiAgLnNlcnZpY2UoJ01kQ29uZmlnJywgTWRDb25maWcpOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gRGlzcGF0Y2hlckN0cmwoJHN0YXRlLCByZXNvbHZlZFBhdGgsIE1kRGlzcGF0Y2hlcikge1xuXG4gIC8qXG5cbiAgIHJlc29sdmVkUGF0aCB3aWxsIHJldHVybiBhIGRpY3Rpb25hcnkgc3VjaCBhczpcblxuICAge1xuICAgZXJyb3I6ICdTb21lIEVycm9yIENvbmRpdGlvbidcbiAgIHNjaGVtYTogJ1NvbWUgU2NoZW1hIElkZW50aWZpZXInXG4gICBkYXRhOiB7XG4gICB2aWV3TmFtZTogdGhlIG5hbWUgb2YgdGhlIHZpZXcsXG4gICBjb250ZXh0OiB0aGUgY29udGV4dCBvYmplY3QsXG4gICBwYXJlbnRzOiB0aGUgcGFyZW50cyBhcnJheSxcbiAgIHZpZXc6IHRoZSBkaWN0IHJldHVybmVkIGJ5IGFueSBjdXN0b20gdmlld1xuICAgaXRlbXM6IHNlcXVlbmNlIG9mIGNoaWxkcmVuIGlmIGl0IGlzIGEgZm9sZGVyXG4gICBvcmRlcmluZzogaWYgb3JkZXJlZCBmb2xkZXIsIHRoZSBvcmRlcmluZyBvZiB0aGUgaXRlbSBpZHNcbiAgIH1cblxuICAgfVxuXG4gICAqL1xuXG4gIC8vIEZpcnN0IGhhbmRlIHRoZSBjYXNlIHdoZXJlIHJlc29sdmVkUGF0aCBzYXlzIGl0IGNvdWxkbid0XG4gIC8vIGZpbmQgYW55dGhpbmcuXG5cbiAgaWYgKHJlc29sdmVkUGF0aC5lcnJvcikge1xuICAgIC8vIFRoaXMgc2hvdWxkIGJlIGEgbm90IGZvdW5kXG4gICAgJHN0YXRlLmdvKCdub3Rmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkYXRhID0gcmVzb2x2ZWRQYXRoLmRhdGE7XG4gIE1kRGlzcGF0Y2hlci5jb250ZXh0ID0gZGF0YS5jb250ZXh0O1xuICBNZERpc3BhdGNoZXIudmlld05hbWUgPSBkYXRhLnZpZXdOYW1lO1xuICBNZERpc3BhdGNoZXIucGFyZW50cyA9IGRhdGEucGFyZW50cztcblxuICAvLyBHZXQgdGhlIG5leHQgc3RhdGUuIExvb2sgaW4gYWxsIHRoZSByZWdpc3RlcmVkIHN0YXRlcyBhdFxuICAvLyB2aWV3X2NvbmZpZyBpbmZvcm1hdGlvbi5cbiAgdmFyIG5leHRTdGF0ZSA9IE1kRGlzcGF0Y2hlci5yZXNvbHZlU3RhdGUoXG4gICAgTWREaXNwYXRjaGVyLmNvbnRleHQsIE1kRGlzcGF0Y2hlci52aWV3TmFtZSwgTWREaXNwYXRjaGVyLnBhcmVudHMpO1xuXG4gIGlmIChuZXh0U3RhdGUpIHtcbiAgICAkc3RhdGUuZ28obmV4dFN0YXRlKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBNZERpc3BhdGNoZXIgZmFpbGVkIHRvIGZpbmQgYSBtYXRjaGluZyB2aWV3XG4gICAgJHN0YXRlLmdvKCdub3Rmb3VuZCcpO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gTm90Rm91bmRDdHJsKCRsb2NhdGlvbikge1xuICB0aGlzLnBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xufVxuXG5mdW5jdGlvbiBFcnJvckN0cmwoJHN0YXRlUGFyYW1zKSB7XG4gIHRoaXMudG9TdGF0ZSA9ICRzdGF0ZVBhcmFtcy50b1N0YXRlO1xuICB0aGlzLmVycm9yID0gJHN0YXRlUGFyYW1zLmVycm9yO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBOb3RGb3VuZEN0cmw6IE5vdEZvdW5kQ3RybCxcbiAgRXJyb3JDdHJsOiBFcnJvckN0cmwsXG4gIERpc3BhdGNoZXJDdHJsOiBEaXNwYXRjaGVyQ3RybFxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbWQuZGlzcGF0Y2gnLCBbJ3VpLnJvdXRlciddKVxuICAuY29udHJvbGxlcignTm90Rm91bmRDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLk5vdEZvdW5kQ3RybClcbiAgLmNvbnRyb2xsZXIoJ0Vycm9yQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5FcnJvckN0cmwpXG4gIC5jb250cm9sbGVyKCdEaXNwYXRjaGVyQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5EaXNwYXRjaGVyQ3RybClcbiAgLnNlcnZpY2UoJ01kRGlzcGF0Y2hlcicsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5EaXNwYXRjaGVyKTtcblxucmVxdWlyZSgnLi9pbml0Jyk7XG5yZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL3NlcnZpY2VzJyk7XG5yZXF1aXJlKCcuL3N0YXRlcycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgIC8vIFRoZSBVUkwgZmFpbGVkIHRvIHJlc29sdmUuIExldCdzIGdpdmUgYSB0cnkgYXQgdHJhdmVyc2FsLlxuICAgIHZhclxuICAgICAgJHN0YXRlID0gJGluamVjdG9yLmdldCgnJHN0YXRlJyksXG4gICAgICBNZERpc3BhdGNoZXIgPSAkaW5qZWN0b3IuZ2V0KCdNZERpc3BhdGNoZXInKTtcblxuXG4gICAgLy8gWFhYIFRPRE8gQ2FuJ3QgZG8gdGhpcyBvbiBldmVyeSByZXF1ZXN0XG4gICAgLy8gR3JhYiBhbGwgdGhlIHJlZ2lzdGVyZWQgdmlld19jb25maWcgaW5mbyBmcm9tIHRoZSBzdGF0ZXMuIE1ha2VcbiAgICAvLyBhIGRpY3Qgd2l0aCBhIGtleSBvZiB0aGUgdmlldyBuYW1lLCB2YWx1ZSBhbGwgdGhlIHZpZXdfY29uZmlnXG4gICAgLy8gaW5mby5cbiAgICBNZERpc3BhdGNoZXIubWFrZVZpZXdNYXAoJHN0YXRlLmdldCgpKTtcblxuXG4gICAgLy8gSWYgdGhlcmUgYXJlIHZpZXdDb25maWcgc2V0dGluZ3Mgb24gYW55IHN0YXRlcywgdXNlIHRyYXZlcnNhbFxuICAgIC8vIHVubGVzcyBjb25maWd1cmF0aW9uIHdhbnRzIGl0IGRpc2FibGVkLlxuICAgIGlmICghTWREaXNwYXRjaGVyLmRpc2FibGVEaXNwYXRjaCkge1xuICAgICAgJHN0YXRlLmdvKCdkaXNwYXRjaCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc3RhdGUuZ28oJ25vdGZvdW5kJywge3VuZm91bmRTdGF0ZVRvOiAnZGlzcGF0Y2gnfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gTW9kdWxlUnVuKCRyb290U2NvcGUsICRzdGF0ZSwgTWREaXNwYXRjaGVyKSB7XG4gICAgLy8gUHV0IHRoZSBNZERpc3BhdGNoZXIgb24gdGhlIHJvb3Qgc2NvcGUgc28gdGhhdCBpdCBpcyBhdmFpbGFibGUgaW5cbiAgICAvLyBhbGwgdGVtcGxhdGVzLlxuICAgICRyb290U2NvcGUuZGlzcGF0Y2hlciA9IE1kRGlzcGF0Y2hlcjtcblxuICAgIC8vIE5vdCBGb3VuZC4gVHJpZWQgdG8gZ28gdG8gYSBzdGF0ZSB0aGF0IGRvZXNuJ3QgZXhpc3QuXG4gICAgJHJvb3RTY29wZVxuICAgICAgLiRvbihcbiAgICAgICckc3RhdGVOb3RGb3VuZCcsXG4gICAgICBmdW5jdGlvbiAoZXZlbnQsIHVuZm91bmRTdGF0ZSwgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRzdGF0ZS5nbygnbm90Zm91bmQnLCB7dW5mb3VuZFN0YXRlVG86IHVuZm91bmRTdGF0ZS50b30pO1xuICAgICAgfSk7XG5cbiAgICAvLyBFcnJvciBoYW5kbGVyLiBEaXNwbGF5IGVycm9ycyB0aGF0IG9jY3VyIGluIHN0YXRlIHJlc29sdmVzIGV0Yy5cbiAgICAkcm9vdFNjb3BlXG4gICAgICAuJG9uKFxuICAgICAgJyRzdGF0ZUNoYW5nZUVycm9yJyxcbiAgICAgIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcywgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5kZWJ1Zygnc3RhdGVDaGFuZ2VFcnJvcicsIGVycm9yKTtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJHN0YXRlLmdvKCdlcnJvcicsIHt0b1N0YXRlOiB0b1N0YXRlLm5hbWUsIGVycm9yOiBlcnJvcn0pO1xuICAgICAgfSk7XG59XG5cblxuYW5ndWxhci5tb2R1bGUoJ21kLmRpc3BhdGNoJylcbiAgLmNvbmZpZyhNb2R1bGVDb25maWcpXG4gIC5ydW4oTW9kdWxlUnVuKTsiLCJ2YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gRGlzcGF0Y2hlcigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICAvLyBBdCBzdGFydHVwLCB0YWtlIHRoZSBsaXN0IG9mIHN0YXRlcyBhbmQgbWFrZSBhIHZpZXdNYXAuIFRoZVxuICAvLyB2aWV3TWFwIHdpbGwgbG9vayBsaWtlOlxuICAvLyBkZWZhdWx0OlxuICAvLyAgIFtcbiAgLy8gICAgICB7cmVzb3VyY2VUeXBlOiAnRm9sZGVyJywgY29udGFpbm1lbnQ6IHNvbWV0aGluZyxcbiAgLy8gICAgICAgc3RhdGVOYW1lOiAnZm9sZGVyLWRlZmF1bHQnXG4gIC8vICAgICAgfVxuICAvLyAgIF1cbiAgLy8gTWVhbmluZywgaXQgaGFzIHRoZSBwcmVkaWNhdGUgaW5mb3JtYXRpb24gdXNlZCBpbiBQeXJhbWlkXG4gIC8vIHZpZXdzLiBXZSBrZXkgb24gdmlld05hbWUganVzdCB0byBzcGVlZCB1cCB0aGUgcmVzb2x1dGlvbi5cbiAgdGhpcy52aWV3TWFwID0ge307XG4gIHRoaXMucmVzZXRWaWV3TWFwID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFJlc2V0IHZpZXdNYXBcbiAgICBfdGhpcy52aWV3TWFwID0ge307XG4gIH07XG4gIHRoaXMuYWRkU3RhdGVUb1ZpZXdNYXAgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAvLyBBZGQgYSBuZXcgc3RhdGUgdG8gdmlld01hcCAod2l0aG91dCBiZXN0LW1hdGNoIG9yZGVyaW5nKVxuICAgIHZhciB2YyA9IHN0YXRlLnZpZXdDb25maWc7XG4gICAgdmFyIHZpZXdOYW1lO1xuICAgIHZhciB0bXBFbGVtO1xuICAgIGlmICh2Yykge1xuICAgICAgLy8gVGhpcyBzdGF0ZSBoYXMgYSB2aWV3Q29uZmlnXG4gICAgICB2aWV3TmFtZSA9IHZjLm5hbWU7XG4gICAgICB0bXBFbGVtID0ge1xuICAgICAgICBuYW1lOiB2aWV3TmFtZSxcbiAgICAgICAgcmVzb3VyY2VUeXBlOiB2Yy5yZXNvdXJjZVR5cGUsXG4gICAgICAgIHN0YXRlTmFtZTogc3RhdGUubmFtZSxcbiAgICAgICAgY29udGFpbm1lbnQ6IHZjLmNvbnRhaW5tZW50LFxuICAgICAgICBwYXRoSW5mbzogdmMucGF0aEluZm8sXG4gICAgICAgIG1hcmtlcjogdmMubWFya2VyXG4gICAgICB9O1xuXG4gICAgICAvLyBJZiB0aGUgdmlld01hcCBkb2Vzbid0IHlldCBoYXZlIHRoaXNcbiAgICAgIC8vIHZpZXdOYW1lLCBhZGQgaXQgd2l0aCBhbiBlbXB0eSBzZXFcbiAgICAgIGlmICghX3RoaXMudmlld01hcFt2aWV3TmFtZV0pIHtcbiAgICAgICAgX3RoaXMudmlld01hcFt2aWV3TmFtZV0gPSBbdG1wRWxlbV07XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgX3RoaXMudmlld01hcFt2aWV3TmFtZV0ucHVzaCh0bXBFbGVtKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIHRoaXMudXBkYXRlVHJhdmVyc2FsID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFVwZGF0ZSBfdGhpcy5kaXNhYmxlRGlzcGF0Y2ggcHJvcGVydHkgaWYgX3RoaXMudmlld01hcCBpcyBlbXB0eVxuICAgIF90aGlzLmRpc2FibGVEaXNwYXRjaCA9IF8uaXNFbXB0eShfdGhpcy52aWV3TWFwKTtcbiAgfTtcbiAgdGhpcy5vcmRlclZpZXdNYXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gUG9zdCBwcm9jZXNzaW5nIG9mIHZpZXdNYXAgd2l0aCBiZXN0IG1hdGNoIG9yZGVyXG4gICAgXyhfdGhpcy52aWV3TWFwKVxuICAgICAgLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgICAgX3RoaXMudmlld01hcFtrZXldID0gXyhfdGhpcy52aWV3TWFwW2tleV0pXG4gICAgICAgICAgICAgICAgICAgLmNoYWluKClcbiAgICAgICAgICAgICAgICAgICAuc29ydEJ5KGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLm1hcmtlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgLnNvcnRCeShmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5yZXNvdXJjZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgIC5zb3J0QnkoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0uY29udGFpbm1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgIC5zb3J0QnkoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ucGF0aEluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgIC5zb3J0QnkoZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW0ubWFya2VyO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAudmFsdWUoKTtcbiAgICAgICAgICAgICAgIH0pO1xuICB9O1xuICB0aGlzLm1ha2VWaWV3TWFwID0gZnVuY3Rpb24gKHN0YXRlcykge1xuICAgIC8vIHJlc2V0IHZpZXcgbWFwXG4gICAgX3RoaXMucmVzZXRWaWV3TWFwKCk7XG5cbiAgICAvLyBhZGQgKG9ubHkgdmlld0NvbmZpZyBiYXNlZCkgc3RhdGVzIHRvIHZpZXdNYXBcbiAgICBfKHN0YXRlcylcbiAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uaGFzKHN0YXRlLCBcInZpZXdDb25maWdcIik7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAuZm9yRWFjaChfdGhpcy5hZGRTdGF0ZVRvVmlld01hcCk7XG5cbiAgICAvLyBQb3N0IHByb2Nlc3Npbmcgb2Ygdmlld01hcCB3aXRoIGJlc3QgbWF0Y2ggb3JkZXJcbiAgICBfdGhpcy5vcmRlclZpZXdNYXAoKTtcblxuICAgIC8vIFVwZGF0ZSBfdGhpcy5kaXNhYmxlRGlzcGF0Y2ggcHJvcGVydHkgaWYgX3RoaXMudmlld01hcCBpcyBlbXB0eVxuICAgIF90aGlzLnVwZGF0ZVRyYXZlcnNhbCgpO1xuICB9O1xuXG4gIHRoaXMucmVzb2x2ZVN0YXRlID0gZnVuY3Rpb24gKGNvbnRleHQsIHZpZXdOYW1lLCBwYXJlbnRzKSB7XG4gICAgLy8gQmFzZWQgb24gcmVxdWVzdCBpbmZvLCBmaW5kIHRoZSBtYXRjaGluZyB2aWV3IGluIHRoZSB2aWV3XG4gICAgLy8gbWFwIGJhc2VkIG9uIHByaW9yaXR5LlxuICAgIHZhciB2aWV3cywgcGFyZW50VHlwZXMsIG1hdGNoaW5nVmlldywgaSwgdmlldywgcGFyZW50TWFya2Vycywgdmlld0NvbmZpZ01hcmtlcjtcblxuICAgIC8vIEdldCB0aGUgdmlldyBtYXRjaGluZyB0aGlzIHJlc29sdmVkIHZpZXdOYW1lIGZyb20gdGhlIHZpZXdNYXBcbiAgICB2aWV3cyA9IF90aGlzLnZpZXdNYXBbdmlld05hbWVdO1xuXG4gICAgaWYgKHZpZXdzKSB7XG4gICAgICAvLyBHZXQgc29tZSBvZiB0aGUgZGF0YSBuZWVkZWQgYnkgdGhlIHByZWRpY2F0ZXNcbiAgICAgIHBhcmVudHNDaGFpbiA9IF8ocGFyZW50cylcbiAgICAgICAgLmNoYWluKClcbiAgICAgICAgLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgICAgcmV0dXJuIFtwLnJlc291cmNlVHlwZSwgcC5tYXJrZXJzXTtcbiAgICAgICAgICAgICB9KVxuICAgICAgICAuemlwKClcbiAgICAgICAgLnZhbHVlKCk7XG4gICAgICBwYXJlbnRUeXBlcyA9IF8udW5pcShwYXJlbnRzQ2hhaW5bMF0pO1xuICAgICAgcGFyZW50TWFya2VycyA9IF8udW5pcShfLmZsYXR0ZW4ocGFyZW50c0NoYWluWzFdKSk7XG4gICAgICBtYXJrZXJzID0gY29udGV4dC5tYXJrZXJzO1xuICAgICAgcGF0aEluZm8gPSBjb250ZXh0LnBhdGg7XG5cbiAgICAgIC8vIEdvIHRocm91Z2ggYWxsIHRoZSB2aWV3cywgYXNzaWduaW5nIGEgc2NvcmVcbiAgICAgIG1hdGNoaW5nVmlldyA9IG51bGw7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmlld0NvbmZpZyA9IHZpZXdzW2ldO1xuICAgICAgICB2aWV3Q29uZmlnTWFya2VyID0gdmlld0NvbmZpZy5tYXJrZXI7XG5cbiAgICAgICAgaWYgKHZpZXdDb25maWcucmVzb3VyY2VUeXBlKSB7XG4gICAgICAgICAgaWYgKHZpZXdDb25maWcucmVzb3VyY2VUeXBlICE9PSBjb250ZXh0LnJlc291cmNlVHlwZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3Q29uZmlnLmNvbnRhaW5tZW50KSB7XG4gICAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHBhcmVudFR5cGVzLCB2aWV3Q29uZmlnLmNvbnRhaW5tZW50KSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2aWV3Q29uZmlnLm1hcmtlcikge1xuICAgICAgICAgIGlmICghXy5jb250YWlucyhtYXJrZXJzLCB2aWV3Q29uZmlnTWFya2VyKSkge1xuICAgICAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHBhcmVudE1hcmtlcnMsIHZpZXdDb25maWdNYXJrZXIpKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodmlld0NvbmZpZy5wYXRoSW5mbykge1xuICAgICAgICAgIGlmICghXy5jb250YWlucyhwYXRoSW5mbywgdmlld0NvbmZpZy5wYXRoSW5mbykpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2aWV3Q29uZmlnLnN0YXRlTmFtZTtcblxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRGlzcGF0Y2hlcjogRGlzcGF0Y2hlclxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHVybCA9IHJlcXVpcmUoJ3VybCcpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnbm90Zm91bmQnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAncm9vdCcsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9ub3Rmb3VuZC5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb3RGb3VuZEN0cmwgYXMgY3RybCdcblxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgcGFyYW1zOiB7dW5mb3VuZFN0YXRlVG86ICcnfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgnZXJyb3InLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAncm9vdCcsXG4gICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICdtZC1jb250ZW50QHJvb3QnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9lcnJvci5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdFcnJvckN0cmwgYXMgY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgdG9TdGF0ZTogJycsXG4gICAgICAgICAgICAgICBlcnJvcjogJydcbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdkaXNwYXRjaCcsIHtcbiAgICAgICAgICAgICBwYXJlbnQ6ICdyb290JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICcnLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRGlzcGF0Y2hlckN0cmwgYXMgRGlzcGF0Y2hlckN0cmwnLFxuICAgICAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgICAgcmVzb2x2ZWRQYXRoOiBmdW5jdGlvbiAoJGxvY2F0aW9uLCAkaHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgdmFyIHBhdGggPSAkbG9jYXRpb24ucGF0aCgpO1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChwYXRoKVxuICAgICAgICAgICAgICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2Vzcy5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCdtZC5kaXNwYXRjaCcpXG4gIC5jb25maWcoTW9kdWxlQ29uZmlnKTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2PlxcbiAgPGgxPkVycm9yPC9oMT5cXG5cXG4gIDxwPkVycm9yIHdoZW4gcHJvY2VzaW5nIHN0YXRlIDxjb2RlPnt7Y3RybC50b1N0YXRlfX08L2NvZGU+OjwvcD5cXG4gIDxwcmU+XFxue3tjdHJsLmVycm9yfX1cXG4gIDwvcHJlPlxcbiAgXFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2PlxcbiAgPGgxPk5vdCBGb3VuZDwvaDE+XFxuXFxuICA8cD5UaGUgcmVxdWVzdGVkIFVSTCA8Y29kZT57e2N0cmwucGF0aH19PC9jb2RlPiBjb3VsZFxcbiAgICBub3QgYmUgZm91bmQuPC9wPlxcbjwvZGl2Pic7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBGb3JtQ29udHJvbGxlcihNZFNjaGVtYXMsIE1kRm9ybXMpIHtcbiAgdGhpcy5tb2RlbCA9IHRoaXMubWRNb2RlbDtcbiAgdGhpcy5zY2hlbWEgPSBNZFNjaGVtYXMuZ2V0KHRoaXMubWRTY2hlbWEpO1xuICB0aGlzLmZvcm0gPSBNZEZvcm1zLmdldCh0aGlzLm1kRm9ybSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBGb3JtQ29udHJvbGxlcjogRm9ybUNvbnRyb2xsZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIEZvcm0oKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvZm9ybS5odG1sJyksXG4gICAgc2NvcGU6IHtcbiAgICAgIG1kTW9kZWw6ICc9bWRNb2RlbCcsXG4gICAgICBtZFNjaGVtYTogJ0BtZFNjaGVtYScsXG4gICAgICBtZEZvcm06ICdAbWRGb3JtJ1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuRm9ybUNvbnRyb2xsZXIsXG4gICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgRm9ybURpcmVjdGl2ZTogRm9ybVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuXG5hbmd1bGFyLm1vZHVsZSgnbWQuZm9ybXMnLCBbJ3VpLnJvdXRlcicsICdyZXN0YW5ndWxhciddKVxuICAuc2VydmljZSgnTWRTY2hlbWFzJywgcmVxdWlyZSgnLi9zZXJ2aWNlcycpLlNjaGVtYXNTZXJ2aWNlKVxuICAuc2VydmljZSgnTWRGb3JtcycsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5Gb3Jtc1NlcnZpY2UpXG4gIC5kaXJlY3RpdmUoJ21kRm9ybScsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcycpLkZvcm1EaXJlY3RpdmUpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93Ll8gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLl8gOiBudWxsKTtcblxuZnVuY3Rpb24gU2NoZW1hc1NlcnZpY2UoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuc2NoZW1hcyA9IHt9O1xuXG4gIHRoaXMuZ2V0ID0gZnVuY3Rpb24gKHNjaGVtYUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hc1tzY2hlbWFJZF07XG4gIH07XG5cbiAgdGhpcy5pbml0ID0gZnVuY3Rpb24gKHNjaGVtYXMpIHtcbiAgICAvLyBHaXZlbiBzb21lIEpTT04sIHBpY2sgb3V0IHRoZSBwaWVjZXMgYW5kIGRvIHNvbWUgY29uZmlnLiBXZVxuICAgIC8vIGFyZSBwYXNzZWQgaW4gdGhlIFwic2NoZW1hc1wiIHBhcnQgb2YgdGhlIEpTT04uXG5cbiAgICBfKHNjaGVtYXMpLmZvckVhY2goXG4gICAgICBmdW5jdGlvbiAoc2NoZW1hLCBpZCkge1xuICAgICAgICBfdGhpcy5zY2hlbWFzW2lkXSA9IHNjaGVtYTtcbiAgICAgIH1cbiAgICApO1xuXG4gIH1cblxufVxuXG5mdW5jdGlvbiBGb3Jtc1NlcnZpY2UoKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMuZm9ybXMgPSB7fTtcblxuICB0aGlzLmdldCA9IGZ1bmN0aW9uIChmb3JtSWQpIHtcbiAgICByZXR1cm4gX3RoaXMuZm9ybXNbZm9ybUlkXTtcbiAgfTtcblxuICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoZm9ybXMpIHtcbiAgICAvLyBHaXZlbiBzb21lIEpTT04sIHBpY2sgb3V0IHRoZSBwaWVjZXMgYW5kIGRvIHNvbWUgY29uZmlnLiBXZVxuICAgIC8vIGFyZSBwYXNzZWQgaW4gdGhlIFwiZm9ybXNcIiBwYXJ0IG9mIHRoZSBKU09OLlxuXG4gICAgXyhmb3JtcykuZm9yRWFjaChcbiAgICAgIGZ1bmN0aW9uIChmb3JtLCBpZCkge1xuICAgICAgICBfdGhpcy5mb3Jtc1tpZF0gPSBmb3JtO1xuICAgICAgfVxuICAgICk7XG5cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgU2NoZW1hc1NlcnZpY2U6IFNjaGVtYXNTZXJ2aWNlLFxuICBGb3Jtc1NlcnZpY2U6IEZvcm1zU2VydmljZVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gJzxmb3JtXFxuICAgIHNmLXNjaGVtYT1cImN0cmwuc2NoZW1hXCJcXG4gICAgc2YtZm9ybT1cImN0cmwuZm9ybVwiXFxuICAgIHNmLW1vZGVsPVwiY3RybC5tb2RlbFwiPjwvZm9ybT5cXG4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTGF5b3V0Q29udHJvbGxlcigkcm9vdFNjb3BlLCBNZExheW91dCkge1xuICAkcm9vdFNjb3BlLmxheW91dCA9IE1kTGF5b3V0O1xufVxuXG5mdW5jdGlvbiBIZWFkZXJDb250cm9sbGVyKE1kQ29uZmlnLCAkYXV0aCkge1xuICB0aGlzLiRhdXRoID0gJGF1dGg7XG4gIHRoaXMuc2l0ZU5hbWUgPSBNZENvbmZpZy5zaXRlLm5hbWU7XG59XG5cbmZ1bmN0aW9uIEZvb3RlckNvbnRyb2xsZXIoTWRDb25maWcpIHtcbiAgdGhpcy5zaXRlTmFtZSA9IE1kQ29uZmlnLnNpdGUubmFtZTtcbn1cblxuZnVuY3Rpb24gTmF2Q29udHJvbGxlcigpIHtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIExheW91dENvbnRyb2xsZXI6IExheW91dENvbnRyb2xsZXIsXG4gIEhlYWRlckNvbnRyb2xsZXI6IEhlYWRlckNvbnRyb2xsZXIsXG4gIEZvb3RlckNvbnRyb2xsZXI6IEZvb3RlckNvbnRyb2xsZXIsXG4gIE5hdkNvbnRyb2xsZXI6IE5hdkNvbnRyb2xsZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYW5ndWxhciA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93LmFuZ3VsYXIgOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsLmFuZ3VsYXIgOiBudWxsKTtcblxuYW5ndWxhci5tb2R1bGUoJ21kLmxheW91dCcsIFsndWkucm91dGVyJ10pXG4gIC5zZXJ2aWNlKCdNZExheW91dCcsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5MYXlvdXRTZXJ2aWNlKVxuICAuY29uZmlnKHJlcXVpcmUoJy4vc3RhdGVzJykuQ29uZmlnKVxuICAucnVuKHJlcXVpcmUoJy4vc2VydmljZXMnKS5SdW4pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBMYXlvdXRTZXJ2aWNlKCRyb290U2NvcGUsIE1kQ29uZmlnKSB7XG4gIHZhciBfdGhpcywgc2l0ZU5hbWU7XG4gIF90aGlzID0gdGhpcztcbiAgc2l0ZU5hbWUgPSBNZENvbmZpZy5zaXRlLm5hbWU7XG4gIHRoaXMucGFnZVRpdGxlID0gc2l0ZU5hbWU7XG5cbiAgLy8gV2hlbmV2ZXIgdGhlIHN0YXRlIGNoYW5nZXMsIHVwZGF0ZSB0aGUgcGFnZVRpdGxlXG4gIGZ1bmN0aW9uIGNoYW5nZVRpdGxlKGV2dCwgdG9TdGF0ZSkge1xuICAgIGlmICh0b1N0YXRlLnRpdGxlKSB7XG4gICAgICAvLyBTdXJlIHdvdWxkIGxpa2UgdG8gYXV0b21hdGljYWxseSBwdXQgaW4gcmVzb3VyY2UudGl0bGUgYnV0XG4gICAgICAvLyB1bmZvcnR1bmF0ZWx5IHVpLXJvdXRlciBkb2Vzbid0IGdpdmUgbWUgYWNjZXNzIHRvIHRoZSByZXNvbHZlXG4gICAgICAvLyBmcm9tIHRoaXMgZXZlbnQuXG4gICAgICBfdGhpcy5wYWdlVGl0bGUgPSBzaXRlTmFtZSArICcgLSAnICsgdG9TdGF0ZS50aXRsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmVzZXQgdG8gZGVmYXVsdFxuICAgICAgX3RoaXMucGFnZVRpdGxlID0gc2l0ZU5hbWU7XG4gICAgfVxuICB9XG5cbiAgLy8gVE9ETyBFeHBvc2Ugc28gdW5pdCB0ZXN0cyBjYW4gcmVhY2ggaXQuIFRyeSB0byBjaGFuZ2VcbiAgLy8gY2hhbmdlVGl0bGUgYmVsb3cgdG8gdXNlIHRoaXMuY2hhbmdlVGl0bGUgYW5kIHdyaXRlIGFcbiAgLy8gbWlkd2F5IHRlc3QgZm9yICRvblxuICB0aGlzLmNoYW5nZVRpdGxlID0gY2hhbmdlVGl0bGU7XG5cbiAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBjaGFuZ2VUaXRsZSk7XG59XG5cbmZ1bmN0aW9uIE1vZHVsZVJ1bigkcm9vdFNjb3BlLCBNZExheW91dCkge1xuICAkcm9vdFNjb3BlLmxheW91dCA9IE1kTGF5b3V0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiBMYXlvdXRTZXJ2aWNlOiBMYXlvdXRTZXJ2aWNlLFxuIFJ1bjogTW9kdWxlUnVuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE1vZHVsZUNvbmZpZygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnbGF5b3V0Jywge1xuICAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9tZC1sYXlvdXQuaHRtbCcpLFxuICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkxheW91dENvbnRyb2xsZXIsXG4gICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgfSlcbiAgICAuc3RhdGUoJ3Jvb3QnLCB7XG4gICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWhlYWRlcic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL21kLWhlYWRlci5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkhlYWRlckNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLW5hdic6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL21kLW5hdi5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLk5hdkNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnQnOiB7XG4gICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiB1aS12aWV3PVwibWQtY29udGVudFwiPjwvZGl2PidcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAnbWQtZm9vdGVyJzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbWQtZm9vdGVyLmh0bWwnKSxcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuRm9vdGVyQ29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ29uZmlnOiBNb2R1bGVDb25maWdcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2PlxcbiAgV2VsY29tZSB0byA8c3BhbiBuZy1iaW5kPVwiY3RybC5zaXRlTmFtZVwiPk1vb25kYXNoPC9zcGFuPi5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIiByb2xlPVwibmF2aWdhdGlvblwiPlxcbiAgPGRpdiBjbGFzcz1cIm5hdmJhciBuYXZiYXItaW52ZXJzZSBuYXZiYXItZml4ZWQtdG9wXCJcXG4gICAgICAgcm9sZT1cIm5hdmlnYXRpb25cIj5cXG4gICAgPGRpdiBjbGFzcz1cIm5hdmJhci1oZWFkZXJcIj5cXG4gICAgICA8YSBjbGFzcz1cIm5hdmJhci1icmFuZFwiXFxuICAgICAgICAgaHJlZj1cIiMvXCJcXG4gICAgICAgICBuZy1iaW5kPVwiY3RybC5zaXRlTmFtZVwiPlNpdGUgTmFtZTwvYT5cXG4gICAgPC9kaXY+XFxuICAgIFxcbiAgICAgICAgPHVsIG5nLWlmPVwiIWN0cmwuJGF1dGguaXNBdXRoZW50aWNhdGVkKClcIlxcbiAgICAgICAgY2xhc3M9XCJuYXYgbmF2YmFyLW5hdiBwdWxsLXJpZ2h0XCI+XFxuICAgICAgPGxpIHVpLXNyZWYtYWN0aXZlPVwiYWN0aXZlXCI+XFxuICAgICAgICA8YSB1aS1zcmVmPVwiYXV0aC5sb2dpblwiPkxvZ2luPC9hPjwvbGk+XFxuICAgIDwvdWw+XFxuICAgIDx1bCBuZy1pZj1cImN0cmwuJGF1dGguaXNBdXRoZW50aWNhdGVkKClcIlxcbiAgICAgICAgY2xhc3M9XCJuYXYgbmF2YmFyLW5hdiBwdWxsLXJpZ2h0XCI+XFxuICAgICAgPGxpIHVpLXNyZWYtYWN0aXZlPVwiYWN0aXZlXCI+XFxuICAgICAgICA8YSB1aS1zcmVmPVwiYXV0aC5wcm9maWxlXCI+UHJvZmlsZTwvYT5cXG4gICAgICA8L2xpPlxcbiAgICAgIDxsaT48YSB1aS1zcmVmPVwiYXV0aC5sb2dvdXRcIj5Mb2dvdXQ8L2E+PC9saT5cXG4gICAgPC91bD5cXG5cXG4gIDwvZGl2PlxcbjwvZGl2Plxcbic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBpZD1cIm1kLWhlYWRlclwiIHVpLXZpZXc9XCJtZC1oZWFkZXJcIj48L2Rpdj5cXG48ZGl2IGlkPVwibWQtbWFpblwiPlxcbiAgPGRpdiBjbGFzcz1cInJvd1wiPlxcbiAgICA8ZGl2IGlkPVwibWQtbmF2XCIgY2xhc3M9XCJjb2wtc20tNCBjb2wtbWQtM1wiXFxuICAgICAgICAgdWktdmlldz1cIm1kLW5hdlwiPjwvZGl2PlxcbiAgICA8ZGl2IGlkPVwibWQtY29udGVudFwiIGNsYXNzPVwiY29sLXNtLTggY29sLW1kLTlcIlxcbiAgICAgICAgIHVpLXZpZXc9XCJtZC1jb250ZW50XCI+PC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGlkPVwibWQtZm9vdGVyXCIgdWktdmlldz1cIm1kLWZvb3RlclwiPjwvZGl2PlxcbjxzY3JpcHQgdHlwZT1cInRleHQvbmctdGVtcGxhdGVcIiBpZD1cInRlbXBsYXRlL21vZGFsL2JhY2tkcm9wLmh0bWxcIj5cXG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1iYWNrZHJvcCBmYWRlIHt7IGJhY2tkcm9wQ2xhc3MgfX1cIlxcbiAgICAgICBuZy1jbGFzcz1cIntpbjogYW5pbWF0ZX1cIlxcbiAgICAgICBuZy1zdHlsZT1cIntcXCd6LWluZGV4XFwnOiAxMDQwICsgKGluZGV4ICYmIDEgfHwgMCkgKyBpbmRleCoxMH1cIlxcbiAgICAgID48L2Rpdj5cXG48L3NjcmlwdD5cXG48c2NyaXB0IHR5cGU9XCJ0ZXh0L25nLXRlbXBsYXRlXCIgaWQ9XCJ0ZW1wbGF0ZS9tb2RhbC93aW5kb3cuaHRtbFwiPlxcbiAgPGRpdiB0YWJpbmRleD1cIi0xXCIgcm9sZT1cImRpYWxvZ1wiIGNsYXNzPVwibW9kYWwgZmFkZVwiXFxuICAgICAgIG5nLWNsYXNzPVwie2luOiBhbmltYXRlfVwiXFxuICAgICAgIG5nLXN0eWxlPVwie1xcJ3otaW5kZXhcXCc6IDEwNTAgKyBpbmRleCoxMCwgZGlzcGxheTogXFwnYmxvY2tcXCd9XCJcXG4gICAgICAgbmctY2xpY2s9XCJjbG9zZSgkZXZlbnQpXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1kaWFsb2dcIlxcbiAgICAgICAgIG5nLWNsYXNzPVwie1xcJ21vZGFsLXNtXFwnOiBzaXplID09IFxcJ3NtXFwnLCBcXCdtb2RhbC1sZ1xcJzogc2l6ZSA9PSBcXCdsZ1xcJ31cIj5cXG4gICAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29udGVudFwiIG1vZGFsLXRyYW5zY2x1ZGU+PC9kaXY+XFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuPC9zY3JpcHQ+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8bWQtbmF2cGFuZWw+PC9tZC1uYXZwYW5lbD4nOyIsIid1c2Ugc3RyaWN0JztcblxuLypcblxuIFdoZW4gcnVubmluZyBpbiBkZXYgbW9kZSwgbW9jayB0aGUgY2FsbHMgdG8gdGhlIFJFU1QgQVBJLCB0aGVuXG4gcGFzcyBldmVyeXRoaW5nIGVsc2UgdGhyb3VnaC5cblxuICovXG5cbmFuZ3VsYXIubW9kdWxlKCdtZC5tb2NrYXBpJywgW10pXG4gIC5wcm92aWRlcignTWRNb2NrUmVzdCcsIHJlcXVpcmUoJy4vcHJvdmlkZXJzJykuTW9ja1Jlc3QpXG4gIC5ydW4ocmVxdWlyZSgnLi9wcm92aWRlcnMnKS5SdW4pOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdy5fIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbC5fIDogbnVsbCk7XG52YXIgdXJsID0gcmVxdWlyZSgndXJsJyk7XG5cbmZ1bmN0aW9uIE1vY2tSZXN0KCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLm1vY2tzID0ge307XG5cbiAgdGhpcy4kZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBtb2NrcyA9IHRoaXMubW9ja3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlZ2lzdGVyTW9ja3M6IHJlZ2lzdGVyTW9ja3NcbiAgICB9O1xuICB9O1xuXG4gIHRoaXMuYWRkTW9ja3MgPSBmdW5jdGlvbiAoaywgdikge1xuICAgIHRoaXMubW9ja3Nba10gPSB2O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyTW9ja3MoJGh0dHBCYWNrZW5kKSB7XG4gICAgLy8gSXRlcmF0ZSBvdmVyIGFsbCB0aGUgcmVnaXN0ZXJlZCBtb2NrcyBhbmQgcmVnaXN0ZXIgdGhlbVxuICAgIF8ubWFwKF90aGlzLm1vY2tzLCBmdW5jdGlvbiAobW9kdWxlTW9ja3MpIHtcbiAgICAgIF8obW9kdWxlTW9ja3MpLmZvckVhY2goZnVuY3Rpb24gKG1vY2spIHtcblxuICAgICAgICAvLyBUbyByZWdpc3RlciB3aXRoICRodHRwQmFja2VuZCdzIG1hdGNoZXJzLCB3ZSBuZWVkIHR3byB0aGluZ3NcbiAgICAgICAgLy8gZnJvbSB0aGUgbW9jazogdGhlIG1ldGhvZCBhbmQgdGhlIFVSTCBwYXR0ZXJuLlxuICAgICAgICB2YXIgbWV0aG9kID0gbW9jay5tZXRob2QgfHwgJ0dFVCcsXG4gICAgICAgICAgcGF0dGVybiA9IG1vY2sucGF0dGVybjtcblxuICAgICAgICB2YXIgd3JhcHBlZFJlc3BvbmRlciA9IGZ1bmN0aW9uIChtZXRob2QsIHVybCwgZGF0YSwgaGVhZGVycykge1xuICAgICAgICAgIHJldHVybiBkaXNwYXRjaChtb2NrLCBtZXRob2QsIHVybCwgZGF0YSwgaGVhZGVycyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgJGh0dHBCYWNrZW5kLndoZW4obWV0aG9kLCBwYXR0ZXJuKVxuICAgICAgICAgIC5yZXNwb25kKHdyYXBwZWRSZXNwb25kZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwYXRjaChtb2NrLCBtZXRob2QsIHRoaXNVcmwsIGRhdGEsIGhlYWRlcnMpIHtcbiAgICAvLyBDYWxsZWQgYnkgJGh0dHBCYWNrZW5kIHdoZW5ldmVyIHRoaXMgbW9jaydzIHBhdHRlcm4gaXMgbWF0Y2hlZC5cblxuICAgIHZhciByZXNwb25kZXIsIHJlc3BvbnNlRGF0YSwgcmVzcG9uc2UsIHJlcXVlc3QsIHBhcnNlZFVybDtcblxuICAgIC8vIElmIHRoZSBtb2NrIHNheXMgdG8gYXV0aGVudGljYXRlIGFuZCB3ZSBkb24ndCBoYXZlXG4gICAgLy8gYW4gQXV0aG9yaXphdGlvbiBoZWFkZXIsIHJldHVybiA0MDEuXG4gICAgaWYgKG1vY2suYXV0aGVudGljYXRlKSB7XG4gICAgICB2YXIgYXV0aHogPSBoZWFkZXJzWydBdXRob3JpemF0aW9uJ107XG4gICAgICBpZiAoIWF1dGh6KSB7XG4gICAgICAgIHJldHVybiBbNDAxLCB7J21lc3NhZ2UnOiAnTG9naW4gcmVxdWlyZWQnfV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzcG9uZGVyID0gbW9jay5yZXNwb25kZXI7XG4gICAgcmVzcG9uc2VEYXRhID0gbW9jay5yZXNwb25zZURhdGE7XG5cbiAgICAvLyBBIGdlbmVyaWMgcmVzcG9uZGVyIGZvciBoYW5kbGluZyB0aGUgY2FzZSB3aGVyZSB0aGVcbiAgICAvLyBtb2NrIGp1c3Qgd2FudGVkIHRoZSBiYXNpY3MgYW5kIHN1cHBsaWVkIHJlc3BvbnNlRGF0YVxuICAgIGlmIChyZXNwb25zZURhdGEpIHtcbiAgICAgIHJlc3BvbnNlID0gWzIwMCwgcmVzcG9uc2VEYXRhXVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBQYWNrYWdlIHVwIHJlcXVlc3QgaW5mb3JtYXRpb24gaW50byBhIGNvbnZlbmllbnQgZGF0YSxcbiAgICAgIC8vIGNhbGwgdGhlIHJlc3BvbmRlciwgYW5kIHJldHVybiB0aGUgcmVzcG9uc2UuXG4gICAgICByZXF1ZXN0ID0gdXJsLnBhcnNlKHRoaXNVcmwsIHRydWUpO1xuICAgICAgcmVxdWVzdC51cmwgPSB0aGlzVXJsO1xuICAgICAgcmVxdWVzdC5oZWFkZXJzID0gaGVhZGVycztcbiAgICAgIHJlcXVlc3QuZGF0YSA9IGRhdGE7XG4gICAgICBpZiAoZGF0YSkgcmVxdWVzdC5qc29uX2JvZHkgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgcmVzcG9uc2UgPSByZXNwb25kZXIocmVxdWVzdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3BvbnNlO1xuICB9XG59XG5cblxuZnVuY3Rpb24gTW9kdWxlUnVuKCRodHRwQmFja2VuZCwgTWRNb2NrUmVzdCkge1xuICBNZE1vY2tSZXN0LnJlZ2lzdGVyTW9ja3MoJGh0dHBCYWNrZW5kKTtcblxuICAvLyBwYXNzIHRocm91Z2ggZXZlcnl0aGluZyBlbHNlXG4gICRodHRwQmFja2VuZC53aGVuR0VUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgJGh0dHBCYWNrZW5kLndoZW5QT1NUKC9cXC8qLykucGFzc1Rocm91Z2goKTtcbiAgJGh0dHBCYWNrZW5kLndoZW5QVVQoL1xcLyovKS5wYXNzVGhyb3VnaCgpO1xuXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE1vY2tSZXN0OiBNb2NrUmVzdCxcbiAgUnVuOiBNb2R1bGVSdW5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE5hdlBhbmVsQ29udHJvbGxlcihNZE5hdikge1xuICB0aGlzLm1lbnVzID0gTWROYXYubWVudXM7XG59XG5cbmZ1bmN0aW9uIE5hdk1lbnVDb250cm9sbGVyKCkge1xuICB0aGlzLnNyZWYgPSBmdW5jdGlvbiAobWVudWl0ZW0pIHtcbiAgICAvLyBHZW5lcmF0aW5nIHRoZSB1aS1zcmVmIGhhcyBzb21lIGxvZ2ljLiBMZXQncyBkbyBpdCBoZXJlIGluc3RlYWRcbiAgICAvLyBvZiBpbmxpbmUuXG4gICAgdmFyIHVpU3JlZiA9IG1lbnVpdGVtLnN0YXRlO1xuICAgIGlmIChtZW51aXRlbS5wYXJhbXMpIHtcbiAgICAgIHVpU3JlZiA9IHVpU3JlZiArICcoeycgKyBtZW51aXRlbS5wYXJhbXMgKyAnfSknO1xuICAgIH1cbiAgICByZXR1cm4gdWlTcmVmO1xuICB9XG59XG5cbmZ1bmN0aW9uIE5hdlN1Ym1lbnVDb250cm9sbGVyKCkge1xuICB0aGlzLmlzQ29sbGFwc2VkID0gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE5hdlBhbmVsQ29udHJvbGxlcjogTmF2UGFuZWxDb250cm9sbGVyLFxuICBOYXZNZW51Q29udHJvbGxlcjogTmF2TWVudUNvbnRyb2xsZXIsXG4gIE5hdlN1Ym1lbnVDb250cm9sbGVyOiBOYXZTdWJtZW51Q29udHJvbGxlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250cm9sbGVycyA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gTmF2UGFuZWwoKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbmF2cGFuZWwuaHRtbCcpLFxuICAgIHNjb3BlOiB7fSxcbiAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5OYXZQYW5lbENvbnRyb2xsZXIsXG4gICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIE5hdk1lbnUoKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbmF2bWVudS5odG1sJyksXG4gICAgc2NvcGU6IHtcbiAgICAgIG1lbnVpdGVtOiAnPW5nTW9kZWwnXG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5OYXZNZW51Q29udHJvbGxlcixcbiAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICBiaW5kVG9Db250cm9sbGVyOiB0cnVlXG4gIH07XG59XG5cblxuZnVuY3Rpb24gTmF2U3VibWVudSgpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9zdWJtZW51Lmh0bWwnKSxcbiAgICByZXF1aXJlOiAnXm5nTW9kZWwnLFxuICAgIHNjb3BlOiB7XG4gICAgICBtZW51aXRlbTogJz1uZ01vZGVsJ1xuICAgIH0sXG4gICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuTmF2U3VibWVudUNvbnRyb2xsZXIsXG4gICAgY29udHJvbGxlckFzOiAnY3RybCcsXG4gICAgYmluZFRvQ29udHJvbGxlcjogdHJ1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBOYXZNZW51OiBOYXZNZW51LFxuICBOYXZTdWJtZW51OiBOYXZTdWJtZW51LFxuICBOYXZQYW5lbDogTmF2UGFuZWxcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21kLm5hdicsIFtdKVxuICAuc2VydmljZSgnTWROYXYnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykuTmF2U2VydmljZSlcbiAgLmRpcmVjdGl2ZSgnbWROYXZtZW51JywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzJykuTmF2TWVudSlcbiAgLmRpcmVjdGl2ZSgnbWROYXZzdWJtZW51JywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzJykuTmF2U3VibWVudSlcbiAgLmRpcmVjdGl2ZSgnbWROYXZwYW5lbCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcycpLk5hdlBhbmVsKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTmF2U2VydmljZSgpIHtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gIHRoaXMubWVudXMgPSB7XG4gICAgcm9vdDoge2xhYmVsOiBmYWxzZSwgcHJpb3JpdHk6IC0xLCBpdGVtczoge319XG4gIH07XG5cbiAgLy8gSGFuZGxlIHRvcC1sZXZlbCBtZW51cywgYWthIG1lbnUgZ3JvdXBzXG4gIHRoaXMuYWRkTWVudSA9IGZ1bmN0aW9uIChtZW51KSB7XG5cbiAgICAvLyBVbnBhY2sgYW5kIHJlcGFjaywganVzdCB0byBlbmZvcmNlIHNjaGVtYS4gTGF0ZXIsIGRvIHRoaXMgYXNcbiAgICAvLyBhbiBhY3R1YWwgc2NoZW1hLlxuICAgIHZhciBpZCA9IG1lbnUuaWQsXG4gICAgICBsYWJlbCA9IG1lbnUubGFiZWwsXG4gICAgICBwcmlvcml0eSA9IG1lbnUucHJpb3JpdHkgPyBtZW51LnByaW9yaXR5IDogOTk7XG5cbiAgICBfdGhpcy5tZW51c1tpZF0gPSB7XG4gICAgICBpZDogaWQsXG4gICAgICBsYWJlbDogbGFiZWwsXG4gICAgICBwcmlvcml0eTogcHJpb3JpdHksXG4gICAgICBpdGVtczoge31cbiAgICB9XG4gIH07XG5cbiAgdGhpcy5hZGRNZW51SXRlbSA9IGZ1bmN0aW9uIChtZW51SWQsIG1lbnVJdGVtKSB7XG4gICAgLy8gQWRkIGEgbWVudSBpdGVtIHRvIGEgdG9wLWxldmVsIG1lbnVcblxuICAgIC8vIFVucGFjayBhbmQgcmVwYWNrLCBqdXN0IHRvIGVuZm9yY2Ugc2NoZW1hLiBMYXRlciwgZG8gdGhpcyBhc1xuICAgIC8vIGFuIGFjdHVhbCBzY2hlbWEuXG4gICAgdmFyIGlkID0gbWVudUl0ZW0uaWQsXG4gICAgICBsYWJlbCA9IG1lbnVJdGVtLmxhYmVsLFxuICAgICAgcHJpb3JpdHkgPSBtZW51SXRlbS5wcmlvcml0eSA/IG1lbnVJdGVtLnByaW9yaXR5IDogOTksXG4gICAgICBzdGF0ZSA9IG1lbnVJdGVtLnN0YXRlLFxuICAgICAgcGFyYW1zID0gbWVudUl0ZW0ucGFyYW1zLFxuICAgICAgaXRlbXMgPSBtZW51SXRlbS5pdGVtcyxcbiAgICAgIHBhcmVudEl0ZW1zID0gX3RoaXMubWVudXNbbWVudUlkXS5pdGVtcztcblxuICAgIHBhcmVudEl0ZW1zW2lkXSA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgIHN0YXRlOiBzdGF0ZSxcbiAgICAgIGl0ZW1zOiBpdGVtc1xuICAgIH07XG5cbiAgICBpZiAocGFyYW1zKSBwYXJlbnRJdGVtc1tpZF0ucGFyYW1zID0gcGFyYW1zO1xuICB9O1xuXG4gIHRoaXMuaW5pdCA9IGZ1bmN0aW9uIChzaXRlY29uZmlnKSB7XG4gICAgLy8gR2l2ZW4gdGhlIFwibmF2XCIga2V5IGluIHNpdGVjb25maWcuanNvbiwgd2lyZSB0aGluZ3MgdXBcblxuICAgIC8vIEV4dHJhY3QgcmVsZXZhbnQgc3R1ZmYgZnJvbSBjb25maWcsIHBlcmhhcHMgdmFsaWRhdGluZ1xuICAgIHZhciB1cmxQcmVmaXggPSBzaXRlY29uZmlnLnVybFByZWZpeCxcbiAgICAgIGl0ZW1zID0gc2l0ZWNvbmZpZy5pdGVtcztcblxuICAgIC8vIFBsdWNrIG91dCB0aGUgaXRlbXMucm9vdCwgaWYgaXQgZXhpc3RzLCBhbmQgYWRkIGFueSBlbnRyaWVzIHRvXG4gICAgLy8gdGhlIGNlbnRyYWxseS1kZWZpbmVkIFwicm9vdFwiIG1lbnUuXG4gICAgaWYgKGl0ZW1zLnJvb3QpIHtcbiAgICAgIF8oaXRlbXMucm9vdCkuZm9yRWFjaChmdW5jdGlvbiAobWVudUl0ZW0pIHtcbiAgICAgICAgdmFyIGlkID0gbWVudUl0ZW0uaWQsXG4gICAgICAgICAgbGFiZWwgPSBtZW51SXRlbS5sYWJlbCxcbiAgICAgICAgICBwcmlvcml0eSA9IG1lbnVJdGVtLnByaW9yaXR5LFxuICAgICAgICAgIHN0YXRlID0gbWVudUl0ZW0uc3RhdGUsXG4gICAgICAgICAgcGFyYW1zID0gbWVudUl0ZW0ucGFyYW1zLFxuICAgICAgICAgIGl0ZW1zID0gbWVudUl0ZW0uaXRlbXM7XG4gICAgICAgIF90aGlzLmFkZE1lbnVJdGVtKFxuICAgICAgICAgICdyb290JyxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogaWQsIGxhYmVsOiBsYWJlbCwgcHJpb3JpdHk6IHByaW9yaXR5LCBzdGF0ZTogc3RhdGUsXG4gICAgICAgICAgICBwYXJhbXM6IHBhcmFtcywgaXRlbXM6IGl0ZW1zXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBkZWxldGUgaXRlbXMucm9vdDtcbiAgICB9XG5cbiAgICAvLyBUb3AtbGV2ZWwgbWVudXNcbiAgICBfKGl0ZW1zKS5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKG1lbnUpIHtcbiAgICAgICAgdmFyIGlkID0gbWVudS5pZCxcbiAgICAgICAgICBsYWJlbCA9IG1lbnUubGFiZWwsXG4gICAgICAgICAgcHJpb3JpdHkgPSBtZW51LnByaW9yaXR5LFxuICAgICAgICAgIGl0ZW1zID0gbWVudS5pdGVtcztcbiAgICAgICAgX3RoaXMuYWRkTWVudShcbiAgICAgICAgICB7aWQ6IGlkLCBsYWJlbDogbGFiZWwsIHByaW9yaXR5OiBwcmlvcml0eX1cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBOb3cgbmV4dCBsZXZlbCBtZW51c1xuICAgICAgICBfKGl0ZW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChtZW51SXRlbSkge1xuICAgICAgICAgIHZhciBpZCA9IG1lbnVJdGVtLmlkLFxuICAgICAgICAgICAgbGFiZWwgPSBtZW51SXRlbS5sYWJlbCxcbiAgICAgICAgICAgIHByaW9yaXR5ID0gbWVudUl0ZW0ucHJpb3JpdHksXG4gICAgICAgICAgICBzdGF0ZSA9IG1lbnVJdGVtLnN0YXRlLFxuICAgICAgICAgICAgcGFyYW1zID0gbWVudUl0ZW0ucGFyYW1zLFxuICAgICAgICAgICAgaXRlbXMgPSBtZW51SXRlbS5pdGVtcztcbiAgICAgICAgICBfdGhpcy5hZGRNZW51SXRlbShcbiAgICAgICAgICAgIG1lbnUuaWQsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGlkOiBpZCwgbGFiZWw6IGxhYmVsLCBwcmlvcml0eTogcHJpb3JpdHksIHN0YXRlOiBzdGF0ZSxcbiAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbXMsIGl0ZW1zOiBpdGVtc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgfSk7XG5cbiAgICAgIH1cbiAgICApO1xuICAgIF90aGlzLnVybFByZWZpeCA9IF90aGlzLnVybFByZWZpeDtcblxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE5hdlNlcnZpY2U6IE5hdlNlcnZpY2Vcbn07XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDUgY2xhc3M9XCJ0ZXh0LW11dGVkXCJcXG4gICAgICBuZy1pZj1cImN0cmwubWVudWl0ZW0ubGFiZWxcIlxcbiAgICAgIG5nLWJpbmQ9XCJjdHJsLm1lbnVpdGVtLmxhYmVsXCI+TWVudSBUaXRsZTwvaDU+XFxuICA8dWwgY2xhc3M9XCJsaXN0LWdyb3VwXCI+XFxuICAgIDxsaSBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbVwiXFxuICAgICAgICBuZy1yZXBlYXQ9XCIoaWQsIG1lbnVpdGVtKSBpbiBjdHJsLm1lbnVpdGVtLml0ZW1zIHwgbWRPcmRlck9iamVjdEJ5OiBcXCdwcmlvcml0eVxcJ1wiPlxcbiAgICAgIDxhXFxuICAgICAgICAgIG5nLWlmPVwiIW1lbnVpdGVtLml0ZW1zXCJcXG4gICAgICAgICAgbmctYmluZD1cIm1lbnVpdGVtLmxhYmVsXCJcXG4gICAgICAgICAgdWktc3JlZj1cInt7IGN0cmwuc3JlZihtZW51aXRlbSkgfX1cIj5cXG4gICAgICAgIE1lbnUgSXRlbSA8L2E+XFxuICAgICAgPG1kLW5hdnN1Ym1lbnUgbmctbW9kZWw9XCJtZW51aXRlbVwiXFxuICAgICAgICAgICAgICAgICAgICAgbmctaWY9XCJtZW51aXRlbS5pdGVtc1wiPjwvbWQtbmF2c3VibWVudT5cXG4gICAgPC9saT5cXG4gIDwvdWw+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IG5nLXJlcGVhdD1cIihpZCwgbWVudSkgaW4gY3RybC5tZW51cyB8IG1kT3JkZXJPYmplY3RCeTogXFwncHJpb3JpdHlcXCdcIj5cXG4gIDxtZC1uYXZtZW51IGlkPVwibWQtbmF2bWVudS17e2lkfX1cIiBuZy1tb2RlbD1cIm1lbnVcIj48L21kLW5hdm1lbnU+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8YnV0dG9uXFxuICAgIGNsYXNzPVwiYnRuIGJ0bi14cyBidG4tZGVmYXVsdCBwdWxsLXJpZ2h0XCJcXG4gICAgbmctY2xpY2s9XCJjdHJsLmlzQ29sbGFwc2VkID0gIWN0cmwuaXNDb2xsYXBzZWRcIlxcbiAgICA+XFxuICA8c3BhbiBjbGFzcz1cImdseXBoaWNvbiBnbHlwaGljb24tY2hldnJvbi1sZWZ0XCJcXG4gICAgICAgIG5nLWlmPVwiY3RybC5pc0NvbGxhcHNlZFwiPjwvc3Bhbj5cXG4gIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLWRvd25cIlxcbiAgICAgICAgbmctaWY9XCIhY3RybC5pc0NvbGxhcHNlZFwiPjwvc3Bhbj5cXG48L2J1dHRvbj5cXG48c3BhbiBjbGFzcz1cImxpc3QtZ3JvdXAtaXRlbS1oZWFkaW5nXCJcXG4gICAgICBuZy1iaW5kPVwiY3RybC5tZW51aXRlbS5sYWJlbFwiPk5hdm1lbnUgSGVhZGluZzwvc3Bhbj5cXG48ZGl2IGNsYXNzPVwibGlzdC1ncm91cFwiIGNvbGxhcHNlPVwiY3RybC5pc0NvbGxhcHNlZFwiXFxuICAgICBzdHlsZT1cIm1hcmdpbi10b3A6IDFlbTsgbWFyZ2luLWJvdHRvbTogMFwiPlxcbiAgPGEgY2xhc3M9XCJsaXN0LWdyb3VwLWl0ZW1cIlxcbiAgICAgbmctcmVwZWF0PVwiKGlkLCBtZW51aXRlbSkgaW4gY3RybC5tZW51aXRlbS5pdGVtcyB8IG1kT3JkZXJPYmplY3RCeTogXFwncHJpb3JpdHlcXCdcIlwiXFxuICAgICB1aS1zcmVmPVwie3sgbWVudWl0ZW0uc3RhdGUgfX1cIlxcbiAgICAgbmctYmluZD1cIm1lbnVpdGVtLmxhYmVsXCI+XFxuICAgIE5hdm1lbnUgTGFiZWxcXG4gIDwvYT5cXG48L2Rpdj5cXG4nOyIsImZ1bmN0aW9uIE5vdGljZUNvbnRyb2xsZXIoJHNjb3BlLCAkbW9kYWxJbnN0YW5jZSwgJHRpbWVvdXQsIG1lc3NhZ2UpIHtcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgdmFyIHNlY29uZHMgPSAzO1xuICB2YXIgdGltZXIgPSAkdGltZW91dChcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAkbW9kYWxJbnN0YW5jZS5kaXNtaXNzKCk7XG4gICAgfSwgc2Vjb25kcyAqIDEwMDBcbiAgKTtcbiAgJHNjb3BlLiRvbihcbiAgICAnZGVzdHJveScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgJHRpbWVvdXQuY2FuY2VsKHRpbWVyKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIE5vdGljZUNvbnRyb2xsZXI6IE5vdGljZUNvbnRyb2xsZXJcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21kLm5vdGljZScsIFsndWkuYm9vdHN0cmFwLm1vZGFsJ10pXG4gIC5jb250cm9sbGVyKCdOb3RpY2VDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLk5vdGljZUNvbnRyb2xsZXIpXG4gIC5zZXJ2aWNlKCckbm90aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcycpLk5vdGljZVNlcnZpY2UpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIE5vdGljZVNlcnZpY2UoJG1vZGFsKSB7XG4gIHRoaXMuc2hvdyA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgdmFyIG1vZGFsSW5zdGFuY2UgPSAkbW9kYWwub3BlbihcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL25vdGljZS5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLk5vdGljZUNvbnRyb2xsZXIsXG4gICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnLFxuICAgICAgICBzaXplOiAnc20nLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgbWVzc2FnZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIG1vZGFsSW5zdGFuY2UucmVzdWx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSk7XG5cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTm90aWNlU2VydmljZTogTm90aWNlU2VydmljZVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJtb2RhbC1ib2R5XCIgbmctYmluZD1cImN0cmwubWVzc2FnZVwiPlxcbiAgVGhlIG1lc3NhZ2VcXG48L2Rpdj5cXG4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTWFuYWdlQ29udHJvbGxlcigpIHtcbiAgdGhpcy5mbGFnID0gOTtcbn1cblxuZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoJHN0YXRlUGFyYW1zLCBpdGVtcykge1xuICB0aGlzLnJ0eXBlID0gJHN0YXRlUGFyYW1zLnJ0eXBlO1xuICB0aGlzLml0ZW1zID0gaXRlbXM7XG59XG5cbmZ1bmN0aW9uIEVkaXRDb250cm9sbGVyKGl0ZW0pIHtcbiAgdGhpcy5pdGVtID0gaXRlbTtcbiAgdGhpcy5zY2hlbWFJZCA9ICdzY2hlbWExJztcbiAgdGhpcy5mb3JtSWQgPSAnZm9ybTEnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgTWFuYWdlQ29udHJvbGxlcjogTWFuYWdlQ29udHJvbGxlcixcbiAgTGlzdENvbnRyb2xsZXI6IExpc3RDb250cm9sbGVyLFxuICBFZGl0Q29udHJvbGxlcjogRWRpdENvbnRyb2xsZXJcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBhbmd1bGFyID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuYW5ndWxhciA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuYW5ndWxhciA6IG51bGwpO1xuYW5ndWxhci5tb2R1bGUoJ21kLnJlc291cmNldHlwZXMnLCBbJ21kLmZvcm1zJywgJ3VpLnJvdXRlciddKVxuICAuc2VydmljZSgnTWRSVHlwZXMnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykuUlR5cGVzU2VydmljZSlcbiAgLmNvbmZpZyhyZXF1aXJlKCcuL3N0YXRlcycpLkNvbmZpZyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cuXyA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwuXyA6IG51bGwpO1xuXG5mdW5jdGlvbiBSVHlwZXNTZXJ2aWNlKE1kTmF2KSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgLy8gU2V0IHRoZSBiYXNlIFJFU1QgcHJlZml4IGZvciB0aGlzIHNpdGUncyBydHlwZXMgZW50cnkgcG9pbnRcbiAgdGhpcy51cmxQcmVmaXggPSAnYXBpL3J0eXBlcyc7XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgbmF2bWVudVxuICBNZE5hdi5hZGRNZW51KFxuICAgIHtpZDogJ3J0eXBlcycsIGxhYmVsOiAnUmVzb3VyY2UgVHlwZXMnLCBwcmlvcml0eTogMn1cbiAgKTtcbiAgTWROYXYuYWRkTWVudUl0ZW0oJ3J0eXBlcycsIHtcbiAgICBpZDogJ21hbmFnZScsIGxhYmVsOiAnTWFuYWdlJywgc3RhdGU6ICdydHlwZXMubWFuYWdlJywgcHJpb3JpdHk6IDk5XG4gIH0pO1xuXG4gIHRoaXMuaXRlbXMgPSB7fTtcblxuICB0aGlzLmFkZCA9IGZ1bmN0aW9uIChpZCwgbGFiZWwsIHNjaGVtYSkge1xuICAgIF90aGlzLml0ZW1zW2lkXSA9IHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgIHNjaGVtYTogc2NoZW1hXG4gICAgfTtcbiAgICBNZE5hdi5hZGRNZW51SXRlbSgncnR5cGVzJywge1xuICAgICAgaWQ6IGlkLFxuICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgc3RhdGU6ICdydHlwZXMubGlzdCcsXG4gICAgICBwYXJhbXM6ICdydHlwZTogXCInICsgaWQgKyAnXCInLFxuICAgICAgcHJpb3JpdHk6IDVcbiAgICB9KTtcbiAgfTtcblxuICB0aGlzLmluaXQgPSBmdW5jdGlvbiAoc2l0ZWNvbmZpZykge1xuICAgIC8vIEdpdmVuIHNvbWUgSlNPTiwgcGljayBvdXQgdGhlIHBpZWNlcyBhbmQgZG8gc29tZSBjb25maWcuIFdlXG4gICAgLy8gYXJlIHBhc3NlZCBpbiB0aGUgXCJydHlwZXNcIiBwYXJ0IG9mIHRoZSBKU09OLlxuXG4gICAgLy8gRXh0cmFjdCByZWxldmFudCBzdHVmZiBmcm9tIGNvbmZpZywgcGVyaGFwcyB2YWxpZGF0aW5nXG4gICAgdmFyIHVybFByZWZpeCA9IHNpdGVjb25maWcudXJsUHJlZml4LFxuICAgICAgaXRlbXMgPSBzaXRlY29uZmlnLml0ZW1zO1xuXG5cbiAgICBfKGl0ZW1zKS5mb3JFYWNoKFxuICAgICAgZnVuY3Rpb24gKHJ0eXBlKSB7XG4gICAgICAgIF90aGlzLmFkZChydHlwZS5pZCwgcnR5cGUubGFiZWwpO1xuXG4gICAgICB9XG4gICAgKTtcbiAgICBfdGhpcy51cmxQcmVmaXggPSBfdGhpcy51cmxQcmVmaXg7XG5cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUlR5cGVzU2VydmljZTogUlR5cGVzU2VydmljZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBNb2R1bGVDb25maWcoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3J0eXBlcycsIHtcbiAgICAgICAgICAgICBwYXJlbnQ6ICdyb290JyxcbiAgICAgICAgICAgICB1cmw6ICcvcnR5cGVzJ1xuICAgICAgICAgICB9KVxuXG4gICAgLy8gR2VuZXJpYyBsaXN0IG9mIHJlc291cmNlcyBvZiBhIHJlc291cmNlIHR5cGVcbiAgICAuc3RhdGUoJ3J0eXBlcy5saXN0Jywge1xuICAgICAgICAgICAgIHVybDogJy97cnR5cGV9JywgLy8gV2lsbCBuZWVkIHJlZ2V4IHRoYXQgb21pdHMgXCJtYW5hZ2VcIlxuICAgICAgICAgICAgIHRpdGxlOiAnTGlzdCBSZXNvdXJjZXMnLFxuICAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAnbWQtY29udGVudEByb290Jzoge1xuICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbGlzdC5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLkxpc3RDb250cm9sbGVyLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyQXM6ICdjdHJsJyxcbiAgICAgICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBmdW5jdGlvbiAoUmVzdGFuZ3VsYXIsICRzdGF0ZVBhcmFtcywgTWRSVHlwZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgIHZhciBydHlwZSA9ICRzdGF0ZVBhcmFtcy5ydHlwZTtcbiAgICAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSBNZFJUeXBlcy51cmxQcmVmaXggKyAnLycgKyBydHlwZSArICcvaXRlbXMnO1xuICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFJlc3Rhbmd1bGFyLmFsbCh1cmwpLmdldExpc3QoKTtcbiAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdydHlwZXMuaXRlbScsIHtcbiAgICAgICAgICAgICB1cmw6ICcve3J0eXBlfS97aWR9JyxcbiAgICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICBpdGVtOiBmdW5jdGlvbiAoUmVzdGFuZ3VsYXIsICRzdGF0ZVBhcmFtcywgTWRSVHlwZXMpIHtcbiAgICAgICAgICAgICAgICAgdmFyIHJ0eXBlID0gJHN0YXRlUGFyYW1zLnJ0eXBlO1xuICAgICAgICAgICAgICAgICB2YXIgaWQgPSAkc3RhdGVQYXJhbXMuaWQ7XG4gICAgICAgICAgICAgICAgIHZhciB1cmwgPSBNZFJUeXBlcy51cmxQcmVmaXggKyAnLycgKyBydHlwZSArICcvJyArIGlkO1xuICAgICAgICAgICAgICAgICByZXR1cm4gUmVzdGFuZ3VsYXIub25lKHVybCkuZ2V0KCk7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KVxuICAgIC5zdGF0ZSgncnR5cGVzLml0ZW0uZWRpdCcsIHtcbiAgICAgICAgICAgICB1cmw6ICcvZWRpdCcsXG4gICAgICAgICAgICAgdGl0bGU6ICdFZGl0IFJlc291cmNlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2VkaXQuaHRtbCcpLFxuICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5FZGl0Q29udHJvbGxlcixcbiAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY3RybCdcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB9XG4gICAgICAgICAgIH0pXG4gICAgLnN0YXRlKCdydHlwZXMubWFuYWdlJywge1xuICAgICAgICAgICAgIHVybDogJy9tYW5hZ2UnLFxuICAgICAgICAgICAgIHRpdGxlOiAnTWFuYWdlJyxcbiAgICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgJ21kLWNvbnRlbnRAcm9vdCc6IHtcbiAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL21hbmFnZS5odG1sJyksXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLk1hbmFnZUNvbnRyb2xsZXIsXG4gICAgICAgICAgICAgICAgIGNvbnRyb2xsZXJBczogJ2N0cmwnXG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENvbmZpZzogTW9kdWxlQ29uZmlnXG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG4gIDxoMT5FZGl0IHt7Y3RybC5pdGVtLnRpdGxlfX08L2gxPlxcbiAgPG1kLWZvcm0gbWQtbW9kZWw9XCJjdHJsLml0ZW1cIlxcbiAgICAgICAgICAgbWQtc2NoZW1hPVwie3tjdHJsLnNjaGVtYUlkfX1cIlxcbiAgICAgICAgICAgbWQtZm9ybT1cInt7Y3RybC5mb3JtSWR9fVwiPjwvbWQtZm9ybT5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDJlbVwiPlxcbiAgPGgxPkxpc3QgPGNvZGU+e3sgY3RybC5ydHlwZSB9fTwvY29kZT48L2gxPlxcbiAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtc3RyaXBlZFwiPlxcbiAgICA8dGhlYWQ+XFxuICAgIDx0cj5cXG4gICAgICA8dGg+SUQ8L3RoPlxcbiAgICAgIDx0aD5UaXRsZTwvdGg+XFxuICAgICAgPHRoPkFjdGlvbjwvdGg+XFxuICAgIDwvdHI+XFxuICAgIDwvdGhlYWQ+XFxuICAgIDx0Ym9keT5cXG4gICAgPHRyIG5nLXJlcGVhdD1cIml0ZW0gaW4gY3RybC5pdGVtc1wiPlxcbiAgICAgIDx0ZCBuZy1iaW5kPVwiaXRlbS5pZFwiPmlkPC90ZD5cXG4gICAgICA8dGQgbmctYmluZD1cIml0ZW0udGl0bGVcIj50aXRsZTwvdGQ+XFxuICAgICAgPHRkPlxcbiAgICAgICAgPGEgY2xhc3M9XCJidG4gYnRuLWRlZmF1bHQgYnRuLXhzXCJcXG4gICAgICAgICAgICB1aS1zcmVmPVwicnR5cGVzLml0ZW0uZWRpdCh7cnR5cGU6IGN0cmwucnR5cGUsIGlkOiBpdGVtLmlkfSlcIj5cXG4gICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXBlbmNpbFwiPjwvaT5cXG4gICAgICAgIDwvYT5cXG4gICAgICA8L3RkPlxcbiAgICA8L3RyPlxcbiAgICA8L3Rib2R5PlxcbiAgPC90YWJsZT5cXG48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuICA8aDE+TWFuYWdlIFJlc291cmNlIFR5cGVzPC9oMT5cXG48L2Rpdj4nOyJdfQ==
