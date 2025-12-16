import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"

const updateBoxSizeSchema = z.object({
  name: z.string().optional(),
  length: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  weight_limit: z.number().optional(),
})

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const boxSizesService = req.scope.resolve("boxSizes") as any

  await boxSizesService.deleteBoxSizes([id])

  res.status(200).json({ id, object: "box_size", deleted: true })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const parsed = updateBoxSizeSchema.parse(req.body)
  const boxSizesService = req.scope.resolve("boxSizes") as any

  const boxSize = await boxSizesService.updateBoxSizes({
    id,
    ...parsed,
  })

  res.json({ box_size: boxSize })
}
