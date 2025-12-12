"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSalesChannelStep = exports.findSalesChannelStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
async function fetchSalesChannel(salesChannelId, container) {
    const salesChannelService = container.resolve(utils_1.Modules.SALES_CHANNEL);
    return await (0, utils_1.useCache)(async () => salesChannelService.retrieveSalesChannel(salesChannelId), {
        container,
        key: ["find-sales-channel", salesChannelId],
    });
}
async function fetchStore(container) {
    const storeModule = container.resolve(utils_1.Modules.STORE);
    return await (0, utils_1.useCache)(async () => storeModule.listStores({}, { select: ["id", "default_sales_channel_id"] }), { key: "find-sales-channel-default-store", container });
}
exports.findSalesChannelStepId = "find-sales-channel";
/**
 * This step either retrieves a sales channel either using the ID provided as an input, or, if no ID
 * is provided, the default sales channel of the first store.
 */
exports.findSalesChannelStep = (0, workflows_sdk_1.createStep)(exports.findSalesChannelStepId, async (data, { container }) => {
    let salesChannel;
    if (data.salesChannelId) {
        salesChannel = await fetchSalesChannel(data.salesChannelId, container);
    }
    else if (!(0, utils_1.isDefined)(data.salesChannelId)) {
        const [store] = await fetchStore(container);
        if (store?.default_sales_channel_id) {
            salesChannel = await fetchSalesChannel(store.default_sales_channel_id, container);
        }
    }
    if (!salesChannel) {
        return new workflows_sdk_1.StepResponse(null);
    }
    if (salesChannel?.is_disabled) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Unable to assign cart to disabled Sales Channel: ${salesChannel.name}`);
    }
    return new workflows_sdk_1.StepResponse(salesChannel);
});
//# sourceMappingURL=find-sales-channel.js.map