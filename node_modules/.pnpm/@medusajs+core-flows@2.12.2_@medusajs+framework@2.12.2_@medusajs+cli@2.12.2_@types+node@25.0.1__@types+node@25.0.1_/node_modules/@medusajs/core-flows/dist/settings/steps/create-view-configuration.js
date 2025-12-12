"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViewConfigurationStep = exports.createViewConfigurationStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createViewConfigurationStepId = "create-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
exports.createViewConfigurationStep = (0, workflows_sdk_1.createStep)(exports.createViewConfigurationStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.SETTINGS);
    const created = await service.createViewConfigurations(data);
    return new workflows_sdk_1.StepResponse(created, { id: created.id });
}, async (compensateInput, { container }) => {
    if (!compensateInput?.id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SETTINGS);
    await service.deleteViewConfigurations([compensateInput.id]);
});
//# sourceMappingURL=create-view-configuration.js.map