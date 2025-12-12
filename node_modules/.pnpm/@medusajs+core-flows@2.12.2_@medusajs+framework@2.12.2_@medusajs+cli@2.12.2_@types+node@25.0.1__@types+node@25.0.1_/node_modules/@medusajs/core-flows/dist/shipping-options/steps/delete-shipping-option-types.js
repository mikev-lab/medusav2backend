"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOptionTypesStep = exports.deleteShippingOptionTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteShippingOptionTypesStepId = "delete-shipping-option-types";
/**
 * This step deletes one or more shipping option types.
 *
 * @since 2.10.0
 */
exports.deleteShippingOptionTypesStep = (0, workflows_sdk_1.createStep)(exports.deleteShippingOptionTypesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.softDeleteShippingOptionTypes(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.restoreShippingOptionTypes(prevIds);
});
//# sourceMappingURL=delete-shipping-option-types.js.map