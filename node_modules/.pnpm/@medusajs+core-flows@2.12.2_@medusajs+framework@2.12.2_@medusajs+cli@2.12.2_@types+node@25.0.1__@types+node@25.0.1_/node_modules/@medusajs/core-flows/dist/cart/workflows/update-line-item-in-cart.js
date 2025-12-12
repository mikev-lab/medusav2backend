"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemInCartWorkflow = exports.updateLineItemInCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const emit_event_1 = require("../../common/steps/emit-event");
const line_item_1 = require("../../line-item");
const steps_1 = require("../../line-item/steps");
const locking_1 = require("../../locking");
const validate_cart_1 = require("../steps/validate-cart");
const validate_variant_prices_1 = require("../steps/validate-variant-prices");
const fields_1 = require("../utils/fields");
const prepare_confirm_inventory_input_1 = require("../utils/prepare-confirm-inventory-input");
const schemas_1 = require("../utils/schemas");
const confirm_variant_inventory_1 = require("./confirm-variant-inventory");
const refresh_cart_items_1 = require("./refresh-cart-items");
const cartFields = fields_1.cartFieldsForPricingContext.concat(["items.*"]);
const variantFields = fields_1.productVariantsFields.concat(["calculated_price.*"]);
exports.updateLineItemInCartWorkflowId = "update-line-item-in-cart";
/**
 * This workflow updates a line item's details in a cart. You can update the line item's quantity, unit price, and more.
 * If the quantity is set to 0, the item will be removed from the cart.
 * This workflow is executed by the [Update Line Item Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidlineitemsline_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a line item's details in your custom flows.
 *
 * @example
 * const { result } = await updateLineItemInCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     item_id: "item_123",
 *     update: {
 *       quantity: 2
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's line item.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 * @property hooks.setPricingContext - This hook is executed before the cart is updated. You can consume this hook to return any custom context useful for the prices retrieval of the line item's variant.
 *
 * For example, assuming you have the following custom pricing rule:
 *
 * ```json
 * {
 *   "attribute": "location_id",
 *   "operator": "eq",
 *   "value": "sloc_123",
 * }
 * ```
 *
 * You can consume the `setPricingContext` hook to add the `location_id` context to the prices calculation:
 *
 * ```ts
 * import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * addToCartWorkflow.hooks.setPricingContext((
 *   { cart, variantIds, items, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The variant's prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
exports.updateLineItemInCartWorkflow = (0, workflows_sdk_1.createWorkflow)({
    name: exports.updateLineItemInCartWorkflowId,
    idempotent: false,
}, (input) => {
    (0, locking_1.acquireLockStep)({
        key: input.cart_id,
        timeout: 2,
        ttl: 10,
    });
    const { data: cart } = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: cartFields,
        options: { throwIfKeyNotFound: true, isList: false },
    }).config({ name: "get-cart" });
    const { item, variantIds } = (0, workflows_sdk_1.transform)({ cart, input }, (data) => {
        const item = data.cart.items.find((i) => i.id === data.input.item_id);
        if (!item) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Line item with id: ${data.input.item_id} was not found`);
        }
        const variantIds = [item?.variant_id].filter(Boolean);
        return { item, variantIds };
    });
    (0, validate_cart_1.validateCartStep)({ cart });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    const setPricingContext = (0, workflows_sdk_1.createHook)("setPricingContext", {
        cart,
        item,
        variantIds,
        additional_data: input.additional_data,
    }, {
        resultValidator: schemas_1.pricingContextResult,
    });
    const setPricingContextResult = setPricingContext.getResult();
    const pricingContext = (0, workflows_sdk_1.transform)({ cart, item, update: input.update, setPricingContextResult }, (data) => {
        return {
            ...(0, utils_1.filterObjectByKeys)(data.cart, fields_1.cartFieldsForPricingContext),
            ...(data.setPricingContextResult ? data.setPricingContextResult : {}),
            quantity: data.update.quantity ?? data.item.quantity,
            currency_code: data.cart.currency_code,
            region_id: data.cart.region_id,
            region: data.cart.region,
            customer_id: data.cart.customer_id,
            customer: data.cart.customer,
        };
    });
    const shouldRemoveItem = (0, workflows_sdk_1.transform)({ input }, ({ input }) => !!((0, utils_1.isDefined)(input.update.quantity) &&
        utils_1.MathBN.eq(input.update.quantity, 0)));
    (0, workflows_sdk_1.when)("should-remove-item", { shouldRemoveItem }, ({ shouldRemoveItem }) => shouldRemoveItem).then(() => {
        line_item_1.deleteLineItemsWorkflow.runAsStep({
            input: {
                cart_id: input.cart_id,
                ids: [input.item_id],
                additional_data: input.additional_data,
            },
        });
    });
    const variants = (0, workflows_sdk_1.when)("should-fetch-variants", { variantIds, shouldRemoveItem }, ({ variantIds, shouldRemoveItem }) => {
        return !!variantIds.length && !shouldRemoveItem;
    }).then(() => {
        const calculatedPriceQueryContext = (0, workflows_sdk_1.transform)({ pricingContext }, ({ pricingContext }) => {
            return (0, utils_1.QueryContext)(pricingContext);
        });
        const { data: variants } = (0, common_1.useQueryGraphStep)({
            entity: "variants",
            fields: (0, utils_1.deduplicate)([
                ...variantFields,
                ...prepare_confirm_inventory_input_1.requiredVariantFieldsForInventoryConfirmation,
            ]),
            filters: {
                id: variantIds,
            },
            context: {
                calculated_price: calculatedPriceQueryContext,
            },
        }).config({ name: "fetch-variants" });
        (0, validate_variant_prices_1.validateVariantPricesStep)({ variants });
        return variants;
    });
    (0, workflows_sdk_1.when)("should-update-item", { shouldRemoveItem }, ({ shouldRemoveItem }) => !shouldRemoveItem).then(() => {
        const items = (0, workflows_sdk_1.transform)({ input, item }, (data) => {
            return [
                Object.assign(data.item, { quantity: data.input.update.quantity }),
            ];
        });
        confirm_variant_inventory_1.confirmVariantInventoryWorkflow.runAsStep({
            input: {
                sales_channel_id: pricingContext.sales_channel_id,
                variants,
                items,
            },
        });
        const lineItemUpdate = (0, workflows_sdk_1.transform)({ input, variants, item, pricingContext }, (data) => {
            const variant = data.variants?.[0] ?? undefined;
            const item = data.item;
            const updateData = {
                ...data.input.update,
                unit_price: (0, utils_1.isDefined)(data.input.update.unit_price)
                    ? data.input.update.unit_price
                    : item.unit_price,
                is_custom_price: (0, utils_1.isDefined)(data.input.update.unit_price)
                    ? true
                    : item.is_custom_price,
                is_tax_inclusive: item.is_tax_inclusive ||
                    variant?.calculated_price?.is_calculated_price_tax_inclusive,
            };
            if (variant && !updateData.is_custom_price) {
                updateData.unit_price = variant.calculated_price.calculated_amount;
            }
            if (!(0, utils_1.isDefined)(updateData.unit_price)) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Line item ${item.title} has no unit price`);
            }
            return {
                data: updateData,
                selector: {
                    id: data.input.item_id,
                },
            };
        });
        (0, steps_1.updateLineItemsStepWithSelector)(lineItemUpdate);
        refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
            input: {
                cart_id: input.cart_id,
                additional_data: input.additional_data,
            },
        });
    });
    (0, workflows_sdk_1.parallelize)((0, locking_1.releaseLockStep)({
        key: input.cart_id,
    }), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CartWorkflowEvents.UPDATED,
        data: { id: input.cart_id },
    }));
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate, setPricingContext],
    });
});
//# sourceMappingURL=update-line-item-in-cart.js.map