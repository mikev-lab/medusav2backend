"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateCustomerStep = exports.findOrCreateCustomerStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
async function fetchCustomerById(customerId, container) {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    return await (0, utils_1.useCache)(async () => service.retrieveCustomer(customerId), {
        container,
        key: ["find-or-create-customer-by-id", customerId],
    });
}
async function fetchCustomersByEmail(email, container, hasAccount) {
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const filters = hasAccount !== undefined ? { email, has_account: hasAccount } : { email };
    return await (0, utils_1.useCache)(async () => service.listCustomers(filters), {
        container,
        key: ["find-or-create-customer-by-email", filters],
    });
}
exports.findOrCreateCustomerStepId = "find-or-create-customer";
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
exports.findOrCreateCustomerStep = (0, workflows_sdk_1.createStep)(exports.findOrCreateCustomerStepId, async (data, { container }) => {
    if (!(0, utils_1.isDefined)(data.customerId) && !(0, utils_1.isDefined)(data.email)) {
        return new workflows_sdk_1.StepResponse({
            customer: undefined,
            email: undefined,
        }, {
            customerWasCreated: false,
        });
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const customerData = {
        customer: null,
        email: null,
    };
    let originalCustomer = null;
    let customerWasCreated = false;
    if (data.customerId) {
        originalCustomer = await fetchCustomerById(data.customerId, container);
        customerData.customer = originalCustomer;
        customerData.email = originalCustomer.email;
    }
    if (data.email) {
        const validatedEmail = (data.email && (0, utils_1.validateEmail)(data.email));
        let [customer] = originalCustomer
            ? [originalCustomer]
            : await fetchCustomersByEmail(validatedEmail, container);
        // if NOT a guest customer, return it
        if (customer?.has_account) {
            customerData.customer = customer;
            customerData.email = customer.email;
            return new workflows_sdk_1.StepResponse(customerData, {
                customerWasCreated,
            });
        }
        if (customer && customer.email !== validatedEmail) {
            ;
            [customer] = await fetchCustomersByEmail(validatedEmail, container, false);
        }
        if (!customer) {
            customer = await service.createCustomers({ email: validatedEmail });
            customerWasCreated = true;
        }
        originalCustomer = customer;
        customerData.customer = customer;
        customerData.email = customer.email;
    }
    return new workflows_sdk_1.StepResponse(customerData, {
        customer: originalCustomer,
        customerWasCreated,
    });
}, async (compData, { container }) => {
    const { customer, customerWasCreated } = compData;
    if (!customerWasCreated || !customer?.id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.deleteCustomers(customer.id);
});
//# sourceMappingURL=find-or-create-customer.js.map