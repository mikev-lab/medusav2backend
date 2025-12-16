import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const createBoxSizeSchema = z.object({
  name: z.string(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  weight_limit: z.number().optional().default(20),
})

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Resolve the Main Module Service
  const boxSizesModule = req.scope.resolve("boxSizes") as any

  console.log("[API] Resolved boxSizes module. Keys:", Object.keys(boxSizesModule || {}))
  // Also check prototype
  if (boxSizesModule) {
      console.log("[API] Prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(boxSizesModule)))
  }

  // Safe query parsing
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 10

  // The MedusaService factory usually generates methods suffixed with the Model key (pluralized)
  // e.g. listAndCountBoxSizes
  // If BoxSize model key is 'BoxSize', it should be 'listAndCountBoxSizes'

  let result, count;

  try {
      if (typeof boxSizesModule.listAndCountBoxSizes === 'function') {
           [result, count] = await boxSizesModule.listAndCountBoxSizes(
            {},
            {
                skip: offset,
                take: limit,
                order: { name: "ASC" }
            }
          )
      } else if (typeof boxSizesModule.listAndCount === 'function') {
           // Fallback to generic if available (rare for main module but possible)
           console.log("[API] Using generic listAndCount");
           [result, count] = await boxSizesModule.listAndCount(
            {},
            {
                skip: offset,
                take: limit,
                order: { name: "ASC" }
            }
          )
      } else {
          throw new Error("No listAndCount method found on boxSizes module")
      }
  } catch (e) {
      console.error("[API] Error fetching box sizes:", e)
      res.status(500).json({ message: e.message })
      return
  }

  res.json({
    box_sizes: result,
    count,
    offset,
    limit,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = createBoxSizeSchema.parse(req.body)
  const boxSizesModule = req.scope.resolve("boxSizes") as any

  let boxSize;

  if (typeof boxSizesModule.createBoxSizes === 'function') {
      boxSize = await boxSizesModule.createBoxSizes(parsed)
  } else if (typeof boxSizesModule.create === 'function') {
      boxSize = await boxSizesModule.create(parsed)
  } else {
       res.status(500).json({ message: "No create method found on boxSizes module" })
       return
  }

  res.status(201).json({ box_size: boxSize })
}
