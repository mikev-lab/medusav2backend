"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acquireLockStep = exports.acquireLockStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const promises_1 = require("timers/promises");
exports.acquireLockStepId = "acquire-lock-step";
/**
 * This step acquires a lock for a given key. Learn more about locks in the [Locking Module](https://docs.medusajs.com/resources/infrastructure-modules/locking)
 * guide.
 *
 * @example
 * const data = acquireLockStep({
 *   "key": "my-lock-key",
 *   "ttl": 60
 * })
 */
exports.acquireLockStep = (0, workflows_sdk_1.createStep)(exports.acquireLockStepId, async (data, { container, parentStepIdempotencyKey }) => {
    const keys = Array.isArray(data.key)
        ? data.key
        : (0, utils_1.isDefined)(data.key)
            ? [data.key]
            : [];
    if (!keys.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const isSubWorkflow = !!parentStepIdempotencyKey;
    if (isSubWorkflow && !data.executeOnSubWorkflow) {
        return workflows_sdk_1.StepResponse.skip();
    }
    const locking = container.resolve(utils_1.Modules.LOCKING);
    const retryInterval = data.retryInterval ?? 0.3;
    const tryUntil = Date.now() + (data.timeout ?? 0) * 1000;
    while (true) {
        try {
            await locking.acquire(data.key, {
                expire: data.ttl,
                ownerId: data.ownerId,
                provider: data.provider,
            });
            break;
        }
        catch (e) {
            if (Date.now() >= tryUntil) {
                throw e;
            }
        }
        await (0, promises_1.setTimeout)(retryInterval * 1000);
    }
    return new workflows_sdk_1.StepResponse(void 0, {
        keys,
        ownerId: data.ownerId,
        provider: data.provider,
    });
}, async (data, { container }) => {
    if (!data?.keys?.length) {
        return;
    }
    const locking = container.resolve(utils_1.Modules.LOCKING);
    await locking.release(data.keys, {
        ownerId: data.ownerId,
        provider: data.provider,
    });
    return new workflows_sdk_1.StepResponse();
});
//# sourceMappingURL=acquire-lock.js.map