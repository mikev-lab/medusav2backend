"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderEditAddNewItemWorkflow = exports.orderEditAddNewItemWorkflowId = exports.orderEditAddNewItemValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const locking_1 = require("../../../locking");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
const add_line_items_1 = require("../add-line-items");
const compute_adjustments_for_preview_1 = require("../compute-adjustments-for-preview");
const create_order_change_actions_1 = require("../create-order-change-actions");
const update_tax_lines_1 = require("../update-tax-lines");
const fields_1 = require("./utils/fields");
/**
 * This step validates that new items can be added to an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderEditAddNewItemValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.orderEditAddNewItemValidationStep = (0, workflows_sdk_1.createStep)("order-edit-add-new-item-validation", async function ({ order, orderChange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.orderEditAddNewItemWorkflowId = "order-edit-add-new-item";
/**
 * This workflow adds new items to an order edit. It's used by the
 * [Add Items to Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add new items to an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await orderEditAddNewItemWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add new items to an order edit.
 */
exports.orderEditAddNewItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.orderEditAddNewItemWorkflowId, function (input) {
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
    (0, exports.orderEditAddNewItemValidationStep)({
        order,
        orderChange,
    });
    const lineItems = add_line_items_1.addOrderLineItemsWorkflow.runAsStep({
        input: {
            order_id: order.id,
            items: input.items,
        },
    });
    const lineItemIds = (0, workflows_sdk_1.transform)(lineItems, (lineItems) => {
        return lineItems.map((item) => item.id);
    });
    update_tax_lines_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
            item_ids: lineItemIds,
        },
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({
        order,
        orderChange,
        items: input.items,
        lineItems,
    }, ({ order, orderChange, items, lineItems }) => {
        return items.map((item, index) => ({
            order_change_id: orderChange.id,
            order_id: order.id,
            version: orderChange.version,
            action: utils_1.ChangeActionType.ITEM_ADD,
            internal_note: item.internal_note,
            details: {
                reference_id: lineItems[index].id,
                quantity: item.quantity,
                unit_price: item.unit_price ?? lineItems[index].unit_price,
                compare_at_unit_price: item.compare_at_unit_price ??
                    lineItems[index].compare_at_unit_price,
                metadata: item.metadata,
            },
        }));
    });
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    compute_adjustments_for_preview_1.computeAdjustmentsForPreviewWorkflow.runAsStep({
        input: {
            order,
            orderChange,
        },
    });
    const previewOrderChange = (0, preview_order_change_1.previewOrderChangeStep)(input.order_id);
    (0, locking_1.releaseLockStep)({
        key: input.order_id,
    });
    return new workflows_sdk_1.WorkflowResponse(previewOrderChange);
});
//# sourceMappingURL=order-edit-add-new-item.js.map