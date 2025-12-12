"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlagsLoader = featureFlagsLoader;
const telemetry_1 = require("@medusajs/telemetry");
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("../deps/awilix");
const path_1 = require("path");
const config_1 = require("../config");
const container_1 = require("../container");
const logger_1 = require("../logger");
container_1.container.register(utils_1.ContainerRegistrationKeys.FEATURE_FLAG_ROUTER, (0, awilix_1.asFunction)(() => utils_1.FeatureFlag));
/**
 * Load feature flags from a directory and from the already loaded config under the hood
 * @param sourcePath
 */
async function featureFlagsLoader(sourcePath) {
    const confManager = !!config_1.configManager.baseDir
        ? config_1.configManager.config
        : { featureFlags: {}, logger: logger_1.logger };
    const { featureFlags: projectConfigFlags = {}, logger } = confManager;
    if (!sourcePath) {
        return utils_1.FeatureFlag;
    }
    const flagDir = (0, path_1.normalize)(sourcePath);
    await (0, utils_1.discoverAndRegisterFeatureFlags)({
        flagDir,
        projectConfigFlags,
        router: utils_1.FeatureFlag,
        logger,
        track: (key) => (0, telemetry_1.trackFeatureFlag)(key),
    });
    return utils_1.FeatureFlag;
}
//# sourceMappingURL=feature-flag-loader.js.map