"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrderTransactionStep = exports.addOrderTransactionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addOrderTransactionStepId = "add-order-transaction";
/**
 * This step creates order transactions.
 */
exports.addOrderTransactionStep = (0, workflows_sdk_1.createStep)(exports.addOrderTransactionStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const trxsData = Array.isArray(data) ? data : [data];
    if (!trxsData.length) {
        return new workflows_sdk_1.StepResponse(null);
    }
    const existingQuery = [];
    for (const trx of trxsData) {
        existingQuery.push({
            order_id: trx.order_id,
            reference: trx.reference,
            reference_id: trx.reference_id,
        });
    }
    const existing = await service.listOrderTransactions({
        $or: existingQuery,
    }, {
        select: ["order_id", "reference", "reference_id"],
    });
    const existingSet = new Set(existing.map((trx) => `${trx.order_id}-${trx.reference}-${trx.reference_id}`));
    const selectedData = [];
    for (const trx of trxsData) {
        if (!existingSet.has(`${trx.order_id}-${trx.reference}-${trx.reference_id}`)) {
            selectedData.push(trx);
        }
    }
    if (!selectedData.length) {
        return new workflows_sdk_1.StepResponse(null);
    }
    const created = await service.addOrderTransactions(selectedData);
    return new workflows_sdk_1.StepResponse((Array.isArray(data)
        ? created
        : created[0]), created.map((c) => c.id));
}, async (id, { container }) => {
    if (!id?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderTransactions(id);
});
//# sourceMappingURL=add-order-transaction.js.map