"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemOrderEditActionWorkflow = exports.removeItemOrderEditActionWorkflowId = exports.removeOrderEditItemActionValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const locking_1 = require("../../../locking");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
const compute_adjustments_for_preview_1 = require("../compute-adjustments-for-preview");
const fields_1 = require("./utils/fields");
/**
 * This step validates that an item that was added in the order edit can be removed
 * from the order edit. If the order is canceled or the order change is not active,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeOrderEditItemActionValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
exports.removeOrderEditItemActionValidationStep = (0, workflows_sdk_1.createStep)("remove-item-order-edit-action-validation", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No item found for order ${input.order_id} in order change ${orderChange.id}`);
    }
    else if (![utils_1.ChangeActionType.ITEM_ADD, utils_1.ChangeActionType.ITEM_UPDATE].includes(associatedAction.action)) {
        throw new Error(`Action ${associatedAction.id} is not adding or updating an item`);
    }
});
exports.removeItemOrderEditActionWorkflowId = "remove-item-order edit-action";
/**
 * This workflow removes an item that was added to an order edit. It's used by the
 * [Remove Item from Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsiditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item that was
 * added to an order edit in your custom flow.
 *
 * @example
 * const { result } = await removeItemOrderEditActionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item that was added to an order edit.
 */
exports.removeItemOrderEditActionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeItemOrderEditActionWorkflowId, function (input) {
    (0, locking_1.acquireLockStep)({
        key: input.order_id,
        timeout: 2,
        ttl: 10,
    });
    const orderResult = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: fields_1.fieldsToRefreshOrderEdit,
        filters: { id: input.order_id },
        options: {
            throwIfKeyNotFound: true,
        },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderResult }, ({ orderResult }) => {
        return orderResult.data[0];
    });
    const orderChangeResult = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "version", "actions.*", "carry_over_promotions"],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeResult }, ({ orderChangeResult }) => {
        return orderChangeResult.data[0];
    });
    (0, exports.removeOrderEditItemActionValidationStep)({
        order,
        input,
        orderChange,
    });
    (0, steps_1.deleteOrderChangeActionsStep)({ ids: [input.action_id] });
    compute_adjustments_for_preview_1.computeAdjustmentsForPreviewWorkflow.runAsStep({
        input: {
            order,
            orderChange,
        },
    });
    const previewOrderChange = (0, steps_1.previewOrderChangeStep)(order.id);
    (0, locking_1.releaseLockStep)({
        key: input.order_id,
    });
    return new workflows_sdk_1.WorkflowResponse(previewOrderChange);
});
//# sourceMappingURL=remove-order-edit-item-action.js.map