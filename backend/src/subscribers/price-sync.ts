import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { ICartModuleService } from "@medusajs/framework/types"

export default async function priceSyncSubscriber(input: any) {
  // input is { event: { name: string, data: any }, container: MedusaContainer, ... }
  // OR input is { event: string, data: any, container: ... }
  // We handle both to be safe against framework version differences.

  const { container } = input

  let eventName = input.event
  let data = input.data

  // If event is an object, extract name and data from it
  if (typeof eventName === 'object' && eventName !== null) {
      if (eventName.data) data = eventName.data
      if (eventName.name) eventName = eventName.name
  }

  const cartService: ICartModuleService = container.resolve(Modules.CART)

  if (typeof eventName !== 'string') {
      console.warn(`[PriceSync] Could not determine event name. Input event type: ${typeof input.event}`)
      return
  }

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
        // We log error instead of throwing to prevent blocking the cart flow if it's critical but we want to fail softly?
        // User said: "generate an error".
        // Throwing here inside a subscriber might be async and just logged by event bus.
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
