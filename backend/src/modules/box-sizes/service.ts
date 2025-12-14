import { MedusaService } from "@medusajs/framework/utils"
import { BoxSize } from "./models/box-size"

class BoxSizesService extends MedusaService({
  BoxSize,
}) {}

export default BoxSizesService
