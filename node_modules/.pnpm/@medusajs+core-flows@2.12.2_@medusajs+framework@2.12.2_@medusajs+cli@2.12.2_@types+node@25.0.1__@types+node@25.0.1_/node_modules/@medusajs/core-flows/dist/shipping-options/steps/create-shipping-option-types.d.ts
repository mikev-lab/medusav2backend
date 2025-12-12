import type { FulfillmentTypes } from "@medusajs/framework/types";
/**
 * The shipping option types to create.
 */
export type CreateShippingOptionTypesStepInput = FulfillmentTypes.CreateShippingOptionTypeDTO[];
export declare const createShippingOptionTypesStepId = "create-shipping-option-types";
/**
 * This step creates one or more shipping option types.
 *
 * @since 2.10.0
 *
 * @example
 * const shippingOptionTypes = createShippingOptionTypesStep([
 *   {
 *     label: "Standard",
 *     code: "standard",
 *     description: "Ship in 2-3 days."
 *   }
 * ])
 */
export declare const createShippingOptionTypesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateShippingOptionTypesStepInput, FulfillmentTypes.ShippingOptionTypeDTO[]>;
//# sourceMappingURL=create-shipping-option-types.d.ts.map