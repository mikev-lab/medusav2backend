export declare const processImportChunksStepId = "process-import-chunks";
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export declare const processImportChunksStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    chunks: {
        id: string;
    }[];
}, {
    completed: boolean;
}>;
//# sourceMappingURL=process-import-chunks.d.ts.map