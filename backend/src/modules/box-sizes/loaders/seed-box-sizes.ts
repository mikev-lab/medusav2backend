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
        // Try fallback
        boxSizesService = container.resolve("boxSizesService")
      }

      if (!boxSizesService) {
          throw new Error("Could not resolve boxSizes or boxSizesService")
      }

      // Cast to any for usage
      const service = boxSizesService as any

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
      try {
          // Log available keys for debugging
          const keys = Object.keys((container as any).registrations || {})
          logger.info(`Available container keys: ${keys.join(", ")}`)
      } catch (e) {
          // ignore
      }
  }
}
