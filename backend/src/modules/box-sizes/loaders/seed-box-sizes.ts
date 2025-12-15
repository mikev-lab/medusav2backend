import { LoaderOptions } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

export default async function seedBoxSizes({
  container,
}: LoaderOptions) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
      // Resolve the internal service for the BoxSize model
      const boxSizeService = container.resolve("boxSizeService") as any

      // FAILSAFE: Ensure table exists using raw SQL
      // This handles cases where migrations haven't run or module isolation prevents visibility
      // We assume Postgres dialect
      try {
          // Get the manager from the service (standard Medusa/MikroORM pattern)
          // or resolve the PG connection if available.
          // boxSizeService is an instance of AbstractService which has a 'manager' property (SqlEntityManager)
          const manager = boxSizeService.manager || (container.resolve("manager") as any)

          if (manager) {
              await manager.execute(`
                CREATE TABLE IF NOT EXISTS "box_size" (
                  "id" text not null,
                  "name" text not null,
                  "length" real not null,
                  "width" real not null,
                  "height" real not null,
                  "weight_limit" real not null,
                  "created_at" timestamptz not null default now(),
                  "updated_at" timestamptz not null default now(),
                  "deleted_at" timestamptz null,
                  constraint "box_size_pkey" primary key ("id")
                );
              `)
              logger.info("[BoxSizes Loader] Verified 'box_size' table existence.")
          } else {
              logger.warn("[BoxSizes Loader] Could not resolve EntityManager to verify table existence.")
          }
      } catch (dbErr) {
          logger.warn(`[BoxSizes Loader] Failed to verify/create table: ${dbErr.message}`)
      }

      const [existing, count] = await boxSizeService.listAndCount({}, { take: 1 })

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
        await boxSizeService.create(size)
      }

      logger.info("Box sizes seeded.")
  } catch (err) {
      logger.error(`[BoxSizes Loader] Failed to seed: ${err.message}`)
      console.error("[BoxSizes Loader] Error details:", err)
  }
}
