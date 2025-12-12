"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLoader = void 0;
const utils_1 = require("@medusajs/utils");
const workflows_sdk_1 = require("@medusajs/workflows-sdk");
const logger_1 = require("../logger");
const resource_loader_1 = require("../utils/resource-loader");
class WorkflowLoader extends resource_loader_1.ResourceLoader {
    constructor(sourceDir, container) {
        super(sourceDir, container);
        this.resourceName = "workflow";
    }
    async onFileLoaded(path, fileExports) {
        if ((0, utils_1.isFileSkipped)(fileExports)) {
            const exportedFns = Object.keys(fileExports);
            for (const exportedFn of exportedFns) {
                const fn = fileExports[exportedFn];
                if (fn?.getName?.()) {
                    workflows_sdk_1.MedusaWorkflow.unregisterWorkflow(fn.getName());
                }
            }
            return;
        }
        logger_1.logger.debug(`Registering workflows from ${path}.`);
    }
    /**
     * Load workflows from the source paths, workflows are registering themselves,
     * therefore we only need to import them
     */
    async load() {
        await super.discoverResources();
        this.logger.debug(`Workflows registered.`);
    }
}
exports.WorkflowLoader = WorkflowLoader;
//# sourceMappingURL=workflow-loader.js.map