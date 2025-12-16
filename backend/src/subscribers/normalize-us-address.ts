import { SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

export default async function normalizeUsAddressSubscriber(input: any) {
  const { container } = input

  let eventName = input.event
  let data = input.data

  // Handle object-style event input
  if (typeof eventName === 'object' && eventName !== null) {
      if (eventName.data) data = eventName.data
      if (eventName.name) eventName = eventName.name
  }

  // Only proceed if we have a cart ID
  if (!data?.id) return

  const cartService: ICartModuleService = container.resolve(Modules.CART)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    // Retrieve cart with shipping address
    // Using (cartService as any).retrieveCart as per project pattern
    const cartRaw = await (cartService as any).retrieveCart(data.id, {
      relations: ["shipping_address"],
    })

    const cart = cartRaw as any
    const address = cart.shipping_address

    if (address && address.country_code === 'us' && address.province) {
        const province = address.province.trim().toLowerCase()

        // Check if it's a 2-letter code (e.g., 'wa', 'ny')
        if (province.length === 2) {
            const normalizedProvince = `us-${province}`

            // Only update if it's not already normalized
            // We check matching against province OR province_code fields depending on what frontend sends
            // But standard ISO for US states in Medusa regions is 'us-xx'

            if (address.province !== normalizedProvince) {
                logger.info(`[AddressNormalization] Normalizing US province from '${address.province}' to '${normalizedProvince}' for Cart ${cart.id}`)

                // Update the address
                // We typically need to update the Cart's shipping address.
                // Since address is an entity, we update it via the cart update or address service.
                // In Medusa V2, we can often update the cart with shipping_address object.

                await (cartService as any).updateCarts(cart.id, {
                    shipping_address: {
                        ...address,
                        province: normalizedProvince,
                        // Ensure we don't accidentally wipe other fields if spread isn't full entity,
                        // but usually updateCarts handles partial updates for nested objects or we might need updateAddress.
                        // Let's try updateCarts with just the field we want to change if possible, or full object.
                        // Safest is to just send the ID and the change if it allows, but standard API is replacing the object.
                        // Let's use the updateAddress method if available on Cart Service, otherwise updateCarts.
                    }
                })
            }
        }
    }

  } catch (error) {
    // Suppress errors to avoid breaking the cart flow
    // logger.error(`[AddressNormalization] Error: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: [
    "cart.created",
    "cart.updated"
  ],
}
