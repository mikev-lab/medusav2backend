"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActiveViewConfigurationStep = exports.setActiveViewConfigurationStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.setActiveViewConfigurationStepId = "set-active-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
exports.setActiveViewConfigurationStep = (0, workflows_sdk_1.createStep)(exports.setActiveViewConfigurationStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.SETTINGS);
    // Get the currently active view configuration for rollback
    const currentActiveView = await service.getActiveViewConfiguration(input.entity, input.user_id);
    // Set the new view as active
    await service.setActiveViewConfiguration(input.entity, input.user_id, input.id);
    return new workflows_sdk_1.StepResponse(input.id, {
        entity: input.entity,
        user_id: input.user_id,
        previousActiveViewId: currentActiveView?.id || null,
    });
}, async (compensateInput, { container }) => {
    if (!compensateInput) {
        return;
    }
    const service = container.resolve(utils_1.Modules.SETTINGS);
    if (compensateInput.previousActiveViewId) {
        // Restore the previous active view
        await service.setActiveViewConfiguration(compensateInput.entity, compensateInput.user_id, compensateInput.previousActiveViewId);
    }
    else {
        // If there was no previous active view, clear the active view
        await service.clearActiveViewConfiguration(compensateInput.entity, compensateInput.user_id);
    }
});
//# sourceMappingURL=set-active-view-configuration.js.map