"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImportChunksStep = exports.processImportChunksStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const batch_products_1 = require("../workflows/batch-products");
exports.processImportChunksStepId = "process-import-chunks";
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
exports.processImportChunksStep = (0, workflows_sdk_1.createStep)({
    name: exports.processImportChunksStepId,
    async: true,
}, async (input, { container }) => {
    const file = container.resolve(utils_1.Modules.FILE);
    try {
        for (let chunk of input.chunks) {
            const contents = await file.getAsBuffer(chunk.id);
            let products = JSON.parse(contents.toString("utf-8"));
            await (0, batch_products_1.batchProductsWorkflow)(container).run({
                input: products,
            });
            products = undefined;
        }
    }
    finally {
        /**
         * Delete chunks regardless of the import status
         */
        await file.deleteFiles(input.chunks.map((chunk) => chunk.id));
    }
    return new workflows_sdk_1.StepResponse({ completed: true });
});
//# sourceMappingURL=process-import-chunks.js.map