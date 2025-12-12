// src/api/store/custom-cart-item/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { addToCartWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";
import { ICartModuleService } from "@medusajs/types"; // Import the type for better autocomplete

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

  // 1. Add Item to Cart (WITHOUT unit_price to pass validation)
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

  if (errors.length || !result) {
    return res.status(500).json({ errors: errors.length ? errors : ["Unknown workflow error"] });
  }

  // 2. Find the Line Item ID we just added
  // We use result!.items because we verified result exists above
  const addedItem = result.items.find((item) => item.variant_id === variant_id);
  
  // Safe fallback to the last item if precise match fails
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    // 3. Force Update the Unit Price
    // Cast the service to ICartModuleService to get correct typing
    const cartModuleService: ICartModuleService = req.scope.resolve(Modules.CART);
    
    await cartModuleService.updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    // 4. Retrieve fresh cart using correct V2 method
    const updatedCart = await cartModuleService.retrieveCart(cart_id, {
      relations: ["items", "items.variant"],
    });

    return res.json({ cart: updatedCart });

  } catch (error) {
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}