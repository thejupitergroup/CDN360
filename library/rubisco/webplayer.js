(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.WebPlayer = {})));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    var ExtendableError = /** @class */ (function (_super) {
        __extends(ExtendableError, _super);
        function ExtendableError(message) {
            var _this = _super.call(this, message) || this;
            Object.defineProperty(_this, 'message', {
                enumerable: false,
                value: message,
            });
            Object.defineProperty(_this, 'name', {
                enumerable: false,
                value: _this.constructor.name,
            });
            Error.captureStackTrace(_this, _this.constructor);
            return _this;
        }
        return ExtendableError;
    }(Error));

    var NotAFunctionError = /** @class */ (function (_super) {
        __extends(NotAFunctionError, _super);
        function NotAFunctionError(functionName, expectedType, givenType) {
            return _super.call(this, "The function " + functionName + " expected a " + expectedType + ", " + givenType + " given.") || this;
        }
        return NotAFunctionError;
    }(ExtendableError));

    var Lifetime;
    (function (Lifetime) {
        Lifetime["SINGLETON"] = "singleton";
        Lifetime["TRANSIENT"] = "transient";
        Lifetime["SCOPED"] = "scoped";
    })(Lifetime || (Lifetime = {}));
    var Lifetime$1 = Lifetime;

    var PROPERTY_FOR_DEPENDENCIES = 'dependencies';
    var makeFluidInterface = function (obj) {
        var setLifetime = function (value) {
            obj.lifetime = value;
            return obj;
        };
        return {
            setLifetime: setLifetime,
            transient: function () { return setLifetime(Lifetime$1.TRANSIENT); },
            scoped: function () { return setLifetime(Lifetime$1.SCOPED); },
            singleton: function () { return setLifetime(Lifetime$1.SINGLETON); },
        };
    };
    var asValue = function (value) {
        var resolve = function () { return value; };
        return {
            resolve: resolve,
            lifetime: Lifetime$1.TRANSIENT,
        };
    };
    var asFunction = function (fn, options) {
        if (typeof fn !== 'function') {
            throw new NotAFunctionError('asFunction', 'function', typeof fn);
        }
        var defaults = {
            lifetime: Lifetime$1.TRANSIENT,
        };
        options = __assign({}, defaults, options);
        var resolve = generateResolve(fn);
        var result = {
            resolve: resolve,
            lifetime: options.lifetime,
        };
        result.resolve = resolve.bind(result);
        __assign(result, makeFluidInterface(result));
        return result;
    };
    var asClass = function (Type, options) {
        if (typeof Type !== 'function') {
            throw new NotAFunctionError('asClass', 'class', typeof Type);
        }
        var defaults = {
            lifetime: Lifetime$1.TRANSIENT,
        };
        options = __assign({}, defaults, options);
        // A function to handle object construction for us, as to make the generateResolve more reusable
        var newClass = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new (Type.bind.apply(Type, [void 0].concat(args)))();
        };
        var resolve = generateResolve(newClass, Type);
        var result = {
            resolve: resolve,
            lifetime: options.lifetime,
        };
        result.resolve = resolve.bind(result);
        __assign(result, makeFluidInterface(result));
        return result;
    };
    function generateResolve(fn, dependencyParseTarget) {
        // If the function used for dependency parsing is falsy, use the supplied function
        if (!dependencyParseTarget) {
            dependencyParseTarget = fn;
        }
        // Try to resolve the dependencies
        var dependencies = dependencyParseTarget[PROPERTY_FOR_DEPENDENCIES] || [];
        // Use a regular function instead of an arrow function to facilitate binding to the registration.
        return function resolve(container) {
            if (dependencies.length > 0) {
                var wrappedModules = dependencies.reduce(function (wrapper, dependency) {
                    wrapper[dependency] = container.resolve(dependency);
                    return wrapper;
                }, {});
                return fn(wrappedModules, container);
            }
            return fn(container);
        };
    }
    var registrations = {
        asValue: asValue,
        asFunction: asFunction,
        asClass: asClass,
    };

    var createErrorMessage = function (name, resolutionStack, message) {
        resolutionStack = resolutionStack.slice();
        resolutionStack.push(name);
        var resolutionPathString = resolutionStack.join(' -> ');
        var msg = "Could not resolve '" + name + "'.";
        if (message) {
            msg += " " + message + " \n\n Resolution path: " + resolutionPathString;
        }
        return msg;
    };
    var ResolutionError = /** @class */ (function (_super) {
        __extends(ResolutionError, _super);
        function ResolutionError(name, resolutionStack, message) {
            return _super.call(this, createErrorMessage(name, resolutionStack, message)) || this;
        }
        return ResolutionError;
    }(ExtendableError));

    function nameValueToObject (name, value) {
        var _a;
        if (typeof name !== 'object') {
            return __assign((_a = {}, _a[name] = value, _a));
        }
        return name;
    }

    var FAMILY_TREE = '__familyTree__';
    var Container = /** @class */ (function () {
        function Container(options, _parentContainer) {
            this._registrations = {};
            this._resolutionStack = [];
            this.options = __assign({}, options);
            this._parentContainer = _parentContainer || null;
            this[FAMILY_TREE] = this._parentContainer
                ? [this].concat(this._parentContainer[FAMILY_TREE])
                : [this];
            this.cache = {};
        }
        Object.defineProperty(Container.prototype, "registrations", {
            get: function () {
                return __assign({}, this._parentContainer && this._parentContainer.registrations, this._registrations);
            },
            enumerable: true,
            configurable: true
        });
        Container.prototype._registerAs = function (fn, verbatimValue, name, value, options) {
            var _this = this;
            var registrations$$1 = nameValueToObject(name, value);
            Object.keys(registrations$$1).forEach(function (key) {
                var valueToRegister = registrations$$1[key];
                // If we have options, copy them over.
                options = __assign({}, options);
                /* ignore coverage */
                if (!verbatimValue && Array.isArray(valueToRegister)) {
                    // The ('name', [value, options]) style
                    options = __assign({}, options, valueToRegister[1]);
                    valueToRegister = valueToRegister[0];
                }
                _this.register(key, fn(valueToRegister, options));
            });
            // Chaining
            return this;
        };
        Container.prototype.createScope = function () {
            return new Container(this.options, this);
        };
        Container.prototype.register = function (name, registration) {
            var _this = this;
            var obj = nameValueToObject(name, registration);
            Object.keys(obj).forEach(function (key) {
                _this._registrations[key] = obj[key];
            });
            return this;
        };
        Container.prototype.registerClass = function (name, value, options) {
            return this._registerAs(asClass, false, name, value, options);
        };
        Container.prototype.registerFunction = function (name, value, options) {
            return this._registerAs(asFunction, false, name, value, options);
        };
        Container.prototype.registerValue = function (name, value, options) {
            return this._registerAs(asValue, true, name, value, options);
        };
        Container.prototype.resolve = function (name) {
            // We need a reference to the root container,
            // so we can retrieve and store singletons.
            var root = this[FAMILY_TREE][this[FAMILY_TREE].length - 1];
            try {
                // Grab the registration by name.
                var registration = this.registrations[name];
                if (this._resolutionStack.indexOf(name) > -1) {
                    throw new ResolutionError(name, this._resolutionStack, 'Cyclic dependencies detected.');
                }
                if (!registration) {
                    throw new ResolutionError(name, this._resolutionStack);
                }
                // Pushes the currently-resolving module name onto the stack
                this._resolutionStack.push(name);
                // Do the thing
                var cached = void 0;
                var resolved = void 0;
                switch (registration.lifetime) {
                    case Lifetime$1.TRANSIENT:
                        // Transient lifetime means resolve every time.
                        resolved = registration.resolve(this);
                        break;
                    case Lifetime$1.SINGLETON:
                        // Singleton lifetime means cache at all times, regardless of scope.
                        cached = root.cache[name];
                        if (cached === undefined) {
                            resolved = registration.resolve(this);
                            root.cache[name] = resolved;
                        }
                        else {
                            resolved = cached;
                        }
                        break;
                    case Lifetime$1.SCOPED:
                        // Scoped lifetime means that the container
                        // that resolves the registration also caches it.
                        // When a registration is not found, we travel up
                        // the family tree until we find one that is cached.
                        // Note: The first element in the family tree is this container.
                        for (var _i = 0, _a = this[FAMILY_TREE]; _i < _a.length; _i++) {
                            var _containerFromFamiltyTree = _a[_i];
                            cached = _containerFromFamiltyTree.cache[name];
                            if (cached !== undefined) {
                                // We found one!
                                resolved = cached;
                                break;
                            }
                        }
                        // If we still have not found one, we need to resolve and cache it.
                        if (cached === undefined) {
                            resolved = registration.resolve(this);
                            this.cache[name] = resolved;
                        }
                        break;
                    default:
                        throw new ResolutionError(name, this._resolutionStack, "Unknown lifetime \"" + registration.lifetime + "\"");
                }
                // Pop it from the stack again, ready for the next resolution
                this._resolutionStack.pop();
                return resolved;
            }
            catch (err) {
                // When we get an error we need to reset the stack.
                this._resolutionStack = [];
                throw err;
            }
        };
        return Container;
    }());
    function createContainer(options, __parentContainer) {
        return new Container(options, __parentContainer);
    }

    var DependencyContainer = __assign({ createContainer: createContainer,
        Lifetime: Lifetime$1 }, registrations);

    var IPHONE_PATTERN = /iphone/i;
    var IPOD_PATTERN = /ipod/i;
    var IPAD_PATTERN = /ipad/i;
    var ANDROID_PATTERN = /(android)/i;
    var SAFARI_PATTERN = /^((?!chrome|android).)*safari/i;
    // There is some iPhone/iPad/iPod in Windows Phone...
    // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    var isIE = function () { return !!window.MSStream; };
    var getUserAgent = function () { return window.navigator && window.navigator.userAgent; };
    var isIPhone = function () { return !isIE() && IPHONE_PATTERN.test(getUserAgent()); };
    var isIPod = function () { return !isIE() && IPOD_PATTERN.test(getUserAgent()); };
    var isIPad = function () { return !isIE() && IPAD_PATTERN.test(getUserAgent()); };
    var isIOS = function () { return isIPhone() || isIPod() || isIPad(); };
    var isAndroid = function () { return ANDROID_PATTERN.test(getUserAgent()); };
    var isSafari = function () { return SAFARI_PATTERN.test(getUserAgent()); };

    var convertUIConfigForIOS = function (params) { return (__assign({}, params, { disableControlWithClickOnPlayer: true, disableControlWithKeyboard: true, hideMainUI: true, nativeBrowserControls: true })); };
    var convertUIConfigForAndroid = function (params) { return (__assign({}, params, { disableControlWithClickOnPlayer: true, disableControlWithKeyboard: true })); };
    var convertToDeviceRelatedConfig = function (params) {
        if (isIOS()) {
            return convertUIConfigForIOS(params);
        }
        if (isAndroid()) {
            return convertUIConfigForAndroid(params);
        }
        return params;
    };

    var PLAYER_API_PROPERTY = '___playerAPI';
    var checkDescriptorsOnEquality = function (desc1, desc2) {
        return desc1.value === desc2.value &&
            desc1.get === desc2.get &&
            desc1.set === desc2.set;
    };
    var playerAPI = function (name) { return function (target, property, descriptor) {
        var methodName = name || property;
        if (!target[PLAYER_API_PROPERTY]) {
            target[PLAYER_API_PROPERTY] = {};
        }
        if (target[PLAYER_API_PROPERTY][methodName]) {
            if (!checkDescriptorsOnEquality(target[PLAYER_API_PROPERTY][methodName], descriptor)) {
                throw new Error("Method \"" + methodName + "\" for public API in " + target.constructor.name + " is already defined");
            }
        }
        target[PLAYER_API_PROPERTY][methodName] = descriptor;
    }; };

    var Player = /** @class */ (function () {
        function Player(params, scope, defaultModulesNames, additionalModuleNames, themeConfig) {
            if (defaultModulesNames === void 0) { defaultModulesNames = []; }
            if (additionalModuleNames === void 0) { additionalModuleNames = []; }
            this._scope = scope;
            this._scope.registerValue({
                config: convertToDeviceRelatedConfig(params),
            });
            this._scope.registerValue({
                themeConfig: themeConfig,
            });
            this._config = this._scope.resolve('config');
            this._resolveAdditionalModules(additionalModuleNames);
            this._resolveDefaultModules(defaultModulesNames);
        }
        /*
          Separation for default and additional modules is needed
          for future implementation of public methods of resolved modules and
          could be abolished in future
        */
        Player.prototype._resolveDefaultModules = function (modulesNames) {
            var _this = this;
            this._defaultModules = modulesNames.reduce(function (modules, moduleName) {
                if (_this._additionalModules[moduleName]) {
                    return modules;
                }
                var resolvedModule = _this._scope.resolve(moduleName);
                _this._addPlayerAPIFromModule(resolvedModule);
                modules[moduleName] = resolvedModule;
                return modules;
            }, {});
        };
        Player.prototype._resolveAdditionalModules = function (modulesNames) {
            var _this = this;
            this._additionalModules = modulesNames.reduce(function (modules, moduleName) {
                var resolvedModule = _this._scope.resolve(moduleName);
                _this._addPlayerAPIFromModule(resolvedModule);
                modules[moduleName] = resolvedModule;
                return modules;
            }, {});
        };
        Player.prototype._getWrappedCallToModuleFunction = function (module, fn) {
            var _this = this;
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (_this._destroyed) {
                    throw new Error('Player instance is destroyed');
                }
                return fn.apply(module, args);
            };
        };
        Player.prototype._getPlayerAPIMethodDescriptor = function (module, descriptor) {
            var playerMethodDescriptor = {
                enumerable: true,
                configurable: true,
            };
            var get = descriptor.get, set = descriptor.set, value = descriptor.value;
            if (get) {
                playerMethodDescriptor.get = this._getWrappedCallToModuleFunction(module, get);
            }
            if (set) {
                playerMethodDescriptor.set = this._getWrappedCallToModuleFunction(module, set);
            }
            if (value) {
                playerMethodDescriptor.value = this._getWrappedCallToModuleFunction(module, value);
                playerMethodDescriptor.writable = true;
            }
            return playerMethodDescriptor;
        };
        Player.prototype._getModuleApi = function (module) {
            return module.getAPI ? module.getAPI() : module[PLAYER_API_PROPERTY];
        };
        Player.prototype._addPlayerAPIFromModule = function (module) {
            var _this = this;
            var moduleApi = this._getModuleApi(module);
            var getDescriptor = module.getAPI
                ? function (apiKey) { return Object.getOwnPropertyDescriptor(moduleApi, apiKey); }
                : function (apiKey) {
                    return _this._getPlayerAPIMethodDescriptor(module, moduleApi[apiKey]);
                };
            if (moduleApi) {
                Object.keys(moduleApi).forEach(function (apiKey) {
                    if (_this[apiKey]) {
                        throw new Error("API method " + apiKey + " is already defined in Player facade");
                    }
                    Object.defineProperty(_this, apiKey, getDescriptor(apiKey));
                });
            }
        };
        Player.prototype._clearPlayerAPIForModule = function (module) {
            var _this = this;
            var moduleApi = this._getModuleApi(module);
            if (moduleApi) {
                Object.keys(moduleApi).forEach(function (apiKey) {
                    delete _this[apiKey];
                });
            }
        };
        Player.prototype.destroy = function () {
            var _this = this;
            Object.keys(this._defaultModules).forEach(function (moduleName) {
                var module = _this._defaultModules[moduleName];
                _this._clearPlayerAPIForModule(module);
                module.destroy();
            });
            Object.keys(this._additionalModules).forEach(function (moduleName) {
                var module = _this._additionalModules[moduleName];
                _this._clearPlayerAPIForModule(module);
                if (module.destroy) {
                    module.destroy();
                }
            });
            this._defaultModules = null;
            this._additionalModules = null;
            this._config = null;
            this._scope = null;
            this._destroyed = true;
        };
        return Player;
    }());

    /**
     * A collection of shims that provide minimal functionality of the ES6 collections.
     *
     * These implementations are not meant to be used outside of the ResizeObserver
     * modules as they cover only a limited range of use cases.
     */
    /* eslint-disable require-jsdoc, valid-jsdoc */
    var MapShim = (function () {
        if (typeof Map !== 'undefined') {
            return Map;
        }
        /**
         * Returns index in provided array that matches the specified key.
         *
         * @param {Array<Array>} arr
         * @param {*} key
         * @returns {number}
         */
        function getIndex(arr, key) {
            var result = -1;
            arr.some(function (entry, index) {
                if (entry[0] === key) {
                    result = index;
                    return true;
                }
                return false;
            });
            return result;
        }
        return /** @class */ (function () {
            function class_1() {
                this.__entries__ = [];
            }
            Object.defineProperty(class_1.prototype, "size", {
                /**
                 * @returns {boolean}
                 */
                get: function () {
                    return this.__entries__.length;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * @param {*} key
             * @returns {*}
             */
            class_1.prototype.get = function (key) {
                var index = getIndex(this.__entries__, key);
                var entry = this.__entries__[index];
                return entry && entry[1];
            };
            /**
             * @param {*} key
             * @param {*} value
             * @returns {void}
             */
            class_1.prototype.set = function (key, value) {
                var index = getIndex(this.__entries__, key);
                if (~index) {
                    this.__entries__[index][1] = value;
                }
                else {
                    this.__entries__.push([key, value]);
                }
            };
            /**
             * @param {*} key
             * @returns {void}
             */
            class_1.prototype.delete = function (key) {
                var entries = this.__entries__;
                var index = getIndex(entries, key);
                if (~index) {
                    entries.splice(index, 1);
                }
            };
            /**
             * @param {*} key
             * @returns {void}
             */
            class_1.prototype.has = function (key) {
                return !!~getIndex(this.__entries__, key);
            };
            /**
             * @returns {void}
             */
            class_1.prototype.clear = function () {
                this.__entries__.splice(0);
            };
            /**
             * @param {Function} callback
             * @param {*} [ctx=null]
             * @returns {void}
             */
            class_1.prototype.forEach = function (callback, ctx) {
                if (ctx === void 0) { ctx = null; }
                for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                    var entry = _a[_i];
                    callback.call(ctx, entry[1], entry[0]);
                }
            };
            return class_1;
        }());
    })();

    /**
     * Detects whether window and document objects are available in current environment.
     */
    var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

    // Returns global object of a current environment.
    var global$1 = (function () {
        if (typeof global !== 'undefined' && global.Math === Math) {
            return global;
        }
        if (typeof self !== 'undefined' && self.Math === Math) {
            return self;
        }
        if (typeof window !== 'undefined' && window.Math === Math) {
            return window;
        }
        // eslint-disable-next-line no-new-func
        return Function('return this')();
    })();

    /**
     * A shim for the requestAnimationFrame which falls back to the setTimeout if
     * first one is not supported.
     *
     * @returns {number} Requests' identifier.
     */
    var requestAnimationFrame$1 = (function () {
        if (typeof requestAnimationFrame === 'function') {
            // It's required to use a bounded function because IE sometimes throws
            // an "Invalid calling object" error if rAF is invoked without the global
            // object on the left hand side.
            return requestAnimationFrame.bind(global$1);
        }
        return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
    })();

    // Defines minimum timeout before adding a trailing call.
    var trailingTimeout = 2;
    /**
     * Creates a wrapper function which ensures that provided callback will be
     * invoked only once during the specified delay period.
     *
     * @param {Function} callback - Function to be invoked after the delay period.
     * @param {number} delay - Delay after which to invoke callback.
     * @returns {Function}
     */
    function throttle (callback, delay) {
        var leadingCall = false, trailingCall = false, lastCallTime = 0;
        /**
         * Invokes the original callback function and schedules new invocation if
         * the "proxy" was called during current request.
         *
         * @returns {void}
         */
        function resolvePending() {
            if (leadingCall) {
                leadingCall = false;
                callback();
            }
            if (trailingCall) {
                proxy();
            }
        }
        /**
         * Callback invoked after the specified delay. It will further postpone
         * invocation of the original function delegating it to the
         * requestAnimationFrame.
         *
         * @returns {void}
         */
        function timeoutCallback() {
            requestAnimationFrame$1(resolvePending);
        }
        /**
         * Schedules invocation of the original function.
         *
         * @returns {void}
         */
        function proxy() {
            var timeStamp = Date.now();
            if (leadingCall) {
                // Reject immediately following calls.
                if (timeStamp - lastCallTime < trailingTimeout) {
                    return;
                }
                // Schedule new call to be in invoked when the pending one is resolved.
                // This is important for "transitions" which never actually start
                // immediately so there is a chance that we might miss one if change
                // happens amids the pending invocation.
                trailingCall = true;
            }
            else {
                leadingCall = true;
                trailingCall = false;
                setTimeout(timeoutCallback, delay);
            }
            lastCallTime = timeStamp;
        }
        return proxy;
    }

    // Minimum delay before invoking the update of observers.
    var REFRESH_DELAY = 20;
    // A list of substrings of CSS properties used to find transition events that
    // might affect dimensions of observed elements.
    var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
    // Check if MutationObserver is available.
    var mutationObserverSupported = typeof MutationObserver !== 'undefined';
    /**
     * Singleton controller class which handles updates of ResizeObserver instances.
     */
    var ResizeObserverController = /** @class */ (function () {
        /**
         * Creates a new instance of ResizeObserverController.
         *
         * @private
         */
        function ResizeObserverController() {
            /**
             * Indicates whether DOM listeners have been added.
             *
             * @private {boolean}
             */
            this.connected_ = false;
            /**
             * Tells that controller has subscribed for Mutation Events.
             *
             * @private {boolean}
             */
            this.mutationEventsAdded_ = false;
            /**
             * Keeps reference to the instance of MutationObserver.
             *
             * @private {MutationObserver}
             */
            this.mutationsObserver_ = null;
            /**
             * A list of connected observers.
             *
             * @private {Array<ResizeObserverSPI>}
             */
            this.observers_ = [];
            this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
            this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
        }
        /**
         * Adds observer to observers list.
         *
         * @param {ResizeObserverSPI} observer - Observer to be added.
         * @returns {void}
         */
        ResizeObserverController.prototype.addObserver = function (observer) {
            if (!~this.observers_.indexOf(observer)) {
                this.observers_.push(observer);
            }
            // Add listeners if they haven't been added yet.
            if (!this.connected_) {
                this.connect_();
            }
        };
        /**
         * Removes observer from observers list.
         *
         * @param {ResizeObserverSPI} observer - Observer to be removed.
         * @returns {void}
         */
        ResizeObserverController.prototype.removeObserver = function (observer) {
            var observers = this.observers_;
            var index = observers.indexOf(observer);
            // Remove observer if it's present in registry.
            if (~index) {
                observers.splice(index, 1);
            }
            // Remove listeners if controller has no connected observers.
            if (!observers.length && this.connected_) {
                this.disconnect_();
            }
        };
        /**
         * Invokes the update of observers. It will continue running updates insofar
         * it detects changes.
         *
         * @returns {void}
         */
        ResizeObserverController.prototype.refresh = function () {
            var changesDetected = this.updateObservers_();
            // Continue running updates if changes have been detected as there might
            // be future ones caused by CSS transitions.
            if (changesDetected) {
                this.refresh();
            }
        };
        /**
         * Updates every observer from observers list and notifies them of queued
         * entries.
         *
         * @private
         * @returns {boolean} Returns "true" if any observer has detected changes in
         *      dimensions of it's elements.
         */
        ResizeObserverController.prototype.updateObservers_ = function () {
            // Collect observers that have active observations.
            var activeObservers = this.observers_.filter(function (observer) {
                return observer.gatherActive(), observer.hasActive();
            });
            // Deliver notifications in a separate cycle in order to avoid any
            // collisions between observers, e.g. when multiple instances of
            // ResizeObserver are tracking the same element and the callback of one
            // of them changes content dimensions of the observed target. Sometimes
            // this may result in notifications being blocked for the rest of observers.
            activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
            return activeObservers.length > 0;
        };
        /**
         * Initializes DOM listeners.
         *
         * @private
         * @returns {void}
         */
        ResizeObserverController.prototype.connect_ = function () {
            // Do nothing if running in a non-browser environment or if listeners
            // have been already added.
            if (!isBrowser || this.connected_) {
                return;
            }
            // Subscription to the "Transitionend" event is used as a workaround for
            // delayed transitions. This way it's possible to capture at least the
            // final state of an element.
            document.addEventListener('transitionend', this.onTransitionEnd_);
            window.addEventListener('resize', this.refresh);
            if (mutationObserverSupported) {
                this.mutationsObserver_ = new MutationObserver(this.refresh);
                this.mutationsObserver_.observe(document, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
            else {
                document.addEventListener('DOMSubtreeModified', this.refresh);
                this.mutationEventsAdded_ = true;
            }
            this.connected_ = true;
        };
        /**
         * Removes DOM listeners.
         *
         * @private
         * @returns {void}
         */
        ResizeObserverController.prototype.disconnect_ = function () {
            // Do nothing if running in a non-browser environment or if listeners
            // have been already removed.
            if (!isBrowser || !this.connected_) {
                return;
            }
            document.removeEventListener('transitionend', this.onTransitionEnd_);
            window.removeEventListener('resize', this.refresh);
            if (this.mutationsObserver_) {
                this.mutationsObserver_.disconnect();
            }
            if (this.mutationEventsAdded_) {
                document.removeEventListener('DOMSubtreeModified', this.refresh);
            }
            this.mutationsObserver_ = null;
            this.mutationEventsAdded_ = false;
            this.connected_ = false;
        };
        /**
         * "Transitionend" event handler.
         *
         * @private
         * @param {TransitionEvent} event
         * @returns {void}
         */
        ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
            var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
            // Detect whether transition may affect dimensions of an element.
            var isReflowProperty = transitionKeys.some(function (key) {
                return !!~propertyName.indexOf(key);
            });
            if (isReflowProperty) {
                this.refresh();
            }
        };
        /**
         * Returns instance of the ResizeObserverController.
         *
         * @returns {ResizeObserverController}
         */
        ResizeObserverController.getInstance = function () {
            if (!this.instance_) {
                this.instance_ = new ResizeObserverController();
            }
            return this.instance_;
        };
        /**
         * Holds reference to the controller's instance.
         *
         * @private {ResizeObserverController}
         */
        ResizeObserverController.instance_ = null;
        return ResizeObserverController;
    }());

    /**
     * Defines non-writable/enumerable properties of the provided target object.
     *
     * @param {Object} target - Object for which to define properties.
     * @param {Object} props - Properties to be defined.
     * @returns {Object} Target object.
     */
    var defineConfigurable = (function (target, props) {
        for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
            var key = _a[_i];
            Object.defineProperty(target, key, {
                value: props[key],
                enumerable: false,
                writable: false,
                configurable: true
            });
        }
        return target;
    });

    /**
     * Returns the global object associated with provided element.
     *
     * @param {Object} target
     * @returns {Object}
     */
    var getWindowOf = (function (target) {
        // Assume that the element is an instance of Node, which means that it
        // has the "ownerDocument" property from which we can retrieve a
        // corresponding global object.
        var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
        // Return the local global object if it's not possible extract one from
        // provided element.
        return ownerGlobal || global$1;
    });

    // Placeholder of an empty content rectangle.
    var emptyRect = createRectInit(0, 0, 0, 0);
    /**
     * Converts provided string to a number.
     *
     * @param {number|string} value
     * @returns {number}
     */
    function toFloat(value) {
        return parseFloat(value) || 0;
    }
    /**
     * Extracts borders size from provided styles.
     *
     * @param {CSSStyleDeclaration} styles
     * @param {...string} positions - Borders positions (top, right, ...)
     * @returns {number}
     */
    function getBordersSize(styles) {
        var positions = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            positions[_i - 1] = arguments[_i];
        }
        return positions.reduce(function (size, position) {
            var value = styles['border-' + position + '-width'];
            return size + toFloat(value);
        }, 0);
    }
    /**
     * Extracts paddings sizes from provided styles.
     *
     * @param {CSSStyleDeclaration} styles
     * @returns {Object} Paddings box.
     */
    function getPaddings(styles) {
        var positions = ['top', 'right', 'bottom', 'left'];
        var paddings = {};
        for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
            var position = positions_1[_i];
            var value = styles['padding-' + position];
            paddings[position] = toFloat(value);
        }
        return paddings;
    }
    /**
     * Calculates content rectangle of provided SVG element.
     *
     * @param {SVGGraphicsElement} target - Element content rectangle of which needs
     *      to be calculated.
     * @returns {DOMRectInit}
     */
    function getSVGContentRect(target) {
        var bbox = target.getBBox();
        return createRectInit(0, 0, bbox.width, bbox.height);
    }
    /**
     * Calculates content rectangle of provided HTMLElement.
     *
     * @param {HTMLElement} target - Element for which to calculate the content rectangle.
     * @returns {DOMRectInit}
     */
    function getHTMLElementContentRect(target) {
        // Client width & height properties can't be
        // used exclusively as they provide rounded values.
        var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
        // By this condition we can catch all non-replaced inline, hidden and
        // detached elements. Though elements with width & height properties less
        // than 0.5 will be discarded as well.
        //
        // Without it we would need to implement separate methods for each of
        // those cases and it's not possible to perform a precise and performance
        // effective test for hidden elements. E.g. even jQuery's ':visible' filter
        // gives wrong results for elements with width & height less than 0.5.
        if (!clientWidth && !clientHeight) {
            return emptyRect;
        }
        var styles = getWindowOf(target).getComputedStyle(target);
        var paddings = getPaddings(styles);
        var horizPad = paddings.left + paddings.right;
        var vertPad = paddings.top + paddings.bottom;
        // Computed styles of width & height are being used because they are the
        // only dimensions available to JS that contain non-rounded values. It could
        // be possible to utilize the getBoundingClientRect if only it's data wasn't
        // affected by CSS transformations let alone paddings, borders and scroll bars.
        var width = toFloat(styles.width), height = toFloat(styles.height);
        // Width & height include paddings and borders when the 'border-box' box
        // model is applied (except for IE).
        if (styles.boxSizing === 'border-box') {
            // Following conditions are required to handle Internet Explorer which
            // doesn't include paddings and borders to computed CSS dimensions.
            //
            // We can say that if CSS dimensions + paddings are equal to the "client"
            // properties then it's either IE, and thus we don't need to subtract
            // anything, or an element merely doesn't have paddings/borders styles.
            if (Math.round(width + horizPad) !== clientWidth) {
                width -= getBordersSize(styles, 'left', 'right') + horizPad;
            }
            if (Math.round(height + vertPad) !== clientHeight) {
                height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
            }
        }
        // Following steps can't be applied to the document's root element as its
        // client[Width/Height] properties represent viewport area of the window.
        // Besides, it's as well not necessary as the <html> itself neither has
        // rendered scroll bars nor it can be clipped.
        if (!isDocumentElement(target)) {
            // In some browsers (only in Firefox, actually) CSS width & height
            // include scroll bars size which can be removed at this step as scroll
            // bars are the only difference between rounded dimensions + paddings
            // and "client" properties, though that is not always true in Chrome.
            var vertScrollbar = Math.round(width + horizPad) - clientWidth;
            var horizScrollbar = Math.round(height + vertPad) - clientHeight;
            // Chrome has a rather weird rounding of "client" properties.
            // E.g. for an element with content width of 314.2px it sometimes gives
            // the client width of 315px and for the width of 314.7px it may give
            // 314px. And it doesn't happen all the time. So just ignore this delta
            // as a non-relevant.
            if (Math.abs(vertScrollbar) !== 1) {
                width -= vertScrollbar;
            }
            if (Math.abs(horizScrollbar) !== 1) {
                height -= horizScrollbar;
            }
        }
        return createRectInit(paddings.left, paddings.top, width, height);
    }
    /**
     * Checks whether provided element is an instance of the SVGGraphicsElement.
     *
     * @param {Element} target - Element to be checked.
     * @returns {boolean}
     */
    var isSVGGraphicsElement = (function () {
        // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
        // interface.
        if (typeof SVGGraphicsElement !== 'undefined') {
            return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
        }
        // If it's so, then check that element is at least an instance of the
        // SVGElement and that it has the "getBBox" method.
        // eslint-disable-next-line no-extra-parens
        return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
            typeof target.getBBox === 'function'); };
    })();
    /**
     * Checks whether provided element is a document element (<html>).
     *
     * @param {Element} target - Element to be checked.
     * @returns {boolean}
     */
    function isDocumentElement(target) {
        return target === getWindowOf(target).document.documentElement;
    }
    /**
     * Calculates an appropriate content rectangle for provided html or svg element.
     *
     * @param {Element} target - Element content rectangle of which needs to be calculated.
     * @returns {DOMRectInit}
     */
    function getContentRect(target) {
        if (!isBrowser) {
            return emptyRect;
        }
        if (isSVGGraphicsElement(target)) {
            return getSVGContentRect(target);
        }
        return getHTMLElementContentRect(target);
    }
    /**
     * Creates rectangle with an interface of the DOMRectReadOnly.
     * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
     *
     * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
     * @returns {DOMRectReadOnly}
     */
    function createReadOnlyRect(_a) {
        var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
        // If DOMRectReadOnly is available use it as a prototype for the rectangle.
        var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
        var rect = Object.create(Constr.prototype);
        // Rectangle's properties are not writable and non-enumerable.
        defineConfigurable(rect, {
            x: x, y: y, width: width, height: height,
            top: y,
            right: x + width,
            bottom: height + y,
            left: x
        });
        return rect;
    }
    /**
     * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
     * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
     *
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} width - Rectangle's width.
     * @param {number} height - Rectangle's height.
     * @returns {DOMRectInit}
     */
    function createRectInit(x, y, width, height) {
        return { x: x, y: y, width: width, height: height };
    }

    /**
     * Class that is responsible for computations of the content rectangle of
     * provided DOM element and for keeping track of it's changes.
     */
    var ResizeObservation = /** @class */ (function () {
        /**
         * Creates an instance of ResizeObservation.
         *
         * @param {Element} target - Element to be observed.
         */
        function ResizeObservation(target) {
            /**
             * Broadcasted width of content rectangle.
             *
             * @type {number}
             */
            this.broadcastWidth = 0;
            /**
             * Broadcasted height of content rectangle.
             *
             * @type {number}
             */
            this.broadcastHeight = 0;
            /**
             * Reference to the last observed content rectangle.
             *
             * @private {DOMRectInit}
             */
            this.contentRect_ = createRectInit(0, 0, 0, 0);
            this.target = target;
        }
        /**
         * Updates content rectangle and tells whether it's width or height properties
         * have changed since the last broadcast.
         *
         * @returns {boolean}
         */
        ResizeObservation.prototype.isActive = function () {
            var rect = getContentRect(this.target);
            this.contentRect_ = rect;
            return (rect.width !== this.broadcastWidth ||
                rect.height !== this.broadcastHeight);
        };
        /**
         * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
         * from the corresponding properties of the last observed content rectangle.
         *
         * @returns {DOMRectInit} Last observed content rectangle.
         */
        ResizeObservation.prototype.broadcastRect = function () {
            var rect = this.contentRect_;
            this.broadcastWidth = rect.width;
            this.broadcastHeight = rect.height;
            return rect;
        };
        return ResizeObservation;
    }());

    var ResizeObserverEntry = /** @class */ (function () {
        /**
         * Creates an instance of ResizeObserverEntry.
         *
         * @param {Element} target - Element that is being observed.
         * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
         */
        function ResizeObserverEntry(target, rectInit) {
            var contentRect = createReadOnlyRect(rectInit);
            // According to the specification following properties are not writable
            // and are also not enumerable in the native implementation.
            //
            // Property accessors are not being used as they'd require to define a
            // private WeakMap storage which may cause memory leaks in browsers that
            // don't support this type of collections.
            defineConfigurable(this, { target: target, contentRect: contentRect });
        }
        return ResizeObserverEntry;
    }());

    var ResizeObserverSPI = /** @class */ (function () {
        /**
         * Creates a new instance of ResizeObserver.
         *
         * @param {ResizeObserverCallback} callback - Callback function that is invoked
         *      when one of the observed elements changes it's content dimensions.
         * @param {ResizeObserverController} controller - Controller instance which
         *      is responsible for the updates of observer.
         * @param {ResizeObserver} callbackCtx - Reference to the public
         *      ResizeObserver instance which will be passed to callback function.
         */
        function ResizeObserverSPI(callback, controller, callbackCtx) {
            /**
             * Collection of resize observations that have detected changes in dimensions
             * of elements.
             *
             * @private {Array<ResizeObservation>}
             */
            this.activeObservations_ = [];
            /**
             * Registry of the ResizeObservation instances.
             *
             * @private {Map<Element, ResizeObservation>}
             */
            this.observations_ = new MapShim();
            if (typeof callback !== 'function') {
                throw new TypeError('The callback provided as parameter 1 is not a function.');
            }
            this.callback_ = callback;
            this.controller_ = controller;
            this.callbackCtx_ = callbackCtx;
        }
        /**
         * Starts observing provided element.
         *
         * @param {Element} target - Element to be observed.
         * @returns {void}
         */
        ResizeObserverSPI.prototype.observe = function (target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }
            // Do nothing if current environment doesn't have the Element interface.
            if (typeof Element === 'undefined' || !(Element instanceof Object)) {
                return;
            }
            if (!(target instanceof getWindowOf(target).Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }
            var observations = this.observations_;
            // Do nothing if element is already being observed.
            if (observations.has(target)) {
                return;
            }
            observations.set(target, new ResizeObservation(target));
            this.controller_.addObserver(this);
            // Force the update of observations.
            this.controller_.refresh();
        };
        /**
         * Stops observing provided element.
         *
         * @param {Element} target - Element to stop observing.
         * @returns {void}
         */
        ResizeObserverSPI.prototype.unobserve = function (target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }
            // Do nothing if current environment doesn't have the Element interface.
            if (typeof Element === 'undefined' || !(Element instanceof Object)) {
                return;
            }
            if (!(target instanceof getWindowOf(target).Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }
            var observations = this.observations_;
            // Do nothing if element is not being observed.
            if (!observations.has(target)) {
                return;
            }
            observations.delete(target);
            if (!observations.size) {
                this.controller_.removeObserver(this);
            }
        };
        /**
         * Stops observing all elements.
         *
         * @returns {void}
         */
        ResizeObserverSPI.prototype.disconnect = function () {
            this.clearActive();
            this.observations_.clear();
            this.controller_.removeObserver(this);
        };
        /**
         * Collects observation instances the associated element of which has changed
         * it's content rectangle.
         *
         * @returns {void}
         */
        ResizeObserverSPI.prototype.gatherActive = function () {
            var _this = this;
            this.clearActive();
            this.observations_.forEach(function (observation) {
                if (observation.isActive()) {
                    _this.activeObservations_.push(observation);
                }
            });
        };
        /**
         * Invokes initial callback function with a list of ResizeObserverEntry
         * instances collected from active resize observations.
         *
         * @returns {void}
         */
        ResizeObserverSPI.prototype.broadcastActive = function () {
            // Do nothing if observer doesn't have active observations.
            if (!this.hasActive()) {
                return;
            }
            var ctx = this.callbackCtx_;
            // Create ResizeObserverEntry instance for every active observation.
            var entries = this.activeObservations_.map(function (observation) {
                return new ResizeObserverEntry(observation.target, observation.broadcastRect());
            });
            this.callback_.call(ctx, entries, ctx);
            this.clearActive();
        };
        /**
         * Clears the collection of active observations.
         *
         * @returns {void}
         */
        ResizeObserverSPI.prototype.clearActive = function () {
            this.activeObservations_.splice(0);
        };
        /**
         * Tells whether observer has active observations.
         *
         * @returns {boolean}
         */
        ResizeObserverSPI.prototype.hasActive = function () {
            return this.activeObservations_.length > 0;
        };
        return ResizeObserverSPI;
    }());

    // Registry of internal observers. If WeakMap is not available use current shim
    // for the Map collection as it has all required methods and because WeakMap
    // can't be fully polyfilled anyway.
    var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
    /**
     * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
     * exposing only those methods and properties that are defined in the spec.
     */
    var ResizeObserver = /** @class */ (function () {
        /**
         * Creates a new instance of ResizeObserver.
         *
         * @param {ResizeObserverCallback} callback - Callback that is invoked when
         *      dimensions of the observed elements change.
         */
        function ResizeObserver(callback) {
            if (!(this instanceof ResizeObserver)) {
                throw new TypeError('Cannot call a class as a function.');
            }
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }
            var controller = ResizeObserverController.getInstance();
            var observer = new ResizeObserverSPI(callback, controller, this);
            observers.set(this, observer);
        }
        return ResizeObserver;
    }());
    // Expose public methods of ResizeObserver.
    [
        'observe',
        'unobserve',
        'disconnect'
    ].forEach(function (method) {
        ResizeObserver.prototype[method] = function () {
            var _a;
            return (_a = observers.get(this))[method].apply(_a, arguments);
        };
    });

    var index = (function () {
        // Export existing implementation if available.
        if (typeof global$1.ResizeObserver !== 'undefined') {
            return global$1.ResizeObserver;
        }
        return ResizeObserver;
    })();

    // Code from ally.js
    /*
      Observe keyboard-, pointer-, mouse- and touch-events so that a query for
      the current interaction type can be made at any time. For pointer interaction
      this observer is limited to pointer button down/up - move is not observed!

      USAGE:
        var listener = engage();
        listener.get() === {pointer: Boolean, key: Boolean}
    */
    // counters to track primary input
    var _activePointers = 0;
    var _activeKeys = 0;
    var pointerStartEvents = [
        'touchstart',
        'pointerdown',
        'MSPointerDown',
        'mousedown',
    ];
    var pointerEndEvents = [
        'touchend',
        'touchcancel',
        'pointerup',
        'MSPointerUp',
        'pointercancel',
        'MSPointerCancel',
        'mouseup',
    ];
    function handleWindowBlurEvent() {
        // reset internal counters when window loses focus
        _activePointers = 0;
        _activeKeys = 0;
    }
    function handlePointerStartEvent(event) {
        if (event.isPrimary === false) {
            // ignore non-primary pointer events
            // https://w3c.github.io/pointerevents/#widl-PointerEvent-isPrimary
            return;
        }
        // mousedown without following mouseup
        // (likely not possible in Chrome)
        _activePointers += 1;
    }
    function handlePointerEndEvent(event) {
        if (event.isPrimary === false) {
            // ignore non-primary pointer events
            // https://w3c.github.io/pointerevents/#widl-PointerEvent-isPrimary
            return;
        }
        else if (event.touches) {
            _activePointers = event.touches.length;
            return;
        }
        // delay reset to when the current handlers are executed
        (window.setImmediate || window.setTimeout)(function () {
            // mouseup without prior mousedown
            // (drag something out of the window)
            _activePointers = Math.max(_activePointers - 1, 0);
        });
    }
    function handleKeyStartEvent(event) {
        // ignore modifier keys
        switch (event.keyCode || event.which) {
            case 16: // space
            case 17: // control
            case 18: // alt
            case 91: // command left
            case 93: // command right
                return;
            default:
                break;
        }
        // keydown without a following keyup
        // (may happen on CMD+TAB)
        _activeKeys += 1;
    }
    function handleKeyEndEvent(event) {
        // ignore modifier keys
        switch (event.keyCode || event.which) {
            case 16: // space
            case 17: // control
            case 18: // alt
            case 91: // command left
            case 93: // command right
                return;
            default:
                break;
        }
        // delay reset to when the current handlers are executed
        (window.setImmediate || window.setTimeout)(function () {
            // keyup without prior keydown
            // (may happen on CMD+R)
            _activeKeys = Math.max(_activeKeys - 1, 0);
        });
    }
    function getInteractionType() {
        return {
            pointer: Boolean(_activePointers),
            key: Boolean(_activeKeys),
        };
    }
    function disengage() {
        _activePointers = _activeKeys = 0;
        window.removeEventListener('blur', handleWindowBlurEvent, false);
        document.documentElement.removeEventListener('keydown', handleKeyStartEvent, true);
        document.documentElement.removeEventListener('keyup', handleKeyEndEvent, true);
        pointerStartEvents.forEach(function (event) {
            document.documentElement.removeEventListener(event, handlePointerStartEvent, true);
        });
        pointerEndEvents.forEach(function (event) {
            document.documentElement.removeEventListener(event, handlePointerEndEvent, true);
        });
    }
    function engage() {
        // window blur must be in bubble phase so it won't capture regular blurs
        window.addEventListener('blur', handleWindowBlurEvent, false);
        // handlers to identify the method of focus change
        document.documentElement.addEventListener('keydown', handleKeyStartEvent, true);
        document.documentElement.addEventListener('keyup', handleKeyEndEvent, true);
        pointerStartEvents.forEach(function (event) {
            document.documentElement.addEventListener(event, handlePointerStartEvent, true);
        });
        pointerEndEvents.forEach(function (event) {
            document.documentElement.addEventListener(event, handlePointerEndEvent, true);
        });
        return {
            get: getInteractionType,
        };
    }
    var engageInteractionTypeObserver = { engage: engage, disengage: disengage };

    // Code from ally.js
    // preferring focusin/out because they are synchronous in IE10+11
    var supportsFocusIn = typeof document !== 'undefined' && 'onfocusin' in document;
    var focusEventName = supportsFocusIn ? 'focusin' : 'focus';
    var blurEventName = supportsFocusIn ? 'focusout' : 'blur';
    // interface to read interaction-type-listener state
    var interactionTypeHandler;
    // keep track of last focus source
    var current = null;
    // overwrite focus source for use with the every upcoming focus event
    var lock = null;
    // keep track of ever having used a particular input method to change focus
    var used = {
        pointer: false,
        key: false,
        script: false,
        initial: false,
    };
    function handleFocusEvent(event) {
        var source = '';
        if (event.type === focusEventName) {
            var interactionType = interactionTypeHandler.get();
            source =
                lock ||
                    (interactionType.pointer && 'pointer') ||
                    (interactionType.key && 'key') ||
                    'script';
        }
        else if (event.type === 'initial') {
            source = 'initial';
        }
        document.documentElement.setAttribute('data-webplayer-focus-source', source);
        if (event.type !== blurEventName) {
            used[source] = true;
            current = source;
        }
    }
    function getCurrentFocusSource() {
        return current;
    }
    function getUsedFocusSource(source) {
        return used[source];
    }
    function lockFocusSource(source) {
        lock = source;
    }
    function unlockFocusSource() {
        lock = false;
    }
    function disengage$1() {
        // clear dom state
        handleFocusEvent({ type: blurEventName });
        current = lock = null;
        Object.keys(used).forEach(function (key) {
            used[key] = false;
        });
        // kill interaction type identification listener
        engageInteractionTypeObserver.disengage();
        document.documentElement.removeEventListener(focusEventName, handleFocusEvent, true);
        document.documentElement.removeEventListener(blurEventName, handleFocusEvent, true);
        document.documentElement.removeAttribute('data-webplayer-focus-source');
    }
    function engage$1() {
        document.documentElement.addEventListener(focusEventName, handleFocusEvent, true);
        document.documentElement.addEventListener(blurEventName, handleFocusEvent, true);
        // enable the interaction type identification observer
        interactionTypeHandler = engageInteractionTypeObserver.engage();
        // set up initial dom state
        handleFocusEvent({ type: 'initial' });
        return {
            used: getUsedFocusSource,
            current: getCurrentFocusSource,
            lock: lockFocusSource,
            unlock: unlockFocusSource,
        };
    }
    var focusSource = { engage: engage$1, disengage: disengage$1 };

    // Unspecified error on Internet Explorer with document.activeElement
    // https://github.com/reactjs/react-tabs/issues/193
    var canUseActiveElement = typeof window !== 'undefined' &&
        window.document &&
        typeof window.document.activeElement !== 'unknown';
    // inspired by https://gist.github.com/aFarkas/a7e0d85450f323d5e164
    var FOCUS_WITHIN_CLASSNAME = 'focus-within';
    var clearFocusWithinClass = function (element) {
        Array.prototype.slice
            .call(element.getElementsByClassName(FOCUS_WITHIN_CLASSNAME))
            .forEach(function (elem) {
            elem.classList.remove(FOCUS_WITHIN_CLASSNAME);
        });
    };
    function isElementNode(node) {
        return typeof node.classList !== 'undefined';
    }
    var addFocusWithinClass = function (boundaryElement, activeElement) {
        var currentNode = activeElement;
        while (currentNode !== boundaryElement && isElementNode(currentNode)) {
            currentNode.classList.add(FOCUS_WITHIN_CLASSNAME);
            currentNode = currentNode.parentNode;
        }
    };
    var focusWithin = function (rootElement, onFocusEnter, onFocusLeave) {
        var update = (function () {
            var running;
            var last;
            var isFocused;
            var action = function () {
                var activeElement = canUseActiveElement ? document.activeElement : null;
                running = false;
                if (last !== activeElement) {
                    last = activeElement;
                    clearFocusWithinClass(rootElement);
                    if (!rootElement.contains(activeElement)) {
                        if (isFocused) {
                            isFocused = false;
                            onFocusLeave();
                        }
                        return;
                    }
                    if (!isFocused) {
                        isFocused = true;
                        onFocusEnter();
                    }
                    addFocusWithinClass(rootElement, activeElement);
                }
            };
            return function () {
                if (!running) {
                    requestAnimationFrame(action);
                    running = true;
                }
            };
        })();
        rootElement.addEventListener('focus', update, true);
        rootElement.addEventListener('blur', update, true);
        update();
        return function () {
            rootElement.removeEventListener('focus', update, true);
            rootElement.removeEventListener('blur', update, true);
        };
    };

    (function (MediaStreamType) {
        MediaStreamType["MP4"] = "MP4";
        MediaStreamType["WEBM"] = "WEBM";
        MediaStreamType["HLS"] = "HLS";
        MediaStreamType["DASH"] = "DASH";
        MediaStreamType["OGG"] = "OGG";
        MediaStreamType["MOV"] = "MOV";
        MediaStreamType["MKV"] = "MKV";
    })(exports.MEDIA_STREAM_TYPES || (exports.MEDIA_STREAM_TYPES = {}));
    var MimeToStreamTypeMap = {
        'application/x-mpegURL': exports.MEDIA_STREAM_TYPES.HLS,
        'application/vnd.apple.mpegURL': exports.MEDIA_STREAM_TYPES.HLS,
        'application/dash+xml': exports.MEDIA_STREAM_TYPES.DASH,
        'video/mp4': exports.MEDIA_STREAM_TYPES.MP4,
        'video/x-mp4': exports.MEDIA_STREAM_TYPES.MP4,
        'x-video/mp4': exports.MEDIA_STREAM_TYPES.MP4,
        'video/webm': exports.MEDIA_STREAM_TYPES.WEBM,
        'video/ogg': exports.MEDIA_STREAM_TYPES.OGG,
        'video/quicktime': exports.MEDIA_STREAM_TYPES.MOV,
        'video/x-matroska': exports.MEDIA_STREAM_TYPES.MKV,
    };

    (function (MediaStreamDeliveryPriority) {
        MediaStreamDeliveryPriority[MediaStreamDeliveryPriority["NATIVE_PROGRESSIVE"] = 0] = "NATIVE_PROGRESSIVE";
        MediaStreamDeliveryPriority[MediaStreamDeliveryPriority["ADAPTIVE_VIA_MSE"] = 1] = "ADAPTIVE_VIA_MSE";
        MediaStreamDeliveryPriority[MediaStreamDeliveryPriority["NATIVE_ADAPTIVE"] = 2] = "NATIVE_ADAPTIVE";
        MediaStreamDeliveryPriority[MediaStreamDeliveryPriority["FORCED"] = 3] = "FORCED";
    })(exports.MEDIA_STREAM_DELIVERY_PRIORITY || (exports.MEDIA_STREAM_DELIVERY_PRIORITY = {}));

    var UIEvent;
    (function (UIEvent) {
        UIEvent["PLAY_CLICK"] = "ui-events/play-click";
        UIEvent["PLAY_OVERLAY_CLICK"] = "ui-events/play-overlay-click";
        UIEvent["PAUSE_CLICK"] = "ui-events/pause-click";
        UIEvent["PROGRESS_CHANGE"] = "ui-events/progress-change";
        UIEvent["PROGRESS_DRAG_STARTED"] = "ui-events/progress-drag-started";
        UIEvent["PROGRESS_DRAG_ENDED"] = "ui-events/progress-drag-ended";
        UIEvent["PROGRESS_SYNC_BUTTON_MOUSE_ENTER"] = "ui-events/progress-sync-button-mouse-enter";
        UIEvent["PROGRESS_SYNC_BUTTON_MOUSE_LEAVE"] = "ui-events/progress-sync-button-mouse-leave";
        UIEvent["PROGRESS_USER_PREVIEWING_FRAME"] = "ui-events/progress-user-previewing-frame";
        UIEvent["VOLUME_CHANGE"] = "ui-events/volume-change";
        UIEvent["MUTE_CLICK"] = "ui-events/mute-click";
        UIEvent["UNMUTE_CLICK"] = "ui-events/unmute-click";
        UIEvent["ENTER_FULL_SCREEN_CLICK"] = "ui-events/enter-full-screen-click";
        UIEvent["EXIT_FULL_SCREEN_CLICK"] = "ui-events/exit-full-screen-click";
        UIEvent["ENTER_PICTURE_IN_PICTURE_CLICK"] = "ui-events/enter-picture-in-picture-click";
        UIEvent["EXIT_PICTURE_IN_PICTURE_CLICK"] = "ui-events/exit-picture-in-picture-click";
        // TODO=follow ENTITY_EVENT or ENTITY_EVENT format
        UIEvent["MOUSE_ENTER_ON_PLAYER"] = "ui-events/mouse-enter-on-player";
        UIEvent["MOUSE_MOVE_ON_PLAYER"] = "ui-events/mouse-move-on-player";
        UIEvent["MOUSE_LEAVE_ON_PLAYER"] = "ui-events/mouse-leave-on-player";
        UIEvent["FOCUS_ENTER_ON_PLAYER"] = "ui-events/focus-enter-on-player";
        UIEvent["FOCUS_LEAVE_ON_PLAYER"] = "ui-events/focus-leave-on-player";
        UIEvent["MAIN_BLOCK_HIDE"] = "ui-events/main-block-hide";
        UIEvent["MAIN_BLOCK_SHOW"] = "ui-events/main-block-show";
        UIEvent["LOADER_SHOW"] = "ui-events/loader-show";
        UIEvent["LOADER_HIDE"] = "ui-events/loader-hide";
        UIEvent["LOADING_COVER_SHOW"] = "ui-events/loading-cover-show";
        UIEvent["LOADING_COVER_HIDE"] = "ui-events/loading-cover-hide";
        UIEvent["TOGGLE_PLAYBACK_WITH_KEYBOARD"] = "ui-events/toggle-playback-with-keyboard";
        UIEvent["GO_BACKWARD_WITH_KEYBOARD"] = "ui-events/go-backward-with-keyboard";
        UIEvent["GO_FORWARD_WITH_KEYBOARD"] = "ui-events/go-forward-with-keyboard";
        UIEvent["INCREASE_VOLUME_WITH_KEYBOARD"] = "ui-events/increase-volume-with-keyboard";
        UIEvent["DECREASE_VOLUME_WITH_KEYBOARD"] = "ui-events/decrease-volume-with-keyboard";
        UIEvent["MUTE_WITH_KEYBOARD"] = "ui-events/mute-with-keyboard";
        UIEvent["UNMUTE_WITH_KEYBOARD"] = "ui-events/unmute-with-keyboard";
        UIEvent["HIDE_INTERACTION_INDICATOR"] = "ui-events/hide-interaction-indicator";
        UIEvent["PLAY_WITH_SCREEN_CLICK"] = "ui-events/play-with-screen-click";
        UIEvent["PAUSE_WITH_SCREEN_CLICK"] = "ui-events/pause-with-screen-click";
        UIEvent["ENTER_FULL_SCREEN_WITH_SCREEN_CLICK"] = "ui-events/enter-full-screen-with-screen-click";
        UIEvent["EXIT_FULL_SCREEN_WITH_SCREEN_CLICK"] = "ui-events/exit-full-screen-with-screen-click";
        UIEvent["CONTROL_DRAG_START"] = "ui-events/control-drag-start";
        UIEvent["CONTROL_DRAG_END"] = "ui-events/control-drag-end";
        UIEvent["KEYBOARD_KEYDOWN_INTERCEPTED"] = "ui-events/keyboard-keydown-intercepted";
        UIEvent["FULL_SCREEN_STATE_CHANGED"] = "ui-events/full-screen-state-changed";
        UIEvent["PICTURE_IN_PICTURE_STATUS_CHANGE"] = "ui-events/picture-in-picture-status-changed";
        UIEvent["RESIZE"] = "ui-events/resize";
    })(UIEvent || (UIEvent = {}));
    var UIEvent$1 = UIEvent;

    var VideoEvent;
    (function (VideoEvent) {
        VideoEvent["ERROR"] = "video-events/error";
        VideoEvent["STATE_CHANGED"] = "video-events/state-changed";
        VideoEvent["LIVE_STATE_CHANGED"] = "video-events/live-state-changed";
        VideoEvent["DYNAMIC_CONTENT_ENDED"] = "video-events/dynamic-content-ended";
        VideoEvent["CHUNK_LOADED"] = "video-events/chunk-loaded";
        VideoEvent["CURRENT_TIME_UPDATED"] = "video-events/current-time-updated";
        VideoEvent["DURATION_UPDATED"] = "video-events/duration-updated";
        VideoEvent["SOUND_STATE_CHANGED"] = "video-events/sound-state-changed";
        VideoEvent["VOLUME_CHANGED"] = "video-events/volume-changed";
        VideoEvent["MUTE_CHANGED"] = "video-events/mute-changed";
        VideoEvent["SEEK_IN_PROGRESS"] = "video-events/seek-in-progress";
        VideoEvent["UPLOAD_STALLED"] = "video-events/upload-stalled";
        VideoEvent["UPLOAD_SUSPEND"] = "video-events/upload-suspend";
        VideoEvent["PLAY_REQUEST"] = "video-events/play-request";
        VideoEvent["PLAY_ABORTED"] = "video-events/play-aborted";
        VideoEvent["RESET"] = "video-events/reset-playback";
    })(VideoEvent || (VideoEvent = {}));
    var VideoEvent$1 = VideoEvent;

    var Error$1;
    (function (Error) {
        Error["SRC_PARSE"] = "error-src-parse";
        Error["MANIFEST_LOAD"] = "error-manifest-load";
        Error["MANIFEST_PARSE"] = "error-manifest-parse";
        Error["MANIFEST_INCOMPATIBLE"] = "error-manifest-incompatible";
        Error["LEVEL_LOAD"] = "error-level-load";
        Error["CONTENT_LOAD"] = "error-content-load";
        Error["CONTENT_PARSE"] = "error-content-parse";
        Error["MEDIA"] = "error-media";
        Error["UNKNOWN"] = "error-unknown";
    })(Error$1 || (Error$1 = {}));
    var Error$2 = Error$1;

    var TextLabel;
    (function (TextLabel) {
        TextLabel["LOGO_LABEL"] = "logo-label";
        TextLabel["LOGO_TOOLTIP"] = "logo-tooltip";
        TextLabel["LIVE_INDICATOR_TEXT"] = "live-indicator-text";
        TextLabel["LIVE_SYNC_LABEL"] = "live-sync-button-label";
        TextLabel["LIVE_SYNC_TOOLTIP"] = "live-sync-button-tooltip";
        TextLabel["ENTER_FULL_SCREEN_LABEL"] = "enter-full-screen-label";
        TextLabel["ENTER_FULL_SCREEN_TOOLTIP"] = "enter-full-screen-tooltip";
        TextLabel["EXIT_FULL_SCREEN_LABEL"] = "exit-full-screen-label";
        TextLabel["EXIT_FULL_SCREEN_TOOLTIP"] = "exit-full-screen-tooltip";
        TextLabel["ENTER_PICTURE_IN_PICTURE_LABEL"] = "enter-picture-in-picture-button-label";
        TextLabel["ENTER_PICTURE_IN_PICTURE_TOOLTIP"] = "enter-picture-in-picture-button-tooltip";
        TextLabel["EXIT_PICTURE_IN_PICTURE_LABEL"] = "exit-picture-in-picture-button-label";
        TextLabel["EXIT_PICTURE_IN_PICTURE_TOOLTIP"] = "exit-picture-in-picture-button-tooltip";
        TextLabel["PLAY_CONTROL_LABEL"] = "play-control-label";
        TextLabel["PAUSE_CONTROL_LABEL"] = "pause-control-label";
        TextLabel["PROGRESS_CONTROL_LABEL"] = "progress-control-label";
        TextLabel["PROGRESS_CONTROL_VALUE"] = "progress-control-value";
        TextLabel["UNMUTE_CONTROL_LABEL"] = "unmute-control-label";
        TextLabel["UNMUTE_CONTROL_TOOLTIP"] = "unmute-control-label";
        TextLabel["MUTE_CONTROL_LABEL"] = "mute-control-label";
        TextLabel["MUTE_CONTROL_TOOLTIP"] = "mute-control-tooltip";
        TextLabel["VOLUME_CONTROL_LABEL"] = "volume-control-label";
        TextLabel["VOLUME_CONTROL_VALUE"] = "volume-control-value";
        TextLabel["DOWNLOAD_BUTTON_LABEL"] = "download-button-label";
        TextLabel["DOWNLOAD_BUTTON_TOOLTIP"] = "download-button-tooltip";
    })(TextLabel || (TextLabel = {}));
    var TextLabel$1 = TextLabel;

    var EngineState;
    (function (EngineState) {
        EngineState["SRC_SET"] = "engine-state/src-set";
        EngineState["LOAD_STARTED"] = "engine-state/load-started";
        EngineState["METADATA_LOADED"] = "engine-state/metadata-loaded";
        EngineState["READY_TO_PLAY"] = "engine-state/ready-to-play";
        EngineState["SEEK_IN_PROGRESS"] = "engine-state/seek-in-progress";
        EngineState["PLAY_REQUESTED"] = "engine-state/play-requested";
        EngineState["WAITING"] = "engine-state/waiting";
        EngineState["PLAYING"] = "engine-state/playing";
        EngineState["PAUSED"] = "engine-state/paused";
        EngineState["ENDED"] = "engine-state/ended";
    })(EngineState || (EngineState = {}));
    var EngineState$1 = EngineState;

    var LiveState;
    (function (LiveState) {
        LiveState["NONE"] = "live-state/none";
        LiveState["INITIAL"] = "live-state/initial";
        LiveState["NOT_SYNC"] = "live-state/not-sync";
        LiveState["SYNC"] = "live-state/sync";
        LiveState["ENDED"] = "live-state/ended";
    })(LiveState || (LiveState = {}));
    var LiveState$1 = LiveState;

    function htmlToElement(html) {
        if (!html) {
            throw new Error('HTML provided to htmlToElement is empty');
        }
        var div = document.createElement('div');
        div.innerHTML = html.trim();
        if (div.childElementCount > 1) {
            throw new Error("HTML provided to htmlToElement doesn't have root element");
        }
        return div.firstChild;
    }

    function dot_tpl_src_modules_rootContainer_templates_container_dot(props
    ) {
    var out='<div data-webplayer-hook="player-container" dir="ltr" data-webplayer-dir="'+(props.direction)+'" tabindex="0" class="'+(props.styles.container)+'"></div>';return out;
    }

    var containerTemplate = dot_tpl_src_modules_rootContainer_templates_container_dot.default ? dot_tpl_src_modules_rootContainer_templates_container_dot.default : dot_tpl_src_modules_rootContainer_templates_container_dot;

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var classnames = createCommonjsModule(function (module) {
    /*!
      Copyright (c) 2018 Jed Watson.
      Licensed under the MIT License (MIT), see
      http://jedwatson.github.io/classnames
    */
    /* global define */

    (function () {

    	var hasOwn = {}.hasOwnProperty;

    	function classNames() {
    		var classes = [];

    		for (var i = 0; i < arguments.length; i++) {
    			var arg = arguments[i];
    			if (!arg) continue;

    			var argType = typeof arg;

    			if (argType === 'string' || argType === 'number') {
    				classes.push(arg);
    			} else if (Array.isArray(arg)) {
    				if (arg.length) {
    					var inner = classNames.apply(null, arg);
    					if (inner) {
    						classes.push(inner);
    					}
    				}
    			} else if (argType === 'object') {
    				if (arg.toString === Object.prototype.toString) {
    					for (var key in arg) {
    						if (hasOwn.call(arg, key) && arg[key]) {
    							classes.push(key);
    						}
    					}
    				} else {
    					classes.push(arg.toString());
    				}
    			}
    		}

    		return classes.join(' ');
    	}

    	if ('object' !== 'undefined' && module.exports) {
    		classNames.default = classNames;
    		module.exports = classNames;
    	} else if (typeof undefined === 'function' && typeof undefined.amd === 'object' && undefined.amd) {
    		// register as 'classnames', consistent with npm package name
    		undefined('classnames', [], function () {
    			return classNames;
    		});
    	} else {
    		window.classNames = classNames;
    	}
    }());
    });

    function extendStyles(sourceStyles, partialStyles) {
        var styles = __assign({}, sourceStyles);
        Object.keys(partialStyles).forEach(function (styleName) {
            styles[styleName] = styles[styleName]
                ? classnames(styles[styleName], partialStyles[styleName])
                : partialStyles[styleName];
        });
        return styles;
    }

    var Stylable = /** @class */ (function () {
        function Stylable(theme) {
            this._themeStyles = {};
            var moduleTheme = this.constructor._moduleTheme;
            if (theme && moduleTheme) {
                theme.registerModuleTheme(this, moduleTheme);
                this._themeStyles = theme.get(this);
            }
        }
        Stylable.setTheme = function (theme) {
            this._moduleTheme = theme;
        };
        Stylable.extendStyleNames = function (styles) {
            this._styles = extendStyles(this._styles, styles);
        };
        Stylable.resetStyles = function () {
            this._styles = {};
        };
        Object.defineProperty(Stylable.prototype, "themeStyles", {
            get: function () {
                return this._themeStyles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Stylable.prototype, "styleNames", {
            get: function () {
                // NOTE: TS does not work with instance static fields + generic type
                return this.constructor._styles || {};
            },
            enumerable: true,
            configurable: true
        });
        Stylable._styles = {};
        return Stylable;
    }());

    var View = /** @class */ (function (_super) {
        __extends(View, _super);
        function View() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return View;
    }(Stylable));

    function styleInject(css, ref) {
      if ( ref === void 0 ) ref = {};
      var insertAt = ref.insertAt;

      if (!css || typeof document === 'undefined') { return; }

      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';

      if (insertAt === 'top') {
        if (head.firstChild) {
          head.insertBefore(style, head.firstChild);
        } else {
          head.appendChild(style);
        }
      } else {
        head.appendChild(style);
      }

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
    }

    var css = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.root-container__controlButton___3nLjS {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.root-container__controlButton___3nLjS:hover {\n    opacity: .7; }\n.root-container__hidden___10ZXK {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.root-container__container____RXkJ {\n  font-family: 'interface', HelveticaNeueW02-45Ligh, HelveticaNeueW10-45Ligh, Helvetica Neue, Helvetica, Arial, \\\\30e1\\30a4\\30ea\\30aa, meiryo, \\\\30d2\\30e9\\30ae\\30ce\\89d2\\30b4 pro w3, hiragino kaku gothic pro;\n  position: relative;\n  z-index: 0;\n  display: block;\n  overflow: hidden;\n  height: inherit;\n  outline: none;\n  /**\n * 1. Change the font styles in all browsers.\n * 2. Show the overflow in IE.\n * 3. Remove the margin in Firefox and Safari.\n * 4. Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 5. Correct the inability to style clickable types in iOS and Safari.\n */\n  /**\n * Remove the inner border and padding in Firefox.\n */\n  /**\n * Restore the focus styles unset by the previous rule.\n */ }\n.root-container__container____RXkJ button {\n    font-family: inherit;\n    /* 1 */\n    font-size: 100%;\n    /* 1 */\n    line-height: 1.15;\n    /* 1 */\n    overflow: visible;\n    /* 2 */\n    margin: 0;\n    /* 3 */\n    text-transform: none;\n    /* 4 */\n    -webkit-appearance: button;\n    /* 5 */ }\n.root-container__container____RXkJ button::-moz-focus-inner {\n    padding: 0;\n    border-style: none; }\n.root-container__container____RXkJ button:-moz-focusring {\n    outline: 1px dotted ButtonText; }\n[data-webplayer-hook='player-container'].root-container__container____RXkJ [data-webplayer-component],\n[data-webplayer-hook='player-container'].root-container__container____RXkJ [data-webplayer-component] *,\n[data-webplayer-hook='player-container'].root-container__container____RXkJ [data-webplayer-component] *:before,\n[data-webplayer-hook='player-container'].root-container__container____RXkJ [data-webplayer-component] *:after {\n  -webkit-box-sizing: content-box !important;\n          box-sizing: content-box !important;\n  outline: none !important; }\n.root-container__fillAllSpace___33wu6,\n.root-container__fullScreen___3oMwD {\n  width: 100% !important;\n  min-width: 100% !important;\n  height: 100% !important;\n  min-height: 100% !important; }\n[data-webplayer-focus-source='key'] [data-webplayer-hook='player-container'] button.focus-within,\n[data-webplayer-focus-source='key'] [data-webplayer-hook='player-container'] input.focus-within,\n[data-webplayer-focus-source='key'] [data-webplayer-hook='player-container'] img.focus-within,\n[data-webplayer-focus-source='script']\n[data-webplayer-hook='player-container'] button.focus-within,\n[data-webplayer-focus-source='script']\n[data-webplayer-hook='player-container'] input.focus-within,\n[data-webplayer-focus-source='script']\n[data-webplayer-hook='player-container'] img.focus-within {\n  -webkit-box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8);\n          box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJvb3QtY29udGFpbmVyLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsME5BQTBOO0VBQzFOLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsZUFBZTtFQUNmLGlCQUFpQjtFQUNqQixnQkFBZ0I7RUFDaEIsY0FBYztFQUNkOzs7Ozs7R0FNQztFQUNEOztHQUVDO0VBQ0Q7O0dBRUMsRUFBRTtBQUNIO0lBQ0UscUJBQXFCO0lBQ3JCLE9BQU87SUFDUCxnQkFBZ0I7SUFDaEIsT0FBTztJQUNQLGtCQUFrQjtJQUNsQixPQUFPO0lBQ1Asa0JBQWtCO0lBQ2xCLE9BQU87SUFDUCxVQUFVO0lBQ1YsT0FBTztJQUNQLHFCQUFxQjtJQUNyQixPQUFPO0lBQ1AsMkJBQTJCO0lBQzNCLE9BQU8sRUFBRTtBQUNYO0lBQ0UsV0FBVztJQUNYLG1CQUFtQixFQUFFO0FBQ3ZCO0lBQ0UsK0JBQStCLEVBQUU7QUFFckM7Ozs7RUFJRSwyQ0FBbUM7VUFBbkMsbUNBQW1DO0VBQ25DLHlCQUF5QixFQUFFO0FBRTdCOztFQUVFLHVCQUF1QjtFQUN2QiwyQkFBMkI7RUFDM0Isd0JBQXdCO0VBQ3hCLDRCQUE0QixFQUFFO0FBRWhDOzs7Ozs7Ozs7RUFTRSxzREFBOEM7VUFBOUMsOENBQThDLEVBQUUiLCJmaWxlIjoicm9vdC1jb250YWluZXIuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4uY29udGFpbmVyIHtcbiAgZm9udC1mYW1pbHk6IEhlbHZldGljYU5ldWVXMDEtNDVMaWdoLCBIZWx2ZXRpY2FOZXVlVzAyLTQ1TGlnaCwgSGVsdmV0aWNhTmV1ZVcxMC00NUxpZ2gsIEhlbHZldGljYSBOZXVlLCBIZWx2ZXRpY2EsIEFyaWFsLCBcXFxcMzBlMVxcMzBhNFxcMzBlYVxcMzBhYSwgbWVpcnlvLCBcXFxcMzBkMlxcMzBlOVxcMzBhZVxcMzBjZVxcODlkMlxcMzBiNCBwcm8gdzMsIGhpcmFnaW5vIGtha3UgZ290aGljIHBybztcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiAwO1xuICBkaXNwbGF5OiBibG9jaztcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgaGVpZ2h0OiBpbmhlcml0O1xuICBvdXRsaW5lOiBub25lO1xuICAvKipcbiAqIDEuIENoYW5nZSB0aGUgZm9udCBzdHlsZXMgaW4gYWxsIGJyb3dzZXJzLlxuICogMi4gU2hvdyB0aGUgb3ZlcmZsb3cgaW4gSUUuXG4gKiAzLiBSZW1vdmUgdGhlIG1hcmdpbiBpbiBGaXJlZm94IGFuZCBTYWZhcmkuXG4gKiA0LiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UsIEZpcmVmb3gsIGFuZCBJRS5cbiAqIDUuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXG4gKi9cbiAgLyoqXG4gKiBSZW1vdmUgdGhlIGlubmVyIGJvcmRlciBhbmQgcGFkZGluZyBpbiBGaXJlZm94LlxuICovXG4gIC8qKlxuICogUmVzdG9yZSB0aGUgZm9jdXMgc3R5bGVzIHVuc2V0IGJ5IHRoZSBwcmV2aW91cyBydWxlLlxuICovIH1cbiAgLmNvbnRhaW5lciBidXR0b24ge1xuICAgIGZvbnQtZmFtaWx5OiBpbmhlcml0O1xuICAgIC8qIDEgKi9cbiAgICBmb250LXNpemU6IDEwMCU7XG4gICAgLyogMSAqL1xuICAgIGxpbmUtaGVpZ2h0OiAxLjE1O1xuICAgIC8qIDEgKi9cbiAgICBvdmVyZmxvdzogdmlzaWJsZTtcbiAgICAvKiAyICovXG4gICAgbWFyZ2luOiAwO1xuICAgIC8qIDMgKi9cbiAgICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbiAgICAvKiA0ICovXG4gICAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247XG4gICAgLyogNSAqLyB9XG4gIC5jb250YWluZXIgYnV0dG9uOjotbW96LWZvY3VzLWlubmVyIHtcbiAgICBwYWRkaW5nOiAwO1xuICAgIGJvcmRlci1zdHlsZTogbm9uZTsgfVxuICAuY29udGFpbmVyIGJ1dHRvbjotbW96LWZvY3VzcmluZyB7XG4gICAgb3V0bGluZTogMXB4IGRvdHRlZCBCdXR0b25UZXh0OyB9XG5cbltkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXS5jb250YWluZXIgW2RhdGEtcGxheWFibGUtY29tcG9uZW50XSxcbltkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXS5jb250YWluZXIgW2RhdGEtcGxheWFibGUtY29tcG9uZW50XSAqLFxuW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddLmNvbnRhaW5lciBbZGF0YS1wbGF5YWJsZS1jb21wb25lbnRdICo6YmVmb3JlLFxuW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddLmNvbnRhaW5lciBbZGF0YS1wbGF5YWJsZS1jb21wb25lbnRdICo6YWZ0ZXIge1xuICBib3gtc2l6aW5nOiBjb250ZW50LWJveCAhaW1wb3J0YW50O1xuICBvdXRsaW5lOiBub25lICFpbXBvcnRhbnQ7IH1cblxuLmZpbGxBbGxTcGFjZSxcbi5mdWxsU2NyZWVuIHtcbiAgd2lkdGg6IDEwMCUgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAxMDAlICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMTAwJSAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAxMDAlICFpbXBvcnRhbnQ7IH1cblxuOmdsb2JhbCBbZGF0YS1wbGF5YWJsZS1mb2N1cy1zb3VyY2U9J2tleSddIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXSBidXR0b24uZm9jdXMtd2l0aGluLFxuOmdsb2JhbCBbZGF0YS1wbGF5YWJsZS1mb2N1cy1zb3VyY2U9J2tleSddIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXSBpbnB1dC5mb2N1cy13aXRoaW4sXG46Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0na2V5J10gW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddIGltZy5mb2N1cy13aXRoaW4sXG46Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0nc2NyaXB0J11cbltkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXSBidXR0b24uZm9jdXMtd2l0aGluLFxuOmdsb2JhbCBbZGF0YS1wbGF5YWJsZS1mb2N1cy1zb3VyY2U9J3NjcmlwdCddXG5bZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ10gaW5wdXQuZm9jdXMtd2l0aGluLFxuOmdsb2JhbCBbZGF0YS1wbGF5YWJsZS1mb2N1cy1zb3VyY2U9J3NjcmlwdCddXG5bZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ10gaW1nLmZvY3VzLXdpdGhpbiB7XG4gIGJveC1zaGFkb3c6IDAgMCAwIDJweCByZ2JhKDU2LCAxNTMsIDIzNiwgMC44KTsgfVxuIl19 */";
    var styles = {"controlButton":"root-container__controlButton___3nLjS","hidden":"root-container__hidden___10ZXK","container":"root-container__container____RXkJ","fillAllSpace":"root-container__fillAllSpace___33wu6","fullScreen":"root-container__fullScreen___3oMwD"};
    styleInject(css);

    var RootContainerView = /** @class */ (function (_super) {
        __extends(RootContainerView, _super);
        function RootContainerView(config) {
            var _this = _super.call(this) || this;
            var width = config.width, height = config.height, fillAllSpace = config.fillAllSpace, callbacks = config.callbacks, rtl = config.rtl;
            _this._callbacks = callbacks;
            _this._$rootElement = htmlToElement(containerTemplate({ styles: _this.styleNames }));
            _this.setFillAllSpaceFlag(fillAllSpace);
            _this.setRtl(rtl);
            _this.setWidth(width);
            _this.setHeight(height);
            _this._bindEvents();
            return _this;
        }
        RootContainerView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('mouseenter', this._callbacks.onMouseEnter);
            this._$rootElement.addEventListener('mousemove', this._callbacks.onMouseMove);
            this._$rootElement.addEventListener('mouseleave', this._callbacks.onMouseLeave);
        };
        RootContainerView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('mouseenter', this._callbacks.onMouseEnter);
            this._$rootElement.removeEventListener('mousemove', this._callbacks.onMouseMove);
            this._$rootElement.removeEventListener('mouseleave', this._callbacks.onMouseLeave);
        };
        RootContainerView.prototype.setWidth = function (width) {
            if (!width) {
                return;
            }
            var widthStyle = width + "px";
            this._$rootElement.style.width = widthStyle;
            this._$rootElement.style.minWidth = widthStyle;
        };
        RootContainerView.prototype.setHeight = function (height) {
            if (!height) {
                return;
            }
            var heightStyle = height + "px";
            this._$rootElement.style.height = heightStyle;
            this._$rootElement.style.minHeight = heightStyle;
        };
        RootContainerView.prototype.getWidth = function () {
            return this._$rootElement.offsetWidth;
        };
        RootContainerView.prototype.getHeight = function () {
            return this._$rootElement.offsetHeight;
        };
        RootContainerView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        RootContainerView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        RootContainerView.prototype.appendComponentElement = function (element) {
            this._$rootElement.appendChild(element);
        };
        RootContainerView.prototype.getElement = function () {
            return this._$rootElement;
        };
        RootContainerView.prototype.setFullScreenState = function (isFullScreen) {
            if (isFullScreen) {
                this._$rootElement.setAttribute('data-webplayer-in-full-screen', 'true');
                this._$rootElement.classList.add(this.styleNames.fullScreen);
            }
            else {
                this._$rootElement.setAttribute('data-webplayer-in-full-screen', 'false');
                this._$rootElement.classList.remove(this.styleNames.fullScreen);
            }
        };
        RootContainerView.prototype.setFillAllSpaceFlag = function (isFillAllSpace) {
            if (isFillAllSpace === void 0) { isFillAllSpace = false; }
            if (isFillAllSpace) {
                this._$rootElement.classList.add(this.styleNames.fillAllSpace);
            }
            else {
                this._$rootElement.classList.remove(this.styleNames.fillAllSpace);
            }
        };
        RootContainerView.prototype.setRtl = function (rtl) {
            this._$rootElement.setAttribute('data-webplayer-dir', rtl ? 'rtl' : 'ltr');
        };
        RootContainerView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return RootContainerView;
    }(View));
    RootContainerView.extendStyleNames(styles);

    function reduce(arrayLike, callback, initialValue) {
        return Array.prototype.reduce.call(arrayLike, callback, initialValue);
    }
    function forEachMatch(string, pattern, callback) {
        var match = pattern.exec(string);
        while (match !== null) {
            callback(match);
            match = pattern.exec(string);
        }
    }

    var ALIASES = [
        'matches',
        'webkitMatchesSelector',
        'mozMatchesSelector',
        'msMatchesSelector',
    ];
    var matchesSelectorFn;
    if (typeof HTMLElement !== 'undefined') {
        for (var i = 0; i < ALIASES.length; i++) {
            matchesSelectorFn = Element.prototype[ALIASES[i]];
            if (matchesSelectorFn) {
                break;
            }
        }
    }
    var isElementMatchesSelector = matchesSelectorFn
        ? function (element, selector) {
            return matchesSelectorFn.call(element, selector);
        }
        : function (element, selector) {
            return Array.prototype.indexOf.call(document.querySelectorAll(selector), element) !== -1;
        };

    // NOTE: "inspired" by https://github.com/marcj/css-element-queries/blob/1.0.2/src/ElementQueries.js#L340-L393
    var CSS_SELECTOR_PATTERN = /,?[\s\t]*([^,\n]*?)((?:\[[\s\t]*?(?:[a-z-]+-)?(?:min|max)-width[\s\t]*?[~$\^]?=[\s\t]*?"[^"]*?"[\s\t]*?])+)([^,\n\s\{]*)/gim;
    var QUERY_ATTR_PATTERN = /\[[\s\t]*?(?:([a-z-]+)-)?(min|max)-width[\s\t]*?[~$\^]?=[\s\t]*?"([^"]*?)"[\s\t]*?]/gim;
    function getQueriesFromCssSelector(cssSelector) {
        var results = [];
        if (cssSelector.indexOf('min-width') === -1 &&
            cssSelector.indexOf('max-width') === -1) {
            return [];
        }
        cssSelector = cssSelector.replace(/'/g, '"');
        forEachMatch(cssSelector, CSS_SELECTOR_PATTERN, function (matchedSelectors) {
            var _a = matchedSelectors.slice(1), selectorPart1 = _a[0], attribute = _a[1], selectorPart2 = _a[2];
            var selector = selectorPart1 + selectorPart2;
            forEachMatch(attribute, QUERY_ATTR_PATTERN, function (matchedAttributes) {
                var _a = matchedAttributes.slice(1), _b = _a[0], prefix = _b === void 0 ? '' : _b, mode = _a[1], width = _a[2];
                results.push({
                    selector: selector,
                    prefix: prefix,
                    mode: mode,
                    width: parseInt(width, 10),
                });
            });
        });
        return results;
    }
    function getQueriesFromRules(rules) {
        return reduce(rules, function (results, rule) {
            // https://developer.mozilla.org/en-US/docs/Web/API/CSSRule
            // CSSRule.STYLE_RULE
            if (rule.type === 1) {
                var selector = rule.selectorText || rule.cssText;
                return results.concat(getQueriesFromCssSelector(selector));
            }
            // NOTE: add other `CSSRule` types if required.
            // Example - https://github.com/marcj/css-element-queries/blob/1.0.2/src/ElementQueries.js#L384-L390
            return results;
        }, []);
    }
    function getQueries() {
        return reduce(document.styleSheets, function (results, styleSheet) {
            // NOTE: browser may not able to read rules for cross-domain stylesheets
            try {
                var rules = styleSheet.cssRules ||
                    styleSheet.rules;
                if (rules) {
                    return results.concat(getQueriesFromRules(rules));
                }
                if (styleSheet.cssText) {
                    return results.concat(getQueriesFromCssSelector(styleSheet.cssText));
                }
            }
            catch (e) { }
            return results;
        }, []);
    }
    function getQueriesForElement(element, prefix) {
        if (prefix === void 0) { prefix = ''; }
        var matchedSelectors = new Map();
        var queries = [];
        getQueries().forEach(function (query) {
            if (!matchedSelectors.has(query.selector)) {
                matchedSelectors.set(query.selector, isElementMatchesSelector(element, query.selector));
            }
            if (!matchedSelectors.get(query.selector)) {
                return;
            }
            if (query.prefix === prefix &&
                !queries.some(function (_query) { return _query.mode === query.mode && _query.width === query.width; })) {
                queries.push({
                    mode: query.mode,
                    width: query.width,
                });
            }
        });
        return queries.sort(function (a, b) { return a.width - b.width; });
    }

    var DEFAULT_QUERY_PREFIX = 'data-webplayer';
    var ElementQueries = /** @class */ (function () {
        function ElementQueries(element, _a) {
            var _b = (_a === void 0 ? {} : _a).prefix, prefix = _b === void 0 ? DEFAULT_QUERY_PREFIX : _b;
            this._element = element;
            this._queryPrefix = prefix;
            this._queries = [];
        }
        ElementQueries.prototype._getQueryAttributeValue = function (mode, elementWidth) {
            return this._queries
                .filter(function (query) {
                return query.mode === mode &&
                    ((mode === 'max' && query.width >= elementWidth) ||
                        (mode === 'min' && query.width <= elementWidth));
            })
                .map(function (query) { return query.width + "px"; })
                .join(' ');
        };
        ElementQueries.prototype._setQueryAttribute = function (mode, elementWidth) {
            var attributeName = this._queryPrefix
                ? this._queryPrefix + "-" + mode + "-width"
                : mode + "-width";
            var attributeValue = this._getQueryAttributeValue(mode, elementWidth);
            if (attributeValue) {
                this._element.setAttribute(attributeName, attributeValue);
            }
            else {
                this._element.removeAttribute(attributeName);
            }
        };
        ElementQueries.prototype.getQueries = function () {
            this._queries = getQueriesForElement(this._element, this._queryPrefix);
        };
        ElementQueries.prototype.setWidth = function (width) {
            this._setQueryAttribute('min', width);
            this._setQueryAttribute('max', width);
        };
        ElementQueries.prototype.destroy = function () {
            this._element = null;
        };
        return ElementQueries;
    }());

    var DEFAULT_CONFIG = {
        fillAllSpace: false,
        rtl: false,
    };
    var RootContainer = /** @class */ (function () {
        function RootContainer(_a) {
            var eventEmitter = _a.eventEmitter, config = _a.config;
            this._eventEmitter = eventEmitter;
            this.isHidden = false;
            this._bindCallbacks();
            this._initUI(config);
            this._bindEvents();
        }
        /**
         * Getter for DOM element with player UI
         * (use it only for debug, if you need attach player to your document use `attachToElement` method)
         */
        RootContainer.prototype.getElement = function () {
            return this.view.getElement();
        };
        RootContainer.prototype._bindCallbacks = function () {
            this._onResized = this._onResized.bind(this);
            this._broadcastMouseEnter = this._broadcastMouseEnter.bind(this);
            this._broadcastMouseMove = this._broadcastMouseMove.bind(this);
            this._broadcastMouseLeave = this._broadcastMouseLeave.bind(this);
            this._broadcastFocusEnter = this._broadcastFocusEnter.bind(this);
            this._broadcastFocusLeave = this._broadcastFocusLeave.bind(this);
        };
        RootContainer.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [
                    UIEvent$1.FULL_SCREEN_STATE_CHANGED,
                    this.view.setFullScreenState,
                    this.view,
                ],
            ], this);
        };
        RootContainer.prototype._initUI = function (config) {
            this.view = new RootContainerView({
                callbacks: {
                    onMouseEnter: this._broadcastMouseEnter,
                    onMouseLeave: this._broadcastMouseLeave,
                    onMouseMove: this._broadcastMouseMove,
                },
                width: config.width || null,
                height: config.height || null,
                fillAllSpace: config.fillAllSpace || DEFAULT_CONFIG.fillAllSpace,
                rtl: config.rtl || DEFAULT_CONFIG.rtl,
            });
            this._elementQueries = new ElementQueries(this.getElement());
            this._resizeObserver = new index(this._onResized);
            this._resizeObserver.observe(this.getElement());
        };
        RootContainer.prototype.appendComponentElement = function (element) {
            this.view.appendComponentElement(element);
        };
        RootContainer.prototype._broadcastMouseEnter = function () {
            this._eventEmitter.emitAsync(UIEvent$1.MOUSE_ENTER_ON_PLAYER);
        };
        RootContainer.prototype._broadcastMouseMove = function () {
            this._eventEmitter.emitAsync(UIEvent$1.MOUSE_MOVE_ON_PLAYER);
        };
        RootContainer.prototype._broadcastMouseLeave = function () {
            this._eventEmitter.emitAsync(UIEvent$1.MOUSE_LEAVE_ON_PLAYER);
        };
        RootContainer.prototype._broadcastFocusEnter = function () {
            this._eventEmitter.emitAsync(UIEvent$1.FOCUS_ENTER_ON_PLAYER);
        };
        RootContainer.prototype._broadcastFocusLeave = function () {
            this._eventEmitter.emitAsync(UIEvent$1.FOCUS_LEAVE_ON_PLAYER);
        };
        RootContainer.prototype._enableFocusInterceptors = function () {
            if (!this._disengageFocusWithin) {
                this._disengageFocusWithin = focusWithin(this.getElement(), this._broadcastFocusEnter, this._broadcastFocusLeave);
            }
            if (!this._disengageFocusSource) {
                focusSource.engage();
                this._disengageFocusSource = focusSource.disengage;
            }
        };
        RootContainer.prototype._disableFocusInterceptors = function () {
            if (this._disengageFocusSource) {
                this._disengageFocusSource();
                this._disengageFocusSource = null;
            }
            if (this._disengageFocusWithin) {
                this._disengageFocusWithin();
                this._disengageFocusWithin = null;
            }
        };
        RootContainer.prototype._onResized = function () {
            var width = this.view.getWidth();
            var height = this.view.getHeight();
            this._elementQueries.setWidth(width);
            this._eventEmitter.emitAsync(UIEvent$1.RESIZE, { width: width, height: height });
        };
        /**
         * Method for attaching player node to your container
         *
         * @example
         * document.addEventListener('DOMContentLoaded', function() {
         *   const config = { src: 'http://my-url/video.mp4' }
         *   const player = WebPlayer.create(config);
         *
         *   player.attachToElement(document.getElementById('content'));
         * });
         */
        RootContainer.prototype.attachToElement = function (element) {
            this._enableFocusInterceptors();
            element.appendChild(this.getElement());
            this._elementQueries.getQueries();
        };
        /**
         * Method for setting width of player
         * @param width - Desired width of player in pixels
         * @example
         * player.setWidth(400);
         */
        RootContainer.prototype.setWidth = function (width) {
            this.view.setWidth(width);
        };
        /**
         * Return current width of player in pixels
         * @example
         * player.getWidth(); // 400
         */
        RootContainer.prototype.getWidth = function () {
            return this.view.getWidth();
        };
        /**
         * Method for setting width of player
         * @param height - Desired height of player in pixels
         * @example
         * player.setHeight(225);
         */
        RootContainer.prototype.setHeight = function (height) {
            this.view.setHeight(height);
        };
        /**
         * Return current height of player in pixels
         * @example
         * player.getHeight(); // 225
         */
        RootContainer.prototype.getHeight = function () {
            return this.view.getHeight();
        };
        /**
         * Method for allowing player fill all available space
         * @param flag - `true` for allowing
         * @example
         * player.setFillAllSpace(true);
         */
        RootContainer.prototype.setFillAllSpace = function (flag) {
            this.view.setFillAllSpaceFlag(flag);
        };
        /**
         * Method for allowing player rtl direction
         * @param rtl - `true` for allowing
         * @example
         * player.setRtl(boolean);
         */
        RootContainer.prototype.setRtl = function (rtl) {
            this.view.setRtl(rtl);
        };
        /**
         * Hide whole ui
         * @example
         * player.hide();
         */
        RootContainer.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        /**
         * Show whole ui
         * @example
         * player.show();
         */
        RootContainer.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        RootContainer.prototype.destroy = function () {
            this._unbindEvents();
            this._disableFocusInterceptors();
            this._resizeObserver.unobserve(this.getElement());
            this._elementQueries.destroy();
            this.view.destroy();
        };
        RootContainer.moduleName = 'rootContainer';
        RootContainer.dependencies = ['eventEmitter', 'config'];
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "getElement", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "attachToElement", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "setWidth", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "getWidth", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "setHeight", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "getHeight", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "setFillAllSpace", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "setRtl", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "hide", null);
        __decorate([
            playerAPI()
        ], RootContainer.prototype, "show", null);
        return RootContainer;
    }());

    var eventemitter3 = createCommonjsModule(function (module) {

    var has = Object.prototype.hasOwnProperty
      , prefix = '~';

    /**
     * Constructor to create a storage for our `EE` objects.
     * An `Events` instance is a plain object whose properties are event names.
     *
     * @constructor
     * @private
     */
    function Events() {}

    //
    // We try to not inherit from `Object.prototype`. In some engines creating an
    // instance in this way is faster than calling `Object.create(null)` directly.
    // If `Object.create(null)` is not supported we prefix the event names with a
    // character to make sure that the built-in object properties are not
    // overridden or used as an attack vector.
    //
    if (Object.create) {
      Events.prototype = Object.create(null);

      //
      // This hack is needed because the `__proto__` property is still inherited in
      // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
      //
      if (!new Events().__proto__) prefix = false;
    }

    /**
     * Representation of a single event listener.
     *
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
     * @constructor
     * @private
     */
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }

    /**
     * Add a listener for a given event.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} context The context to invoke the listener with.
     * @param {Boolean} once Specify if the listener is a one-time listener.
     * @returns {EventEmitter}
     * @private
     */
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== 'function') {
        throw new TypeError('The listener must be a function');
      }

      var listener = new EE(fn, context || emitter, once)
        , evt = prefix ? prefix + event : event;

      if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
      else emitter._events[evt] = [emitter._events[evt], listener];

      return emitter;
    }

    /**
     * Clear event by name.
     *
     * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
     * @param {(String|Symbol)} evt The Event name.
     * @private
     */
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0) emitter._events = new Events();
      else delete emitter._events[evt];
    }

    /**
     * Minimal `EventEmitter` interface that is molded against the Node.js
     * `EventEmitter` interface.
     *
     * @constructor
     * @public
     */
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }

    /**
     * Return an array listing the events for which the emitter has registered
     * listeners.
     *
     * @returns {Array}
     * @public
     */
    EventEmitter.prototype.eventNames = function eventNames() {
      var names = []
        , events
        , name;

      if (this._eventsCount === 0) return names;

      for (name in (events = this._events)) {
        if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
      }

      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }

      return names;
    };

    /**
     * Return the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Array} The registered listeners.
     * @public
     */
    EventEmitter.prototype.listeners = function listeners(event) {
      var evt = prefix ? prefix + event : event
        , handlers = this._events[evt];

      if (!handlers) return [];
      if (handlers.fn) return [handlers.fn];

      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }

      return ee;
    };

    /**
     * Return the number of listeners listening to a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Number} The number of listeners.
     * @public
     */
    EventEmitter.prototype.listenerCount = function listenerCount(event) {
      var evt = prefix ? prefix + event : event
        , listeners = this._events[evt];

      if (!listeners) return 0;
      if (listeners.fn) return 1;
      return listeners.length;
    };

    /**
     * Calls each of the listeners registered for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @returns {Boolean} `true` if the event had listeners, else `false`.
     * @public
     */
    EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return false;

      var listeners = this._events[evt]
        , len = arguments.length
        , args
        , i;

      if (listeners.fn) {
        if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

        switch (len) {
          case 1: return listeners.fn.call(listeners.context), true;
          case 2: return listeners.fn.call(listeners.context, a1), true;
          case 3: return listeners.fn.call(listeners.context, a1, a2), true;
          case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }

        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length
          , j;

        for (i = 0; i < length; i++) {
          if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

          switch (len) {
            case 1: listeners[i].fn.call(listeners[i].context); break;
            case 2: listeners[i].fn.call(listeners[i].context, a1); break;
            case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
            case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
            default:
              if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
                args[j - 1] = arguments[j];
              }

              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }

      return true;
    };

    /**
     * Add a listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.on = function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    };

    /**
     * Add a one-time listener for a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn The listener function.
     * @param {*} [context=this] The context to invoke the listener with.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.once = function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    };

    /**
     * Remove the listeners of a given event.
     *
     * @param {(String|Symbol)} event The event name.
     * @param {Function} fn Only remove the listeners that match this function.
     * @param {*} context Only remove the listeners that have this context.
     * @param {Boolean} once Only remove one-time listeners.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;

      if (!this._events[evt]) return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }

      var listeners = this._events[evt];

      if (listeners.fn) {
        if (
          listeners.fn === fn &&
          (!once || listeners.once) &&
          (!context || listeners.context === context)
        ) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (
            listeners[i].fn !== fn ||
            (once && !listeners[i].once) ||
            (context && listeners[i].context !== context)
          ) {
            events.push(listeners[i]);
          }
        }

        //
        // Reset the array, or remove it completely if we have no more listeners.
        //
        if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
        else clearEvent(this, evt);
      }

      return this;
    };

    /**
     * Remove all listeners, or those of the specified event.
     *
     * @param {(String|Symbol)} [event] The event name.
     * @returns {EventEmitter} `this`.
     * @public
     */
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
      var evt;

      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }

      return this;
    };

    //
    // Alias methods names because people roll like that.
    //
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;

    //
    // Expose the prefix.
    //
    EventEmitter.prefixed = prefix;

    //
    // Allow `EventEmitter` to be imported as module namespace.
    //
    EventEmitter.EventEmitter = EventEmitter;

    //
    // Expose the module.
    //
    {
      module.exports = EventEmitter;
    }
    });
    var eventemitter3_1 = eventemitter3.EventEmitter;

    var isPromiseAvailable = (function () {
        var globalNS = (function () {
            if (typeof global !== 'undefined') {
                return global;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            throw new Error('unable to locate global object');
        })();
        //tslint:disable-next-line
        return globalNS['Promise'] ? true : false;
    })();

    var EventEmitterModule = /** @class */ (function (_super) {
        __extends(EventEmitterModule, _super);
        function EventEmitterModule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Attach an event handler function for one or more events
         * You can check all events [here](/events)
         *
         * @param event - The Event name, such as `WebPlayer.UI_EVENTS.PLAY_CLICK`
         * @param fn - A function callback to execute when the event is triggered.
         * @param context - Value to use as `this` (i.e the reference Object) when executing callback.
         *
         * @example
         * const WebPlayer = require('webplayer');
         * const player = WebPlayer.create();
         *
         * player.on(WebPlayer.UI_EVENTS.PLAY_CLICK, () => {
         *   // Will be executed after you will click on play button
         * });
         *
         * // To supply a context value for `this` when the callback is invoked,
         * // pass the optional context argument
         * player.on(WebPlayer.VIDEO_EVENTS.UPLOAD_STALLED, this.handleStalledUpload, this);
         */
        EventEmitterModule.prototype.on = function (event, fn, context) {
            return _super.prototype.on.call(this, event, fn, context);
        };
        /**
         * The `.once()` method is identical to `.on()`, except that the handler for a given element and event type is unbound after its first invocation.
         *
         * @param event - The Event name, such as `WebPlayer.UI_EVENTS.PLAY_CLICK`
         * @param fn - A function callback to execute when the event is triggered.
         * @param context - Value to use as `this` (i.e the reference Object) when executing callback.
         *
         * @example
         * const WebPlayer = require('webplayer');
         * const player = WebPlayer.create();
         *
         * player.once(WebPlayer.UI_EVENTS.PLAY_CLICK, () => {
         *   // Will be executed only one time
         * });
         */
        EventEmitterModule.prototype.once = function (event, fn, context) {
            return _super.prototype.once.call(this, event, fn, context);
        };
        /**
         * Remove an event handler.
         *
         * @param event - The Event name, such as `WebPlayer.UI_EVENTS.PLAY_CLICK`
         * @param fn - Only remove the listeners that match this function.
         * @param context - Only remove the listeners that have this context.
         * @param once - Only remove one-time listeners.
         *
         * @example
         * const WebPlayer = require('webplayer');
         * const player = WebPlayer.create();
         *
         * const callback = function() {
         *   // Code to handle some kind of event
         * };
         *
         * // ... Now callback will be called when some one will pause the video ...
         * player.on(WebPlayer.UI_EVENTS.PAUSE, callback);
         *
         * // ... callback will no longer be called.
         * player.off(WebPlayer.UI_EVENTS.PAUSE, callback);
         *
         * // ... remove all handlers for event UI_EVENTS.PAUSE.
         * player.off(WebPlayer.UI_EVENTS.PAUSE);
         */
        EventEmitterModule.prototype.off = function (event, fn, context, once) {
            return _super.prototype.off.call(this, event, fn, context, once);
        };
        /**
         * Method for binding array of listeners with events inside player.
         *
         * @example
         *
         * this._unbindEvents = this._eventEmitter.bindEvents([
         *     [WebPlayer.VIDEO_EVENTS.STATE_CHANGED, this._processStateChange],
         *     [WebPlayer.VIDEO_EVENTS.LIVE_STATE_CHANGED, this._processLiveStateChange],
         *     [WebPlayer.VIDEO_EVENTS.CHUNK_LOADED, this._updateBufferIndicator],
         *     [WebPlayer.VIDEO_EVENTS.DURATION_UPDATED, this._updateAllIndicators],
         *   ],
         *   this,
         * );
         *
         * //...
         *
         * this._unbindEvents()
         *
         * @param eventsMap
         * @param defaultFnContext
         * @returns unbindEvents
         */
        EventEmitterModule.prototype.bindEvents = function (eventsMap, defaultFnContext) {
            var _this = this;
            var events = [];
            eventsMap.forEach(function (_a) {
                var eventName = _a[0], fn = _a[1], _b = _a[2], fnContext = _b === void 0 ? defaultFnContext : _b;
                _this.on(eventName, fn, fnContext);
                events.push(function () {
                    _this.off(eventName, fn, fnContext);
                });
            });
            return function () {
                events.forEach(function (unbindEvent) {
                    unbindEvent();
                });
            };
        };
        //Now emit fire events only at the end of current macrotask, as part as next microtask
        EventEmitterModule.prototype.emitAsync = function (event) {
            var _this = this;
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            //Handle IE11
            if (!isPromiseAvailable) {
                if (setImmediate) {
                    setImmediate(function () { return _super.prototype.emit.apply(_this, [event].concat(args)); });
                }
                else {
                    setTimeout(function () { return _super.prototype.emit.apply(_this, [event].concat(args)); });
                }
            }
            else {
                return Promise.resolve().then(function () { return _super.prototype.emit.apply(_this, [event].concat(args)); });
            }
        };
        EventEmitterModule.prototype.destroy = function () {
            this.removeAllListeners();
        };
        EventEmitterModule.moduleName = 'eventEmitter';
        __decorate([
            playerAPI()
        ], EventEmitterModule.prototype, "on", null);
        __decorate([
            playerAPI()
        ], EventEmitterModule.prototype, "once", null);
        __decorate([
            playerAPI()
        ], EventEmitterModule.prototype, "off", null);
        return EventEmitterModule;
    }(eventemitter3_1));

    //TODO: Find source of problem with native HLS on Safari, when playing state triggered but actual playing is delayed
    var Engine = /** @class */ (function () {
        function Engine(_a) {
            var eventEmitter = _a.eventEmitter, nativeOutput = _a.nativeOutput, config = _a.config;
            this._eventEmitter = eventEmitter;
            this._config = config;
            this._defaultOutput = nativeOutput;
            this._output = nativeOutput;
            this._applyConfig(this._config);
        }
        Engine.prototype._applyConfig = function (config) {
            if (config === void 0) { config = {}; }
            var preload = config.preload, autoplay = config.autoplay, loop = config.loop, muted = config.muted, volume = config.volume, playsinline = config.playsinline, crossOrigin = config.crossOrigin, src = config.src;
            this.setPreload(preload);
            this.setAutoplay(autoplay);
            this.setLoop(loop);
            this.setMute(muted);
            this.setVolume(volume);
            this.setPlaysinline(playsinline);
            this.setCrossOrigin(crossOrigin);
            if (src) {
                this.setSrc(src);
            }
        };
        Engine.prototype.getElement = function () {
            return this._output.getElement();
        };
        Object.defineProperty(Engine.prototype, "isDynamicContent", {
            get: function () {
                return this._output.isDynamicContent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isDynamicContentEnded", {
            get: function () {
                return this._output.isDynamicContentEnded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isSeekAvailable", {
            get: function () {
                return this._output.isSeekAvailable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isMetadataLoaded", {
            get: function () {
                return this._output.isMetadataLoaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isPreloadActive", {
            get: function () {
                return this._output.isPreloadActive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isAutoPlayActive", {
            get: function () {
                return this._output.isAutoPlayActive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isSyncWithLive", {
            get: function () {
                return this._output.isSyncWithLive;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Method for setting source of video to player.
         * @param src Array with multiple sources
         * @param callback
         * @example
         * player.setSrc([
         *   'https://my-url/video.mp4',
         *   'https://my-url/video.webm',
         *   'https://my-url/video.m3u8'
         * ]);
         * @note
         * Read more about [video source](/video-source)
         */
        Engine.prototype.setSrc = function (src, callback) {
            if (src === this.getSrc()) {
                return;
            }
            this._output.setSrc(src, callback);
        };
        /**
         * Return current source of video
         * @example
         * player.getSrc(); // ['https://my-url/video.mp4']
         */
        Engine.prototype.getSrc = function () {
            return this._output.src;
        };
        Engine.prototype.reset = function () {
            this.pause();
            this.seekTo(0);
            this._eventEmitter.emitAsync(VideoEvent$1.RESET);
        };
        /**
         * Start playback
         * @example
         * player.play();
         */
        Engine.prototype.play = function () {
            this._output.play();
        };
        /**
         * Pause playback
         * @example
         * player.pause();
         */
        Engine.prototype.pause = function () {
            this._output.pause();
        };
        /**
         * Toggle (play\pause) playback of video
         * @example
         * player.togglePlayback();
         */
        Engine.prototype.togglePlayback = function () {
            if (this.isPaused) {
                this.play();
            }
            else {
                this.pause();
            }
        };
        /**
         * Reset video playback
         * @example
         * player.play();
         * console.log(player.isPaused); // false
         * ...
         * player.resetPlayback();
         * console.log(player.isPaused); // true;
         * console.log(player.getCurrentTime()); //0;
         */
        Engine.prototype.resetPlayback = function () {
            this.pause();
            this.seekTo(0);
            this._eventEmitter.emitAsync(VideoEvent$1.RESET);
        };
        Object.defineProperty(Engine.prototype, "isPaused", {
            /**
             * High level state of video playback. Returns true if playback is paused.
             * For more advance state use `getPlaybackState`
             * @example
             * player.play();
             * console.log(player.isPaused);
             */
            get: function () {
                return this._output.isPaused;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Engine.prototype, "isEnded", {
            /**
             * High level state of video playback. Returns true if playback is ended. Also note, that `isPaused` will return `true` if playback is ended also.
             * For more advance state use `getPlaybackState`
             * @example
             * player.play();
             * console.log(player.isEnded);
             */
            get: function () {
                return this._output.isEnded;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Method for synchronize current playback with live point. Available only if you playing live source.
         * @example
         * player.syncWithLive();
         */
        Engine.prototype.syncWithLive = function () {
            this._output.syncWithLive();
        };
        /**
         * Method for going forward in playback by your value
         * @param sec - Value in seconds
         * @example
         * player.seekForward(5);
         */
        Engine.prototype.seekForward = function (sec) {
            var duration = this.getDuration();
            if (duration) {
                var current = this.getCurrentTime();
                this.seekTo(Math.min(current + sec, duration));
            }
        };
        /**
         * Method for going backward in playback by your value
         * @param sec - Value in seconds
         * @example
         * player.seekBackward(5);
         */
        Engine.prototype.seekBackward = function (sec) {
            var duration = this.getDuration();
            if (duration) {
                var current = this.getCurrentTime();
                this.seekTo(Math.max(current - sec, 0));
            }
        };
        /**
         * Set volume
         * @param volume - Volume value `0..100`
         * @example
         * player.setVolume(50);
         */
        Engine.prototype.setVolume = function (volume) {
            var parsedVolume = Number(volume);
            var newVolume = isNaN(parsedVolume)
                ? 1
                : Math.max(0, Math.min(Number(volume) / 100, 1));
            this._output.setVolume(newVolume);
        };
        /**
         * Get volume
         * @example
         * player.getVolume(); // 50
         */
        Engine.prototype.getVolume = function () {
            return this._output.volume * 100;
        };
        /**
         * Method for increasing current volume by value
         * @param value - Value from 0 to 100
         * @example
         * player.increaseVolume(30);
         */
        Engine.prototype.increaseVolume = function (value) {
            this.setVolume(this.getVolume() + value);
        };
        /**
         * Method for decreasing current volume by value
         * @param value - Value from 0 to 100
         * @example
         * player.decreaseVolume(30);
         */
        Engine.prototype.decreaseVolume = function (value) {
            this.setVolume(this.getVolume() - value);
        };
        Engine.prototype.setMute = function (isMuted) {
            this._output.setMute(isMuted);
        };
        /**
         * Mute the video
         * @example
         * player.mute();
         */
        Engine.prototype.mute = function () {
            this.setMute(true);
        };
        /**
         * Unmute the video
         * @example
         * player.unmute(true);
         */
        Engine.prototype.unmute = function () {
            this.setMute(false);
        };
        Object.defineProperty(Engine.prototype, "isMuted", {
            /**
             * Get mute flag
             * @example
             * player.mute();
             * player.isMuted; // true
             * player.unmute();
             * player.isMuted: // false
             */
            get: function () {
                return this._output.isMuted;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Set autoplay flag
         * @example
         * player.setAutoplay();
         */
        Engine.prototype.setAutoplay = function (isAutoplay) {
            this._output.setAutoplay(isAutoplay);
        };
        /**
         * Get autoplay flag
         * @example
         * player.getAutoplay(); // true
         */
        Engine.prototype.getAutoplay = function () {
            return this._output.isAutoplay;
        };
        /**
         * Set loop flag
         * @param isLoop - If `true` video will be played again after it will finish
         * @example
         * player.setLoop(true);
         */
        Engine.prototype.setLoop = function (isLoop) {
            this._output.setLoop(isLoop);
        };
        /**
         * Get loop flag
         * @example
         * player.getLoop(); // true
         */
        Engine.prototype.getLoop = function () {
            return this._output.isLoop;
        };
        /**
         * Method for setting playback rate
         */
        Engine.prototype.setPlaybackRate = function (rate) {
            this._output.setPlaybackRate(rate);
        };
        /**
         * Return current playback rate
         */
        Engine.prototype.getPlaybackRate = function () {
            return this._output.playbackRate;
        };
        /**
         * Set preload type
         * @example
         * player.setPreload('none');
         */
        Engine.prototype.setPreload = function (preload) {
            this._output.setPreload(preload);
        };
        /**
         * Return preload type
         * @example
         * player.getPreload(); // none
         */
        Engine.prototype.getPreload = function () {
            return this._output.preload;
        };
        /**
         * Return current time of video playback
         * @example
         * player.getCurrentTime(); //  60.139683
         */
        Engine.prototype.getCurrentTime = function () {
            return this._output.currentTime;
        };
        /**
         * Method for seeking to time in video
         * @param time - Time in seconds
         * @example
         * player.seekTo(34);
         */
        Engine.prototype.seekTo = function (time) {
            this._output.setCurrentTime(time);
        };
        /**
         * Return duration of video
         * @example
         * player.getDuration(); // 180.149745
         */
        Engine.prototype.getDuration = function () {
            return this._output.duration || 0;
        };
        /**
         * Return real width of video from metadata
         * @example
         * player.getVideoWidth(); // 400
         */
        Engine.prototype.getVideoWidth = function () {
            return this._output.videoWidth;
        };
        /**
         * Return real height of video from metadata
         * @example
         * player.getVideoHeight(); // 225
         */
        Engine.prototype.getVideoHeight = function () {
            return this._output.videoHeight;
        };
        Engine.prototype.getBuffered = function () {
            return this._output.buffered;
        };
        /**
         * Set playsinline flag
         * @param isPlaysinline - If `false` - video will be played in full screen, `true` - inline
         * @example
         * player.setPlaysinline(true);
         */
        Engine.prototype.setPlaysinline = function (isPlaysinline) {
            this._output.setInline(isPlaysinline);
        };
        /**
         * Get playsinline flag
         * @example
         * player.getPlaysinline(); // true
         */
        Engine.prototype.getPlaysinline = function () {
            return this._output.isInline;
        };
        /**
         * Set crossorigin attribute for video
         * @example
         * player.setCrossOrigin('anonymous');
         */
        Engine.prototype.setCrossOrigin = function (crossOrigin) {
            this._output.setCrossOrigin(crossOrigin);
        };
        /**
         * Get crossorigin attribute value for video
         * @example
         * player.getCrossOrigin(); // 'anonymous'
         */
        Engine.prototype.getCrossOrigin = function () {
            return this._output.crossOrigin;
        };
        /**
         * Return current state of playback
         */
        Engine.prototype.getCurrentState = function () {
            return this._output.currentState;
        };
        /**
         * Return object with internal debug info
         *
         * @example
         * player.getDebugInfo();
         *
         * @note
         * The above command returns JSON structured like this:
         *
         * @example
         * {
         *   "type": "HLS",
         *   "viewDimensions": {
         *     "width": 700,
         *     "height": 394
         *   }
         *   "url": "https://example.com/video.m3u8",
         *   "currentTime": 22.092514,
         *   "duration": 60.139683,
         *   "loadingStateTimestamps": {
         *     "metadata-loaded": 76,
         *     "ready-to-play": 67
         *   },
         *   "bitrates": [
         *     // Available bitrates
         *     "100000",
         *     "200000",
         *     ...
         *   ],
         *   // One of available bitrates, that used right now
         *   "currentBitrate": "100000",
         *   // Raw estimation of bandwidth, that could be used without playback stall
         *   "bwEstimate": "120000"
         *   "overallBufferLength": 60.139683,
         *   "nearestBufferSegInfo": {
         *     "start": 0,
         *     "end": 60.139683
         *   }
         * }
         */
        Engine.prototype.getDebugInfo = function () {
            return this._output.getDebugInfo();
        };
        Engine.prototype.destroy = function () {
            // all dependencies are modules and will be destroyed from Player.destroy()
            return;
        };
        Engine.prototype.changeOutput = function (output, callback) {
            var src = this.getSrc();
            this._output.pause();
            this._output = output;
            this._applyConfig(this._config);
            return this._output.setSrc(src, callback);
        };
        Engine.prototype.resetOutput = function () {
            var wasPlaying = !this._output.isPaused;
            var currentTime = this._output.currentTime;
            this._output = this._defaultOutput;
            this._output.setCurrentTime(currentTime);
            if (wasPlaying) {
                this._output.play();
            }
        };
        Engine.moduleName = 'engine';
        Engine.dependencies = ['eventEmitter', 'config', 'nativeOutput'];
        __decorate([
            playerAPI()
        ], Engine.prototype, "setSrc", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getSrc", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "reset", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "play", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "pause", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "togglePlayback", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "resetPlayback", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "isPaused", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "isEnded", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "syncWithLive", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "seekForward", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "seekBackward", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setVolume", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getVolume", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "increaseVolume", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "decreaseVolume", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "mute", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "unmute", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "isMuted", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setAutoplay", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getAutoplay", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setLoop", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getLoop", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setPlaybackRate", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getPlaybackRate", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setPreload", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getPreload", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getCurrentTime", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "seekTo", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getDuration", null);
        __decorate([
            playerAPI('getVideoRealWidth')
        ], Engine.prototype, "getVideoWidth", null);
        __decorate([
            playerAPI('getVideoRealHeight')
        ], Engine.prototype, "getVideoHeight", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setPlaysinline", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getPlaysinline", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "setCrossOrigin", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getCrossOrigin", null);
        __decorate([
            playerAPI('getPlaybackState')
        ], Engine.prototype, "getCurrentState", null);
        __decorate([
            playerAPI()
        ], Engine.prototype, "getDebugInfo", null);
        return Engine;
    }());

    var SHORTHAND_HEX_COLOR_PATTERN = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    var HEX_COLOR_PATTERN = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    function hexToRgb(hex) {
        hex = hex.replace(SHORTHAND_HEX_COLOR_PATTERN, function (_, r, g, b) { return r + r + g + g + b + b; });
        var result = hex.match(HEX_COLOR_PATTERN);
        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            };
        }
        throw new Error('WebPlayer.js: Color passed to theme should be in HEX format');
    }

    function transperentizeColor(color, alpha) {
        if (alpha === void 0) { alpha = 1; }
        var _a = hexToRgb(color), r = _a.r, g = _a.g, b = _a.b;
        return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
    }

    function camelToKebab(string) {
        return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    var generatedIds = new Map();
    function getUniquePostfix(className) {
        if (generatedIds.has(className)) {
            var newID = generatedIds.get(className) + 1;
            generatedIds.set(className, newID);
            return "" + newID;
        }
        generatedIds.set(className, 0);
        return '';
    }
    function getUniqueId(classImportName) {
        var kebabName = camelToKebab(classImportName);
        return "" + kebabName + getUniquePostfix(kebabName);
    }

    function getUniqueClassName(classImportName) {
        return "wix-webplayer--" + getUniqueId(classImportName);
    }
    function generateClassNames(rules) {
        return Object.keys(rules).reduce(function (acc, classImportName) {
            var _a;
            return (__assign({}, acc, (_a = {}, _a[classImportName] = getUniqueClassName(classImportName), _a)));
        }, {});
    }

    var StyleSheet = /** @class */ (function () {
        function StyleSheet() {
            this._rulesByModule = new Map();
            this._classNamesByModule = new Map();
            this._data = {};
        }
        StyleSheet.prototype.attach = function () {
            var _this = this;
            this._styleNode = this._styleNode || document.createElement('style');
            var discoveredStyles = [];
            this._rulesByModule.forEach(function (_, module) {
                discoveredStyles.push(_this._getModuleCSS(module));
            });
            this._styleNode.innerHTML = discoveredStyles.join(' ');
            document.getElementsByTagName('head')[0].appendChild(this._styleNode);
        };
        StyleSheet.prototype.update = function (data) {
            this._data = __assign({}, this._data, data);
            if (this._styleNode) {
                this.attach();
            }
        };
        StyleSheet.prototype.registerModuleTheme = function (module, rules) {
            //todo maybe we would like to update overrides for module? Or at least show warning instead of Error
            if (this._rulesByModule.get(module)) {
                throw new Error('can`t register multiple themes for one module');
            }
            this._rulesByModule.set(module, rules);
            this._classNamesByModule.set(module, generateClassNames(rules));
        };
        StyleSheet.prototype.getModuleClassNames = function (module) {
            return this._classNamesByModule.get(module);
        };
        StyleSheet.prototype._getModuleCSS = function (module) {
            var _this = this;
            var moduleRules = this._rulesByModule.get(module);
            var moduleClassNames = this._classNamesByModule.get(module);
            if (!moduleRules || !moduleClassNames) {
                return '';
            }
            return Object.keys(moduleRules)
                .map(function (classImportName) {
                return _this._getRuleCSS(moduleRules[classImportName], moduleClassNames[classImportName]);
            })
                .join(' ');
        };
        StyleSheet.prototype._getRuleCSS = function (rule, ruleClassName) {
            var _this = this;
            if (!rule || !ruleClassName) {
                return '';
            }
            var complexRuleNames = Object.keys(rule)
                .filter(function (ruleName) { return typeof rule[ruleName] === 'object'; })
                .map(function (ruleName) {
                return ruleName.indexOf('&') !== -1 ? ruleName : "& " + ruleName;
            });
            var complexRules = complexRuleNames
                .map(function (ruleName) {
                var selector = ruleName.replace(/&/g, "." + ruleClassName);
                //don't want to allow deep nesting now, maybe later
                return selector + " {" + _this._getRuleStyles(rule[ruleName]) + "}";
            })
                .join(' ');
            return "." + ruleClassName + " {" + this._getRuleStyles(rule) + "} " + complexRules;
        };
        StyleSheet.prototype._getRuleStyles = function (rule) {
            var _this = this;
            var simpleRuleNames = Object.keys(rule).filter(function (ruleName) { return typeof rule[ruleName] !== 'object'; });
            return simpleRuleNames
                .map(function (ruleName) {
                return camelToKebab(ruleName) + ": " + (typeof rule[ruleName] === 'function'
                    ? rule[ruleName](_this._data)
                    : rule[ruleName]);
            })
                .join('; ');
        };
        return StyleSheet;
    }());

    var DEFAULT_THEME_CONFIG = {
        color: '#FFF',
        liveColor: '#ea492e',
        progressColor: '#FFF',
    };
    var ThemeService = /** @class */ (function () {
        function ThemeService(_a) {
            var themeConfig = _a.themeConfig;
            var _this = this;
            this._styleSheet = new StyleSheet();
            this._styleSheet.update(__assign({}, DEFAULT_THEME_CONFIG, themeConfig));
            // setTimeout here is for calling `attach` after all modules resolved.
            window.setTimeout(function () {
                _this._styleSheet && _this._styleSheet.attach();
            }, 0);
        }
        /**
         * Method for setting theme for player instance
         *
         * @example
         * player.updateTheme({
         *   progressColor: "#AEAD22"
         * })
         * @note
         *
         * You can check info about theming [here](/themes)
         *
         * @param themeConfig - Theme config
         *
         */
        ThemeService.prototype.updateTheme = function (themeConfig) {
            this._styleSheet.update(themeConfig);
        };
        ThemeService.prototype.registerModuleTheme = function (module, rules) {
            this._styleSheet.registerModuleTheme(module, rules);
        };
        ThemeService.prototype.get = function (module) {
            return this._styleSheet.getModuleClassNames(module);
        };
        ThemeService.prototype.destroy = function () {
            this._styleSheet = null;
        };
        ThemeService.moduleName = 'theme';
        ThemeService.dependencies = ['themeConfig'];
        __decorate([
            playerAPI()
        ], ThemeService.prototype, "updateTheme", null);
        return ThemeService;
    }());

    var _a;
    var map = (_a = {}, _a[TextLabel$1.LOGO_LABEL] = 'Open WebPlayer', _a[TextLabel$1.LOGO_TOOLTIP] = 'Open WebPlayer', _a[TextLabel$1.LIVE_INDICATOR_TEXT] = function (_a) {
            var isEnded = _a.isEnded;
            return !isEnded ? 'Live' : 'Live Ended';
        }, _a[TextLabel$1.LIVE_SYNC_LABEL] = 'Sync to LiveStream', _a[TextLabel$1.LIVE_SYNC_TOOLTIP] = 'Sync to LiveStream', _a[TextLabel$1.PAUSE_CONTROL_LABEL] = 'Pause', _a[TextLabel$1.PLAY_CONTROL_LABEL] = 'Play', _a[TextLabel$1.PROGRESS_CONTROL_LABEL] = 'Progress control', _a[TextLabel$1.PROGRESS_CONTROL_VALUE] = function (_a) {
            var percent = _a.percent;
            return "Already played " + percent + "%";
        }, _a[TextLabel$1.MUTE_CONTROL_LABEL] = 'Mute', _a[TextLabel$1.MUTE_CONTROL_TOOLTIP] = 'Mute', _a[TextLabel$1.UNMUTE_CONTROL_LABEL] = 'Unmute', _a[TextLabel$1.UNMUTE_CONTROL_TOOLTIP] = 'Unmute', _a[TextLabel$1.VOLUME_CONTROL_LABEL] = 'Volume control', _a[TextLabel$1.VOLUME_CONTROL_VALUE] = function (_a) {
            var volume = _a.volume;
            return "Volume is " + volume + "%";
        }, _a[TextLabel$1.ENTER_FULL_SCREEN_LABEL] = 'Full screen', _a[TextLabel$1.ENTER_FULL_SCREEN_TOOLTIP] = 'Full screen', _a[TextLabel$1.EXIT_FULL_SCREEN_LABEL] = 'Exit full screen', _a[TextLabel$1.EXIT_FULL_SCREEN_TOOLTIP] = 'Exit full screen', _a[TextLabel$1.ENTER_PICTURE_IN_PICTURE_LABEL] = 'MiniPlayer', _a[TextLabel$1.ENTER_PICTURE_IN_PICTURE_TOOLTIP] = 'MiniPlayer', _a[TextLabel$1.EXIT_PICTURE_IN_PICTURE_LABEL] = 'Exit MiniPlayer', _a[TextLabel$1.EXIT_PICTURE_IN_PICTURE_TOOLTIP] = 'Exit MiniPlayer', _a[TextLabel$1.DOWNLOAD_BUTTON_LABEL] = 'Download', _a[TextLabel$1.DOWNLOAD_BUTTON_TOOLTIP] = 'Download', _a);

    var TextMap = /** @class */ (function () {
        function TextMap(_a) {
            var config = _a.config;
            this._textMap = __assign({}, map, config.texts);
        }
        TextMap.prototype.get = function (id, args, defaultText) {
            if (!this._textMap) {
                return;
            }
            var text = this._textMap[id] || defaultText;
            if (typeof text === 'function') {
                return text(args);
            }
            return text;
        };
        TextMap.prototype.destroy = function () {
            this._textMap = null;
        };
        TextMap.moduleName = 'textMap';
        TextMap.dependencies = ['config'];
        return TextMap;
    }());

    var fnMap = [
        [
            'requestFullscreen',
            'exitFullscreen',
            'fullscreenElement',
            'fullscreenEnabled',
            'fullscreenchange',
            'fullscreenerror',
        ],
        // new WebKit
        [
            'webkitRequestFullscreen',
            'webkitExitFullscreen',
            'webkitFullscreenElement',
            'webkitFullscreenEnabled',
            'webkitfullscreenchange',
            'webkitfullscreenerror',
        ],
        // old WebKit (Safari 5.1)
        [
            'webkitRequestFullScreen',
            'webkitCancelFullScreen',
            'webkitCurrentFullScreenElement',
            'webkitCancelFullScreen',
            'webkitfullscreenchange',
            'webkitfullscreenerror',
        ],
        [
            'mozRequestFullScreen',
            'mozCancelFullScreen',
            'mozFullScreenElement',
            'mozFullScreenEnabled',
            'mozfullscreenchange',
            'mozfullscreenerror',
        ],
        [
            'msRequestFullscreen',
            'msExitFullscreen',
            'msFullscreenElement',
            'msFullscreenEnabled',
            'MSFullscreenChange',
            'MSFullscreenError',
        ],
    ];
    /* ignore coverage */
    function getFullScreenFn() {
        var ret = {};
        for (var i = 0; i < fnMap.length; i += 1) {
            if (fnMap[i][1] in document) {
                for (var j = 0; j < fnMap[i].length; j += 1) {
                    ret[fnMap[0][j]] = fnMap[i][j];
                }
                return ret;
            }
        }
        return false;
    }
    var DesktopFullScreen = /** @class */ (function () {
        function DesktopFullScreen(elem, callback) {
            this._$elem = elem;
            this._callback = callback;
            this._fullscreenFn = getFullScreenFn();
            this._bindEvents();
        }
        Object.defineProperty(DesktopFullScreen.prototype, "isAPIExist", {
            get: function () {
                return Boolean(this._fullscreenFn);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DesktopFullScreen.prototype, "isInFullScreen", {
            get: function () {
                if (typeof this._fullscreenFn === 'boolean') {
                    return false;
                }
                return Boolean(document[this._fullscreenFn.fullscreenElement]);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DesktopFullScreen.prototype, "isEnabled", {
            get: function () {
                if (typeof this._fullscreenFn === 'boolean') {
                    return false;
                }
                return (this.isAPIExist && document[this._fullscreenFn.fullscreenEnabled]);
            },
            enumerable: true,
            configurable: true
        });
        DesktopFullScreen.prototype._bindEvents = function () {
            if (typeof this._fullscreenFn === 'boolean') {
                return false;
            }
            document.addEventListener(this._fullscreenFn.fullscreenchange, this._callback);
        };
        DesktopFullScreen.prototype._unbindEvents = function () {
            if (typeof this._fullscreenFn === 'boolean') {
                return false;
            }
            document.removeEventListener(this._fullscreenFn.fullscreenchange, this._callback);
        };
        DesktopFullScreen.prototype.request = function () {
            if (!this.isEnabled) {
                return;
            }
            var request = this._fullscreenFn.requestFullscreen;
            // Work around Safari 5.1 bug: reports support for
            // keyboard in fullscreen even though it doesn't.
            // Browser sniffing, since the alternative with
            // setTimeout is even worse.
            if (/5\.1[.\d]* Safari/.test(navigator.userAgent)) {
                this._$elem[request]();
            }
            else {
                this._$elem[request](Element.ALLOW_KEYBOARD_INPUT);
            }
        };
        DesktopFullScreen.prototype.exit = function () {
            if (!this.isEnabled) {
                return;
            }
            document[this._fullscreenFn.exitFullscreen]();
        };
        DesktopFullScreen.prototype.destroy = function () {
            this._unbindEvents();
            this._$elem = null;
        };
        return DesktopFullScreen;
    }());

    var HAVE_METADATA = 1;
    var isFullScreenRequested = false;
    var IOSFullScreen = /** @class */ (function () {
        function IOSFullScreen(elem, callback) {
            this._$elem = elem;
            this._callback = callback;
            this._bindEvents();
            this._enterWhenHasMetaData = this._enterWhenHasMetaData.bind(this);
        }
        Object.defineProperty(IOSFullScreen.prototype, "isAPIExist", {
            get: function () {
                //@ts-expect-error
                return Boolean(this._$elem && this._$elem.webkitSupportsFullscreen);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IOSFullScreen.prototype, "isInFullScreen", {
            get: function () {
                //@ts-expect-error
                return Boolean(this._$elem && this._$elem.webkitDisplayingFullscreen);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(IOSFullScreen.prototype, "isEnabled", {
            get: function () {
                return this.isAPIExist;
            },
            enumerable: true,
            configurable: true
        });
        IOSFullScreen.prototype._bindEvents = function () {
            this._$elem.addEventListener('webkitbeginfullscreen', this._callback);
            this._$elem.addEventListener('webkitendfullscreen', this._callback);
        };
        IOSFullScreen.prototype._unbindEvents = function () {
            this._$elem.removeEventListener('webkitbeginfullscreen', this._callback);
            this._$elem.removeEventListener('webkitendfullscreen', this._callback);
            this._$elem.removeEventListener('loadedmetadata', this._enterWhenHasMetaData);
        };
        IOSFullScreen.prototype._enterWhenHasMetaData = function () {
            this._$elem.removeEventListener('loadedmetadata', this._enterWhenHasMetaData);
            isFullScreenRequested = false;
            this.request();
        };
        IOSFullScreen.prototype.request = function () {
            if (!this.isEnabled || this.isInFullScreen || isFullScreenRequested) {
                return;
            }
            try {
                //@ts-expect-error
                this._$elem.webkitEnterFullscreen();
            }
            catch (e) {
                if (this._$elem.readyState < HAVE_METADATA) {
                    this._$elem.addEventListener('loadedmetadata', this._enterWhenHasMetaData);
                    isFullScreenRequested = true;
                }
            }
        };
        IOSFullScreen.prototype.exit = function () {
            if (!this.isEnabled || !this.isInFullScreen) {
                return;
            }
            //@ts-expect-error
            this._$elem.webkitExitFullscreen();
        };
        IOSFullScreen.prototype.destroy = function () {
            this._unbindEvents();
            this._$elem = null;
        };
        return IOSFullScreen;
    }());

    var DEFAULT_CONFIG$1 = {
        exitFullScreenOnEnd: true,
        enterFullScreenOnPlay: false,
        exitFullScreenOnPause: false,
        pauseVideoOnFullScreenExit: false,
    };
    var FullScreenManager = /** @class */ (function () {
        function FullScreenManager(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine, rootContainer = _a.rootContainer, config = _a.config;
            this._exitFullScreenOnEnd = false;
            this._enterFullScreenOnPlay = false;
            this._exitFullScreenOnPause = false;
            this._pauseVideoOnFullScreenExit = false;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            if (config.disableFullScreen) {
                this._isEnabled = false;
            }
            else {
                this._isEnabled = true;
                var _config = __assign({}, DEFAULT_CONFIG$1);
                this._exitFullScreenOnEnd = _config.exitFullScreenOnEnd;
                this._enterFullScreenOnPlay = _config.enterFullScreenOnPlay;
                this._exitFullScreenOnPause = _config.exitFullScreenOnPause;
                this._pauseVideoOnFullScreenExit = _config.pauseVideoOnFullScreenExit;
            }
            this._onChange = this._onChange.bind(this);
            if (isIOS()) {
                this._element = this._engine.getElement();
                this._helper = new IOSFullScreen(this._engine.getElement(), this._onChange);
            }
            else {
                this._element = rootContainer.getElement();
                this._helper = new DesktopFullScreen(rootContainer.getElement(), this._onChange);
            }
            this._bindEvents();
        }
        FullScreenManager.prototype._onChange = function (event) {
            if (event.target !== this._element) {
                return;
            }
            if (!this._helper.isInFullScreen && this._pauseVideoOnFullScreenExit) {
                this._engine.pause();
            }
            this._eventEmitter.emitAsync(UIEvent$1.FULL_SCREEN_STATE_CHANGED, this._helper.isInFullScreen);
        };
        FullScreenManager.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.STATE_CHANGED, this._processNextStateFromEngine],
                [VideoEvent$1.PLAY_REQUEST, this._enterOnPlayRequested],
            ], this);
        };
        FullScreenManager.prototype._exitOnEnd = function () {
            if (this._exitFullScreenOnEnd && this.isInFullScreen) {
                this.exitFullScreen();
            }
        };
        FullScreenManager.prototype._enterOnPlayRequested = function () {
            if (this._enterFullScreenOnPlay && !this.isInFullScreen) {
                this.enterFullScreen();
            }
        };
        FullScreenManager.prototype._exitOnPauseRequested = function () {
            if (this._exitFullScreenOnPause && this.isInFullScreen) {
                this.exitFullScreen();
            }
        };
        FullScreenManager.prototype._processNextStateFromEngine = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case EngineState$1.ENDED: {
                    this._exitOnEnd();
                    break;
                }
                case EngineState$1.PAUSED: {
                    this._exitOnPauseRequested();
                    break;
                }
                /* ignore coverage */
                default:
                    break;
            }
        };
        /**
         * Allow player try to exit full screen on pause
         * @example
         * player.play();
         * player.enableExitFullScreenOnPause();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * player.pause();
         * console.log(player.isInFullScreen) // false
         */
        FullScreenManager.prototype.enableExitFullScreenOnPause = function () {
            this._exitFullScreenOnPause = true;
        };
        /**
         * Disallow player to exit full screen on pause
         * @example
         * player.play();
         * player.disableExitFullScreenOnPause();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * player.pause();
         * console.log(player.isInFullScreen) // true
         */
        FullScreenManager.prototype.disableExitFullScreenOnPause = function () {
            this._exitFullScreenOnPause = false;
        };
        /**
         * Allow player try to exit full screen on end
         * @example
         * player.play();
         * player.enableExitFullScreenOnEnd();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * console.log(player.isEnded); // true
         * console.log(player.isInFullScreen) // false
         */
        FullScreenManager.prototype.enableExitFullScreenOnEnd = function () {
            this._exitFullScreenOnEnd = true;
        };
        /**
         * Disallow player try to exit full screen on end
         * @example
         * player.play();
         * player.disableExitFullScreenOnEnd();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * console.log(player.isEnded); // true
         * console.log(player.isInFullScreen) // true
         */
        FullScreenManager.prototype.disableExitFullScreenOnEnd = function () {
            this._exitFullScreenOnPause = false;
        };
        /**
         * Allow player try to exit full screen on end
         * @example
         * player.enableEnterFullScreenOnPlay();
         * console.log(player.isInFullScreen) // false
         * player.play();
         * console.log(player.isInFullScreen) // true
         */
        FullScreenManager.prototype.enableEnterFullScreenOnPlay = function () {
            this._enterFullScreenOnPlay = true;
        };
        /**
         * Disallow player try to exit full screen on end
         * @example
         * player.disableEnterFullScreenOnPlay();
         * console.log(player.isInFullScreen) // false
         * player.play();
         * console.log(player.isInFullScreen) // false
         */
        FullScreenManager.prototype.disableEnterFullScreenOnPlay = function () {
            this._enterFullScreenOnPlay = false;
        };
        /**
         * Allow player try to exit full screen on end
         * @example
         * player.play();
         * player.enablePauseVideoOnFullScreenExit();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * player.pause();
         * console.log(player.isInFullScreen) // false
         */
        FullScreenManager.prototype.enablePauseVideoOnFullScreenExit = function () {
            this._pauseVideoOnFullScreenExit = true;
        };
        /**
         * Disallow player try to exit full screen on end
         * @example
         * player.play();
         * player.enablePauseVideoOnFullScreenExit();
         * player.enterFullScreen();
         * console.log(player.isInFullScreen) // true
         * player.pause();
         * console.log(player.isInFullScreen) // true
         */
        FullScreenManager.prototype.disablePauseVideoOnFullScreenExit = function () {
            this._pauseVideoOnFullScreenExit = false;
        };
        /**
         * Player would try to enter fullscreen mode.
         * Behavior of fullscreen mode on different platforms may differ.
         * @example
         * player.enterFullScreen();
         */
        FullScreenManager.prototype.enterFullScreen = function () {
            if (!this.isEnabled) {
                return;
            }
            this._helper.request();
        };
        /**
         * Player would try to exit fullscreen mode.
         * @example
         * player.exitFullScreen();
         */
        FullScreenManager.prototype.exitFullScreen = function () {
            if (!this.isEnabled) {
                return;
            }
            this._helper.exit();
        };
        Object.defineProperty(FullScreenManager.prototype, "isInFullScreen", {
            /**
             * Return true if player is in full screen
             * @example
             * console.log(player.isInFullScreen); // false
             */
            get: function () {
                if (!this.isEnabled) {
                    return false;
                }
                return this._helper.isInFullScreen;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FullScreenManager.prototype, "isEnabled", {
            get: function () {
                return this._helper.isEnabled && this._isEnabled;
            },
            enumerable: true,
            configurable: true
        });
        FullScreenManager.prototype.destroy = function () {
            this._unbindEvents();
            this._helper.destroy();
        };
        FullScreenManager.moduleName = 'fullScreenManager';
        FullScreenManager.dependencies = ['eventEmitter', 'engine', 'rootContainer', 'config'];
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "enableExitFullScreenOnPause", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "disableExitFullScreenOnPause", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "enableExitFullScreenOnEnd", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "disableExitFullScreenOnEnd", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "enableEnterFullScreenOnPlay", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "disableEnterFullScreenOnPlay", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "enablePauseVideoOnFullScreenExit", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "disablePauseVideoOnFullScreenExit", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "enterFullScreen", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "exitFullScreen", null);
        __decorate([
            playerAPI()
        ], FullScreenManager.prototype, "isInFullScreen", null);
        return FullScreenManager;
    }());

    var SEEK_BY_UI_EVENTS = [
        UIEvent$1.GO_FORWARD_WITH_KEYBOARD,
        UIEvent$1.GO_BACKWARD_WITH_KEYBOARD,
        UIEvent$1.PROGRESS_CHANGE,
    ];
    var LiveStateEngine = /** @class */ (function () {
        function LiveStateEngine(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            this._state = LiveState$1.NONE;
            this._isSeekedByUIWhilePlaying = null;
            this._bindEvents();
        }
        Object.defineProperty(LiveStateEngine.prototype, "state", {
            get: function () {
                return this._state;
            },
            enumerable: true,
            configurable: true
        });
        LiveStateEngine.prototype._bindEvents = function () {
            var _this = this;
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.STATE_CHANGED, this._processStateChange]
            ].concat(SEEK_BY_UI_EVENTS.map(function (eventName) { return [eventName, _this._processSeekByUI]; }), [
                [VideoEvent$1.DYNAMIC_CONTENT_ENDED, this._onDynamicContentEnded],
            ]), this);
        };
        LiveStateEngine.prototype._processStateChange = function (_a) {
            var prevState = _a.prevState, nextState = _a.nextState;
            if (nextState === EngineState$1.SRC_SET) {
                this._setState(LiveState$1.NONE);
                return;
            }
            if (!this._engine.isDynamicContent || this._engine.isDynamicContentEnded) {
                return;
            }
            switch (nextState) {
                case EngineState$1.METADATA_LOADED:
                    this._setState(LiveState$1.INITIAL);
                    break;
                case EngineState$1.PLAY_REQUESTED:
                    if (this._state === LiveState$1.INITIAL) {
                        this._engine.syncWithLive();
                    }
                    break;
                case EngineState$1.PLAYING:
                    // NOTE: skip PLAYING event after events like `WAITING` and other not important events.
                    if (this._state === LiveState$1.INITIAL ||
                        this._state === LiveState$1.NOT_SYNC ||
                        this._isSeekedByUIWhilePlaying) {
                        this._setState(this._engine.isSyncWithLive ? LiveState$1.SYNC : LiveState$1.NOT_SYNC);
                        this._isSeekedByUIWhilePlaying = false;
                    }
                    break;
                case EngineState$1.PAUSED:
                    // NOTE: process `PAUSED` event only `PLAYING`, to be sure its not related with `WAITING` events
                    if (prevState === EngineState$1.PLAYING) {
                        this._setState(LiveState$1.NOT_SYNC);
                    }
                    break;
                default:
                    break;
            }
        };
        LiveStateEngine.prototype._processSeekByUI = function () {
            if (this._engine.isDynamicContent &&
                this._engine.getCurrentState() === EngineState$1.PLAYING) {
                // NOTE: flag should be handled on `PLAYING` state in `_processStateChange`
                this._isSeekedByUIWhilePlaying = true;
            }
        };
        LiveStateEngine.prototype._onDynamicContentEnded = function () {
            this._setState(LiveState$1.ENDED);
        };
        LiveStateEngine.prototype._setState = function (state) {
            if (this._state !== state) {
                var prevState = this._state;
                var nextState = state;
                this._state = state;
                this._eventEmitter.emitAsync(VideoEvent$1.LIVE_STATE_CHANGED, {
                    prevState: prevState,
                    nextState: nextState,
                });
            }
        };
        LiveStateEngine.prototype.destroy = function () {
            this._unbindEvents();
        };
        LiveStateEngine.moduleName = 'liveStateEngine';
        LiveStateEngine.dependencies = ['eventEmitter', 'engine'];
        return LiveStateEngine;
    }());

    var logger = {
        info: function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            var _a;
            (_a = window.console).info.apply(_a, [message].concat(optionalParams));
        },
        warn: function (message) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            var _a;
            (_a = window.console).warn.apply(_a, [message].concat(optionalParams));
        },
        error: function (name) {
            var optionalParams = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                optionalParams[_i - 1] = arguments[_i];
            }
            var _a;
            (_a = window.console).error.apply(_a, [name].concat(optionalParams));
        },
    };

    var KEYCODES = {
        SPACE_BAR: 32,
        ENTER: 13,
        TAB: 9,
        LEFT_ARROW: 37,
        RIGHT_ARROW: 39,
        UP_ARROW: 38,
        DOWN_ARROW: 40,
        DEBUG_KEY: 68,
    };
    var KeyboardInterceptorCore = /** @class */ (function () {
        function KeyboardInterceptorCore(element, callbacks) {
            this._eventEmitter = new eventemitter3_1();
            this._element = element;
            callbacks && this._attachCallbacks(callbacks);
            this._bindCallbacks();
            this._bindEvents();
        }
        KeyboardInterceptorCore.prototype._attachCallbacks = function (callbacks) {
            var _this = this;
            Object.keys(callbacks).forEach(function (keyCode) {
                var keyCodeCallbacks = callbacks[keyCode];
                if (Array.isArray(keyCodeCallbacks)) {
                    keyCodeCallbacks.forEach(function (callback) {
                        return _this._eventEmitter.on(keyCode, callback);
                    });
                }
                else {
                    _this._eventEmitter.on(keyCode, keyCodeCallbacks);
                }
            });
        };
        KeyboardInterceptorCore.prototype._unattachCallbacks = function () {
            this._eventEmitter.removeAllListeners();
        };
        KeyboardInterceptorCore.prototype._bindCallbacks = function () {
            this._processKeyboardInput = this._processKeyboardInput.bind(this);
        };
        KeyboardInterceptorCore.prototype._bindEvents = function () {
            this._element.addEventListener('keydown', this._processKeyboardInput, false);
        };
        KeyboardInterceptorCore.prototype._unbindEvents = function () {
            this._element.removeEventListener('keydown', this._processKeyboardInput, false);
        };
        KeyboardInterceptorCore.prototype.addCallbacks = function (callbacks) {
            this._attachCallbacks(callbacks);
        };
        KeyboardInterceptorCore.prototype._processKeyboardInput = function (e) {
            this._eventEmitter.emit(e.keyCode, e);
        };
        Object.defineProperty(KeyboardInterceptorCore.prototype, "_isDestroyed", {
            get: function () {
                return !this._element && !this._eventEmitter;
            },
            enumerable: true,
            configurable: true
        });
        KeyboardInterceptorCore.prototype.destroy = function () {
            if (this._isDestroyed) {
                logger.warn('KeyboardInterceptor.destroy called after already been destroyed');
                return;
            }
            else {
                this._unbindEvents();
                this._element = null;
                this._unattachCallbacks();
                this._eventEmitter = null;
            }
        };
        return KeyboardInterceptorCore;
    }());

    var AMOUNT_TO_SKIP_SECONDS = 5;
    var AMOUNT_TO_CHANGE_VOLUME = 10;
    var KeyboardControl = /** @class */ (function () {
        function KeyboardControl(_a) {
            var config = _a.config, eventEmitter = _a.eventEmitter, rootContainer = _a.rootContainer, engine = _a.engine;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            if (isIPhone() || isIPod() || isIPad() || isAndroid()) {
                this._isEnabled = false;
            }
            else {
                this._isEnabled = config.disableControlWithKeyboard !== false;
            }
            this._initInterceptor(rootContainer.getElement());
        }
        KeyboardControl.prototype._initInterceptor = function (rootElement) {
            if (this._isEnabled) {
                this._keyboardInterceptor = new KeyboardInterceptorCore(rootElement);
                this._attachDefaultControls();
            }
        };
        KeyboardControl.prototype._attachDefaultControls = function () {
            var _this = this;
            var _a;
            this._keyboardInterceptor.addCallbacks((_a = {}, _a[KEYCODES.TAB] = function () {
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                }, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.TOGGLE_PLAYBACK_WITH_KEYBOARD);
                    _this._engine.togglePlayback();
                }, _a[KEYCODES.LEFT_ARROW] = function (e) {
                    if (_this._engine.isSeekAvailable) {
                        e.preventDefault();
                        _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                        _this._eventEmitter.emitAsync(UIEvent$1.GO_BACKWARD_WITH_KEYBOARD);
                        _this._engine.seekBackward(AMOUNT_TO_SKIP_SECONDS);
                    }
                }, _a[KEYCODES.RIGHT_ARROW] = function (e) {
                    if (_this._engine.isSeekAvailable) {
                        e.preventDefault();
                        _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                        _this._eventEmitter.emitAsync(UIEvent$1.GO_FORWARD_WITH_KEYBOARD);
                        _this._engine.seekForward(AMOUNT_TO_SKIP_SECONDS);
                    }
                }, _a[KEYCODES.UP_ARROW] = function (e) {
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.INCREASE_VOLUME_WITH_KEYBOARD);
                    _this._engine.setMute(false);
                    _this._engine.increaseVolume(AMOUNT_TO_CHANGE_VOLUME);
                }, _a[KEYCODES.DOWN_ARROW] = function (e) {
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.DECREASE_VOLUME_WITH_KEYBOARD);
                    _this._engine.setMute(false);
                    _this._engine.decreaseVolume(AMOUNT_TO_CHANGE_VOLUME);
                }, _a));
        };
        KeyboardControl.prototype._destroyInterceptor = function () {
            if (this._keyboardInterceptor) {
                this._keyboardInterceptor.destroy();
            }
        };
        KeyboardControl.prototype.addKeyControl = function (key, callback) {
            var _a;
            if (this._isEnabled) {
                this._keyboardInterceptor.addCallbacks((_a = {}, _a[key] = callback, _a));
            }
        };
        KeyboardControl.prototype.destroy = function () {
            this._destroyInterceptor();
        };
        KeyboardControl.moduleName = 'keyboardControl';
        KeyboardControl.dependencies = ['engine', 'eventEmitter', 'rootContainer', 'config'];
        return KeyboardControl;
    }());

    function dot_tpl_src_modules_ui_debugPanel_templates_debugPanel_dot(props
    ) {
    var out='<div class="'+(props.styles.debugPanel)+'" data-webplayer-component> <div class="'+(props.styles.closeButton)+'" data-webplayer-hook="debug-panel-close-button" > x </div> <pre class="'+(props.styles.infoContainer)+'" data-webplayer-hook="debug-panel-info-container" > </pre></div>';return out;
    }

    var debugPanelTemplate = dot_tpl_src_modules_ui_debugPanel_templates_debugPanel_dot.default ? dot_tpl_src_modules_ui_debugPanel_templates_debugPanel_dot.default : dot_tpl_src_modules_ui_debugPanel_templates_debugPanel_dot;

    function syntaxHighlight(json, styleNames) {
        json = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            var cls = styleNames.number;
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = styleNames.key;
                }
                else {
                    cls = styleNames.string;
                }
            }
            else if (/true|false/.test(match)) {
                cls = styleNames.boolean;
            }
            else if (/null/.test(match)) {
                cls = styleNames.null;
            }
            return "<span class=\"" + cls + "\">" + match + "</span>";
        });
    }

    function getElementByHook(element, hook) {
        return element.querySelector("[data-webplayer-hook=\"" + hook + "\"]");
    }

    function toggleElementClass(element, className, shouldAdd) {
        if (shouldAdd) {
            element.classList.add(className);
        }
        else {
            element.classList.remove(className);
        }
    }

    var css$1 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.debug-panel__controlButton___pG-WY {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.debug-panel__controlButton___pG-WY:hover {\n    opacity: .7; }\n.debug-panel__hidden___1TRHR {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.debug-panel__debugPanel___116IW {\n  position: absolute;\n  z-index: 10000;\n  top: 10px;\n  left: 10px;\n  overflow: scroll;\n  width: 400px;\n  height: 250px;\n  border-radius: 3px;\n  background-color: rgba(0, 0, 0, 0.95); }\n.debug-panel__debugPanel___116IW .debug-panel__closeButton___claHV {\n    position: absolute;\n    top: 10px;\n    right: 5px;\n    cursor: pointer;\n    color: white; }\n.debug-panel__debugPanel___116IW .debug-panel__closeButton___claHV:hover {\n      opacity: .8; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ {\n    font-size: 8px;\n    line-height: 8px;\n    margin: 5px;\n    padding: 5px;\n    color: white; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ .debug-panel__string___1Jfzp {\n      color: green; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ .debug-panel__number___2WdLF {\n      color: darkorange; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ .debug-panel__boolean___CpohN {\n      color: blue; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ .debug-panel__null___2ZOuz {\n      color: magenta; }\n.debug-panel__debugPanel___116IW .debug-panel__infoContainer___-AZH_ .debug-panel__key___4avak {\n      color: white; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRlYnVnLXBhbmVsLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLGVBQWU7RUFDZixVQUFVO0VBQ1YsV0FBVztFQUNYLGlCQUFpQjtFQUNqQixhQUFhO0VBQ2IsY0FBYztFQUNkLG1CQUFtQjtFQUNuQixzQ0FBc0MsRUFBRTtBQUN4QztJQUNFLG1CQUFtQjtJQUNuQixVQUFVO0lBQ1YsV0FBVztJQUNYLGdCQUFnQjtJQUNoQixhQUFhLEVBQUU7QUFDZjtNQUNFLFlBQVksRUFBRTtBQUNsQjtJQUNFLGVBQWU7SUFDZixpQkFBaUI7SUFDakIsWUFBWTtJQUNaLGFBQWE7SUFDYixhQUFhLEVBQUU7QUFDZjtNQUNFLGFBQWEsRUFBRTtBQUNqQjtNQUNFLGtCQUFrQixFQUFFO0FBQ3RCO01BQ0UsWUFBWSxFQUFFO0FBQ2hCO01BQ0UsZUFBZSxFQUFFO0FBQ25CO01BQ0UsYUFBYSxFQUFFIiwiZmlsZSI6ImRlYnVnLXBhbmVsLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLmRlYnVnUGFuZWwge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDEwMDAwO1xuICB0b3A6IDEwcHg7XG4gIGxlZnQ6IDEwcHg7XG4gIG92ZXJmbG93OiBzY3JvbGw7XG4gIHdpZHRoOiA0MDBweDtcbiAgaGVpZ2h0OiAyNTBweDtcbiAgYm9yZGVyLXJhZGl1czogM3B4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuOTUpOyB9XG4gIC5kZWJ1Z1BhbmVsIC5jbG9zZUJ1dHRvbiB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMTBweDtcbiAgICByaWdodDogNXB4O1xuICAgIGN1cnNvcjogcG9pbnRlcjtcbiAgICBjb2xvcjogd2hpdGU7IH1cbiAgICAuZGVidWdQYW5lbCAuY2xvc2VCdXR0b246aG92ZXIge1xuICAgICAgb3BhY2l0eTogLjg7IH1cbiAgLmRlYnVnUGFuZWwgLmluZm9Db250YWluZXIge1xuICAgIGZvbnQtc2l6ZTogOHB4O1xuICAgIGxpbmUtaGVpZ2h0OiA4cHg7XG4gICAgbWFyZ2luOiA1cHg7XG4gICAgcGFkZGluZzogNXB4O1xuICAgIGNvbG9yOiB3aGl0ZTsgfVxuICAgIC5kZWJ1Z1BhbmVsIC5pbmZvQ29udGFpbmVyIC5zdHJpbmcge1xuICAgICAgY29sb3I6IGdyZWVuOyB9XG4gICAgLmRlYnVnUGFuZWwgLmluZm9Db250YWluZXIgLm51bWJlciB7XG4gICAgICBjb2xvcjogZGFya29yYW5nZTsgfVxuICAgIC5kZWJ1Z1BhbmVsIC5pbmZvQ29udGFpbmVyIC5ib29sZWFuIHtcbiAgICAgIGNvbG9yOiBibHVlOyB9XG4gICAgLmRlYnVnUGFuZWwgLmluZm9Db250YWluZXIgLm51bGwge1xuICAgICAgY29sb3I6IG1hZ2VudGE7IH1cbiAgICAuZGVidWdQYW5lbCAuaW5mb0NvbnRhaW5lciAua2V5IHtcbiAgICAgIGNvbG9yOiB3aGl0ZTsgfVxuIl19 */";
    var styles$1 = {"controlButton":"debug-panel__controlButton___pG-WY","hidden":"debug-panel__hidden___1TRHR","debugPanel":"debug-panel__debugPanel___116IW","closeButton":"debug-panel__closeButton___claHV","infoContainer":"debug-panel__infoContainer___-AZH_","string":"debug-panel__string___1Jfzp","number":"debug-panel__number___2WdLF","boolean":"debug-panel__boolean___CpohN","null":"debug-panel__null___2ZOuz","key":"debug-panel__key___4avak"};
    styleInject(css$1);

    var DebugPanelView = /** @class */ (function (_super) {
        __extends(DebugPanelView, _super);
        function DebugPanelView(config) {
            var _this = _super.call(this) || this;
            var callbacks = config.callbacks;
            _this._callbacks = callbacks;
            _this._initDOM();
            _this._bindEvents();
            return _this;
        }
        DebugPanelView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(debugPanelTemplate({
                styles: this.styleNames,
            }));
            this._$closeButton = getElementByHook(this._$rootElement, 'debug-panel-close-button');
            this._$infoContainer = getElementByHook(this._$rootElement, 'debug-panel-info-container');
        };
        DebugPanelView.prototype._bindEvents = function () {
            this._$closeButton.addEventListener('click', this._callbacks.onCloseButtonClick);
        };
        DebugPanelView.prototype._unbindEvents = function () {
            this._$closeButton.removeEventListener('click', this._callbacks.onCloseButtonClick);
        };
        DebugPanelView.prototype.show = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hidden, false);
        };
        DebugPanelView.prototype.hide = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hidden, true);
        };
        DebugPanelView.prototype.setInfo = function (info) {
            this._$infoContainer.innerHTML = syntaxHighlight(JSON.stringify(info, undefined, 4), this.styleNames);
        };
        DebugPanelView.prototype.getElement = function () {
            return this._$rootElement;
        };
        DebugPanelView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$closeButton = null;
            this._$infoContainer = null;
        };
        return DebugPanelView;
    }(View));
    DebugPanelView.extendStyleNames(styles$1);

    var UPDATE_TIME = 1000;
    var DebugPanel = /** @class */ (function () {
        function DebugPanel(_a) {
            var engine = _a.engine, rootContainer = _a.rootContainer, keyboardControl = _a.keyboardControl;
            this._engine = engine;
            this._bindCallbacks();
            this._initUI();
            this.hide();
            rootContainer.appendComponentElement(this.getElement());
            keyboardControl.addKeyControl(KEYCODES.DEBUG_KEY, this._keyControlCallback);
        }
        DebugPanel.prototype._keyControlCallback = function (e) {
            if (e.ctrlKey && e.shiftKey) {
                this.show();
            }
        };
        DebugPanel.prototype.getElement = function () {
            return this.view.getElement();
        };
        DebugPanel.prototype._initUI = function () {
            this.view = new DebugPanelView({
                callbacks: {
                    onCloseButtonClick: this.hide,
                },
            });
        };
        DebugPanel.prototype._bindCallbacks = function () {
            this.updateInfo = this.updateInfo.bind(this);
            this.hide = this.hide.bind(this);
            this._keyControlCallback = this._keyControlCallback.bind(this);
        };
        DebugPanel.prototype.getDebugInfo = function () {
            var info = this._engine.getDebugInfo();
            if (info.output === 'html5video') {
                var _a = info, url = _a.url, type = _a.type, deliveryPriority = _a.deliveryPriority, currentBitrate = _a.currentBitrate, overallBufferLength = _a.overallBufferLength, nearestBufferSegInfo = _a.nearestBufferSegInfo, viewDimensions = _a.viewDimensions, currentTime = _a.currentTime, duration = _a.duration, loadingStateTimestamps = _a.loadingStateTimestamps, bitrates = _a.bitrates, bwEstimate = _a.bwEstimate, output = _a.output;
                return {
                    url: url,
                    type: type,
                    deliveryPriority: exports.MEDIA_STREAM_DELIVERY_PRIORITY[deliveryPriority],
                    currentBitrate: currentBitrate,
                    overallBufferLength: overallBufferLength,
                    nearestBufferSegInfo: nearestBufferSegInfo,
                    viewDimensions: viewDimensions,
                    currentTime: currentTime,
                    duration: duration,
                    loadingStateTimestamps: loadingStateTimestamps,
                    bitrates: bitrates,
                    bwEstimate: bwEstimate,
                    output: output,
                };
            }
            return info;
        };
        DebugPanel.prototype.updateInfo = function () {
            this.view.setInfo(this.getDebugInfo());
        };
        DebugPanel.prototype.setUpdateInterval = function () {
            this.clearUpdateInterval();
            this._interval = window.setInterval(this.updateInfo, UPDATE_TIME);
        };
        DebugPanel.prototype.clearUpdateInterval = function () {
            window.clearInterval(this._interval);
        };
        DebugPanel.prototype.show = function () {
            if (this.isHidden) {
                this.updateInfo();
                this.setUpdateInterval();
                this.view.show();
                this.isHidden = false;
            }
        };
        DebugPanel.prototype.hide = function () {
            if (!this.isHidden) {
                this.clearUpdateInterval();
                this.view.hide();
                this.isHidden = true;
            }
        };
        DebugPanel.prototype.destroy = function () {
            this.clearUpdateInterval();
            this.view.destroy();
        };
        DebugPanel.moduleName = 'debugPanel';
        DebugPanel.View = DebugPanelView;
        DebugPanel.dependencies = ['engine', 'rootContainer', 'keyboardControl'];
        return DebugPanel;
    }());

    function dot_tpl_src_modules_ui_screen_templates_screen_dot(props
    ) {
    var out='<div class="'+(props.styles.screen)+'" data-webplayer-hook="screen-block" data-webplayer-component> <canvas class="'+(props.styles.backgroundCanvas)+'" data-webplayer-hook="background-canvas"/></div>';return out;
    }

    var screenTemplate = dot_tpl_src_modules_ui_screen_templates_screen_dot.default ? dot_tpl_src_modules_ui_screen_templates_screen_dot.default : dot_tpl_src_modules_ui_screen_templates_screen_dot;

    (function (VideoViewMode) {
        VideoViewMode["REGULAR"] = "REGULAR";
        VideoViewMode["BLUR"] = "BLUR";
        VideoViewMode["FILL"] = "FILL";
    })(exports.VIDEO_VIEW_MODES || (exports.VIDEO_VIEW_MODES = {}));

    var css$2 = ".screen__screen___3BN2N {\n  position: absolute;\n  z-index: 50;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  width: 100%;\n  height: 100%;\n  background-color: black;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n  .screen__screen___3BN2N.screen__regularMode___1Bv69 video, .screen__screen___3BN2N.screen__blurMode___Zianj video {\n    width: 100%;\n    height: 100%; }\n  .screen__screen___3BN2N.screen__fillMode___rToyv video {\n    position: absolute; }\n  .screen__screen___3BN2N.screen__verticalStripes___1tr7O.screen__fillMode___rToyv video {\n    width: 100%;\n    height: auto !important; }\n  .screen__screen___3BN2N.screen__horizontalStripes___1yh9M.screen__fillMode___rToyv video {\n    height: 100%; }\n  .screen__screen___3BN2N video {\n    position: relative;\n    z-index: 1;\n    -webkit-box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);\n            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); }\n  .screen__screen___3BN2N.screen__hiddenCursor___3-TwW {\n    cursor: none; }\n  .screen__backgroundCanvas___1PHZh {\n  position: absolute;\n  z-index: 0;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  -webkit-filter: blur(14px);\n          filter: blur(14px); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmVlbi5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsbUJBQW1CO0VBQ25CLFlBQVk7RUFDWixPQUFPO0VBQ1AsU0FBUztFQUNULFVBQVU7RUFDVixRQUFRO0VBQ1IscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCw2QkFBdUI7RUFBdkIsOEJBQXVCO01BQXZCLDJCQUF1QjtVQUF2Qix1QkFBdUI7RUFDdkIsWUFBWTtFQUNaLGFBQWE7RUFDYix3QkFBd0I7RUFDeEIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtFQUN0QjtJQUNFLFlBQVk7SUFDWixhQUFhLEVBQUU7RUFDakI7SUFDRSxtQkFBbUIsRUFBRTtFQUN2QjtJQUNFLFlBQVk7SUFDWix3QkFBd0IsRUFBRTtFQUM1QjtJQUNFLGFBQWEsRUFBRTtFQUNqQjtJQUNFLG1CQUFtQjtJQUNuQixXQUFXO0lBQ1gsZ0RBQXdDO1lBQXhDLHdDQUF3QyxFQUFFO0VBQzVDO0lBQ0UsYUFBYSxFQUFFO0VBRW5CO0VBQ0UsbUJBQW1CO0VBQ25CLFdBQVc7RUFDWCxPQUFPO0VBQ1AsU0FBUztFQUNULFVBQVU7RUFDVixRQUFRO0VBQ1IsMkJBQW1CO1VBQW5CLG1CQUFtQixFQUFFIiwiZmlsZSI6InNjcmVlbi5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLnNjcmVlbiB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogNTA7XG4gIHRvcDogMDtcbiAgcmlnaHQ6IDA7XG4gIGJvdHRvbTogMDtcbiAgbGVmdDogMDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgYmFja2dyb3VuZC1jb2xvcjogYmxhY2s7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5zY3JlZW4ucmVndWxhck1vZGUgdmlkZW8sIC5zY3JlZW4uYmx1ck1vZGUgdmlkZW8ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAwJTsgfVxuICAuc2NyZWVuLmZpbGxNb2RlIHZpZGVvIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7IH1cbiAgLnNjcmVlbi52ZXJ0aWNhbFN0cmlwZXMuZmlsbE1vZGUgdmlkZW8ge1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogYXV0byAhaW1wb3J0YW50OyB9XG4gIC5zY3JlZW4uaG9yaXpvbnRhbFN0cmlwZXMuZmlsbE1vZGUgdmlkZW8ge1xuICAgIGhlaWdodDogMTAwJTsgfVxuICAuc2NyZWVuIHZpZGVvIHtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgei1pbmRleDogMTtcbiAgICBib3gtc2hhZG93OiAwIDAgMjBweCByZ2JhKDAsIDAsIDAsIDAuMik7IH1cbiAgLnNjcmVlbi5oaWRkZW5DdXJzb3Ige1xuICAgIGN1cnNvcjogbm9uZTsgfVxuXG4uYmFja2dyb3VuZENhbnZhcyB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMDtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICBmaWx0ZXI6IGJsdXIoMTRweCk7IH1cbiJdfQ== */";
    var styles$2 = {"screen":"screen__screen___3BN2N","regularMode":"screen__regularMode___1Bv69","blurMode":"screen__blurMode___Zianj","fillMode":"screen__fillMode___rToyv","verticalStripes":"screen__verticalStripes___1tr7O","horizontalStripes":"screen__horizontalStripes___1yh9M","hiddenCursor":"screen__hiddenCursor___3-TwW","backgroundCanvas":"screen__backgroundCanvas___1PHZh"};
    styleInject(css$2);

    var ScreenView = /** @class */ (function (_super) {
        __extends(ScreenView, _super);
        function ScreenView(config) {
            var _a;
            var _this = _super.call(this) || this;
            var callbacks = config.callbacks, nativeControls = config.nativeControls, playbackViewElement = config.playbackViewElement;
            _this._callbacks = callbacks;
            _this._styleNamesByViewMode = (_a = {}, _a[exports.VIDEO_VIEW_MODES.REGULAR] = _this.styleNames.regularMode, _a[exports.VIDEO_VIEW_MODES.BLUR] = _this.styleNames.blurMode, _a[exports.VIDEO_VIEW_MODES.FILL] = _this.styleNames.fillMode, _a);
            _this._bindCallbacks();
            if (nativeControls) {
                playbackViewElement.setAttribute('controls', 'true');
            }
            _this._initDOM(playbackViewElement);
            _this._bindEvents();
            _this.setViewMode(exports.VIDEO_VIEW_MODES.REGULAR);
            return _this;
        }
        ScreenView.prototype._bindCallbacks = function () {
            this._updateBackground = this._updateBackground.bind(this);
        };
        ScreenView.prototype._initDOM = function (playbackViewElement) {
            this._$rootElement = htmlToElement(screenTemplate({
                styles: this.styleNames,
            }));
            this._$playbackElement = playbackViewElement;
            this._$rootElement.appendChild(playbackViewElement);
            this._$canvas = getElementByHook(this._$rootElement, 'background-canvas');
        };
        ScreenView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._callbacks.onWrapperMouseClick);
            this._$rootElement.addEventListener('dblclick', this._callbacks.onWrapperMouseDblClick);
        };
        ScreenView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._callbacks.onWrapperMouseClick);
            this._$rootElement.removeEventListener('dblclick', this._callbacks.onWrapperMouseDblClick);
        };
        ScreenView.prototype.focusOnNode = function () {
            this._$rootElement.focus();
        };
        ScreenView.prototype.show = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hidden, false);
        };
        ScreenView.prototype.hide = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hidden, true);
        };
        ScreenView.prototype.getElement = function () {
            return this._$rootElement;
        };
        ScreenView.prototype.hideCursor = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hiddenCursor, true);
        };
        ScreenView.prototype.showCursor = function () {
            toggleElementClass(this._$rootElement, this.styleNames.hiddenCursor, false);
        };
        ScreenView.prototype.setViewMode = function (viewMode) {
            var _this = this;
            if (this._styleNamesByViewMode[viewMode]) {
                this.resetBackground();
                Object.keys(this._styleNamesByViewMode).forEach(function (mode) {
                    toggleElementClass(_this._$rootElement, _this._styleNamesByViewMode[mode], false);
                });
                toggleElementClass(this._$rootElement, this._styleNamesByViewMode[viewMode], true);
                if (viewMode === exports.VIDEO_VIEW_MODES.BLUR) {
                    this._startUpdatingBackground();
                }
                else {
                    this._stopUpdatingBackground();
                }
                this._currentMode = viewMode;
            }
        };
        ScreenView.prototype.setBackgroundSize = function (width, height) {
            this.setBackgroundWidth(width);
            this.setBackgroundHeight(height);
        };
        ScreenView.prototype.setBackgroundWidth = function (width) {
            this._$canvas.width = width;
        };
        ScreenView.prototype.setBackgroundHeight = function (height) {
            this._$canvas.height = height;
        };
        ScreenView.prototype._startUpdatingBackground = function () {
            if (!this._requestAnimationFrameID) {
                this._updateBackground();
            }
        };
        ScreenView.prototype._stopUpdatingBackground = function () {
            if (this._requestAnimationFrameID) {
                cancelAnimationFrame(this._requestAnimationFrameID);
                this._requestAnimationFrameID = null;
            }
        };
        ScreenView.prototype.resetAspectRatio = function () {
            var _a = this._$playbackElement, videoWidth = _a.videoWidth, videoHeight = _a.videoHeight;
            var _b = this._$rootElement.getBoundingClientRect(), width = _b.width, height = _b.height;
            this._isHorizontalStripes =
                width / height < (videoHeight ? videoWidth / videoHeight : 0);
            toggleElementClass(this._$rootElement, this.styleNames.horizontalStripes, this._isHorizontalStripes);
            toggleElementClass(this._$rootElement, this.styleNames.verticalStripes, !this._isHorizontalStripes);
        };
        ScreenView.prototype.resetBackground = function () {
            if (this._currentMode === exports.VIDEO_VIEW_MODES.BLUR) {
                this._clearBackground();
            }
        };
        ScreenView.prototype._getSourceAreas = function (width, height) {
            if (this._isHorizontalStripes) {
                return [
                    [0, 0, width, 1],
                    [0, height - 1, width, 1],
                ];
            }
            return [
                [0, 0, 1, height],
                [width - 1, 0, 1, height],
            ];
        };
        ScreenView.prototype._getCanvasAreas = function (width, height) {
            if (this._isHorizontalStripes) {
                return [
                    [0, 0, width, height / 2],
                    [0, height / 2, width, height / 2],
                ];
            }
            return [
                [0, 0, width / 2, height],
                [width / 2, 0, width / 2, height],
            ];
        };
        ScreenView.prototype._drawAreaFromSource = function (source, area) {
            var sourceX = source[0], sourceY = source[1], sourceWidth = source[2], sourceHeight = source[3];
            var areaX = area[0], areaY = area[1], areaWidth = area[2], areaHeight = area[3];
            var ctx = this._$canvas.getContext('2d');
            ctx.drawImage(this._$playbackElement, sourceX, sourceY, sourceWidth, sourceHeight, areaX, areaY, areaWidth, areaHeight);
        };
        ScreenView.prototype._drawBackground = function () {
            var _a = this._$playbackElement, videoWidth = _a.videoWidth, videoHeight = _a.videoHeight;
            var canvasWidth = this._$canvas.width;
            var canvasHeight = this._$canvas.height;
            var sourceAreas = this._getSourceAreas(videoWidth, videoHeight);
            var canvasAreas = this._getCanvasAreas(canvasWidth, canvasHeight);
            this._drawAreaFromSource(sourceAreas[0], canvasAreas[0]);
            this._drawAreaFromSource(sourceAreas[1], canvasAreas[1]);
        };
        ScreenView.prototype._updateBackground = function () {
            this._drawBackground();
            this._requestAnimationFrameID = requestAnimationFrame(this._updateBackground);
        };
        ScreenView.prototype._clearBackground = function () {
            var ctx = this._$canvas.getContext('2d');
            ctx.clearRect(0, 0, this._$canvas.width, this._$canvas.height);
        };
        ScreenView.prototype.destroy = function () {
            this._stopUpdatingBackground();
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$playbackElement = null;
            this._$canvas = null;
        };
        return ScreenView;
    }(View));
    ScreenView.extendStyleNames(styles$2);

    var PLAYBACK_CHANGE_TIMEOUT = 300;
    var Screen = /** @class */ (function () {
        function Screen(_a) {
            var config = _a.config, eventEmitter = _a.eventEmitter, engine = _a.engine, fullScreenManager = _a.fullScreenManager, interactionIndicator = _a.interactionIndicator, rootContainer = _a.rootContainer;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            this._fullScreenManager = fullScreenManager;
            this._interactionIndicator = interactionIndicator;
            this.isHidden = false;
            this._delayedToggleVideoPlaybackTimeout = null;
            this._isClickProcessingDisabled = Boolean(config.disableControlWithClickOnPlayer);
            this._bindCallbacks();
            this._initUI(config.nativeBrowserControls);
            this._bindEvents();
            rootContainer.appendComponentElement(this.getElement());
        }
        Screen.prototype.getElement = function () {
            return this.view.getElement();
        };
        Screen.prototype._bindCallbacks = function () {
            this._processClick = this._processClick.bind(this);
            this._processDblClick = this._processDblClick.bind(this);
            this._toggleVideoPlayback = this._toggleVideoPlayback.bind(this);
        };
        Screen.prototype._initUI = function (isNativeControls) {
            var config = {
                nativeControls: isNativeControls,
                callbacks: {
                    onWrapperMouseClick: this._processClick,
                    onWrapperMouseDblClick: this._processDblClick,
                },
                playbackViewElement: this._engine.getElement(),
            };
            this.view = new ScreenView(config);
        };
        Screen.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [UIEvent$1.PLAY_OVERLAY_CLICK, this.view.focusOnNode, this.view],
                [UIEvent$1.RESIZE, this._updateSizes],
                [EngineState$1.SRC_SET, this.view.resetBackground, this.view],
                [EngineState$1.METADATA_LOADED, this.view.resetAspectRatio, this.view],
            ], this);
        };
        Screen.prototype._updateSizes = function (_a) {
            var width = _a.width, height = _a.height;
            this.view.setBackgroundSize(width, height);
            this.view.resetAspectRatio();
        };
        Screen.prototype.showCursor = function () {
            this.view.showCursor();
        };
        Screen.prototype.hideCursor = function () {
            this.view.hideCursor();
        };
        Screen.prototype._processClick = function () {
            if (this._isClickProcessingDisabled) {
                return;
            }
            this._showPlaybackChangeIndicator();
            if (!this._fullScreenManager.isEnabled) {
                this._toggleVideoPlayback();
            }
            else {
                this._setDelayedPlaybackToggle();
            }
        };
        Screen.prototype._processDblClick = function () {
            if (this._isClickProcessingDisabled) {
                return;
            }
            if (this._fullScreenManager.isEnabled) {
                if (this._isDelayedPlaybackToggleExist) {
                    this._clearDelayedPlaybackToggle();
                    this._hideDelayedPlaybackChangeIndicator();
                }
                this._toggleFullScreen();
            }
        };
        Screen.prototype._showPlaybackChangeIndicator = function () {
            var state = this._engine.getCurrentState();
            if (state === EngineState$1.PLAY_REQUESTED || state === EngineState$1.PLAYING) {
                this._interactionIndicator.showPause();
            }
            else {
                this._interactionIndicator.showPlay();
            }
        };
        Screen.prototype._hideDelayedPlaybackChangeIndicator = function () {
            this._interactionIndicator.hideIcons();
        };
        Screen.prototype._setDelayedPlaybackToggle = function () {
            this._clearDelayedPlaybackToggle();
            this._delayedToggleVideoPlaybackTimeout = window.setTimeout(this._toggleVideoPlayback, PLAYBACK_CHANGE_TIMEOUT);
        };
        Screen.prototype._clearDelayedPlaybackToggle = function () {
            window.clearTimeout(this._delayedToggleVideoPlaybackTimeout);
            this._delayedToggleVideoPlaybackTimeout = null;
        };
        Object.defineProperty(Screen.prototype, "_isDelayedPlaybackToggleExist", {
            get: function () {
                return Boolean(this._delayedToggleVideoPlaybackTimeout);
            },
            enumerable: true,
            configurable: true
        });
        Screen.prototype._toggleVideoPlayback = function () {
            this._clearDelayedPlaybackToggle();
            var state = this._engine.getCurrentState();
            if (state === EngineState$1.PLAY_REQUESTED || state === EngineState$1.PLAYING) {
                this._engine.pause();
                this._eventEmitter.emitAsync(UIEvent$1.PAUSE_WITH_SCREEN_CLICK);
            }
            else {
                this._engine.play();
                this._eventEmitter.emitAsync(UIEvent$1.PLAY_WITH_SCREEN_CLICK);
            }
        };
        Screen.prototype._toggleFullScreen = function () {
            if (this._fullScreenManager.isInFullScreen) {
                this._fullScreenManager.exitFullScreen();
                this._eventEmitter.emitAsync(UIEvent$1.EXIT_FULL_SCREEN_WITH_SCREEN_CLICK);
            }
            else {
                this._fullScreenManager.enterFullScreen();
                this._eventEmitter.emitAsync(UIEvent$1.ENTER_FULL_SCREEN_WITH_SCREEN_CLICK);
            }
        };
        Screen.prototype.hide = function () {
            if (!this.isHidden) {
                this.view.hide();
                this.isHidden = true;
            }
        };
        Screen.prototype.show = function () {
            if (this.isHidden) {
                this.view.show();
                this.isHidden = false;
            }
        };
        /**
         * Method for setting video view mode.
         * @param viewMode Possible values are "REGULAR", "FILL", "BLUR".
         * With "REGULAR" video tag would try to be fully shown.
         * With "FILL" video tag would fill all space, removing black lines on sides.
         * With "BLUR" black lines would be filled with blured pixels from video.
         * @example
         * player.setVideoViewMode("BLUR");
         */
        Screen.prototype.setVideoViewMode = function (viewMode) {
            this.view.setViewMode(viewMode);
        };
        Screen.prototype.destroy = function () {
            this._unbindEvents();
            this._clearDelayedPlaybackToggle();
            this.view.destroy();
        };
        Screen.moduleName = 'screen';
        Screen.View = ScreenView;
        Screen.dependencies = [
            'engine',
            'eventEmitter',
            'config',
            'fullScreenManager',
            'interactionIndicator',
            'rootContainer',
        ];
        __decorate([
            playerAPI()
        ], Screen.prototype, "setVideoViewMode", null);
        return Screen;
    }());

    function dot_tpl_src_modules_ui_interactionIndicator_templates_container_dot(props
    ) {
    var out='<div class="'+(props.styles.iconContainer)+'" data-webplayer-component></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_playIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <svg class="'+(props.styles.playIcon)+' '+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 14"> <path fill="#FFF" fill-rule="evenodd" d="M.079 0L0 14l10.5-7.181z"/> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_pauseIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <svg class="'+(props.styles.pauseIcon)+' '+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14"> <path fill="#FFF" fill-rule="evenodd" d="M7 0h3v14H7V0zM0 0h3v14H0V0z"/> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_forwardIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <div class="'+(props.styles.seconds)+'"> <span>'+(props.texts.SECONDS_COUNT)+'</span> </div> <svg class="'+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"> <path fill="#FFF" fill-rule="evenodd" d="M17 0c4.59 0 8.84 1.87 11.9 4.93V1.7h3.4v10.2H22.1V8.5h5.44C24.99 5.27 21.25 3.4 17 3.4 9.52 3.4 3.4 9.52 3.4 17c0 7.48 6.12 13.6 13.6 13.6 7.48 0 13.6-6.12 13.6-13.6H34c0 9.35-7.65 17-17 17S0 26.35 0 17 7.65 0 17 0z"/> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_rewindIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <div class="'+(props.styles.seconds)+'"> <span>'+(props.texts.SECONDS_COUNT)+'</span> </div> <svg class="'+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"> <path fill="#FFF" fill-rule="evenodd" d="M17 0C12.41 0 8.16 1.87 5.1 4.93V1.7H1.7v10.2h10.2V8.5H6.46C9.01 5.27 12.75 3.4 17 3.4c7.48 0 13.6 6.12 13.6 13.6 0 7.48-6.12 13.6-13.6 13.6-7.48 0-13.6-6.12-13.6-13.6H0c0 9.35 7.65 17 17 17s17-7.65 17-17S26.35 0 17 0z"/> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_increaseVolumeIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <svg class="'+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 14"> <g fill="none" fill-rule="evenodd"> <path fill="#FFF" d="M0 3.919h2.993v5.97H0V3.92zm2.995-.015L7 .924v12L2.995 9.882v-5.98z"/> <path stroke="#FFF" d="M12.793 13.716a9.607 9.607 0 0 0 0-13.586M9.853 10.837a5.45 5.45 0 0 0 0-7.707"/> </g> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_decreaseVolumeIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <svg class="'+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 14"> <g fill="none" fill-rule="evenodd"> <path fill="#FFF" d="M0 3.919h2.993v5.97H0V3.92zm2.995-.015L7 .924v12L2.995 9.882v-5.98z"/> <path stroke="#FFF" d="M9.853 10.837a5.45 5.45 0 0 0 0-7.707"/> </g> </svg></div>';return out;
    }

    function dot_tpl_src_modules_ui_interactionIndicator_templates_muteIcon_dot(props
    ) {
    var out='<div class="'+(props.styles.icon)+'"> <svg class="'+(props.styles.animatedIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 14"> <g fill="#FFF" fill-rule="evenodd"> <path fill="#FFF" d="M0 3.919h2.993v5.97H0V3.92zm2.995-.015L7 .924v12L2.995 9.882v-5.98z"/> <path stroke="#FFF" d="M13 6.257l-2.05-2.05-.743.743L12.257 7l-2.05 2.05.743.743L13 7.743l2.05 2.05.743-.743L13.743 7l2.05-2.05-.743-.743L13 6.257z"/> </g> </svg></div>';return out;
    }

    var containerTemplate$1 = dot_tpl_src_modules_ui_interactionIndicator_templates_container_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_container_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_container_dot;
    var playIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_playIcon_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_playIcon_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_playIcon_dot;
    var pauseIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_pauseIcon_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_pauseIcon_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_pauseIcon_dot;
    var forwardIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_forwardIcon_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_forwardIcon_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_forwardIcon_dot;
    var rewindIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_rewindIcon_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_rewindIcon_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_rewindIcon_dot;
    var increaseVolumeIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_increaseVolumeIcon_dot.default
        ? dot_tpl_src_modules_ui_interactionIndicator_templates_increaseVolumeIcon_dot.default
        : dot_tpl_src_modules_ui_interactionIndicator_templates_increaseVolumeIcon_dot;
    var decreaseVolumeIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_decreaseVolumeIcon_dot.default
        ? dot_tpl_src_modules_ui_interactionIndicator_templates_decreaseVolumeIcon_dot.default
        : dot_tpl_src_modules_ui_interactionIndicator_templates_decreaseVolumeIcon_dot;
    var muteIconTemplate = dot_tpl_src_modules_ui_interactionIndicator_templates_muteIcon_dot.default ? dot_tpl_src_modules_ui_interactionIndicator_templates_muteIcon_dot.default : dot_tpl_src_modules_ui_interactionIndicator_templates_muteIcon_dot;

    var css$3 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.interaction-indicator__controlButton___2Y9N6 {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.interaction-indicator__controlButton___2Y9N6:hover {\n    opacity: .7; }\n.interaction-indicator__hidden___2uTS- {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.interaction-indicator__iconContainer___2r3Wb {\n  position: absolute;\n  z-index: 100;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  pointer-events: none;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__icon___1pjM4 {\n    font-size: 9px;\n    line-height: 9px;\n    position: relative;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-animation-name: interaction-indicator__fadeOut___P6kY6;\n            animation-name: interaction-indicator__fadeOut___P6kY6;\n    -webkit-animation-duration: .5s;\n            animation-duration: .5s;\n    opacity: 0;\n    border-radius: 100px;\n    background-color: rgba(0, 0, 0, 0.5);\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__animatedIcon___3cK8N {\n    -webkit-animation-name: interaction-indicator__iconSize___IYB2z;\n            animation-name: interaction-indicator__iconSize___IYB2z;\n    -webkit-animation-duration: .5s;\n            animation-duration: .5s; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__playIcon___1XtXN {\n    position: relative;\n    left: 3px; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__pauseIcon___qH2VX {\n    margin: 5px 0; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__seconds___2TlaJ {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    min-width: 5px;\n    min-height: 8px;\n    color: white;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center; }\n.interaction-indicator__iconContainer___2r3Wb .interaction-indicator__seconds___2TlaJ span {\n      display: block; }\n@-webkit-keyframes interaction-indicator__iconSize___IYB2z {\n  from {\n    width: 22px;\n    height: 22px; }\n  to {\n    width: 30px;\n    height: 30px; } }\n@keyframes interaction-indicator__iconSize___IYB2z {\n  from {\n    width: 22px;\n    height: 22px; }\n  to {\n    width: 30px;\n    height: 30px; } }\n@-webkit-keyframes interaction-indicator__fadeOut___P6kY6 {\n  from {\n    width: 22px;\n    height: 22px;\n    padding: 19px;\n    opacity: .9; }\n  to {\n    font-size: 14px;\n    line-height: 14px;\n    width: 30px;\n    height: 30px;\n    padding: 25px;\n    opacity: 0; } }\n@keyframes interaction-indicator__fadeOut___P6kY6 {\n  from {\n    width: 22px;\n    height: 22px;\n    padding: 19px;\n    opacity: .9; }\n  to {\n    font-size: 14px;\n    line-height: 14px;\n    width: 30px;\n    height: 30px;\n    padding: 25px;\n    opacity: 0; } }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImludGVyYWN0aW9uLWluZGljYXRvci5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixhQUFhO0VBQ2IsT0FBTztFQUNQLFNBQVM7RUFDVCxVQUFVO0VBQ1YsUUFBUTtFQUNSLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QscUJBQXFCO0VBQ3JCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxlQUFlO0lBQ2YsaUJBQWlCO0lBQ2pCLG1CQUFtQjtJQUNuQixxQkFBYztJQUFkLHFCQUFjO0lBQWQsY0FBYztJQUNkLCtEQUF3QjtZQUF4Qix1REFBd0I7SUFDeEIsZ0NBQXdCO1lBQXhCLHdCQUF3QjtJQUN4QixXQUFXO0lBQ1gscUJBQXFCO0lBQ3JCLHFDQUFxQztJQUNyQyx5QkFBd0I7UUFBeEIsc0JBQXdCO1lBQXhCLHdCQUF3QjtJQUN4QiwwQkFBb0I7UUFBcEIsdUJBQW9CO1lBQXBCLG9CQUFvQixFQUFFO0FBQ3hCO0lBQ0UsZ0VBQXlCO1lBQXpCLHdEQUF5QjtJQUN6QixnQ0FBd0I7WUFBeEIsd0JBQXdCLEVBQUU7QUFDNUI7SUFDRSxtQkFBbUI7SUFDbkIsVUFBVSxFQUFFO0FBQ2Q7SUFDRSxjQUFjLEVBQUU7QUFDbEI7SUFDRSxtQkFBbUI7SUFDbkIsT0FBTztJQUNQLFNBQVM7SUFDVCxVQUFVO0lBQ1YsUUFBUTtJQUNSLHFCQUFjO0lBQWQscUJBQWM7SUFBZCxjQUFjO0lBQ2QsZUFBZTtJQUNmLGdCQUFnQjtJQUNoQixhQUFhO0lBQ2IseUJBQXdCO1FBQXhCLHNCQUF3QjtZQUF4Qix3QkFBd0I7SUFDeEIsMEJBQW9CO1FBQXBCLHVCQUFvQjtZQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtNQUNFLGVBQWUsRUFBRTtBQUV2QjtFQUNFO0lBQ0UsWUFBWTtJQUNaLGFBQWEsRUFBRTtFQUNqQjtJQUNFLFlBQVk7SUFDWixhQUFhLEVBQUUsRUFBRTtBQU5yQjtFQUNFO0lBQ0UsWUFBWTtJQUNaLGFBQWEsRUFBRTtFQUNqQjtJQUNFLFlBQVk7SUFDWixhQUFhLEVBQUUsRUFBRTtBQUVyQjtFQUNFO0lBQ0UsWUFBWTtJQUNaLGFBQWE7SUFDYixjQUFjO0lBQ2QsWUFBWSxFQUFFO0VBQ2hCO0lBQ0UsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtJQUNsQixZQUFZO0lBQ1osYUFBYTtJQUNiLGNBQWM7SUFDZCxXQUFXLEVBQUUsRUFBRTtBQVpuQjtFQUNFO0lBQ0UsWUFBWTtJQUNaLGFBQWE7SUFDYixjQUFjO0lBQ2QsWUFBWSxFQUFFO0VBQ2hCO0lBQ0UsZ0JBQWdCO0lBQ2hCLGtCQUFrQjtJQUNsQixZQUFZO0lBQ1osYUFBYTtJQUNiLGNBQWM7SUFDZCxXQUFXLEVBQUUsRUFBRSIsImZpbGUiOiJpbnRlcmFjdGlvbi1pbmRpY2F0b3Iuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4uaWNvbkNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMTAwO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICAuaWNvbkNvbnRhaW5lciAuaWNvbiB7XG4gICAgZm9udC1zaXplOiA5cHg7XG4gICAgbGluZS1oZWlnaHQ6IDlweDtcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBhbmltYXRpb24tbmFtZTogZmFkZU91dDtcbiAgICBhbmltYXRpb24tZHVyYXRpb246IC41cztcbiAgICBvcGFjaXR5OiAwO1xuICAgIGJvcmRlci1yYWRpdXM6IDEwMHB4O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC41KTtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5pY29uQ29udGFpbmVyIC5hbmltYXRlZEljb24ge1xuICAgIGFuaW1hdGlvbi1uYW1lOiBpY29uU2l6ZTtcbiAgICBhbmltYXRpb24tZHVyYXRpb246IC41czsgfVxuICAuaWNvbkNvbnRhaW5lciAucGxheUljb24ge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBsZWZ0OiAzcHg7IH1cbiAgLmljb25Db250YWluZXIgLnBhdXNlSWNvbiB7XG4gICAgbWFyZ2luOiA1cHggMDsgfVxuICAuaWNvbkNvbnRhaW5lciAuc2Vjb25kcyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIG1pbi13aWR0aDogNXB4O1xuICAgIG1pbi1oZWlnaHQ6IDhweDtcbiAgICBjb2xvcjogd2hpdGU7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICAgIC5pY29uQ29udGFpbmVyIC5zZWNvbmRzIHNwYW4ge1xuICAgICAgZGlzcGxheTogYmxvY2s7IH1cblxuQGtleWZyYW1lcyBpY29uU2l6ZSB7XG4gIGZyb20ge1xuICAgIHdpZHRoOiAyMnB4O1xuICAgIGhlaWdodDogMjJweDsgfVxuICB0byB7XG4gICAgd2lkdGg6IDMwcHg7XG4gICAgaGVpZ2h0OiAzMHB4OyB9IH1cblxuQGtleWZyYW1lcyBmYWRlT3V0IHtcbiAgZnJvbSB7XG4gICAgd2lkdGg6IDIycHg7XG4gICAgaGVpZ2h0OiAyMnB4O1xuICAgIHBhZGRpbmc6IDE5cHg7XG4gICAgb3BhY2l0eTogLjk7IH1cbiAgdG8ge1xuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMTRweDtcbiAgICB3aWR0aDogMzBweDtcbiAgICBoZWlnaHQ6IDMwcHg7XG4gICAgcGFkZGluZzogMjVweDtcbiAgICBvcGFjaXR5OiAwOyB9IH1cbiJdfQ== */";
    var styles$3 = {"controlButton":"interaction-indicator__controlButton___2Y9N6","hidden":"interaction-indicator__hidden___2uTS-","iconContainer":"interaction-indicator__iconContainer___2r3Wb","icon":"interaction-indicator__icon___1pjM4","fadeOut":"interaction-indicator__fadeOut___P6kY6","animatedIcon":"interaction-indicator__animatedIcon___3cK8N","iconSize":"interaction-indicator__iconSize___IYB2z","playIcon":"interaction-indicator__playIcon___1XtXN","pauseIcon":"interaction-indicator__pauseIcon___qH2VX","seconds":"interaction-indicator__seconds___2TlaJ"};
    styleInject(css$3);

    var SECONDS_COUNT = 5;
    var InteractionIndicatorView = /** @class */ (function (_super) {
        __extends(InteractionIndicatorView, _super);
        function InteractionIndicatorView() {
            var _this = _super.call(this) || this;
            _this._$rootElement = htmlToElement(containerTemplate$1({
                styles: _this.styleNames,
            }));
            _this._playIcon = playIconTemplate({
                styles: _this.styleNames,
            });
            _this._pauseIcon = pauseIconTemplate({
                styles: _this.styleNames,
            });
            _this._forwardIcon = forwardIconTemplate({
                texts: {
                    SECONDS_COUNT: SECONDS_COUNT,
                },
                styles: _this.styleNames,
            });
            _this._rewindIcon = rewindIconTemplate({
                texts: {
                    SECONDS_COUNT: SECONDS_COUNT,
                },
                styles: _this.styleNames,
            });
            _this._increaseVolumeIcon = increaseVolumeIconTemplate({
                styles: _this.styleNames,
            });
            _this._decreaseVolumeIcon = decreaseVolumeIconTemplate({
                styles: _this.styleNames,
            });
            _this._muteIcon = muteIconTemplate({
                styles: _this.styleNames,
            });
            return _this;
        }
        InteractionIndicatorView.prototype.activatePlayIcon = function () {
            this._$rootElement.innerHTML = this._playIcon;
        };
        InteractionIndicatorView.prototype.activatePauseIcon = function () {
            this._$rootElement.innerHTML = this._pauseIcon;
        };
        InteractionIndicatorView.prototype.activateForwardIcon = function () {
            this._$rootElement.innerHTML = this._forwardIcon;
        };
        InteractionIndicatorView.prototype.activateRewindIcon = function () {
            this._$rootElement.innerHTML = this._rewindIcon;
        };
        InteractionIndicatorView.prototype.activateIncreaseVolumeIcon = function () {
            this._$rootElement.innerHTML = this._increaseVolumeIcon;
        };
        InteractionIndicatorView.prototype.activateDecreaseVolumeIcon = function () {
            this._$rootElement.innerHTML = this._decreaseVolumeIcon;
        };
        InteractionIndicatorView.prototype.activateMuteVolumeIcon = function () {
            this._$rootElement.innerHTML = this._muteIcon;
        };
        InteractionIndicatorView.prototype.deactivateIcon = function () {
            this._$rootElement.innerHTML = '';
        };
        InteractionIndicatorView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        InteractionIndicatorView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        InteractionIndicatorView.prototype.getElement = function () {
            return this._$rootElement;
        };
        InteractionIndicatorView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return InteractionIndicatorView;
    }(View));
    InteractionIndicatorView.extendStyleNames(styles$3);

    var InteractionIndicator = /** @class */ (function () {
        function InteractionIndicator(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine, config = _a.config, rootContainer = _a.rootContainer;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            this._initUI();
            this._bindEvents();
            rootContainer.appendComponentElement(this.getElement());
            if (config.hideMainUI) {
                this.hide();
            }
        }
        InteractionIndicator.prototype.getElement = function () {
            return this.view.getElement();
        };
        InteractionIndicator.prototype._initUI = function () {
            this.view = new InteractionIndicatorView();
        };
        InteractionIndicator.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [
                    UIEvent$1.TOGGLE_PLAYBACK_WITH_KEYBOARD,
                    this._showPlaybackChangeIndicator,
                ],
                [UIEvent$1.GO_BACKWARD_WITH_KEYBOARD, this.showRewind],
                [UIEvent$1.GO_FORWARD_WITH_KEYBOARD, this.showForward],
                [UIEvent$1.INCREASE_VOLUME_WITH_KEYBOARD, this.showIncreaseVolume],
                [UIEvent$1.DECREASE_VOLUME_WITH_KEYBOARD, this.showDecreaseVolume],
                [UIEvent$1.MUTE_WITH_KEYBOARD, this.showMute],
                [UIEvent$1.UNMUTE_WITH_KEYBOARD, this.showIncreaseVolume],
            ], this);
        };
        InteractionIndicator.prototype.showPause = function () {
            this.view.activatePauseIcon();
        };
        InteractionIndicator.prototype.showPlay = function () {
            this.view.activatePlayIcon();
        };
        InteractionIndicator.prototype.showRewind = function () {
            this.view.activateRewindIcon();
        };
        InteractionIndicator.prototype.showForward = function () {
            this.view.activateForwardIcon();
        };
        InteractionIndicator.prototype.showMute = function () {
            this.view.activateMuteVolumeIcon();
        };
        InteractionIndicator.prototype.showIncreaseVolume = function () {
            this.view.activateIncreaseVolumeIcon();
        };
        InteractionIndicator.prototype.showDecreaseVolume = function () {
            this.view.activateDecreaseVolumeIcon();
        };
        InteractionIndicator.prototype.hideIcons = function () {
            this.view.deactivateIcon();
            this._eventEmitter.emitAsync(UIEvent$1.HIDE_INTERACTION_INDICATOR);
        };
        InteractionIndicator.prototype.show = function () {
            this.view.show();
        };
        InteractionIndicator.prototype.hide = function () {
            this.view.hide();
        };
        InteractionIndicator.prototype._showPlaybackChangeIndicator = function () {
            var state = this._engine.getCurrentState();
            if (state === EngineState$1.PLAY_REQUESTED || state === EngineState$1.PLAYING) {
                this.view.activatePauseIcon();
            }
            else {
                this.view.activatePlayIcon();
            }
        };
        InteractionIndicator.prototype.destroy = function () {
            this._unbindEvents();
            this.view.destroy();
        };
        InteractionIndicator.moduleName = 'interactionIndicator';
        InteractionIndicator.View = InteractionIndicatorView;
        InteractionIndicator.dependencies = ['engine', 'eventEmitter', 'config', 'rootContainer'];
        return InteractionIndicator;
    }());

    // THIS IS THE PLAY ICON
    function dot_tpl_src_modules_ui_overlay_templates_overlay_dot(props
    ) {
    var out='<div class="'+(props.styles.overlay)+' '+(props.styles.active)+'" data-webplayer-hook="overlay" data-webplayer-component> <div class="'+(props.styles.poster)+'" data-webplayer-hook="overlay-content"></div> <div class="'+(props.styles.icon)+'" data-webplayer-hook="overlay-play-button" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;"> <svg xmlns="http://www.w3.org/2000/svg" height="66px" viewBox="0 -960 960 960" width="124px" fill="#ffffff"><path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg> </div></div>';return out;
    }

    var overlayTemplate = dot_tpl_src_modules_ui_overlay_templates_overlay_dot.default ? dot_tpl_src_modules_ui_overlay_templates_overlay_dot.default : dot_tpl_src_modules_ui_overlay_templates_overlay_dot;

    var overlayViewTheme = {
        overlayPlaySvgFill: {
            fill: function (data) { return data.color; },
        },
        overlayPlaySvgStroke: {
            stroke: function (data) { return data.color; },
        },
    };

    var css$4 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.overlay__controlButton___1ASmF {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.overlay__controlButton___1ASmF:hover {\n    opacity: .7; }\n.overlay__hidden___1Vt3d {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.overlay__overlay___3RC8o {\n  position: absolute;\n  z-index: 100;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: none; }\n.overlay__overlay___3RC8o.overlay__active___3k0Mi {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center; }\n.overlay__poster___1mX3C {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  background: black no-repeat center;\n  background-size: cover;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.overlay__poster___1mX3C:before {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  content: '';\n  background-color: rgba(0, 0, 0, 0.35); }\n.overlay__icon___3zDVy {\n  position: relative;\n  width: 71px;\n  height: 71px;\n  cursor: pointer;\n  opacity: 1; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .overlay__icon___3zDVy {\n    width: 54px;\n    height: 54px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"400px\"] .overlay__icon___3zDVy {\n    width: 36px;\n    height: 36px; }\n.overlay__icon___3zDVy:hover {\n    opacity: .8; }\n.overlay__transparency___2CfdP {\n  background: transparent; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm92ZXJsYXkuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNIO0VBQ0UscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCxXQUFXO0VBQ1gsZ0JBQWdCO0VBQ2hCLGlDQUF5QjtVQUF6Qix5QkFBeUI7RUFDekIscUNBQTZCO0VBQTdCLDZCQUE2QjtFQUM3QixXQUFXO0VBQ1gsVUFBVTtFQUNWLGlCQUFpQjtFQUNqQixjQUFjO0VBQ2QsOEJBQThCO0VBQzlCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSw4QkFBOEI7RUFDOUIsb0JBQW9CO0VBQ3BCLHdCQUF3QjtFQUN4QixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixzQkFBc0I7RUFDdEIsc0JBQXNCLEVBQUU7QUFFMUI7RUFDRSxtQkFBbUI7RUFDbkIsYUFBYTtFQUNiLE9BQU87RUFDUCxTQUFTO0VBQ1QsVUFBVTtFQUNWLFFBQVE7RUFDUixjQUFjLEVBQUU7QUFDaEI7SUFDRSxxQkFBYztJQUFkLHFCQUFjO0lBQWQsY0FBYztJQUNkLHlCQUF3QjtRQUF4QixzQkFBd0I7WUFBeEIsd0JBQXdCO0lBQ3hCLDBCQUFvQjtRQUFwQix1QkFBb0I7WUFBcEIsb0JBQW9CLEVBQUU7QUFFMUI7RUFDRSxtQkFBbUI7RUFDbkIsT0FBTztFQUNQLFNBQVM7RUFDVCxVQUFVO0VBQ1YsUUFBUTtFQUNSLFlBQVk7RUFDWixhQUFhO0VBQ2IsbUNBQW1DO0VBQ25DLHVCQUF1QjtFQUN2Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBRXhCO0VBQ0UsbUJBQW1CO0VBQ25CLE9BQU87RUFDUCxRQUFRO0VBQ1IsWUFBWTtFQUNaLGFBQWE7RUFDYixZQUFZO0VBQ1osc0NBQXNDLEVBQUU7QUFFMUM7RUFDRSxtQkFBbUI7RUFDbkIsWUFBWTtFQUNaLGFBQWE7RUFDYixnQkFBZ0I7RUFDaEIsV0FBVyxFQUFFO0FBQ2I7SUFDRSxZQUFZO0lBQ1osYUFBYSxFQUFFO0FBQ2pCO0lBQ0UsWUFBWTtJQUNaLGFBQWEsRUFBRTtBQUNqQjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLHdCQUF3QixFQUFFIiwiZmlsZSI6Im92ZXJsYXkuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4ub3ZlcmxheSB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogMTAwO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIGRpc3BsYXk6IG5vbmU7IH1cbiAgLm92ZXJsYXkuYWN0aXZlIHtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cblxuLnBvc3RlciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBiYWNrZ3JvdW5kOiBibGFjayBuby1yZXBlYXQgY2VudGVyO1xuICBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuXG4ucG9zdGVyOmJlZm9yZSB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBjb250ZW50OiAnJztcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgwLCAwLCAwLCAwLjM1KTsgfVxuXG4uaWNvbiB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6IDcxcHg7XG4gIGhlaWdodDogNzFweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBvcGFjaXR5OiAxOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCI1NTBweFwiXSAuaWNvbiB7XG4gICAgd2lkdGg6IDU0cHg7XG4gICAgaGVpZ2h0OiA1NHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCI0MDBweFwiXSAuaWNvbiB7XG4gICAgd2lkdGg6IDM2cHg7XG4gICAgaGVpZ2h0OiAzNnB4OyB9XG4gIC5pY29uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuODsgfVxuXG4udHJhbnNwYXJlbmN5IHtcbiAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7IH1cbiJdfQ== */";
    var styles$4 = {"controlButton":"overlay__controlButton___1ASmF","hidden":"overlay__hidden___1Vt3d","overlay":"overlay__overlay___3RC8o","active":"overlay__active___3k0Mi","poster":"overlay__poster___1mX3C","icon":"overlay__icon___3zDVy","transparency":"overlay__transparency___2CfdP"};
    styleInject(css$4);

    var OverlayView = /** @class */ (function (_super) {
        __extends(OverlayView, _super);
        function OverlayView(config) {
            var _this = _super.call(this, config.theme) || this;
            var callbacks = config.callbacks;
            _this._callbacks = callbacks;
            _this._initDOM();
            _this._bindEvents();
            return _this;
        }
        OverlayView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(overlayTemplate({
                styles: this.styleNames,
                themeStyles: this.themeStyles,
            }));
            this._$content = getElementByHook(this._$rootElement, 'overlay-content');
            this._$playButton = getElementByHook(this._$rootElement, 'overlay-play-button');
        };
        OverlayView.prototype._bindEvents = function () {
            this._$playButton.addEventListener('click', this._callbacks.onPlayClick);
        };
        OverlayView.prototype._unbindEvents = function () {
            this._$playButton.removeEventListener('click', this._callbacks.onPlayClick);
        };
        OverlayView.prototype.getElement = function () {
            return this._$rootElement;
        };
        OverlayView.prototype.hideContent = function () {
            this._$rootElement.classList.remove(this.styleNames.active);
        };
        OverlayView.prototype.showContent = function () {
            this._$rootElement.classList.add(this.styleNames.active);
        };
        OverlayView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        OverlayView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        OverlayView.prototype.setPoster = function (src) {
            this._$content.style.backgroundImage = src ? "url('" + src + "')" : 'none';
        };
        OverlayView.prototype.turnOnOverlayTransparency = function () {
            this._$content.classList.add(this.styleNames.transparency);
        };
        OverlayView.prototype.turnOffOverlayTransparency = function () {
            this._$content.classList.remove(this.styleNames.transparency);
        };
        OverlayView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$content = null;
            this._$playButton = null;
        };
        return OverlayView;
    }(View));
    OverlayView.setTheme(overlayViewTheme);
    OverlayView.extendStyleNames(styles$4);

    var Overlay = /** @class */ (function () {
        function Overlay(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine, rootContainer = _a.rootContainer, theme = _a.theme, config = _a.config, mainUIBlock = _a.mainUIBlock, loader = _a.loader;
            this.isHidden = false;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            this._theme = theme;
            this._mainUIBlock = mainUIBlock;
            this._loader = loader;
            this._bindEvents();
            this._initUI();
            this.setPoster(config.poster);
            if (config.hideOverlay) {
                this.hide();
            }
            rootContainer.appendComponentElement(this.getElement());
        }
        Overlay.prototype.getElement = function () {
            return this.view.getElement();
        };
        Overlay.prototype._initUI = function () {
            var viewConfig = {
                callbacks: {
                    onPlayClick: this._playVideo.bind(this),
                },
                theme: this._theme,
            };
            this.view = new Overlay.View(viewConfig);
        };
        Overlay.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.STATE_CHANGED, this._updatePlayingState],
                [VideoEvent$1.RESET, this._tryShowContent],
            ], this);
        };
        Overlay.prototype._updatePlayingState = function (_a) {
            var nextState = _a.nextState;
            if (nextState === EngineState$1.PLAY_REQUESTED) {
                this._tryHideContent();
            }
            else if (nextState === EngineState$1.ENDED ||
                nextState === EngineState$1.SRC_SET) {
                this._tryShowContent();
            }
        };
        Overlay.prototype._playVideo = function () {
            this._engine.play();
            this._eventEmitter.emitAsync(UIEvent$1.PLAY_OVERLAY_CLICK);
        };
        Overlay.prototype._tryShowContent = function () {
            if (this.isHidden) {
                return;
            }
            if (this._engine.isPaused) {
                this._showContent();
            }
        };
        Overlay.prototype._tryHideContent = function () {
            if (this.isHidden) {
                return;
            }
            this._hideContent();
        };
        Overlay.prototype._hideContent = function () {
            this.view.hideContent();
            this._loader.show();
            this._mainUIBlock.enableShowingContent();
        };
        Overlay.prototype._showContent = function () {
            this.view.showContent();
            this._loader.hide();
            this._mainUIBlock.disableShowingContent();
        };
        /**
         * Method for completely hiding player overlay. It's not gonna appear on initial state of player and when video is ended.
         * @example
         * player.showOverlay();
         */
        Overlay.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        /**
         * Method for showing player overlay after it was completely hidden with `player.hideOverlay()`.
         * @example
         * player.showOverlay();
         */
        Overlay.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        /**
         * Method for setting overlay poster
         * @param src - Source of image
         * @example
         * player.setPoster('https://example.com/poster.png');
         *
         */
        Overlay.prototype.setPoster = function (src) {
            this.view.setPoster(src);
        };
        /**
         * After initialisation player has by default an overlay that is black;
         *
         * The `.turnOnOverlayTransparency()` method makes this overlay transparent.
         * @example
         * player.turnOnOverlayTransparency();
         *
         */
        Overlay.prototype.turnOnOverlayTransparency = function () {
            this.view.turnOnOverlayTransparency();
        };
        /**
         * The `.turnOffOverlayTransparency()` method returns player's overlay to default settings.
         * It becomes black again.
         *
         * @example
         * player.turnOffOverlayTransparency();
         *
         */
        Overlay.prototype.turnOffOverlayTransparency = function () {
            this.view.turnOffOverlayTransparency();
        };
        Overlay.prototype.destroy = function () {
            this._unbindEvents();
            this.view.destroy();
        };
        Overlay.moduleName = 'overlay';
        Overlay.View = OverlayView;
        Overlay.dependencies = [
            'engine',
            'eventEmitter',
            'rootContainer',
            'theme',
            'config',
            'mainUIBlock',
            'loader',
        ];
        __decorate([
            playerAPI('hideOverlay')
        ], Overlay.prototype, "hide", null);
        __decorate([
            playerAPI('showOverlay')
        ], Overlay.prototype, "show", null);
        __decorate([
            playerAPI()
        ], Overlay.prototype, "setPoster", null);
        __decorate([
            playerAPI()
        ], Overlay.prototype, "turnOnOverlayTransparency", null);
        __decorate([
            playerAPI()
        ], Overlay.prototype, "turnOffOverlayTransparency", null);
        return Overlay;
    }());

    function dot_tpl_src_modules_ui_loader_templates_loader_dot(props
    ) {
    var out='<div class="'+(props.styles.loader)+' '+(props.styles.active)+'" data-webplayer-component data-webplayer-hook="loader" ></div>';return out;
    }

    var loaderTemplate = dot_tpl_src_modules_ui_loader_templates_loader_dot.default ? dot_tpl_src_modules_ui_loader_templates_loader_dot.default : dot_tpl_src_modules_ui_loader_templates_loader_dot;

    var css$5 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.loader__controlButton___1YHb4 {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.loader__controlButton___1YHb4:hover {\n    opacity: .7; }\n.loader__hidden___3MeyV {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.loader__loader___1J20N {\n  position: absolute;\n  z-index: 90;\n  top: 50%;\n  left: 50%;\n  display: none;\n  clip: rect(0, 48px, 48px, 24px);\n  width: 42px;\n  height: 42px;\n  margin-top: -21px;\n  margin-left: -21px;\n  -webkit-animation: loader__rotate___3K3Iv 1s linear infinite;\n          animation: loader__rotate___3K3Iv 1s linear infinite;\n  color: white; }\n.loader__loader___1J20N.loader__active___29tvY {\n    display: block; }\n.loader__loader___1J20N::after {\n    clip: rect(4px, 48px, 48px, 24px);\n    -webkit-animation: loader__clip___1RIdi 1s linear infinite;\n            animation: loader__clip___1RIdi 1s linear infinite;\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    content: '';\n    border: 3px solid currentColor;\n    border-radius: 50%; }\n.loader__loader___1J20N::before {\n    clip: rect(0, 48px, 48px, 24px);\n    -webkit-animation: loader__clip-reverse___20o6x 1s linear infinite;\n            animation: loader__clip-reverse___20o6x 1s linear infinite;\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    left: 0;\n    content: '';\n    border: 3px solid currentColor;\n    border-radius: 50%; }\n@-webkit-keyframes loader__clip___1RIdi {\n  50% {\n    clip: rect(42px, 48px, 48px, 24px);\n    -webkit-animation-timing-function: ease-in-out;\n            animation-timing-function: ease-in-out; } }\n@keyframes loader__clip___1RIdi {\n  50% {\n    clip: rect(42px, 48px, 48px, 24px);\n    -webkit-animation-timing-function: ease-in-out;\n            animation-timing-function: ease-in-out; } }\n@-webkit-keyframes loader__clip-reverse___20o6x {\n  50% {\n    clip: rect(0, 48px, 9px, 24px);\n    -webkit-transform: rotate(135deg);\n            transform: rotate(135deg);\n    -webkit-animation-timing-function: ease-in-out;\n            animation-timing-function: ease-in-out; } }\n@keyframes loader__clip-reverse___20o6x {\n  50% {\n    clip: rect(0, 48px, 9px, 24px);\n    -webkit-transform: rotate(135deg);\n            transform: rotate(135deg);\n    -webkit-animation-timing-function: ease-in-out;\n            animation-timing-function: ease-in-out; } }\n@-webkit-keyframes loader__rotate___3K3Iv {\n  from {\n    -webkit-transform: rotate(0);\n            transform: rotate(0);\n    -webkit-animation-timing-function: ease-out;\n            animation-timing-function: ease-out; }\n  45% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n    color: white; }\n  55% {\n    -webkit-transform: rotate(54deg);\n            transform: rotate(54deg); }\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n@keyframes loader__rotate___3K3Iv {\n  from {\n    -webkit-transform: rotate(0);\n            transform: rotate(0);\n    -webkit-animation-timing-function: ease-out;\n            animation-timing-function: ease-out; }\n  45% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n    color: white; }\n  55% {\n    -webkit-transform: rotate(54deg);\n            transform: rotate(54deg); }\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvYWRlci5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osU0FBUztFQUNULFVBQVU7RUFDVixjQUFjO0VBQ2QsZ0NBQWdDO0VBQ2hDLFlBQVk7RUFDWixhQUFhO0VBQ2Isa0JBQWtCO0VBQ2xCLG1CQUFtQjtFQUNuQiw2REFBcUM7VUFBckMscURBQXFDO0VBQ3JDLGFBQWEsRUFBRTtBQUNmO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0Usa0NBQWtDO0lBQ2xDLDJEQUFtQztZQUFuQyxtREFBbUM7SUFDbkMsbUJBQW1CO0lBQ25CLE9BQU87SUFDUCxTQUFTO0lBQ1QsVUFBVTtJQUNWLFFBQVE7SUFDUixZQUFZO0lBQ1osK0JBQStCO0lBQy9CLG1CQUFtQixFQUFFO0FBQ3ZCO0lBQ0UsZ0NBQWdDO0lBQ2hDLG1FQUEyQztZQUEzQywyREFBMkM7SUFDM0MsbUJBQW1CO0lBQ25CLE9BQU87SUFDUCxTQUFTO0lBQ1QsVUFBVTtJQUNWLFFBQVE7SUFDUixZQUFZO0lBQ1osK0JBQStCO0lBQy9CLG1CQUFtQixFQUFFO0FBRXpCO0VBQ0U7SUFDRSxtQ0FBbUM7SUFDbkMsK0NBQXVDO1lBQXZDLHVDQUF1QyxFQUFFLEVBQUU7QUFIL0M7RUFDRTtJQUNFLG1DQUFtQztJQUNuQywrQ0FBdUM7WUFBdkMsdUNBQXVDLEVBQUUsRUFBRTtBQUUvQztFQUNFO0lBQ0UsK0JBQStCO0lBQy9CLGtDQUEwQjtZQUExQiwwQkFBMEI7SUFDMUIsK0NBQXVDO1lBQXZDLHVDQUF1QyxFQUFFLEVBQUU7QUFKL0M7RUFDRTtJQUNFLCtCQUErQjtJQUMvQixrQ0FBMEI7WUFBMUIsMEJBQTBCO0lBQzFCLCtDQUF1QztZQUF2Qyx1Q0FBdUMsRUFBRSxFQUFFO0FBRS9DO0VBQ0U7SUFDRSw2QkFBcUI7WUFBckIscUJBQXFCO0lBQ3JCLDRDQUFvQztZQUFwQyxvQ0FBb0MsRUFBRTtFQUN4QztJQUNFLGlDQUF5QjtZQUF6Qix5QkFBeUI7SUFDekIsYUFBYSxFQUFFO0VBQ2pCO0lBQ0UsaUNBQXlCO1lBQXpCLHlCQUF5QixFQUFFO0VBQzdCO0lBQ0Usa0NBQTBCO1lBQTFCLDBCQUEwQixFQUFFLEVBQUU7QUFWbEM7RUFDRTtJQUNFLDZCQUFxQjtZQUFyQixxQkFBcUI7SUFDckIsNENBQW9DO1lBQXBDLG9DQUFvQyxFQUFFO0VBQ3hDO0lBQ0UsaUNBQXlCO1lBQXpCLHlCQUF5QjtJQUN6QixhQUFhLEVBQUU7RUFDakI7SUFDRSxpQ0FBeUI7WUFBekIseUJBQXlCLEVBQUU7RUFDN0I7SUFDRSxrQ0FBMEI7WUFBMUIsMEJBQTBCLEVBQUUsRUFBRSIsImZpbGUiOiJsb2FkZXIuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4ubG9hZGVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiA5MDtcbiAgdG9wOiA1MCU7XG4gIGxlZnQ6IDUwJTtcbiAgZGlzcGxheTogbm9uZTtcbiAgY2xpcDogcmVjdCgwLCA0OHB4LCA0OHB4LCAyNHB4KTtcbiAgd2lkdGg6IDQycHg7XG4gIGhlaWdodDogNDJweDtcbiAgbWFyZ2luLXRvcDogLTIxcHg7XG4gIG1hcmdpbi1sZWZ0OiAtMjFweDtcbiAgYW5pbWF0aW9uOiByb3RhdGUgMXMgbGluZWFyIGluZmluaXRlO1xuICBjb2xvcjogd2hpdGU7IH1cbiAgLmxvYWRlci5hY3RpdmUge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5sb2FkZXI6OmFmdGVyIHtcbiAgICBjbGlwOiByZWN0KDRweCwgNDhweCwgNDhweCwgMjRweCk7XG4gICAgYW5pbWF0aW9uOiBjbGlwIDFzIGxpbmVhciBpbmZpbml0ZTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIGJvcmRlcjogM3B4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7IH1cbiAgLmxvYWRlcjo6YmVmb3JlIHtcbiAgICBjbGlwOiByZWN0KDAsIDQ4cHgsIDQ4cHgsIDI0cHgpO1xuICAgIGFuaW1hdGlvbjogY2xpcC1yZXZlcnNlIDFzIGxpbmVhciBpbmZpbml0ZTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIGJvcmRlcjogM3B4IHNvbGlkIGN1cnJlbnRDb2xvcjtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7IH1cblxuQGtleWZyYW1lcyBjbGlwIHtcbiAgNTAlIHtcbiAgICBjbGlwOiByZWN0KDQycHgsIDQ4cHgsIDQ4cHgsIDI0cHgpO1xuICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW4tb3V0OyB9IH1cblxuQGtleWZyYW1lcyBjbGlwLXJldmVyc2Uge1xuICA1MCUge1xuICAgIGNsaXA6IHJlY3QoMCwgNDhweCwgOXB4LCAyNHB4KTtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgxMzVkZWcpO1xuICAgIGFuaW1hdGlvbi10aW1pbmctZnVuY3Rpb246IGVhc2UtaW4tb3V0OyB9IH1cblxuQGtleWZyYW1lcyByb3RhdGUge1xuICBmcm9tIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwKTtcbiAgICBhbmltYXRpb24tdGltaW5nLWZ1bmN0aW9uOiBlYXNlLW91dDsgfVxuICA0NSUge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDE4ZGVnKTtcbiAgICBjb2xvcjogd2hpdGU7IH1cbiAgNTUlIHtcbiAgICB0cmFuc2Zvcm06IHJvdGF0ZSg1NGRlZyk7IH1cbiAgdG8ge1xuICAgIHRyYW5zZm9ybTogcm90YXRlKDM2MGRlZyk7IH0gfVxuIl19 */";
    var styles$5 = {"controlButton":"loader__controlButton___1YHb4","hidden":"loader__hidden___3MeyV","loader":"loader__loader___1J20N","rotate":"loader__rotate___3K3Iv","active":"loader__active___29tvY","clip":"loader__clip___1RIdi","clip-reverse":"loader__clip-reverse___20o6x"};
    styleInject(css$5);

    var LoaderView = /** @class */ (function (_super) {
        __extends(LoaderView, _super);
        function LoaderView() {
            var _this = _super.call(this) || this;
            _this._$rootElement = htmlToElement(loaderTemplate({
                styles: _this.styleNames,
            }));
            return _this;
        }
        LoaderView.prototype.getElement = function () {
            return this._$rootElement;
        };
        LoaderView.prototype.showContent = function () {
            this._$rootElement.classList.add(this.styleNames.active);
        };
        LoaderView.prototype.hideContent = function () {
            this._$rootElement.classList.remove(this.styleNames.active);
        };
        LoaderView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        LoaderView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        LoaderView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return LoaderView;
    }(View));
    LoaderView.extendStyleNames(styles$5);

    var DELAYED_SHOW_TIMEOUT = 100;
    var Loader = /** @class */ (function () {
        function Loader(_a) {
            var config = _a.config, eventEmitter = _a.eventEmitter, engine = _a.engine, rootContainer = _a.rootContainer;
            this._eventEmitter = eventEmitter;
            this.isHidden = false;
            this._engine = engine;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this._hideContent();
            rootContainer.appendComponentElement(this.getElement());
            if (config.hideMainUI) {
                this.hide();
            }
        }
        Loader.prototype.getElement = function () {
            return this.view.getElement();
        };
        Loader.prototype._bindCallbacks = function () {
            this._showContent = this._showContent.bind(this);
            this._hideContent = this._hideContent.bind(this);
        };
        Loader.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.STATE_CHANGED, this._checkForWaitingState],
                [VideoEvent$1.UPLOAD_SUSPEND, this.hide],
            ], this);
        };
        Loader.prototype._checkForWaitingState = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case EngineState$1.SEEK_IN_PROGRESS:
                    this.startDelayedShow();
                    break;
                case EngineState$1.WAITING:
                    this.startDelayedShow();
                    break;
                case EngineState$1.LOAD_STARTED:
                    if (this._engine.isPreloadActive) {
                        this._showContent();
                    }
                    break;
                case EngineState$1.READY_TO_PLAY:
                    this.stopDelayedShow();
                    this._hideContent();
                    break;
                case EngineState$1.PLAYING:
                    this.stopDelayedShow();
                    this._hideContent();
                    break;
                case EngineState$1.PAUSED:
                    this.stopDelayedShow();
                    this._hideContent();
                    break;
                /* ignore coverage */
                default:
                    break;
            }
        };
        Loader.prototype._initUI = function () {
            this.view = new Loader.View();
        };
        Loader.prototype._showContent = function () {
            if (this.isHidden) {
                this._eventEmitter.emitAsync(UIEvent$1.LOADER_SHOW);
                this.view.showContent();
                this.isHidden = false;
            }
        };
        Loader.prototype._hideContent = function () {
            if (!this.isHidden) {
                this._eventEmitter.emitAsync(UIEvent$1.LOADER_HIDE);
                this.view.hideContent();
                this.isHidden = true;
            }
        };
        Loader.prototype.hide = function () {
            this.view.hide();
        };
        Loader.prototype.show = function () {
            this.view.show();
        };
        Loader.prototype.startDelayedShow = function () {
            if (this.isDelayedShowScheduled) {
                this.stopDelayedShow();
            }
            this._delayedShowTimeout = window.setTimeout(this._showContent, DELAYED_SHOW_TIMEOUT);
        };
        Loader.prototype.stopDelayedShow = function () {
            window.clearTimeout(this._delayedShowTimeout);
            this._delayedShowTimeout = null;
        };
        Object.defineProperty(Loader.prototype, "isDelayedShowScheduled", {
            get: function () {
                return Boolean(this._delayedShowTimeout);
            },
            enumerable: true,
            configurable: true
        });
        Loader.prototype.destroy = function () {
            this._unbindEvents();
            this.stopDelayedShow();
            this.view.destroy();
        };
        Loader.moduleName = 'loader';
        Loader.View = LoaderView;
        Loader.dependencies = ['engine', 'eventEmitter', 'config', 'rootContainer'];
        return Loader;
    }());

    function dot_tpl_src_modules_ui_mainUiBlock_templates_mainUIBlock_dot(props
    ) {
    var out='<div class="'+(props.styles.mainUiBlock)+'" data-webplayer-component></div>';return out;
    }

    var mainUIBlockTemplate = dot_tpl_src_modules_ui_mainUiBlock_templates_mainUIBlock_dot.default ? dot_tpl_src_modules_ui_mainUiBlock_templates_mainUIBlock_dot.default : dot_tpl_src_modules_ui_mainUiBlock_templates_mainUIBlock_dot;

    var css$6 = ".main-ui-block__mainUiBlock___3fUqI {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column; }\n  .main-ui-block__mainUiBlock___3fUqI .main-ui-block__tooltipContainerWrapper___3e2KW {\n    position: relative;\n    -webkit-box-flex: 2;\n        -ms-flex-positive: 2;\n            flex-grow: 2; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4tdWktYmxvY2suc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLG1CQUFtQjtFQUNuQixPQUFPO0VBQ1AsU0FBUztFQUNULFVBQVU7RUFDVixRQUFRO0VBQ1IscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCw2QkFBdUI7RUFBdkIsOEJBQXVCO01BQXZCLDJCQUF1QjtVQUF2Qix1QkFBdUIsRUFBRTtFQUN6QjtJQUNFLG1CQUFtQjtJQUNuQixvQkFBYTtRQUFiLHFCQUFhO1lBQWIsYUFBYSxFQUFFIiwiZmlsZSI6Im1haW4tdWktYmxvY2suc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5tYWluVWlCbG9jayB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XG4gIC5tYWluVWlCbG9jayAudG9vbHRpcENvbnRhaW5lcldyYXBwZXIge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBmbGV4LWdyb3c6IDI7IH1cbiJdfQ== */";
    var styles$6 = {"mainUiBlock":"main-ui-block__mainUiBlock___3fUqI","tooltipContainerWrapper":"main-ui-block__tooltipContainerWrapper___3e2KW"};
    styleInject(css$6);

    var MainUIBlockView = /** @class */ (function (_super) {
        __extends(MainUIBlockView, _super);
        function MainUIBlockView(config) {
            var _this = _super.call(this) || this;
            _this._initDOM(config.elements);
            return _this;
        }
        MainUIBlockView.prototype._initDOM = function (elements) {
            this._$rootElement = htmlToElement(mainUIBlockTemplate({
                styles: this.styleNames,
            }));
            var $tooltipContainerWrapper = document.createElement('div');
            $tooltipContainerWrapper.classList.add(this.styleNames.tooltipContainerWrapper);
            $tooltipContainerWrapper.appendChild(elements.tooltipContainer);
            this._$rootElement.appendChild(elements.topBlock);
            this._$rootElement.appendChild($tooltipContainerWrapper);
            this._$rootElement.appendChild(elements.bottomBlock);
        };
        MainUIBlockView.prototype.getElement = function () {
            return this._$rootElement;
        };
        MainUIBlockView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return MainUIBlockView;
    }(View));
    MainUIBlockView.extendStyleNames(styles$6);

    var HIDE_BLOCK_TIMEOUT = 2000;
    var MainUIBlock = /** @class */ (function () {
        function MainUIBlock(dependencies) {
            this._hideTimeout = null;
            this._isContentShowingEnabled = true;
            this._isContentShown = false;
            this._shouldShowContent = true;
            this._shouldAlwaysShow = false;
            this._isDragging = false;
            var config = dependencies.config, eventEmitter = dependencies.eventEmitter, rootContainer = dependencies.rootContainer, tooltipService = dependencies.tooltipService, topBlock = dependencies.topBlock, bottomBlock = dependencies.bottomBlock, screen = dependencies.screen;
            this._config = config;
            this._eventEmitter = eventEmitter;
            this._topBlock = topBlock;
            this._bottomBlock = bottomBlock;
            this._screen = screen;
            this._tooltipService = tooltipService;
            this.isHidden = false;
            this._shouldAlwaysShow = false;
            this._initUI({
                tooltipContainer: tooltipService.tooltipContainerElement,
                topBlock: topBlock.getElement(),
                bottomBlock: bottomBlock.getElement(),
            });
            this._bindViewCallbacks();
            this._bindEvents();
            rootContainer.appendComponentElement(this.view.getElement());
            if (config.hideMainUI) {
                this.hide();
            }
        }
        MainUIBlock.prototype.getElement = function () {
            return this.view.getElement();
        };
        MainUIBlock.prototype._initUI = function (elements) {
            this.view = new MainUIBlock.View({ elements: elements });
        };
        MainUIBlock.prototype._bindViewCallbacks = function () {
            this._startHideBlockTimeout = this._startHideBlockTimeout.bind(this);
            this._tryShowContent = this._tryShowContent.bind(this);
            this._tryHideContent = this._tryHideContent.bind(this);
        };
        MainUIBlock.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [UIEvent$1.MOUSE_MOVE_ON_PLAYER, this._startHideBlockTimeout],
                [UIEvent$1.MOUSE_LEAVE_ON_PLAYER, this._tryHideContent],
                [UIEvent$1.FOCUS_ENTER_ON_PLAYER, this._startHideBlockTimeout],
                [UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED, this._startHideBlockTimeout],
                [UIEvent$1.LOADER_HIDE, this._startHideBlockTimeout],
                [VideoEvent$1.STATE_CHANGED, this._updatePlayingState],
                [UIEvent$1.CONTROL_DRAG_START, this._onControlDragStart],
                [UIEvent$1.CONTROL_DRAG_END, this._onControlDragEnd],
            ], this);
        };
        MainUIBlock.prototype._updatePlayingState = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case EngineState$1.PLAY_REQUESTED: {
                    this._shouldShowContent = false;
                    this._startHideBlockTimeout();
                    break;
                }
                case EngineState$1.ENDED: {
                    this._shouldShowContent = true;
                    this._tryShowContent();
                    break;
                }
                case EngineState$1.PAUSED: {
                    this._shouldShowContent = true;
                    this._tryShowContent();
                    break;
                }
                case EngineState$1.SRC_SET: {
                    this._shouldShowContent = true;
                    this._tryShowContent();
                    break;
                }
                default:
                    break;
            }
        };
        Object.defineProperty(MainUIBlock.prototype, "_isBlockFocused", {
            get: function () {
                return this._bottomBlock.isFocused || this._topBlock.isFocused;
            },
            enumerable: true,
            configurable: true
        });
        MainUIBlock.prototype._startHideBlockTimeout = function () {
            this._stopHideBlockTimeout();
            this._tryShowContent();
            this._hideTimeout = window.setTimeout(this._tryHideContent, HIDE_BLOCK_TIMEOUT);
        };
        MainUIBlock.prototype._stopHideBlockTimeout = function () {
            if (this._hideTimeout) {
                window.clearTimeout(this._hideTimeout);
            }
        };
        MainUIBlock.prototype._tryShowContent = function () {
            if (this._isContentShowingEnabled) {
                this._showContent();
            }
        };
        MainUIBlock.prototype._onControlDragStart = function () {
            this._isDragging = true;
        };
        MainUIBlock.prototype._onControlDragEnd = function () {
            this._isDragging = false;
            this._tryHideContent();
        };
        MainUIBlock.prototype._showContent = function () {
            this._screen.showCursor();
            if (this.isHidden || this._isContentShown) {
                return;
            }
            this._eventEmitter.emitAsync(UIEvent$1.MAIN_BLOCK_SHOW);
            this._bottomBlock.showContent();
            this._topBlock.showContent();
            this._isContentShown = true;
        };
        MainUIBlock.prototype._tryHideContent = function () {
            if (!this._isBlockFocused &&
                !this._isDragging &&
                !this._shouldShowContent &&
                !this._shouldAlwaysShow) {
                this._hideContent();
            }
        };
        MainUIBlock.prototype._hideContent = function () {
            if (this._isContentShowingEnabled) {
                this._screen.hideCursor();
            }
            if (this.isHidden || !this._isContentShown) {
                return;
            }
            this._eventEmitter.emitAsync(UIEvent$1.MAIN_BLOCK_HIDE);
            this._bottomBlock.hideContent();
            this._topBlock.hideContent();
            this._tooltipService.hide();
            this._isContentShown = false;
        };
        MainUIBlock.prototype.disableShowingContent = function () {
            this._isContentShowingEnabled = false;
            this._hideContent();
        };
        MainUIBlock.prototype.enableShowingContent = function () {
            this._isContentShowingEnabled = true;
            if (this._shouldShowContent) {
                this._showContent();
            }
        };
        /**
         * Method for hiding main ui
         * Important! This overrides the effect of `setMainUIShouldAlwaysShow` method
         * @example
         * player.hideMainUI();
         */
        MainUIBlock.prototype.hide = function () {
            this.isHidden = true;
            this._topBlock.hide();
            this._bottomBlock.hide();
        };
        /**
         * Method for showing main ui in case it was hidden
         * @example
         * player.showMainUI();
         */
        MainUIBlock.prototype.show = function () {
            /**
             * TODO: fix this part of API
             * config.hideMainUI is being forced to be true on IOS because it's common to use native controls for players on IOS
             * In that case, main ui is constantly hidden. But if you use 'showMainUI' API it'll show two sets of controls on IOS
             * Native and WebPlayer's
             * For now, the easiest fix is to take into account the config.hideMainUI property here
             * But best solution is to rethink the way we force IOS to use native controls, without rewriting the config property
             * on initialization
             */
            if (this._config.hideMainUI) {
                return;
            }
            this.isHidden = false;
            this._topBlock.show();
            this._bottomBlock.show();
        };
        /**
         * Method for allowing main ui to be always shown despite the playback state and the cursor position
         * Important! UI would be hidden in case `hideMainUI` is called
         * @param flag - `true` for showing always
         * @example
         * player.setMainUIShouldAlwaysShow(true);
         *
         */
        MainUIBlock.prototype.setShouldAlwaysShow = function (flag) {
            this._shouldAlwaysShow = flag;
            if (this._shouldAlwaysShow) {
                this._tryShowContent();
            }
            else {
                this._startHideBlockTimeout();
            }
        };
        MainUIBlock.prototype.destroy = function () {
            this._stopHideBlockTimeout();
            this._unbindEvents();
            this.view.destroy();
        };
        MainUIBlock.moduleName = 'mainUIBlock';
        MainUIBlock.View = MainUIBlockView;
        MainUIBlock.dependencies = [
            'config',
            'screen',
            'rootContainer',
            'tooltipService',
            'eventEmitter',
            'topBlock',
            'bottomBlock',
        ];
        __decorate([
            playerAPI('hideMainUI')
        ], MainUIBlock.prototype, "hide", null);
        __decorate([
            playerAPI('showMainUI')
        ], MainUIBlock.prototype, "show", null);
        __decorate([
            playerAPI('setMainUIShouldAlwaysShow')
        ], MainUIBlock.prototype, "setShouldAlwaysShow", null);
        return MainUIBlock;
    }());

    function dot_tpl_src_modules_ui_topBlock_templates_topBlock_dot(props
    ) {
    var out='<div data-webplayer-hook="top-block" class="'+(props.styles.topBlock)+'"> <div class="'+(props.styles.background)+'" data-webplayer-hook="screen-top-background"> </div> <div class="'+(props.styles.elementsContainer)+'"> <div class="'+(props.styles.liveIndicatorContainer)+'" data-webplayer-hook="live-indicator-container"> </div> <div class="'+(props.styles.titleContainer)+'" data-webplayer-hook="title-container"> </div> </div></div>';return out;
    }

    var topBlockTemplate = dot_tpl_src_modules_ui_topBlock_templates_topBlock_dot.default ? dot_tpl_src_modules_ui_topBlock_templates_topBlock_dot.default : dot_tpl_src_modules_ui_topBlock_templates_topBlock_dot;

    var css$7 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.top-block__controlButton___2Irx0 {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.top-block__controlButton___2Irx0:hover {\n    opacity: .7; }\n.top-block__hidden___JNzhk {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.top-block__topBlock___2nOmO {\n  position: relative;\n  z-index: 60; }\n.top-block__topBlock___2nOmO::-moz-focus-inner {\n    border: 0; }\n.top-block__topBlock___2nOmO.top-block__activated___2ThkU .top-block__titleContainer___1gKBN,\n  .top-block__topBlock___2nOmO.top-block__activated___2ThkU .top-block__background___2RYBo {\n    opacity: 1; }\n.top-block__liveIndicatorContainer___3wTlQ {\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0; }\n.top-block__elementsContainer___11-A7 {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  margin-top: 20px;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n[data-webplayer-hook='player-container'][data-webplayer-dir=\"ltr\"] .top-block__elementsContainer___11-A7 {\n    margin-left: 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-dir=\"rtl\"] .top-block__elementsContainer___11-A7 {\n    margin-right: 20px;\n    direction: rtl; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .top-block__elementsContainer___11-A7 {\n    margin-top: 30px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"][data-webplayer-dir=\"ltr\"] .top-block__elementsContainer___11-A7 {\n    margin-left: 30px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"][data-webplayer-dir=\"rtl\"] .top-block__elementsContainer___11-A7 {\n    margin-right: 30px;\n    direction: rtl; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .top-block__elementsContainer___11-A7 {\n    margin-top: 15px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"][data-webplayer-dir=\"ltr\"] .top-block__elementsContainer___11-A7 {\n    margin-left: 15px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"][data-webplayer-dir=\"rtl\"] .top-block__elementsContainer___11-A7 {\n    margin-right: 15px;\n    direction: rtl; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] .top-block__elementsContainer___11-A7 {\n    margin-top: 12px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"][data-webplayer-dir=\"ltr\"] .top-block__elementsContainer___11-A7 {\n    margin-left: 12px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"][data-webplayer-dir=\"rtl\"] .top-block__elementsContainer___11-A7 {\n    margin-right: 12px;\n    direction: rtl; }\n.top-block__titleContainer___1gKBN {\n  max-width: calc(100% - 200px);\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  opacity: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1; }\n.top-block__background___2RYBo {\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  height: 181px;\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  pointer-events: none;\n  opacity: 0;\n  background-image: -webkit-gradient(linear, left bottom, left top, from(rgba(0, 0, 0, 0)), color-stop(24%, rgba(0, 0, 0, 0.03)), color-stop(50%, rgba(0, 0, 0, 0.15)), color-stop(75%, rgba(0, 0, 0, 0.3)), to(rgba(0, 0, 0, 0.4)));\n  background-image: linear-gradient(to top, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.03) 24%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.4));\n  background-size: 100% 182px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvcC1ibG9jay5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixZQUFZLEVBQUU7QUFDZDtJQUNFLFVBQVUsRUFBRTtBQUNkOztJQUVFLFdBQVcsRUFBRTtBQUVqQjtFQUNFLG9CQUFhO01BQWIscUJBQWE7VUFBYixhQUFhLEVBQUU7QUFFakI7RUFDRSxtQkFBbUI7RUFDbkIscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCwrQkFBb0I7RUFBcEIsOEJBQW9CO01BQXBCLHdCQUFvQjtVQUFwQixvQkFBb0I7RUFDcEIsaUJBQWlCO0VBQ2pCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxrQkFBa0IsRUFBRTtBQUN0QjtJQUNFLG1CQUFtQjtJQUNuQixlQUFlLEVBQUU7QUFDbkI7SUFDRSxpQkFBaUIsRUFBRTtBQUNyQjtJQUNFLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsbUJBQW1CO0lBQ25CLGVBQWUsRUFBRTtBQUNuQjtJQUNFLGlCQUFpQixFQUFFO0FBQ3JCO0lBQ0Usa0JBQWtCLEVBQUU7QUFDdEI7SUFDRSxtQkFBbUI7SUFDbkIsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsaUJBQWlCLEVBQUU7QUFDckI7SUFDRSxrQkFBa0IsRUFBRTtBQUN0QjtJQUNFLG1CQUFtQjtJQUNuQixlQUFlLEVBQUU7QUFFckI7RUFDRSw4QkFBOEI7RUFDOUIsZ0NBQXdCO0VBQXhCLHdCQUF3QjtFQUN4QixXQUFXO0VBQ1gsb0JBQWE7TUFBYixxQkFBYTtVQUFiLGFBQWEsRUFBRTtBQUVqQjtFQUNFLG1CQUFtQjtFQUNuQixPQUFPO0VBQ1AsU0FBUztFQUNULFFBQVE7RUFDUixjQUFjO0VBQ2QsZ0NBQXdCO0VBQXhCLHdCQUF3QjtFQUN4QixxQkFBcUI7RUFDckIsV0FBVztFQUNYLG1PQUEwSjtFQUExSiwwSkFBMEo7RUFDMUosNEJBQTRCLEVBQUUiLCJmaWxlIjoidG9wLWJsb2NrLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLnRvcEJsb2NrIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiA2MDsgfVxuICAudG9wQmxvY2s6Oi1tb3otZm9jdXMtaW5uZXIge1xuICAgIGJvcmRlcjogMDsgfVxuICAudG9wQmxvY2suYWN0aXZhdGVkIC50aXRsZUNvbnRhaW5lcixcbiAgLnRvcEJsb2NrLmFjdGl2YXRlZCAuYmFja2dyb3VuZCB7XG4gICAgb3BhY2l0eTogMTsgfVxuXG4ubGl2ZUluZGljYXRvckNvbnRhaW5lciB7XG4gIGZsZXgtZ3JvdzogMDsgfVxuXG4uZWxlbWVudHNDb250YWluZXIge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiByb3c7XG4gIG1hcmdpbi10b3A6IDIwcHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtZGlyPVwibHRyXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLWxlZnQ6IDIwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtZGlyPVwicnRsXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAyMHB4O1xuICAgIGRpcmVjdGlvbjogcnRsOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuZWxlbWVudHNDb250YWluZXIge1xuICAgIG1hcmdpbi10b3A6IDMwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdW2RhdGEtcGxheWFibGUtZGlyPVwibHRyXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLWxlZnQ6IDMwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdW2RhdGEtcGxheWFibGUtZGlyPVwicnRsXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAzMHB4O1xuICAgIGRpcmVjdGlvbjogcnRsOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCI1NTBweFwiXSAuZWxlbWVudHNDb250YWluZXIge1xuICAgIG1hcmdpbi10b3A6IDE1cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdW2RhdGEtcGxheWFibGUtZGlyPVwibHRyXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLWxlZnQ6IDE1cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdW2RhdGEtcGxheWFibGUtZGlyPVwicnRsXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxNXB4O1xuICAgIGRpcmVjdGlvbjogcnRsOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCIyODBweFwiXSAuZWxlbWVudHNDb250YWluZXIge1xuICAgIG1hcmdpbi10b3A6IDEycHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjI4MHB4XCJdW2RhdGEtcGxheWFibGUtZGlyPVwibHRyXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLWxlZnQ6IDEycHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjI4MHB4XCJdW2RhdGEtcGxheWFibGUtZGlyPVwicnRsXCJdIC5lbGVtZW50c0NvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMnB4O1xuICAgIGRpcmVjdGlvbjogcnRsOyB9XG5cbi50aXRsZUNvbnRhaW5lciB7XG4gIG1heC13aWR0aDogY2FsYygxMDAlIC0gMjAwcHgpO1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycztcbiAgb3BhY2l0eTogMDtcbiAgZmxleC1ncm93OiAxOyB9XG5cbi5iYWNrZ3JvdW5kIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBsZWZ0OiAwO1xuICBoZWlnaHQ6IDE4MXB4O1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycztcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIG9wYWNpdHk6IDA7XG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byB0b3AsIHJnYmEoMCwgMCwgMCwgMCksIHJnYmEoMCwgMCwgMCwgMC4wMykgMjQlLCByZ2JhKDAsIDAsIDAsIDAuMTUpIDUwJSwgcmdiYSgwLCAwLCAwLCAwLjMpIDc1JSwgcmdiYSgwLCAwLCAwLCAwLjQpKTtcbiAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDE4MnB4OyB9XG4iXX0= */";
    var styles$7 = {"controlButton":"top-block__controlButton___2Irx0","hidden":"top-block__hidden___JNzhk","topBlock":"top-block__topBlock___2nOmO","activated":"top-block__activated___2ThkU","titleContainer":"top-block__titleContainer___1gKBN","background":"top-block__background___2RYBo","liveIndicatorContainer":"top-block__liveIndicatorContainer___3wTlQ","elementsContainer":"top-block__elementsContainer___11-A7"};
    styleInject(css$7);

    var TopBlockView = /** @class */ (function (_super) {
        __extends(TopBlockView, _super);
        function TopBlockView(config) {
            var _this = _super.call(this) || this;
            var callbacks = config.callbacks, elements = config.elements;
            _this._callbacks = callbacks;
            _this._initDOM(elements);
            _this._bindEvents();
            return _this;
        }
        TopBlockView.prototype.getElement = function () {
            return this._$rootElement;
        };
        TopBlockView.prototype._initDOM = function (elements) {
            this._$rootElement = htmlToElement(topBlockTemplate({
                styles: this.styleNames,
            }));
            this._$titleContainer = getElementByHook(this._$rootElement, 'title-container');
            this._$liveIndicatorContainer = getElementByHook(this._$rootElement, 'live-indicator-container');
            this._$titleContainer.appendChild(elements.title);
            this._$liveIndicatorContainer.appendChild(elements.liveIndicator);
        };
        TopBlockView.prototype._preventClickPropagation = function (e) {
            e.stopPropagation();
        };
        TopBlockView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._preventClickPropagation);
            this._$rootElement.addEventListener('mousemove', this._callbacks.onBlockMouseMove);
            this._$rootElement.addEventListener('mouseleave', this._callbacks.onBlockMouseOut);
        };
        TopBlockView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._preventClickPropagation);
            this._$rootElement.removeEventListener('mousemove', this._callbacks.onBlockMouseMove);
            this._$rootElement.removeEventListener('mouseleave', this._callbacks.onBlockMouseOut);
        };
        TopBlockView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        TopBlockView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        TopBlockView.prototype.showContent = function () {
            this._$rootElement.classList.add(this.styleNames.activated);
        };
        TopBlockView.prototype.hideContent = function () {
            this._$rootElement.classList.remove(this.styleNames.activated);
        };
        TopBlockView.prototype.showTitle = function () {
            this._$titleContainer.classList.remove(this.styleNames.hidden);
        };
        TopBlockView.prototype.hideTitle = function () {
            this._$titleContainer.classList.add(this.styleNames.hidden);
        };
        TopBlockView.prototype.showLiveIndicator = function () {
            this._$liveIndicatorContainer.classList.remove(this.styleNames.hidden);
        };
        TopBlockView.prototype.hideLiveIndicator = function () {
            this._$liveIndicatorContainer.classList.add(this.styleNames.hidden);
        };
        TopBlockView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return TopBlockView;
    }(View));
    TopBlockView.extendStyleNames(styles$7);

    var TopBlock = /** @class */ (function () {
        function TopBlock(dependencies) {
            this._isBlockFocused = false;
            this.isHidden = false;
            this._bindViewCallbacks();
            this._initUI(this._getElements(dependencies));
        }
        TopBlock.prototype._bindViewCallbacks = function () {
            this._setFocusState = this._setFocusState.bind(this);
            this._removeFocusState = this._removeFocusState.bind(this);
        };
        TopBlock.prototype._initUI = function (elements) {
            var config = {
                elements: elements,
                callbacks: {
                    onBlockMouseMove: this._setFocusState,
                    onBlockMouseOut: this._removeFocusState,
                },
            };
            this.view = new TopBlock.View(config);
        };
        TopBlock.prototype._getElements = function (dependencies) {
            var title = dependencies.title, liveIndicator = dependencies.liveIndicator;
            return {
                title: title.getElement(),
                liveIndicator: liveIndicator.getElement(),
            };
        };
        TopBlock.prototype._setFocusState = function () {
            this._isBlockFocused = true;
        };
        TopBlock.prototype._removeFocusState = function () {
            this._isBlockFocused = false;
        };
        Object.defineProperty(TopBlock.prototype, "isFocused", {
            get: function () {
                return this._isBlockFocused;
            },
            enumerable: true,
            configurable: true
        });
        TopBlock.prototype.getElement = function () {
            return this.view.getElement();
        };
        TopBlock.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        TopBlock.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        TopBlock.prototype.showTitle = function () {
            this.view.showTitle();
        };
        TopBlock.prototype.hideTitle = function () {
            this.view.hideTitle();
        };
        TopBlock.prototype.showLiveIndicator = function () {
            this.view.showLiveIndicator();
        };
        TopBlock.prototype.hideLiveIndicator = function () {
            this.view.hideLiveIndicator();
        };
        TopBlock.prototype.showContent = function () {
            this.view.showContent();
        };
        TopBlock.prototype.hideContent = function () {
            this.view.hideContent();
        };
        TopBlock.prototype.destroy = function () {
            this.view.destroy();
        };
        TopBlock.moduleName = 'topBlock';
        TopBlock.View = TopBlockView;
        TopBlock.dependencies = ['title', 'liveIndicator'];
        __decorate([
            playerAPI()
        ], TopBlock.prototype, "showTitle", null);
        __decorate([
            playerAPI()
        ], TopBlock.prototype, "hideTitle", null);
        __decorate([
            playerAPI()
        ], TopBlock.prototype, "showLiveIndicator", null);
        __decorate([
            playerAPI()
        ], TopBlock.prototype, "hideLiveIndicator", null);
        return TopBlock;
    }());

    function dot_tpl_src_modules_ui_title_templates_title_dot(props
    ) {
    var out='<div class="'+(props.styles.title)+' '+(props.themeStyles.titleText)+'" data-webplayer-hook="video-title"></div>';return out;
    }

    var titleTemplate = dot_tpl_src_modules_ui_title_templates_title_dot.default ? dot_tpl_src_modules_ui_title_templates_title_dot.default : dot_tpl_src_modules_ui_title_templates_title_dot;

    var titleViewTheme = {
        titleText: {
            color: function (data) { return data.color; },
        },
    };

    var css$8 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.title__controlButton___tyPdk {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.title__controlButton___tyPdk:hover {\n    opacity: .7; }\n.title__hidden___3SyPm {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.title__title___324Zx {\n  font-size: 16px;\n  line-height: 17px;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .title__title___324Zx {\n    font-size: 14px;\n    line-height: 15px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"300px\"] .title__title___324Zx {\n    font-size: 12px;\n    line-height: 13px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .title__title___324Zx {\n    font-size: 20px;\n    line-height: 20px; }\n.title__title___324Zx.title__link___2x3nu {\n    cursor: pointer; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpdGxlLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsb0JBQW9CO0VBQ3BCLHdCQUF3QixFQUFFO0FBQzFCO0lBQ0UsZ0JBQWdCO0lBQ2hCLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsZ0JBQWdCO0lBQ2hCLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsZ0JBQWdCO0lBQ2hCLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsZ0JBQWdCLEVBQUUiLCJmaWxlIjoidGl0bGUuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4udGl0bGUge1xuICBmb250LXNpemU6IDE2cHg7XG4gIGxpbmUtaGVpZ2h0OiAxN3B4O1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpczsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiNTUwcHhcIl0gLnRpdGxlIHtcbiAgICBmb250LXNpemU6IDE0cHg7XG4gICAgbGluZS1oZWlnaHQ6IDE1cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjMwMHB4XCJdIC50aXRsZSB7XG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxM3B4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudGl0bGUge1xuICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICBsaW5lLWhlaWdodDogMjBweDsgfVxuICAudGl0bGUubGluayB7XG4gICAgY3Vyc29yOiBwb2ludGVyOyB9XG4iXX0= */";
    var styles$8 = {"controlButton":"title__controlButton___tyPdk","hidden":"title__hidden___3SyPm","title":"title__title___324Zx","link":"title__link___2x3nu"};
    styleInject(css$8);

    var TitleView = /** @class */ (function (_super) {
        __extends(TitleView, _super);
        function TitleView(config) {
            var _this = this;
            var callbacks = config.callbacks, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._initDOM();
            _this._bindEvents();
            return _this;
        }
        TitleView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(titleTemplate({ styles: this.styleNames, themeStyles: this.themeStyles }));
        };
        TitleView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._callbacks.onClick);
        };
        TitleView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._callbacks.onClick);
        };
        TitleView.prototype.setDisplayAsLink = function (flag) {
            toggleElementClass(this._$rootElement, this.styleNames.link, flag);
        };
        TitleView.prototype.setTitle = function (title) {
            // TODO: mb move this logic to controller? title.isHidden is out of control of this method
            // TODO: what if we call with empty value `.setTitle('')` and then call `.show()` method? Mb clear value anyway?
            if (title) {
                this.show();
                this._$rootElement.innerHTML = title;
            }
            else {
                this.hide();
            }
        };
        TitleView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        TitleView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        TitleView.prototype.getElement = function () {
            return this._$rootElement;
        };
        TitleView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return TitleView;
    }(View));
    TitleView.setTheme(titleViewTheme);
    TitleView.extendStyleNames(styles$8);

    var Title = /** @class */ (function () {
        function Title(_a) {
            var theme = _a.theme, config = _a.config;
            this._theme = theme;
            this._bindCallbacks();
            this._initUI();
            this.setTitle(config.title);
        }
        Title.prototype.getElement = function () {
            return this.view.getElement();
        };
        Title.prototype._bindCallbacks = function () {
            this._triggerCallback = this._triggerCallback.bind(this);
        };
        Title.prototype._initUI = function () {
            var config = {
                theme: this._theme,
                callbacks: {
                    onClick: this._triggerCallback,
                },
            };
            this.view = new Title.View(config);
            this.view.setTitle();
        };
        /**
         * Display title text over the video. If you want to have clickable title, use `setTitleClickCallback`
         *
         * @param title - Text for the video title
         *
         * @example
         * player.setTitle('Your awesome video title here');
         *
         * @note
         * [Live Demo](https://jsfiddle.net/bodia/243k6m0u/)
         */
        Title.prototype.setTitle = function (title) {
            this.view.setTitle(title);
        };
        /**
         * Method for attaching callback for click on title
         *
         * @param callback - Your function
         *
         * @example
         * const callback = () => {
         *   console.log('Click on title);
         * }
         * player.setTitleClickCallback(callback);
         *
         */
        Title.prototype.setTitleClickCallback = function (callback) {
            this._callback = callback;
            this.view.setDisplayAsLink(Boolean(this._callback));
        };
        Title.prototype._triggerCallback = function () {
            if (this._callback) {
                this._callback();
            }
        };
        Title.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        Title.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        Title.prototype.destroy = function () {
            this.view.destroy();
        };
        Title.moduleName = 'title';
        Title.View = TitleView;
        Title.dependencies = ['config', 'theme'];
        __decorate([
            playerAPI()
        ], Title.prototype, "setTitle", null);
        __decorate([
            playerAPI()
        ], Title.prototype, "setTitleClickCallback", null);
        return Title;
    }());

    function dot_tpl_src_modules_ui_liveIndicator_templates_liveIndicator_dot(props
    ) {
    var out='<div class="'+(props.styles.liveIndicator)+' '+(props.styles.hidden)+'"> <button tabindex="0" class="'+(props.styles.liveIndicatorButton)+'" aria-label="'+(props.texts.label || '')+'" data-webplayer-hook="live-indicator-button"> '+(props.texts.text || '')+' </button></div>';return out;
    }

    var liveIndicatorTemplate = dot_tpl_src_modules_ui_liveIndicator_templates_liveIndicator_dot.default ? dot_tpl_src_modules_ui_liveIndicator_templates_liveIndicator_dot.default : dot_tpl_src_modules_ui_liveIndicator_templates_liveIndicator_dot;

    var css$9 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.live-indicator__controlButton___1FH60 {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.live-indicator__controlButton___1FH60:hover {\n    opacity: .7; }\n.live-indicator__hidden___1MQc0 {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.live-indicator__liveIndicator___3Vudz {\n  position: relative;\n  -webkit-transition: background-color .2s;\n  transition: background-color .2s;\n  background-color: #959595; }\n[data-webplayer-hook='player-container'][data-webplayer-dir=\"ltr\"] .live-indicator__liveIndicator___3Vudz {\n    margin-right: 15px;\n    direction: ltr; }\n[data-webplayer-hook='player-container'][data-webplayer-dir=\"rtl\"] .live-indicator__liveIndicator___3Vudz {\n    margin-left: 15px;\n    direction: rtl; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"][data-webplayer-dir=\"ltr\"] .live-indicator__liveIndicator___3Vudz {\n    margin-right: 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"][data-webplayer-dir=\"rtl\"] .live-indicator__liveIndicator___3Vudz {\n    margin-left: 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"][data-webplayer-dir=\"ltr\"] .live-indicator__liveIndicator___3Vudz {\n    margin-right: 10px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"][data-webplayer-dir=\"rtl\"] .live-indicator__liveIndicator___3Vudz {\n    margin-left: 10px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] .live-indicator__liveIndicator___3Vudz {\n    padding: 2px 3px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"][data-webplayer-dir=\"ltr\"] .live-indicator__liveIndicator___3Vudz {\n    margin-right: 10px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"][data-webplayer-dir=\"rtl\"] .live-indicator__liveIndicator___3Vudz {\n    margin-left: 10px; }\n.live-indicator__liveIndicator___3Vudz.live-indicator__ended___18KqE {\n    cursor: default; }\n.live-indicator__liveIndicator___3Vudz:hover:not(.live-indicator__ended___18KqE), .live-indicator__liveIndicator___3Vudz.live-indicator__active___2Lobb {\n    background-color: #ea492e; }\n.live-indicator__clickable___2efwz {\n  cursor: pointer; }\nbutton.live-indicator__liveIndicatorButton___fQcZU {\n  font-size: 12px;\n  line-height: 14px;\n  padding: 5px 6px;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  text-transform: uppercase !important;\n  color: #fff;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] button.live-indicator__liveIndicatorButton___fQcZU {\n    font-size: 10px;\n    line-height: 12px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpdmUtaW5kaWNhdG9yLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLHlDQUFpQztFQUFqQyxpQ0FBaUM7RUFDakMsMEJBQTBCLEVBQUU7QUFDNUI7SUFDRSxtQkFBbUI7SUFDbkIsZUFBZSxFQUFFO0FBQ25CO0lBQ0Usa0JBQWtCO0lBQ2xCLGVBQWUsRUFBRTtBQUNuQjtJQUNFLG1CQUFtQixFQUFFO0FBQ3ZCO0lBQ0Usa0JBQWtCLEVBQUU7QUFDdEI7SUFDRSxtQkFBbUIsRUFBRTtBQUN2QjtJQUNFLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsaUJBQWlCLEVBQUU7QUFDckI7SUFDRSxtQkFBbUIsRUFBRTtBQUN2QjtJQUNFLGtCQUFrQixFQUFFO0FBQ3RCO0lBQ0UsZ0JBQWdCLEVBQUU7QUFDcEI7SUFDRSwwQkFBMEIsRUFBRTtBQUVoQztFQUNFLGdCQUFnQixFQUFFO0FBRXBCO0VBQ0UsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtFQUNsQixpQkFBaUI7RUFDakIsMEJBQWtCO0tBQWxCLHVCQUFrQjtNQUFsQixzQkFBa0I7VUFBbEIsa0JBQWtCO0VBQ2xCLHFDQUFxQztFQUNyQyxZQUFZO0VBQ1osVUFBVTtFQUNWLGlCQUFpQjtFQUNqQixjQUFjO0VBQ2QsOEJBQThCLEVBQUU7QUFDaEM7SUFDRSxnQkFBZ0I7SUFDaEIsa0JBQWtCLEVBQUUiLCJmaWxlIjoibGl2ZS1pbmRpY2F0b3Iuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4ubGl2ZUluZGljYXRvciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdHJhbnNpdGlvbjogYmFja2dyb3VuZC1jb2xvciAuMnM7XG4gIGJhY2tncm91bmQtY29sb3I6ICM5NTk1OTU7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtZGlyPVwibHRyXCJdIC5saXZlSW5kaWNhdG9yIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDE1cHg7XG4gICAgZGlyZWN0aW9uOiBsdHI7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtZGlyPVwicnRsXCJdIC5saXZlSW5kaWNhdG9yIHtcbiAgICBtYXJnaW4tbGVmdDogMTVweDtcbiAgICBkaXJlY3Rpb246IHJ0bDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl1bZGF0YS1wbGF5YWJsZS1kaXI9XCJsdHJcIl0gLmxpdmVJbmRpY2F0b3Ige1xuICAgIG1hcmdpbi1yaWdodDogMjBweDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl1bZGF0YS1wbGF5YWJsZS1kaXI9XCJydGxcIl0gLmxpdmVJbmRpY2F0b3Ige1xuICAgIG1hcmdpbi1sZWZ0OiAyMHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCI1NTBweFwiXVtkYXRhLXBsYXlhYmxlLWRpcj1cImx0clwiXSAubGl2ZUluZGljYXRvciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCI1NTBweFwiXVtkYXRhLXBsYXlhYmxlLWRpcj1cInJ0bFwiXSAubGl2ZUluZGljYXRvciB7XG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjI4MHB4XCJdIC5saXZlSW5kaWNhdG9yIHtcbiAgICBwYWRkaW5nOiAycHggM3B4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCIyODBweFwiXVtkYXRhLXBsYXlhYmxlLWRpcj1cImx0clwiXSAubGl2ZUluZGljYXRvciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCIyODBweFwiXVtkYXRhLXBsYXlhYmxlLWRpcj1cInJ0bFwiXSAubGl2ZUluZGljYXRvciB7XG4gICAgbWFyZ2luLWxlZnQ6IDEwcHg7IH1cbiAgLmxpdmVJbmRpY2F0b3IuZW5kZWQge1xuICAgIGN1cnNvcjogZGVmYXVsdDsgfVxuICAubGl2ZUluZGljYXRvcjpob3Zlcjpub3QoLmVuZGVkKSwgLmxpdmVJbmRpY2F0b3IuYWN0aXZlIHtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZWE0OTJlOyB9XG5cbi5jbGlja2FibGUge1xuICBjdXJzb3I6IHBvaW50ZXI7IH1cblxuYnV0dG9uLmxpdmVJbmRpY2F0b3JCdXR0b24ge1xuICBmb250LXNpemU6IDEycHg7XG4gIGxpbmUtaGVpZ2h0OiAxNHB4O1xuICBwYWRkaW5nOiA1cHggNnB4O1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgdGV4dC10cmFuc2Zvcm06IHVwcGVyY2FzZSAhaW1wb3J0YW50O1xuICBjb2xvcjogI2ZmZjtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiMjgwcHhcIl0gYnV0dG9uLmxpdmVJbmRpY2F0b3JCdXR0b24ge1xuICAgIGZvbnQtc2l6ZTogMTBweDtcbiAgICBsaW5lLWhlaWdodDogMTJweDsgfVxuIl19 */";
    var styles$9 = {"controlButton":"live-indicator__controlButton___1FH60","hidden":"live-indicator__hidden___1MQc0","liveIndicator":"live-indicator__liveIndicator___3Vudz","ended":"live-indicator__ended___18KqE","active":"live-indicator__active___2Lobb","clickable":"live-indicator__clickable___2efwz","liveIndicatorButton":"live-indicator__liveIndicatorButton___fQcZU"};
    styleInject(css$9);

    var LiveIndicatorView = /** @class */ (function (_super) {
        __extends(LiveIndicatorView, _super);
        function LiveIndicatorView(config) {
            var _this = _super.call(this) || this;
            _this._callbacks = config.callbacks;
            _this._textMap = config.textMap;
            _this._tooltipService = config.tooltipService;
            _this._initDOM();
            _this._bindEvents();
            return _this;
        }
        LiveIndicatorView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(liveIndicatorTemplate({
                styles: this.styleNames,
                themeStyles: this.themeStyles,
                texts: {},
            }));
            this._$button = getElementByHook(this._$rootElement, 'live-indicator-button');
            this._tooltipReference = this._tooltipService.createReference(this._$button, {
                text: this._textMap.get(TextLabel$1.LIVE_SYNC_TOOLTIP),
            });
            // NOTE: LIVE indicator is hidden and inactive by default
            this.toggle(false);
            this.toggleActive(false);
            this.toggleEnded(false);
        };
        LiveIndicatorView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._callbacks.onClick);
        };
        LiveIndicatorView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._callbacks.onClick);
        };
        LiveIndicatorView.prototype.toggleActive = function (shouldActivate) {
            toggleElementClass(this._$rootElement, this.styleNames.active, shouldActivate);
            toggleElementClass(this._$button, this.styleNames.clickable, !shouldActivate);
            // NOTE: disable tooltip while video is sync with live
            if (shouldActivate) {
                this._$button.setAttribute('disabled', 'true');
                this._tooltipReference.disable();
            }
            else {
                this._$button.removeAttribute('disabled');
                this._tooltipReference.enable();
            }
        };
        LiveIndicatorView.prototype.toggleEnded = function (isEnded) {
            toggleElementClass(this._$rootElement, this.styleNames.ended, isEnded);
            this._$button.innerText = this._textMap.get(TextLabel$1.LIVE_INDICATOR_TEXT, {
                isEnded: isEnded,
            });
            this._$button.setAttribute('aria-label', !isEnded ? this._textMap.get(TextLabel$1.LIVE_SYNC_LABEL) : '');
            this._$button.setAttribute('disabled', 'true');
            if (isEnded) {
                this._tooltipReference.disable();
            }
            else {
                this._tooltipReference.enable();
            }
        };
        LiveIndicatorView.prototype.show = function () {
            this.toggle(true);
        };
        LiveIndicatorView.prototype.hide = function () {
            this.toggle(false);
        };
        LiveIndicatorView.prototype.toggle = function (shouldShow) {
            toggleElementClass(this._$rootElement, this.styleNames.hidden, !shouldShow);
        };
        LiveIndicatorView.prototype.getElement = function () {
            return this._$rootElement;
        };
        LiveIndicatorView.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$button = null;
        };
        return LiveIndicatorView;
    }(View));
    LiveIndicatorView.extendStyleNames(styles$9);

    var LiveIndicator = /** @class */ (function () {
        function LiveIndicator(_a) {
            var engine = _a.engine, eventEmitter = _a.eventEmitter, textMap = _a.textMap, tooltipService = _a.tooltipService;
            this._isHidden = true;
            this._isActive = false;
            this._isEnded = false;
            this._engine = engine;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._tooltipService = tooltipService;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this._initInterceptor();
        }
        LiveIndicator.prototype.getElement = function () {
            return this.view.getElement();
        };
        LiveIndicator.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._syncWithLive();
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._syncWithLive();
                }, _a));
        };
        Object.defineProperty(LiveIndicator.prototype, "isHidden", {
            get: function () {
                return this._isHidden;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LiveIndicator.prototype, "isActive", {
            get: function () {
                return this._isActive;
            },
            enumerable: true,
            configurable: true
        });
        LiveIndicator.prototype.show = function () {
            this._toggle(true);
        };
        LiveIndicator.prototype.hide = function () {
            this._toggle(false);
        };
        LiveIndicator.prototype._initUI = function () {
            this.view = new LiveIndicator.View({
                callbacks: {
                    onClick: this._syncWithLive,
                },
                textMap: this._textMap,
                tooltipService: this._tooltipService,
            });
        };
        LiveIndicator.prototype._bindCallbacks = function () {
            this._syncWithLive = this._syncWithLive.bind(this);
        };
        LiveIndicator.prototype._bindEvents = function () {
            var _this = this;
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.LIVE_STATE_CHANGED, this._processStateChange],
                [
                    UIEvent$1.PROGRESS_SYNC_BUTTON_MOUSE_ENTER,
                    function () {
                        _this.view.toggleActive(true);
                    },
                ],
                [
                    UIEvent$1.PROGRESS_SYNC_BUTTON_MOUSE_LEAVE,
                    function () {
                        // NOTE: restore state before mouse enter
                        _this.view.toggleActive(_this._isActive);
                    },
                ],
            ], this);
        };
        LiveIndicator.prototype._processStateChange = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case LiveState$1.NONE:
                    this._toggle(false);
                    this._toggleActive(false);
                    this._toggleEnded(false);
                    break;
                case LiveState$1.INITIAL:
                    this._toggle(true);
                    break;
                case LiveState$1.SYNC:
                    this._toggleActive(true);
                    break;
                case LiveState$1.NOT_SYNC:
                    this._toggleActive(false);
                    break;
                case LiveState$1.ENDED:
                    this._toggleActive(false);
                    this._toggleEnded(true);
                    break;
                default:
                    break;
            }
        };
        LiveIndicator.prototype._syncWithLive = function () {
            if (!this._isEnded) {
                this._engine.syncWithLive();
            }
        };
        LiveIndicator.prototype._toggle = function (shouldShow) {
            this._isHidden = !shouldShow;
            this.view.toggle(shouldShow);
        };
        LiveIndicator.prototype._toggleActive = function (shouldActivate) {
            this._isActive = shouldActivate;
            this.view.toggleActive(shouldActivate);
        };
        LiveIndicator.prototype._toggleEnded = function (isEnded) {
            this._isEnded = isEnded;
            this.view.toggleEnded(isEnded);
        };
        LiveIndicator.prototype.destroy = function () {
            this._unbindEvents();
            this._interceptor.destroy();
            this.view.destroy();
        };
        LiveIndicator.moduleName = 'liveIndicator';
        LiveIndicator.View = LiveIndicatorView;
        LiveIndicator.dependencies = ['engine', 'eventEmitter', 'textMap', 'tooltipService'];
        return LiveIndicator;
    }());

    function dot_tpl_src_modules_ui_bottomBlock_templates_bottomBlock_dot(props
    ) {
    var out='<div data-webplayer-hook="bottom-block" class="'+(props.styles.bottomBlock)+'"> <div class="'+(props.styles.background)+'" data-webplayer-hook="screen-bottom-background"> </div> <div class="'+(props.styles.progressBarContainer)+'" data-webplayer-hook="progress-bar-container"> </div> <div class="'+(props.styles.elementsContainer)+'"> <div class="'+(props.styles.controlsContainerLeft)+'" data-webplayer-hook="controls-container-left"> <div class="'+(props.styles.playContainer)+'" data-webplayer-hook="play-container"> </div> <div class="'+(props.styles.volumeContainer)+'" data-webplayer-hook="volume-container"> </div> <div class="'+(props.styles.timeContainer)+'" data-webplayer-hook="time-container"> </div> </div> <div class="'+(props.styles.controlsContainerRight)+'" data-webplayer-hook="controls-container-right"> <div class="'+(props.styles.pictureInPictureContainer)+'" data-webplayer-hook="picture-in-picture-container"> </div> <div class="'+(props.styles.downloadContainer)+'" data-webplayer-hook="download-container"> </div> <div class="'+(props.styles.fullScreenContainer)+'" data-webplayer-hook="full-screen-container"> </div> </div> <div class="'+(props.styles.logoContainer)+'" data-webplayer-hook="logo-container"> </div> </div></div>';return out;
    }

    var bottomBlockTemplate = dot_tpl_src_modules_ui_bottomBlock_templates_bottomBlock_dot.default ? dot_tpl_src_modules_ui_bottomBlock_templates_bottomBlock_dot.default : dot_tpl_src_modules_ui_bottomBlock_templates_bottomBlock_dot;

    var css$10 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.bottom-block__controlButton___2zYHZ {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.bottom-block__controlButton___2zYHZ:hover {\n    opacity: .7; }\n.bottom-block__hidden___361S0 {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.bottom-block__bottomBlock___3Y_rW {\n  z-index: 60;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column; }\n.bottom-block__bottomBlock___3Y_rW::-moz-focus-inner {\n    border: 0; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__activated___YvJ-R .bottom-block__progressBarContainer___2CxAg,\n  .bottom-block__bottomBlock___3Y_rW.bottom-block__activated___YvJ-R .bottom-block__controlsContainerLeft___2Ozxp,\n  .bottom-block__bottomBlock___3Y_rW.bottom-block__activated___YvJ-R .bottom-block__controlsContainerRight___qaM9T,\n  .bottom-block__bottomBlock___3Y_rW.bottom-block__activated___YvJ-R .bottom-block__logoContainer___1esHz,\n  .bottom-block__bottomBlock___3Y_rW.bottom-block__activated___YvJ-R .bottom-block__background___2ZL6j {\n    opacity: 1; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__showLogoAlways___2bJeD .bottom-block__logoContainer___1esHz {\n    opacity: 1; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__logoHidden___2N6oy .bottom-block__fullScreenContainer___3q_py {\n    margin-right: 14px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .bottom-block__bottomBlock___3Y_rW.bottom-block__logoHidden___2N6oy .bottom-block__fullScreenContainer___3q_py {\n      margin-right: 7px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__bottomBlock___3Y_rW.bottom-block__logoHidden___2N6oy .bottom-block__fullScreenContainer___3q_py {\n      margin-right: 25px; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__logoHidden___2N6oy .bottom-block__logoContainer___1esHz {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__playControlHidden___1mEi9 .bottom-block__playContainer___25g5A {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__timeControlHidden___32pcE .bottom-block__timeContainer___2N6cy {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__volumeControlHidden___41JXw .bottom-block__volumeContainer___1Zwk- {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__fullScreenControlHidden___1jT2c .bottom-block__fullScreenContainer___3q_py {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__progressControlHidden___1rhHL .bottom-block__progressBarContainer___2CxAg {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__downloadButtonHidden___qisqf .bottom-block__downloadContainer___2Gxyu {\n    display: none; }\n.bottom-block__bottomBlock___3Y_rW.bottom-block__pictureInPictureButtonHidden___WY-f5 .bottom-block__pictureInPictureContainer___tOmqU {\n    display: none; }\n.bottom-block__elementsContainer___1MGej {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  width: 100%;\n  -webkit-box-flex: 2;\n      -ms-flex-positive: 2;\n          flex-grow: 2; }\n.bottom-block__progressBarContainer___2CxAg {\n  position: relative;\n  top: 2px;\n  padding: 0 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__progressBarContainer___2CxAg {\n    top: 3px;\n    padding: 0 30px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .bottom-block__progressBarContainer___2CxAg {\n    padding: 0 15px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] .bottom-block__progressBarContainer___2CxAg {\n    padding: 0 12px; }\n.bottom-block__progressBarContainer___2CxAg,\n.bottom-block__controlsContainerLeft___2Ozxp,\n.bottom-block__controlsContainerRight___qaM9T,\n.bottom-block__logoContainer___1esHz {\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  opacity: 0; }\n.bottom-block__controlsContainerRight___qaM9T,\n.bottom-block__controlsContainerLeft___2Ozxp {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n  width: 100%;\n  max-width: 100%;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.bottom-block__controlsContainerRight___qaM9T {\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end; }\n.bottom-block__controlsContainerRight___qaM9T,\n.bottom-block__controlsContainerLeft___2Ozxp,\n.bottom-block__logoContainer___1esHz {\n  height: 54px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__controlsContainerRight___qaM9T, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"]\n  .bottom-block__controlsContainerLeft___2Ozxp, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"]\n  .bottom-block__logoContainer___1esHz {\n    height: 80px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .bottom-block__controlsContainerRight___qaM9T, [data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"]\n  .bottom-block__controlsContainerLeft___2Ozxp, [data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"]\n  .bottom-block__logoContainer___1esHz {\n    height: 42px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"350px\"] .bottom-block__controlsContainerRight___qaM9T, [data-webplayer-hook='player-container'][data-webplayer-max-width~=\"350px\"]\n  .bottom-block__controlsContainerLeft___2Ozxp, [data-webplayer-hook='player-container'][data-webplayer-max-width~=\"350px\"]\n  .bottom-block__logoContainer___1esHz {\n    height: 36px; }\n.bottom-block__playContainer___25g5A {\n  margin-right: 8px;\n  margin-left: 13px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__playContainer___25g5A {\n    margin-right: 20px;\n    margin-left: 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .bottom-block__playContainer___25g5A {\n    margin-left: 7px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] .bottom-block__playContainer___25g5A {\n    margin-left: 4px; }\n.bottom-block__volumeContainer___1Zwk- {\n  margin-right: 13px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__volumeContainer___1Zwk- {\n    margin-right: 20px; }\n.bottom-block__timeContainer___2N6cy {\n  margin-right: 18px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__timeContainer___2N6cy {\n    margin-right: 30px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"400px\"] .bottom-block__timeContainer___2N6cy {\n    display: none; }\n.bottom-block__downloadContainer___2Gxyu {\n  margin-right: 8px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__downloadContainer___2Gxyu {\n    margin-right: 18px; }\n.bottom-block__fullScreenContainer___3q_py {\n  margin-right: 8px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__fullScreenContainer___3q_py {\n    margin-right: 18px; }\n.bottom-block__pictureInPictureContainer___tOmqU {\n  margin-right: 8px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__pictureInPictureContainer___tOmqU {\n    margin-right: 18px; }\n.bottom-block__logoContainer___1esHz {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin-right: 14px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .bottom-block__logoContainer___1esHz {\n    margin-right: 9px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__logoContainer___1esHz {\n    margin-right: 23px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"280px\"] .bottom-block__logoContainer___1esHz {\n    margin-right: 12px; }\n.bottom-block__additionalButton___39M0e {\n  margin-right: 8px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .bottom-block__additionalButton___39M0e {\n    margin-right: 18px; }\n.bottom-block__background___2ZL6j {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  height: 181px;\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  pointer-events: none;\n  opacity: 0;\n  background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0)), color-stop(24%, rgba(0, 0, 0, 0.03)), color-stop(50%, rgba(0, 0, 0, 0.15)), color-stop(75%, rgba(0, 0, 0, 0.3)), to(rgba(0, 0, 0, 0.4)));\n  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.03) 24%, rgba(0, 0, 0, 0.15) 50%, rgba(0, 0, 0, 0.3) 75%, rgba(0, 0, 0, 0.4));\n  background-size: 100% 182px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJvdHRvbS1ibG9jay5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLFlBQVk7RUFDWixxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLDZCQUF1QjtFQUF2Qiw4QkFBdUI7TUFBdkIsMkJBQXVCO1VBQXZCLHVCQUF1QixFQUFFO0FBQ3pCO0lBQ0UsVUFBVSxFQUFFO0FBQ2Q7Ozs7O0lBS0UsV0FBVyxFQUFFO0FBQ2Y7SUFDRSxXQUFXLEVBQUU7QUFDZjtJQUNFLG1CQUFtQixFQUFFO0FBQ3JCO01BQ0Usa0JBQWtCLEVBQUU7QUFDdEI7TUFDRSxtQkFBbUIsRUFBRTtBQUN6QjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGNBQWMsRUFBRTtBQUVwQjtFQUNFLG1CQUFtQjtFQUNuQixxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFlBQVk7RUFDWixvQkFBYTtNQUFiLHFCQUFhO1VBQWIsYUFBYSxFQUFFO0FBRWpCO0VBQ0UsbUJBQW1CO0VBQ25CLFNBQVM7RUFDVCxnQkFBZ0IsRUFBRTtBQUNsQjtJQUNFLFNBQVM7SUFDVCxnQkFBZ0IsRUFBRTtBQUNwQjtJQUNFLGdCQUFnQixFQUFFO0FBQ3BCO0lBQ0UsZ0JBQWdCLEVBQUU7QUFFdEI7Ozs7RUFJRSxnQ0FBd0I7RUFBeEIsd0JBQXdCO0VBQ3hCLFdBQVcsRUFBRTtBQUVmOztFQUVFLG1CQUFtQjtFQUNuQixxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLG9CQUFRO01BQVIsWUFBUTtVQUFSLFFBQVE7RUFDUixZQUFZO0VBQ1osZ0JBQWdCO0VBQ2hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFFeEI7RUFDRSxzQkFBMEI7TUFBMUIsbUJBQTBCO1VBQTFCLDBCQUEwQixFQUFFO0FBRTlCOzs7RUFHRSxhQUFhLEVBQUU7QUFDZjs7O0lBR0UsYUFBYSxFQUFFO0FBQ2pCOzs7SUFHRSxhQUFhLEVBQUU7QUFDakI7OztJQUdFLGFBQWEsRUFBRTtBQUVuQjtFQUNFLGtCQUFrQjtFQUNsQixrQkFBa0IsRUFBRTtBQUNwQjtJQUNFLG1CQUFtQjtJQUNuQixrQkFBa0IsRUFBRTtBQUN0QjtJQUNFLGlCQUFpQixFQUFFO0FBQ3JCO0lBQ0UsaUJBQWlCLEVBQUU7QUFFdkI7RUFDRSxtQkFBbUIsRUFBRTtBQUNyQjtJQUNFLG1CQUFtQixFQUFFO0FBRXpCO0VBQ0UsbUJBQW1CLEVBQUU7QUFDckI7SUFDRSxtQkFBbUIsRUFBRTtBQUN2QjtJQUNFLGNBQWMsRUFBRTtBQUVwQjtFQUNFLGtCQUFrQixFQUFFO0FBQ3BCO0lBQ0UsbUJBQW1CLEVBQUU7QUFFekI7RUFDRSxrQkFBa0IsRUFBRTtBQUNwQjtJQUNFLG1CQUFtQixFQUFFO0FBRXpCO0VBQ0Usa0JBQWtCLEVBQUU7QUFDcEI7SUFDRSxtQkFBbUIsRUFBRTtBQUV6QjtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsbUJBQW1CLEVBQUU7QUFDckI7SUFDRSxrQkFBa0IsRUFBRTtBQUN0QjtJQUNFLG1CQUFtQixFQUFFO0FBQ3ZCO0lBQ0UsbUJBQW1CLEVBQUU7QUFFekI7RUFDRSxrQkFBa0IsRUFBRTtBQUNwQjtJQUNFLG1CQUFtQixFQUFFO0FBRXpCO0VBQ0UsbUJBQW1CO0VBQ25CLFNBQVM7RUFDVCxVQUFVO0VBQ1YsUUFBUTtFQUNSLGNBQWM7RUFDZCxnQ0FBd0I7RUFBeEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQixXQUFXO0VBQ1gsbU9BQTZKO0VBQTdKLDZKQUE2SjtFQUM3Siw0QkFBNEIsRUFBRSIsImZpbGUiOiJib3R0b20tYmxvY2suc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4uYm90dG9tQmxvY2sge1xuICB6LWluZGV4OiA2MDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsgfVxuICAuYm90dG9tQmxvY2s6Oi1tb3otZm9jdXMtaW5uZXIge1xuICAgIGJvcmRlcjogMDsgfVxuICAuYm90dG9tQmxvY2suYWN0aXZhdGVkIC5wcm9ncmVzc0JhckNvbnRhaW5lcixcbiAgLmJvdHRvbUJsb2NrLmFjdGl2YXRlZCAuY29udHJvbHNDb250YWluZXJMZWZ0LFxuICAuYm90dG9tQmxvY2suYWN0aXZhdGVkIC5jb250cm9sc0NvbnRhaW5lclJpZ2h0LFxuICAuYm90dG9tQmxvY2suYWN0aXZhdGVkIC5sb2dvQ29udGFpbmVyLFxuICAuYm90dG9tQmxvY2suYWN0aXZhdGVkIC5iYWNrZ3JvdW5kIHtcbiAgICBvcGFjaXR5OiAxOyB9XG4gIC5ib3R0b21CbG9jay5zaG93TG9nb0Fsd2F5cyAubG9nb0NvbnRhaW5lciB7XG4gICAgb3BhY2l0eTogMTsgfVxuICAuYm90dG9tQmxvY2subG9nb0hpZGRlbiAuZnVsbFNjcmVlbkNvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxNHB4OyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdIC5ib3R0b21CbG9jay5sb2dvSGlkZGVuIC5mdWxsU2NyZWVuQ29udGFpbmVyIHtcbiAgICAgIG1hcmdpbi1yaWdodDogN3B4OyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5ib3R0b21CbG9jay5sb2dvSGlkZGVuIC5mdWxsU2NyZWVuQ29udGFpbmVyIHtcbiAgICAgIG1hcmdpbi1yaWdodDogMjVweDsgfVxuICAuYm90dG9tQmxvY2subG9nb0hpZGRlbiAubG9nb0NvbnRhaW5lciB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAuYm90dG9tQmxvY2sucGxheUNvbnRyb2xIaWRkZW4gLnBsYXlDb250YWluZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgLmJvdHRvbUJsb2NrLnRpbWVDb250cm9sSGlkZGVuIC50aW1lQ29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG4gIC5ib3R0b21CbG9jay52b2x1bWVDb250cm9sSGlkZGVuIC52b2x1bWVDb250YWluZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgLmJvdHRvbUJsb2NrLmZ1bGxTY3JlZW5Db250cm9sSGlkZGVuIC5mdWxsU2NyZWVuQ29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG4gIC5ib3R0b21CbG9jay5wcm9ncmVzc0NvbnRyb2xIaWRkZW4gLnByb2dyZXNzQmFyQ29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG4gIC5ib3R0b21CbG9jay5kb3dubG9hZEJ1dHRvbkhpZGRlbiAuZG93bmxvYWRDb250YWluZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgLmJvdHRvbUJsb2NrLnBpY3R1cmVJblBpY3R1cmVCdXR0b25IaWRkZW4gLnBpY3R1cmVJblBpY3R1cmVDb250YWluZXIge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cblxuLmVsZW1lbnRzQ29udGFpbmVyIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICB3aWR0aDogMTAwJTtcbiAgZmxleC1ncm93OiAyOyB9XG5cbi5wcm9ncmVzc0JhckNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgdG9wOiAycHg7XG4gIHBhZGRpbmc6IDAgMjBweDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLnByb2dyZXNzQmFyQ29udGFpbmVyIHtcbiAgICB0b3A6IDNweDtcbiAgICBwYWRkaW5nOiAwIDMwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdIC5wcm9ncmVzc0JhckNvbnRhaW5lciB7XG4gICAgcGFkZGluZzogMCAxNXB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCIyODBweFwiXSAucHJvZ3Jlc3NCYXJDb250YWluZXIge1xuICAgIHBhZGRpbmc6IDAgMTJweDsgfVxuXG4ucHJvZ3Jlc3NCYXJDb250YWluZXIsXG4uY29udHJvbHNDb250YWluZXJMZWZ0LFxuLmNvbnRyb2xzQ29udGFpbmVyUmlnaHQsXG4ubG9nb0NvbnRhaW5lciB7XG4gIHRyYW5zaXRpb246IG9wYWNpdHkgLjJzO1xuICBvcGFjaXR5OiAwOyB9XG5cbi5jb250cm9sc0NvbnRhaW5lclJpZ2h0LFxuLmNvbnRyb2xzQ29udGFpbmVyTGVmdCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleDogMTtcbiAgd2lkdGg6IDEwMCU7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuXG4uY29udHJvbHNDb250YWluZXJSaWdodCB7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1lbmQ7IH1cblxuLmNvbnRyb2xzQ29udGFpbmVyUmlnaHQsXG4uY29udHJvbHNDb250YWluZXJMZWZ0LFxuLmxvZ29Db250YWluZXIge1xuICBoZWlnaHQ6IDU0cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5jb250cm9sc0NvbnRhaW5lclJpZ2h0LCBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl1cbiAgLmNvbnRyb2xzQ29udGFpbmVyTGVmdCwgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdXG4gIC5sb2dvQ29udGFpbmVyIHtcbiAgICBoZWlnaHQ6IDgwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdIC5jb250cm9sc0NvbnRhaW5lclJpZ2h0LCBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiNTUwcHhcIl1cbiAgLmNvbnRyb2xzQ29udGFpbmVyTGVmdCwgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdXG4gIC5sb2dvQ29udGFpbmVyIHtcbiAgICBoZWlnaHQ6IDQycHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjM1MHB4XCJdIC5jb250cm9sc0NvbnRhaW5lclJpZ2h0LCBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiMzUwcHhcIl1cbiAgLmNvbnRyb2xzQ29udGFpbmVyTGVmdCwgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjM1MHB4XCJdXG4gIC5sb2dvQ29udGFpbmVyIHtcbiAgICBoZWlnaHQ6IDM2cHg7IH1cblxuLnBsYXlDb250YWluZXIge1xuICBtYXJnaW4tcmlnaHQ6IDhweDtcbiAgbWFyZ2luLWxlZnQ6IDEzcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5wbGF5Q29udGFpbmVyIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDIwcHg7XG4gICAgbWFyZ2luLWxlZnQ6IDIwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdIC5wbGF5Q29udGFpbmVyIHtcbiAgICBtYXJnaW4tbGVmdDogN3B4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLW1heC13aWR0aH49XCIyODBweFwiXSAucGxheUNvbnRhaW5lciB7XG4gICAgbWFyZ2luLWxlZnQ6IDRweDsgfVxuXG4udm9sdW1lQ29udGFpbmVyIHtcbiAgbWFyZ2luLXJpZ2h0OiAxM3B4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudm9sdW1lQ29udGFpbmVyIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDIwcHg7IH1cblxuLnRpbWVDb250YWluZXIge1xuICBtYXJnaW4tcmlnaHQ6IDE4cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC50aW1lQ29udGFpbmVyIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDMwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjQwMHB4XCJdIC50aW1lQ29udGFpbmVyIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG5cbi5kb3dubG9hZENvbnRhaW5lciB7XG4gIG1hcmdpbi1yaWdodDogOHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuZG93bmxvYWRDb250YWluZXIge1xuICAgIG1hcmdpbi1yaWdodDogMThweDsgfVxuXG4uZnVsbFNjcmVlbkNvbnRhaW5lciB7XG4gIG1hcmdpbi1yaWdodDogOHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuZnVsbFNjcmVlbkNvbnRhaW5lciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxOHB4OyB9XG5cbi5waWN0dXJlSW5QaWN0dXJlQ29udGFpbmVyIHtcbiAgbWFyZ2luLXJpZ2h0OiA4cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5waWN0dXJlSW5QaWN0dXJlQ29udGFpbmVyIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDE4cHg7IH1cblxuLmxvZ29Db250YWluZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBtYXJnaW4tcmlnaHQ6IDE0cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjU1MHB4XCJdIC5sb2dvQ29udGFpbmVyIHtcbiAgICBtYXJnaW4tcmlnaHQ6IDlweDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLmxvZ29Db250YWluZXIge1xuICAgIG1hcmdpbi1yaWdodDogMjNweDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiMjgwcHhcIl0gLmxvZ29Db250YWluZXIge1xuICAgIG1hcmdpbi1yaWdodDogMTJweDsgfVxuXG4uYWRkaXRpb25hbEJ1dHRvbiB7XG4gIG1hcmdpbi1yaWdodDogOHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuYWRkaXRpb25hbEJ1dHRvbiB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxOHB4OyB9XG5cbi5iYWNrZ3JvdW5kIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBsZWZ0OiAwO1xuICBoZWlnaHQ6IDE4MXB4O1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycztcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIG9wYWNpdHk6IDA7XG4gIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudCh0byBib3R0b20sIHJnYmEoMCwgMCwgMCwgMCksIHJnYmEoMCwgMCwgMCwgMC4wMykgMjQlLCByZ2JhKDAsIDAsIDAsIDAuMTUpIDUwJSwgcmdiYSgwLCAwLCAwLCAwLjMpIDc1JSwgcmdiYSgwLCAwLCAwLCAwLjQpKTtcbiAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDE4MnB4OyB9XG4iXX0= */";
    var styles$10 = {"controlButton":"bottom-block__controlButton___2zYHZ","hidden":"bottom-block__hidden___361S0","bottomBlock":"bottom-block__bottomBlock___3Y_rW","activated":"bottom-block__activated___YvJ-R","progressBarContainer":"bottom-block__progressBarContainer___2CxAg","controlsContainerLeft":"bottom-block__controlsContainerLeft___2Ozxp","controlsContainerRight":"bottom-block__controlsContainerRight___qaM9T","logoContainer":"bottom-block__logoContainer___1esHz","background":"bottom-block__background___2ZL6j","showLogoAlways":"bottom-block__showLogoAlways___2bJeD","logoHidden":"bottom-block__logoHidden___2N6oy","fullScreenContainer":"bottom-block__fullScreenContainer___3q_py","playControlHidden":"bottom-block__playControlHidden___1mEi9","playContainer":"bottom-block__playContainer___25g5A","timeControlHidden":"bottom-block__timeControlHidden___32pcE","timeContainer":"bottom-block__timeContainer___2N6cy","volumeControlHidden":"bottom-block__volumeControlHidden___41JXw","volumeContainer":"bottom-block__volumeContainer___1Zwk-","fullScreenControlHidden":"bottom-block__fullScreenControlHidden___1jT2c","progressControlHidden":"bottom-block__progressControlHidden___1rhHL","downloadButtonHidden":"bottom-block__downloadButtonHidden___qisqf","downloadContainer":"bottom-block__downloadContainer___2Gxyu","pictureInPictureButtonHidden":"bottom-block__pictureInPictureButtonHidden___WY-f5","pictureInPictureContainer":"bottom-block__pictureInPictureContainer___tOmqU","elementsContainer":"bottom-block__elementsContainer___1MGej","additionalButton":"bottom-block__additionalButton___39M0e"};
    styleInject(css$10);

    var BottomBlockView = /** @class */ (function (_super) {
        __extends(BottomBlockView, _super);
        function BottomBlockView(config) {
            var _this = _super.call(this) || this;
            var callbacks = config.callbacks, elements = config.elements;
            _this._callbacks = callbacks;
            _this._initDOM(elements);
            _this._bindEvents();
            return _this;
        }
        BottomBlockView.prototype._initDOM = function (elements) {
            this._$rootElement = htmlToElement(bottomBlockTemplate({
                styles: this.styleNames,
            }));
            this._$leftControllsContainer = getElementByHook(this._$rootElement, 'controls-container-left');
            this._$rightControllsContainer = getElementByHook(this._$rootElement, 'controls-container-right');
            var $playContainer = getElementByHook(this._$rootElement, 'play-container');
            var $volumeContainer = getElementByHook(this._$rootElement, 'volume-container');
            var $timeContainer = getElementByHook(this._$rootElement, 'time-container');
            var $fullScreenContainer = getElementByHook(this._$rootElement, 'full-screen-container');
            var $logoContainer = getElementByHook(this._$rootElement, 'logo-container');
            var $progressBarContainer = getElementByHook(this._$rootElement, 'progress-bar-container');
            var $downloadContainer = getElementByHook(this._$rootElement, 'download-container');
            var $pictureInPictureContainer = getElementByHook(this._$rootElement, 'picture-in-picture-container');
            $playContainer.appendChild(elements.play);
            $volumeContainer.appendChild(elements.volume);
            $timeContainer.appendChild(elements.time);
            $fullScreenContainer.appendChild(elements.fullScreen);
            $logoContainer.appendChild(elements.logo);
            $progressBarContainer.appendChild(elements.progress);
            $downloadContainer.appendChild(elements.download);
            $pictureInPictureContainer.appendChild(elements.pictureInPicture);
        };
        BottomBlockView.prototype._preventClickPropagation = function (e) {
            e.stopPropagation();
        };
        BottomBlockView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._preventClickPropagation);
            this._$rootElement.addEventListener('mousemove', this._callbacks.onBlockMouseMove);
            this._$rootElement.addEventListener('mouseleave', this._callbacks.onBlockMouseOut);
        };
        BottomBlockView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._preventClickPropagation);
            this._$rootElement.removeEventListener('mousemove', this._callbacks.onBlockMouseMove);
            this._$rootElement.removeEventListener('mouseleave', this._callbacks.onBlockMouseOut);
        };
        BottomBlockView.prototype.addControl = function (key, element, position) {
            var wrapper = document.createElement('div');
            wrapper.setAttribute('data-webplayer-hook', "additional-" + key);
            wrapper.classList.add(this.styleNames.additionalButton);
            wrapper.appendChild(element);
            if (position === 'left') {
                this._$leftControllsContainer.appendChild(wrapper);
                return;
            }
            this._$rightControllsContainer.insertBefore(wrapper, this._$rightControllsContainer.children[0]);
        };
        BottomBlockView.prototype.setShouldLogoShowAlwaysFlag = function (isShowAlways) {
            toggleElementClass(this._$rootElement, this.styleNames.showLogoAlways, isShowAlways);
            this.showLogo();
        };
        BottomBlockView.prototype.showPlayControl = function () {
            this._$rootElement.classList.remove(this.styleNames.playControlHidden);
        };
        BottomBlockView.prototype.hidePlayControl = function () {
            this._$rootElement.classList.add(this.styleNames.playControlHidden);
        };
        BottomBlockView.prototype.showTimeControl = function () {
            this._$rootElement.classList.remove(this.styleNames.timeControlHidden);
        };
        BottomBlockView.prototype.hideTimeControl = function () {
            this._$rootElement.classList.add(this.styleNames.timeControlHidden);
        };
        BottomBlockView.prototype.showVolumeControl = function () {
            this._$rootElement.classList.remove(this.styleNames.volumeControlHidden);
        };
        BottomBlockView.prototype.hideVolumeControl = function () {
            this._$rootElement.classList.add(this.styleNames.volumeControlHidden);
        };
        BottomBlockView.prototype.showFullScreenControl = function () {
            this._$rootElement.classList.remove(this.styleNames.fullScreenControlHidden);
        };
        BottomBlockView.prototype.hideFullScreenControl = function () {
            this._$rootElement.classList.add(this.styleNames.fullScreenControlHidden);
        };
        BottomBlockView.prototype.showLogo = function () {
            this._$rootElement.classList.remove(this.styleNames.logoHidden);
        };
        BottomBlockView.prototype.hideLogo = function () {
            this._$rootElement.classList.add(this.styleNames.logoHidden);
        };
        BottomBlockView.prototype.showProgressControl = function () {
            this._$rootElement.classList.remove(this.styleNames.progressControlHidden);
        };
        BottomBlockView.prototype.hideProgressControl = function () {
            this._$rootElement.classList.add(this.styleNames.progressControlHidden);
        };
        BottomBlockView.prototype.showDownloadButton = function () {
            this._$rootElement.classList.remove(this.styleNames.downloadButtonHidden);
        };
        BottomBlockView.prototype.hidePictureInPictureControl = function () {
            this._$rootElement.classList.add(this.styleNames.pictureInPictureButtonHidden);
        };
        BottomBlockView.prototype.showPictureInPictureControl = function () {
            this._$rootElement.classList.remove(this.styleNames.pictureInPictureButtonHidden);
        };
        BottomBlockView.prototype.hideDownloadButton = function () {
            this._$rootElement.classList.add(this.styleNames.downloadButtonHidden);
        };
        BottomBlockView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        BottomBlockView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        BottomBlockView.prototype.getElement = function () {
            return this._$rootElement;
        };
        BottomBlockView.prototype.showContent = function () {
            this._$rootElement.classList.add(this.styleNames.activated);
        };
        BottomBlockView.prototype.hideContent = function () {
            this._$rootElement.classList.remove(this.styleNames.activated);
        };
        BottomBlockView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
        };
        return BottomBlockView;
    }(View));
    BottomBlockView.extendStyleNames(styles$10);

    var BottomBlock = /** @class */ (function () {
        function BottomBlock(dependencies) {
            this._isBlockFocused = false;
            this.isHidden = false;
            var eventEmitter = dependencies.eventEmitter;
            this._eventEmitter = eventEmitter;
            this._bindViewCallbacks();
            this._initUI(this._getControlElements(dependencies));
            this._bindEvents();
        }
        BottomBlock.prototype._getControlElements = function (dependencies) {
            var playControl = dependencies.playControl, progressControl = dependencies.progressControl, timeControl = dependencies.timeControl, volumeControl = dependencies.volumeControl, fullScreenControl = dependencies.fullScreenControl, logo = dependencies.logo, downloadButton = dependencies.downloadButton, pictureInPictureControl = dependencies.pictureInPictureControl;
            return {
                play: playControl.getElement(),
                progress: progressControl.getElement(),
                time: timeControl.getElement(),
                volume: volumeControl.getElement(),
                fullScreen: fullScreenControl.getElement(),
                download: downloadButton.getElement(),
                logo: logo.getElement(),
                pictureInPicture: pictureInPictureControl.getElement(),
            };
        };
        BottomBlock.prototype.getElement = function () {
            return this.view.getElement();
        };
        BottomBlock.prototype.addControl = function (key, element, options) {
            var _a = (options || {}).position, position = _a === void 0 ? 'right' : _a;
            this.view.addControl(key, element, position);
        };
        BottomBlock.prototype._initUI = function (elements) {
            var config = {
                elements: elements,
                callbacks: {
                    onBlockMouseMove: this._setFocusState,
                    onBlockMouseOut: this._removeFocusState,
                },
            };
            this.view = new BottomBlock.View(config);
            this.hideLogo();
            this.hideDownloadButton();
        };
        BottomBlock.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([[UIEvent$1.FULL_SCREEN_STATE_CHANGED, this._removeFocusState]], this);
        };
        BottomBlock.prototype._bindViewCallbacks = function () {
            this._setFocusState = this._setFocusState.bind(this);
            this._removeFocusState = this._removeFocusState.bind(this);
        };
        BottomBlock.prototype._setFocusState = function () {
            this._isBlockFocused = true;
        };
        BottomBlock.prototype._removeFocusState = function () {
            this._isBlockFocused = false;
        };
        Object.defineProperty(BottomBlock.prototype, "isFocused", {
            get: function () {
                return this._isBlockFocused;
            },
            enumerable: true,
            configurable: true
        });
        BottomBlock.prototype.showContent = function () {
            this.view.showContent();
        };
        BottomBlock.prototype.hideContent = function () {
            this.view.hideContent();
        };
        BottomBlock.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        BottomBlock.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        /**
         * Method for allowing logo to be always shown in bottom block
         * @param flag - `true` for showing always
         * @example
         * player.setAlwaysShowLogo(true);
         *
         */
        BottomBlock.prototype.setAlwaysShowLogo = function (flag) {
            this.view.setShouldLogoShowAlwaysFlag(flag);
        };
        /**
         * Method for hiding logo. If you use `setAlwaysShowLogo` or `setControlsShouldAlwaysShow`, logo would automaticaly appear.
         * @example
         * player.hideLogo();
         */
        BottomBlock.prototype.hideLogo = function () {
            this.view.hideLogo();
        };
        /**
         * Method for showing logo.
         * @example
         * player.showLogo();
         */
        BottomBlock.prototype.showLogo = function () {
            this.view.showLogo();
        };
        /**
         * Method for showing play control.
         * @example
         * player.showPlayControl();
         */
        BottomBlock.prototype.showPlayControl = function () {
            this.view.showPlayControl();
        };
        /**
         * Method for showing volume control.
         * @example
         * player.showVolumeControl();
         */
        BottomBlock.prototype.showVolumeControl = function () {
            this.view.showVolumeControl();
        };
        /**
         * Method for showing time control.
         * @example
         * player.showTimeControl();
         */
        BottomBlock.prototype.showTimeControl = function () {
            this.view.showTimeControl();
        };
        /**
         * Method for showing full screen control.
         * @example
         * player.showFullScreenControl();
         */
        BottomBlock.prototype.showFullScreenControl = function () {
            this.view.showFullScreenControl();
        };
        /**
         * Method for showing picture-in-picture control.
         * @example
         * player.showPictureInPictureControl();
         */
        BottomBlock.prototype.showPictureInPictureControl = function () {
            this.view.showPictureInPictureControl();
        };
        /**
         * Method for showing progress control.
         * @example
         * player.showProgressControl();
         */
        BottomBlock.prototype.showProgressControl = function () {
            this.view.showProgressControl();
        };
        /**
         * Method for showing download button.
         * @example
         * player.showDownloadButton();
         */
        BottomBlock.prototype.showDownloadButton = function () {
            this.view.showDownloadButton();
        };
        /**
         * Method for hiding play control.
         * @example
         * player.hidePlayControl();
         */
        BottomBlock.prototype.hidePlayControl = function () {
            this.view.hidePlayControl();
        };
        /**
         * Method for hiding voluem control.
         * @example
         * player.hideVolumeControl();
         */
        BottomBlock.prototype.hideVolumeControl = function () {
            this.view.hideVolumeControl();
        };
        /**
         * Method for hiding time control.
         * @example
         * player.hideTimeControl();
         */
        BottomBlock.prototype.hideTimeControl = function () {
            this.view.hideTimeControl();
        };
        /**
         * Method for hiding full screen control.
         * @example
         * player.hideFullScreenControl();
         */
        BottomBlock.prototype.hideFullScreenControl = function () {
            this.view.hideFullScreenControl();
        };
        /**
         * Method for hiding picture-in-picture control.
         * @example
         * player.hidePictureInPictureControl();
         */
        BottomBlock.prototype.hidePictureInPictureControl = function () {
            this.view.hidePictureInPictureControl();
        };
        /**
         * Method for hiding progress control.
         * @example
         * player.hideProgressControl();
         */
        BottomBlock.prototype.hideProgressControl = function () {
            this.view.hideProgressControl();
        };
        /**
         * Method for hiding download button.
         * @example
         * player.hideDownloadButton();
         */
        BottomBlock.prototype.hideDownloadButton = function () {
            this.view.hideDownloadButton();
        };
        BottomBlock.prototype.destroy = function () {
            this._unbindEvents();
            this.view.destroy();
        };
        BottomBlock.moduleName = 'bottomBlock';
        BottomBlock.View = BottomBlockView;
        BottomBlock.dependencies = [
            'playControl',
            'progressControl',
            'timeControl',
            'volumeControl',
            'fullScreenControl',
            'logo',
            'downloadButton',
            'eventEmitter',
            'pictureInPictureControl',
        ];
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "setAlwaysShowLogo", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideLogo", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showLogo", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showPlayControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showVolumeControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showTimeControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showFullScreenControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showPictureInPictureControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showProgressControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "showDownloadButton", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hidePlayControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideVolumeControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideTimeControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideFullScreenControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hidePictureInPictureControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideProgressControl", null);
        __decorate([
            playerAPI()
        ], BottomBlock.prototype, "hideDownloadButton", null);
        return BottomBlock;
    }());

    function dot_tpl_src_modules_ui_core_tooltip_templates_tooltip_dot(props
    ) {
    var out='<div class="'+(props.styles.tooltip)+'" role="tooltip"> <div class="'+(props.styles.tooltipInner)+'" data-webplayer-hook="tooltip-inner"></div></div>';return out;
    }

    function dot_tpl_src_modules_ui_core_tooltip_templates_tooltipContainer_dot(props
    ) {
    var out='<div class="'+(props.styles.tooltipContainer)+'" data-webplayer-component></div>';return out;
    }

    var tooltipTemplate = dot_tpl_src_modules_ui_core_tooltip_templates_tooltip_dot.default ? dot_tpl_src_modules_ui_core_tooltip_templates_tooltip_dot.default : dot_tpl_src_modules_ui_core_tooltip_templates_tooltip_dot;
    var tooltipContainerTemplate = dot_tpl_src_modules_ui_core_tooltip_templates_tooltipContainer_dot.default
        ? dot_tpl_src_modules_ui_core_tooltip_templates_tooltipContainer_dot.default
        : dot_tpl_src_modules_ui_core_tooltip_templates_tooltipContainer_dot;

    var css$11 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.tooltip__controlButton___E3x3L {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.tooltip__controlButton___E3x3L:hover {\n    opacity: .7; }\n.tooltip__hidden___3R_Au {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.tooltip__tooltip___1TO08 {\n  position: absolute;\n  z-index: 100;\n  visibility: hidden;\n  -webkit-transition: opacity .2s, visibility .2s;\n  transition: opacity .2s, visibility .2s;\n  opacity: 0; }\n.tooltip__tooltip___1TO08.tooltip__showAsText___3-qca {\n    padding: 4px 5px;\n    background: rgba(0, 0, 0, 0.5); }\n.tooltip__tooltip___1TO08.tooltip__tooltipVisible___37y2K {\n    visibility: visible;\n    opacity: 1; }\n.tooltip__showAsText___3-qca .tooltip__tooltipInner___2s85x {\n  font-size: 11px;\n  line-height: 12px;\n  white-space: nowrap;\n  color: white; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvb2x0aXAuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNIO0VBQ0UscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCxXQUFXO0VBQ1gsZ0JBQWdCO0VBQ2hCLGlDQUF5QjtVQUF6Qix5QkFBeUI7RUFDekIscUNBQTZCO0VBQTdCLDZCQUE2QjtFQUM3QixXQUFXO0VBQ1gsVUFBVTtFQUNWLGlCQUFpQjtFQUNqQixjQUFjO0VBQ2QsOEJBQThCO0VBQzlCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSw4QkFBOEI7RUFDOUIsb0JBQW9CO0VBQ3BCLHdCQUF3QjtFQUN4QixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixzQkFBc0I7RUFDdEIsc0JBQXNCLEVBQUU7QUFFMUI7RUFDRSxtQkFBbUI7RUFDbkIsYUFBYTtFQUNiLG1CQUFtQjtFQUNuQixnREFBd0M7RUFBeEMsd0NBQXdDO0VBQ3hDLFdBQVcsRUFBRTtBQUNiO0lBQ0UsaUJBQWlCO0lBQ2pCLCtCQUErQixFQUFFO0FBQ25DO0lBQ0Usb0JBQW9CO0lBQ3BCLFdBQVcsRUFBRTtBQUVqQjtFQUNFLGdCQUFnQjtFQUNoQixrQkFBa0I7RUFDbEIsb0JBQW9CO0VBQ3BCLGFBQWEsRUFBRSIsImZpbGUiOiJ0b29sdGlwLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLnRvb2x0aXAge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDEwMDtcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycywgdmlzaWJpbGl0eSAuMnM7XG4gIG9wYWNpdHk6IDA7IH1cbiAgLnRvb2x0aXAuc2hvd0FzVGV4dCB7XG4gICAgcGFkZGluZzogNHB4IDVweDtcbiAgICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuNSk7IH1cbiAgLnRvb2x0aXAudG9vbHRpcFZpc2libGUge1xuICAgIHZpc2liaWxpdHk6IHZpc2libGU7XG4gICAgb3BhY2l0eTogMTsgfVxuXG4uc2hvd0FzVGV4dCAudG9vbHRpcElubmVyIHtcbiAgZm9udC1zaXplOiAxMXB4O1xuICBsaW5lLWhlaWdodDogMTJweDtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgY29sb3I6IHdoaXRlOyB9XG4iXX0= */";
    var styles$11 = {"controlButton":"tooltip__controlButton___E3x3L","hidden":"tooltip__hidden___3R_Au","tooltip":"tooltip__tooltip___1TO08","showAsText":"tooltip__showAsText___3-qca","tooltipVisible":"tooltip__tooltipVisible___37y2K","tooltipInner":"tooltip__tooltipInner___2s85x"};
    styleInject(css$11);

    var Tooltip = /** @class */ (function (_super) {
        __extends(Tooltip, _super);
        function Tooltip() {
            var _this = _super.call(this) || this;
            _this._isHidden = true;
            _this._initDOM();
            return _this;
        }
        Tooltip.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(tooltipTemplate({
                styles: this.styleNames,
            }));
            this._$tooltipInner = getElementByHook(this._$rootElement, 'tooltip-inner');
        };
        Tooltip.prototype.getElement = function () {
            return this._$rootElement;
        };
        Object.defineProperty(Tooltip.prototype, "isHidden", {
            get: function () {
                return this._isHidden;
            },
            enumerable: true,
            configurable: true
        });
        Tooltip.prototype.show = function () {
            if (!this._isHidden) {
                return;
            }
            this._isHidden = false;
            this._$rootElement.classList.add(this.styleNames.tooltipVisible);
        };
        Tooltip.prototype.hide = function () {
            if (this._isHidden) {
                return;
            }
            this._isHidden = true;
            this._$rootElement.classList.remove(this.styleNames.tooltipVisible);
        };
        Tooltip.prototype.setText = function (text) {
            this.clearElement();
            this._showAsText();
            this._$tooltipInner.innerText = text;
        };
        Tooltip.prototype.clearElement = function () {
            this._$tooltipInner.firstChild &&
                this._$tooltipInner.removeChild(this._$tooltipInner.firstChild);
        };
        Tooltip.prototype.setElement = function (element) {
            if (element !== this._$tooltipInner.firstChild) {
                this._showAsElement();
                this.clearElement();
                if (element) {
                    this._$tooltipInner.appendChild(element);
                }
            }
        };
        Tooltip.prototype._showAsText = function () {
            this._$rootElement.classList.remove(this.styleNames.showAsElement);
            this._$rootElement.classList.add(this.styleNames.showAsText);
        };
        Tooltip.prototype._showAsElement = function () {
            this._$rootElement.classList.remove(this.styleNames.showAsText);
            this._$rootElement.classList.add(this.styleNames.showAsElement);
        };
        Tooltip.prototype.setStyle = function (style) {
            var _this = this;
            Object.keys(style).forEach(function (styleKey) {
                _this._$rootElement.style[styleKey] = style[styleKey];
            });
        };
        Tooltip.prototype.destroy = function () {
            this._$rootElement = null;
            this._$tooltipInner = null;
        };
        return Tooltip;
    }(Stylable));
    Tooltip.extendStyleNames(styles$11);

    var TooltipPositionPlacement;
    (function (TooltipPositionPlacement) {
        TooltipPositionPlacement["TOP"] = "top";
        TooltipPositionPlacement["BOTTOM"] = "bottom";
    })(TooltipPositionPlacement || (TooltipPositionPlacement = {}));

    function calcTooltipCenterX(tooltipReferenceOffsetX, tooltipReferenceWidth) {
        return tooltipReferenceOffsetX + tooltipReferenceWidth / 2;
    }
    function getTooltipPositionByReferenceElement(tooltipReferenceElement, tooltipContainerElement, tooltipCenterXfn) {
        if (tooltipCenterXfn === void 0) { tooltipCenterXfn = calcTooltipCenterX; }
        var tooltipReferenceRect = tooltipReferenceElement.getBoundingClientRect();
        var tooltipContainerRect = tooltipContainerElement.getBoundingClientRect();
        var tooltipPlacement = tooltipReferenceRect.top > tooltipContainerRect.top
            ? TooltipPositionPlacement.BOTTOM
            : TooltipPositionPlacement.TOP;
        var tooltipReferenceOffsetX = tooltipReferenceRect.left - tooltipContainerRect.left;
        var tooltipCenterX = tooltipCenterXfn(tooltipReferenceOffsetX, tooltipReferenceRect.width);
        return { placement: tooltipPlacement, x: tooltipCenterX };
    }

    var SHOW_EVENTS = ['mouseenter', 'focus'];
    var HIDE_EVENTS = ['mouseleave', 'blur'];
    var TooltipReference = /** @class */ (function () {
        function TooltipReference(reference, tooltipService, options) {
            this._$reference = reference;
            this._options = options;
            this._tooltipService = tooltipService;
            this._eventListeners = [];
            this._bindEvents();
        }
        TooltipReference.prototype._bindEvents = function () {
            var _this = this;
            SHOW_EVENTS.forEach(function (event) {
                var fn = function () {
                    _this.show();
                };
                _this._eventListeners.push({ event: event, fn: fn });
                _this._$reference.addEventListener(event, fn);
            });
            HIDE_EVENTS.forEach(function (event) {
                var fn = function () {
                    _this.hide();
                };
                _this._eventListeners.push({ event: event, fn: fn });
                _this._$reference.addEventListener(event, fn);
            });
        };
        Object.defineProperty(TooltipReference.prototype, "isHidden", {
            get: function () {
                return this._tooltipService.isHidden;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TooltipReference.prototype, "isDisabled", {
            get: function () {
                return this._isDisabled;
            },
            enumerable: true,
            configurable: true
        });
        TooltipReference.prototype.show = function () {
            if (this._isDisabled) {
                return;
            }
            this._tooltipService.show({
                text: this._options.text,
                element: this._options.element,
                position: getTooltipPositionByReferenceElement(this._$reference, this._tooltipService.tooltipContainerElement),
            });
        };
        TooltipReference.prototype.hide = function () {
            this._tooltipService.hide();
        };
        TooltipReference.prototype.setText = function (text) {
            this._options.text = text;
            this._tooltipService.setText(text);
        };
        TooltipReference.prototype.disable = function () {
            this._isDisabled = true;
        };
        TooltipReference.prototype.enable = function () {
            this._isDisabled = false;
        };
        TooltipReference.prototype.destroy = function () {
            var _this = this;
            this._eventListeners.forEach(function (_a) {
                var event = _a.event, fn = _a.fn;
                _this._$reference.removeEventListener(event, fn);
            });
            this._eventListeners = null;
            this._$reference = null;
            this._tooltipService = null;
            this._options = null;
        };
        return TooltipReference;
    }());

    var css$12 = ".tooltip-container__tooltipContainer___2guVa {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 10px 10px 6px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvb2x0aXAtY29udGFpbmVyLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxtQkFBbUI7RUFDbkIsT0FBTztFQUNQLFNBQVM7RUFDVCxVQUFVO0VBQ1YsUUFBUTtFQUNSLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2Qsc0JBQXNCLEVBQUUiLCJmaWxlIjoidG9vbHRpcC1jb250YWluZXIuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi50b29sdGlwQ29udGFpbmVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIG1hcmdpbjogMTBweCAxMHB4IDZweDsgfVxuIl19 */";
    var styles$12 = {"tooltipContainer":"tooltip-container__tooltipContainer___2guVa"};
    styleInject(css$12);

    var TooltipContainer = /** @class */ (function (_super) {
        __extends(TooltipContainer, _super);
        function TooltipContainer(tooltip) {
            var _this = _super.call(this) || this;
            _this._tooltip = tooltip;
            _this._initDOM();
            return _this;
        }
        TooltipContainer.prototype.getElement = function () {
            return this._$rootElement;
        };
        TooltipContainer.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(tooltipContainerTemplate({
                styles: this.styleNames,
            }));
            this._$rootElement.appendChild(this._tooltip.getElement());
        };
        TooltipContainer.prototype.getTooltipPositionStyles = function (position) {
            if (typeof position === 'function') {
                position = position(this._$rootElement);
            }
            if (position.placement === TooltipPositionPlacement.TOP) {
                return {
                    left: this._getTooltipLeftX(position.x) + "px",
                    top: 0,
                    bottom: 'initial',
                };
            }
            return {
                left: this._getTooltipLeftX(position.x) + "px",
                top: 'initial',
                bottom: 0,
            };
        };
        TooltipContainer.prototype.destroy = function () {
            this._tooltip = null;
            this._$rootElement = null;
        };
        TooltipContainer.prototype._getTooltipLeftX = function (tooltipCenterX) {
            var tooltipRect = this._tooltip.getElement().getBoundingClientRect();
            var tooltipContainerRect = this._$rootElement.getBoundingClientRect();
            var tooltipLeftX = tooltipCenterX - tooltipRect.width / 2;
            // ensure `x` is in range of placeholder rect
            tooltipLeftX = Math.max(tooltipLeftX, 0);
            tooltipLeftX = Math.min(tooltipLeftX, tooltipContainerRect.width - tooltipRect.width);
            return tooltipLeftX;
        };
        return TooltipContainer;
    }(Stylable));
    TooltipContainer.extendStyleNames(styles$12);

    var TooltipService = /** @class */ (function () {
        function TooltipService(_a) {
            var eventEmitter = _a.eventEmitter;
            this._eventEmitter = eventEmitter;
            this._tooltip = new Tooltip();
            this._tooltipContainer = new TooltipContainer(this._tooltip);
            this._bindEvents();
        }
        Object.defineProperty(TooltipService.prototype, "isHidden", {
            get: function () {
                return this._tooltip.isHidden;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TooltipService.prototype, "tooltipContainerElement", {
            get: function () {
                return this._tooltipContainer.getElement();
            },
            enumerable: true,
            configurable: true
        });
        TooltipService.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([[UIEvent$1.FULL_SCREEN_STATE_CHANGED, this.hide]], this);
        };
        /**
         * Set new tooltip title
         */
        TooltipService.prototype.setText = function (text) {
            this._tooltip.setText(text);
        };
        /**
         * Show tooltip with title
         */
        TooltipService.prototype.show = function (options) {
            // NOTE: its important to set tooltip text before update tooltip position styles
            if (options.element) {
                this._tooltip.setElement(options.element);
            }
            else {
                this._tooltip.setText(options.text);
            }
            this._tooltip.setStyle(this._tooltipContainer.getTooltipPositionStyles(options.position));
            this._tooltip.show();
        };
        TooltipService.prototype.clearElement = function () {
            this._tooltip.clearElement();
        };
        /**
         * Hide tooltip
         */
        TooltipService.prototype.hide = function () {
            this._tooltip.hide();
        };
        /**
         * Create tooltip reference which show/hide tooltip on hover and focus events
         * @param reference - reference node
         * @param options - tooltip title and other options
         * @returns tooltip reference instance
         */
        TooltipService.prototype.createReference = function (reference, options) {
            return new TooltipReference(reference, this, options);
        };
        TooltipService.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltip.destroy();
            this._tooltipContainer.destroy();
            this._tooltip = null;
            this._tooltipContainer = null;
            this._eventEmitter = null;
        };
        TooltipService.moduleName = 'tooltipService';
        TooltipService.dependencies = ['eventEmitter'];
        return TooltipService;
    }());

    function calcProgressTimeTooltipCenterX(progressPercent, progressElementOffsetX, progressElementWidth) {
        return (progressElementOffsetX + (progressPercent * progressElementWidth) / 100);
    }
    function getProgressTimeTooltipPosition(progressPercent, progressElement, tooltipContainer) {
        return getTooltipPositionByReferenceElement(progressElement, tooltipContainer, function (progressElementOffsetX, progressElementWidth) {
            return calcProgressTimeTooltipCenterX(progressPercent, progressElementOffsetX, progressElementWidth);
        });
    }

    function dot_tpl_src_modules_ui_controls_progress_templates_progress_dot(props
    ) {
    var out='<div data-webplayer-hook="progress-control" class="'+(props.styles.seekBlock)+'" tabindex="0"> <div class="'+(props.styles.progressBarsWrapper)+'"> <div class="'+(props.styles.progressBar)+' '+(props.styles.background)+'"> </div> <div data-webplayer-hook="progress-buffered" class="'+(props.styles.progressBar)+' '+(props.styles.buffered)+'"> </div> <div data-webplayer-hook="progress-seek-to" class="'+(props.styles.progressBar)+' '+(props.styles.seekTo)+' '+(props.themeStyles.progressSeekTo)+'"> </div> <div data-webplayer-hook="progress-played" class="'+(props.styles.progressBar)+' '+(props.styles.played)+' '+(props.themeStyles.progressPlayed)+'"> </div> <div data-webplayer-hook="progress-time-indicators" class="'+(props.styles.timeIndicators)+'"> </div> </div> <div data-webplayer-hook="progress-hitbox" class="'+(props.styles.hitbox)+'"> </div> <div data-webplayer-hook="progress-seek-button" class="'+(props.styles.seekButtonContainer)+'"> <div class="'+(props.styles.seekButton)+' '+(props.themeStyles.progressSeekBtn)+'"> </div> </div> <div data-webplayer-hook="progress-sync-button" class="'+(props.styles.syncButton)+'"> </div></div>';return out;
    }

    function dot_tpl_src_modules_ui_controls_progress_templates_progressTimeIndicator_dot(props
    ) {
    var out='<div class="'+(props.styles.timeIndicator)+'" style="left: '+(props.percent)+'%"></div>';return out;
    }

    var progressTemplate = dot_tpl_src_modules_ui_controls_progress_templates_progress_dot.default ? dot_tpl_src_modules_ui_controls_progress_templates_progress_dot.default : dot_tpl_src_modules_ui_controls_progress_templates_progress_dot;
    var progressTimeIndicatorTemplate = dot_tpl_src_modules_ui_controls_progress_templates_progressTimeIndicator_dot.default
        ? dot_tpl_src_modules_ui_controls_progress_templates_progressTimeIndicator_dot.default
        : dot_tpl_src_modules_ui_controls_progress_templates_progressTimeIndicator_dot;

    var progressViewTheme = {
        progressPlayed: {
            backgroundColor: function (data) { return data.progressColor; },
        },
        progressSeekTo: {
            backgroundColor: function (data) {
                return transperentizeColor(data.progressColor, 0.5);
            },
        },
        progressSeekBtn: {
            backgroundColor: function (data) { return data.progressColor; },
        },
    };

    var css$13 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.progress__controlButton___2pi4V {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.progress__controlButton___2pi4V:hover {\n    opacity: .7; }\n.progress__hidden___3Rjqh {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.progress__seekBlock___V4YqW {\n  position: relative;\n  display: block;\n  width: 100%;\n  height: 6px;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-transition: opacity .2s, visibility .2s;\n  transition: opacity .2s, visibility .2s;\n  -ms-touch-action: none;\n      touch-action: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekBlock___V4YqW {\n    height: 8px; }\n.progress__seekBlock___V4YqW.progress__inLive___3324R .progress__played___1dShL {\n    background-color: #ea492e; }\n.progress__seekBlock___V4YqW.progress__inLive___3324R .progress__seekTo___T0D_O {\n    background-color: rgba(234, 73, 46, 0.5); }\n.progress__seekBlock___V4YqW.progress__inLive___3324R .progress__syncButton___3N1QN {\n    display: initial; }\n.progress__seekBlock___V4YqW:hover .progress__progressBarsWrapper___1SSlL, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__progressBarsWrapper___1SSlL {\n    -webkit-transform: scaleY(1);\n            transform: scaleY(1); }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekBlock___V4YqW:hover .progress__progressBarsWrapper___1SSlL, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__progressBarsWrapper___1SSlL {\n      -webkit-transform: scaleY(1);\n              transform: scaleY(1); }\n.progress__seekBlock___V4YqW:hover .progress__progressBarsWrapper___1SSlL .progress__seekTo___T0D_O, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__progressBarsWrapper___1SSlL .progress__seekTo___T0D_O {\n      opacity: 1; }\n.progress__seekBlock___V4YqW:hover .progress__progressBarsWrapper___1SSlL .progress__timeIndicator___2wltB:after, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__progressBarsWrapper___1SSlL .progress__timeIndicator___2wltB:after {\n      -webkit-transform: scale(1);\n              transform: scale(1); }\n.progress__seekBlock___V4YqW:hover .progress__seekButton___3UtgF, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__seekButton___3UtgF {\n    -webkit-transform: scale(1);\n            transform: scale(1); }\n.progress__seekBlock___V4YqW:hover .progress__seekButton___3UtgF.progress__liveSync___PIvwF, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__seekButton___3UtgF.progress__liveSync___PIvwF {\n      left: 100%; }\n.progress__seekBlock___V4YqW:hover .progress__syncButton___3N1QN, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__syncButton___3N1QN {\n    -webkit-transform: scale(1.4);\n            transform: scale(1.4); }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekBlock___V4YqW:hover .progress__syncButton___3N1QN, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__syncButton___3N1QN {\n      -webkit-transform: scale(1.33);\n              transform: scale(1.33); }\n.progress__seekBlock___V4YqW:hover .progress__syncButton___3N1QN.progress__liveSync___PIvwF, .progress__seekBlock___V4YqW.progress__isDragging___2Tcb5 .progress__syncButton___3N1QN.progress__liveSync___PIvwF {\n      background-color: #fff; }\n.progress__seekButtonContainer___1TZ8Z {\n  position: absolute;\n  z-index: 7;\n  top: -3px;\n  left: -6px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekButtonContainer___1TZ8Z {\n    top: -4px;\n    left: -8px;\n    width: 20px;\n    height: 20px; }\n.progress__seekButton___3UtgF {\n  display: block;\n  width: 12px;\n  height: 12px;\n  content: '';\n  cursor: pointer;\n  -webkit-transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1), -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  -webkit-transform: scale(0);\n          transform: scale(0);\n  border-radius: 50%;\n  background-color: #fff; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__seekButton___3UtgF {\n    width: 16px;\n    height: 16px; }\n.progress__syncButton___3N1QN {\n  position: absolute;\n  z-index: 6;\n  top: -2px;\n  right: -5px;\n  display: none;\n  width: 6px;\n  height: 6px;\n  cursor: pointer;\n  -webkit-transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1), -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  border: 2px solid #bababa;\n  border-radius: 50%;\n  background-color: #ea492e; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__syncButton___3N1QN {\n    top: -2px;\n    right: -6px;\n    width: 8px;\n    height: 8px; }\n.progress__syncButton___3N1QN:hover {\n    background-color: #fff; }\n.progress__syncButton___3N1QN.progress__hidden___3Rjqh {\n    display: none; }\n.progress__progressBarsWrapper___1SSlL {\n  height: 6px;\n  -webkit-transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1), -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n  -webkit-transform: scaleY(0.34);\n          transform: scaleY(0.34); }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__progressBarsWrapper___1SSlL {\n    height: 8px;\n    -webkit-transform: scaleY(0.25);\n            transform: scaleY(0.25); }\n.progress__progressBar___210E8 {\n  position: absolute;\n  height: 6px;\n  padding: 0; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__progressBar___210E8 {\n    height: 8px; }\n.progress__played___1dShL {\n  width: 100%;\n  -webkit-transform-origin: 0 0;\n          transform-origin: 0 0;\n  background-color: #fff; }\n.progress__buffered___2LiZB {\n  -webkit-transition: width .2s ease;\n  transition: width .2s ease;\n  background-color: rgba(255, 255, 255, 0.25); }\n.progress__background___lqeL2 {\n  width: 100%;\n  background-color: rgba(255, 255, 255, 0.25); }\n.progress__seekTo___T0D_O {\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  background-color: rgba(255, 255, 255, 0.5); }\n.progress__timeIndicators___c6h-a {\n  position: absolute;\n  overflow-x: hidden;\n  width: 100%;\n  height: 100%;\n  background-color: transparent; }\n.progress__timeIndicator___2wltB {\n  position: absolute; }\n.progress__timeIndicator___2wltB:after {\n    position: absolute;\n    right: -3px;\n    width: 6px;\n    height: 6px;\n    content: '';\n    -webkit-transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n    transition: -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n    transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n    transition: transform 0.1s cubic-bezier(0, 0, 0.2, 1), -webkit-transform 0.1s cubic-bezier(0, 0, 0.2, 1);\n    -webkit-transform: scale(0);\n            transform: scale(0);\n    opacity: .6;\n    border-radius: 50%;\n    background-color: #fff; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .progress__timeIndicator___2wltB:after {\n      right: -4px;\n      width: 8px;\n      height: 8px; }\n.progress__timeIndicator___2wltB:after:hover {\n      opacity: 1; }\n.progress__hitbox___xqdFP {\n  position: relative;\n  z-index: 5;\n  top: -11px;\n  display: block;\n  width: 100%;\n  height: 16px;\n  cursor: pointer;\n  opacity: 0; }\n[data-webplayer-focus-source='key']\n[data-webplayer-hook='progress-control'].focus-within,\n[data-webplayer-focus-source='script']\n[data-webplayer-hook='progress-control'].focus-within {\n  opacity: 1;\n  -webkit-box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8);\n          box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2dyZXNzLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLGVBQWU7RUFDZixZQUFZO0VBQ1osWUFBWTtFQUNaLDBCQUFrQjtLQUFsQix1QkFBa0I7TUFBbEIsc0JBQWtCO1VBQWxCLGtCQUFrQjtFQUNsQixnREFBd0M7RUFBeEMsd0NBQXdDO0VBQ3hDLHVCQUFtQjtNQUFuQixtQkFBbUIsRUFBRTtBQUNyQjtJQUNFLFlBQVksRUFBRTtBQUNoQjtJQUNFLDBCQUEwQixFQUFFO0FBQzlCO0lBQ0UseUNBQXlDLEVBQUU7QUFDN0M7SUFDRSxpQkFBaUIsRUFBRTtBQUNyQjtJQUNFLDZCQUFxQjtZQUFyQixxQkFBcUIsRUFBRTtBQUN2QjtNQUNFLDZCQUFxQjtjQUFyQixxQkFBcUIsRUFBRTtBQUN6QjtNQUNFLFdBQVcsRUFBRTtBQUNmO01BQ0UsNEJBQW9CO2NBQXBCLG9CQUFvQixFQUFFO0FBQzFCO0lBQ0UsNEJBQW9CO1lBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO01BQ0UsV0FBVyxFQUFFO0FBQ2pCO0lBQ0UsOEJBQXNCO1lBQXRCLHNCQUFzQixFQUFFO0FBQ3hCO01BQ0UsK0JBQXVCO2NBQXZCLHVCQUF1QixFQUFFO0FBQzNCO01BQ0UsdUJBQXVCLEVBQUU7QUFFL0I7RUFDRSxtQkFBbUI7RUFDbkIsV0FBVztFQUNYLFVBQVU7RUFDVixXQUFXLEVBQUU7QUFDYjtJQUNFLFVBQVU7SUFDVixXQUFXO0lBQ1gsWUFBWTtJQUNaLGFBQWEsRUFBRTtBQUVuQjtFQUNFLGVBQWU7RUFDZixZQUFZO0VBQ1osYUFBYTtFQUNiLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsc0VBQXNEO0VBQXRELDhEQUFzRDtFQUF0RCxzREFBc0Q7RUFBdEQseUdBQXNEO0VBQ3RELDRCQUFvQjtVQUFwQixvQkFBb0I7RUFDcEIsbUJBQW1CO0VBQ25CLHVCQUF1QixFQUFFO0FBQ3pCO0lBQ0UsWUFBWTtJQUNaLGFBQWEsRUFBRTtBQUVuQjtFQUNFLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsVUFBVTtFQUNWLFlBQVk7RUFDWixjQUFjO0VBQ2QsV0FBVztFQUNYLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsc0VBQXNEO0VBQXRELDhEQUFzRDtFQUF0RCxzREFBc0Q7RUFBdEQseUdBQXNEO0VBQ3RELDBCQUEwQjtFQUMxQixtQkFBbUI7RUFDbkIsMEJBQTBCLEVBQUU7QUFDNUI7SUFDRSxVQUFVO0lBQ1YsWUFBWTtJQUNaLFdBQVc7SUFDWCxZQUFZLEVBQUU7QUFDaEI7SUFDRSx1QkFBdUIsRUFBRTtBQUMzQjtJQUNFLGNBQWMsRUFBRTtBQUVwQjtFQUNFLFlBQVk7RUFDWixzRUFBc0Q7RUFBdEQsOERBQXNEO0VBQXRELHNEQUFzRDtFQUF0RCx5R0FBc0Q7RUFDdEQsZ0NBQXdCO1VBQXhCLHdCQUF3QixFQUFFO0FBQzFCO0lBQ0UsWUFBWTtJQUNaLGdDQUF3QjtZQUF4Qix3QkFBd0IsRUFBRTtBQUU5QjtFQUNFLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osV0FBVyxFQUFFO0FBQ2I7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSxZQUFZO0VBQ1osOEJBQXNCO1VBQXRCLHNCQUFzQjtFQUN0Qix1QkFBdUIsRUFBRTtBQUUzQjtFQUNFLG1DQUEyQjtFQUEzQiwyQkFBMkI7RUFDM0IsNENBQTRDLEVBQUU7QUFFaEQ7RUFDRSxZQUFZO0VBQ1osNENBQTRDLEVBQUU7QUFFaEQ7RUFDRSxnQ0FBd0I7RUFBeEIsd0JBQXdCO0VBQ3hCLDJDQUEyQyxFQUFFO0FBRS9DO0VBQ0UsbUJBQW1CO0VBQ25CLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osYUFBYTtFQUNiLDhCQUE4QixFQUFFO0FBRWxDO0VBQ0UsbUJBQW1CLEVBQUU7QUFDckI7SUFDRSxtQkFBbUI7SUFDbkIsWUFBWTtJQUNaLFdBQVc7SUFDWCxZQUFZO0lBQ1osWUFBWTtJQUNaLHNFQUFzRDtJQUF0RCw4REFBc0Q7SUFBdEQsc0RBQXNEO0lBQXRELHlHQUFzRDtJQUN0RCw0QkFBb0I7WUFBcEIsb0JBQW9CO0lBQ3BCLFlBQVk7SUFDWixtQkFBbUI7SUFDbkIsdUJBQXVCLEVBQUU7QUFDekI7TUFDRSxZQUFZO01BQ1osV0FBVztNQUNYLFlBQVksRUFBRTtBQUNoQjtNQUNFLFdBQVcsRUFBRTtBQUVuQjtFQUNFLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsV0FBVztFQUNYLGVBQWU7RUFDZixZQUFZO0VBQ1osYUFBYTtFQUNiLGdCQUFnQjtFQUNoQixXQUFXLEVBQUU7QUFFZjs7OztFQUlFLFdBQVc7RUFDWCxzREFBOEM7VUFBOUMsOENBQThDLEVBQUUiLCJmaWxlIjoicHJvZ3Jlc3Muc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4uc2Vla0Jsb2NrIHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogNnB4O1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAuMnMsIHZpc2liaWxpdHkgLjJzO1xuICB0b3VjaC1hY3Rpb246IG5vbmU7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5zZWVrQmxvY2sge1xuICAgIGhlaWdodDogOHB4OyB9XG4gIC5zZWVrQmxvY2suaW5MaXZlIC5wbGF5ZWQge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICNlYTQ5MmU7IH1cbiAgLnNlZWtCbG9jay5pbkxpdmUgLnNlZWtUbyB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyMzQsIDczLCA0NiwgMC41KTsgfVxuICAuc2Vla0Jsb2NrLmluTGl2ZSAuc3luY0J1dHRvbiB7XG4gICAgZGlzcGxheTogaW5pdGlhbDsgfVxuICAuc2Vla0Jsb2NrOmhvdmVyIC5wcm9ncmVzc0JhcnNXcmFwcGVyLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnByb2dyZXNzQmFyc1dyYXBwZXIge1xuICAgIHRyYW5zZm9ybTogc2NhbGVZKDEpOyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5zZWVrQmxvY2s6aG92ZXIgLnByb2dyZXNzQmFyc1dyYXBwZXIsIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnByb2dyZXNzQmFyc1dyYXBwZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZVkoMSk7IH1cbiAgICAuc2Vla0Jsb2NrOmhvdmVyIC5wcm9ncmVzc0JhcnNXcmFwcGVyIC5zZWVrVG8sIC5zZWVrQmxvY2suaXNEcmFnZ2luZyAucHJvZ3Jlc3NCYXJzV3JhcHBlciAuc2Vla1RvIHtcbiAgICAgIG9wYWNpdHk6IDE7IH1cbiAgICAuc2Vla0Jsb2NrOmhvdmVyIC5wcm9ncmVzc0JhcnNXcmFwcGVyIC50aW1lSW5kaWNhdG9yOmFmdGVyLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnByb2dyZXNzQmFyc1dyYXBwZXIgLnRpbWVJbmRpY2F0b3I6YWZ0ZXIge1xuICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxKTsgfVxuICAuc2Vla0Jsb2NrOmhvdmVyIC5zZWVrQnV0dG9uLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnNlZWtCdXR0b24ge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMSk7IH1cbiAgICAuc2Vla0Jsb2NrOmhvdmVyIC5zZWVrQnV0dG9uLmxpdmVTeW5jLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnNlZWtCdXR0b24ubGl2ZVN5bmMge1xuICAgICAgbGVmdDogMTAwJTsgfVxuICAuc2Vla0Jsb2NrOmhvdmVyIC5zeW5jQnV0dG9uLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnN5bmNCdXR0b24ge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMS40KTsgfVxuICAgIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuc2Vla0Jsb2NrOmhvdmVyIC5zeW5jQnV0dG9uLCBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLnNlZWtCbG9jay5pc0RyYWdnaW5nIC5zeW5jQnV0dG9uIHtcbiAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4zMyk7IH1cbiAgICAuc2Vla0Jsb2NrOmhvdmVyIC5zeW5jQnV0dG9uLmxpdmVTeW5jLCAuc2Vla0Jsb2NrLmlzRHJhZ2dpbmcgLnN5bmNCdXR0b24ubGl2ZVN5bmMge1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxuXG4uc2Vla0J1dHRvbkNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogNztcbiAgdG9wOiAtM3B4O1xuICBsZWZ0OiAtNnB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuc2Vla0J1dHRvbkNvbnRhaW5lciB7XG4gICAgdG9wOiAtNHB4O1xuICAgIGxlZnQ6IC04cHg7XG4gICAgd2lkdGg6IDE2cHg7XG4gICAgaGVpZ2h0OiAxNnB4OyB9XG5cbi5zZWVrQnV0dG9uIHtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiAxMnB4O1xuICBoZWlnaHQ6IDEycHg7XG4gIGNvbnRlbnQ6ICcnO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjFzIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpO1xuICB0cmFuc2Zvcm06IHNjYWxlKDApO1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIGJhY2tncm91bmQtY29sb3I6ICNmZmY7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5zZWVrQnV0dG9uIHtcbiAgICB3aWR0aDogMTZweDtcbiAgICBoZWlnaHQ6IDE2cHg7IH1cblxuLnN5bmNCdXR0b24ge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHotaW5kZXg6IDY7XG4gIHRvcDogLTJweDtcbiAgcmlnaHQ6IC01cHg7XG4gIGRpc3BsYXk6IG5vbmU7XG4gIHdpZHRoOiA2cHg7XG4gIGhlaWdodDogNnB4O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAwLjFzIGN1YmljLWJlemllcigwLCAwLCAwLjIsIDEpO1xuICBib3JkZXI6IDJweCBzb2xpZCAjYmFiYWJhO1xuICBib3JkZXItcmFkaXVzOiA1MCU7XG4gIGJhY2tncm91bmQtY29sb3I6ICNlYTQ5MmU7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5zeW5jQnV0dG9uIHtcbiAgICB0b3A6IC0ycHg7XG4gICAgcmlnaHQ6IC02cHg7XG4gICAgd2lkdGg6IDhweDtcbiAgICBoZWlnaHQ6IDhweDsgfVxuICAuc3luY0J1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxuICAuc3luY0J1dHRvbi5oaWRkZW4ge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cblxuLnByb2dyZXNzQmFyc1dyYXBwZXIge1xuICBoZWlnaHQ6IDZweDtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XG4gIHRyYW5zZm9ybTogc2NhbGVZKDAuMzQpOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAucHJvZ3Jlc3NCYXJzV3JhcHBlciB7XG4gICAgaGVpZ2h0OiA4cHg7XG4gICAgdHJhbnNmb3JtOiBzY2FsZVkoMC4yNSk7IH1cblxuLnByb2dyZXNzQmFyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBoZWlnaHQ6IDZweDtcbiAgcGFkZGluZzogMDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLnByb2dyZXNzQmFyIHtcbiAgICBoZWlnaHQ6IDhweDsgfVxuXG4ucGxheWVkIHtcbiAgd2lkdGg6IDEwMCU7XG4gIHRyYW5zZm9ybS1vcmlnaW46IDAgMDtcbiAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxuXG4uYnVmZmVyZWQge1xuICB0cmFuc2l0aW9uOiB3aWR0aCAuMnMgZWFzZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjI1KTsgfVxuXG4uYmFja2dyb3VuZCB7XG4gIHdpZHRoOiAxMDAlO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpOyB9XG5cbi5zZWVrVG8ge1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycztcbiAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjUpOyB9XG5cbi50aW1lSW5kaWNhdG9ycyB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDsgfVxuXG4udGltZUluZGljYXRvciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTsgfVxuICAudGltZUluZGljYXRvcjphZnRlciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHJpZ2h0OiAtM3B4O1xuICAgIHdpZHRoOiA2cHg7XG4gICAgaGVpZ2h0OiA2cHg7XG4gICAgY29udGVudDogJyc7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuMXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSk7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwKTtcbiAgICBvcGFjaXR5OiAuNjtcbiAgICBib3JkZXItcmFkaXVzOiA1MCU7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogI2ZmZjsgfVxuICAgIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudGltZUluZGljYXRvcjphZnRlciB7XG4gICAgICByaWdodDogLTRweDtcbiAgICAgIHdpZHRoOiA4cHg7XG4gICAgICBoZWlnaHQ6IDhweDsgfVxuICAgIC50aW1lSW5kaWNhdG9yOmFmdGVyOmhvdmVyIHtcbiAgICAgIG9wYWNpdHk6IDE7IH1cblxuLmhpdGJveCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgei1pbmRleDogNTtcbiAgdG9wOiAtMTFweDtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDE2cHg7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgb3BhY2l0eTogMDsgfVxuXG46Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0na2V5J11cbltkYXRhLXBsYXlhYmxlLWhvb2s9J3Byb2dyZXNzLWNvbnRyb2wnXS5mb2N1cy13aXRoaW4sXG46Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0nc2NyaXB0J11cbltkYXRhLXBsYXlhYmxlLWhvb2s9J3Byb2dyZXNzLWNvbnRyb2wnXS5mb2N1cy13aXRoaW4ge1xuICBvcGFjaXR5OiAxO1xuICBib3gtc2hhZG93OiAwIDAgMCAycHggcmdiYSg1NiwgMTUzLCAyMzYsIDAuOCk7IH1cbiJdfQ== */";
    var styles$13 = {"controlButton":"progress__controlButton___2pi4V","hidden":"progress__hidden___3Rjqh","seekBlock":"progress__seekBlock___V4YqW","inLive":"progress__inLive___3324R","played":"progress__played___1dShL","seekTo":"progress__seekTo___T0D_O","syncButton":"progress__syncButton___3N1QN","progressBarsWrapper":"progress__progressBarsWrapper___1SSlL","isDragging":"progress__isDragging___2Tcb5","timeIndicator":"progress__timeIndicator___2wltB","seekButton":"progress__seekButton___3UtgF","liveSync":"progress__liveSync___PIvwF","seekButtonContainer":"progress__seekButtonContainer___1TZ8Z","progressBar":"progress__progressBar___210E8","buffered":"progress__buffered___2LiZB","background":"progress__background___lqeL2","timeIndicators":"progress__timeIndicators___c6h-a","hitbox":"progress__hitbox___xqdFP"};
    styleInject(css$13);

    var DATA_PLAYED = 'data-webplayer-played-percent';
    var getPercentBasedOnXPosition = function (event, element) {
        var boundingRect = element.getBoundingClientRect();
        var positionX = event.clientX;
        if (positionX < boundingRect.left) {
            return 0;
        }
        if (positionX > boundingRect.left + boundingRect.width) {
            return 100;
        }
        return ((event.clientX - boundingRect.left) / boundingRect.width) * 100;
    };
    var ProgressView = /** @class */ (function (_super) {
        __extends(ProgressView, _super);
        function ProgressView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._tooltipService = tooltipService;
            _this._initDOM();
            _this._bindCallbacks();
            _this._bindEvents();
            _this._setPlayedDOMAttributes(0);
            _this._setBufferedDOMAttributes(0);
            _this.setUsualMode();
            return _this;
        }
        ProgressView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(progressTemplate({
                styles: this.styleNames,
                themeStyles: this.themeStyles,
            }));
            this._$played = getElementByHook(this._$rootElement, 'progress-played');
            this._$buffered = getElementByHook(this._$rootElement, 'progress-buffered');
            this._$seekTo = getElementByHook(this._$rootElement, 'progress-seek-to');
            this._$timeIndicators = getElementByHook(this._$rootElement, 'progress-time-indicators');
            this._$seekButton = getElementByHook(this._$rootElement, 'progress-seek-button');
            this._$syncButton = getElementByHook(this._$rootElement, 'progress-sync-button');
            this._syncButtonTooltipReference = this._tooltipService.createReference(this._$syncButton, {
                text: this._textMap.get(TextLabel$1.LIVE_SYNC_TOOLTIP),
            });
            this._$hitbox = getElementByHook(this._$rootElement, 'progress-hitbox');
        };
        ProgressView.prototype._bindCallbacks = function () {
            this._setPlayedByDrag = this._setPlayedByDrag.bind(this);
            this._startDragOnMouseDown = this._startDragOnMouseDown.bind(this);
            this._stopDragOnMouseUp = this._stopDragOnMouseUp.bind(this);
            this._startSeekToByMouse = this._startSeekToByMouse.bind(this);
            this._stopSeekToByMouse = this._stopSeekToByMouse.bind(this);
            this._syncWithLive = this._syncWithLive.bind(this);
        };
        ProgressView.prototype._bindEvents = function () {
            this._$seekButton.addEventListener('mousedown', this._startDragOnMouseDown);
            this._$seekButton.addEventListener('mousemove', this._startSeekToByMouse);
            this._$seekButton.addEventListener('mouseout', this._stopSeekToByMouse);
            this._$hitbox.addEventListener('mousedown', this._startDragOnMouseDown);
            this._$hitbox.addEventListener('mousemove', this._startSeekToByMouse);
            this._$hitbox.addEventListener('mouseout', this._stopSeekToByMouse);
            window.addEventListener('mousemove', this._setPlayedByDrag);
            window.addEventListener('mouseup', this._stopDragOnMouseUp);
            this._$syncButton.addEventListener('click', this._syncWithLive);
            this._$syncButton.addEventListener('mouseenter', this._callbacks.onSyncWithLiveMouseEnter);
            this._$syncButton.addEventListener('mouseleave', this._callbacks.onSyncWithLiveMouseLeave);
        };
        ProgressView.prototype._unbindEvents = function () {
            this._$seekButton.removeEventListener('mousedown', this._startDragOnMouseDown);
            this._$seekButton.removeEventListener('mousemove', this._startSeekToByMouse);
            this._$seekButton.removeEventListener('mouseout', this._stopSeekToByMouse);
            this._$hitbox.removeEventListener('mousedown', this._startDragOnMouseDown);
            this._$hitbox.removeEventListener('mousemove', this._startSeekToByMouse);
            this._$hitbox.removeEventListener('mouseout', this._stopSeekToByMouse);
            window.removeEventListener('mousemove', this._setPlayedByDrag);
            window.removeEventListener('mouseup', this._stopDragOnMouseUp);
            this._$syncButton.removeEventListener('click', this._syncWithLive);
            this._$syncButton.removeEventListener('mouseenter', this._callbacks.onSyncWithLiveMouseEnter);
            this._$syncButton.removeEventListener('mouseleave', this._callbacks.onSyncWithLiveMouseLeave);
        };
        ProgressView.prototype._startDragOnMouseDown = function (event) {
            if (event.button > 1) {
                return;
            }
            var percent = getPercentBasedOnXPosition(event, this._$hitbox);
            this._setPlayedDOMAttributes(percent);
            this._callbacks.onChangePlayedPercent(percent);
            this._startDrag();
        };
        ProgressView.prototype._stopDragOnMouseUp = function (event) {
            if (event.button > 1) {
                return;
            }
            this._stopDrag();
        };
        ProgressView.prototype._startSeekToByMouse = function (event) {
            var percent = getPercentBasedOnXPosition(event, this._$hitbox);
            this._setSeekToDOMAttributes(percent);
            this._callbacks.onSeekToByMouseStart(percent);
        };
        ProgressView.prototype._stopSeekToByMouse = function () {
            this._setSeekToDOMAttributes(0);
            this._callbacks.onSeekToByMouseEnd();
        };
        ProgressView.prototype._setPlayedByDrag = function (event) {
            if (this._isDragging) {
                var percent = getPercentBasedOnXPosition(event, this._$hitbox);
                this._setPlayedDOMAttributes(percent);
                this._callbacks.onChangePlayedPercent(percent);
            }
        };
        ProgressView.prototype._startDrag = function () {
            this._isDragging = true;
            this._callbacks.onDragStart();
            this._$rootElement.classList.add(this.styleNames.isDragging);
        };
        ProgressView.prototype._stopDrag = function () {
            if (this._isDragging) {
                this._isDragging = false;
                this._callbacks.onDragEnd();
                this._$rootElement.classList.remove(this.styleNames.isDragging);
            }
        };
        ProgressView.prototype._setSeekToDOMAttributes = function (percent) {
            this._$seekTo.setAttribute('style', "width:" + percent + "%;");
        };
        ProgressView.prototype._setPlayedDOMAttributes = function (percent) {
            this._$rootElement.setAttribute('aria-valuetext', this._textMap.get(TextLabel$1.PROGRESS_CONTROL_VALUE, { percent: percent }));
            this._$rootElement.setAttribute('aria-valuenow', percent.toFixed(2));
            this._$rootElement.setAttribute(DATA_PLAYED, percent.toFixed(2));
            this._setPlayedDOMPosition(percent);
        };
        ProgressView.prototype._setPlayedDOMPosition = function (percent) {
            var scaleValue = percent / 100;
            var translateValue = this._$rootElement.getBoundingClientRect().width * scaleValue;
            this._$played.style.transform = "scaleX(" + scaleValue.toFixed(3) + ")";
            this._$seekButton.style.transform = "translateX(" + translateValue.toFixed(3) + "px)";
        };
        ProgressView.prototype._setBufferedDOMAttributes = function (percent) {
            this._$buffered.setAttribute('style', "width:" + percent + "%;");
        };
        ProgressView.prototype._syncWithLive = function () {
            this._callbacks.onSyncWithLiveClick();
        };
        ProgressView.prototype.updateOnResize = function () {
            this._setPlayedDOMPosition(this._currentPlayedPercent);
        };
        ProgressView.prototype.showSyncWithLive = function () {
            this._$syncButton.classList.remove(this.styleNames.hidden);
        };
        ProgressView.prototype.hideSyncWithLive = function () {
            this._$syncButton.classList.add(this.styleNames.hidden);
        };
        ProgressView.prototype.setLiveSyncState = function (isSync) {
            toggleElementClass(this._$syncButton, this.styleNames.liveSync, isSync);
            toggleElementClass(this._$seekButton, this.styleNames.liveSync, isSync);
            if (isSync) {
                this._syncButtonTooltipReference.disable();
                this._$played.setAttribute('style', "width:100%;");
            }
            else {
                this._syncButtonTooltipReference.enable();
            }
        };
        ProgressView.prototype.showProgressTimeTooltip = function (element, percent) {
            var _this = this;
            this._tooltipService.show({
                element: element,
                position: function (tooltipContainer) {
                    return getProgressTimeTooltipPosition(percent, _this._$hitbox, tooltipContainer);
                },
            });
        };
        ProgressView.prototype.hideProgressTimeTooltip = function () {
            this._tooltipService.hide();
        };
        ProgressView.prototype.setLiveMode = function () {
            this._$rootElement.classList.add(this.styleNames.inLive);
            this.showSyncWithLive();
        };
        ProgressView.prototype.setUsualMode = function () {
            this._$rootElement.classList.remove(this.styleNames.inLive);
            this.hideSyncWithLive();
        };
        ProgressView.prototype.setPlayed = function (percent) {
            this._currentPlayedPercent = percent;
            this._setPlayedDOMAttributes(percent);
        };
        ProgressView.prototype.setBuffered = function (percent) {
            this._setBufferedDOMAttributes(percent);
        };
        ProgressView.prototype.addTimeIndicator = function (percent) {
            this._$timeIndicators.appendChild(htmlToElement(progressTimeIndicatorTemplate({
                percent: percent,
                styles: this.styleNames,
            })));
        };
        ProgressView.prototype.clearTimeIndicators = function () {
            this._$timeIndicators.innerHTML = '';
        };
        ProgressView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        ProgressView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        ProgressView.prototype.getElement = function () {
            return this._$rootElement;
        };
        ProgressView.prototype.destroy = function () {
            this._unbindEvents();
            this._syncButtonTooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$buffered = null;
            this._$hitbox = null;
            this._$played = null;
            this._$seekTo = null;
            this._$seekButton = null;
            this._$syncButton = null;
            this._$timeIndicators = null;
        };
        return ProgressView;
    }(View));
    ProgressView.setTheme(progressViewTheme);
    ProgressView.extendStyleNames(styles$13);

    function getTimePercent(time, durationTime) {
        if (!durationTime) {
            return 0;
        }
        return parseFloat(((time / durationTime) * 100).toFixed(2));
    }
    function getOverallBufferedPercent(buffered, currentTime, duration) {
        if (currentTime === void 0) { currentTime = 0; }
        if (duration === void 0) { duration = 0; }
        if (!buffered || !buffered.length || !duration) {
            return 0;
        }
        var info = getNearestBufferSegmentInfo(buffered, currentTime);
        return getTimePercent(info.end, duration);
    }
    function getOverallPlayedPercent(currentTime, duration) {
        if (currentTime === void 0) { currentTime = 0; }
        if (duration === void 0) { duration = 0; }
        return getTimePercent(currentTime, duration);
    }
    function geOverallBufferLength(buffered) {
        var size = 0;
        if (!buffered || !buffered.length) {
            return size;
        }
        for (var i = 0; i < buffered.length; i += 1) {
            size += buffered.end(i) - buffered.start(i);
        }
        return size;
    }
    function getNearestBufferSegmentInfo(buffered, currentTime) {
        var i = 0;
        if (!buffered || !buffered.length) {
            return null;
        }
        while (i < buffered.length - 1 &&
            !(buffered.start(i) <= currentTime && currentTime <= buffered.end(i))) {
            i += 1;
        }
        return {
            start: buffered.start(i),
            end: buffered.end(i),
        };
    }

    function formatTime(seconds) {
        var isValid = !isNaN(seconds) && isFinite(seconds);
        var isNegative = isValid && seconds < 0;
        var date = new Date(null);
        date.setSeconds(isValid ? Math.abs(Math.floor(seconds)) : 0);
        // get HH:mm:ss part, remove hours if they are "00:"
        var time = date
            .toISOString()
            .substr(11, 8)
            .replace(/^00:/, '');
        return isNegative ? "-" + time : time;
    }

    var UPDATE_PROGRESS_INTERVAL_DELAY = 1000 / 60;
    var ProgressControl = /** @class */ (function () {
        function ProgressControl(_a) {
            var engine = _a.engine, liveStateEngine = _a.liveStateEngine, eventEmitter = _a.eventEmitter, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme, previewThumbnail = _a.previewThumbnail, previewFullSize = _a.previewFullSize;
            this._engine = engine;
            this._liveStateEngine = liveStateEngine;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._tooltipService = tooltipService;
            this._previewThumbnail = previewThumbnail;
            this._previewFullSize = previewFullSize;
            this._isUserDragging = false;
            this._desiredSeekPosition = 0;
            this._theme = theme;
            this._timeIndicatorsToAdd = [];
            this._showFullScreenPreview = false;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this.view.setPlayed(0);
            this.view.setBuffered(0);
            this._initInterceptor();
        }
        ProgressControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        ProgressControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [VideoEvent$1.STATE_CHANGED, this._processStateChange],
                [VideoEvent$1.LIVE_STATE_CHANGED, this._processLiveStateChange],
                [VideoEvent$1.CHUNK_LOADED, this._updateBufferIndicator],
                [VideoEvent$1.DURATION_UPDATED, this._updateAllIndicators],
                [UIEvent$1.RESIZE, this.view.updateOnResize, this.view],
            ], this);
        };
        ProgressControl.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onSyncWithLiveClick: this._syncWithLive,
                    onSyncWithLiveMouseEnter: this._onSyncWithLiveMouseEnter,
                    onSyncWithLiveMouseLeave: this._onSyncWithLiveMouseLeave,
                    onChangePlayedPercent: this._onChangePlayedPercent,
                    onSeekToByMouseStart: this._showTooltipAndPreview,
                    onSeekToByMouseEnd: this._hideTooltip,
                    onDragStart: this._startProcessingUserDrag,
                    onDragEnd: this._stopProcessingUserDrag,
                },
                theme: this._theme,
                textMap: this._textMap,
                tooltipService: this._tooltipService,
            };
            this.view = new ProgressControl.View(config);
        };
        ProgressControl.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.view.getElement(), (_a = {}, _a[KEYCODES.UP_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.GO_FORWARD_WITH_KEYBOARD);
                    _this._engine.seekForward(AMOUNT_TO_SKIP_SECONDS);
                }, _a[KEYCODES.DOWN_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.GO_BACKWARD_WITH_KEYBOARD);
                    _this._engine.seekBackward(AMOUNT_TO_SKIP_SECONDS);
                }, _a[KEYCODES.RIGHT_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.GO_FORWARD_WITH_KEYBOARD);
                    _this._engine.seekForward(AMOUNT_TO_SKIP_SECONDS);
                }, _a[KEYCODES.LEFT_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.GO_BACKWARD_WITH_KEYBOARD);
                    _this._engine.seekBackward(AMOUNT_TO_SKIP_SECONDS);
                }, _a));
        };
        ProgressControl.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        ProgressControl.prototype._bindCallbacks = function () {
            this._syncWithLive = this._syncWithLive.bind(this);
            this._onSyncWithLiveMouseEnter = this._onSyncWithLiveMouseEnter.bind(this);
            this._onSyncWithLiveMouseLeave = this._onSyncWithLiveMouseLeave.bind(this);
            this._updateAllIndicators = this._updateAllIndicators.bind(this);
            this._onChangePlayedPercent = this._onChangePlayedPercent.bind(this);
            this._showTooltipAndPreview = this._showTooltipAndPreview.bind(this);
            this._hideTooltip = this._hideTooltip.bind(this);
            this._startProcessingUserDrag = this._startProcessingUserDrag.bind(this);
            this._stopProcessingUserDrag = this._stopProcessingUserDrag.bind(this);
        };
        ProgressControl.prototype._startIntervalUpdates = function () {
            if (this._updateControlInterval) {
                this._stopIntervalUpdates();
            }
            this._updateAllIndicators();
            this._updateControlInterval = window.setInterval(this._updateAllIndicators, UPDATE_PROGRESS_INTERVAL_DELAY);
        };
        ProgressControl.prototype._stopIntervalUpdates = function () {
            window.clearInterval(this._updateControlInterval);
            this._updateControlInterval = null;
        };
        ProgressControl.prototype._convertPlayedPercentToTime = function (percent) {
            var duration = this._engine.getDuration();
            return (duration * percent) / 100;
        };
        ProgressControl.prototype._onChangePlayedPercent = function (percent) {
            var newTime = this._convertPlayedPercentToTime(percent);
            if (this._showFullScreenPreview) {
                this._desiredSeekPosition = newTime;
                this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_USER_PREVIEWING_FRAME, newTime);
            }
            else {
                this._changeCurrentTimeOfVideo(newTime);
            }
            if (this._isUserDragging) {
                this._showTooltipAndPreview(percent);
            }
        };
        ProgressControl.prototype._showTooltipAndPreview = function (percent) {
            var duration = this._engine.getDuration();
            var seekToTime = this._convertPlayedPercentToTime(percent);
            var timeToShow = this._engine.isDynamicContent
                ? seekToTime - duration
                : seekToTime;
            this._previewThumbnail.setTime(formatTime(timeToShow));
            this._previewThumbnail.showAt(seekToTime);
            this.view.showProgressTimeTooltip(this._previewThumbnail.getElement(), percent);
            if (this._isUserDragging && this._showFullScreenPreview) {
                this._previewFullSize.showAt(seekToTime);
            }
        };
        ProgressControl.prototype._hideTooltip = function () {
            if (!this._isUserDragging) {
                this.view.hideProgressTimeTooltip();
            }
        };
        ProgressControl.prototype._startProcessingUserDrag = function () {
            if (!this._isUserDragging) {
                this._isUserDragging = true;
                this._pauseVideoOnDragStart();
                this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_DRAG_STARTED);
                this._eventEmitter.emitAsync(UIEvent$1.CONTROL_DRAG_START);
            }
        };
        ProgressControl.prototype._stopProcessingUserDrag = function () {
            if (this._isUserDragging) {
                this._isUserDragging = false;
                if (this._showFullScreenPreview) {
                    this._shouldHidePreviewOnUpdate = true;
                }
                if (this._showFullScreenPreview) {
                    this._changeCurrentTimeOfVideo(this._desiredSeekPosition);
                }
                this._playVideoOnDragEnd();
                this.view.hideProgressTimeTooltip();
                this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_DRAG_ENDED);
                this._eventEmitter.emitAsync(UIEvent$1.CONTROL_DRAG_END);
            }
        };
        ProgressControl.prototype._hidePreview = function () {
            this._shouldHidePreviewOnUpdate = false;
            this._previewFullSize.hide();
        };
        ProgressControl.prototype._processStateChange = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case EngineState$1.SRC_SET:
                    this._reset();
                    break;
                case EngineState$1.METADATA_LOADED:
                    this._initTimeIndicators();
                    if (this._engine.isSeekAvailable) {
                        this.show();
                    }
                    else {
                        this.hide();
                    }
                    break;
                case EngineState$1.PLAYING:
                    if (this._shouldHidePreviewOnUpdate) {
                        this._hidePreview();
                    }
                    if (this._liveStateEngine.state === LiveState$1.SYNC) {
                        this.view.setPlayed(100);
                    }
                    else {
                        this._startIntervalUpdates();
                    }
                    break;
                case EngineState$1.PAUSED:
                    if (this._shouldHidePreviewOnUpdate) {
                        this._hidePreview();
                    }
                    this._stopIntervalUpdates();
                    break;
                case EngineState$1.SEEK_IN_PROGRESS:
                    this._updateAllIndicators();
                    break;
                default:
                    break;
            }
        };
        ProgressControl.prototype._processLiveStateChange = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case LiveState$1.NONE:
                    this.view.setLiveSyncState(false);
                    this.view.setUsualMode();
                    break;
                case LiveState$1.INITIAL:
                    this.view.setLiveMode();
                    break;
                case LiveState$1.SYNC:
                    this.view.setLiveSyncState(true);
                    break;
                case LiveState$1.NOT_SYNC:
                    this.view.setLiveSyncState(false);
                    break;
                case LiveState$1.ENDED:
                    this.view.setLiveSyncState(false);
                    this.view.hideSyncWithLive();
                    // ensure progress indicators show latest info
                    if (this._engine.getCurrentState() === EngineState$1.PLAYING) {
                        this._startIntervalUpdates();
                    }
                    else {
                        this._updateAllIndicators();
                    }
                    break;
                default:
                    break;
            }
        };
        ProgressControl.prototype._changeCurrentTimeOfVideo = function (newTime) {
            var duration = this._engine.getDuration();
            if (this._engine.isDynamicContent && duration === newTime) {
                this._engine.syncWithLive();
            }
            else {
                this._engine.seekTo(newTime);
            }
            this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_CHANGE, newTime);
        };
        ProgressControl.prototype._pauseVideoOnDragStart = function () {
            var currentState = this._engine.getCurrentState();
            if (currentState === EngineState$1.PLAYING ||
                currentState === EngineState$1.PLAY_REQUESTED) {
                this._shouldPlayAfterDragEnd = true;
                this._engine.pause();
            }
            this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_DRAG_STARTED);
        };
        ProgressControl.prototype._playVideoOnDragEnd = function () {
            if (this._shouldPlayAfterDragEnd) {
                this._engine.play();
                this._shouldPlayAfterDragEnd = false;
            }
        };
        ProgressControl.prototype._updateBufferIndicator = function () {
            var currentTime = this._engine.getCurrentTime();
            var buffered = this._engine.getBuffered();
            var duration = this._engine.getDuration();
            this._setBuffered(getOverallBufferedPercent(buffered, currentTime, duration));
        };
        ProgressControl.prototype._updatePlayedIndicator = function () {
            if (this._liveStateEngine.state === LiveState$1.SYNC) {
                // TODO: mb use this.updatePlayed(100) here?
                return;
            }
            var currentTime = this._engine.getCurrentTime();
            var duration = this._engine.getDuration();
            this._setPlayed(getOverallPlayedPercent(currentTime, duration));
        };
        ProgressControl.prototype._updateAllIndicators = function () {
            this._updatePlayedIndicator();
            this._updateBufferIndicator();
        };
        ProgressControl.prototype._initTimeIndicators = function () {
            var _this = this;
            this._timeIndicatorsToAdd.forEach(function (time) {
                _this._addTimeIndicator(time);
            });
            this._timeIndicatorsToAdd = [];
        };
        ProgressControl.prototype._addTimeIndicator = function (time) {
            var durationTime = this._engine.getDuration();
            if (time > durationTime) {
                // TODO: log error for developers
                return;
            }
            this.view.addTimeIndicator(getTimePercent(time, durationTime));
        };
        ProgressControl.prototype._syncWithLive = function () {
            this._engine.syncWithLive();
        };
        ProgressControl.prototype._onSyncWithLiveMouseEnter = function () {
            this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_SYNC_BUTTON_MOUSE_ENTER);
        };
        ProgressControl.prototype._onSyncWithLiveMouseLeave = function () {
            this._eventEmitter.emitAsync(UIEvent$1.PROGRESS_SYNC_BUTTON_MOUSE_LEAVE);
        };
        ProgressControl.prototype._setPlayed = function (percent) {
            this.view.setPlayed(percent);
        };
        ProgressControl.prototype._setBuffered = function (percent) {
            this.view.setBuffered(percent);
        };
        ProgressControl.prototype._reset = function () {
            this._setPlayed(0);
            this._setBuffered(0);
            this.clearTimeIndicators();
        };
        /**
         * Player will show full screen preview instead of actual seek on video when user drag the progress control
         * @example
         * player.showPreviewOnProgressDrag();
         */
        ProgressControl.prototype.showPreviewOnProgressDrag = function () {
            this._showFullScreenPreview = true;
        };
        /**
         * Player will seek on video when user drag the progress control
         * @example
         * player.seekOnProgressDrag();
         */
        ProgressControl.prototype.seekOnProgressDrag = function () {
            this._showFullScreenPreview = false;
        };
        /**
         * Add time indicator to progress bar
         */
        ProgressControl.prototype.addTimeIndicator = function (time) {
            this.addTimeIndicators([time]);
        };
        /**
         * Add time indicators to progress bar
         */
        ProgressControl.prototype.addTimeIndicators = function (times) {
            var _this = this;
            var _a;
            if (!this._engine.isMetadataLoaded) {
                // NOTE: Add indicator after metadata loaded
                (_a = this._timeIndicatorsToAdd).push.apply(_a, times);
                return;
            }
            times.forEach(function (time) {
                _this._addTimeIndicator(time);
            });
        };
        /**
         * Delete all time indicators from progress bar
         */
        ProgressControl.prototype.clearTimeIndicators = function () {
            this.view.clearTimeIndicators();
        };
        ProgressControl.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        ProgressControl.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        ProgressControl.prototype.destroy = function () {
            this._destroyInterceptor();
            this._stopIntervalUpdates();
            this._unbindEvents();
            this.view.destroy();
        };
        ProgressControl.moduleName = 'progressControl';
        ProgressControl.View = ProgressView;
        ProgressControl.dependencies = [
            'engine',
            'liveStateEngine',
            'eventEmitter',
            'textMap',
            'tooltipService',
            'theme',
            'previewThumbnail',
            'previewFullSize',
        ];
        __decorate([
            playerAPI()
        ], ProgressControl.prototype, "showPreviewOnProgressDrag", null);
        __decorate([
            playerAPI()
        ], ProgressControl.prototype, "seekOnProgressDrag", null);
        __decorate([
            playerAPI()
        ], ProgressControl.prototype, "addTimeIndicator", null);
        __decorate([
            playerAPI()
        ], ProgressControl.prototype, "addTimeIndicators", null);
        __decorate([
            playerAPI()
        ], ProgressControl.prototype, "clearTimeIndicators", null);
        return ProgressControl;
    }());

    function dot_tpl_src_modules_ui_controls_play_templates_control_dot(props
    ) {
    var out='<div class="'+(props.styles.playControl)+'" data-webplayer-hook="playback-control"> <button class="'+(props.styles.playbackToggle)+' '+(props.styles.controlButton)+'" data-webplayer-hook="playback-control" aria-label="'+(props.texts.label)+'" type="button" tabindex="0"> <div class="'+(props.styles.playIcon)+'"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_small)+'" width="100%"> <path class="'+(props.themeStyles.playSvgFill)+'" d="M8 6v14l10.25-7.18L8 6z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_big)+'" width="100%"> <path class="'+(props.themeStyles.playSvgFill)+'" d="M10 7v21l16-11L10 7z"/> </svg> </div> <div class="'+(props.styles.pauseIcon)+'"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_small)+'" width="100%"> <path class="'+(props.themeStyles.playSvgFill)+'" d="M15 6h3v14h-3V6zM8 6h3v14H8V6z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_big)+'" width="100%"> <path class="'+(props.themeStyles.playSvgFill)+'" d="M10 7h5v21h-5V7zm10 0h5v21h-5V7z"/> </svg> </div> </button></div>';return out;
    }

    var controlTemplate = dot_tpl_src_modules_ui_controls_play_templates_control_dot.default ? dot_tpl_src_modules_ui_controls_play_templates_control_dot.default : dot_tpl_src_modules_ui_controls_play_templates_control_dot;

    var playViewTheme = {
        playSvgFill: {
            fill: function (data) { return data.color; },
        },
    };

    var css$14 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.play__controlButton___3PoOY {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.play__controlButton___3PoOY:hover {\n    opacity: .7; }\n.play__hidden___1tNO8 {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.play__playControl___1AgWy {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start; }\n.play__playbackToggle___3tzyO {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .play__playbackToggle___3tzyO {\n    width: 35px;\n    min-width: 35px;\n    height: 35px;\n    min-height: 35px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .play__playbackToggle___3tzyO .play__icon_small___jluYF {\n      display: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .play__playbackToggle___3tzyO .play__icon_big___2HowC {\n      display: block; }\n.play__playbackToggle___3tzyO .play__playIcon___2ypel {\n    display: none; }\n.play__playbackToggle___3tzyO .play__pauseIcon___3To0L {\n    display: block; }\n.play__playbackToggle___3tzyO.play__paused___2fI5f .play__playIcon___2ypel {\n    display: block; }\n.play__playbackToggle___3tzyO.play__paused___2fI5f .play__pauseIcon___3To0L {\n    display: none; }\n.play__playbackToggle___3tzyO .play__icon_small___jluYF {\n    display: block; }\n.play__playbackToggle___3tzyO .play__icon_big___2HowC {\n    display: none; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsYXkuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNIO0VBQ0UscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCxXQUFXO0VBQ1gsZ0JBQWdCO0VBQ2hCLGlDQUF5QjtVQUF6Qix5QkFBeUI7RUFDekIscUNBQTZCO0VBQTdCLDZCQUE2QjtFQUM3QixXQUFXO0VBQ1gsVUFBVTtFQUNWLGlCQUFpQjtFQUNqQixjQUFjO0VBQ2QsOEJBQThCO0VBQzlCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSw4QkFBOEI7RUFDOUIsb0JBQW9CO0VBQ3BCLHdCQUF3QjtFQUN4QixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixzQkFBc0I7RUFDdEIsc0JBQXNCLEVBQUU7QUFFMUI7RUFDRSxtQkFBbUI7RUFDbkIscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCwrQkFBdUI7VUFBdkIsdUJBQXVCO0VBQ3ZCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CO0VBQ3BCLHdCQUE0QjtNQUE1QixxQkFBNEI7VUFBNUIsNEJBQTRCLEVBQUU7QUFFaEM7RUFDRSxZQUFZO0VBQ1osZ0JBQWdCO0VBQ2hCLGFBQWE7RUFDYixpQkFBaUIsRUFBRTtBQUNuQjtJQUNFLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGlCQUFpQixFQUFFO0FBQ25CO01BQ0UsY0FBYyxFQUFFO0FBQ2xCO01BQ0UsZUFBZSxFQUFFO0FBQ3JCO0lBQ0UsY0FBYyxFQUFFO0FBQ2xCO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsY0FBYyxFQUFFO0FBQ2xCO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsY0FBYyxFQUFFIiwiZmlsZSI6InBsYXkuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4ucGxheUNvbnRyb2wge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDsgfVxuXG4ucGxheWJhY2tUb2dnbGUge1xuICB3aWR0aDogMjZweDtcbiAgbWluLXdpZHRoOiAyNnB4O1xuICBoZWlnaHQ6IDI2cHg7XG4gIG1pbi1oZWlnaHQ6IDI2cHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5wbGF5YmFja1RvZ2dsZSB7XG4gICAgd2lkdGg6IDM1cHg7XG4gICAgbWluLXdpZHRoOiAzNXB4O1xuICAgIGhlaWdodDogMzVweDtcbiAgICBtaW4taGVpZ2h0OiAzNXB4OyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5wbGF5YmFja1RvZ2dsZSAuaWNvbl9zbWFsbCB7XG4gICAgICBkaXNwbGF5OiBub25lOyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5wbGF5YmFja1RvZ2dsZSAuaWNvbl9iaWcge1xuICAgICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLnBsYXliYWNrVG9nZ2xlIC5wbGF5SWNvbiB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAucGxheWJhY2tUb2dnbGUgLnBhdXNlSWNvbiB7XG4gICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLnBsYXliYWNrVG9nZ2xlLnBhdXNlZCAucGxheUljb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5wbGF5YmFja1RvZ2dsZS5wYXVzZWQgLnBhdXNlSWNvbiB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAucGxheWJhY2tUb2dnbGUgLmljb25fc21hbGwge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5wbGF5YmFja1RvZ2dsZSAuaWNvbl9iaWcge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cbiJdfQ== */";
    var styles$14 = {"controlButton":"play__controlButton___3PoOY","hidden":"play__hidden___1tNO8","playControl":"play__playControl___1AgWy","playbackToggle":"play__playbackToggle___3tzyO","icon_small":"play__icon_small___jluYF","icon_big":"play__icon_big___2HowC","playIcon":"play__playIcon___2ypel","pauseIcon":"play__pauseIcon___3To0L","paused":"play__paused___2fI5f"};
    styleInject(css$14);

    var DATA_IS_PLAYING = 'data-webplayer-is-playing';
    var PlayView = /** @class */ (function (_super) {
        __extends(PlayView, _super);
        function PlayView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._$rootElement = htmlToElement(controlTemplate({
                styles: _this.styleNames,
                themeStyles: _this.themeStyles,
                texts: {
                    label: _this._textMap.get(TextLabel$1.PLAY_CONTROL_LABEL),
                },
            }));
            _this._$playbackControl = getElementByHook(_this._$rootElement, 'playback-control');
            _this.setPlayingState(false);
            _this._bindEvents();
            return _this;
        }
        PlayView.prototype._bindEvents = function () {
            this._onButtonClick = this._onButtonClick.bind(this);
            this._$playbackControl.addEventListener('click', this._onButtonClick);
        };
        PlayView.prototype._unbindEvents = function () {
            this._$playbackControl.removeEventListener('click', this._onButtonClick);
        };
        PlayView.prototype._onButtonClick = function () {
            this._$playbackControl.focus();
            this._callbacks.onButtonClick();
        };
        PlayView.prototype.setPlayingState = function (isPlaying) {
            if (isPlaying) {
                this._$playbackControl.classList.remove(this.styleNames.paused);
                this._$playbackControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.PAUSE_CONTROL_LABEL));
            }
            else {
                this._$playbackControl.classList.add(this.styleNames.paused);
                this._$playbackControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.PLAY_CONTROL_LABEL));
            }
            this._$rootElement.setAttribute(DATA_IS_PLAYING, String(isPlaying));
        };
        PlayView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        PlayView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        PlayView.prototype.getElement = function () {
            return this._$rootElement;
        };
        PlayView.prototype.destroy = function () {
            this._unbindEvents();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$playbackControl = null;
            this._$rootElement = null;
        };
        return PlayView;
    }(View));
    PlayView.setTheme(playViewTheme);
    PlayView.extendStyleNames(styles$14);

    var PlayControl = /** @class */ (function () {
        function PlayControl(_a) {
            var engine = _a.engine, eventEmitter = _a.eventEmitter, textMap = _a.textMap, theme = _a.theme;
            this._engine = engine;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._theme = theme;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this._initInterceptor();
        }
        PlayControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        PlayControl.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.TOGGLE_PLAYBACK_WITH_KEYBOARD);
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.TOGGLE_PLAYBACK_WITH_KEYBOARD);
                }, _a));
        };
        PlayControl.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        PlayControl.prototype._bindCallbacks = function () {
            this._togglePlayback = this._togglePlayback.bind(this);
        };
        PlayControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([[VideoEvent$1.STATE_CHANGED, this._updatePlayingState]], this);
        };
        PlayControl.prototype._togglePlayback = function () {
            if (this._engine.isPaused) {
                this._playVideo();
            }
            else {
                this._pauseVideo();
            }
        };
        PlayControl.prototype._playVideo = function () {
            this._engine.play();
            this._eventEmitter.emitAsync(UIEvent$1.PLAY_CLICK);
        };
        PlayControl.prototype._pauseVideo = function () {
            this._engine.pause();
            this._eventEmitter.emitAsync(UIEvent$1.PAUSE_CLICK);
        };
        PlayControl.prototype._updatePlayingState = function () {
            this.view.setPlayingState(!this._engine.isPaused);
        };
        PlayControl.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onButtonClick: this._togglePlayback,
                },
                theme: this._theme,
                textMap: this._textMap,
            };
            this.view = new PlayControl.View(config);
        };
        PlayControl.prototype.destroy = function () {
            this._destroyInterceptor();
            this._unbindEvents();
            this.view.destroy();
        };
        PlayControl.moduleName = 'playControl';
        PlayControl.View = PlayView;
        PlayControl.dependencies = ['engine', 'eventEmitter', 'textMap', 'theme'];
        return PlayControl;
    }());

    function dot_tpl_src_modules_ui_controls_time_templates_time_dot(props
    ) {
    var out='<div data-webplayer-hook="time-control" class="'+(props.styles.timeWrapper)+' '+(props.themeStyles.timeText)+'"> <span data-webplayer-hook="current-time-indicator" class="'+(props.styles.time)+'"> </span> <span data-webplayer-hook="duration-time-indicator" class="'+(props.styles.time)+' '+(props.styles.duration)+'"> </span></div>';return out;
    }

    var timeTemplate = dot_tpl_src_modules_ui_controls_time_templates_time_dot.default ? dot_tpl_src_modules_ui_controls_time_templates_time_dot.default : dot_tpl_src_modules_ui_controls_time_templates_time_dot;

    var timeViewTheme = {
        timeText: {
            color: function (data) { return data.color; },
        },
    };

    var css$15 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.time__controlButton___mpXuO {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.time__controlButton___mpXuO:hover {\n    opacity: .7; }\n.time__hidden___3xnRl {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.time__timeWrapper___1r8hO {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  height: 25px;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.time__time___10Maj {\n  font-size: 12px;\n  line-height: 12px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .time__time___10Maj {\n    font-size: 14px;\n    line-height: 14px; }\n.time__duration___3gaxd {\n  margin-left: 5px; }\n.time__duration___3gaxd:before {\n    margin-right: 4px;\n    content: '/'; }\n.time__liveMode___2Nolg .time__separator___hIpG9 {\n  display: none; }\n.time__liveMode___2Nolg .time__duration___3gaxd {\n  display: none; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRpbWUuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNIO0VBQ0UscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCxXQUFXO0VBQ1gsZ0JBQWdCO0VBQ2hCLGlDQUF5QjtVQUF6Qix5QkFBeUI7RUFDekIscUNBQTZCO0VBQTdCLDZCQUE2QjtFQUM3QixXQUFXO0VBQ1gsVUFBVTtFQUNWLGlCQUFpQjtFQUNqQixjQUFjO0VBQ2QsOEJBQThCO0VBQzlCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSw4QkFBOEI7RUFDOUIsb0JBQW9CO0VBQ3BCLHdCQUF3QjtFQUN4QixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLHFCQUFxQjtFQUNyQixzQkFBc0I7RUFDdEIsc0JBQXNCLEVBQUU7QUFFMUI7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLG9CQUFlO01BQWYsbUJBQWU7VUFBZixlQUFlO0VBQ2YsYUFBYTtFQUNiLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFFeEI7RUFDRSxnQkFBZ0I7RUFDaEIsa0JBQWtCLEVBQUU7QUFDcEI7SUFDRSxnQkFBZ0I7SUFDaEIsa0JBQWtCLEVBQUU7QUFFeEI7RUFDRSxpQkFBaUIsRUFBRTtBQUNuQjtJQUNFLGtCQUFrQjtJQUNsQixhQUFhLEVBQUU7QUFFbkI7RUFDRSxjQUFjLEVBQUU7QUFFbEI7RUFDRSxjQUFjLEVBQUUiLCJmaWxlIjoidGltZS5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgY2hhbGxlbmdlIGhlcmUgdG8gc3VwcG9ydCBcInBsYXlhYmxlIHF1ZXJpZXNcIiBhbmQgXCJkaXJlY3Rpb25cIiBhdCB0aGUgc2FtZSB0aW1lIGFuZCBhbGxvdyBtaXhpbnMgbGlrZTpcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpKVxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCksIGx0cigpKVxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCksIHJ0bCgpKVxuICovXG4uY29udHJvbEJ1dHRvbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIHBhZGRpbmc6IDA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbi1kdXJhdGlvbjogLjJzO1xuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBvcGFjaXR5O1xuICBvcGFjaXR5OiAxO1xuICBib3JkZXI6IDA7XG4gIGJvcmRlci1yYWRpdXM6IDA7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICAuY29udHJvbEJ1dHRvbjpob3ZlciB7XG4gICAgb3BhY2l0eTogLjc7IH1cblxuLmhpZGRlbiB7XG4gIHZpc2liaWxpdHk6IGhpZGRlbiAhaW1wb3J0YW50O1xuICB3aWR0aDogMCAhaW1wb3J0YW50O1xuICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDtcbiAgaGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1pbi1oZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7XG4gIHBhZGRpbmc6IDAgIWltcG9ydGFudDtcbiAgb3BhY2l0eTogMCAhaW1wb3J0YW50OyB9XG5cbi50aW1lV3JhcHBlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXg6IDAgMCBhdXRvO1xuICBoZWlnaHQ6IDI1cHg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cblxuLnRpbWUge1xuICBmb250LXNpemU6IDEycHg7XG4gIGxpbmUtaGVpZ2h0OiAxMnB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudGltZSB7XG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNHB4OyB9XG5cbi5kdXJhdGlvbiB7XG4gIG1hcmdpbi1sZWZ0OiA1cHg7IH1cbiAgLmR1cmF0aW9uOmJlZm9yZSB7XG4gICAgbWFyZ2luLXJpZ2h0OiA0cHg7XG4gICAgY29udGVudDogJy8nOyB9XG5cbi5saXZlTW9kZSAuc2VwYXJhdG9yIHtcbiAgZGlzcGxheTogbm9uZTsgfVxuXG4ubGl2ZU1vZGUgLmR1cmF0aW9uIHtcbiAgZGlzcGxheTogbm9uZTsgfVxuIl19 */";
    var styles$15 = {"controlButton":"time__controlButton___mpXuO","hidden":"time__hidden___3xnRl","timeWrapper":"time__timeWrapper___1r8hO","time":"time__time___10Maj","duration":"time__duration___3gaxd","liveMode":"time__liveMode___2Nolg","separator":"time__separator___hIpG9"};
    styleInject(css$15);

    var DATA_DURATION = 'data-webplayer-duration';
    var DATA_CURRENT_TIME = 'data-webplayer-current-time';
    var TimeView = /** @class */ (function (_super) {
        __extends(TimeView, _super);
        function TimeView(config) {
            var _this = this;
            var theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._initDOM();
            return _this;
        }
        TimeView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(timeTemplate({ styles: this.styleNames, themeStyles: this.themeStyles }));
            this._$currentTime = getElementByHook(this._$rootElement, 'current-time-indicator');
            this._$durationTime = getElementByHook(this._$rootElement, 'duration-time-indicator');
        };
        TimeView.prototype.setDurationTime = function (duration) {
            if (duration !== this._duration) {
                this._duration = duration;
                this._updateDurationTime();
            }
        };
        TimeView.prototype.setCurrentTime = function (current) {
            if (current !== this._current) {
                this._current = current;
                this._updateCurrentTime();
            }
        };
        TimeView.prototype.setCurrentTimeBackward = function (_isBackward) {
            this._isBackward = _isBackward;
            this._updateCurrentTime();
        };
        TimeView.prototype._updateDurationTime = function () {
            this._$durationTime.innerHTML = formatTime(this._duration);
            this._$rootElement.setAttribute(DATA_DURATION, this._duration ? this._duration.toString() : '0');
        };
        TimeView.prototype._updateCurrentTime = function () {
            if (this._isBackward) {
                this._$currentTime.innerHTML = formatTime(this._current - this._duration);
            }
            else {
                this._$currentTime.innerHTML = formatTime(this._current);
            }
            this._$rootElement.setAttribute(DATA_CURRENT_TIME, this._current ? this._current.toString() : '0');
        };
        TimeView.prototype.showDuration = function () {
            this._$durationTime.classList.remove(this.styleNames.hidden);
        };
        TimeView.prototype.hideDuration = function () {
            this._$durationTime.classList.add(this.styleNames.hidden);
        };
        TimeView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        TimeView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        TimeView.prototype.getElement = function () {
            return this._$rootElement;
        };
        TimeView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$currentTime = null;
            this._$durationTime = null;
            this._$rootElement = null;
        };
        return TimeView;
    }(View));
    TimeView.setTheme(timeViewTheme);
    TimeView.extendStyleNames(styles$15);

    var UPDATE_TIME_INTERVAL_DELAY = 1000 / 60;
    var TimeControl = /** @class */ (function () {
        function TimeControl(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine, theme = _a.theme;
            this._eventEmitter = eventEmitter;
            this._engine = engine;
            this._theme = theme;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this._setCurrentTime(0);
            this._setDurationTime(0);
        }
        TimeControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        TimeControl.prototype._bindCallbacks = function () {
            this._updateCurrentTime = this._updateCurrentTime.bind(this);
            this._updateDurationTime = this._updateDurationTime.bind(this);
        };
        TimeControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [UIEvent$1.PROGRESS_USER_PREVIEWING_FRAME, this._updateTimeFromPreview],
                [VideoEvent$1.STATE_CHANGED, this._toggleIntervalUpdates],
                [VideoEvent$1.DURATION_UPDATED, this._updateDurationTime],
                [VideoEvent$1.LIVE_STATE_CHANGED, this._processLiveStateChange],
            ], this);
        };
        TimeControl.prototype._initUI = function () {
            var config = {
                theme: this._theme,
            };
            this.view = new TimeControl.View(config);
        };
        TimeControl.prototype._startIntervalUpdates = function () {
            if (this._updateControlInterval) {
                this._stopIntervalUpdates();
            }
            this._updateCurrentTime();
            this._updateControlInterval = window.setInterval(this._updateCurrentTime, UPDATE_TIME_INTERVAL_DELAY);
        };
        TimeControl.prototype._stopIntervalUpdates = function () {
            window.clearInterval(this._updateControlInterval);
            this._updateControlInterval = null;
        };
        TimeControl.prototype._processLiveStateChange = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case LiveState$1.NONE:
                    this.show();
                    break;
                case LiveState$1.INITIAL:
                    this.hide();
                    break;
                case LiveState$1.ENDED:
                    this.show();
                    break;
                default:
                    break;
            }
        };
        TimeControl.prototype._toggleIntervalUpdates = function (_a) {
            var nextState = _a.nextState;
            switch (nextState) {
                case EngineState$1.SRC_SET:
                    this.reset();
                    break;
                case EngineState$1.PLAYING:
                    this._startIntervalUpdates();
                    break;
                case EngineState$1.SEEK_IN_PROGRESS:
                    this._startIntervalUpdates();
                    break;
                default:
                    this._stopIntervalUpdates();
                    break;
            }
        };
        TimeControl.prototype._updateDurationTime = function () {
            this._setDurationTime(this._engine.getDuration());
        };
        TimeControl.prototype._updateCurrentTime = function () {
            var time = this._engine.getCurrentTime();
            this._setCurrentTime(time);
        };
        TimeControl.prototype._updateTimeFromPreview = function (time) {
            this.view.setCurrentTime(time);
        };
        TimeControl.prototype._setDurationTime = function (time) {
            this.view.setDurationTime(time);
        };
        TimeControl.prototype._setCurrentTime = function (time) {
            this.view.setCurrentTime(time);
        };
        TimeControl.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        TimeControl.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        TimeControl.prototype.reset = function () {
            this._setDurationTime(0);
            this._setCurrentTime(0);
            this.view.showDuration();
            this.view.setCurrentTimeBackward(false);
            this.show();
        };
        TimeControl.prototype.destroy = function () {
            this._stopIntervalUpdates();
            this._unbindEvents();
            this.view.destroy();
        };
        TimeControl.moduleName = 'timeControl';
        TimeControl.View = TimeView;
        TimeControl.dependencies = ['engine', 'eventEmitter', 'theme'];
        return TimeControl;
    }());

    function dot_tpl_src_modules_ui_controls_volume_templates_control_dot(props
    ) {
    var out='<div class="'+(props.styles.volumeControl)+'" data-webplayer-hook="volume-control"> <button class="'+(props.styles.muteToggle)+' '+(props.styles.controlButton)+'" data-webplayer-hook="mute-button" aria-label="'+(props.texts.muteLabel)+'" type="button" tabindex="0"> <div class="'+(props.styles.volume0Icon)+' '+(props.styles.muteIcon)+'"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_small)+'" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.volumeSvgFill)+'" d="M 18.5 14.0476 L 16.154 16.3936 L 15.372 15.6116 L 17.718 13.2656 L 15.372 10.9196 L 16.154 10.1376 L 18.5 12.4836 L 20.846 10.1376 L 21.628 10.9196 L 19.282 13.2656 L 21.628 15.6116 L 20.846 16.3936 L 18.5 14.0476 Z M 7 9.76563 L 13 5.76563 L 13 19.7656 L 7 15.7656 L 4 15.7656 L 4 9.76563 L 7 9.76563 Z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_big)+'" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.volumeSvgFill)+'" d="M23.586 18.04l-2.829-2.828 1.415-1.415L25 16.626l2.828-2.83 1.415 1.416-2.829 2.828 2.829 2.828-1.415 1.415L25 19.453l-2.828 2.83-1.415-1.415 2.829-2.828zM9 13.04l7-5v19l-7-5H5v-9h4z"/> </svg> </div> <div class="'+(props.styles.volume50Icon)+'"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_small)+'" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.volumeSvgFill)+'" d="M 7 9.8025 L 13 5.8025 L 13 19.8025 L 7 15.8025 L 4 15.8025 L 4 9.8025 L 7 9.8025 Z M 17.243 17.4285 L 16.216 16.4025 A 4.548 4.548 0 0 0 16.216 9.9705 L 17.243 8.9435 A 6 6 0 0 1 17.243 17.4285 Z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_big)+'" width="100%"> <path class="'+(props.themeStyles.volumeSvgFill)+'" d="M9 13l7-5v19l-7-5H5v-9h4zm12.884 11.407l-1.414-1.414a7.174 7.174 0 000-10.146l1.414-1.414a9.174 9.174 0 010 12.974z" fill-rule="evenodd"/> </svg> </div> <div class="'+(props.styles.volume100Icon)+'"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_small)+'" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.volumeSvgFill)+'" d="M 7 9.8025 L 13 5.8025 L 13 19.8025 L 7 15.8025 L 4 15.8025 L 4 9.8025 L 7 9.8025 Z M 20.071 20.1975 L 19.047 19.1725 A 8.552 8.552 0 0 0 19.047 7.0795 L 20.071 6.0545 C 23.976 9.9605 23.976 16.2915 20.071 20.1975 Z M 17.243 17.4285 L 16.216 16.4025 A 4.548 4.548 0 0 0 16.216 9.9705 L 17.243 8.9435 A 6 6 0 0 1 17.243 17.4285 Z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" class="'+(props.styles.icon_big)+'" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.volumeSvgFill)+'" d="M9 13.04l7-5v19l-7-5H5v-9h4zm16.897 15.794l-1.414-1.414c5.237-5.238 5.237-13.73 0-18.966l1.414-1.414c6.018 6.018 6.018 15.776 0 21.794zm-4.013-4.387l-1.414-1.414a7.174 7.174 0 000-10.146l1.414-1.414a9.174 9.174 0 010 12.974z"/> </svg> </div> </button> <div class="'+(props.styles.volumeInputBlock)+'" data-webplayer-hook="volume-input-block" aria-label="'+(props.texts.volumeLabel)+'" aria-valuemin="0" aria-valuenow="0" aria-valuemax="100" tabindex="0"> <div class="'+(props.styles.progressBar)+' '+(props.styles.background)+' '+(props.themeStyles.volumeProgressBackground)+'"> </div> <div class="'+(props.styles.progressBar)+' '+(props.styles.volume)+' '+(props.themeStyles.volumeProgress)+'" data-webplayer-hook="volume-input"> </div> <div class="'+(props.styles.hitbox)+'" data-webplayer-hook="volume-hitbox"> </div> </div></div>';return out;
    }

    var controlTemplate$1 = dot_tpl_src_modules_ui_controls_volume_templates_control_dot.default ? dot_tpl_src_modules_ui_controls_volume_templates_control_dot.default : dot_tpl_src_modules_ui_controls_volume_templates_control_dot;

    var volumeViewTheme = {
        volumeSvgFill: {
            fill: function (data) { return data.color; },
        },
        volumeSvgStroke: {
            stroke: function (data) { return data.color; },
        },
        volumeProgress: {
            backgroundColor: function (data) { return data.color; },
            '&:after': {
                backgroundColor: function (data) { return data.color; },
            },
        },
        volumeProgressBackground: {
            backgroundColor: function (data) {
                return transperentizeColor(data.color, 0.25);
            },
        },
    };

    var css$16 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.volume__controlButton___1XXXG {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.volume__controlButton___1XXXG:hover {\n    opacity: .7; }\n.volume__hidden___504PW {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.volume__volumeControl___1f_-O {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  -webkit-transition: width .2s;\n  transition: width .2s;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__volumeControl___1f_-O {\n    height: 35px; }\n.volume__volumeControl___1f_-O:hover .volume__volumeInputBlock___EzZei, .volume__volumeControl___1f_-O.volume__isDragging___3mlpX .volume__volumeInputBlock___EzZei {\n    width: 50px;\n    margin-right: 5px;\n    opacity: 1; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__volumeControl___1f_-O:hover .volume__volumeInputBlock___EzZei, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__volumeControl___1f_-O.volume__isDragging___3mlpX .volume__volumeInputBlock___EzZei {\n      width: 90px;\n      margin-right: 10px; }\n.volume__volume0Icon___HUzhQ {\n  display: none; }\n.volume__volume50Icon___2qxWM {\n  display: none; }\n.volume__volume100Icon___3RP1S {\n  display: none; }\n.volume__muteIcon___3usXq {\n  display: none; }\n.volume__muteToggle___26zPy {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px;\n  padding: 0; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__muteToggle___26zPy {\n    width: 35px;\n    min-width: 35px;\n    height: 35px;\n    min-height: 35px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__muteToggle___26zPy .volume__icon_small___3WQH2 {\n      display: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__muteToggle___26zPy .volume__icon_big___3-Lie {\n      display: block; }\n.volume__muteToggle___26zPy.volume__volume0___3Yvhr .volume__volume0Icon___HUzhQ {\n    display: block; }\n.volume__muteToggle___26zPy.volume__volume50___2zDH8 .volume__volume50Icon___2qxWM {\n    display: block; }\n.volume__muteToggle___26zPy.volume__volume100___1qN8v .volume__volume100Icon___3RP1S {\n    display: block; }\n.volume__muteToggle___26zPy.volume__muted___2jeGx .volume__volume0Icon___HUzhQ {\n    display: block; }\n.volume__muteToggle___26zPy .volume__icon_small___3WQH2 {\n    display: block; }\n.volume__muteToggle___26zPy .volume__icon_big___3-Lie {\n    display: none; }\n.volume__volumeInputBlock___EzZei {\n  position: relative;\n  display: block;\n  width: 0;\n  height: 25px;\n  margin-left: 2px;\n  -webkit-transition: opacity .2s, width .2s;\n  transition: opacity .2s, width .2s;\n  opacity: 0; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__volumeInputBlock___EzZei {\n    margin-left: 5px; }\n.volume__progressBar___1JJYW {\n  position: absolute;\n  top: 11.5px;\n  height: 2px;\n  padding: 0; }\n.volume__volume___1XvBT:after {\n  position: absolute;\n  top: -3px;\n  right: -4px;\n  width: 8px;\n  height: 8px;\n  content: '';\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  border-radius: 50%; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .volume__volume___1XvBT:after {\n    top: -4px;\n    right: -5px;\n    width: 10px;\n    height: 10px; }\n.volume__background___2Mafo {\n  width: 100%; }\n.volume__hitbox___1jBrF {\n  position: relative;\n  z-index: 5;\n  display: block;\n  width: 100%;\n  height: 25px;\n  cursor: pointer;\n  opacity: 0; }\n[data-webplayer-focus-source='key'] [data-webplayer-hook='volume-control'] .focus-within.volume__volumeInputBlock___EzZei,\n[data-webplayer-focus-source='script'] [data-webplayer-hook='volume-control'] .focus-within.volume__volumeInputBlock___EzZei {\n  width: 50px;\n  margin-right: 5px;\n  opacity: 1;\n  -webkit-box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8);\n          box-shadow: 0 0 0 2px rgba(56, 153, 236, 0.8); }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] [data-webplayer-focus-source='key'] [data-webplayer-hook='volume-control'] .focus-within.volume__volumeInputBlock___EzZei, [data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"]\n  [data-webplayer-focus-source='script'] [data-webplayer-hook='volume-control'] .focus-within.volume__volumeInputBlock___EzZei {\n    width: 90px;\n    margin-right: 10px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZvbHVtZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLDBCQUFrQjtLQUFsQix1QkFBa0I7TUFBbEIsc0JBQWtCO1VBQWxCLGtCQUFrQjtFQUNsQiw4QkFBc0I7RUFBdEIsc0JBQXNCO0VBQ3RCLHdCQUE0QjtNQUE1QixxQkFBNEI7VUFBNUIsNEJBQTRCO0VBQzVCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxhQUFhLEVBQUU7QUFDakI7SUFDRSxZQUFZO0lBQ1osa0JBQWtCO0lBQ2xCLFdBQVcsRUFBRTtBQUNiO01BQ0UsWUFBWTtNQUNaLG1CQUFtQixFQUFFO0FBRTNCO0VBQ0UsY0FBYyxFQUFFO0FBRWxCO0VBQ0UsY0FBYyxFQUFFO0FBRWxCO0VBQ0UsY0FBYyxFQUFFO0FBRWxCO0VBQ0UsY0FBYyxFQUFFO0FBRWxCO0VBQ0UsWUFBWTtFQUNaLGdCQUFnQjtFQUNoQixhQUFhO0VBQ2IsaUJBQWlCO0VBQ2pCLFdBQVcsRUFBRTtBQUNiO0lBQ0UsWUFBWTtJQUNaLGdCQUFnQjtJQUNoQixhQUFhO0lBQ2IsaUJBQWlCLEVBQUU7QUFDbkI7TUFDRSxjQUFjLEVBQUU7QUFDbEI7TUFDRSxlQUFlLEVBQUU7QUFDckI7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxjQUFjLEVBQUU7QUFFcEI7RUFDRSxtQkFBbUI7RUFDbkIsZUFBZTtFQUNmLFNBQVM7RUFDVCxhQUFhO0VBQ2IsaUJBQWlCO0VBQ2pCLDJDQUFtQztFQUFuQyxtQ0FBbUM7RUFDbkMsV0FBVyxFQUFFO0FBQ2I7SUFDRSxpQkFBaUIsRUFBRTtBQUV2QjtFQUNFLG1CQUFtQjtFQUNuQixZQUFZO0VBQ1osWUFBWTtFQUNaLFdBQVcsRUFBRTtBQUVmO0VBQ0UsbUJBQW1CO0VBQ25CLFVBQVU7RUFDVixZQUFZO0VBQ1osV0FBVztFQUNYLFlBQVk7RUFDWixZQUFZO0VBQ1osZ0NBQXdCO0VBQXhCLHdCQUF3QjtFQUN4QixtQkFBbUIsRUFBRTtBQUNyQjtJQUNFLFVBQVU7SUFDVixZQUFZO0lBQ1osWUFBWTtJQUNaLGFBQWEsRUFBRTtBQUVuQjtFQUNFLFlBQVksRUFBRTtBQUVoQjtFQUNFLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gsZUFBZTtFQUNmLFlBQVk7RUFDWixhQUFhO0VBQ2IsZ0JBQWdCO0VBQ2hCLFdBQVcsRUFBRTtBQUVmOztFQUVFLFlBQVk7RUFDWixrQkFBa0I7RUFDbEIsV0FBVztFQUNYLHNEQUE4QztVQUE5Qyw4Q0FBOEMsRUFBRTtBQUNoRDs7SUFFRSxZQUFZO0lBQ1osbUJBQW1CLEVBQUUiLCJmaWxlIjoidm9sdW1lLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLnZvbHVtZUNvbnRyb2wge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICB0cmFuc2l0aW9uOiB3aWR0aCAuMnM7XG4gIGp1c3RpZnktY29udGVudDogZmxleC1zdGFydDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLnZvbHVtZUNvbnRyb2wge1xuICAgIGhlaWdodDogMzVweDsgfVxuICAudm9sdW1lQ29udHJvbDpob3ZlciAudm9sdW1lSW5wdXRCbG9jaywgLnZvbHVtZUNvbnRyb2wuaXNEcmFnZ2luZyAudm9sdW1lSW5wdXRCbG9jayB7XG4gICAgd2lkdGg6IDUwcHg7XG4gICAgbWFyZ2luLXJpZ2h0OiA1cHg7XG4gICAgb3BhY2l0eTogMTsgfVxuICAgIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudm9sdW1lQ29udHJvbDpob3ZlciAudm9sdW1lSW5wdXRCbG9jaywgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC52b2x1bWVDb250cm9sLmlzRHJhZ2dpbmcgLnZvbHVtZUlucHV0QmxvY2sge1xuICAgICAgd2lkdGg6IDkwcHg7XG4gICAgICBtYXJnaW4tcmlnaHQ6IDEwcHg7IH1cblxuLnZvbHVtZTBJY29uIHtcbiAgZGlzcGxheTogbm9uZTsgfVxuXG4udm9sdW1lNTBJY29uIHtcbiAgZGlzcGxheTogbm9uZTsgfVxuXG4udm9sdW1lMTAwSWNvbiB7XG4gIGRpc3BsYXk6IG5vbmU7IH1cblxuLm11dGVJY29uIHtcbiAgZGlzcGxheTogbm9uZTsgfVxuXG4ubXV0ZVRvZ2dsZSB7XG4gIHdpZHRoOiAyNnB4O1xuICBtaW4td2lkdGg6IDI2cHg7XG4gIGhlaWdodDogMjZweDtcbiAgbWluLWhlaWdodDogMjZweDtcbiAgcGFkZGluZzogMDsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLm11dGVUb2dnbGUge1xuICAgIHdpZHRoOiAzNXB4O1xuICAgIG1pbi13aWR0aDogMzVweDtcbiAgICBoZWlnaHQ6IDM1cHg7XG4gICAgbWluLWhlaWdodDogMzVweDsgfVxuICAgIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAubXV0ZVRvZ2dsZSAuaWNvbl9zbWFsbCB7XG4gICAgICBkaXNwbGF5OiBub25lOyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5tdXRlVG9nZ2xlIC5pY29uX2JpZyB7XG4gICAgICBkaXNwbGF5OiBibG9jazsgfVxuICAubXV0ZVRvZ2dsZS52b2x1bWUwIC52b2x1bWUwSWNvbiB7XG4gICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLm11dGVUb2dnbGUudm9sdW1lNTAgLnZvbHVtZTUwSWNvbiB7XG4gICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLm11dGVUb2dnbGUudm9sdW1lMTAwIC52b2x1bWUxMDBJY29uIHtcbiAgICBkaXNwbGF5OiBibG9jazsgfVxuICAubXV0ZVRvZ2dsZS5tdXRlZCAudm9sdW1lMEljb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5tdXRlVG9nZ2xlIC5pY29uX3NtYWxsIHtcbiAgICBkaXNwbGF5OiBibG9jazsgfVxuICAubXV0ZVRvZ2dsZSAuaWNvbl9iaWcge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cblxuLnZvbHVtZUlucHV0QmxvY2sge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICB3aWR0aDogMDtcbiAgaGVpZ2h0OiAyNXB4O1xuICBtYXJnaW4tbGVmdDogMnB4O1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4ycywgd2lkdGggLjJzO1xuICBvcGFjaXR5OiAwOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAudm9sdW1lSW5wdXRCbG9jayB7XG4gICAgbWFyZ2luLWxlZnQ6IDVweDsgfVxuXG4ucHJvZ3Jlc3NCYXIge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMTEuNXB4O1xuICBoZWlnaHQ6IDJweDtcbiAgcGFkZGluZzogMDsgfVxuXG4udm9sdW1lOmFmdGVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IC0zcHg7XG4gIHJpZ2h0OiAtNHB4O1xuICB3aWR0aDogOHB4O1xuICBoZWlnaHQ6IDhweDtcbiAgY29udGVudDogJyc7XG4gIHRyYW5zaXRpb246IG9wYWNpdHkgLjJzO1xuICBib3JkZXItcmFkaXVzOiA1MCU7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC52b2x1bWU6YWZ0ZXIge1xuICAgIHRvcDogLTRweDtcbiAgICByaWdodDogLTVweDtcbiAgICB3aWR0aDogMTBweDtcbiAgICBoZWlnaHQ6IDEwcHg7IH1cblxuLmJhY2tncm91bmQge1xuICB3aWR0aDogMTAwJTsgfVxuXG4uaGl0Ym94IHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB6LWluZGV4OiA1O1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMjVweDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBvcGFjaXR5OiAwOyB9XG5cbjpnbG9iYWwgW2RhdGEtcGxheWFibGUtZm9jdXMtc291cmNlPSdrZXknXSBbZGF0YS1wbGF5YWJsZS1ob29rPSd2b2x1bWUtY29udHJvbCddIC5mb2N1cy13aXRoaW46bG9jYWwudm9sdW1lSW5wdXRCbG9jayxcbjpnbG9iYWwgW2RhdGEtcGxheWFibGUtZm9jdXMtc291cmNlPSdzY3JpcHQnXSBbZGF0YS1wbGF5YWJsZS1ob29rPSd2b2x1bWUtY29udHJvbCddIC5mb2N1cy13aXRoaW46bG9jYWwudm9sdW1lSW5wdXRCbG9jayB7XG4gIHdpZHRoOiA1MHB4O1xuICBtYXJnaW4tcmlnaHQ6IDVweDtcbiAgb3BhY2l0eTogMTtcbiAgYm94LXNoYWRvdzogMCAwIDAgMnB4IHJnYmEoNTYsIDE1MywgMjM2LCAwLjgpOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSA6Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0na2V5J10gW2RhdGEtcGxheWFibGUtaG9vaz0ndm9sdW1lLWNvbnRyb2wnXSAuZm9jdXMtd2l0aGluOmxvY2FsLnZvbHVtZUlucHV0QmxvY2ssIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXVxuICA6Z2xvYmFsIFtkYXRhLXBsYXlhYmxlLWZvY3VzLXNvdXJjZT0nc2NyaXB0J10gW2RhdGEtcGxheWFibGUtaG9vaz0ndm9sdW1lLWNvbnRyb2wnXSAuZm9jdXMtd2l0aGluOmxvY2FsLnZvbHVtZUlucHV0QmxvY2sge1xuICAgIHdpZHRoOiA5MHB4O1xuICAgIG1hcmdpbi1yaWdodDogMTBweDsgfVxuIl19 */";
    var styles$16 = {"controlButton":"volume__controlButton___1XXXG","hidden":"volume__hidden___504PW","volumeControl":"volume__volumeControl___1f_-O","volumeInputBlock":"volume__volumeInputBlock___EzZei","isDragging":"volume__isDragging___3mlpX","volume0Icon":"volume__volume0Icon___HUzhQ","volume50Icon":"volume__volume50Icon___2qxWM","volume100Icon":"volume__volume100Icon___3RP1S","muteIcon":"volume__muteIcon___3usXq","muteToggle":"volume__muteToggle___26zPy","icon_small":"volume__icon_small___3WQH2","icon_big":"volume__icon_big___3-Lie","volume0":"volume__volume0___3Yvhr","volume50":"volume__volume50___2zDH8","volume100":"volume__volume100___1qN8v","muted":"volume__muted___2jeGx","progressBar":"volume__progressBar___1JJYW","volume":"volume__volume___1XvBT","background":"volume__background___2Mafo","hitbox":"volume__hitbox___1jBrF"};
    styleInject(css$16);

    var DATA_IS_MUTED = 'data-webplayer-is-muted';
    var DATA_VOLUME = 'data-webplayer-volume-percent';
    var MAX_VOLUME_ICON_RANGE = 50;
    var getPercentBasedOnXPosition$1 = function (event, element) {
        var boundingRect = element.getBoundingClientRect();
        var positionX = event.clientX;
        if (positionX < boundingRect.left) {
            return 0;
        }
        if (positionX > boundingRect.left + boundingRect.width) {
            return 100;
        }
        return ((event.clientX - boundingRect.left) / boundingRect.width) * 100;
    };
    var VolumeView = /** @class */ (function (_super) {
        __extends(VolumeView, _super);
        function VolumeView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._tooltipService = tooltipService;
            _this._bindCallbacks();
            _this._initDOM();
            _this._bindEvents();
            return _this;
        }
        VolumeView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(controlTemplate$1({
                styles: this.styleNames,
                themeStyles: this.themeStyles,
                texts: {
                    muteLabel: this._textMap.get(TextLabel$1.MUTE_CONTROL_LABEL),
                    volumeLabel: this._textMap.get(TextLabel$1.VOLUME_CONTROL_LABEL),
                },
            }));
            this._$muteToggle = getElementByHook(this._$rootElement, 'mute-button');
            this._$volumeContainer = getElementByHook(this._$rootElement, 'volume-input-block');
            this._$hitbox = getElementByHook(this._$rootElement, 'volume-hitbox');
            this._$volume = getElementByHook(this._$rootElement, 'volume-input');
            this._muteToggleTooltipReference = this._tooltipService.createReference(this._$muteToggle, {
                text: this._textMap.get(TextLabel$1.MUTE_CONTROL_TOOLTIP),
            });
        };
        VolumeView.prototype._bindCallbacks = function () {
            this._onButtonClick = this._onButtonClick.bind(this);
            this._startDragOnMouseDown = this._startDragOnMouseDown.bind(this);
            this._stopDragOnMouseUp = this._stopDragOnMouseUp.bind(this);
            this._setVolumeByWheel = this._setVolumeByWheel.bind(this);
            this._setVolumeByClick = this._setVolumeByClick.bind(this);
            this._setVolumeByDrag = this._setVolumeByDrag.bind(this);
        };
        VolumeView.prototype._bindEvents = function () {
            this._$hitbox.addEventListener('wheel', this._setVolumeByWheel);
            this._$hitbox.addEventListener('mousedown', this._startDragOnMouseDown);
            window.addEventListener('mousemove', this._setVolumeByDrag);
            window.addEventListener('mouseup', this._stopDragOnMouseUp);
            this._$muteToggle.addEventListener('click', this._onButtonClick);
        };
        VolumeView.prototype._unbindEvents = function () {
            this._$hitbox.removeEventListener('wheel', this._setVolumeByWheel);
            this._$hitbox.removeEventListener('mousedown', this._startDragOnMouseDown);
            window.removeEventListener('mousemove', this._setVolumeByDrag);
            window.removeEventListener('mouseup', this._stopDragOnMouseUp);
            this._$muteToggle.removeEventListener('click', this._onButtonClick);
        };
        VolumeView.prototype._startDragOnMouseDown = function (event) {
            if (event.button > 1) {
                return;
            }
            this._setVolumeByClick(event);
            this._startDrag();
        };
        VolumeView.prototype._stopDragOnMouseUp = function (event) {
            if (event.button > 1) {
                return;
            }
            this._stopDrag();
        };
        VolumeView.prototype._setVolumeByClick = function (event) {
            this._$volumeContainer.focus();
            var percent = getPercentBasedOnXPosition$1(event, this._$hitbox);
            this._callbacks.onVolumeLevelChangeFromInput(percent);
        };
        VolumeView.prototype._setVolumeByDrag = function (event) {
            var percent = getPercentBasedOnXPosition$1(event, this._$hitbox);
            if (this._isDragging) {
                this._callbacks.onVolumeLevelChangeFromInput(percent);
            }
        };
        VolumeView.prototype._setVolumeByWheel = function (e) {
            e.preventDefault();
            var value = e.deltaX || e.deltaY * -1;
            if (!value) {
                return;
            }
            this._callbacks.onVolumeLevelChangeFromWheel(value);
        };
        VolumeView.prototype._startDrag = function () {
            this._isDragging = true;
            this._$rootElement.classList.add(this.styleNames.isDragging);
            this._callbacks.onDragStart();
        };
        VolumeView.prototype._stopDrag = function () {
            if (this._isDragging) {
                this._isDragging = false;
                this._$rootElement.classList.remove(this.styleNames.isDragging);
                this._callbacks.onDragEnd();
            }
        };
        VolumeView.prototype._setVolumeDOMAttributes = function (percent) {
            this._$volumeContainer.setAttribute('value', String(percent));
            this._$volumeContainer.setAttribute('aria-valuetext', this._textMap.get(TextLabel$1.VOLUME_CONTROL_VALUE, { percent: percent }));
            this._$volumeContainer.setAttribute('aria-valuenow', String(percent));
            this._$volume.setAttribute('style', "width:" + percent + "%;");
            this._$rootElement.setAttribute(DATA_VOLUME, String(percent));
            this._$muteToggle.classList.remove(this.styleNames.volume0);
            this._$muteToggle.classList.remove(this.styleNames.volume50);
            this._$muteToggle.classList.remove(this.styleNames.volume100);
            if (percent >= MAX_VOLUME_ICON_RANGE) {
                this._$muteToggle.classList.add(this.styleNames.volume100);
            }
            else if (percent > 0) {
                this._$muteToggle.classList.add(this.styleNames.volume50);
            }
            else {
                this._$muteToggle.classList.add(this.styleNames.volume0);
            }
        };
        VolumeView.prototype._onButtonClick = function () {
            this._$muteToggle.focus();
            this._callbacks.onToggleMuteClick();
        };
        VolumeView.prototype.setVolume = function (volume) {
            this._setVolumeDOMAttributes(volume);
        };
        VolumeView.prototype.setMute = function (isMuted) {
            this._setMuteDOMAttributes(isMuted);
        };
        VolumeView.prototype._setMuteDOMAttributes = function (isMuted) {
            if (isMuted) {
                this._$muteToggle.classList.add(this.styleNames.muted);
            }
            else {
                this._$muteToggle.classList.remove(this.styleNames.muted);
            }
            this._$muteToggle.setAttribute('aria-label', isMuted
                ? this._textMap.get(TextLabel$1.UNMUTE_CONTROL_LABEL)
                : this._textMap.get(TextLabel$1.MUTE_CONTROL_LABEL));
            this._muteToggleTooltipReference.setText(isMuted
                ? this._textMap.get(TextLabel$1.UNMUTE_CONTROL_TOOLTIP)
                : this._textMap.get(TextLabel$1.MUTE_CONTROL_TOOLTIP));
            this._$rootElement.setAttribute(DATA_IS_MUTED, String(isMuted));
        };
        VolumeView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        VolumeView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        VolumeView.prototype.getElement = function () {
            return this._$rootElement;
        };
        VolumeView.prototype.getButtonElement = function () {
            return this._$muteToggle;
        };
        VolumeView.prototype.getInputElement = function () {
            return this._$volumeContainer;
        };
        VolumeView.prototype.destroy = function () {
            this._unbindEvents();
            this._muteToggleTooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$muteToggle = null;
            this._$rootElement = null;
        };
        return VolumeView;
    }(View));
    VolumeView.setTheme(volumeViewTheme);
    VolumeView.extendStyleNames(styles$16);

    var VolumeControl = /** @class */ (function () {
        function VolumeControl(_a) {
            var engine = _a.engine, eventEmitter = _a.eventEmitter, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme;
            this._engine = engine;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._tooltipService = tooltipService;
            this._theme = theme;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            this.view.setVolume(this._engine.getVolume());
            this.view.setMute(this._engine.isMuted);
            this._initInterceptor();
        }
        VolumeControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        VolumeControl.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onDragStart: this._broadcastDragStart,
                    onDragEnd: this._broadcastDragEnd,
                    onVolumeLevelChangeFromInput: this._getVolumeLevelFromInput,
                    onVolumeLevelChangeFromWheel: this._getVolumeLevelFromWheel,
                    onToggleMuteClick: this._toggleMuteState,
                },
                theme: this._theme,
                textMap: this._textMap,
                tooltipService: this._tooltipService,
            };
            this.view = new VolumeControl.View(config);
        };
        VolumeControl.prototype._initInterceptor = function () {
            var _this = this;
            var _a, _b;
            this._buttonInterceptor = new KeyboardInterceptorCore(this.view.getButtonElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(_this._engine.isMuted
                        ? UIEvent$1.UNMUTE_WITH_KEYBOARD
                        : UIEvent$1.MUTE_WITH_KEYBOARD);
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(_this._engine.isMuted
                        ? UIEvent$1.UNMUTE_WITH_KEYBOARD
                        : UIEvent$1.MUTE_WITH_KEYBOARD);
                }, _a));
            this._inputInterceptor = new KeyboardInterceptorCore(this.view.getInputElement(), (_b = {}, _b[KEYCODES.RIGHT_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.INCREASE_VOLUME_WITH_KEYBOARD);
                    _this._engine.setMute(false);
                    _this._engine.increaseVolume(AMOUNT_TO_CHANGE_VOLUME);
                }, _b[KEYCODES.LEFT_ARROW] = function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._eventEmitter.emitAsync(UIEvent$1.DECREASE_VOLUME_WITH_KEYBOARD);
                    _this._engine.setMute(false);
                    _this._engine.decreaseVolume(AMOUNT_TO_CHANGE_VOLUME);
                }, _b));
        };
        VolumeControl.prototype._destroyInterceptor = function () {
            this._buttonInterceptor.destroy();
            this._inputInterceptor.destroy();
        };
        VolumeControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([[VideoEvent$1.SOUND_STATE_CHANGED, this._updateSoundState]], this);
        };
        VolumeControl.prototype._bindCallbacks = function () {
            this._getVolumeLevelFromInput = this._getVolumeLevelFromInput.bind(this);
            this._toggleMuteState = this._toggleMuteState.bind(this);
            this._getVolumeLevelFromWheel = this._getVolumeLevelFromWheel.bind(this);
            this._broadcastDragStart = this._broadcastDragStart.bind(this);
            this._broadcastDragEnd = this._broadcastDragEnd.bind(this);
        };
        VolumeControl.prototype._broadcastDragStart = function () {
            this._eventEmitter.emitAsync(UIEvent$1.CONTROL_DRAG_START);
        };
        VolumeControl.prototype._broadcastDragEnd = function () {
            this._eventEmitter.emitAsync(UIEvent$1.CONTROL_DRAG_END);
        };
        VolumeControl.prototype._changeVolumeLevel = function (level) {
            this._engine.setVolume(level);
            this._eventEmitter.emitAsync(UIEvent$1.VOLUME_CHANGE, level);
            if (this._engine.isMuted) {
                this._toggleMuteState();
            }
        };
        VolumeControl.prototype._toggleMuteState = function () {
            var desiredMuteState = !this._engine.isMuted;
            this._engine.setMute(desiredMuteState);
            this._eventEmitter.emitAsync(desiredMuteState ? UIEvent$1.MUTE_CLICK : UIEvent$1.UNMUTE_CLICK);
        };
        VolumeControl.prototype._getVolumeLevelFromWheel = function (delta) {
            if (!this._engine.isMuted) {
                var adjustedVolume = this._engine.getVolume() + delta / 10;
                var validatedVolume = Math.min(100, Math.max(0, adjustedVolume));
                this._changeVolumeLevel(validatedVolume);
            }
        };
        VolumeControl.prototype._getVolumeLevelFromInput = function (level) {
            this._changeVolumeLevel(level);
        };
        VolumeControl.prototype._updateSoundState = function () {
            this._setVolumeLevel(this._engine.getVolume());
            this._setMuteState(this._engine.isMuted);
        };
        VolumeControl.prototype._setVolumeLevel = function (level) {
            this.view.setVolume(level);
            this.view.setMute(Boolean(!level));
        };
        VolumeControl.prototype._setMuteState = function (isMuted) {
            var volume = this._engine.getVolume();
            this.view.setVolume(isMuted ? 0 : volume);
            this.view.setMute(isMuted || Boolean(!volume));
        };
        VolumeControl.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        VolumeControl.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        VolumeControl.prototype.destroy = function () {
            this._destroyInterceptor();
            this._unbindEvents();
            this.view.destroy();
        };
        VolumeControl.moduleName = 'volumeControl';
        VolumeControl.View = VolumeView;
        VolumeControl.dependencies = [
            'engine',
            'eventEmitter',
            'textMap',
            'tooltipService',
            'theme',
        ];
        return VolumeControl;
    }());

    function dot_tpl_src_modules_ui_controls_fullScreen_templates_control_dot(props
    ) {
    var out='<div class="'+(props.styles.fullScreenControl)+'" data-webplayer-hook="full-screen-control"> <button class="'+(props.styles.fullScreenToggle)+' '+(props.styles.controlButton)+'" data-webplayer-hook="full-screen-button" aria-label="'+(props.texts.label)+'" type="button" tabindex="0"> <svg class="'+(props.styles.enterIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" width="100%"> <path class="'+(props.themeStyles.fullScreenSvgFill)+'" fill-rule="evenodd" d="M8 16H6v4h4v-2H8v-2zM6 7v3h2V8h2V6H6v1zm14-1h-4v2h2v2h2V6zm-2 12h-2v2h4v-4h-2v2z"/> </svg> <svg class="'+(props.styles.exitIcon)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" preserveAspectRatio="xMidYMin slice" width="100%"> <path class="'+(props.themeStyles.fullScreenSvgFill)+'" fill-rule="evenodd" d="M11 28h2v-6H7v2h4v4zm2-21h-2v4H7v2h6V7zm9 6h6v-2h-4V7h-2v6zm2 11h4v-2h-6v6h2v-4z"/> </svg> </button></div>';return out;
    }

    var controlTemplate$2 = dot_tpl_src_modules_ui_controls_fullScreen_templates_control_dot.default ? dot_tpl_src_modules_ui_controls_fullScreen_templates_control_dot.default : dot_tpl_src_modules_ui_controls_fullScreen_templates_control_dot;

    var fullScreenViewTheme = {
        fullScreenSvgFill: {
            fill: function (data) { return data.color; },
        },
    };

    var css$17 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.full-screen__controlButton___3i-tz {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.full-screen__controlButton___3i-tz:hover {\n    opacity: .7; }\n.full-screen__hidden___3BgVZ {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.full-screen__fullScreenControl___ng08Y {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center; }\n.full-screen__fullScreenToggle___2T_-2 {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px;\n  -webkit-transition: -webkit-transform .2s;\n  transition: -webkit-transform .2s;\n  transition: transform .2s;\n  transition: transform .2s, -webkit-transform .2s; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .full-screen__fullScreenToggle___2T_-2 {\n    width: 35px;\n    height: 35px; }\n.full-screen__fullScreenToggle___2T_-2:hover {\n    -webkit-transform: scale(1.18);\n            transform: scale(1.18); }\n.full-screen__fullScreenToggle___2T_-2 .full-screen__enterIcon___1i13n {\n    display: block; }\n.full-screen__fullScreenToggle___2T_-2 .full-screen__exitIcon___1Q_V5 {\n    display: none; }\n.full-screen__fullScreenToggle___2T_-2.full-screen__inFullScreen___3F0AO:hover {\n    -webkit-transform: scale(0.8);\n            transform: scale(0.8); }\n.full-screen__fullScreenToggle___2T_-2.full-screen__inFullScreen___3F0AO .full-screen__enterIcon___1i13n {\n    display: none; }\n.full-screen__fullScreenToggle___2T_-2.full-screen__inFullScreen___3F0AO .full-screen__exitIcon___1Q_V5 {\n    display: block; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZ1bGwtc2NyZWVuLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0I7RUFDcEIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0IsRUFBRTtBQUU1QjtFQUNFLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsYUFBYTtFQUNiLGlCQUFpQjtFQUNqQiwwQ0FBMEI7RUFBMUIsa0NBQTBCO0VBQTFCLDBCQUEwQjtFQUExQixpREFBMEIsRUFBRTtBQUM1QjtJQUNFLFlBQVk7SUFDWixhQUFhLEVBQUU7QUFDakI7SUFDRSwrQkFBdUI7WUFBdkIsdUJBQXVCLEVBQUU7QUFDM0I7SUFDRSxlQUFlLEVBQUU7QUFDbkI7SUFDRSxjQUFjLEVBQUU7QUFDbEI7SUFDRSw4QkFBc0I7WUFBdEIsc0JBQXNCLEVBQUU7QUFDMUI7SUFDRSxjQUFjLEVBQUU7QUFDbEI7SUFDRSxlQUFlLEVBQUUiLCJmaWxlIjoiZnVsbC1zY3JlZW4uc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4uZnVsbFNjcmVlbkNvbnRyb2wge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XG5cbi5mdWxsU2NyZWVuVG9nZ2xlIHtcbiAgd2lkdGg6IDI2cHg7XG4gIG1pbi13aWR0aDogMjZweDtcbiAgaGVpZ2h0OiAyNnB4O1xuICBtaW4taGVpZ2h0OiAyNnB4O1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gLjJzOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAuZnVsbFNjcmVlblRvZ2dsZSB7XG4gICAgd2lkdGg6IDM1cHg7XG4gICAgaGVpZ2h0OiAzNXB4OyB9XG4gIC5mdWxsU2NyZWVuVG9nZ2xlOmhvdmVyIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMTgpOyB9XG4gIC5mdWxsU2NyZWVuVG9nZ2xlIC5lbnRlckljb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5mdWxsU2NyZWVuVG9nZ2xlIC5leGl0SWNvbiB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAuZnVsbFNjcmVlblRvZ2dsZS5pbkZ1bGxTY3JlZW46aG92ZXIge1xuICAgIHRyYW5zZm9ybTogc2NhbGUoMC44KTsgfVxuICAuZnVsbFNjcmVlblRvZ2dsZS5pbkZ1bGxTY3JlZW4gLmVudGVySWNvbiB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAuZnVsbFNjcmVlblRvZ2dsZS5pbkZ1bGxTY3JlZW4gLmV4aXRJY29uIHtcbiAgICBkaXNwbGF5OiBibG9jazsgfVxuIl19 */";
    var styles$17 = {"controlButton":"full-screen__controlButton___3i-tz","hidden":"full-screen__hidden___3BgVZ","fullScreenControl":"full-screen__fullScreenControl___ng08Y","fullScreenToggle":"full-screen__fullScreenToggle___2T_-2","enterIcon":"full-screen__enterIcon___1i13n","exitIcon":"full-screen__exitIcon___1Q_V5","inFullScreen":"full-screen__inFullScreen___3F0AO"};
    styleInject(css$17);

    var FullScreenView = /** @class */ (function (_super) {
        __extends(FullScreenView, _super);
        function FullScreenView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._$rootElement = htmlToElement(controlTemplate$2({
                styles: _this.styleNames,
                themeStyles: _this.themeStyles,
                texts: {
                    label: _this._textMap.get(TextLabel$1.ENTER_FULL_SCREEN_LABEL),
                },
            }));
            _this._$toggleFullScreenControl = getElementByHook(_this._$rootElement, 'full-screen-button');
            _this._tooltipReference = tooltipService.createReference(_this._$toggleFullScreenControl, {
                text: _this._textMap.get(TextLabel$1.ENTER_FULL_SCREEN_TOOLTIP),
            });
            _this.setFullScreenState(false);
            _this._bindEvents();
            return _this;
        }
        FullScreenView.prototype._bindEvents = function () {
            this._onButtonClick = this._onButtonClick.bind(this);
            this._$toggleFullScreenControl.addEventListener('click', this._onButtonClick);
        };
        FullScreenView.prototype._unbindEvents = function () {
            this._$toggleFullScreenControl.removeEventListener('click', this._onButtonClick);
        };
        FullScreenView.prototype._onButtonClick = function () {
            this._$toggleFullScreenControl.focus();
            this._callbacks.onButtonClick();
        };
        //TODO: No need to create icons every tims on setState
        FullScreenView.prototype.setFullScreenState = function (isInFullScreen) {
            if (isInFullScreen) {
                this._$toggleFullScreenControl.classList.add(this.styleNames.inFullScreen);
                this._$toggleFullScreenControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.EXIT_FULL_SCREEN_LABEL));
                this._tooltipReference.setText(this._textMap.get(TextLabel$1.EXIT_FULL_SCREEN_TOOLTIP));
            }
            else {
                this._$toggleFullScreenControl.classList.remove(this.styleNames.inFullScreen);
                this._$toggleFullScreenControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.ENTER_FULL_SCREEN_LABEL));
                this._tooltipReference.setText(this._textMap.get(TextLabel$1.ENTER_FULL_SCREEN_TOOLTIP));
            }
        };
        FullScreenView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        FullScreenView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        FullScreenView.prototype.getElement = function () {
            return this._$rootElement;
        };
        FullScreenView.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$toggleFullScreenControl = null;
            this._$rootElement = null;
        };
        return FullScreenView;
    }(View));
    FullScreenView.setTheme(fullScreenViewTheme);
    FullScreenView.extendStyleNames(styles$17);

    var FullScreenControl = /** @class */ (function () {
        function FullScreenControl(_a) {
            var eventEmitter = _a.eventEmitter, fullScreenManager = _a.fullScreenManager, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme;
            this._eventEmitter = eventEmitter;
            this._fullScreenManager = fullScreenManager;
            this._textMap = textMap;
            this._theme = theme;
            this._tooltipService = tooltipService;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            if (!this._fullScreenManager.isEnabled) {
                this.hide();
            }
            this._initInterceptor();
        }
        FullScreenControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        FullScreenControl.prototype._bindCallbacks = function () {
            this._toggleFullScreen = this._toggleFullScreen.bind(this);
        };
        FullScreenControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([[UIEvent$1.FULL_SCREEN_STATE_CHANGED, this.view.setFullScreenState]], this.view);
        };
        FullScreenControl.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onButtonClick: this._toggleFullScreen,
                },
                textMap: this._textMap,
                tooltipService: this._tooltipService,
                theme: this._theme,
            };
            this.view = new FullScreenControl.View(config);
        };
        FullScreenControl.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                }, _a));
        };
        FullScreenControl.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        FullScreenControl.prototype._toggleFullScreen = function () {
            if (this._fullScreenManager.isInFullScreen) {
                this._fullScreenManager.exitFullScreen();
                this._eventEmitter.emitAsync(UIEvent$1.EXIT_FULL_SCREEN_CLICK);
            }
            else {
                this._fullScreenManager.enterFullScreen();
                this._eventEmitter.emitAsync(UIEvent$1.ENTER_FULL_SCREEN_CLICK);
            }
        };
        FullScreenControl.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        FullScreenControl.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        FullScreenControl.prototype.destroy = function () {
            this._destroyInterceptor();
            this._unbindEvents();
            this.view.destroy();
        };
        FullScreenControl.moduleName = 'fullScreenControl';
        FullScreenControl.View = FullScreenView;
        FullScreenControl.dependencies = [
            'eventEmitter',
            'fullScreenManager',
            'textMap',
            'tooltipService',
            'theme',
        ];
        return FullScreenControl;
    }());

    function dot_tpl_src_modules_ui_controls_pictureInPicture_templates_control_dot(props
    ) {
    var out='<div class="'+(props.styles.pictureInPictureControl)+'" data-webplayer-hook="picture-in-picture-control" data-is-picture-in-picture="false"> <button class="'+(props.styles.pictureInPictureToggle)+' '+(props.styles.controlButton)+'" data-webplayer-hook="picture-in-picture-control" aria-label="'+(props.texts.label)+'" type="button" tabindex="0"> <div class="'+(props.styles.enterIcon)+'"> <svg class="'+(props.styles.icon_small)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" width="100%"> <g fill-rule="evenodd" class="'+(props.themeStyles.pictureInPictureSvgFill)+'"> <path d="M11 19H5V6h15v5h-2V8H7v9h4v2z"/> <path d="M13 13h9v8h-9v-8zm2 2v4h5v-4h-5z"/> </g> </svg> <svg class="'+(props.styles.icon_big)+'" viewBox="0 0 35 35" version="1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice" width="100%"> <g fill-rule="evenodd" class="'+(props.themeStyles.pictureInPictureSvgFill)+'"> <path d="M14 26H5V7h22v7h-2V9H7v15h7v2z"/> <path d="M17 17h12v11H17V17zm2 2v7h8v-7h-8z"/> </g> </svg> </div> <div class="'+(props.styles.exitIcon)+'"> <svg class="'+(props.styles.icon_small)+'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" preserveAspectRatio="xMidYMin slice" width="100%"> <g fill-rule="evenodd" class="'+(props.themeStyles.pictureInPictureSvgFill)+'"> <path d="M12 19H5V6h15v5h-2V8H7v9h5v2z"/> <path d="M21 15h-7v-2h7v2z"/> <path d="M16 20v-7h-2v7h2z"/> <path d="M21.279 18.95l-1.415 1.414-4.95-4.95L16.329 14l4.95 4.95z"/> </g> </svg> <svg class="'+(props.styles.icon_big)+'" viewBox="0 0 35 35" version="1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin slice" width="100%"> <g fill-rule="evenodd" class="'+(props.themeStyles.pictureInPictureSvgFill)+'"> <path d="M17 26H5V7h22v9h-2V9H7v15h10v2z"/> <path d="M28 21h-8v-2h8v2z"/> <path d="M22 27v-8h-2v8h2z"/> <path d="M29 27l-1 1-7-6 2-2 6 7z"/> </g> </svg> </div> </button></div>';return out;
    }

    var controlTemplate$3 = dot_tpl_src_modules_ui_controls_pictureInPicture_templates_control_dot.default ? dot_tpl_src_modules_ui_controls_pictureInPicture_templates_control_dot.default : dot_tpl_src_modules_ui_controls_pictureInPicture_templates_control_dot;

    var pictureInPictureViewTheme = {
        pictureInPictureSvgFill: {
            fill: function (data) { return data.color; },
        },
    };

    var css$18 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.picture-in-picture__controlButton___1pevT {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.picture-in-picture__controlButton___1pevT:hover {\n    opacity: .7; }\n.picture-in-picture__hidden___19f1_ {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.picture-in-picture__pictureInPictureControl___1NhQu {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center; }\n.picture-in-picture__pictureInPictureToggle___2hEBv {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px;\n  -webkit-transition: -webkit-transform .2s;\n  transition: -webkit-transform .2s;\n  transition: transform .2s;\n  transition: transform .2s, -webkit-transform .2s; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .picture-in-picture__pictureInPictureToggle___2hEBv {\n    width: 35px;\n    min-width: 35px;\n    height: 35px;\n    min-height: 21px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__icon_small___2Aveu {\n      display: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__icon_big___dUOko {\n      display: block; }\n.picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__enterIcon___2um8L {\n    display: block; }\n.picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__exitIcon___HJ8Ie {\n    display: none; }\n.picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__icon_small___2Aveu {\n    display: block; }\n.picture-in-picture__pictureInPictureToggle___2hEBv .picture-in-picture__icon_big___dUOko {\n    display: none; }\n.picture-in-picture__pictureInPictureToggle___2hEBv:hover {\n    -webkit-transform: scale(1.18);\n            transform: scale(1.18); }\n.picture-in-picture__pictureInPictureToggle___2hEBv.picture-in-picture__inPictureInPicture___1cNDf:hover {\n    -webkit-transform: scale(0.8);\n            transform: scale(0.8); }\n.picture-in-picture__pictureInPictureToggle___2hEBv.picture-in-picture__inPictureInPicture___1cNDf .picture-in-picture__enterIcon___2um8L {\n    display: none; }\n.picture-in-picture__pictureInPictureToggle___2hEBv.picture-in-picture__inPictureInPicture___1cNDf .picture-in-picture__exitIcon___HJ8Ie {\n    display: block; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBpY3R1cmUtaW4tcGljdHVyZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CO0VBQ3BCLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCLEVBQUU7QUFFNUI7RUFDRSxZQUFZO0VBQ1osZ0JBQWdCO0VBQ2hCLGFBQWE7RUFDYixpQkFBaUI7RUFDakIsMENBQTBCO0VBQTFCLGtDQUEwQjtFQUExQiwwQkFBMEI7RUFBMUIsaURBQTBCLEVBQUU7QUFDNUI7SUFDRSxZQUFZO0lBQ1osZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixpQkFBaUIsRUFBRTtBQUNuQjtNQUNFLGNBQWMsRUFBRTtBQUNsQjtNQUNFLGVBQWUsRUFBRTtBQUNyQjtJQUNFLGVBQWUsRUFBRTtBQUNuQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGVBQWUsRUFBRTtBQUNuQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLCtCQUF1QjtZQUF2Qix1QkFBdUIsRUFBRTtBQUMzQjtJQUNFLDhCQUFzQjtZQUF0QixzQkFBc0IsRUFBRTtBQUMxQjtJQUNFLGNBQWMsRUFBRTtBQUNsQjtJQUNFLGVBQWUsRUFBRSIsImZpbGUiOiJwaWN0dXJlLWluLXBpY3R1cmUuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLmNvbnRyb2xCdXR0b24ge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogb3BhY2l0eTtcbiAgb3BhY2l0eTogMTtcbiAgYm9yZGVyOiAwO1xuICBib3JkZXItcmFkaXVzOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmNvbnRyb2xCdXR0b246aG92ZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5oaWRkZW4ge1xuICB2aXNpYmlsaXR5OiBoaWRkZW4gIWltcG9ydGFudDtcbiAgd2lkdGg6IDAgIWltcG9ydGFudDtcbiAgbWluLXdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIGhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtaW4taGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1hcmdpbjogMCAhaW1wb3J0YW50O1xuICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XG4gIG9wYWNpdHk6IDAgIWltcG9ydGFudDsgfVxuXG4ucGljdHVyZUluUGljdHVyZUNvbnRyb2wge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XG5cbi5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlIHtcbiAgd2lkdGg6IDI2cHg7XG4gIG1pbi13aWR0aDogMjZweDtcbiAgaGVpZ2h0OiAyNnB4O1xuICBtaW4taGVpZ2h0OiAyNnB4O1xuICB0cmFuc2l0aW9uOiB0cmFuc2Zvcm0gLjJzOyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAucGljdHVyZUluUGljdHVyZVRvZ2dsZSB7XG4gICAgd2lkdGg6IDM1cHg7XG4gICAgbWluLXdpZHRoOiAzNXB4O1xuICAgIGhlaWdodDogMzVweDtcbiAgICBtaW4taGVpZ2h0OiAyMXB4OyB9XG4gICAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlIC5pY29uX3NtYWxsIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLnBpY3R1cmVJblBpY3R1cmVUb2dnbGUgLmljb25fYmlnIHtcbiAgICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlIC5lbnRlckljb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlIC5leGl0SWNvbiB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAucGljdHVyZUluUGljdHVyZVRvZ2dsZSAuaWNvbl9zbWFsbCB7XG4gICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLnBpY3R1cmVJblBpY3R1cmVUb2dnbGUgLmljb25fYmlnIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlOmhvdmVyIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMTgpOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlLmluUGljdHVyZUluUGljdHVyZTpob3ZlciB7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgwLjgpOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlLmluUGljdHVyZUluUGljdHVyZSAuZW50ZXJJY29uIHtcbiAgICBkaXNwbGF5OiBub25lOyB9XG4gIC5waWN0dXJlSW5QaWN0dXJlVG9nZ2xlLmluUGljdHVyZUluUGljdHVyZSAuZXhpdEljb24ge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4iXX0= */";
    var styles$18 = {"controlButton":"picture-in-picture__controlButton___1pevT","hidden":"picture-in-picture__hidden___19f1_","pictureInPictureControl":"picture-in-picture__pictureInPictureControl___1NhQu","pictureInPictureToggle":"picture-in-picture__pictureInPictureToggle___2hEBv","icon_small":"picture-in-picture__icon_small___2Aveu","icon_big":"picture-in-picture__icon_big___dUOko","enterIcon":"picture-in-picture__enterIcon___2um8L","exitIcon":"picture-in-picture__exitIcon___HJ8Ie","inPictureInPicture":"picture-in-picture__inPictureInPicture___1cNDf"};
    styleInject(css$18);

    var PictureInPictureView = /** @class */ (function (_super) {
        __extends(PictureInPictureView, _super);
        function PictureInPictureView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._$rootElement = htmlToElement(controlTemplate$3({
                styles: _this.styleNames,
                themeStyles: _this.themeStyles,
                texts: {
                    label: _this._textMap.get(TextLabel$1.ENTER_PICTURE_IN_PICTURE_LABEL),
                },
            }));
            _this._$togglePictureInPictureControl = getElementByHook(_this._$rootElement, 'picture-in-picture-control');
            _this._tooltipReference = tooltipService.createReference(_this._$togglePictureInPictureControl, {
                text: _this._textMap.get(TextLabel$1.ENTER_PICTURE_IN_PICTURE_TOOLTIP),
            });
            _this.setPictureInPictureState(false);
            _this._bindEvents();
            return _this;
        }
        PictureInPictureView.prototype._bindEvents = function () {
            this._onButtonClick = this._onButtonClick.bind(this);
            this._$togglePictureInPictureControl.addEventListener('click', this._onButtonClick);
        };
        PictureInPictureView.prototype._unbindEvents = function () {
            this._$togglePictureInPictureControl.removeEventListener('click', this._onButtonClick);
        };
        PictureInPictureView.prototype._onButtonClick = function () {
            this._callbacks.onButtonClick();
        };
        PictureInPictureView.prototype.setPictureInPictureState = function (isPictureInPicture) {
            if (isPictureInPicture) {
                this._$togglePictureInPictureControl.classList.add(this.styleNames.inPictureInPicture);
                this._$togglePictureInPictureControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.EXIT_PICTURE_IN_PICTURE_LABEL));
                this._tooltipReference.setText(this._textMap.get(TextLabel$1.EXIT_PICTURE_IN_PICTURE_TOOLTIP));
            }
            else {
                this._$togglePictureInPictureControl.classList.remove(this.styleNames.inPictureInPicture);
                this._$togglePictureInPictureControl.setAttribute('aria-label', this._textMap.get(TextLabel$1.ENTER_PICTURE_IN_PICTURE_LABEL));
                this._tooltipReference.setText(this._textMap.get(TextLabel$1.ENTER_PICTURE_IN_PICTURE_TOOLTIP));
            }
        };
        PictureInPictureView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        PictureInPictureView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        PictureInPictureView.prototype.getElement = function () {
            return this._$rootElement;
        };
        PictureInPictureView.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$togglePictureInPictureControl = null;
            this._$rootElement = null;
        };
        return PictureInPictureView;
    }(View));
    PictureInPictureView.setTheme(pictureInPictureViewTheme);
    PictureInPictureView.extendStyleNames(styles$18);

    var PictureInPictureControl = /** @class */ (function () {
        function PictureInPictureControl(_a) {
            var eventEmitter = _a.eventEmitter, pictureInPicture = _a.pictureInPicture, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme;
            this._eventEmitter = eventEmitter;
            this._pictureInPictureManager = pictureInPicture;
            this._textMap = textMap;
            this._theme = theme;
            this._tooltipService = tooltipService;
            this._bindCallbacks();
            this._initUI();
            this._bindEvents();
            if (!this._pictureInPictureManager.isEnabled) {
                this.hide();
            }
            this._initInterceptor();
        }
        PictureInPictureControl.prototype.getElement = function () {
            return this.view.getElement();
        };
        PictureInPictureControl.prototype._bindCallbacks = function () {
            this._togglePictureInPicture = this._togglePictureInPicture.bind(this);
        };
        PictureInPictureControl.prototype._bindEvents = function () {
            this._unbindEvents = this._eventEmitter.bindEvents([
                [
                    UIEvent$1.PICTURE_IN_PICTURE_STATUS_CHANGE,
                    this.view.setPictureInPictureState,
                ],
            ], this.view);
        };
        PictureInPictureControl.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onButtonClick: this._togglePictureInPicture,
                },
                textMap: this._textMap,
                tooltipService: this._tooltipService,
                theme: this._theme,
            };
            this.view = new PictureInPictureControl.View(config);
        };
        PictureInPictureControl.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                }, _a));
        };
        PictureInPictureControl.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        PictureInPictureControl.prototype._togglePictureInPicture = function () {
            if (this._pictureInPictureManager.isInPictureInPicture) {
                this._pictureInPictureManager.exitPictureInPicture();
                this._eventEmitter.emitAsync(UIEvent$1.EXIT_PICTURE_IN_PICTURE_CLICK);
            }
            else {
                this._pictureInPictureManager.enterPictureInPicture();
                this._eventEmitter.emitAsync(UIEvent$1.ENTER_PICTURE_IN_PICTURE_CLICK);
            }
        };
        PictureInPictureControl.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        PictureInPictureControl.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        PictureInPictureControl.prototype.destroy = function () {
            this._destroyInterceptor();
            this._unbindEvents();
            this.view.destroy();
        };
        PictureInPictureControl.moduleName = 'pictureInPictureControl';
        PictureInPictureControl.View = PictureInPictureView;
        PictureInPictureControl.dependencies = [
            'eventEmitter',
            'pictureInPicture',
            'textMap',
            'tooltipService',
            'theme',
        ];
        return PictureInPictureControl;
    }());

    function dot_tpl_src_modules_ui_controls_logo_templates_logo_dot(props
    ) {
    var out='<div class="'+(props.styles.logoWrapper)+'"></div>';return out;
    }

    function dot_tpl_src_modules_ui_controls_logo_templates_logoImage_dot(props
    ) {
    var out='<img class="'+(props.styles.logoImage)+'" aria-label="'+(props.texts.label)+'"/>';return out;
    }

    function dot_tpl_src_modules_ui_controls_logo_templates_logoInput_dot(props
    ) {
    var out='<input type="image" class="'+(props.styles.logoImage)+'" aria-label="'+(props.texts.label)+'" tabindex="0" />';return out;
    }

    function dot_tpl_src_modules_ui_controls_logo_templates_logoButton_dot(props
    ) {
    var out='<button class="'+(props.styles.logoButton)+' '+(props.styles.controlButton)+'" aria-label="'+(props.texts.label)+'" type="button" tabindex="0"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="'+(props.styles.icon_small)+'" preserveAspectRatio="xMidYMin slice" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.logoButtonSvgFill)+'" d="M8 20H6V6h4v2H8v10h10v-2h2v4H8zM18 9.485l-4.586 4.586L12 12.657 16.657 8h-1.653V6H20v5.005h-2v-1.52z"/> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" class="'+(props.styles.icon_big)+'" preserveAspectRatio="xMidYMin slice" width="100%"> <path fill-rule="evenodd" class="'+(props.themeStyles.logoButtonSvgFill)+'" d="M9 28H7V7h7.071v2H9v17h17v-5h2v7H9zm17-17.98l-8.586 8.587L16 17.192 24.192 9h-2.184V7H28v6.012h-2V10.02z"/> </svg></button>';return out;
    }

    var logoTemplate = dot_tpl_src_modules_ui_controls_logo_templates_logo_dot.default ? dot_tpl_src_modules_ui_controls_logo_templates_logo_dot.default : dot_tpl_src_modules_ui_controls_logo_templates_logo_dot;
    var logoImageTemplate = dot_tpl_src_modules_ui_controls_logo_templates_logoImage_dot.default ? dot_tpl_src_modules_ui_controls_logo_templates_logoImage_dot.default : dot_tpl_src_modules_ui_controls_logo_templates_logoImage_dot;
    var logoInputTemplate = dot_tpl_src_modules_ui_controls_logo_templates_logoInput_dot.default ? dot_tpl_src_modules_ui_controls_logo_templates_logoInput_dot.default : dot_tpl_src_modules_ui_controls_logo_templates_logoInput_dot;
    var logoButtonTemplate = dot_tpl_src_modules_ui_controls_logo_templates_logoButton_dot.default ? dot_tpl_src_modules_ui_controls_logo_templates_logoButton_dot.default : dot_tpl_src_modules_ui_controls_logo_templates_logoButton_dot;

    var logoViewTheme = {
        logoButtonSvgFill: {
            fill: function (data) { return data.color; },
        },
    };

    var css$19 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.logo__controlButton___owdbK {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.logo__controlButton___owdbK:hover {\n    opacity: .7; }\n.logo__hidden___Pm6t6 {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.logo__logoWrapper___2HWRo {\n  position: relative;\n  z-index: 3;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  opacity: 1;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.logo__logoWrapper___2HWRo:hover .logo__logoPlaceholder___14fTk {\n    opacity: .7; }\n.logo__logoImage___1N2ry {\n  max-width: 125px;\n  max-height: 26px;\n  -webkit-transition: opacity .2s;\n  transition: opacity .2s; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"550px\"] .logo__logoImage___1N2ry {\n    max-width: 90px;\n    max-height: 20px; }\n[data-webplayer-hook='player-container'][data-webplayer-max-width~=\"350px\"] .logo__logoImage___1N2ry {\n    max-width: 70px;\n    max-height: 18px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .logo__logoImage___1N2ry {\n    max-width: 450px;\n    max-height: 36px; }\n.logo__logoImage___1N2ry.logo__hidden___Pm6t6 {\n    display: none; }\n.logo__logoButton___1JWF4 {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px;\n  -webkit-transition: -webkit-transform .2s;\n  transition: -webkit-transform .2s;\n  transition: transform .2s;\n  transition: transform .2s, -webkit-transform .2s; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .logo__logoButton___1JWF4 {\n    width: 35px;\n    min-width: 35px;\n    height: 35px;\n    min-height: 35px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .logo__logoButton___1JWF4 .logo__icon_small___2o0-C {\n      display: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .logo__logoButton___1JWF4 .logo__icon_big___pAlEu {\n      display: block; }\n.logo__logoButton___1JWF4 .logo__icon_small___2o0-C {\n    display: block; }\n.logo__logoButton___1JWF4 .logo__icon_big___pAlEu {\n    display: none; }\n.logo__logoButton___1JWF4:hover {\n    -webkit-transform: scale(1.2);\n            transform: scale(1.2); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxvZ28uc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUNIOzs7OztHQUtHO0FBQ0g7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLFdBQVc7RUFDWCxnQkFBZ0I7RUFDaEIsaUNBQXlCO1VBQXpCLHlCQUF5QjtFQUN6QixxQ0FBNkI7RUFBN0IsNkJBQTZCO0VBQzdCLFdBQVc7RUFDWCxVQUFVO0VBQ1YsaUJBQWlCO0VBQ2pCLGNBQWM7RUFDZCw4QkFBOEI7RUFDOUIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0I7RUFDeEIsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0IsRUFBRTtBQUN0QjtJQUNFLFlBQVksRUFBRTtBQUVsQjtFQUNFLDhCQUE4QjtFQUM5QixvQkFBb0I7RUFDcEIsd0JBQXdCO0VBQ3hCLHFCQUFxQjtFQUNyQix5QkFBeUI7RUFDekIscUJBQXFCO0VBQ3JCLHNCQUFzQjtFQUN0QixzQkFBc0IsRUFBRTtBQUUxQjtFQUNFLG1CQUFtQjtFQUNuQixXQUFXO0VBQ1gscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCxnQ0FBd0I7RUFBeEIsd0JBQXdCO0VBQ3hCLGlDQUF5QjtVQUF6Qix5QkFBeUI7RUFDekIsV0FBVztFQUNYLHlCQUF3QjtNQUF4QixzQkFBd0I7VUFBeEIsd0JBQXdCO0VBQ3hCLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7QUFDdEI7SUFDRSxZQUFZLEVBQUU7QUFFbEI7RUFDRSxpQkFBaUI7RUFDakIsaUJBQWlCO0VBQ2pCLGdDQUF3QjtFQUF4Qix3QkFBd0IsRUFBRTtBQUMxQjtJQUNFLGdCQUFnQjtJQUNoQixpQkFBaUIsRUFBRTtBQUNyQjtJQUNFLGdCQUFnQjtJQUNoQixpQkFBaUIsRUFBRTtBQUNyQjtJQUNFLGlCQUFpQjtJQUNqQixpQkFBaUIsRUFBRTtBQUNyQjtJQUNFLGNBQWMsRUFBRTtBQUVwQjtFQUNFLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsYUFBYTtFQUNiLGlCQUFpQjtFQUNqQiwwQ0FBMEI7RUFBMUIsa0NBQTBCO0VBQTFCLDBCQUEwQjtFQUExQixpREFBMEIsRUFBRTtBQUM1QjtJQUNFLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGlCQUFpQixFQUFFO0FBQ25CO01BQ0UsY0FBYyxFQUFFO0FBQ2xCO01BQ0UsZUFBZSxFQUFFO0FBQ3JCO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsY0FBYyxFQUFFO0FBQ2xCO0lBQ0UsOEJBQXNCO1lBQXRCLHNCQUFzQixFQUFFIiwiZmlsZSI6ImxvZ28uc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIGNoYWxsZW5nZSBoZXJlIHRvIHN1cHBvcnQgXCJwbGF5YWJsZSBxdWVyaWVzXCIgYW5kIFwiZGlyZWN0aW9uXCIgYXQgdGhlIHNhbWUgdGltZSBhbmQgYWxsb3cgbWl4aW5zIGxpa2U6XG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBsdHIoKSlcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpLCBydGwoKSlcbiAqL1xuLyoqXG4gKiBUaGUgY2hhbGxlbmdlIGhlcmUgdG8gc3VwcG9ydCBcInBsYXlhYmxlIHF1ZXJpZXNcIiBhbmQgXCJkaXJlY3Rpb25cIiBhdCB0aGUgc2FtZSB0aW1lIGFuZCBhbGxvdyBtaXhpbnMgbGlrZTpcbiAqICAgQGluY2x1ZGUgcXVlcnkobWF4LXdpZHRoLTU1MCgpKVxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCksIGx0cigpKVxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCksIHJ0bCgpKVxuICovXG4uY29udHJvbEJ1dHRvbiB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIHBhZGRpbmc6IDA7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgdHJhbnNpdGlvbi1kdXJhdGlvbjogLjJzO1xuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBvcGFjaXR5O1xuICBvcGFjaXR5OiAxO1xuICBib3JkZXI6IDA7XG4gIGJvcmRlci1yYWRpdXM6IDA7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICAuY29udHJvbEJ1dHRvbjpob3ZlciB7XG4gICAgb3BhY2l0eTogLjc7IH1cblxuLmhpZGRlbiB7XG4gIHZpc2liaWxpdHk6IGhpZGRlbiAhaW1wb3J0YW50O1xuICB3aWR0aDogMCAhaW1wb3J0YW50O1xuICBtaW4td2lkdGg6IDAgIWltcG9ydGFudDtcbiAgaGVpZ2h0OiAwICFpbXBvcnRhbnQ7XG4gIG1pbi1oZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWFyZ2luOiAwICFpbXBvcnRhbnQ7XG4gIHBhZGRpbmc6IDAgIWltcG9ydGFudDtcbiAgb3BhY2l0eTogMCAhaW1wb3J0YW50OyB9XG5cbi5sb2dvV3JhcHBlciB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgei1pbmRleDogMztcbiAgZGlzcGxheTogZmxleDtcbiAgdHJhbnNpdGlvbjogb3BhY2l0eSAuMnM7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IC4ycztcbiAgb3BhY2l0eTogMTtcbiAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cbiAgLmxvZ29XcmFwcGVyOmhvdmVyIC5sb2dvUGxhY2Vob2xkZXIge1xuICAgIG9wYWNpdHk6IC43OyB9XG5cbi5sb2dvSW1hZ2Uge1xuICBtYXgtd2lkdGg6IDEyNXB4O1xuICBtYXgtaGVpZ2h0OiAyNnB4O1xuICB0cmFuc2l0aW9uOiBvcGFjaXR5IC4yczsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1tYXgtd2lkdGh+PVwiNTUwcHhcIl0gLmxvZ29JbWFnZSB7XG4gICAgbWF4LXdpZHRoOiA5MHB4O1xuICAgIG1heC1oZWlnaHQ6IDIwcHg7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtbWF4LXdpZHRofj1cIjM1MHB4XCJdIC5sb2dvSW1hZ2Uge1xuICAgIG1heC13aWR0aDogNzBweDtcbiAgICBtYXgtaGVpZ2h0OiAxOHB4OyB9XG4gIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAubG9nb0ltYWdlIHtcbiAgICBtYXgtd2lkdGg6IDQ1MHB4O1xuICAgIG1heC1oZWlnaHQ6IDM2cHg7IH1cbiAgLmxvZ29JbWFnZS5oaWRkZW4ge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cblxuLmxvZ29CdXR0b24ge1xuICB3aWR0aDogMjZweDtcbiAgbWluLXdpZHRoOiAyNnB4O1xuICBoZWlnaHQ6IDI2cHg7XG4gIG1pbi1oZWlnaHQ6IDI2cHg7XG4gIHRyYW5zaXRpb246IHRyYW5zZm9ybSAuMnM7IH1cbiAgW2RhdGEtcGxheWFibGUtaG9vaz0ncGxheWVyLWNvbnRhaW5lciddW2RhdGEtcGxheWFibGUtaW4tZnVsbC1zY3JlZW49XCJ0cnVlXCJdIC5sb2dvQnV0dG9uIHtcbiAgICB3aWR0aDogMzVweDtcbiAgICBtaW4td2lkdGg6IDM1cHg7XG4gICAgaGVpZ2h0OiAzNXB4O1xuICAgIG1pbi1oZWlnaHQ6IDM1cHg7IH1cbiAgICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLmxvZ29CdXR0b24gLmljb25fc21hbGwge1xuICAgICAgZGlzcGxheTogbm9uZTsgfVxuICAgIFtkYXRhLXBsYXlhYmxlLWhvb2s9J3BsYXllci1jb250YWluZXInXVtkYXRhLXBsYXlhYmxlLWluLWZ1bGwtc2NyZWVuPVwidHJ1ZVwiXSAubG9nb0J1dHRvbiAuaWNvbl9iaWcge1xuICAgICAgZGlzcGxheTogYmxvY2s7IH1cbiAgLmxvZ29CdXR0b24gLmljb25fc21hbGwge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5sb2dvQnV0dG9uIC5pY29uX2JpZyB7XG4gICAgZGlzcGxheTogbm9uZTsgfVxuICAubG9nb0J1dHRvbjpob3ZlciB7XG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjIpOyB9XG4iXX0= */";
    var styles$19 = {"controlButton":"logo__controlButton___owdbK","hidden":"logo__hidden___Pm6t6","logoWrapper":"logo__logoWrapper___2HWRo","logoPlaceholder":"logo__logoPlaceholder___14fTk","logoImage":"logo__logoImage___1N2ry","logoButton":"logo__logoButton___1JWF4","icon_small":"logo__icon_small___2o0-C","icon_big":"logo__icon_big___pAlEu"};
    styleInject(css$19);

    var LogoView = /** @class */ (function (_super) {
        __extends(LogoView, _super);
        function LogoView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._$rootElement = htmlToElement(logoTemplate({
                styles: _this.styleNames,
                texts: {
                    label: _this._textMap.get(TextLabel$1.LOGO_LABEL),
                },
            }));
            _this._$logoImage = htmlToElement(logoImageTemplate({
                styles: _this.styleNames,
                texts: {
                    label: _this._textMap.get(TextLabel$1.LOGO_LABEL),
                },
            }));
            _this._$logoInput = htmlToElement(logoInputTemplate({
                styles: _this.styleNames,
                texts: {
                    label: _this._textMap.get(TextLabel$1.LOGO_LABEL),
                },
            }));
            _this._$logoButton = htmlToElement(logoButtonTemplate({
                styles: _this.styleNames,
                themeStyles: _this.themeStyles,
                texts: {
                    label: _this._textMap.get(TextLabel$1.LOGO_LABEL),
                },
            }));
            _this._tooltipReference = tooltipService.createReference(_this._$rootElement, {
                text: _this._textMap.get(TextLabel$1.LOGO_TOOLTIP),
            });
            _this.setLogo(config.logo);
            _this._bindCallbacks();
            _this._bindEvents();
            _this.showAsButton();
            return _this;
        }
        LogoView.prototype.setLogo = function (url) {
            if (url) {
                this._$logoImage.setAttribute('src', url);
                this._$logoInput.setAttribute('src', url);
            }
            else {
                this._$logoImage.removeAttribute('src');
                this._$logoInput.removeAttribute('src');
            }
        };
        LogoView.prototype.showAsImage = function () {
            this._setChild(this._$logoImage);
            this._tooltipReference.disable();
        };
        LogoView.prototype.showAsButton = function () {
            this._setChild(this._$logoButton);
            this._tooltipReference.enable();
        };
        LogoView.prototype.showAsInput = function () {
            this._setChild(this._$logoInput);
            this._tooltipReference.enable();
        };
        LogoView.prototype._setChild = function (childNode) {
            this._$rootElement.firstChild &&
                this._$rootElement.removeChild(this._$rootElement.firstChild);
            this._$rootElement.appendChild(childNode);
        };
        LogoView.prototype._bindCallbacks = function () {
            this._onClick = this._onClick.bind(this);
        };
        LogoView.prototype._bindEvents = function () {
            this._$rootElement.addEventListener('click', this._onClick);
        };
        LogoView.prototype._unbindEvents = function () {
            this._$rootElement.removeEventListener('click', this._onClick);
        };
        LogoView.prototype._onClick = function () {
            this._$rootElement.focus();
            this._callbacks.onLogoClick();
        };
        LogoView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        LogoView.prototype.hide = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        LogoView.prototype.getElement = function () {
            return this._$rootElement;
        };
        LogoView.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$rootElement = null;
            this._$logoImage = null;
            this._$logoInput = null;
            this._$logoButton = null;
        };
        return LogoView;
    }(View));
    LogoView.setTheme(logoViewTheme);
    LogoView.extendStyleNames(styles$19);

    var Logo = /** @class */ (function () {
        function Logo(_a) {
            var eventEmitter = _a.eventEmitter, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._theme = theme;
            this._tooltipService = tooltipService;
            this._bindCallbacks();
            this._initUI();
            this._initInterceptor();
        }
        Logo.prototype.getElement = function () {
            return this.view.getElement();
        };
        Logo.prototype._bindCallbacks = function () {
            this._triggerCallback = this._triggerCallback.bind(this);
        };
        Logo.prototype._initUI = function () {
            var config = {
                theme: this._theme,
                callbacks: {
                    onLogoClick: this._triggerCallback,
                },
                textMap: this._textMap,
                tooltipService: this._tooltipService,
            };
            this.view = new Logo.View(config);
        };
        Logo.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._triggerCallback();
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._triggerCallback();
                }, _a));
        };
        Logo.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        Logo.prototype._triggerCallback = function () {
            if (this._callback) {
                this._callback();
            }
        };
        /**
         * Method for setting source of image, that would be used as logo
         * @param src - Source of logo
         * @example
         * player.setLogo('https://example.com/logo.png');
         *
         */
        Logo.prototype.setLogo = function (src) {
            this._logoSrc = src;
            this.view.setLogo(this._logoSrc);
            this._setProperDisplayState();
        };
        /**
         * Method for attaching callback for click on logo
         *
         * @param callback - Your function
         *
         * @example
         * const callback = () => {
         *   console.log('Click on title);
         * }
         * player.setLogoClickCallback(callback);
         *
         */
        Logo.prototype.setLogoClickCallback = function (callback) {
            this._callback = callback;
            this._setProperDisplayState();
        };
        Logo.prototype._setProperDisplayState = function () {
            if (this._callback) {
                this._logoSrc ? this.view.showAsInput() : this.view.showAsButton();
            }
            else {
                this._logoSrc ? this.view.showAsImage() : this.view.showAsButton();
            }
        };
        Logo.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        Logo.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        Logo.prototype.destroy = function () {
            this._destroyInterceptor();
            this.view.destroy();
        };
        Logo.moduleName = 'logo';
        Logo.View = LogoView;
        Logo.dependencies = ['eventEmitter', 'textMap', 'tooltipService', 'theme'];
        __decorate([
            playerAPI()
        ], Logo.prototype, "setLogo", null);
        __decorate([
            playerAPI()
        ], Logo.prototype, "setLogoClickCallback", null);
        return Logo;
    }());

    function dot_tpl_src_modules_ui_controls_download_templates_control_dot(props
    ) {
    var out='<div class="'+(props.styles.buttonWrapper)+'"> <button class="'+(props.styles.downloadButton)+' '+(props.styles.controlButton)+'" data-webplayer-hook="download-button" aria-label="'+(props.texts.label)+'" type="button" tabindex="0"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" class="'+(props.styles.icon_small)+'" width="100%"> <g fill-rule="evenodd" class="'+(props.themeStyles.downloadSvgFill)+'"> <path d="M6 18h14v2H6v-2zm3.586-8.328L13 13.025v2.708l-4.828-4.647 1.414-1.414zM13 13.123l3.618-3.655 1.414 1.414L13 15.749v-2.626z"/> <path d="M12 6h2v8l-1 2-1-2V6z"/> </g> </svg> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35" class="'+(props.styles.icon_big)+'" width="100%"> <path d="M16.5 17.586V7h2v10.825L23.571 13l1.414 1.414-7.085 6.743-.329.328-7.071-7.07L11.914 13l4.586 4.586zM5.5 26h24v2h-24v-2z" fill-rule="evenodd"/> </svg> </button></div>';return out;
    }

    var controlTemplate$4 = dot_tpl_src_modules_ui_controls_download_templates_control_dot.default ? dot_tpl_src_modules_ui_controls_download_templates_control_dot.default : dot_tpl_src_modules_ui_controls_download_templates_control_dot;

    var downloadViewTheme = {
        downloadSvgFill: {
            fill: function (data) { return data.color; },
        },
    };

    var css$20 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.download__controlButton___fk1Ma {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.download__controlButton___fk1Ma:hover {\n    opacity: .7; }\n.download__hidden___36lL8 {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.download__buttonWrapper___244Vz {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center; }\n.download__downloadButton___3J_rA {\n  width: 26px;\n  min-width: 26px;\n  height: 26px;\n  min-height: 26px;\n  -webkit-transition: -webkit-transform .2s;\n  transition: -webkit-transform .2s;\n  transition: transform .2s;\n  transition: transform .2s, -webkit-transform .2s; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .download__downloadButton___3J_rA {\n    width: 35px;\n    min-width: 35px;\n    height: 35px;\n    min-height: 21px; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .download__downloadButton___3J_rA .download__icon_small___1rNov {\n      display: none; }\n[data-webplayer-hook='player-container'][data-webplayer-in-full-screen=\"true\"] .download__downloadButton___3J_rA .download__icon_big___3csO6 {\n      display: block; }\n.download__downloadButton___3J_rA .download__icon_small___1rNov {\n    display: block; }\n.download__downloadButton___3J_rA .download__icon_big___3csO6 {\n    display: none; }\n.download__downloadButton___3J_rA:hover {\n    -webkit-transform: scale(1.18);\n            transform: scale(1.18); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRvd25sb2FkLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsMEJBQW9CO01BQXBCLHVCQUFvQjtVQUFwQixvQkFBb0I7RUFDcEIseUJBQXdCO01BQXhCLHNCQUF3QjtVQUF4Qix3QkFBd0IsRUFBRTtBQUU1QjtFQUNFLFlBQVk7RUFDWixnQkFBZ0I7RUFDaEIsYUFBYTtFQUNiLGlCQUFpQjtFQUNqQiwwQ0FBMEI7RUFBMUIsa0NBQTBCO0VBQTFCLDBCQUEwQjtFQUExQixpREFBMEIsRUFBRTtBQUM1QjtJQUNFLFlBQVk7SUFDWixnQkFBZ0I7SUFDaEIsYUFBYTtJQUNiLGlCQUFpQixFQUFFO0FBQ25CO01BQ0UsY0FBYyxFQUFFO0FBQ2xCO01BQ0UsZUFBZSxFQUFFO0FBQ3JCO0lBQ0UsZUFBZSxFQUFFO0FBQ25CO0lBQ0UsY0FBYyxFQUFFO0FBQ2xCO0lBQ0UsK0JBQXVCO1lBQXZCLHVCQUF1QixFQUFFIiwiZmlsZSI6ImRvd25sb2FkLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLmJ1dHRvbldyYXBwZXIge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyOyB9XG5cbi5kb3dubG9hZEJ1dHRvbiB7XG4gIHdpZHRoOiAyNnB4O1xuICBtaW4td2lkdGg6IDI2cHg7XG4gIGhlaWdodDogMjZweDtcbiAgbWluLWhlaWdodDogMjZweDtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIC4yczsgfVxuICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLmRvd25sb2FkQnV0dG9uIHtcbiAgICB3aWR0aDogMzVweDtcbiAgICBtaW4td2lkdGg6IDM1cHg7XG4gICAgaGVpZ2h0OiAzNXB4O1xuICAgIG1pbi1oZWlnaHQ6IDIxcHg7IH1cbiAgICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLmRvd25sb2FkQnV0dG9uIC5pY29uX3NtYWxsIHtcbiAgICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgICBbZGF0YS1wbGF5YWJsZS1ob29rPSdwbGF5ZXItY29udGFpbmVyJ11bZGF0YS1wbGF5YWJsZS1pbi1mdWxsLXNjcmVlbj1cInRydWVcIl0gLmRvd25sb2FkQnV0dG9uIC5pY29uX2JpZyB7XG4gICAgICBkaXNwbGF5OiBibG9jazsgfVxuICAuZG93bmxvYWRCdXR0b24gLmljb25fc21hbGwge1xuICAgIGRpc3BsYXk6IGJsb2NrOyB9XG4gIC5kb3dubG9hZEJ1dHRvbiAuaWNvbl9iaWcge1xuICAgIGRpc3BsYXk6IG5vbmU7IH1cbiAgLmRvd25sb2FkQnV0dG9uOmhvdmVyIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDEuMTgpOyB9XG4iXX0= */";
    var styles$20 = {"controlButton":"download__controlButton___fk1Ma","hidden":"download__hidden___36lL8","buttonWrapper":"download__buttonWrapper___244Vz","downloadButton":"download__downloadButton___3J_rA","icon_small":"download__icon_small___1rNov","icon_big":"download__icon_big___3csO6"};
    styleInject(css$20);

    var DownloadView = /** @class */ (function (_super) {
        __extends(DownloadView, _super);
        function DownloadView(config) {
            var _this = this;
            var callbacks = config.callbacks, textMap = config.textMap, tooltipService = config.tooltipService, theme = config.theme;
            _this = _super.call(this, theme) || this;
            _this._callbacks = callbacks;
            _this._textMap = textMap;
            _this._$rootElement = htmlToElement(controlTemplate$4({
                styles: _this.styleNames,
                themeStyles: _this.themeStyles,
                texts: {
                    label: _this._textMap.get(TextLabel$1.DOWNLOAD_BUTTON_LABEL),
                },
            }));
            _this._$downloadButton = getElementByHook(_this._$rootElement, 'download-button');
            _this._tooltipReference = tooltipService.createReference(_this._$downloadButton, {
                text: _this._textMap.get(TextLabel$1.DOWNLOAD_BUTTON_TOOLTIP),
            });
            _this._bindEvents();
            return _this;
        }
        DownloadView.prototype._bindEvents = function () {
            this._onButtonClick = this._onButtonClick.bind(this);
            this._$downloadButton.addEventListener('click', this._onButtonClick);
        };
        DownloadView.prototype._unbindEvents = function () {
            this._$downloadButton.removeEventListener('click', this._onButtonClick);
        };
        DownloadView.prototype._onButtonClick = function () {
            this._$rootElement.focus();
            this._callbacks.onButtonClick();
        };
        DownloadView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        DownloadView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        DownloadView.prototype.getElement = function () {
            return this._$rootElement;
        };
        DownloadView.prototype.destroy = function () {
            this._unbindEvents();
            this._tooltipReference.destroy();
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$downloadButton = null;
            this._$rootElement = null;
        };
        return DownloadView;
    }(View));
    DownloadView.setTheme(downloadViewTheme);
    DownloadView.extendStyleNames(styles$20);

    var DownloadButton = /** @class */ (function () {
        function DownloadButton(_a) {
            var eventEmitter = _a.eventEmitter, textMap = _a.textMap, tooltipService = _a.tooltipService, theme = _a.theme;
            this._eventEmitter = eventEmitter;
            this._textMap = textMap;
            this._theme = theme;
            this._tooltipService = tooltipService;
            this._bindCallbacks();
            this._initUI();
            this._initInterceptor();
        }
        DownloadButton.prototype.getElement = function () {
            return this.view.getElement();
        };
        DownloadButton.prototype._bindCallbacks = function () {
            this._triggerCallback = this._triggerCallback.bind(this);
        };
        DownloadButton.prototype._initUI = function () {
            var config = {
                callbacks: {
                    onButtonClick: this._triggerCallback,
                },
                textMap: this._textMap,
                tooltipService: this._tooltipService,
                theme: this._theme,
            };
            this.view = new DownloadButton.View(config);
        };
        DownloadButton.prototype._initInterceptor = function () {
            var _this = this;
            var _a;
            this._interceptor = new KeyboardInterceptorCore(this.getElement(), (_a = {}, _a[KEYCODES.SPACE_BAR] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._triggerCallback();
                }, _a[KEYCODES.ENTER] = function (e) {
                    e.stopPropagation();
                    _this._eventEmitter.emitAsync(UIEvent$1.KEYBOARD_KEYDOWN_INTERCEPTED);
                    _this._triggerCallback();
                }, _a));
        };
        DownloadButton.prototype._destroyInterceptor = function () {
            this._interceptor.destroy();
        };
        DownloadButton.prototype._triggerCallback = function () {
            if (this._callback) {
                this._callback();
            }
        };
        /**
         * If download button presented, set callback on click
         * @example
         * player.setDownloadClickCallback(() => console.log('handle download logic'));
         */
        DownloadButton.prototype.setDownloadClickCallback = function (callback) {
            this._callback = callback;
        };
        DownloadButton.prototype.hide = function () {
            this.isHidden = true;
            this.view.hide();
        };
        DownloadButton.prototype.show = function () {
            this.isHidden = false;
            this.view.show();
        };
        DownloadButton.prototype.destroy = function () {
            this._destroyInterceptor();
            this.view.destroy();
        };
        DownloadButton.moduleName = 'downloadButton';
        DownloadButton.View = DownloadView;
        DownloadButton.dependencies = ['eventEmitter', 'textMap', 'tooltipService', 'theme'];
        __decorate([
            playerAPI()
        ], DownloadButton.prototype, "setDownloadClickCallback", null);
        return DownloadButton;
    }());

    var HAVE_METADATA$1 = 1;
    var isPictureInPictureRequested = false;
    var ChromePictureInPicture = /** @class */ (function () {
        function ChromePictureInPicture(elem, callback) {
            var _this = this;
            this._enterWhenHasMetaData = function () {
                _this._$elem.removeEventListener('loadedmetadata', _this._enterWhenHasMetaData);
                isPictureInPictureRequested = false;
                _this.request();
            };
            this.catchException = function () {
                if (_this._$elem && _this._$elem.readyState < HAVE_METADATA$1) {
                    _this._$elem.addEventListener('loadedmetadata', _this._enterWhenHasMetaData);
                    isPictureInPictureRequested = true;
                }
            };
            this._$elem = elem;
            this._callback = callback;
            this._bindEvents();
        }
        Object.defineProperty(ChromePictureInPicture.prototype, "isAPIExist", {
            get: function () {
                return Boolean('pictureInPictureEnabled' in document);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChromePictureInPicture.prototype, "isAPIEnabled", {
            get: function () {
                return Boolean(document.pictureInPictureEnabled);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChromePictureInPicture.prototype, "isInPictureInPicture", {
            get: function () {
                return Boolean(this._$elem &&
                    this._$elem === document.pictureInPictureElement);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChromePictureInPicture.prototype, "isEnabled", {
            get: function () {
                return this.isAPIExist && this.isAPIEnabled;
            },
            enumerable: true,
            configurable: true
        });
        ChromePictureInPicture.prototype._bindEvents = function () {
            this._$elem.addEventListener('enterpictureinpicture', this._callback);
            this._$elem.addEventListener('leavepictureinpicture', this._callback);
        };
        ChromePictureInPicture.prototype._unbindEvents = function () {
            this._$elem.removeEventListener('enterpictureinpicture', this._callback);
            this._$elem.removeEventListener('leavepictureinpicture', this._callback);
            this._$elem.removeEventListener('loadedmetadata', this._enterWhenHasMetaData);
        };
        ChromePictureInPicture.prototype.request = function () {
            if (!this.isEnabled ||
                this.isInPictureInPicture ||
                isPictureInPictureRequested) {
                return false;
            }
            return this._$elem.requestPictureInPicture().catch(this.catchException);
        };
        ChromePictureInPicture.prototype.exit = function () {
            if (!this.isEnabled || !this.isInPictureInPicture) {
                return false;
            }
            document.exitPictureInPicture();
        };
        ChromePictureInPicture.prototype.destroy = function () {
            this._unbindEvents();
            this._$elem = null;
        };
        return ChromePictureInPicture;
    }());

    var HAVE_METADATA$2 = 1;
    var PICTURE_IN_PICTURE_MODE = 'picture-in-picture';
    var INLINE_MODE = 'inline';
    var isPictureInPictureRequested$1 = false;
    var SafariPictureInPicture = /** @class */ (function () {
        function SafariPictureInPicture(elem, callback) {
            var _this = this;
            this._enterWhenHasMetaData = function () {
                _this._$elem.removeEventListener('loadedmetadata', _this._enterWhenHasMetaData);
                isPictureInPictureRequested$1 = false;
                _this.request();
            };
            this._$elem = elem;
            this._callback = callback;
            this._bindEvents();
        }
        Object.defineProperty(SafariPictureInPicture.prototype, "isAPIExist", {
            get: function () {
                return Boolean(this._$elem &&
                    typeof this._$elem.webkitSetPresentationMode === 'function');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SafariPictureInPicture.prototype, "isInPictureInPicture", {
            get: function () {
                return Boolean(this._$elem &&
                    this._$elem.webkitPresentationMode === PICTURE_IN_PICTURE_MODE);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SafariPictureInPicture.prototype, "isEnabled", {
            get: function () {
                return this.isAPIExist;
            },
            enumerable: true,
            configurable: true
        });
        SafariPictureInPicture.prototype._bindEvents = function () {
            this._$elem.addEventListener('webkitpresentationmodechanged', this._callback);
        };
        SafariPictureInPicture.prototype._unbindEvents = function () {
            this._$elem.removeEventListener('webkitpresentationmodechanged', this._callback);
            this._$elem.removeEventListener('loadedmetadata', this._enterWhenHasMetaData);
        };
        SafariPictureInPicture.prototype.request = function () {
            if (!this.isEnabled ||
                this.isInPictureInPicture ||
                isPictureInPictureRequested$1) {
                return false;
            }
            try {
                //NOT FIRING EXEPTION IF NOT TRIGGERED BY USER GESTURE
                this._$elem.webkitSetPresentationMode(PICTURE_IN_PICTURE_MODE);
            }
            catch (e) {
                if (this._$elem.readyState < HAVE_METADATA$2) {
                    this._$elem.addEventListener('loadedmetadata', this._enterWhenHasMetaData);
                    isPictureInPictureRequested$1 = true;
                }
            }
        };
        SafariPictureInPicture.prototype.exit = function () {
            if (!this.isEnabled || !this.isInPictureInPicture) {
                return false;
            }
            this._$elem.webkitSetPresentationMode(INLINE_MODE);
        };
        SafariPictureInPicture.prototype.destroy = function () {
            this._unbindEvents();
            this._$elem = null;
        };
        return SafariPictureInPicture;
    }());

    var PictureInPicture = /** @class */ (function () {
        function PictureInPicture(_a) {
            var eventEmitter = _a.eventEmitter, engine = _a.engine;
            this._isEnabled = true;
            this._eventEmitter = eventEmitter;
            this._onChange = this._onChange.bind(this);
            if (isSafari()) {
                this._helper = new SafariPictureInPicture(engine.getElement(), this._onChange);
            }
            else {
                this._helper = new ChromePictureInPicture(engine.getElement(), this._onChange);
            }
        }
        PictureInPicture.prototype._onChange = function () {
            this._eventEmitter.emitAsync(UIEvent$1.PICTURE_IN_PICTURE_STATUS_CHANGE, this.isInPictureInPicture);
        };
        /**
         * Player would try to enter fullscreen mode.
         * Behavior of fullscreen mode on different platforms may differ.
         * @example
         * player.enterFullScreen();
         */
        PictureInPicture.prototype.enterPictureInPicture = function () {
            if (!this.isEnabled) {
                return;
            }
            this._helper.request();
        };
        /**
         * Player would try to exit fullscreen mode.
         * @example
         * player.exitFullScreen();
         */
        PictureInPicture.prototype.exitPictureInPicture = function () {
            if (!this.isEnabled) {
                return;
            }
            this._helper.exit();
        };
        /**
         * Disable functionality for entering picture in picture mode
         * @example
         * player.disablePictureInPicture();
         */
        PictureInPicture.prototype.disablePictureInPicture = function () {
            this._helper.exit();
            this._isEnabled = false;
        };
        /**
         * Enable functionality for entering picture in picture mode
         * @example
         * player.enablePictureInPicture();
         */
        PictureInPicture.prototype.enablePictureInPicture = function () {
            this._isEnabled = true;
        };
        Object.defineProperty(PictureInPicture.prototype, "isInPictureInPicture", {
            /**
             * Return true if player is in picture in picture mode
             * @example
             * console.log(player.isInPictureInPicture); // false
             */
            get: function () {
                if (!this.isEnabled) {
                    return false;
                }
                return this._helper.isInPictureInPicture;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PictureInPicture.prototype, "isEnabled", {
            get: function () {
                return this._helper.isEnabled && this._isEnabled;
            },
            enumerable: true,
            configurable: true
        });
        PictureInPicture.prototype.destroy = function () {
            this._helper.destroy();
        };
        PictureInPicture.moduleName = 'pictureInPicture';
        PictureInPicture.dependencies = ['eventEmitter', 'engine', 'config'];
        __decorate([
            playerAPI()
        ], PictureInPicture.prototype, "enterPictureInPicture", null);
        __decorate([
            playerAPI()
        ], PictureInPicture.prototype, "exitPictureInPicture", null);
        __decorate([
            playerAPI()
        ], PictureInPicture.prototype, "disablePictureInPicture", null);
        __decorate([
            playerAPI()
        ], PictureInPicture.prototype, "enablePictureInPicture", null);
        __decorate([
            playerAPI()
        ], PictureInPicture.prototype, "isInPictureInPicture", null);
        return PictureInPicture;
    }());

    function normalizeFramesQuality(framesCount, quality, neededFrame) {
        var framesInSprite = quality.framesInSprite.vert * quality.framesInSprite.horz;
        var frameNumberInSprite = neededFrame % framesInSprite;
        var spriteNumber = Math.floor(neededFrame / framesInSprite);
        var horzPositionInSprite = frameNumberInSprite % quality.framesInSprite.horz;
        var vertPositionInSprite = Math.floor(frameNumberInSprite / quality.framesInSprite.vert);
        var url = quality.spriteUrlMask.replace('%d', spriteNumber.toString());
        return {
            frameSize: quality.frameSize,
            framesInSprite: (spriteNumber + 1) * framesInSprite <= framesCount
                ? quality.framesInSprite
                : {
                    horz: quality.framesInSprite.horz,
                    vert: Math.ceil((framesCount % framesInSprite) / quality.framesInSprite.vert),
                },
            framePositionInSprite: {
                vert: vertPositionInSprite,
                horz: horzPositionInSprite,
            },
            spriteUrl: url,
        };
    }
    function getAt(data, second, duration) {
        var framesCount = data.framesCount;
        var neededFrame = Math.floor((second * framesCount) / duration);
        return data.qualities.map(function (quality) {
            return normalizeFramesQuality(framesCount, quality, neededFrame);
        });
    }

    var PreviewService = /** @class */ (function () {
        function PreviewService(_a) {
            var engine = _a.engine;
            this._engine = engine;
        }
        PreviewService.prototype.setFramesMap = function (map) {
            this._framesMap = map;
        };
        PreviewService.prototype.getAt = function (second) {
            if (!this._framesMap) {
                return;
            }
            var duration = this._engine.getDuration();
            if (!duration) {
                return;
            }
            return getAt(this._framesMap, second, duration);
        };
        PreviewService.prototype.destroy = function () {
            this._framesMap = null;
        };
        PreviewService.moduleName = 'previewService';
        PreviewService.dependencies = ['engine'];
        __decorate([
            playerAPI()
        ], PreviewService.prototype, "setFramesMap", null);
        return PreviewService;
    }());

    function dot_tpl_src_modules_ui_previewThumbnail_templates_thumbnail_dot(props
    ) {
    var out='<div class="'+(props.styles.container)+'" data-webplayer-component> <div class="'+(props.styles.highQualityFrame)+'" data-webplayer-hook="thumb-high-quality" > </div> <div class="'+(props.styles.lowQualityFrame)+'" data-webplayer-hook="thumb-low-quality"> </div> <div class="'+(props.styles.thumbText)+'" data-webplayer-hook="thumb-text-block"> </div></div>';return out;
    }

    var thumbnailTemplate = dot_tpl_src_modules_ui_previewThumbnail_templates_thumbnail_dot.default ? dot_tpl_src_modules_ui_previewThumbnail_templates_thumbnail_dot.default : dot_tpl_src_modules_ui_previewThumbnail_templates_thumbnail_dot;

    var css$21 = ".preview-thumbnail__container___1TmLX {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: reverse;\n      -ms-flex-direction: column-reverse;\n          flex-direction: column-reverse;\n  width: 180px;\n  height: 90px;\n  border: 2px solid rgba(0, 0, 0, 0.5);\n  border-radius: 2px;\n  background-color: rgba(0, 0, 0, 0.5);\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n  .preview-thumbnail__container___1TmLX.preview-thumbnail__empty___LitJh {\n    width: initial;\n    height: initial;\n    border: none;\n    border-radius: 0; }\n  .preview-thumbnail__highQualityFrame___sCDil,\n.preview-thumbnail__lowQualityFrame___fzXUI {\n  position: absolute;\n  top: 2px;\n  right: 2px;\n  bottom: 2px;\n  left: 2px;\n  width: 180px;\n  height: 90px; }\n  .preview-thumbnail__highQualityFrame___sCDil {\n  z-index: 2; }\n  .preview-thumbnail__lowQualityFrame___fzXUI {\n  z-index: 1; }\n  .preview-thumbnail__empty___LitJh .preview-thumbnail__thumbText___VFKJP {\n  background: none; }\n  .preview-thumbnail__empty___LitJh .preview-thumbnail__highQualityFrame___sCDil,\n.preview-thumbnail__empty___LitJh .preview-thumbnail__lowQualityFrame___fzXUI {\n  width: 0;\n  height: 0; }\n  .preview-thumbnail__thumbText___VFKJP {\n  font-size: 11px;\n  line-height: 12px;\n  position: relative;\n  z-index: 3;\n  padding: 4px 5px;\n  white-space: nowrap;\n  color: white;\n  background: rgba(0, 0, 0, 0.8); }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByZXZpZXctdGh1bWJuYWlsLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxxQkFBYztFQUFkLHFCQUFjO0VBQWQsY0FBYztFQUNkLDZCQUErQjtFQUEvQiwrQkFBK0I7TUFBL0IsbUNBQStCO1VBQS9CLCtCQUErQjtFQUMvQixhQUFhO0VBQ2IsYUFBYTtFQUNiLHFDQUFxQztFQUNyQyxtQkFBbUI7RUFDbkIscUNBQXFDO0VBQ3JDLDBCQUFvQjtNQUFwQix1QkFBb0I7VUFBcEIsb0JBQW9CLEVBQUU7RUFDdEI7SUFDRSxlQUFlO0lBQ2YsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixpQkFBaUIsRUFBRTtFQUV2Qjs7RUFFRSxtQkFBbUI7RUFDbkIsU0FBUztFQUNULFdBQVc7RUFDWCxZQUFZO0VBQ1osVUFBVTtFQUNWLGFBQWE7RUFDYixhQUFhLEVBQUU7RUFFakI7RUFDRSxXQUFXLEVBQUU7RUFFZjtFQUNFLFdBQVcsRUFBRTtFQUVmO0VBQ0UsaUJBQWlCLEVBQUU7RUFFckI7O0VBRUUsU0FBUztFQUNULFVBQVUsRUFBRTtFQUVkO0VBQ0UsZ0JBQWdCO0VBQ2hCLGtCQUFrQjtFQUNsQixtQkFBbUI7RUFDbkIsV0FBVztFQUNYLGlCQUFpQjtFQUNqQixvQkFBb0I7RUFDcEIsYUFBYTtFQUNiLCtCQUErQixFQUFFIiwiZmlsZSI6InByZXZpZXctdGh1bWJuYWlsLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIuY29udGFpbmVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbi1yZXZlcnNlO1xuICB3aWR0aDogMTgwcHg7XG4gIGhlaWdodDogOTBweDtcbiAgYm9yZGVyOiAycHggc29saWQgcmdiYSgwLCAwLCAwLCAwLjUpO1xuICBib3JkZXItcmFkaXVzOiAycHg7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMCwgMCwgMCwgMC41KTtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjsgfVxuICAuY29udGFpbmVyLmVtcHR5IHtcbiAgICB3aWR0aDogaW5pdGlhbDtcbiAgICBoZWlnaHQ6IGluaXRpYWw7XG4gICAgYm9yZGVyOiBub25lO1xuICAgIGJvcmRlci1yYWRpdXM6IDA7IH1cblxuLmhpZ2hRdWFsaXR5RnJhbWUsXG4ubG93UXVhbGl0eUZyYW1lIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDJweDtcbiAgcmlnaHQ6IDJweDtcbiAgYm90dG9tOiAycHg7XG4gIGxlZnQ6IDJweDtcbiAgd2lkdGg6IDE4MHB4O1xuICBoZWlnaHQ6IDkwcHg7IH1cblxuLmhpZ2hRdWFsaXR5RnJhbWUge1xuICB6LWluZGV4OiAyOyB9XG5cbi5sb3dRdWFsaXR5RnJhbWUge1xuICB6LWluZGV4OiAxOyB9XG5cbi5lbXB0eSAudGh1bWJUZXh0IHtcbiAgYmFja2dyb3VuZDogbm9uZTsgfVxuXG4uZW1wdHkgLmhpZ2hRdWFsaXR5RnJhbWUsXG4uZW1wdHkgLmxvd1F1YWxpdHlGcmFtZSB7XG4gIHdpZHRoOiAwO1xuICBoZWlnaHQ6IDA7IH1cblxuLnRodW1iVGV4dCB7XG4gIGZvbnQtc2l6ZTogMTFweDtcbiAgbGluZS1oZWlnaHQ6IDEycHg7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgei1pbmRleDogMztcbiAgcGFkZGluZzogNHB4IDVweDtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgY29sb3I6IHdoaXRlO1xuICBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuOCk7IH1cbiJdfQ== */";
    var styles$21 = {"container":"preview-thumbnail__container___1TmLX","empty":"preview-thumbnail__empty___LitJh","highQualityFrame":"preview-thumbnail__highQualityFrame___sCDil","lowQualityFrame":"preview-thumbnail__lowQualityFrame___fzXUI","thumbText":"preview-thumbnail__thumbText___VFKJP"};
    styleInject(css$21);

    var PreviewThumbnailView = /** @class */ (function (_super) {
        __extends(PreviewThumbnailView, _super);
        function PreviewThumbnailView() {
            var _this = _super.call(this) || this;
            _this._initDOM();
            return _this;
        }
        PreviewThumbnailView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(thumbnailTemplate({
                styles: this.styleNames,
            }));
            this._$timeText = getElementByHook(this._$rootElement, 'thumb-text-block');
            this._$lowQualityThumb = getElementByHook(this._$rootElement, 'thumb-low-quality');
            this._$highQualityThumb = getElementByHook(this._$rootElement, 'thumb-high-quality');
        };
        PreviewThumbnailView.prototype.getElement = function () {
            return this._$rootElement;
        };
        PreviewThumbnailView.prototype.showAsEmpty = function () {
            this._$rootElement.classList.add(this.styleNames.empty);
        };
        PreviewThumbnailView.prototype.showWithPreview = function () {
            this._$rootElement.classList.remove(this.styleNames.empty);
        };
        PreviewThumbnailView.prototype.clearLowQualityPreview = function () {
            this._$lowQualityThumb.style.background = '';
        };
        PreviewThumbnailView.prototype.clearHighQualityPreview = function () {
            this._$highQualityThumb.style.background = '';
        };
        PreviewThumbnailView.prototype.setLowQualityPreview = function (qualityData) {
            this._applyQualityToThumbElement(this._$lowQualityThumb, qualityData);
        };
        PreviewThumbnailView.prototype.setHighQualityPreview = function (qualityData) {
            this._applyQualityToThumbElement(this._$highQualityThumb, qualityData);
        };
        PreviewThumbnailView.prototype._applyQualityToThumbElement = function (element, quality) {
            var viewWidth = element.offsetWidth;
            var viewHeight = element.offsetHeight;
            var backgroudWidth = viewWidth * quality.framesInSprite.horz;
            var backgroundHeight = viewHeight * quality.framesInSprite.vert;
            element.style.background = "url('" + quality.spriteUrl + "') -" + viewWidth *
                quality.framePositionInSprite.horz + "px -" + viewHeight *
                quality.framePositionInSprite
                    .vert + "px / " + backgroudWidth + "px " + backgroundHeight + "px";
        };
        PreviewThumbnailView.prototype.setTime = function (time) {
            this._$timeText.innerText = time;
        };
        PreviewThumbnailView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$timeText = null;
            this._$lowQualityThumb = null;
            this._$highQualityThumb = null;
            this._$rootElement = null;
        };
        return PreviewThumbnailView;
    }(View));
    PreviewThumbnailView.extendStyleNames(styles$21);

    var PreviewThumbnail = /** @class */ (function () {
        function PreviewThumbnail(_a) {
            var previewService = _a.previewService;
            this._previewService = previewService;
            this._initUI();
        }
        PreviewThumbnail.prototype._initUI = function () {
            this.view = new PreviewThumbnail.View();
        };
        PreviewThumbnail.prototype.getElement = function () {
            return this.view.getElement();
        };
        PreviewThumbnail.prototype.showAt = function (second) {
            var config = this._previewService.getAt(second);
            if (!config) {
                this.view.showAsEmpty();
                return;
            }
            this.view.showWithPreview();
            if (this._currentFrames) {
                if (this._currentFrames[0].spriteUrl !== config[0].spriteUrl) {
                    this.view.clearLowQualityPreview();
                }
                if (this._currentFrames[1].spriteUrl !== config[1].spriteUrl) {
                    this.view.clearHighQualityPreview();
                }
            }
            this.view.setLowQualityPreview(config[0]);
            this.view.setHighQualityPreview(config[1]);
            this._currentFrames = config;
        };
        PreviewThumbnail.prototype.setTime = function (time) {
            this.view.setTime(time);
        };
        PreviewThumbnail.prototype.destroy = function () {
            this.view.destroy();
        };
        PreviewThumbnail.moduleName = 'previewThumbnail';
        PreviewThumbnail.View = PreviewThumbnailView;
        PreviewThumbnail.dependencies = ['previewService'];
        return PreviewThumbnail;
    }());

    function dot_tpl_src_modules_ui_previewFullSize_templates_preview_dot(props
    ) {
    var out='<div class="'+(props.styles.container)+'" data-webplayer-component> <div class="'+(props.styles.frame)+'" data-webplayer-hook="preview-full-size-frame" > </div></div>';return out;
    }

    var previewTemplate = dot_tpl_src_modules_ui_previewFullSize_templates_preview_dot.default ? dot_tpl_src_modules_ui_previewFullSize_templates_preview_dot.default : dot_tpl_src_modules_ui_previewFullSize_templates_preview_dot;

    var css$22 = "/**\n * The challenge here to support \"webplayer queries\" and \"direction\" at the same time and allow mixins like:\n *   @include query(max-width-550())\n *   @include query(max-width-550(), ltr())\n *   @include query(max-width-550(), rtl())\n */\n.preview-full-size__controlButton___2sWjc {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding: 0;\n  cursor: pointer;\n  -webkit-transition-duration: .2s;\n          transition-duration: .2s;\n  -webkit-transition-property: opacity;\n  transition-property: opacity;\n  opacity: 1;\n  border: 0;\n  border-radius: 0;\n  outline: none;\n  background-color: transparent;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.preview-full-size__controlButton___2sWjc:hover {\n    opacity: .7; }\n.preview-full-size__hidden___1ZRC_ {\n  visibility: hidden !important;\n  width: 0 !important;\n  min-width: 0 !important;\n  height: 0 !important;\n  min-height: 0 !important;\n  margin: 0 !important;\n  padding: 0 !important;\n  opacity: 0 !important; }\n.preview-full-size__container___M_Ygb {\n  position: absolute;\n  z-index: 55;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: reverse;\n      -ms-flex-direction: column-reverse;\n          flex-direction: column-reverse;\n  pointer-events: none;\n  background-color: black;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n.preview-full-size__frame___3AEDD {\n  position: absolute;\n  z-index: 2;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  opacity: .5; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByZXZpZXctZnVsbC1zaXplLnNjc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFDSDtFQUNFLHFCQUFjO0VBQWQscUJBQWM7RUFBZCxjQUFjO0VBQ2QsV0FBVztFQUNYLGdCQUFnQjtFQUNoQixpQ0FBeUI7VUFBekIseUJBQXlCO0VBQ3pCLHFDQUE2QjtFQUE3Qiw2QkFBNkI7RUFDN0IsV0FBVztFQUNYLFVBQVU7RUFDVixpQkFBaUI7RUFDakIsY0FBYztFQUNkLDhCQUE4QjtFQUM5Qix5QkFBd0I7TUFBeEIsc0JBQXdCO1VBQXhCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBQ3RCO0lBQ0UsWUFBWSxFQUFFO0FBRWxCO0VBQ0UsOEJBQThCO0VBQzlCLG9CQUFvQjtFQUNwQix3QkFBd0I7RUFDeEIscUJBQXFCO0VBQ3JCLHlCQUF5QjtFQUN6QixxQkFBcUI7RUFDckIsc0JBQXNCO0VBQ3RCLHNCQUFzQixFQUFFO0FBRTFCO0VBQ0UsbUJBQW1CO0VBQ25CLFlBQVk7RUFDWixPQUFPO0VBQ1AsU0FBUztFQUNULFVBQVU7RUFDVixRQUFRO0VBQ1IscUJBQWM7RUFBZCxxQkFBYztFQUFkLGNBQWM7RUFDZCw2QkFBK0I7RUFBL0IsK0JBQStCO01BQS9CLG1DQUErQjtVQUEvQiwrQkFBK0I7RUFDL0IscUJBQXFCO0VBQ3JCLHdCQUF3QjtFQUN4QiwwQkFBb0I7TUFBcEIsdUJBQW9CO1VBQXBCLG9CQUFvQixFQUFFO0FBRXhCO0VBQ0UsbUJBQW1CO0VBQ25CLFdBQVc7RUFDWCxPQUFPO0VBQ1AsU0FBUztFQUNULFVBQVU7RUFDVixRQUFRO0VBQ1IsWUFBWSxFQUFFIiwiZmlsZSI6InByZXZpZXctZnVsbC1zaXplLnNjc3MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBjaGFsbGVuZ2UgaGVyZSB0byBzdXBwb3J0IFwicGxheWFibGUgcXVlcmllc1wiIGFuZCBcImRpcmVjdGlvblwiIGF0IHRoZSBzYW1lIHRpbWUgYW5kIGFsbG93IG1peGlucyBsaWtlOlxuICogICBAaW5jbHVkZSBxdWVyeShtYXgtd2lkdGgtNTUwKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgbHRyKCkpXG4gKiAgIEBpbmNsdWRlIHF1ZXJ5KG1heC13aWR0aC01NTAoKSwgcnRsKCkpXG4gKi9cbi5jb250cm9sQnV0dG9uIHtcbiAgZGlzcGxheTogZmxleDtcbiAgcGFkZGluZzogMDtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAuMnM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IG9wYWNpdHk7XG4gIG9wYWNpdHk6IDE7XG4gIGJvcmRlcjogMDtcbiAgYm9yZGVyLXJhZGl1czogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogdHJhbnNwYXJlbnQ7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBhbGlnbi1pdGVtczogY2VudGVyOyB9XG4gIC5jb250cm9sQnV0dG9uOmhvdmVyIHtcbiAgICBvcGFjaXR5OiAuNzsgfVxuXG4uaGlkZGVuIHtcbiAgdmlzaWJpbGl0eTogaGlkZGVuICFpbXBvcnRhbnQ7XG4gIHdpZHRoOiAwICFpbXBvcnRhbnQ7XG4gIG1pbi13aWR0aDogMCAhaW1wb3J0YW50O1xuICBoZWlnaHQ6IDAgIWltcG9ydGFudDtcbiAgbWluLWhlaWdodDogMCAhaW1wb3J0YW50O1xuICBtYXJnaW46IDAgIWltcG9ydGFudDtcbiAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xuICBvcGFjaXR5OiAwICFpbXBvcnRhbnQ7IH1cblxuLmNvbnRhaW5lciB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgei1pbmRleDogNTU7XG4gIHRvcDogMDtcbiAgcmlnaHQ6IDA7XG4gIGJvdHRvbTogMDtcbiAgbGVmdDogMDtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbi1yZXZlcnNlO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgYmFja2dyb3VuZC1jb2xvcjogYmxhY2s7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7IH1cblxuLmZyYW1lIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB6LWluZGV4OiAyO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIGxlZnQ6IDA7XG4gIG9wYWNpdHk6IC41OyB9XG4iXX0= */";
    var styles$22 = {"controlButton":"preview-full-size__controlButton___2sWjc","hidden":"preview-full-size__hidden___1ZRC_","container":"preview-full-size__container___M_Ygb","frame":"preview-full-size__frame___3AEDD"};
    styleInject(css$22);

    var PreviewFullSizeView = /** @class */ (function (_super) {
        __extends(PreviewFullSizeView, _super);
        function PreviewFullSizeView() {
            var _this = _super.call(this) || this;
            _this._initDOM();
            return _this;
        }
        PreviewFullSizeView.prototype._initDOM = function () {
            this._$rootElement = htmlToElement(previewTemplate({
                styles: this.styleNames,
            }));
            this._$frame = getElementByHook(this._$rootElement, 'preview-full-size-frame');
        };
        PreviewFullSizeView.prototype.getElement = function () {
            return this._$rootElement;
        };
        PreviewFullSizeView.prototype.setPreview = function (data) {
            this._applyFrame(data);
        };
        PreviewFullSizeView.prototype._applyFrame = function (frameData) {
            var viewWidth = this._$frame.offsetWidth;
            var viewHeight = this._$frame.offsetHeight;
            var backgroudWidth = viewWidth * frameData.framesInSprite.horz;
            var backgroundHeight = viewHeight * frameData.framesInSprite.vert;
            this._$frame.style.background = "url('" + frameData.spriteUrl + "') -" + viewWidth * frameData.framePositionInSprite.horz + "px -" + viewHeight *
                frameData.framePositionInSprite
                    .vert + "px / " + backgroudWidth + "px " + backgroundHeight + "px";
        };
        PreviewFullSizeView.prototype.clear = function () {
            this._$frame.style.background = '';
        };
        PreviewFullSizeView.prototype.show = function () {
            this._$rootElement.classList.remove(this.styleNames.hidden);
        };
        PreviewFullSizeView.prototype.hide = function () {
            this._$rootElement.classList.add(this.styleNames.hidden);
        };
        PreviewFullSizeView.prototype.destroy = function () {
            if (this._$rootElement.parentNode) {
                this._$rootElement.parentNode.removeChild(this._$rootElement);
            }
            this._$frame = null;
            this._$rootElement = null;
        };
        return PreviewFullSizeView;
    }(View));
    PreviewFullSizeView.extendStyleNames(styles$22);

    var PreviewFullsize = /** @class */ (function () {
        function PreviewFullsize(_a) {
            var previewService = _a.previewService, rootContainer = _a.rootContainer;
            this._previewService = previewService;
            this._initUI();
            this.hide();
            rootContainer.appendComponentElement(this.getElement());
        }
        PreviewFullsize.prototype._initUI = function () {
            this.view = new PreviewFullsize.View();
        };
        PreviewFullsize.prototype.getElement = function () {
            return this.view.getElement();
        };
        PreviewFullsize.prototype.showAt = function (second) {
            this.view.show();
            var framesData = this._previewService.getAt(second);
            if (!framesData) {
                this.view.clear();
                return;
            }
            var frameData = framesData.pop();
            if (this._currentFrame) {
                if (this._currentFrame.spriteUrl !== frameData.spriteUrl) {
                    this.view.clear();
                }
            }
            this.view.setPreview(frameData);
            this._currentFrame = frameData;
        };
        PreviewFullsize.prototype.hide = function () {
            this.view.hide();
        };
        PreviewFullsize.prototype.destroy = function () {
            this.view.destroy();
        };
        PreviewFullsize.moduleName = 'previewFullSize';
        PreviewFullsize.View = PreviewFullSizeView;
        PreviewFullsize.dependencies = ['previewService', 'rootContainer'];
        return PreviewFullsize;
    }());

    (function (PreloadType) {
        PreloadType["NONE"] = "none";
        PreloadType["METADATA"] = "metadata";
        PreloadType["AUTO"] = "auto";
    })(exports.PRELOAD_TYPES || (exports.PRELOAD_TYPES = {}));

    (function (CrossOriginValue) {
        CrossOriginValue["ANONYMUS"] = "anonymous";
        CrossOriginValue["CREDENTIALS"] = "use-credentials";
    })(exports.CROSS_ORIGIN_VALUES || (exports.CROSS_ORIGIN_VALUES = {}));

    var NATIVE_VIDEO_EVENTS_TO_STATE = [
        'loadstart',
        'loadedmetadata',
        'canplay',
        'play',
        'playing',
        'pause',
        'ended',
        'waiting',
        'seeking',
        'seeked',
    ];
    var StateEngine = /** @class */ (function () {
        function StateEngine(eventEmitter, video) {
            this._eventEmitter = eventEmitter;
            this._video = video;
            this._currentState = null;
            this._isMetadataLoaded = false;
            this._statesTimestamps = {};
            this._bindCallbacks();
            this._bindEvents();
        }
        StateEngine.prototype._bindCallbacks = function () {
            this._processEventFromVideo = this._processEventFromVideo.bind(this);
        };
        StateEngine.prototype._bindEvents = function () {
            var _this = this;
            NATIVE_VIDEO_EVENTS_TO_STATE.forEach(function (event) {
                _this._video.addEventListener(event, _this._processEventFromVideo);
            });
        };
        StateEngine.prototype._unbindEvents = function () {
            var _this = this;
            NATIVE_VIDEO_EVENTS_TO_STATE.forEach(function (event) {
                return _this._video.removeEventListener(event, _this._processEventFromVideo);
            });
        };
        StateEngine.prototype.clearTimestamps = function () {
            this._statesTimestamps = {};
        };
        StateEngine.prototype._setInitialTimeStamp = function () {
            this._initialTimeStamp = Date.now();
        };
        StateEngine.prototype._setStateTimestamp = function (state) {
            if (!this._statesTimestamps[state]) {
                this._statesTimestamps[state] = Date.now() - this._initialTimeStamp;
                this._setInitialTimeStamp();
            }
        };
        Object.defineProperty(StateEngine.prototype, "stateTimestamps", {
            get: function () {
                return this._statesTimestamps;
            },
            enumerable: true,
            configurable: true
        });
        StateEngine.prototype._processEventFromVideo = function (event) {
            if (event === void 0) { event = {}; }
            var videoElement = this._video;
            switch (event.type) {
                case 'loadstart': {
                    this._setInitialTimeStamp();
                    this.setState(EngineState$1.LOAD_STARTED);
                    break;
                }
                case 'loadedmetadata': {
                    this._setStateTimestamp(EngineState$1.METADATA_LOADED);
                    this.setState(EngineState$1.METADATA_LOADED);
                    this._isMetadataLoaded = true;
                    break;
                }
                case 'canplay': {
                    if (this._currentState === EngineState$1.METADATA_LOADED) {
                        this._setStateTimestamp(EngineState$1.READY_TO_PLAY);
                        this.setState(EngineState$1.READY_TO_PLAY);
                    }
                    break;
                }
                case 'play': {
                    this.setState(EngineState$1.PLAY_REQUESTED);
                    break;
                }
                case 'playing': {
                    // Safari triggers event 'playing' even when play request aborted by browser. So we need to check if video is actualy playing
                    if (isSafari()) {
                        if (!videoElement.paused) {
                            this.setState(EngineState$1.PLAYING);
                        }
                    }
                    else {
                        this.setState(EngineState$1.PLAYING);
                    }
                    break;
                }
                case 'waiting': {
                    this.setState(EngineState$1.WAITING);
                    break;
                }
                case 'pause': {
                    // Safari triggers event 'pause' even when playing was aborted buy autoplay policies, emit pause event even if there wasn't any real playback
                    if (isSafari()) {
                        if (videoElement.played.length) {
                            this.setState(EngineState$1.PAUSED);
                        }
                    }
                    else {
                        this.setState(EngineState$1.PAUSED);
                    }
                    break;
                }
                case 'ended': {
                    this.setState(EngineState$1.ENDED);
                    break;
                }
                case 'seeking': {
                    this.setState(EngineState$1.SEEK_IN_PROGRESS);
                    break;
                }
                case 'seeked': {
                    this.setState(videoElement.paused ? EngineState$1.PAUSED : EngineState$1.PLAYING);
                    break;
                }
                default:
                    break;
            }
        };
        StateEngine.prototype.setState = function (state) {
            if (state === this._currentState) {
                return;
            }
            //This case is happens only with dash.js sometimes when manifest got some problems
            if (this._currentState === EngineState$1.METADATA_LOADED) {
                if (state === EngineState$1.SEEK_IN_PROGRESS ||
                    state === EngineState$1.PAUSED) {
                    return;
                }
            }
            this._eventEmitter.emitAsync(VideoEvent$1.STATE_CHANGED, {
                prevState: this._currentState,
                nextState: state,
            });
            this._eventEmitter.emitAsync(state);
            this._currentState = state;
        };
        Object.defineProperty(StateEngine.prototype, "isMetadataLoaded", {
            get: function () {
                return this._isMetadataLoaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StateEngine.prototype, "state", {
            get: function () {
                return this._currentState;
            },
            enumerable: true,
            configurable: true
        });
        StateEngine.prototype.destroy = function () {
            this._unbindEvents();
        };
        return StateEngine;
    }());

    var NATIVE_VIDEO_TO_BROADCAST = [
        'loadstart',
        'progress',
        'error',
        'stalled',
        'suspend',
        'durationchange',
        'timeupdate',
        'volumechange',
        'seeking',
    ];
    var NativeEventsBroadcaster = /** @class */ (function () {
        function NativeEventsBroadcaster(eventEmitter, output) {
            this._eventEmitter = eventEmitter;
            this._video = output;
            this._currentMute = this._video.muted;
            this._currentVolume = this._video.volume;
            this._bindCallbacks();
            this._bindEvents();
        }
        NativeEventsBroadcaster.prototype._bindCallbacks = function () {
            this._processEventFromVideo = this._processEventFromVideo.bind(this);
        };
        NativeEventsBroadcaster.prototype._bindEvents = function () {
            var _this = this;
            NATIVE_VIDEO_TO_BROADCAST.forEach(function (event) {
                return _this._video.addEventListener(event, _this._processEventFromVideo);
            });
        };
        NativeEventsBroadcaster.prototype._unbindEvents = function () {
            var _this = this;
            NATIVE_VIDEO_TO_BROADCAST.forEach(function (event) {
                return _this._video.removeEventListener(event, _this._processEventFromVideo);
            });
        };
        NativeEventsBroadcaster.prototype._processEventFromVideo = function (event) {
            if (event === void 0) { event = {}; }
            var video = this._video;
            switch (event.type) {
                case 'loadstart': {
                    if (this._shouldCheckVolume) {
                        this._checkVolumeChanges();
                    }
                    break;
                }
                case 'progress': {
                    this._eventEmitter.emitAsync(VideoEvent$1.CHUNK_LOADED);
                    break;
                }
                case 'stalled': {
                    this._eventEmitter.emitAsync(VideoEvent$1.UPLOAD_STALLED);
                    break;
                }
                case 'suspend': {
                    this._eventEmitter.emitAsync(VideoEvent$1.UPLOAD_SUSPEND);
                    break;
                }
                case 'seeking': {
                    this._eventEmitter.emitAsync(VideoEvent$1.SEEK_IN_PROGRESS, video.currentTime);
                    break;
                }
                case 'durationchange': {
                    this._eventEmitter.emitAsync(VideoEvent$1.DURATION_UPDATED, video.duration);
                    break;
                }
                case 'timeupdate': {
                    this._eventEmitter.emitAsync(VideoEvent$1.CURRENT_TIME_UPDATED, video.currentTime);
                    break;
                }
                case 'volumechange': {
                    if (this._shouldCheckVolume) {
                        this._shouldCheckVolume = false;
                    }
                    this._checkVolumeChanges();
                    break;
                }
                default:
                    break;
            }
        };
        NativeEventsBroadcaster.prototype._checkVolumeChanges = function () {
            var video = this._video;
            if (this._currentVolume !== video.volume) {
                this._currentVolume = video.volume * 100;
                this._eventEmitter.emitAsync(VideoEvent$1.VOLUME_CHANGED, this._currentVolume);
            }
            if (this._currentMute !== video.muted) {
                this._currentMute = video.muted;
                this._eventEmitter.emitAsync(VideoEvent$1.MUTE_CHANGED, this._currentMute);
            }
            this._eventEmitter.emitAsync(VideoEvent$1.SOUND_STATE_CHANGED, {
                volume: video.volume,
                muted: video.muted,
            });
        };
        //Workaround for problem with HTML5Video not firing volumechange if source changed right after volume/muted changed
        NativeEventsBroadcaster.prototype.checkVolumeChangeAfterLoadStart = function () {
            this._shouldCheckVolume = true;
        };
        NativeEventsBroadcaster.prototype.destroy = function () {
            this._unbindEvents();
        };
        return NativeEventsBroadcaster;
    }());

    function resolveAdapters(mediaStreams, availableAdapters) {
        var webplayerAdapters = [];
        var groupedStreams = groupStreamsByMediaType(mediaStreams);
        var groupedStreamKeys = Object.keys(groupedStreams);
        availableAdapters.forEach(function (adapter) {
            for (var i = 0; i < groupedStreamKeys.length; i += 1) {
                var mediaType = groupedStreamKeys[i];
                if (adapter.canPlay(mediaType)) {
                    adapter.setMediaStreams(groupedStreams[mediaType]);
                    webplayerAdapters.push(adapter);
                    break;
                }
            }
        });
        webplayerAdapters.sort(function (firstAdapter, secondAdapter) {
            return secondAdapter.mediaStreamDeliveryPriority -
                firstAdapter.mediaStreamDeliveryPriority;
        });
        return webplayerAdapters;
    }
    function groupStreamsByMediaType(mediaStreams) {
        var typeMap = {};
        mediaStreams.forEach(function (mediaStream) {
            var type = mediaStream.type || MimeToStreamTypeMap[mediaStream.mimeType];
            if (!type) {
                return;
            }
            if (!Array.isArray(typeMap[type])) {
                typeMap[type] = [];
            }
            typeMap[type].push({
                url: mediaStream.url,
                type: type,
            });
        });
        return typeMap;
    }

    var extensionsMap = Object.create(null);
    extensionsMap.mp4 = exports.MEDIA_STREAM_TYPES.MP4;
    extensionsMap.webm = exports.MEDIA_STREAM_TYPES.WEBM;
    extensionsMap.m3u8 = exports.MEDIA_STREAM_TYPES.HLS;
    extensionsMap.mpd = exports.MEDIA_STREAM_TYPES.DASH;
    extensionsMap.ogg = exports.MEDIA_STREAM_TYPES.OGG;
    extensionsMap.mkv = exports.MEDIA_STREAM_TYPES.MKV;
    extensionsMap.mov = exports.MEDIA_STREAM_TYPES.MOV;
    function getStreamType(url) {
        var anchorElement = document.createElement('a');
        anchorElement.href = url;
        var streamType = extensionsMap[getExtFromPath(anchorElement.pathname)];
        return streamType || false;
    }
    function getExtFromPath(path) {
        return path
            .split('.')
            .pop()
            .toLowerCase();
    }

    var AdaptersStrategy = /** @class */ (function () {
        function AdaptersStrategy(eventEmitter, video, playbackAdapters) {
            if (playbackAdapters === void 0) { playbackAdapters = []; }
            var _this = this;
            this._video = video;
            this._eventEmitter = eventEmitter;
            this._webplayerAdapters = [];
            this._availableAdapters = [];
            this._attachedAdapter = null;
            playbackAdapters.forEach(function (adapter) {
                return adapter.isSupported() &&
                    _this._availableAdapters.push(new adapter(eventEmitter));
            });
        }
        AdaptersStrategy.prototype._autoDetectSourceTypes = function (mediaSources) {
            var _this = this;
            return mediaSources.map(function (mediaSource) {
                if (typeof mediaSource === 'string') {
                    var type = getStreamType(mediaSource);
                    if (!type) {
                        _this._eventEmitter.emitAsync(VideoEvent$1.ERROR, {
                            errorType: Error$2.SRC_PARSE,
                            streamSrc: mediaSource,
                        });
                    }
                    return { url: mediaSource, type: type };
                }
                return mediaSource;
            });
        };
        AdaptersStrategy.prototype._resolveWebPlayerAdapters = function (src) {
            if (!src) {
                this._webplayerAdapters = [];
                return;
            }
            var mediaSources = [].concat(src);
            var mediaStreams = this._autoDetectSourceTypes(mediaSources);
            this._webplayerAdapters = resolveAdapters(mediaStreams, this._availableAdapters);
        };
        AdaptersStrategy.prototype._connectAdapterToVideo = function () {
            if (this._webplayerAdapters.length > 0) {
                // Use the first WebPlayerStream for now
                // Later, we can use the others as fallback
                this._attachedAdapter = this._webplayerAdapters[0];
                this._attachedAdapter.attach(this._video);
            }
        };
        AdaptersStrategy.prototype._detachCurrentAdapter = function () {
            if (this._attachedAdapter) {
                this._attachedAdapter.detach();
                this._attachedAdapter = null;
            }
        };
        Object.defineProperty(AdaptersStrategy.prototype, "attachedAdapter", {
            get: function () {
                return this._attachedAdapter;
            },
            enumerable: true,
            configurable: true
        });
        AdaptersStrategy.prototype.connectAdapter = function (src) {
            this._detachCurrentAdapter();
            this._resolveWebPlayerAdapters(src);
            this._connectAdapterToVideo();
        };
        AdaptersStrategy.prototype.destroy = function () {
            this._detachCurrentAdapter();
        };
        return AdaptersStrategy;
    }());

    var preventDefault = function (e) {
        e.preventDefault();
    };
    var NativeOutput = /** @class */ (function () {
        function NativeOutput(_a) {
            var eventEmitter = _a.eventEmitter, config = _a.config, _b = _a.availablePlaybackAdapters, availablePlaybackAdapters = _b === void 0 ? [] : _b;
            this._createVideoTag(config);
            this._eventEmitter = eventEmitter;
            this._availablePlaybackAdapters = availablePlaybackAdapters;
            this._stateEngine = new StateEngine(this._eventEmitter, this._video);
            this._nativeEventsBroadcaster = new NativeEventsBroadcaster(eventEmitter, this._video);
            this._adapterStrategy = new AdaptersStrategy(this._eventEmitter, this._video, this._availablePlaybackAdapters);
        }
        NativeOutput.prototype._createVideoTag = function (_a) {
            var videoElement = _a.videoElement, preventContextMenu = _a.preventContextMenu;
            if (videoElement && videoElement.tagName === 'VIDEO') {
                this._video = videoElement;
            }
            else {
                this._video = document.createElement('video');
            }
            if (preventContextMenu) {
                this._video.addEventListener('contextmenu', preventDefault);
            }
        };
        NativeOutput.prototype.play = function () {
            var _this = this;
            //Workaround for triggering functionality that requires user event pipe
            this._eventEmitter.emitAsync(VideoEvent$1.PLAY_REQUEST);
            this._pauseRequested = false;
            if (!this._playPromise) {
                this._playPromise = this._video.play();
                if (this._playPromise !== undefined) {
                    this._playPromise
                        .then(function () {
                        _this._playPromise = null;
                        if (_this._pauseRequested) {
                            _this.pause();
                        }
                    })
                        .catch(function (event) {
                        _this._eventEmitter.emitAsync(VideoEvent$1.PLAY_ABORTED, event);
                        _this._playPromise = null;
                    });
                }
            }
        };
        NativeOutput.prototype.pause = function () {
            if (this._playPromise) {
                this._pauseRequested = true;
            }
            else {
                this._video.pause();
                this._pauseRequested = false;
            }
        };
        NativeOutput.prototype.setMute = function (mute) {
            this._video.muted = mute;
            //Workaround for problem with HTML5Video not firing volumechange if source changed right after volume/muted changed
            this._nativeEventsBroadcaster.checkVolumeChangeAfterLoadStart();
        };
        NativeOutput.prototype.setAutoplay = function (isAutoplay) {
            this._video.autoplay = isAutoplay;
        };
        NativeOutput.prototype.setInline = function (isPlaysinline) {
            if (isPlaysinline) {
                this._video.setAttribute('playsinline', 'true');
            }
            else {
                this._video.removeAttribute('playsinline');
            }
        };
        NativeOutput.prototype.setCrossOrigin = function (crossOrigin) {
            if (crossOrigin) {
                this._video.setAttribute('crossorigin', crossOrigin);
            }
            else {
                this._video.removeAttribute('crossorigin');
            }
        };
        NativeOutput.prototype.setCurrentTime = function (time) {
            this._video.currentTime = time;
        };
        NativeOutput.prototype.setVolume = function (volume) {
            this._video.volume = volume;
            //Workaround for problem with HTML5Video not firing volumechange if source changed right after volume/muted changed
            this._nativeEventsBroadcaster.checkVolumeChangeAfterLoadStart();
        };
        NativeOutput.prototype.setLoop = function (isLoop) {
            this._video.loop = isLoop;
        };
        NativeOutput.prototype.setPlaybackRate = function (rate) {
            this._video.playbackRate = rate;
        };
        NativeOutput.prototype.setPreload = function (preload) {
            if (preload === void 0) { preload = exports.PRELOAD_TYPES.AUTO; }
            this._video.preload = preload || exports.PRELOAD_TYPES.AUTO;
        };
        NativeOutput.prototype.setSrc = function (src, callback) {
            this._stateEngine.clearTimestamps();
            this._adapterStrategy.connectAdapter(src);
            this._stateEngine.setState(EngineState$1.SRC_SET);
            if (typeof callback === 'function') {
                callback();
            }
        };
        NativeOutput.prototype.syncWithLive = function () {
            if (this.attachedAdapter &&
                this.attachedAdapter.isDynamicContent &&
                !this.attachedAdapter.isDynamicContentEnded &&
                !this.isSyncWithLive) {
                this.setCurrentTime(this.attachedAdapter.syncWithLiveTime);
                this.play();
            }
        };
        NativeOutput.prototype.getElement = function () {
            return this._video;
        };
        NativeOutput.prototype._getViewDimensions = function () {
            return {
                width: this._video.offsetWidth,
                height: this._video.offsetHeight,
            };
        };
        Object.defineProperty(NativeOutput.prototype, "volume", {
            get: function () {
                return this._video.volume;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "currentTime", {
            get: function () {
                return this._video.currentTime;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "duration", {
            get: function () {
                return this._video.duration;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "autoplay", {
            get: function () {
                return this._video.autoplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "crossOrigin", {
            get: function () {
                return this._video.getAttribute('crossorigin');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "playbackRate", {
            get: function () {
                return this._video.playbackRate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "buffered", {
            get: function () {
                return this._video.buffered;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "preload", {
            get: function () {
                return this._video.preload;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isPaused", {
            get: function () {
                return this._video.paused;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isMuted", {
            get: function () {
                return Boolean(this._video.muted);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isEnded", {
            get: function () {
                return this._video.ended;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isInline", {
            get: function () {
                return Boolean(this._video.getAttribute('playsinline'));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isAutoplay", {
            get: function () {
                return this._video.autoplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isLoop", {
            get: function () {
                return this._video.loop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isMetadataLoaded", {
            get: function () {
                return this._stateEngine.isMetadataLoaded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isDynamicContent", {
            get: function () {
                if (!this.attachedAdapter) {
                    return false;
                }
                return this.attachedAdapter.isDynamicContent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isDynamicContentEnded", {
            get: function () {
                if (!this.attachedAdapter) {
                    return false;
                }
                return this.attachedAdapter.isDynamicContentEnded;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isSeekAvailable", {
            get: function () {
                if (!this.attachedAdapter) {
                    return false;
                }
                return this.attachedAdapter.isSeekAvailable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isSyncWithLive", {
            get: function () {
                if (!this.attachedAdapter) {
                    return false;
                }
                return this.attachedAdapter.isSyncWithLive;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isPreloadActive", {
            get: function () {
                if (isIPad() || isIPhone() || isIPod() || isAndroid()) {
                    return false;
                }
                return this.preload !== 'none';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "isAutoPlayActive", {
            get: function () {
                if (isIPad() || isIPhone() || isIPod() || isAndroid()) {
                    return false;
                }
                return this.isAutoplay;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "videoHeight", {
            get: function () {
                return this._video.videoHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "videoWidth", {
            get: function () {
                return this._video.videoWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "src", {
            get: function () {
                return this.attachedAdapter && this.attachedAdapter.currentUrl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "currentState", {
            get: function () {
                return this._stateEngine.state;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(NativeOutput.prototype, "attachedAdapter", {
            get: function () {
                return this._adapterStrategy.attachedAdapter;
            },
            enumerable: true,
            configurable: true
        });
        NativeOutput.prototype.getDebugInfo = function () {
            var _a = this, duration = _a.duration, currentTime = _a.currentTime;
            var adapterDebugInfo;
            if (this.attachedAdapter) {
                adapterDebugInfo = this.attachedAdapter.debugInfo;
            }
            return __assign({}, adapterDebugInfo, { duration: duration,
                currentTime: currentTime, loadingStateTimestamps: this._stateEngine.stateTimestamps, viewDimensions: this._getViewDimensions(), output: 'html5video' });
        };
        NativeOutput.prototype.destroy = function () {
            this._nativeEventsBroadcaster.destroy();
            this._adapterStrategy.destroy();
            this._video.removeEventListener('contextmenu', preventDefault);
            this._video.parentNode && this._video.parentNode.removeChild(this._video);
            this._video = null;
        };
        NativeOutput.moduleName = 'nativeOutput';
        NativeOutput.dependencies = ['eventEmitter', 'config', 'availablePlaybackAdapters'];
        return NativeOutput;
    }());

    var asClass$1 = DependencyContainer.asClass;
    var modules = {
        RootContainer: RootContainer,
        EventEmitter: EventEmitterModule,
        Engine: Engine,
        ThemeService: ThemeService,
        TextMap: TextMap,
        NativeOutput: NativeOutput,
        FullScreenManager: FullScreenManager,
        PictureInPictureManager: PictureInPicture,
        LiveStateEngine: LiveStateEngine,
        KeyboardControls: KeyboardControl,
        DebugPanel: DebugPanel,
        Screen: Screen,
        InteractionIndicator: InteractionIndicator,
        Overlay: Overlay,
        Loader: Loader,
        MainUIBlock: MainUIBlock,
        TopBlock: TopBlock,
        LiveIndicator: LiveIndicator,
        Title: Title,
        BottomBlock: BottomBlock,
        ProgressControl: ProgressControl,
        PlayControl: PlayControl,
        TimeControl: TimeControl,
        VolumeControl: VolumeControl,
        FullScreenControl: FullScreenControl,
        PictureInPictureControl: PictureInPictureControl,
        Logo: Logo,
        DownloadButton: DownloadButton,
        PreviewService: PreviewService,
        PreviewThumbnail: PreviewThumbnail,
        PreviewFullSize: PreviewFullsize,
        TooltipService: TooltipService,
    };
    var DIModules = Object.keys(modules).reduce(function (processedModules, key) {
        var module = modules[key];
        if (!module.moduleName) {
            throw new Error("No moduleName in module: " + key);
        }
        processedModules[module.moduleName] = asClass$1(module).scoped();
        return processedModules;
    }, {});

    /**
     * `true` if we are running inside a web browser, `false` otherwise (e.g. running inside Node.js).
     */
    var isBrowser$1 = typeof window !== 'undefined';
    /**
     * This is a map which lists native support of formats and APIs.
     * It gets filled during runtime with the relevant values to the current environment.
     */
    var NativeEnvironmentSupport = {
        MSE: false,
        HLS: false,
        DASH: false,
        MP4: false,
        WEBM: false,
        OGG: false,
        MOV: false,
        MKV: false,
    };
    /* ignore coverage */
    function detectEnvironment() {
        if (!isBrowser$1) {
            return; // Not in a browser
        }
        NativeEnvironmentSupport.MSE =
            'WebKitMediaSource' in window || 'MediaSource' in window;
        var video = document.createElement('video');
        if (typeof video.canPlayType !== 'function') {
            return; // env doesn't support HTMLMediaElement (e.g PhantomJS)
        }
        if (video.canPlayType('application/x-mpegURL') ||
            video.canPlayType('application/vnd.apple.mpegURL')) {
            NativeEnvironmentSupport.HLS = true;
        }
        if (video.canPlayType('application/dash+xml')) {
            NativeEnvironmentSupport.DASH = true;
        }
        if (video.canPlayType('video/mp4')) {
            NativeEnvironmentSupport.MP4 = true;
        }
        if (video.canPlayType('video/webm')) {
            NativeEnvironmentSupport.WEBM = true;
        }
        if (video.canPlayType('video/ogg')) {
            NativeEnvironmentSupport.OGG = true;
        }
        if (video.canPlayType('video/quicktime')) {
            NativeEnvironmentSupport.MOV = true;
        }
        if (video.canPlayType('video/x-matroska')) {
            NativeEnvironmentSupport.MKV = true;
        }
    }
    detectEnvironment(); // Run once

    var NATIVE_ERROR_CODES = {
        ABORTED: 1,
        NETWORK: 2,
        DECODE: 3,
        SRC_NOT_SUPPORTED: 4,
    };
    function getNativeAdapterCreator(streamType, deliveryPriority) {
        var NativeAdapter = /** @class */ (function () {
            function NativeAdapter(eventEmitter) {
                this.mediaStreams = null;
                this.eventEmitter = eventEmitter;
                this.currentLevel = 0;
                this._bindCallbacks();
            }
            NativeAdapter.isSupported = function () {
                return NativeEnvironmentSupport[streamType];
            };
            Object.defineProperty(NativeAdapter.prototype, "currentUrl", {
                get: function () {
                    return this.mediaStreams[this.currentLevel].url;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "syncWithLiveTime", {
                get: function () {
                    // TODO: implement syncWithLiveTime for `native`
                    return undefined;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "isDynamicContent", {
                get: function () {
                    return !isFinite(this.video.duration);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "isDynamicContentEnded", {
                get: function () {
                    // TODO: implement isDynamicContentEnded
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "isSyncWithLive", {
                get: function () {
                    // TODO: implement isSyncWithLive for `native`
                    return false;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "isSeekAvailable", {
                get: function () {
                    return true;
                    //Need to find better solution
                    /*
                    if (this.isDynamicContent) {
                      return false;
                    }
              
                    return Boolean(this.output.seekable.length);
                    */
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "mediaStreamDeliveryPriority", {
                get: function () {
                    return deliveryPriority;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "mediaStreamType", {
                get: function () {
                    return streamType;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(NativeAdapter.prototype, "debugInfo", {
                get: function () {
                    if (this.video) {
                        var _a = this.video, buffered = _a.buffered, currentTime = _a.currentTime;
                        var overallBufferLength = geOverallBufferLength(buffered);
                        var nearestBufferSegInfo = getNearestBufferSegmentInfo(buffered, currentTime);
                        return __assign({}, this.mediaStreams[0], { deliveryPriority: this.mediaStreamDeliveryPriority, overallBufferLength: overallBufferLength,
                            nearestBufferSegInfo: nearestBufferSegInfo });
                    }
                    return {};
                },
                enumerable: true,
                configurable: true
            });
            NativeAdapter.prototype._bindCallbacks = function () {
                this._broadcastError = this._broadcastError.bind(this);
            };
            NativeAdapter.prototype.canPlay = function (mediaType) {
                return mediaType === streamType;
            };
            NativeAdapter.prototype.setMediaStreams = function (mediaStreams) {
                this.mediaStreams = mediaStreams;
            };
            NativeAdapter.prototype._logError = function (error, errorEvent) {
                this.eventEmitter.emitAsync(VideoEvent$1.ERROR, {
                    errorType: error,
                    streamType: streamType,
                    streamProvider: 'native',
                    errorInstance: errorEvent,
                });
            };
            NativeAdapter.prototype._broadcastError = function () {
                var error = this.video.error; // take error from event?
                if (!error) {
                    this._logError(Error$2.UNKNOWN, null);
                    return;
                }
                switch (error.code) {
                    case NATIVE_ERROR_CODES.ABORTED:
                        //No need for broadcasting
                        break;
                    case NATIVE_ERROR_CODES.NETWORK:
                        this._logError(Error$2.CONTENT_LOAD, error);
                        break;
                    case NATIVE_ERROR_CODES.DECODE:
                        this._logError(Error$2.MEDIA, error);
                        break;
                    case NATIVE_ERROR_CODES.SRC_NOT_SUPPORTED:
                        /*
                          Our url checks would not allow not supported formats, so only case would be
                           when video tag couldn't retriev any info from endpoit
                        */
                        this._logError(Error$2.CONTENT_LOAD, error);
                        break;
                    default:
                        this._logError(Error$2.UNKNOWN, error);
                        break;
                }
            };
            NativeAdapter.prototype.attach = function (videoElement) {
                this.video = videoElement;
                this.video.addEventListener('error', this._broadcastError);
                this.video.src = this.mediaStreams[this.currentLevel].url;
            };
            NativeAdapter.prototype.detach = function () {
                this.video.removeEventListener('error', this._broadcastError);
                this.video.removeAttribute('src');
                this.video = null;
            };
            return NativeAdapter;
        }());
        return NativeAdapter;
    }

    var defaultPlaybackAdapters = [
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.HLS, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_ADAPTIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.DASH, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_ADAPTIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.MP4, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_PROGRESSIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.WEBM, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_PROGRESSIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.OGG, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_PROGRESSIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.MOV, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_PROGRESSIVE),
        getNativeAdapterCreator(exports.MEDIA_STREAM_TYPES.MKV, exports.MEDIA_STREAM_DELIVERY_PRIORITY.NATIVE_PROGRESSIVE),
    ];

    var additionalModules = {};
    var playbackAdapters = defaultPlaybackAdapters.slice();
    var container = DependencyContainer.createContainer();
    container.register(DIModules);
    var defaultModulesNames = Object.keys(DIModules);
    function registerModule(id, module) {
        additionalModules[id] = module;
    }
    function registerPlaybackAdapter(adapter) {
        playbackAdapters.push(adapter);
    }
    function clearAdditionalModules() {
        additionalModules = {};
    }
    function clearPlaybackAdapters() {
        playbackAdapters = defaultPlaybackAdapters.slice();
    }
    function create(params, themeConfig) {
        if (params === void 0) { params = {}; }
        var scope = container.createScope();
        var additionalModuleNames = Object.keys(additionalModules);
        if (additionalModuleNames.length) {
            additionalModuleNames.forEach(function (moduleName) {
                return scope.registerClass(moduleName, additionalModules[moduleName], {
                    lifetime: DependencyContainer.Lifetime.SCOPED,
                });
            });
        }
        scope.registerValue('availablePlaybackAdapters', playbackAdapters);
        return new Player(params, scope, defaultModulesNames, additionalModuleNames, themeConfig);
    }

    var index$1 = {
        create: create,
        registerModule: registerModule,
        clearAdditionalModules: clearAdditionalModules,
        registerPlaybackAdapter: registerPlaybackAdapter,
        clearPlaybackAdapters: clearPlaybackAdapters,
        ERRORS: Error$2,
        UI_EVENTS: UIEvent$1,
        VIDEO_EVENTS: VideoEvent$1,
        TEXT_LABELS: TextLabel$1,
        MEDIA_STREAM_TYPES: exports.MEDIA_STREAM_TYPES,
        MEDIA_STREAM_DELIVERY_PRIORITY: exports.MEDIA_STREAM_DELIVERY_PRIORITY,
        ENGINE_STATES: EngineState$1,
        LIVE_STATES: LiveState$1,
        VIDEO_VIEW_MODES: exports.VIDEO_VIEW_MODES,
        PRELOAD_TYPES: exports.PRELOAD_TYPES,
        CROSS_ORIGIN_VALUES: exports.CROSS_ORIGIN_VALUES,
        Tooltip: Tooltip,
        playerAPIDecorator: playerAPI,
        DefaultModules: modules,
    };

    exports.create = create;
    exports.registerModule = registerModule;
    exports.clearAdditionalModules = clearAdditionalModules;
    exports.registerPlaybackAdapter = registerPlaybackAdapter;
    exports.clearPlaybackAdapters = clearPlaybackAdapters;
    exports.ERRORS = Error$2;
    exports.UI_EVENTS = UIEvent$1;
    exports.VIDEO_EVENTS = VideoEvent$1;
    exports.TEXT_LABELS = TextLabel$1;
    exports.ENGINE_STATES = EngineState$1;
    exports.LIVE_STATES = LiveState$1;
    exports.Tooltip = Tooltip;
    exports.playerAPIDecorator = playerAPI;
    exports.DefaultModules = modules;
    exports.default = index$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=webplayer.bundle.js.map