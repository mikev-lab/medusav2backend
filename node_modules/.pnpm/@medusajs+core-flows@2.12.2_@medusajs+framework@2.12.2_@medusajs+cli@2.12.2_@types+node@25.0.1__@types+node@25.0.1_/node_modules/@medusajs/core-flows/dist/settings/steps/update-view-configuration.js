"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViewConfigurationStep = exports.updateViewConfigurationStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateViewConfigurationStepId = "update-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
exports.updateViewConfigurationStep = (0, workflows_sdk_1.createStep)(exports.updateViewConfigurationStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.SETTINGS);
    const currentState = await service.retrieveViewConfiguration(input.id);
    const updated = await service.updateViewConfigurations(input.id, input.data);
    return new workflows_sdk_1.StepResponse(updated, {
        id: input.id,
        previousState: currentState,
    });
}, async (compensateInput, { container }) => {
    if (!compensateInput?.id || !compensateInput?.previousState) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SETTINGS);
    const { id, created_at, updated_at, ...restoreData } = compensateInput.previousState;
    await service.updateViewConfigurations(compensateInput.id, restoreData);
});
//# sourceMappingURL=update-view-configuration.js.map