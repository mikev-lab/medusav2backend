import { Module } from "@medusajs/framework/utils"
import BoxSizesService from "./service"
import seedBoxSizes from "./loaders/seed-box-sizes"

export const BOX_SIZES_MODULE = "boxSizes"

export default Module(BOX_SIZES_MODULE, {
  service: BoxSizesService,
  loaders: [seedBoxSizes],
})
