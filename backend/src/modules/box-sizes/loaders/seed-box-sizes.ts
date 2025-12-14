import { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export default async function seedBoxSizes({
  container,
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
      let boxSizesService;

      try {
        boxSizesService = container.resolve("boxSizes")
      } catch (e) {
         try {
             boxSizesService = container.resolve("boxSizesService")
         } catch (e2) {
             // ignore
         }
      }

      if (!boxSizesService) {
           try {
               boxSizesService = container.resolve("service")
           } catch(e4) {}
      }

      if (!boxSizesService) {
          logger.warn("[BoxSizes Loader] Could not resolve boxSizes service. Seeding skipped.")
          return
      }

      const service = boxSizesService as any

      // Check for method existence to be safe
      if (typeof service.listAndCountBoxSizes !== 'function') {
           logger.warn(`[BoxSizes Loader] Resolved service does not have listAndCountBoxSizes method. Seeding skipped.`)
           return;
      }

      const [existing, count] = await service.listAndCountBoxSizes({ take: 1 })

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
        await service.createBoxSizes(size)
      }

      logger.info("Box sizes seeded.")
  } catch (err) {
      logger.error(`Failed to seed box sizes: ${err.message}`)
  }
}
