import { BigNumberInput, CartDTO, CartLineItemDTO, CreateCartCreateLineItemDTO, CustomerDTO, OrderWorkflow, ProductVariantDTO, RegionDTO, UpdateLineItemWithSelectorDTO } from "@medusajs/framework/types";
interface GetVariantsAndItemsWithPricesWorkflowInput {
    cart: Partial<CartDTO> & {
        region?: Partial<RegionDTO>;
        region_id?: string;
        customer?: Partial<CustomerDTO>;
        customer_id?: string;
    };
    items?: Partial<CreateCartCreateLineItemDTO | CartLineItemDTO | OrderWorkflow.OrderAddLineItemWorkflowInput["items"][number]>[];
    setPricingContextResult: object;
    variants?: {
        id?: string[];
        fields?: string[];
    };
}
type GetVariantsAndItemsWithPricesWorkflowOutput = {
    variants: (Partial<ProductVariantDTO> & {
        calculated_price: {
            calculated_price: {
                price_list_type: string;
            };
            is_calculated_price_tax_inclusive: boolean;
            original_amount: BigNumberInput;
            calculated_amount: BigNumberInput;
        };
    })[];
    lineItems: UpdateLineItemWithSelectorDTO[];
};
export declare const getVariantsAndItemsWithPricesId = "get-variant-items-with-prices-workflow";
export declare const getVariantsAndItemsWithPrices: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<GetVariantsAndItemsWithPricesWorkflowInput, GetVariantsAndItemsWithPricesWorkflowOutput, []>;
export {};
//# sourceMappingURL=get-variants-and-items-with-prices.d.ts.map