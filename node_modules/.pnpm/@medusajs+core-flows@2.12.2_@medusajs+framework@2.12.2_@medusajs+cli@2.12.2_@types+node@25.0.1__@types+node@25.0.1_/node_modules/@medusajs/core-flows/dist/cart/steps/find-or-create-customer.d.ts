import type { CustomerDTO } from "@medusajs/framework/types";
/**
 * The details of the customer to find or create.
 */
export interface FindOrCreateCustomerStepInput {
    /**
     * The ID of the customer to find.
     */
    customerId?: string | null;
    /**
     * If the `customerId` isn't specified,
     * find a customer with this email or create a new customer having this email.
     */
    email?: string | null;
}
/**
 * The details of the customer found or created.
 */
export interface FindOrCreateCustomerOutputStepOutput {
    /**
     * The customer found or created, if any.
     */
    customer?: CustomerDTO | null;
    /**
     * The email of the customer found or created, if any.
     */
    email?: string | null;
}
export declare const findOrCreateCustomerStepId = "find-or-create-customer";
/**
 * This step finds or creates a customer based on the provided ID or email. It prioritizes finding the customer by ID, then by email.
 *
 * The step creates a new customer either if:
 *
 * - No customer is found with the provided ID and email;
 * - Or if it found the customer by ID but their email does not match the email in the input.
 *
 * The step returns the details of the customer found or created, along with their email.
 */
export declare const findOrCreateCustomerStep: import("@medusajs/framework/workflows-sdk").StepFunction<FindOrCreateCustomerStepInput, FindOrCreateCustomerOutputStepOutput>;
//# sourceMappingURL=find-or-create-customer.d.ts.map