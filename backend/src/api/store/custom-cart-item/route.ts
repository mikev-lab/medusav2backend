// src/api/store/custom-cart-item/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { addToCartWorkflow } from "@medusajs/core-flows";

type RequestBody = {
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number; // Price in cents
  metadata?: Record<string, any>;
};

export async function POST(req: MedusaRequest<RequestBody>, res: MedusaResponse) {
  const { cart_id, variant_id, quantity, unit_price, metadata } = req.body;

  if (!cart_id || !variant_id || !quantity || unit_price === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Use Medusa's internal workflow to add item with custom price
  const { result, errors } = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [
        {
          variant_id,
          quantity,
          unit_price, // internal workflows allow this override
          metadata,
        },
      ],
    },
  });

  if (errors.length) {
    return res.status(500).json({ errors });
  }

  return res.json({ cart: result });
}