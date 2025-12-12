"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inverseDevServerRegistry = exports.globalDevServerRegistry = void 0;
exports.registerResourceTypeHandler = registerResourceTypeHandler;
exports.registerDevServerResource = registerDevServerResource;
const feature_flags_1 = require("../feature-flags");
const job_handler_1 = require("./handlers/job-handler");
const step_handler_1 = require("./handlers/step-handler");
const subscriber_handler_1 = require("./handlers/subscriber-handler");
const workflow_handler_1 = require("./handlers/workflow-handler");
const registry_helpers_1 = require("./registry-helpers");
/**
 * Maps source file paths to their registered resources
 * Structure: sourcePath -> Map<resourceType, ResourceEntry[]>
 */
exports.globalDevServerRegistry = new Map();
/**
 * Inverse registry for looking up source paths by resource
 * Structure: "type:id" -> sourcePath[]
 * Used to find which files contain a specific resource
 */
exports.inverseDevServerRegistry = new Map();
/**
 * Registry of resource type handlers
 * Each handler implements the logic for a specific resource type
 */
const resourceHandlers = new Map();
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
function registerResourceTypeHandler(handler) {
    if (resourceHandlers.has(handler.type)) {
        console.warn(`Resource type handler for "${handler.type}" is being overridden`);
    }
    resourceHandlers.set(handler.type, handler);
}
registerResourceTypeHandler(new workflow_handler_1.WorkflowHandler());
registerResourceTypeHandler(new step_handler_1.StepHandler(exports.inverseDevServerRegistry));
registerResourceTypeHandler(new subscriber_handler_1.SubscriberHandler());
registerResourceTypeHandler(new job_handler_1.JobHandler());
function registerDevServerResource(data) {
    // Skip registration in production or if HMR is disabled
    const isProduction = ["production", "prod"].includes(process.env.NODE_ENV || "");
    if (!feature_flags_1.FeatureFlag.isFeatureEnabled("backend_hmr") || isProduction) {
        return;
    }
    const handler = resourceHandlers.get(data.type);
    if (!handler) {
        throw new Error(`No handler registered for resource type "${data.type}". ` +
            `Available types: ${Array.from(resourceHandlers.keys()).join(", ")}. ` +
            `Use registerResourceTypeHandler() to add support for custom types.`);
    }
    try {
        handler.validate(data);
        const sourcePath = handler.resolveSourcePath(data);
        const registry = (0, registry_helpers_1.getOrCreateRegistry)(exports.globalDevServerRegistry, sourcePath);
        const entry = handler.createEntry(data);
        (0, registry_helpers_1.addToRegistry)(registry, data.type, entry);
        const inverseKey = handler.getInverseKey(data);
        (0, registry_helpers_1.addToInverseRegistry)(exports.inverseDevServerRegistry, inverseKey, sourcePath);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to register ${data.type} resource "${data.id}": ${errorMessage}`);
    }
}
//# sourceMappingURL=index.js.map