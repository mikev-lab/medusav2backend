import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"
import { fetchShippoRates } from "../../../../utils/shippo-helper"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cart_id } = req.params
  console.log(`[ShippoRates] Request for cart ${cart_id}`)

  const cartService: ICartModuleService = req.scope.resolve(Modules.CART)

  try {
      // 1. Retrieve Cart
      // @ts-ignore
      const cart = await cartService.retrieveCart(cart_id, {
        relations: ["items", "shipping_address"]
      })

      console.log(`[ShippoRates] Cart retrieved. Items: ${cart.items?.length}, Address: ${!!cart.shipping_address}`)

      if (!cart.shipping_address) {
          console.warn(`[ShippoRates] No shipping address for cart ${cart_id}`)
          return res.status(400).json({ message: "Shipping address is required" })
      }

      // 2. Resolve Box Sizes
      let boxSizes: any[] = []
      try {
        // Try resolving by key, then cast
        const boxSizesService = req.scope.resolve("boxSizes") as any
        const [sizes] = await boxSizesService.listAndCountBoxSizes({ take: 100 })
        boxSizes = sizes
        console.log(`[ShippoRates] Resolved ${boxSizes.length} box sizes from DB`)
      } catch (e) {
        console.warn(`[ShippoRates] Failed to resolve boxSizes: ${e.message}. Using default.`)
      }

      // 3. Fetch Rates
      const apiKey = process.env.SHIPPO_API_KEY || ""
      if (!apiKey) console.warn(`[ShippoRates] No SHIPPO_API_KEY found`)

      const rates = await fetchShippoRates(cart.items || [], cart.shipping_address, boxSizes, apiKey)

      console.log(`[ShippoRates] Fetched ${rates.length} rates`)

      return res.json({ rates })

  } catch (error) {
    console.error(`[ShippoRates] Critical Error:`, error)
    res.status(500).json({ message: error.message, stack: error.stack })
  }
}
