"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingOptionTypesWorkflow = exports.createShippingOptionTypesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
exports.createShippingOptionTypesWorkflowId = "create-shipping-option-types";
/**
 * This workflow creates one or more shipping option types. It's used by the
 * [Create Shipping Option Type Admin API Route](https://docs.medusajs.com/api/admin#shipping-option-types_postshippingoptiontypes).
 *
 * This workflow has a hook that allows you to perform custom actions on the created shipping option types. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the shipping option types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type creation.
 *
 * @since 2.10.0
 *
 * @example
 * const { result } = await createShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     shipping_option_types: [
 *       {
 *         label: "Standard",
 *         code: "standard",
 *         description: "Ship in 2-3 days."
 *       }
 *     ],
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more shipping option types.
 *
 * @property hooks.shippingOptionTypesCreated - This hook is executed after the shipping option types are created. You can consume this hook to perform custom actions on the created shipping option types.
 */
exports.createShippingOptionTypesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createShippingOptionTypesWorkflowId, (input) => {
    const shippingOptionTypes = (0, steps_1.createShippingOptionTypesStep)(input.shipping_option_types);
    const shippingOptionTypesCreated = (0, workflows_sdk_1.createHook)("shippingOptionTypesCreated", {
        shipping_option_types: shippingOptionTypes,
        additional_data: input.additional_data,
    });
    const typeIdEvents = (0, workflows_sdk_1.transform)({ shippingOptionTypes }, ({ shippingOptionTypes }) => {
        return shippingOptionTypes.map((v) => {
            return { id: v.id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.ShippingOptionTypeWorkflowEvents.CREATED,
        data: typeIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(shippingOptionTypes, {
        hooks: [shippingOptionTypesCreated],
    });
});
//# sourceMappingURL=create-shipping-option-types.js.map