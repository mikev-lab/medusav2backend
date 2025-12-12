"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPromotionCodesToApply = exports.getPromotionCodesToApplyId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getPromotionCodesToApplyId = "get-promotion-codes-to-apply";
/**
 * This step retrieves the promotion codes to apply on a cart.
 *
 * @example
 * const data = getPromotionCodesToApply(
 *   {
 *     cart: {
 *       items: [
 *         {
 *           adjustments: [{ code: "PROMO10" }]
 *         }
 *       ],
 *       shipping_methods: [
 *         {
 *           adjustments: [{ code: "SHIPFREE" }]
 *         }
 *       ]
 *     },
 *     promo_codes: ["NEWYEAR20"],
 *     action: PromotionActions.ADD
 *   },
 * )
 */
exports.getPromotionCodesToApply = (0, workflows_sdk_1.createStep)(exports.getPromotionCodesToApplyId, async (data, { container }) => {
    const { promo_codes = [], cart, action = utils_1.PromotionActions.ADD } = data;
    const { items = [], shipping_methods = [] } = cart;
    const adjustmentCodes = [];
    items.concat(shipping_methods).forEach((object) => {
        object.adjustments?.forEach((adjustment) => {
            if (adjustment.code) {
                adjustmentCodes.push(adjustment.code);
            }
        });
    });
    const promotionCodesToApply = new Set(adjustmentCodes);
    if (action === utils_1.PromotionActions.REMOVE) {
        promo_codes.forEach((code) => promotionCodesToApply.delete(code));
    }
    if (action === utils_1.PromotionActions.REPLACE) {
        promotionCodesToApply.clear();
    }
    if (action === utils_1.PromotionActions.ADD ||
        action === utils_1.PromotionActions.REPLACE) {
        const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
        const validPromoCodes = new Set(promo_codes.length
            ? (await query.graph({
                entity: "promotion",
                fields: ["id", "code"],
                filters: { code: promo_codes },
            }, {
                cache: {
                    enable: true,
                },
            })).data.map((p) => p.code)
            : []);
        promo_codes.forEach((code) => {
            if (!validPromoCodes.has(code)) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `The promotion code ${code} is invalid`);
            }
            promotionCodesToApply.add(code);
        });
    }
    return new workflows_sdk_1.StepResponse(Array.from(promotionCodesToApply));
});
//# sourceMappingURL=get-promotion-codes-to-apply.js.map