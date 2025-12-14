import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import McePrintingFulfillmentService from "./service"

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [McePrintingFulfillmentService],
})
