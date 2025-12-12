/**
 * The CSV file content to parse.
 */
export type NormalizeProductCsvV1StepInput = string;
export declare const normalizeCsvToChunksStepId = "normalize-product-csv-to-chunks";
type Chunk = {
    id: string;
    toCreate: number;
    toUpdate: number;
};
/**
 * This step parses a CSV file holding products to import, returning the chunks
 * to be processed. Each chunk is written to a file using the file provider.
 *
 * @example
 * const data = normalizeCsvToChunksStep("products.csv")
 */
export declare const normalizeCsvToChunksStep: import("@medusajs/framework/workflows-sdk").StepFunction<string, {
    chunks: Chunk[];
    summary: Omit<Chunk, "id">;
}>;
export {};
//# sourceMappingURL=normalize-products-to-chunks.d.ts.map