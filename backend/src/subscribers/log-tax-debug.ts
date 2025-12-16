import { SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

export default async function logTaxDebugSubscriber(input: any) {
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
    // Retrieve cart with necessary relations for tax debugging
    // @ts-ignore
    const cart = await cartService.retrieveCart(data.id, {
      relations: [
        "shipping_address",
        "region",
        "items",
        "items.tax_lines",
        "shipping_methods",
        "shipping_methods.tax_lines"
      ],
    })

    const address = cart.shipping_address
    const region = cart.region

    logger.info(`
[TaxDebug] ---------------------------------------------------
[TaxDebug] Event: ${eventName} | Cart: ${cart.id}
[TaxDebug] Region: ${region?.name} (Tax Provider: ${region?.automatic_taxes ? 'Automatic' : 'Manual'})
[TaxDebug] Shipping Address:
  City: ${address?.city || 'N/A'}
  Province/State: ${address?.province || 'N/A'}
  Postal: ${address?.postal_code || 'N/A'}
  Country: ${address?.country_code || 'N/A'}
[TaxDebug] ---------------------------------------------------
[TaxDebug] Tax Summary:
  Item Tax Total: ${cart.item_tax_total}
  Shipping Tax Total: ${cart.shipping_tax_total}
  Total Tax: ${cart.tax_total}
[TaxDebug] ---------------------------------------------------
`)

    if (cart.items && cart.items.length > 0) {
      logger.info(`[TaxDebug] Item Tax Lines:`)
      cart.items.forEach((item: any) => {
        if (item.tax_lines && item.tax_lines.length > 0) {
          item.tax_lines.forEach((tl: any) => {
             logger.info(`  - Item ${item.id}: Code '${tl.code}', Rate ${tl.rate}%, Provider '${tl.provider_id}'`)
          })
        } else {
           logger.info(`  - Item ${item.id}: NO TAX LINES`)
        }
      })
    }

    if (cart.shipping_methods && cart.shipping_methods.length > 0) {
      logger.info(`[TaxDebug] Shipping Method Tax Lines:`)
      cart.shipping_methods.forEach((sm: any) => {
        if (sm.tax_lines && sm.tax_lines.length > 0) {
          sm.tax_lines.forEach((tl: any) => {
             logger.info(`  - Method ${sm.id}: Code '${tl.code}', Rate ${tl.rate}%, Provider '${tl.provider_id}'`)
          })
        } else {
           logger.info(`  - Method ${sm.id}: NO TAX LINES`)
        }
      })
    }
    logger.info(`[TaxDebug] ---------------------------------------------------\n`)

  } catch (error) {
    logger.error(`[TaxDebug] Error retrieving cart details: ${error.message}`, error)
  }
}

export const config: SubscriberConfig = {
  event: [
    "cart.created",
    "cart.updated"
  ],
}
