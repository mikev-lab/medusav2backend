import { defineMiddlewares } from "@medusajs/medusa";
import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/products/:id/variants",
      method: "GET",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          if (req.query.fields && typeof req.query.fields === "string") {
            const fields = req.query.fields.split(",");
            const newFields = fields.filter((f) => f !== "thumbnail");
            if (newFields.length !== fields.length) {
              req.query.fields = newFields.join(",");
            }
          }
          next();
        },
      ],
    },
  ],
});
