"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingOptionTypesWorkflow = exports.updateShippingOptionTypesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.updateShippingOptionTypesWorkflowId = "update-shipping-option-types";
/**
 * This workflow updates one or more shipping option types. It's used by the
 * [Update Shipping Option Type Admin API Route](https://docs.medusajs.com/api/admin#shipping-option-types_postshippingoptiontypesid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated shipping option types. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the shipping option types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type updates.
 *
 * @since 2.10.0
 *
 * @example
 * const { result } = await updateShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "sotype_123"
 *     },
 *     update: {
 *       label: "Standard"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more shipping option types.
 *
 * @property hooks.shippingOptionTypesUpdated - This hook is executed after the shipping option types are updated. You can consume this hook to perform custom actions on the updated shipping option types.
 */
exports.updateShippingOptionTypesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateShippingOptionTypesWorkflowId, (input) => {
    const updatedShippingOptionTypes = (0, steps_1.updateShippingOptionTypesStep)(input);
    const shippingOptionTypesUpdated = (0, workflows_sdk_1.createHook)("shippingOptionTypesUpdated", {
        shipping_option_types: updatedShippingOptionTypes,
        additional_data: input.additional_data,
    });
    const typeIdEvents = (0, workflows_sdk_1.transform)({ updatedShippingOptionTypes }, ({ updatedShippingOptionTypes }) => {
        const arr = Array.isArray(updatedShippingOptionTypes)
            ? updatedShippingOptionTypes
            : [updatedShippingOptionTypes];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ShippingOptionTypeWorkflowEvents.UPDATED,
        data: typeIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedShippingOptionTypes, {
        hooks: [shippingOptionTypesUpdated],
    });
});
//# sourceMappingURL=update-shipping-option-types.js.map