export interface CreateEntitiesStepType {
    /**
     * The regitration name of the module that contains the method to be invoked.
     */
    moduleRegistrationName: string;
    /**
     * The method to be invoked.
     */
    invokeMethod: string;
    /**
     * The method to be invoked in case of compensation (when an error occurs).
     */
    compensateMethod: string;
    /**
     * A string to pass to the compensate method.
     */
    entityIdentifier?: string;
    /**
     * The data to pass to the invoke method.
     * For example, an array of objects to create.
     */
    data: any[];
}
export declare const createEntitiesStepId = "create-entities-step";
/**
 * This step creates one or more entities using methods in a module's service.
 *
 * @example
 * createEntitiesStep({
 *   moduleRegistrationName: Modules.CART,
 *   invokeMethod: "createCreditLines",
 *   compensateMethod: "deleteCreditLines",
 *   data: {
 *     cart_id: "cart_123",
 *     amount: 10,
 *     reference: "payment",
 *     reference_id: "payment_123",
 *     metadata: {
 *       key: "value",
 *     },
 *   },
 * })
 */
export declare const createEntitiesStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateEntitiesStepType, any[]>;
//# sourceMappingURL=create-entities.d.ts.map