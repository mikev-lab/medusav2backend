"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShippingOptionsForOrderWorkflow = exports.listShippingOptionsForOrderWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
exports.listShippingOptionsForOrderWorkflowId = "list-shipping-options-for-order";
/**
 * This workflow lists the shipping options of an order. It's executed by the
 * [List Shipping Options Store API Route](https://docs.medusajs.com/api/store#orders_getidshippingoptions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around to retrieve the shipping options of an order
 * in your custom flows.
 *
 * @since 2.10.0
 *
 * @example
 * const { result } = await listShippingOptionsForOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * List a order's shipping options.
 *
 */
exports.listShippingOptionsForOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.listShippingOptionsForOrderWorkflowId, (input) => {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        filters: { id: input.order_id },
        fields: [
            "id",
            "sales_channel_id",
            "region_id",
            "shipping_address.city",
            "shipping_address.country_code",
            "shipping_address.province",
            "shipping_address.postal_code",
            "items.*",
            "items.variant.manage_inventory",
            "items.variant.inventory_items.inventory_item_id",
            "items.variant.inventory_items.inventory.requires_shipping",
            "items.variant.inventory_items.inventory.location_levels.*",
        ],
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-order" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    (0, common_1.validatePresenceOfStep)({
        entity: order,
        fields: ["sales_channel_id", "region_id"],
    });
    const scFulfillmentSetQuery = (0, common_1.useQueryGraphStep)({
        entity: "sales_channels",
        filters: { id: order.sales_channel_id },
        fields: [
            "id",
            "stock_locations.fulfillment_sets.id",
            "stock_locations.id",
            "stock_locations.name",
            "stock_locations.address.*",
        ],
        options: {
            cache: {
                enable: true,
            },
        },
    }).config({ name: "sales_channels-fulfillment-query" });
    const scFulfillmentSets = (0, workflows_sdk_1.transform)({ scFulfillmentSetQuery }, ({ scFulfillmentSetQuery }) => scFulfillmentSetQuery.data[0]);
    const { fulfillmentSetIds } = (0, workflows_sdk_1.transform)({ scFulfillmentSets }, ({ scFulfillmentSets }) => {
        const fulfillmentSetIds = new Set();
        scFulfillmentSets.stock_locations.forEach((stockLocation) => {
            stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
                fulfillmentSetIds.add(fulfillmentSet.id);
            });
        });
        return {
            fulfillmentSetIds: Array.from(fulfillmentSetIds),
        };
    });
    const queryVariables = (0, workflows_sdk_1.transform)({ fulfillmentSetIds, order }, ({ fulfillmentSetIds, order }) => {
        return {
            filters: {
                fulfillment_set_id: fulfillmentSetIds,
                address: {
                    country_code: order.shipping_address?.country_code,
                    province_code: order.shipping_address?.province,
                    city: order.shipping_address?.city,
                    postal_expression: order.shipping_address?.postal_code,
                },
            },
        };
    });
    const { data: shippingOptions } = (0, common_1.useQueryGraphStep)({
        entity: "shipping_option",
        filters: queryVariables.filters,
        fields: [
            "id",
            "name",
            "price_type",
            "service_zone_id",
            "shipping_profile_id",
            "provider_id",
            "data",
            "service_zone.fulfillment_set_id",
            "service_zone.fulfillment_set.type",
            "service_zone.fulfillment_set.location.id",
            "service_zone.fulfillment_set.location.name",
            "service_zone.fulfillment_set.location.address.*",
            "type.id",
            "type.label",
            "type.description",
            "type.code",
            "provider.id",
            "provider.is_enabled",
            "rules.attribute",
            "rules.value",
            "rules.operator",
        ],
    }).config({ name: "shipping-options-query" });
    const shippingOptionsWithInventory = (0, workflows_sdk_1.transform)({ shippingOptions, order }, ({ shippingOptions, order }) => shippingOptions.map((shippingOption) => {
        const locationId = shippingOption.service_zone.fulfillment_set.location.id;
        const itemsAtLocationWithoutAvailableQuantity = order.items.filter((item) => {
            if (!item.variant?.manage_inventory) {
                return false;
            }
            return item.variant.inventory_items.some((inventoryItem) => {
                if (!inventoryItem.inventory.requires_shipping) {
                    return false;
                }
                const level = inventoryItem.inventory.location_levels.find((locationLevel) => {
                    return locationLevel.location_id === locationId;
                });
                return !level ? true : level.available_quantity < item.quantity;
            });
        });
        return {
            ...shippingOption,
            insufficient_inventory: itemsAtLocationWithoutAvailableQuantity.length > 0,
        };
    }));
    return new workflows_sdk_1.WorkflowResponse(shippingOptionsWithInventory);
});
//# sourceMappingURL=list-shipping-options-for-order.js.map