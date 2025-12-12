import type { OrderDTO, PromotionDTO } from "@medusajs/framework/types";
interface ThrowIfNotDraftOrderInput {
    order: OrderDTO;
}
export declare function throwIfNotDraftOrder({ order }: ThrowIfNotDraftOrderInput): void;
export declare function throwIfCodesAreMissing(promo_codes: string[], promotions: PromotionDTO[]): void;
export declare function throwIfCodesAreInactive(promo_codes: string[], promotions: PromotionDTO[]): void;
export {};
//# sourceMappingURL=validation.d.ts.map