import { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export default async function seedBoxSizes({
  container,
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
      // Introspect container to find the service key
      const registrations = (container as any).registrations || {}
      const keys = Object.keys(registrations)

      console.log("[BoxSizes Loader] Available keys:", keys) // Stdout for visibility

      let serviceKey = keys.find(k => k === "boxSizes" || k === "boxSizesService" || k === "service")

      if (!serviceKey) {
          serviceKey = keys.find(k => k.toLowerCase().includes("boxsize"))
      }

      if (!serviceKey) {
          serviceKey = "boxSizes"
          console.log("[BoxSizes Loader] Could not find explicit key, defaulting to:", serviceKey)
      } else {
          console.log("[BoxSizes Loader] Found service key:", serviceKey)
      }

      const boxSizesService = container.resolve(serviceKey) as any

      if (!boxSizesService) {
          throw new Error(`Resolved service is null for key: ${serviceKey}`)
      }

      if (typeof boxSizesService.listAndCountBoxSizes !== 'function') {
           console.warn(`[BoxSizes Loader] Resolved service ${serviceKey} does not have listAndCountBoxSizes method. Keys: ${Object.keys(boxSizesService)}`)
           return;
      }

      const [existing, count] = await boxSizesService.listAndCountBoxSizes({ take: 1 })

      if (count > 0) {
        logger.info("Box sizes already exist, skipping seed.")
        return
      }

      const seedPath = path.resolve(process.cwd(), "box-sizes-seed.json")

      if (!fs.existsSync(seedPath)) {
         logger.warn(`Box size seed file not found at ${seedPath}`)
         return
      }

      const data = JSON.parse(fs.readFileSync(seedPath, "utf-8"))

      logger.info(`Seeding ${data.length} box sizes...`)

      for (const size of data) {
        await boxSizesService.createBoxSizes(size)
      }

      logger.info("Box sizes seeded.")
  } catch (err) {
      logger.error(`[BoxSizes Loader] Failed to seed: ${err.message}`)
      console.error("[BoxSizes Loader] Error details:", err)
  }
}
