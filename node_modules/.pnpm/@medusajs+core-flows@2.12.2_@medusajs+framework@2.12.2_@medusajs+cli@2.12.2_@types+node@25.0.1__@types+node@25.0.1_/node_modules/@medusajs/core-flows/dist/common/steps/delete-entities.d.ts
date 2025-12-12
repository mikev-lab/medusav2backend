export interface DeleteEntitiesStepType {
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
     * For example, an ID of the entity to be deleted.
     */
    entityIdentifier?: string;
    /**
     * The data to pass to the invoke method.
     * For example, an array of IDs to delete.
     */
    data: any[];
}
export declare const deleteEntitiesStepId = "delete-entities-step";
/**
 * This step deletes one or more entities using methods in a module's service.
 *
 * @example
 * deleteEntitiesStep({
 *   moduleRegistrationName: Modules.CART,
 *   invokeMethod: "softDeleteCreditLines",
 *   compensateMethod: "restoreCreditLines",
 *   data: input.id,
 * })
 */
export declare const deleteEntitiesStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteEntitiesStepType, undefined>;
//# sourceMappingURL=delete-entities.d.ts.map