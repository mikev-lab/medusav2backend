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
  const boxSizesService = req.scope.resolve("boxSizes") as any

  // Safe query parsing
  // req.query might contain strings for offset/limit
  const offset = req.query.offset ? Number(req.query.offset) : 0
  const limit = req.query.limit ? Number(req.query.limit) : 10

  const [boxSizes, count] = await boxSizesService.listAndCountBoxSizes(
    {},
    {
        skip: offset,
        take: limit,
        order: { name: "ASC" }
    }
  )

  res.json({
    box_sizes: boxSizes,
    count,
    offset,
    limit,
  })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = createBoxSizeSchema.parse(req.body)
  const boxSizesService = req.scope.resolve("boxSizes") as any

  const boxSize = await boxSizesService.createBoxSizes(parsed)

  res.status(201).json({ box_size: boxSize })
}
