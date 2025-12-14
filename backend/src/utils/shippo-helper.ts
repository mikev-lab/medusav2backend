// Shared Shippo logic
const shippo = require("shippo")

// 1 lb in grams
const TARE_WEIGHT_GRAMS = 453.6
const MAX_BOX_WEIGHT_GRAMS = 20 * 453.6
const EFFECTIVE_MAX_PRODUCT_WEIGHT = MAX_BOX_WEIGHT_GRAMS - TARE_WEIGHT_GRAMS

export async function fetchShippoRates(items: any[], shippingAddress: any, boxSizes: any[], apiKey: string) {
    if (!apiKey) return []

    const client = shippo(apiKey)
    const parcels = packItems(items, boxSizes)

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
      name: "Store Owner",
      street1: "123 Store St",
      city: "Store City",
      state: "CA",
      zip: "90210",
      country: "US"
    }

    try {
      const shipment = await client.shipment.create({
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
        return shipment.rates.sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount))
      }
    } catch (error) {
      console.error("Shippo Rate Fetch Error:", error)
    }

    return []
}

function packItems(items: any[], boxSizes: any[]) {
    const parcels: any[] = []

    for (const item of items) {
      const metadata = item.metadata || {}
      const unitWeight = Number(metadata.weight || 0)
      const quantity = item.quantity

      if (unitWeight <= 0) continue

      let remainingQty = quantity

      while (remainingQty > 0) {
        const maxUnitsByWeight = Math.floor(EFFECTIVE_MAX_PRODUCT_WEIGHT / unitWeight)

        if (maxUnitsByWeight === 0) {
             const qtyToPack = 1
             remainingQty -= qtyToPack
             parcels.push(createParcel([ { ...item, quantity: qtyToPack, weight: unitWeight } ], boxSizes))
             continue
        }

        const qtyToPack = Math.min(remainingQty, maxUnitsByWeight)

        remainingQty -= qtyToPack

        const packedItem = { ...item, quantity: qtyToPack, weight: unitWeight * qtyToPack }
        parcels.push(createParcel([packedItem], boxSizes))
      }
    }

    return parcels
}

function createParcel(items: any[], boxSizes: any[]) {
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
