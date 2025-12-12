"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOptionTypesWorkflow = exports.deleteShippingOptionTypesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const workflows_sdk_2 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const remove_remote_links_1 = require("../../common/steps/remove-remote-links");
const steps_1 = require("../steps");
const common_1 = require("../../common");
const validateDeleteShippingOptionTypesStep = (0, workflows_sdk_2.createStep)("validate-delete-shipping-option-types", (input) => {
    const shippingOptions = input.shippingOptions;
    if (shippingOptions.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Cannot delete shipping option type because some shipping options are using it.");
    }
});
exports.deleteShippingOptionTypesWorkflowId = "delete-shipping-option-types";
/**
 * This workflow deletes one or more shipping-option types. It's used by the
 * [Delete Shipping Option Types Admin API Route](https://docs.medusajs.com/api/admin#shipping-option-types_deleteshippingoptiontypesid).
 *
 * This workflow has a hook that allows you to perform custom actions after the shipping-option types are deleted. For example,
 * you can delete custom records linked to the shipping-option types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around shipping option type deletion.
 *
 * @since 2.10.0
 *
 * @example
 * const { result } = await deleteShippingOptionTypesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sotype_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more shipping option types.
 *
 * @property hooks.shippingOptionTypesDeleted - This hook is executed after the types are deleted. You can consume this hook to perform custom actions on the deleted types.
 */
exports.deleteShippingOptionTypesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteShippingOptionTypesWorkflowId, (input) => {
    const shippingOptionsQuery = (0, common_1.useQueryGraphStep)({
        entity: "shipping_option",
        filters: { shipping_option_type_id: input.ids },
        pagination: { take: 1 },
        fields: ["id"],
    }).config({ name: "get-shipping-options" });
    const shippingOptions = (0, workflows_sdk_1.transform)({ shippingOptionsQuery }, ({ shippingOptionsQuery }) => shippingOptionsQuery.data);
    validateDeleteShippingOptionTypesStep({
        shippingOptions,
    });
    const deletedShippingOptionTypes = (0, steps_1.deleteShippingOptionTypesStep)(input.ids);
    const shippingOptionTypesDeleted = (0, workflows_sdk_1.createHook)("shippingOptionTypesDeleted", {
        ids: input.ids,
    });
    const typeIdEvents = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return input.ids?.map((id) => {
            return { id };
        });
    });
    (0, workflows_sdk_1.parallelize)((0, remove_remote_links_1.removeRemoteLinkStep)({
        [utils_1.Modules.FULFILLMENT]: { shipping_option_type_id: input.ids },
    }), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ShippingOptionTypeWorkflowEvents.DELETED,
        data: typeIdEvents,
    }));
    return new workflows_sdk_1.WorkflowResponse(deletedShippingOptionTypes, {
        hooks: [shippingOptionTypesDeleted],
    });
});
//# sourceMappingURL=delete-shipping-option-types.js.map