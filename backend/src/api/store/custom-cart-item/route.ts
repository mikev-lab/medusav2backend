// src/api/store/custom-cart-item/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

type RequestBody = {
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number; // Price in cents
  metadata?: Record<string, any>;
};

export async function POST(req: MedusaRequest<RequestBody>, res: MedusaResponse) {
  // 1. Validate Input
  const { cart_id, variant_id, quantity, unit_price, metadata } = req.body;

  if (!cart_id || !variant_id || !quantity || unit_price === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 2. Add Item to Cart (WITHOUT unit_price)
  // We remove unit_price here to prevent the Workflow Schema 400 error
  const { result, errors } = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [
        {
          variant_id,
          quantity,
          metadata,
        },
      ],
    },
    throwOnError: false, 
  });

  if (errors.length) {
    return res.status(500).json({ errors });
  }

  // 3. Find the Line Item ID we just added
  // The workflow returns the Cart object. We need to find the item that matches our variant/metadata.
  // A simple way is to find the last item added or match by variant_id.
  const addedItem = result.items.find((item) => item.variant_id === variant_id && item.metadata === metadata);
  
  // Fallback: If exact match fails, grabbing the last item is a common "quick fix" 
  // but be careful with concurrency. Matching metadata is safer.
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  // 4. Force Update the Unit Price
  // We resolve the Cart Module Service directly to bypass workflow restrictions on pricing.
  try {
    const cartModuleService = req.scope.resolve(Modules.CART);
    
    await cartModuleService.updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    // Optional: Retrieve fresh cart to return to client
    const updatedCart = await cartModuleService.retrieve(cart_id, {
      relations: ["items", "items.variant"],
    });

    return res.json({ cart: updatedCart });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}