/**
 * The keys to be locked
 */
export interface AcquireLockStepInput {
    /**
     * The keys to be locked
     */
    key: string | string[];
    /**
     * The maximum time (in seconds) to wait for acquiring the lock. If the lock cannot be acquired within this time, an error is thrown.
     *
     * @defaultValue 0
     */
    timeout?: number;
    /**
     * The time (in seconds) to wait between each retry to acquire the lock.
     *
     * @defaultValue 0.3
     */
    retryInterval?: number;
    /**
     * The expiration time (in seconds) for the lock. If the lock is already acquired and the owner is the same,
     * the expiration time is extended by the value passed. If not specified, the lock does not expire.
     */
    ttl?: number;
    /**
     * The owner ID for the lock. If specified, only the owner can release the lock or extend its expiration time.
     */
    ownerId?: string;
    /**
     * The provider name to use for locking. If no provider is passed, the default provider
     * (in-memory or the provider configured in medusa-config.ts) will be used.
     */
    provider?: string;
    executeOnSubWorkflow?: boolean;
}
export declare const acquireLockStepId = "acquire-lock-step";
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
export declare const acquireLockStep: import("@medusajs/framework/workflows-sdk").StepFunction<AcquireLockStepInput, unknown>;
//# sourceMappingURL=acquire-lock.d.ts.map