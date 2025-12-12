"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProductCsvStep = exports.generateProductCsvStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const normalize_for_export_1 = require("../helpers/normalize-for-export");
const utils_2 = require("../utils");
const prodColumnPositions = new Map([
    ["Product Id", 0],
    ["Product Handle", 1],
    ["Product Title", 2],
    ["Product Subtitle", 3],
    ["Product Description", 4],
    ["Product Status", 5],
    ["Product Thumbnail", 6],
    ["Product Weight", 7],
    ["Product Length", 8],
    ["Product Width", 9],
    ["Product Height", 10],
    ["Product HS Code", 11],
    ["Product Origin Country", 12],
    ["Product MID Code", 13],
    ["Product Material", 14],
    ["Product Collection Id", 15],
    ["Product Type Id", 16],
    ["Product Discountable", 17],
    ["Product External Id", 18],
]);
const variantColumnPositions = new Map([
    ["Variant Id", 0],
    ["Variant Title", 1],
    ["Variant Sku", 3],
    ["Variant Upc", 4],
    ["Variant Ean", 5],
    ["Variant Hs Code", 6],
    ["Variant Mid Code", 7],
    ["Variant Manage Inventory", 8],
    ["Variant Allow Backorder", 9],
]);
const comparator = (a, b, columnMap) => {
    if (columnMap.has(a) && columnMap.has(b)) {
        return columnMap.get(a) - columnMap.get(b);
    }
    if (columnMap.has(a)) {
        return -1;
    }
    if (columnMap.has(b)) {
        return 1;
    }
    return a.localeCompare(b);
};
const csvSortFunction = (a, b) => {
    if (a.startsWith("Product") && b.startsWith("Product")) {
        return comparator(a, b, prodColumnPositions);
    }
    if (a.startsWith("Variant") && b.startsWith("Variant")) {
        return comparator(a, b, variantColumnPositions);
    }
    return a.localeCompare(b);
};
exports.generateProductCsvStepId = "generate-product-csv";
/**
 * This step generates a CSV file that exports products. The CSV
 * file is created and stored using the registered [File Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/file).
 *
 * @example
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: ["*", "variants.*", "collection.*", "categories.*"]
 * })
 *
 * // @ts-ignore
 * const data = generateProductCsvStep(products)
 */
exports.generateProductCsvStep = (0, workflows_sdk_1.createStep)(exports.generateProductCsvStepId, async (products, { container }) => {
    const regionService = container.resolve(utils_1.Modules.REGION);
    const regions = await regionService.listRegions({}, { select: ["id", "name", "currency_code"] });
    const normalizedData = (0, normalize_for_export_1.normalizeForExport)(products, { regions });
    const csvContent = (0, utils_2.convertJsonToCsv)(normalizedData, {
        sortHeader: csvSortFunction,
    });
    const fileModule = container.resolve(utils_1.Modules.FILE);
    const filename = `${Date.now()}-product-exports.csv`;
    const file = await fileModule.createFiles({
        filename,
        mimeType: "text/csv",
        content: csvContent,
    });
    return new workflows_sdk_1.StepResponse({ id: file.id, filename }, file.id);
}, async (fileId, { container }) => {
    if (!fileId) {
        return;
    }
    const fileModule = container.resolve(utils_1.Modules.FILE);
    await fileModule.deleteFiles(fileId);
});
//# sourceMappingURL=generate-product-csv.js.map