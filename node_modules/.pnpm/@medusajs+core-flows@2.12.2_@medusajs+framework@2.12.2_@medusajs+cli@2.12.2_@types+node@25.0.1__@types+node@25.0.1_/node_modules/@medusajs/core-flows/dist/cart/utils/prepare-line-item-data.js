"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareLineItemData = prepareLineItemData;
exports.prepareTaxLinesData = prepareTaxLinesData;
exports.prepareAdjustmentsData = prepareAdjustmentsData;
const utils_1 = require("@medusajs/framework/utils");
function prepareLineItemData(data) {
    const { item, variant, cartId, taxLines, adjustments, isCustomPrice, unitPrice, isTaxInclusive, } = data;
    if (variant && !variant.product) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Variant does not have a product");
    }
    if (item && utils_1.MathBN.lte(item.quantity, 0)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Item quantity must be greater than 0");
    }
    let compareAtUnitPrice = item?.compare_at_unit_price;
    const isSalePrice = variant?.calculated_price?.calculated_price?.price_list_type ===
        utils_1.PriceListType.SALE;
    if (!(0, utils_1.isPresent)(compareAtUnitPrice) &&
        isSalePrice &&
        !utils_1.MathBN.eq(variant.calculated_price?.original_amount, variant.calculated_price?.calculated_amount)) {
        compareAtUnitPrice = variant.calculated_price.original_amount;
    }
    const hasShippingProfile = (0, utils_1.isDefined)(variant?.product?.shipping_profile?.id);
    const someInventoryRequiresShipping = !!variant?.inventory_items?.some((inventoryItem) => !!inventoryItem.inventory.requires_shipping);
    // Note: If any of the items require shipping or product has a shipping profile set,
    // we enable fulfillment unless explicitly set to not require shipping by the item in the request
    const requiresShipping = (0, utils_1.isDefined)(item?.requires_shipping)
        ? item.requires_shipping
        : hasShippingProfile || someInventoryRequiresShipping;
    let lineItem = {
        quantity: item?.quantity,
        title: item?.title ?? variant?.product?.title,
        subtitle: item?.subtitle ?? variant?.title,
        thumbnail: item?.thumbnail ?? variant?.thumbnail ?? variant?.product?.thumbnail,
        product_id: variant?.product?.id ?? item?.product_id,
        product_title: item?.product_title ?? variant?.product?.title,
        product_description: item?.product_description ?? variant?.product?.description,
        product_subtitle: item?.product_subtitle ?? variant?.product?.subtitle,
        product_type: item?.product_type ?? variant?.product?.type?.value ?? null,
        product_type_id: item?.product_type_id ?? variant?.product?.type?.id ?? null,
        product_collection: item?.product_collection ?? variant?.product?.collection?.title ?? null,
        product_handle: item?.product_handle ?? variant?.product?.handle,
        variant_id: variant?.id,
        variant_sku: item?.variant_sku ?? variant?.sku,
        variant_barcode: item?.variant_barcode ?? variant?.barcode,
        variant_title: item?.variant_title ?? variant?.title,
        variant_option_values: item?.variant_option_values,
        is_discountable: item?.is_discountable ?? variant?.product?.discountable,
        is_giftcard: variant?.product?.is_giftcard ?? false,
        requires_shipping: requiresShipping,
        unit_price: unitPrice,
        compare_at_unit_price: compareAtUnitPrice,
        is_tax_inclusive: !!isTaxInclusive,
        metadata: item?.metadata ?? {},
    };
    if (isCustomPrice) {
        lineItem.is_custom_price = !!isCustomPrice;
    }
    if (taxLines) {
        lineItem.tax_lines = prepareTaxLinesData(taxLines);
    }
    if (adjustments) {
        lineItem.adjustments = prepareAdjustmentsData(adjustments);
    }
    if (cartId) {
        lineItem.cart_id = cartId;
    }
    return lineItem;
}
function prepareTaxLinesData(data) {
    return data.map((d) => ({
        description: d.description,
        tax_rate_id: d.tax_rate_id,
        code: d.code,
        rate: d.rate,
        provider_id: d.provider_id,
    }));
}
function prepareAdjustmentsData(data) {
    return data.map((d) => ({
        code: d.code,
        amount: d.amount,
        description: d.description,
        promotion_id: d.promotion_id,
        provider_id: d.provider_id,
        is_tax_inclusive: d.is_tax_inclusive,
    }));
}
//# sourceMappingURL=prepare-line-item-data.js.map