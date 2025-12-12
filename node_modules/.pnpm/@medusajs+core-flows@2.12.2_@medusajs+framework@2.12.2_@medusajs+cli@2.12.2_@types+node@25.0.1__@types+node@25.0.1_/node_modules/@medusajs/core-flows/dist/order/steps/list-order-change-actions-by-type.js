"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrderChangeActionsByTypeStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
/**
 * This step lists order change actions filtered by action type.
 *
 * @since 2.12.0
 */
exports.listOrderChangeActionsByTypeStep = (0, workflows_sdk_1.createStep)("list-order-change-actions-by-type", async function ({ order_change_id, action_type, }, { container }) {
    const service = container.resolve(utils_1.Modules.ORDER);
    const actions = await service.listOrderChangeActions({
        order_change_id,
    }, {
        select: ["id", "action"],
    });
    const filteredActions = actions.filter((action) => action.action === action_type);
    return new workflows_sdk_1.StepResponse(filteredActions.map((action) => action.id));
});
//# sourceMappingURL=list-order-change-actions-by-type.js.map