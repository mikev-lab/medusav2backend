import type { FulfillmentTypes } from "@medusajs/framework/types";
/**
 * The data to identify and update the shipping option types.
 */
export type UpdateShippingOptionTypesStepInput = {
    /**
     * The filters to select the shipping option types to update.
     */
    selector: FulfillmentTypes.FilterableShippingOptionTypeProps;
    /**
     * The data to update the shipping option types with.
     */
    update: FulfillmentTypes.UpdateShippingOptionTypeDTO;
};
export declare const updateShippingOptionTypesStepId = "update-shipping-option-types";
/**
 * This step updates shipping option types matching the specified filters.
 *
 * @since 2.10.0
 *
 * @example
 * const shippingOptionTypes = updateShippingOptionTypesStep({
 *   selector: {
 *     id: "sotype_123"
 *   },
 *   update: {
 *     label: "Standard"
 *   }
 * })
 */
export declare const updateShippingOptionTypesStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateShippingOptionTypesStepInput, FulfillmentTypes.ShippingOptionTypeDTO[]>;
//# sourceMappingURL=update-shipping-option-types.d.ts.map