"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderEditAddItemWorkflow = exports.updateOrderEditAddItemWorkflowId = exports.updateOrderEditAddItemValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const locking_1 = require("../../../locking");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
const compute_adjustments_for_preview_1 = require("../compute-adjustments-for-preview");
const fields_1 = require("./utils/fields");
/**
 * This step validates that a new item can be updated in an order edit.
 * If the order is canceled, the order change is not active,
 * the item isn't in the order edit, or the action isn't adding an item,
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
 * const data = updateOrderEditAddItemValidationStep({
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
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 */
exports.updateOrderEditAddItemValidationStep = (0, workflows_sdk_1.createStep)("update-order-edit-add-item-validation", async function ({ order, orderChange, input }, context) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No request to add item for order ${input.order_id} in order change ${orderChange.id}`);
    }
    else if (associatedAction.action !== utils_1.ChangeActionType.ITEM_ADD) {
        throw new Error(`Action ${associatedAction.id} is not adding an item`);
    }
});
exports.updateOrderEditAddItemWorkflowId = "update-order-edit-add-item";
/**
 * This workflow updates a new item in an order edit. It's used by the
 * [Update Item Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update a new item in an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await updateOrderEditAddItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a new item in an order edit.
 */
exports.updateOrderEditAddItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateOrderEditAddItemWorkflowId, function (input) {
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
    (0, exports.updateOrderEditAddItemValidationStep)({
        order,
        input,
        orderChange,
    });
    const updateData = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ input, orderChange }) => {
        const originalAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        const data = input.data;
        return {
            id: input.action_id,
            details: {
                quantity: data.quantity ?? originalAction.details?.quantity,
                unit_price: data.unit_price ?? originalAction.details?.unit_price,
                compare_at_unit_price: data.compare_at_unit_price ??
                    originalAction.details?.compare_at_unit_price,
            },
            internal_note: data.internal_note,
        };
    });
    (0, steps_1.updateOrderChangeActionsStep)([updateData]);
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
//# sourceMappingURL=update-order-edit-add-item.js.map