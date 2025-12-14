import { model } from "@medusajs/framework/utils"

export const BoxSize = model.define("box_size", {
  id: model.id().primaryKey(),
  name: model.text(),
  length: model.float(),
  width: model.float(),
  height: model.float(),
  weight_limit: model.float(),
  // Add volume and max_weight if needed, but the prompt implies a standard limit.
  // We'll keep weight_limit in the model for flexibility.
})
