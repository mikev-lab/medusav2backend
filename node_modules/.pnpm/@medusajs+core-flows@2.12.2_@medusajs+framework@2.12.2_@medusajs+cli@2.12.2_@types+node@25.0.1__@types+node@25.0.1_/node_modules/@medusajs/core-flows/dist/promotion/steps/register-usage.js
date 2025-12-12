"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUsageStep = exports.registerUsageStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerUsageStepId = "register-usage";
/**
 * This step registers usage for a promotion.
 */
exports.registerUsageStep = (0, workflows_sdk_1.createStep)(exports.registerUsageStepId, async (data, { container }) => {
    if (!data.computedActions.length) {
        return new workflows_sdk_1.StepResponse(null, {
            computedActions: [],
            registrationContext: data.registrationContext,
        });
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.registerUsage(data.computedActions, data.registrationContext);
    return new workflows_sdk_1.StepResponse(null, data);
}, async (revertData, { container }) => {
    if (!revertData?.computedActions.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.revertUsage(revertData.computedActions, revertData.registrationContext);
});
//# sourceMappingURL=register-usage.js.map