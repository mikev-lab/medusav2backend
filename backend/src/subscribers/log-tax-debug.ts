import { SubscriberConfig } from "@medusajs/framework"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ICartModuleService, IRegionModuleService, ITaxModuleService } from "@medusajs/framework/types"

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
  const regionService: IRegionModuleService = container.resolve(Modules.REGION)
  const taxModuleService: ITaxModuleService = container.resolve(Modules.TAX)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    // Retrieve cart
    const cartRaw = await (cartService as any).retrieveCart(data.id, {
      relations: [
        "shipping_address",
        "items",
        "items.tax_lines",
        "shipping_methods",
        "shipping_methods.tax_lines"
      ],
    })

    const cart = cartRaw as any
    const address = cart.shipping_address

    // Fetch region
    let region: any = null
    if (cart.region_id) {
        try {
            // @ts-ignore
            const regions = await regionService.listRegions(
                { id: [cart.region_id] }
            )
            region = regions[0]
        } catch (e) {
            logger.warn(`[TaxDebug] Could not retrieve region ${cart.region_id}: ${e.message}`)
        }
    }

    // Fetch Tax Rates specifically for this region
    let taxRates: any[] = []
    if (region) {
        try {
             // Try to list tax rates for this region using the Tax Module
             // Note: In Medusa V2, tax rates are often queried by tax_region_id which might map to region_id or be separate.
             // We'll try to list all rates first to see what's there.
             // @ts-ignore
             taxRates = await taxModuleService.listTaxRates({
                 tax_region_id: region.id
             })
        } catch (e) {
            logger.warn(`[TaxDebug] Could not list tax rates for region ${region.id}: ${e.message}`)
        }
    }

    logger.info(`
[TaxDebug] ---------------------------------------------------
[TaxDebug] Event: ${eventName} | Cart: ${cart.id}
[TaxDebug] Region: ${region?.name || cart.region_id}
[TaxDebug] Tax Settings: Automatic=${region?.automatic_taxes}, GiftCardsTaxable=${region?.gift_cards_taxable}
[TaxDebug] Tax Rates Found for Region: ${taxRates.length}
`)

    if (taxRates.length > 0) {
         taxRates.forEach(tr => {
             logger.info(`  - Rate: ${tr.name} | ${tr.rate}% | Code: ${tr.code} | Rules: ${JSON.stringify(tr.rules || [])}`)
         })
    } else {
        logger.info(`  - No Tax Rates found linked to Region ID ${region?.id}`)
    }

    logger.info(`
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

    // ... existing item logging ...
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
