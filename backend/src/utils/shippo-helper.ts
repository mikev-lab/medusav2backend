// Shared Shippo logic
const { Shippo } = require("shippo")

// 1 lb in grams
const TARE_WEIGHT_GRAMS = 453.6
const MAX_BOX_WEIGHT_GRAMS = 20 * 453.6
const EFFECTIVE_MAX_PRODUCT_WEIGHT = MAX_BOX_WEIGHT_GRAMS - TARE_WEIGHT_GRAMS

export async function fetchShippoRates(items: any[], shippingAddress: any, boxSizes: any[], apiKey: string) {
    if (!apiKey) {
        console.log("[ShippoHelper] No API Key provided")
        return []
    }

    const client = new Shippo({ apiKeyHeader: apiKey })
    const parcels = packItems(items, boxSizes)

    console.log(`[ShippoHelper] Generated ${parcels.length} parcels for ${items.length} items`)
    if (parcels.length === 0) {
        console.log("[ShippoHelper] No parcels generated (maybe 0 weight or quantity)")
        return []
    }

    const toAddress = {
      name: (shippingAddress?.first_name || "") + " " + (shippingAddress?.last_name || ""),
      street1: shippingAddress?.address_1,
      street2: shippingAddress?.address_2,
      city: shippingAddress?.city,
      state: shippingAddress?.province,
      zip: shippingAddress?.postal_code,
      country: shippingAddress?.country_code,
      validate: true
    }

    const fromAddress = {
      name: "MCE Printing, LLC",
      street1: "11033 118th Pl NE",
      city: "Kirkland",
      state: "WA",
      zip: "98033",
      country: "US"
    }

    try {
      console.log("[ShippoHelper] Creating shipment with Shippo...")
      const shipment = await client.shipments.create({
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
        console.log(`[ShippoHelper] Received ${shipment.rates.length} rates`)
        return shipment.rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
      } else {
          console.warn("[ShippoHelper] Shipment created but no rates returned.", shipment)
      }
    } catch (error) {
      console.error("[ShippoHelper] Shippo API Error:", error)
    }

    return []
}

function packItems(items: any[], boxSizes: any[]) {
    // 1. Convert all items to individual units (or logical units)
    // Actually, expanding 500 business cards to 500 units is memory intensive.
    // But we need to group them.
    // "Bin Packing" typically handles list of items.

    // Efficient strategy:
    // Sort boxes by volume (smallest first)
    // Sort box sizes?

    // We will build a list of "Open Parcels".
    // Iterate through items. Try to fit in current parcel. If full, start new parcel.

    // Flatten items logic:
    // We treat "quantity" as "weight multiplier".
    // We will fill boxes by weight.

    const parcels: any[] = []
    let currentParcelWeight = 0
    let currentParcelItems: any[] = []

    // For volume approximation
    let currentParcelVolume = 0

    // Sort items by weight desc? Not strictly needed for simple filling.

    for (const item of items) {
      const metadata = item.metadata || {}
      const unitWeight = Number(metadata.weight || 0)
      const quantity = item.quantity

      if (unitWeight <= 0) continue

      // Volume
      const unitVolume = Number(metadata.length||0) * Number(metadata.width||0) * Number(metadata.height||0)

      let remainingQty = quantity

      while (remainingQty > 0) {
          // Check if we can fit ONE unit in current parcel
          if (currentParcelWeight + unitWeight > EFFECTIVE_MAX_PRODUCT_WEIGHT) {
              // Close current parcel
              if (currentParcelItems.length > 0) {
                  parcels.push(createParcel(currentParcelItems, boxSizes, currentParcelWeight, currentParcelVolume))
              }
              // Start new parcel
              currentParcelWeight = 0
              currentParcelVolume = 0
              currentParcelItems = []
          }

          // Calculate max we can fit in THIS parcel
          const weightSpace = EFFECTIVE_MAX_PRODUCT_WEIGHT - currentParcelWeight
          const maxUnitsByWeight = Math.floor(weightSpace / unitWeight)

          if (maxUnitsByWeight === 0) {
               // This implies a SINGLE unit is heavier than max weight?
               // Or we just closed parcel and it still doesn't fit?
               // If new parcel (currentParcelWeight == 0) and doesn't fit, we must pack it alone as overweight.
               const qtyToPack = 1
               remainingQty -= qtyToPack

               // Pack as separate parcel immediately
               parcels.push(createParcel([ { ...item, quantity: qtyToPack, weight: unitWeight } ], boxSizes, unitWeight, unitVolume))
               continue
          }

          const qtyToPack = Math.min(remainingQty, maxUnitsByWeight)

          currentParcelItems.push({ ...item, quantity: qtyToPack, weight: unitWeight * qtyToPack })
          currentParcelWeight += unitWeight * qtyToPack
          currentParcelVolume += unitVolume * qtyToPack

          remainingQty -= qtyToPack
      }
    }

    // Close last parcel
    if (currentParcelItems.length > 0) {
        parcels.push(createParcel(currentParcelItems, boxSizes, currentParcelWeight, currentParcelVolume))
    }

    return parcels
}

function createParcel(items: any[], boxSizes: any[], totalWeight: number, totalVolume: number) {
     const sortedBoxes = [...boxSizes].sort((a, b) => (a.length*a.width*a.height) - (b.length*b.width*b.height))

     let selectedBox = sortedBoxes.find(box => {
           const boxVol = box.length * box.width * box.height
           const limit = box.weight_limit ? box.weight_limit * 453.6 : MAX_BOX_WEIGHT_GRAMS

           if (totalWeight + TARE_WEIGHT_GRAMS > limit) return false
           if (totalVolume > boxVol) return false

           return true
       })

     if (!selectedBox) {
         console.log(`[ShippoHelper] No matching box found for weight ${totalWeight}g vol ${totalVolume}. Using Custom Box.`)
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
