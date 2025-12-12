"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobLoader = void 0;
const utils_1 = require("@medusajs/utils");
const workflows_sdk_1 = require("@medusajs/workflows-sdk");
const resource_loader_1 = require("../utils/resource-loader");
class JobLoader extends resource_loader_1.ResourceLoader {
    constructor(sourceDir, container) {
        super(sourceDir, container);
        this.resourceName = "job";
    }
    async loadFile(path) {
        const exports = await (0, utils_1.dynamicImport)(path);
        await this.onFileLoaded(path, exports);
    }
    async onFileLoaded(path, fileExports) {
        if ((0, utils_1.isFileSkipped)(fileExports)) {
            return;
        }
        this.validateConfig(fileExports.config);
        this.logger.debug(`Registering job from ${path}.`);
        this.register({
            path,
            config: fileExports.config,
            handler: fileExports.default,
        });
    }
    /**
     * Validate cron job configuration
     * @param config
     * @protected
     */
    validateConfig(config) {
        if (!config) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Config is required for scheduled jobs.");
        }
        if (!config.schedule) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Cron schedule definition is required for scheduled jobs.");
        }
        if (!config.name) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, "Job name is required for scheduled jobs.");
        }
    }
    /**
     * Create a workflow to register a new cron job
     * @param config
     * @param handler
     * @protected
     */
    register({ path, config, handler, }) {
        const workflowName = `job-${config.name}`;
        const step = (0, workflows_sdk_1.createStep)(`${config.name}-as-step`, async (_, stepContext) => {
            const { container } = stepContext;
            try {
                const res = await handler(container);
                return new workflows_sdk_1.StepResponse(res, res);
            }
            catch (error) {
                this.logger.error(`Scheduled job ${config.name} failed with error: ${error.message}`);
                throw error;
            }
        });
        const workflowConfig = {
            name: workflowName,
            schedule: (0, utils_1.isObject)(config.schedule)
                ? config.schedule
                : {
                    cron: config.schedule,
                    numberOfExecutions: config.numberOfExecutions,
                },
        };
        (0, workflows_sdk_1.createWorkflow)(workflowConfig, () => {
            step();
        });
        (0, utils_1.registerDevServerResource)({
            sourcePath: path,
            id: workflowName,
            type: "job",
            config: config,
        });
    }
    /**
     * Load cron jobs from one or multiple source paths
     */
    async load() {
        await super.discoverResources();
        this.logger.debug(`Jobs registered.`);
    }
}
exports.JobLoader = JobLoader;
//# sourceMappingURL=job-loader.js.map