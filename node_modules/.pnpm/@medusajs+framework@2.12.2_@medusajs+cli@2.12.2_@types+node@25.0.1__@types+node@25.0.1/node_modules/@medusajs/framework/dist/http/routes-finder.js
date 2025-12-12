"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RoutesFinder_existingMatches, _RoutesFinder_routes;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesFinder = void 0;
const path_to_regexp_1 = require("path-to-regexp");
const utils_1 = require("@medusajs/utils");
class RoutesFinder {
    constructor(routes) {
        /**
         * Cache of existing matches to avoid regex tests on every
         * single HTTP request
         */
        _RoutesFinder_existingMatches.set(this, new Map()
        /**
         * Collection of registered routes
         */
        );
        /**
         * Collection of registered routes
         */
        _RoutesFinder_routes.set(this, []);
        if (routes) {
            routes.forEach((route) => this.add(route));
        }
    }
    /**
     * Register route for lookup
     */
    add(route) {
        // Doing a replacement for backwards compatibility with the old path-to-regexp with express 4
        let normalizedPath = route.matcher;
        if ((0, utils_1.isString)(route.matcher)) {
            // Replace /* with {*splat} (wildcard matches zero or more path segments)
            normalizedPath = normalizedPath.replace(/\/\*/g, "{*splat}");
            // Replace /path* (no slash before asterisk) with /path{*splat}
            normalizedPath = normalizedPath.replace(/(\w)\*/g, "$1{*splat}");
        }
        __classPrivateFieldGet(this, _RoutesFinder_routes, "f").push({
            ...route,
            matchRegex: (0, path_to_regexp_1.pathToRegexp)(normalizedPath).regexp,
        });
    }
    /**
     * Get the matching route for a given HTTP method and URL
     */
    find(url, method) {
        const key = `${method}:${url}`;
        if (__classPrivateFieldGet(this, _RoutesFinder_existingMatches, "f").has(key)) {
            return __classPrivateFieldGet(this, _RoutesFinder_existingMatches, "f").get(key);
        }
        const result = __classPrivateFieldGet(this, _RoutesFinder_routes, "f").find((route) => {
            if ("methods" in route) {
                return route.methods.includes(method) && route.matchRegex.test(url);
            }
            return route.method === method && route.matchRegex.test(url);
        }) ?? null;
        __classPrivateFieldGet(this, _RoutesFinder_existingMatches, "f").set(key, result);
        return result;
    }
}
exports.RoutesFinder = RoutesFinder;
_RoutesFinder_existingMatches = new WeakMap(), _RoutesFinder_routes = new WeakMap();
//# sourceMappingURL=routes-finder.js.map