import {
  AbstractFulfillmentProviderService,
  MedusaError
} from "@medusajs/framework/utils"
import {
  FulfillmentOption
} from "@medusajs/framework/types"
import { fetchShippoRates } from "../../utils/shippo-helper"

export default class McePrintingFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "mceprinting-fulfillment"
  protected container_: any

  constructor(container: any) {
    super()
    this.container_ = container
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    return [
      { id: "shippo-dynamic", name: "Shippo Dynamic Rate" },
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
    return true
  }

  async calculateFulfillmentOptionPrice(
    optionData: any,
    data: any,
    context: any
  ): Promise<{ price: number; is_calculated_price: boolean }> {

    // Support "forcing" a specific rate via data passed from storefront
    if (data && data.shippo_amount) {
        return {
            price: Number(data.shippo_amount) * 100, // Convert to cents
            is_calculated_price: true
        }
    }

    // Resolve Box Sizes
    let boxSizes: any[] = []
    try {
      const boxSizesService = this.container_.resolve("boxSizes")
      const [sizes] = await boxSizesService.listAndCountBoxSizes({ take: 100 })
      boxSizes = sizes
    } catch (e) {
      // ignore
    }

    // Fetch Rates
    const apiKey = process.env.SHIPPO_API_KEY || ""
    const rates = await fetchShippoRates(data.items || [], data.shipping_address, boxSizes, apiKey)

    if (rates.length > 0) {
        // Default: Cheapest
        const bestRate = rates[0]
        return {
            price: parseFloat(bestRate.amount) * 100,
            is_calculated_price: true
        }
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
}
