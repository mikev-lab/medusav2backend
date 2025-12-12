"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.releaseLockStep = exports.releaseLockStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.releaseLockStepId = "release-lock-step";
/**
 * This step releases a lock for a given key. Learn more about locks in the [Locking Module](https://docs.medusajs.com/resources/infrastructure-modules/locking)
 * guide.
 *
 * @example
 * const data = releaseLockStep({
 *   key: "my-lock-key"
 * })
 */
exports.releaseLockStep = (0, workflows_sdk_1.createStep)(exports.releaseLockStepId, async (data, { container, parentStepIdempotencyKey }) => {
    const keys = Array.isArray(data.key)
        ? data.key
        : (0, utils_1.isDefined)(data.key)
            ? [data.key]
            : [];
    if (!keys.length) {
        return new workflows_sdk_1.StepResponse(true);
    }
    const isSubWorkflow = !!parentStepIdempotencyKey;
    if (isSubWorkflow && !data.executeOnSubWorkflow) {
        return workflows_sdk_1.StepResponse.skip();
    }
    const ownerId = data.ownerId;
    const locking = container.resolve(utils_1.Modules.LOCKING);
    const released = await locking.release(keys, {
        ownerId,
        provider: data.provider,
    });
    return new workflows_sdk_1.StepResponse(released);
});
//# sourceMappingURL=release-lock.js.map