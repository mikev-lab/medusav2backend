import { defineMiddlewares } from "@medusajs/framework/http"
import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/carts",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.method === "POST") {
            try {
              const body = req.body as any
              const sanitizedBody = { ...body }

              // Sanitize PII
              if (sanitizedBody.email) sanitizedBody.email = "***"
              if (sanitizedBody.shipping_address) sanitizedBody.shipping_address = "***"
              if (sanitizedBody.billing_address) sanitizedBody.billing_address = "***"
              if (sanitizedBody.first_name) sanitizedBody.first_name = "***"
              if (sanitizedBody.last_name) sanitizedBody.last_name = "***"
              if (sanitizedBody.phone) sanitizedBody.phone = "***"

              // Log relevant info for debugging 400 errors
              console.log("[DEBUG] POST /store/carts Payload:", JSON.stringify(sanitizedBody, null, 2))
              console.log("[DEBUG] Headers:", JSON.stringify({
                "x-publishable-api-key": req.headers["x-publishable-api-key"] ? "PRESENT" : "MISSING",
                "content-type": req.headers["content-type"]
              }, null, 2))
            } catch (error) {
              console.error("[DEBUG] Error logging payload:", error)
            }
          }
          next()
        },
      ],
    },
  ],
})
