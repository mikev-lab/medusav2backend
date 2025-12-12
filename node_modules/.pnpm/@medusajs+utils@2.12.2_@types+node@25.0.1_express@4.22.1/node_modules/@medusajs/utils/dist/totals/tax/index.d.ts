import { BigNumberInput, TaxLineDTO } from "@medusajs/types";
export declare function calculateTaxTotal({ isTaxInclusive, taxLines, taxableAmount, setTotalField, }: {
    isTaxInclusive?: boolean;
    taxLines: Pick<TaxLineDTO, "rate">[];
    taxableAmount: BigNumberInput;
    setTotalField?: string;
}): globalThis.BigNumber;
export declare function calculateAmountsWithTax({ taxLines, amount, includesTax, }: {
    taxLines: Pick<TaxLineDTO, "rate">[];
    amount: number;
    includesTax?: boolean;
}): {
    priceWithTax: number;
    priceWithoutTax: number;
};
//# sourceMappingURL=index.d.ts.map