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

  console.log(`[CustomCart] Attempting to add ${variant_id} to ${cart_id}`);

  if (!cart_id || !variant_id || !quantity || unit_price === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 1. Add Item to Cart
  const workflowResult = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [{ variant_id, quantity, metadata }],
    },
    throwOnError: false,
  }) as any;

  const { result, errors } = workflowResult;

  // --- DEBUGGING LOGS ---
  if (errors.length) {
      console.error("[CustomCart] Workflow Errors:", JSON.stringify(errors, null, 2));
  }
  if (!result) {
      console.error("[CustomCart] Workflow returned NO RESULT. Input was:", JSON.stringify({ cart_id, variant_id, quantity }, null, 2));
  }
  // ---------------------

  if (errors.length || !result) {
    // Return the specific error from the workflow if available
    const errorMsg = errors.length ? errors[0].error?.message : "Workflow returned empty result (Check Product Availability/Inventory)";
    return res.status(500).json({ 
        message: "Workflow failed",
        details: errorMsg,
        raw_errors: errors 
    });
  }

  // 2. Find the Line Item ID
  const addedItem = result.items.find((item: any) => item.variant_id === variant_id);
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    // 3. Force Update the Unit Price
    const cartModuleService = req.scope.resolve(Modules.CART);
    
    await (cartModuleService as any).updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    // 4. Retrieve fresh cart
    const updatedCart = await (cartModuleService as any).retrieveCart(cart_id, {
      relations: ["items", "items.variant"],
    });

    console.log(`[CustomCart] Success! Updated item ${targetItemId} to ${unit_price}`);
    return res.json({ cart: updatedCart });

  } catch (error: any) {
    console.error("[CustomCart] Price Update Failed:", error);
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}