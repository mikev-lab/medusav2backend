/**
 * The locked keys to be released
 */
export interface ReleaseLockStepInput {
    /**
     * The keys to be released
     */
    key: string | string[];
    /**
     * The ID of the lock's owner. The lock can be released either if it doesn't have an owner,
     * or if its owner ID matches the one passed in this property.
     */
    ownerId?: string;
    /**
     * The provider name to use for locking. If no provider is passed,
     * the default provider (in-memory or the provider configured in medusa-config.ts) will be used.
     */
    provider?: string;
    executeOnSubWorkflow?: boolean;
}
export declare const releaseLockStepId = "release-lock-step";
/**
 * This step releases a lock for a given key. Learn more about locks in the [Locking Module](https://docs.medusajs.com/resources/infrastructure-modules/locking)
 * guide.
 *
 * @example
 * const data = releaseLockStep({
 *   key: "my-lock-key"
 * })
 */
export declare const releaseLockStep: import("@medusajs/framework/workflows-sdk").StepFunction<ReleaseLockStepInput, unknown>;
//# sourceMappingURL=release-lock.d.ts.map