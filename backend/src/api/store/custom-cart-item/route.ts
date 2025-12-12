// src/api/store/custom-cart-item/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

type RequestBody = {
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  metadata?: Record<string, any>;
};

export async function POST(req: MedusaRequest<RequestBody>, res: MedusaResponse) {
  const { cart_id, variant_id, quantity, unit_price, metadata } = req.body;

  if (!cart_id || !variant_id || !quantity || unit_price === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 1. Add Item to Cart
  // 'as any' fixes the TS error where it thinks result is "never" or undefined
  const { result, errors } = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [{ variant_id, quantity, metadata }],
    },
    throwOnError: false,
  }) as any;

  if (errors.length || !result) {
    return res.status(500).json({ errors: errors || ["Unknown workflow error"] });
  }

  // 2. Find the Line Item ID
  // Since result is 'any', TypeScript will let us access .items safely
  const addedItem = result.items.find((item: any) => item.variant_id === variant_id);
  // Fallback to the last item in the array if we can't find the exact match
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    // 3. Force Update the Unit Price
    const cartModuleService = req.scope.resolve(Modules.CART);
    
    // We cast to 'any' here so we don't need the @medusajs/types package
    // This calls the internal method directly
    await (cartModuleService as any).updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    // 4. Retrieve fresh cart
    // Using retrieveCart (V2 specific method)
    const updatedCart = await (cartModuleService as any).retrieveCart(cart_id, {
      relations: ["items", "items.variant"],
    });

    return res.json({ cart: updatedCart });

  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}