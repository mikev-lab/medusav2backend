"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOneOrAnyRegionStep = exports.findOneOrAnyRegionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
async function fetchRegionById(regionId, container) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "region",
        filters: { id: regionId },
        fields: ["*", "countries.*"],
    }, {
        cache: { enable: true },
    });
    return data?.[0];
}
async function fetchDefaultStore(container) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "store",
        fields: ["*"],
    }, {
        cache: { enable: true },
    });
    return data?.[0];
}
async function fetchDefaultRegion(defaultRegionId, container) {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "region",
        filters: { id: defaultRegionId },
        fields: ["*", "countries.*"],
    }, { cache: { enable: true } });
    return data?.[0];
}
exports.findOneOrAnyRegionStepId = "find-one-or-any-region";
/**
 * This step retrieves a region either by the provided ID or the first region in the first store.
 */
exports.findOneOrAnyRegionStep = (0, workflows_sdk_1.createStep)(exports.findOneOrAnyRegionStepId, async (data, { container }) => {
    if (data.regionId) {
        try {
            const region = await fetchRegionById(data.regionId, container);
            return new workflows_sdk_1.StepResponse(region);
        }
        catch (error) {
            return new workflows_sdk_1.StepResponse(null);
        }
    }
    const store = await fetchDefaultStore(container);
    if (!store) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Store not found");
    }
    const region = await fetchDefaultRegion(store.default_region_id, container);
    if (!region) {
        return new workflows_sdk_1.StepResponse(null);
    }
    return new workflows_sdk_1.StepResponse(region);
});
//# sourceMappingURL=find-one-or-any-region.js.map