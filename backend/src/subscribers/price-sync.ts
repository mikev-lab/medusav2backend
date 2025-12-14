import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

export default async function priceSyncSubscriber(input: any) {
  // Cast input to any to avoid type issues with SubscriberArgs
  const { event, container } = input

  const cartService: ICartModuleService = container.resolve(Modules.CART)

  // event is { name: string, data: any, ... }
  const eventName = event.name
  const data = event.data

  const isCartEvent = eventName.startsWith("cart.")

  if (isCartEvent) {
    // @ts-ignore
    const cart = await cartService.retrieve(data.id, {
      relations: ["items"],
    })

    if (cart.items) {
      for (const item of cart.items) {
        await syncPrice(item, cartService)
      }
    }
  } else {
    // In v2, listLineItems usually requires a filter object
    const items = await cartService.listLineItems({
      id: [data.id],
    })

    // items is an array
    if (items.length > 0) {
      await syncPrice(items[0], cartService)
    }
  }
}

async function syncPrice(item: any, cartService: ICartModuleService) {
  const metadata = item.metadata || {}

  if (metadata.custom_unit_price !== undefined && metadata.custom_unit_price !== null) {
    const customPrice = Number(metadata.custom_unit_price)

    if (item.unit_price !== customPrice) {
       console.log(`[PriceSync] Updating item ${item.id} price from ${item.unit_price} to ${customPrice}`)
       await cartService.updateLineItems([{
         id: item.id,
         unit_price: customPrice
       }])
    }
  } else {
    if (metadata.material) {
        throw new Error(`Item ${item.id} is missing custom_unit_price metadata.`)
    }
  }
}

export const config: SubscriberConfig = {
  event: [
    "cart.created",
    "cart.updated",
    "line_item.created",
    "line_item.updated"
  ],
}
