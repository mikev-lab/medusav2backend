import { type RouteDescriptor } from "./types";
/**
 * Exposes to API to register routes manually or by scanning the filesystem from a
 * source directory.
 *
 * In case of duplicates routes, the route registered afterwards will override the
 * one registered first.
 */
export declare class RoutesLoader {
    #private;
    /**
     * Creates the route path from its relative file path.
     */
    createRoutePath(relativePath: string): string;
    /**
     * Scans a given directory and loads all routes from it. You can access the loaded
     * routes via "getRoutes" method
     */
    scanDir(sourceDir: string): Promise<void>;
    /**
     * Register a route
     */
    registerRoute(route: RouteDescriptor): void;
    /**
     * Register one or more routes
     */
    registerRoutes(routes: RouteDescriptor[]): void;
    /**
     * Returns an array of routes scanned by the routes loader or registered
     * manually.
     */
    getRoutes(): RouteDescriptor[];
    /**
     * Reload a single route file
     * This is used by HMR to reload routes when files change
     */
    reloadRouteFile(absolutePath: string, sourceDir: string): Promise<RouteDescriptor[]>;
}
//# sourceMappingURL=routes-loader.d.ts.map