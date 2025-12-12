import { BaseResourceData, ResourceMap, ResourceRegistrationData, ResourceTypeHandler } from "./types";
export type { BaseResourceData, ResourceEntry, ResourceMap, ResourcePath, ResourceType, ResourceTypeHandler, } from "./types";
/**
 * Maps source file paths to their registered resources
 * Structure: sourcePath -> Map<resourceType, ResourceEntry[]>
 */
export declare const globalDevServerRegistry: Map<string, ResourceMap>;
/**
 * Inverse registry for looking up source paths by resource
 * Structure: "type:id" -> sourcePath[]
 * Used to find which files contain a specific resource
 */
export declare const inverseDevServerRegistry: Map<string, string[]>;
/**
 * Register a resource type handler
 *
 * @example
 * ```typescript
 * class RouteHandler implements ResourceTypeHandler<RouteData> {
 *   readonly type = "route"
 *   validate(data: RouteData): void { ... }
 *   resolveSourcePath(data: RouteData): string { ... }
 *   createEntry(data: RouteData): ResourceEntry { ... }
 *   getInverseKey(data: RouteData): string { ... }
 * }
 *
 * registerResourceTypeHandler(new RouteHandler())
 * ```
 */
export declare function registerResourceTypeHandler(handler: ResourceTypeHandler): void;
/**
 * Register a resource in the dev server for hot module reloading
 *
 * This function uses a strategy pattern where each resource type has its own handler.
 * The handler is responsible for:
 * - Validating the registration data
 * - Resolving the source path
 * - Creating the registry entry
 * - Generating the inverse registry key
 *
 * @param data - Resource registration data
 * @throws Error if validation fails or handler is not found
 *
 * @example
 * ```typescript
 * // Register a workflow
 * registerDevServerResource({
 *   type: "workflow",
 *   id: "create-product",
 *   sourcePath: "/src/workflows/create-product.ts"
 * })
 *
 * // Register a step
 * registerDevServerResource({
 *   type: "step",
 *   id: "validate-product",
 *   workflowId: "create-product"
 * })
 * ```
 */
export declare function registerDevServerResource(data: ResourceRegistrationData): void;
export declare function registerDevServerResource<T extends BaseResourceData>(data: T): void;
//# sourceMappingURL=index.d.ts.map