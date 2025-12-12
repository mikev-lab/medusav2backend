import { RequestHandler } from "express";
import type { MiddlewareFunction, BodyParserConfigRoute } from "../types";
import type { RoutesFinder } from "../routes-finder";
/**
 * Creates the bodyparser middlewares stack that creates custom bodyparsers
 * during an HTTP request based upon the defined config. The bodyparser
 * instances are cached for re-use.
 */
export declare function createBodyParserMiddlewaresStack(route: string, routesFinder: RoutesFinder<BodyParserConfigRoute>, tracer?: (handler: RequestHandler | MiddlewareFunction, route: {
    route: string;
    method?: string;
}) => RequestHandler | MiddlewareFunction): RequestHandler[];
//# sourceMappingURL=bodyparser.d.ts.map