import type { Express, RequestHandler } from "express";
import type { MiddlewareFunction, RouteHandler } from "./types";
import { MedusaContainer } from "@medusajs/types";
export declare class ApiLoader {
    #private;
    /**
     * Wrap the original route handler implementation for
     * instrumentation.
     */
    static traceRoute?: (handler: RouteHandler, route: {
        route: string;
        method: string;
    }) => RouteHandler;
    /**
     * Wrap the original middleware handler implementation for
     * instrumentation.
     */
    static traceMiddleware?: (handler: RequestHandler | MiddlewareFunction, route: {
        route: string;
        method?: string;
    }) => RequestHandler | MiddlewareFunction;
    constructor({ app, sourceDir, baseRestrictedFields, container, }: {
        app: Express;
        sourceDir: string | string[];
        baseRestrictedFields?: string[];
        container: MedusaContainer;
    });
    load(): Promise<void>;
    /**
     * Clear all API resources registered by this loader
     * This removes all routes and middleware added after the initial stack state
     * Used by HMR to reset the API state before reloading
     */
    clearAllResources(): void;
}
//# sourceMappingURL=router.d.ts.map