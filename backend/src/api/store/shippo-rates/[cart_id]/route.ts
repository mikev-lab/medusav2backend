import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"
import { fetchShippoRates } from "../../../utils/shippo-helper"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { cart_id } = req.params
  const cartService: ICartModuleService = req.scope.resolve(Modules.CART)

  try {
      // 1. Retrieve Cart
      const cart = await cartService.retrieveCart(cart_id, {
        relations: ["items", "shipping_address"]
      })

      if (!cart.shipping_address) {
          return res.status(400).json({ message: "Shipping address is required" })
      }

      // 2. Resolve Box Sizes
      let boxSizes: any[] = []
      try {
        const boxSizesService = req.scope.resolve("boxSizes") as any
        const [sizes] = await boxSizesService.listAndCountBoxSizes({ take: 100 })
        boxSizes = sizes
      } catch (e) {
        // ignore
      }

      // 3. Fetch Rates
      const apiKey = process.env.SHIPPO_API_KEY || ""
      const rates = await fetchShippoRates(cart.items || [], cart.shipping_address, boxSizes, apiKey)

      return res.json({ rates })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
