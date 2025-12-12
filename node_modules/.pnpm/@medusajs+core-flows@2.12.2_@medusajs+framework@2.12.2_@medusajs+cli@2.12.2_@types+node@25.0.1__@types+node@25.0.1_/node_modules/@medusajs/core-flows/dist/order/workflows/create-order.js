"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrdersWorkflow = exports.createOrderWorkflow = exports.createOrdersWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const find_one_or_any_region_1 = require("../../cart/steps/find-one-or-any-region");
const find_or_create_customer_1 = require("../../cart/steps/find-or-create-customer");
const find_sales_channel_1 = require("../../cart/steps/find-sales-channel");
const validate_line_item_prices_1 = require("../../cart/steps/validate-line-item-prices");
const prepare_confirm_inventory_input_1 = require("../../cart/utils/prepare-confirm-inventory-input");
const prepare_line_item_data_1 = require("../../cart/utils/prepare-line-item-data");
const schemas_1 = require("../../cart/utils/schemas");
const confirm_variant_inventory_1 = require("../../cart/workflows/confirm-variant-inventory");
const get_variants_and_items_with_prices_1 = require("../../cart/workflows/get-variants-and-items-with-prices");
const common_1 = require("../../common");
const refresh_draft_order_adjustments_1 = require("../../draft-order/workflows/refresh-draft-order-adjustments");
const steps_1 = require("../steps");
const fields_1 = require("../utils/fields");
const update_tax_lines_1 = require("./update-tax-lines");
function prepareLineItems(data) {
    const items = (data.input.items ?? []).map((item) => {
        const variant = data.variants?.find((v) => v.id === item.variant_id);
        const input = {
            item,
            variant: variant,
            unitPrice: item.unit_price,
            isTaxInclusive: item.is_tax_inclusive ??
                variant?.calculated_price?.is_calculated_price_tax_inclusive,
            isCustomPrice: (0, utils_1.isDefined)(item?.unit_price),
            taxLines: item.tax_lines ?? [],
            adjustments: item.adjustments ?? [],
        };
        if (variant && !(0, utils_1.isDefined)(input.unitPrice)) {
            input.unitPrice = variant.calculated_price?.calculated_amount;
        }
        return (0, prepare_line_item_data_1.prepareLineItemData)(input);
    });
    return items;
}
function getOrderInput(data) {
    const shippingAddress = data.input.shipping_address ?? { id: undefined };
    delete shippingAddress.id;
    const billingAddress = data.input.billing_address ?? { id: undefined };
    delete billingAddress.id;
    const data_ = {
        ...data.input,
        shipping_address: (0, utils_1.isPresent)(shippingAddress) ? shippingAddress : undefined,
        billing_address: (0, utils_1.isPresent)(billingAddress) ? billingAddress : undefined,
        currency_code: data.input.currency_code ?? data.region.currency_code,
        region_id: data.region.id,
    };
    if (data.customerData.customer?.id) {
        data_.customer_id = data.customerData.customer.id;
        data_.email = data.input?.email ?? data.customerData.customer.email;
    }
    if (data.salesChannel?.id) {
        data_.sales_channel_id = data.salesChannel.id;
    }
    return data_;
}
exports.createOrdersWorkflowId = "create-orders";
/**
 * This workflow creates an order. It's used by the [Create Draft Order Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftorders), but
 * you can also use it to create any order.
 *
 * This workflow has a hook that allows you to perform custom actions on the created order. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the order.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around creating an order. For example,
 * you can create a workflow that imports orders from an external system, then uses this workflow to create the orders in Medusa.
 *
 * @example
 * const { result } = await createOrderWorkflow(container)
 * .run({
 *   input: {
 *     region_id: "reg_123",
 *     items: [
 *       {
 *         variant_id: "variant_123",
 *         quantity: 1,
 *         title: "Shirt",
 *         unit_price: 10
 *       }
 *     ],
 *     sales_channel_id: "sc_123",
 *     status: "pending",
 *     shipping_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "123 Main St",
 *       city: "Los Angeles",
 *       country_code: "us",
 *       postal_code: "90001"
 *     },
 *     additional_data: {
 *       sync_oms: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create an order.
 *
 * @property hooks.orderCreated - This hook is executed after the order is created. You can consume this hook to perform custom actions on the created order.
 * @property hooks.setPricingContext - This hook is executed after the order is retrieved and before the line items are created. You can consume this hook to return any custom context useful for the prices retrieval of the variants to be added to the order.
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
 * import { createOrderWorkflow } from "@medusajs/medusa/core-flows";
 * import { StepResponse } from "@medusajs/workflows-sdk";
 *
 * createOrderWorkflow.hooks.setPricingContext((
 *   { variantIds, region, customerData, additional_data }, { container }
 * ) => {
 *   return new StepResponse({
 *     location_id: "sloc_123", // Special price for in-store purchases
 *   });
 * });
 * ```
 *
 * The variants' prices will now be retrieved using the context you return.
 *
 * :::note
 *
 * Learn more about prices calculation context in the [Prices Calculation](https://docs.medusajs.com/resources/commerce-modules/pricing/price-calculation) documentation.
 *
 * :::
 */
exports.createOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrdersWorkflowId, (input) => {
    const variantIds = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return (data.input.items ?? [])
            .map((item) => item.variant_id)
            .filter(Boolean);
    });
    const [salesChannel, region, customerData] = (0, workflows_sdk_1.parallelize)((0, find_sales_channel_1.findSalesChannelStep)({
        salesChannelId: input.sales_channel_id,
    }), (0, find_one_or_any_region_1.findOneOrAnyRegionStep)({
        regionId: input.region_id,
    }), (0, find_or_create_customer_1.findOrCreateCustomerStep)({
        customerId: input.customer_id,
        email: input.email,
    }));
    const setPricingContext = (0, workflows_sdk_1.createHook)("setPricingContext", {
        variantIds,
        region,
        customerData,
        additional_data: input.additional_data,
    }, {
        resultValidator: schemas_1.pricingContextResult,
    });
    const setPricingContextResult = setPricingContext.getResult();
    /**
     * Only fetch variants with calculated prices if needed, otherwise only fetch variants without
     * calculated prices.
     *
     * We need a variant calculated price when the item is either missing a unit price or is not
     * tax inclusive.
     */
    const { variantIdsForPriceCalculation, variantIdsWithoutCalculatedPrice } = (0, workflows_sdk_1.transform)({ input }, (data) => {
        const variantIdsForPriceCalculation = [];
        const variantIdsWithoutCalculatedPrice = [];
        data.input.items?.forEach((item) => {
            if (item.variant_id &&
                (!(0, utils_1.isDefined)(item.unit_price) || !(0, utils_1.isDefined)(item.is_tax_inclusive))) {
                variantIdsForPriceCalculation.push(item.variant_id);
            }
            else {
                variantIdsWithoutCalculatedPrice.push(item.variant_id);
            }
        });
        return {
            variantIdsForPriceCalculation,
            variantIdsWithoutCalculatedPrice,
        };
    });
    /**
     * Fetch all variant for which we don't need to calculate the price.
     */
    const { data: variantsWithoutCalculatedPrice } = (0, common_1.useQueryGraphStep)({
        entity: "variants",
        fields: (0, utils_1.deduplicate)([
            ...fields_1.productVariantsFields,
            ...prepare_confirm_inventory_input_1.requiredVariantFieldsForInventoryConfirmation,
        ]),
        filters: {
            id: variantIdsWithoutCalculatedPrice,
        },
        options: {
            cache: {
                enable: true,
            },
        },
    }).config({ name: "query-variants-without-calculated-price" });
    /**
     * Fetch all variants for which we need to calculate the price.
     */
    const variantsAndItemsWithCalculatedPrice = (0, workflows_sdk_1.when)("fetch-variants-with-calculated-price", { variantIdsForPriceCalculation }, ({ variantIdsForPriceCalculation }) => {
        return !!variantIdsForPriceCalculation.length;
    }).then(() => {
        return get_variants_and_items_with_prices_1.getVariantsAndItemsWithPrices.runAsStep({
            input: {
                cart: {
                    currency_code: input.currency_code,
                    region,
                    region_id: region.id,
                    customer_id: customerData.customer?.id,
                },
                items: input.items,
                setPricingContextResult: setPricingContextResult,
                variants: {
                    id: variantIdsForPriceCalculation,
                    fields: (0, utils_1.deduplicate)([
                        ...fields_1.productVariantsFields,
                        ...prepare_confirm_inventory_input_1.requiredVariantFieldsForInventoryConfirmation,
                    ]),
                },
            },
        });
    });
    /**
     * Aggregate all variants without calculated price and all variants with calculated price.
     */
    const variants = (0, workflows_sdk_1.transform)({
        variantsWithoutCalculatedPrice,
        variantsAndItemsWithCalculatedPrice,
    }, (data) => {
        return [
            ...data.variantsWithoutCalculatedPrice,
            ...(data.variantsAndItemsWithCalculatedPrice?.variants ?? []),
        ];
    });
    confirm_variant_inventory_1.confirmVariantInventoryWorkflow.runAsStep({
        input: {
            sales_channel_id: salesChannel.id,
            variants,
            items: input.items,
        },
    });
    const orderInput = (0, workflows_sdk_1.transform)({ input, region, customerData, salesChannel }, getOrderInput);
    const lineItems = (0, workflows_sdk_1.transform)({
        input,
        variants,
        variantsWithoutCalculatedPrice,
        variantsAndItemsWithCalculatedPrice,
    }, (data) => {
        const itemsForVariantWithCalculatedPrice = data.variantsAndItemsWithCalculatedPrice?.lineItems?.map((i) => i.data) ?? [];
        // all other items that are not in the itemsForVariantWithCalculatedPrice
        const itemsForVariantWithoutCalculatedPrice = data.input.items?.filter((item) => {
            return !data.variantsAndItemsWithCalculatedPrice?.lineItems?.find((i) => i.data.id === item.id ||
                i.data.variant_id === item.variant_id ||
                (i.data.title === item.title &&
                    i.data.subtitle === item.subtitle &&
                    i.data.thumbnail === item.thumbnail));
        });
        if (!itemsForVariantWithoutCalculatedPrice?.length) {
            return itemsForVariantWithCalculatedPrice;
        }
        const preparedItemsForVariantWithoutCalculatedPrice = prepareLineItems({
            input: {
                items: itemsForVariantWithoutCalculatedPrice,
            },
            variants: data.variantsWithoutCalculatedPrice,
        });
        return preparedItemsForVariantWithoutCalculatedPrice.concat(...itemsForVariantWithCalculatedPrice);
    });
    (0, validate_line_item_prices_1.validateLineItemPricesStep)({ items: lineItems });
    const orderToCreate = (0, workflows_sdk_1.transform)({ lineItems, orderInput }, (data) => {
        return {
            ...data.orderInput,
            items: data.lineItems,
        };
    });
    const orders = (0, steps_1.createOrdersStep)([orderToCreate]);
    const order = (0, workflows_sdk_1.transform)({ orders }, (data) => data.orders?.[0]);
    const appliedPromoCodes = (0, workflows_sdk_1.transform)(input, (order) => order.promo_codes ?? []);
    /**
     * TODO: Currently need the refresh because when the order module creates the order, even though
     * the totals are calculated, the order is being queried and without the totals. There is some
     * point of discussion for improvements here down the line.
     */
    const { data: freshOrder } = (0, common_1.useQueryGraphStep)({
        entity: "orders",
        fields: [
            "shipping_address.*",
            "billing_address.*",
            "summary.*",
            "items.*",
            "credit_lines.*",
            "items.tax_lines.*",
            "items.adjustments.*",
            "shipping_methods.*",
            "shipping_methods.tax_lines.*",
            "shipping_methods.adjustments.*",
            "transactions.*",
            "currency_code",
            "items.tax_lines.*",
            "items.adjustments.*",
            "shipping_methods.tax_lines.*",
            "shipping_methods.adjustments.*",
            "total",
            "id",
        ],
        filters: {
            id: order.id,
        },
        options: {
            isList: false,
        },
    }).config({ name: "query-fresh-order" });
    (0, workflows_sdk_1.parallelize)(update_tax_lines_1.updateOrderTaxLinesWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    }), refresh_draft_order_adjustments_1.refreshDraftOrderAdjustmentsWorkflow.runAsStep({
        input: {
            order: freshOrder,
            promo_codes: appliedPromoCodes,
            action: utils_1.PromotionActions.REPLACE,
        },
    }));
    const orderCreated = (0, workflows_sdk_1.createHook)("orderCreated", {
        order: freshOrder,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(order, {
        hooks: [orderCreated, setPricingContext],
    });
});
/**
 * @deprecated Instead use the singular name `createOrderWorkflow`.
 */
exports.createOrdersWorkflow = exports.createOrderWorkflow;
//# sourceMappingURL=create-order.js.map