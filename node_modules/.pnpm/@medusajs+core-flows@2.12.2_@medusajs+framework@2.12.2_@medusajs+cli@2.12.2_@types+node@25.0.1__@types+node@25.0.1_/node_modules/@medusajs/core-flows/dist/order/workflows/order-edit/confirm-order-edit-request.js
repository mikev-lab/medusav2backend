"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrderEditRequestWorkflow = exports.confirmOrderEditRequestWorkflowId = exports.confirmOrderEditRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const reserve_inventory_1 = require("../../../cart/steps/reserve-inventory");
const prepare_confirm_inventory_input_1 = require("../../../cart/utils/prepare-confirm-inventory-input");
const common_1 = require("../../../common");
const locking_1 = require("../../../locking");
const reservation_1 = require("../../../reservation");
const steps_1 = require("../../steps");
const confirm_order_changes_1 = require("../../steps/confirm-order-changes");
const order_validation_1 = require("../../utils/order-validation");
const create_or_update_order_payment_collection_1 = require("../create-or-update-order-payment-collection");
const fields_1 = require("./utils/fields");
/**
 * This step validates that a requested order edit can be confirmed.
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
 * const data = confirmOrderEditRequestValidationStep({
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
exports.confirmOrderEditRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-confirm-order-edit-request", async function ({ order, orderChange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.confirmOrderEditRequestWorkflowId = "confirm-order-edit-request";
/**
 * This workflow confirms an order edit request. It's used by the
 * [Confirm Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm an order edit
 * in your custom flow.
 *
 * @example
 * const { result } = await confirmOrderEditRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm an order edit request.
 */
exports.confirmOrderEditRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmOrderEditRequestWorkflowId, function (input) {
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
        fields: [
            "id",
            "status",
            "actions.id",
            "actions.order_id",
            "actions.return_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeResult }, ({ orderChangeResult }) => {
        return orderChangeResult.data[0];
    });
    (0, exports.confirmOrderEditRequestValidationStep)({
        order,
        orderChange,
    });
    const orderPreview = (0, steps_1.previewOrderChangeStep)(order.id);
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
        confirmed_by: input.confirmed_by,
    });
    const { data: refreshedOrder } = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: (0, utils_1.deduplicate)([
            ...prepare_confirm_inventory_input_1.requiredOrderFieldsForInventoryConfirmation,
            ...fields_1.fieldsToRefreshOrderEdit,
        ]),
        filters: { id: input.order_id },
        options: {
            throwIfKeyNotFound: true,
            isList: false,
        },
    }).config({ name: "order-items-query" });
    const { variants, items, toRemoveReservationLineItemIds } = (0, workflows_sdk_1.transform)({ refreshedOrder, previousOrderItems: order.items, orderPreview }, ({ refreshedOrder, previousOrderItems, orderPreview }) => {
        const allItems = [];
        const allVariants = [];
        const previousItemIds = (previousOrderItems || []).map(({ id }) => id);
        const currentItemIds = refreshedOrder.items.map(({ id }) => id);
        const removedItemIds = previousItemIds.filter((id) => !currentItemIds.includes(id));
        const updatedItemIds = [];
        refreshedOrder.items.forEach((ordItem) => {
            const itemAction = orderPreview.items?.find((item) => item.id === ordItem.id &&
                item.actions?.find((a) => a.action === utils_1.ChangeActionType.ITEM_ADD ||
                    a.action === utils_1.ChangeActionType.ITEM_UPDATE));
            if (!itemAction) {
                return;
            }
            const updateAction = itemAction.actions.find((a) => a.action === utils_1.ChangeActionType.ITEM_UPDATE);
            if (updateAction) {
                updatedItemIds.push(ordItem.id);
            }
            const newQuantity = itemAction.raw_quantity ?? itemAction.quantity;
            const reservationQuantity = utils_1.MathBN.sub(newQuantity, ordItem.raw_fulfilled_quantity);
            allItems.push({
                id: ordItem.id,
                variant_id: ordItem.variant_id,
                quantity: reservationQuantity,
            });
            allVariants.push(ordItem.variant);
        });
        return {
            variants: allVariants,
            items: allItems,
            toRemoveReservationLineItemIds: [
                ...removedItemIds,
                ...updatedItemIds,
            ],
        };
    });
    const formatedInventoryItems = (0, workflows_sdk_1.transform)({
        input: {
            sales_channel_id: refreshedOrder.sales_channel_id,
            variants,
            items,
        },
    }, prepare_confirm_inventory_input_1.prepareConfirmInventoryInput);
    (0, reservation_1.deleteReservationsByLineItemsStep)(toRemoveReservationLineItemIds);
    (0, reserve_inventory_1.reserveInventoryStep)(formatedInventoryItems);
    create_or_update_order_payment_collection_1.createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    });
    const eventData = (0, workflows_sdk_1.transform)({ order, orderChange }, ({ order, orderChange }) => {
        return {
            order_id: order.id,
            actions: orderChange.actions,
        };
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderEditWorkflowEvents.CONFIRMED,
        data: eventData,
    });
    (0, locking_1.releaseLockStep)({
        key: input.order_id,
    });
    return new workflows_sdk_1.WorkflowResponse(orderPreview);
});
//# sourceMappingURL=confirm-order-edit-request.js.map