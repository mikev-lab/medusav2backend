import { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export default async function seedBoxSizes({
  container,
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
      const boxSizesService = container.resolve("boxSizes") as any

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
      logger.error(`Failed to seed box sizes: ${err.message}`)
  }
}
