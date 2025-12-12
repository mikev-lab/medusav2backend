"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeCartAfterPaymentStep = exports.completeCartAfterPaymentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const complete_cart_1 = require("../../cart/workflows/complete-cart");
exports.completeCartAfterPaymentStepId = "complete-cart-after-payment-step";
/**
 * This step completes a cart after a payment is captured.
 */
exports.completeCartAfterPaymentStep = (0, workflows_sdk_1.createStep)(exports.completeCartAfterPaymentStepId, async (input, { container }) => {
    const workflowEngine = container.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    await workflowEngine.run(complete_cart_1.completeCartWorkflowId, {
        input: {
            id: input.cart_id,
        },
    });
});
//# sourceMappingURL=complete-cart-after-payment.js.map