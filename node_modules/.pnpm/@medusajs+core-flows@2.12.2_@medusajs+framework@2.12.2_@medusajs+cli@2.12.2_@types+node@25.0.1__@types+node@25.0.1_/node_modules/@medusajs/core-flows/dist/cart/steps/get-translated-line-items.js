"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTranslatedLineItemsStep = exports.getTranslatedLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const apply_translations_to_items_1 = require("../utils/apply-translations-to-items");
exports.getTranslatedLineItemsStepId = "get-translated-line-items";
const step = (0, workflows_sdk_1.createStep)(exports.getTranslatedLineItemsStepId, async (data, { container }) => {
    const isTranslationEnabled = utils_1.FeatureFlag.isFeatureEnabled("translation");
    if (!isTranslationEnabled || !data.locale || !data.items?.length) {
        return new workflows_sdk_1.StepResponse(data.items ?? []);
    }
    await (0, utils_1.applyTranslations)({
        localeCode: data.locale,
        objects: data.variants,
        container,
    });
    const translatedItems = (0, apply_translations_to_items_1.applyTranslationsToItems)(data.items, data.variants);
    return new workflows_sdk_1.StepResponse(translatedItems);
});
/**
 * This step translates cart line items based on their associated variant and product IDs.
 * It fetches translations for the product (title, description, subtitle) and variant (title),
 * then applies them to the corresponding line item fields.
 */
const getTranslatedLineItemsStep = (data) => step(data);
exports.getTranslatedLineItemsStep = getTranslatedLineItemsStep;
//# sourceMappingURL=get-translated-line-items.js.map