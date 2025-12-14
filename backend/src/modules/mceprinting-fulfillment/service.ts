import {
  AbstractFulfillmentProviderService,
  MedusaError
} from "@medusajs/framework/utils"
import {
  FulfillmentOption
} from "@medusajs/framework/types"
import shippo from "shippo"

type BoxSize = {
  id: string
  name: string
  length: number
  width: number
  height: number
  weight_limit: number
}

// 1 lb in grams
const TARE_WEIGHT_GRAMS = 453.6
const MAX_BOX_WEIGHT_GRAMS = 20 * 453.6 // 20 lbs -> grams
const EFFECTIVE_MAX_PRODUCT_WEIGHT = MAX_BOX_WEIGHT_GRAMS - TARE_WEIGHT_GRAMS

export default class McePrintingFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "mceprinting-fulfillment"
  protected shippo_: any
  protected container_: any

  constructor(container: any) {
    // AbstractFulfillmentProviderService constructor signature matches (container: Record<string, any>)
    super()
    this.container_ = container

    const apiKey = process.env.SHIPPO_API_KEY || "dummy_key_for_build"
    try {
        // @ts-ignore
        this.shippo_ = shippo(apiKey)
    } catch (e) {
        console.warn("Failed to initialize Shippo client", e)
    }
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    // Ensure we return a valid array of options
    // These IDs will be stored in the shipping option data
    return [
      { id: "shippo-standard", name: "Standard Shipping" },
      { id: "shippo-express", name: "Express Shipping" }
    ]
  }

  async validateFulfillmentData(
    optionData: any,
    data: any,
    context: any
  ): Promise<any> {
    return data
  }

  async validateOption(data: any): Promise<boolean> {
    return true
  }

  async canCalculate(data: any): Promise<boolean> {
    // If we have items, we can calculate.
    // data.items should be present.
    // Return true to allow the option to show up in checkout/admin?
    // In admin creation, data might be minimal.
    return true
  }

  async calculateFulfillmentOptionPrice(
    optionData: any,
    data: any, // Typed as any to avoid missing property errors
    context: any
  ): Promise<{ price: number; is_calculated_price: boolean }> {
    let boxSizes: BoxSize[] = []
    try {
      // In the provider (global container scope), the module key is "boxSizes"
      const boxSizesService = this.container_.resolve("boxSizes")
      // list all
      const [sizes] = await boxSizesService.listAndCountBoxSizes({ take: 100 })
      boxSizes = sizes
    } catch (e) {
      console.warn("Could not load BoxSizes service in fulfillment provider, using defaults if any.")
    }

    // 1. Pack items
    // data.items comes from the Cart Module's calculation context
    const parcels = this.packItems(data.items || [], boxSizes)

    // 2. Address
    const toAddress = {
      name: (data.shipping_address?.first_name || "") + " " + (data.shipping_address?.last_name || ""),
      street1: data.shipping_address?.address_1,
      street2: data.shipping_address?.address_2,
      city: data.shipping_address?.city,
      state: data.shipping_address?.province,
      zip: data.shipping_address?.postal_code,
      country: data.shipping_address?.country_code,
      validate: true
    }

    const fromAddress = {
      name: "Store Owner",
      street1: "123 Store St",
      city: "Store City",
      state: "CA",
      zip: "90210",
      country: "US"
    }

    if (!process.env.SHIPPO_API_KEY) {
        // Fallback for dev/demo without key
        return {
            price: 1500,
            is_calculated_price: true
        }
    }

    // 3. Get Rates from Shippo
    try {
      const shipment = await this.shippo_.shipment.create({
        address_from: fromAddress,
        address_to: toAddress,
        parcels: parcels.map(p => ({
          length: p.length,
          width: p.width,
          height: p.height,
          distance_unit: "cm",
          weight: p.weight_grams + TARE_WEIGHT_GRAMS,
          mass_unit: "g"
        })),
        async: false
      })

      if (shipment.rates && shipment.rates.length > 0) {
        // Sort by amount
        const rates = shipment.rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
        const bestRate = rates[0]

        return {
          price: parseFloat(bestRate.amount) * 100,
          is_calculated_price: true,
        }
      }
    } catch (error) {
      console.error("Shippo Error:", error)
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Failed to calculate shipping rates")
    }

    return {
       price: 2500,
       is_calculated_price: true
    }
  }

  async createFulfillment(
    data: any,
    items: any[],
    order: any,
    fulfillment: any
  ): Promise<any> {
    return {
        shippo_id: "mock_id"
    }
  }

  async cancelFulfillment(fulfillment: any): Promise<any> {
    return {}
  }

  // --- Packing Logic ---

  private packItems(items: any[], boxSizes: BoxSize[]) {
    const parcels: any[] = []

    for (const item of items) {
      const metadata = item.metadata || {}
      const unitWeight = Number(metadata.weight || 0) // Grams
      const quantity = item.quantity

      if (unitWeight <= 0) continue

      let remainingQty = quantity

      while (remainingQty > 0) {
        const maxUnitsByWeight = Math.floor(EFFECTIVE_MAX_PRODUCT_WEIGHT / unitWeight)

        if (maxUnitsByWeight === 0) {
             const qtyToPack = 1
             remainingQty -= qtyToPack
             parcels.push(this.createParcel([ { ...item, quantity: qtyToPack, weight: unitWeight } ], boxSizes))
             continue
        }

        const qtyToPack = Math.min(remainingQty, maxUnitsByWeight)

        remainingQty -= qtyToPack

        const packedItem = { ...item, quantity: qtyToPack, weight: unitWeight * qtyToPack }
        parcels.push(this.createParcel([packedItem], boxSizes))
      }
    }

    return this.optimizeParcels(parcels, boxSizes)
  }

  private createParcel(items: any[], boxSizes: BoxSize[]) {
     const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
     const totalVolume = items.reduce((sum, i) => {
         const m = i.metadata
         return sum + (Number(m.length||0) * Number(m.width||0) * Number(m.height||0) * i.quantity)
     }, 0)

     const sortedBoxes = [...boxSizes].sort((a, b) => (a.length*a.width*a.height) - (b.length*b.width*b.height))

     let selectedBox = sortedBoxes.find(box => {
           const boxVol = box.length * box.width * box.height
           const limit = box.weight_limit ? box.weight_limit * 453.6 : MAX_BOX_WEIGHT_GRAMS

           if (totalWeight + TARE_WEIGHT_GRAMS > limit) return false
           if (totalVolume > boxVol) return false

           return true
       })

     if (!selectedBox) {
         selectedBox = {
             id: "custom",
             name: "Custom Box",
             length: 30,
             width: 20,
             height: 10,
             weight_limit: 20
         }
     }

     return {
         ...selectedBox,
         weight_grams: totalWeight,
         items
     }
  }

  private optimizeParcels(parcels: any[], boxSizes: BoxSize[]) {
      return parcels
  }
}
