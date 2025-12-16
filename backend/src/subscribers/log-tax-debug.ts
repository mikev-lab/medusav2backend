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

    // Fetch store region info
    let region: any = null
    if (cart.region_id) {
        try {
            // @ts-ignore
            const regions = await regionService.listRegions({ id: [cart.region_id] })
            region = regions[0]
        } catch (e) {
            logger.warn(`[TaxDebug] Could not retrieve region ${cart.region_id}: ${e.message}`)
        }
    }

    // DEBUG TAX REGION MATCHING
    let matchedTaxRegion: any = null
    let potentialMatches: any[] = []

    if (address && address.country_code) {
        try {
            // 1. Get all tax regions for this country
            // @ts-ignore
            potentialMatches = await taxModuleService.listTaxRegions({
                country_code: address.country_code
            })

            // 2. Try to find precise match for province
            const provinceToMatch = address.province || ""
            matchedTaxRegion = potentialMatches.find(tr => {
                // Exact match or 'us-' prefix match
                return tr.province_code === provinceToMatch ||
                       tr.province_code === `us-${provinceToMatch.toLowerCase()}` ||
                       tr.province_code === provinceToMatch.toLowerCase()
            })

        } catch (e) {
            logger.warn(`[TaxDebug] Tax Region Lookup Failed: ${e.message}`)
        }
    }

    // Fetch rates if we found a matched tax region
    let taxRates: any[] = []
    if (matchedTaxRegion) {
        try {
             // @ts-ignore
             taxRates = await taxModuleService.listTaxRates({
                 tax_region_id: matchedTaxRegion.id
             })
        } catch (e) {
            logger.warn(`[TaxDebug] Could not list tax rates for tax region ${matchedTaxRegion.id}: ${e.message}`)
        }
    }

    logger.info(`
[TaxDebug] ---------------------------------------------------
[TaxDebug] Event: ${eventName} | Cart: ${cart.id}
[TaxDebug] Region: ${region?.name || cart.region_id} (Automatic Taxes: ${region?.automatic_taxes})
[TaxDebug] Shipping Address:
  City: ${address?.city || 'N/A'}
  Province: '${address?.province}' (Code: ${address?.province_code})
  Country: ${address?.country_code}

[TaxDebug] Tax Region Matching:
  - Country '${address?.country_code}' has ${potentialMatches.length} tax regions defined.
  - Looking for Province: '${address?.province}'
  - MATCH RESULT: ${matchedTaxRegion ? `FOUND (ID: ${matchedTaxRegion.id}, Province: ${matchedTaxRegion.province_code})` : "NOT FOUND"}

[TaxDebug] Tax Rates for Matched Region: ${taxRates.length}
${taxRates.map(tr => `  - Rate: ${tr.name} (${tr.rate}%) Code: ${tr.code}`).join('\n')}

[TaxDebug] Tax Summary:
  Item Tax Total: ${cart.item_tax_total}
  Total Tax: ${cart.tax_total}
[TaxDebug] ---------------------------------------------------
`)

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
