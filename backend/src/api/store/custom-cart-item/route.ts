// backend/src/api/store/custom-cart-item/route.ts
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

  console.log(`[CustomCart] Request received for Cart: ${cart_id}`);

  if (!cart_id || !variant_id || !quantity || unit_price === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const cartModuleService = req.scope.resolve(Modules.CART);

  // --- DIAGNOSTIC LOGGING ---
  try {
      // Fetch the cart to see its current "Context"
      const debugCart = await (cartModuleService as any).retrieveCart(cart_id, {
          relations: ["region", "shipping_address"]
      });
      
      console.log("--- [CustomCart DIAGNOSTIC] ---");
      console.log(`Cart ID: ${debugCart.id}`);
      console.log(`Region ID: ${debugCart.region_id}`);
      console.log(`Currency: ${debugCart.currency_code}`);
      console.log(`Shipping Address Country: ${debugCart.shipping_address?.country_code}`);
      console.log("-------------------------------");

      if (!debugCart.region_id) {
          console.error("CRITICAL: Cart has no Region ID. Inventory checks will fail!");
      }
  } catch (err) {
      console.error("[CustomCart] Failed to inspect cart:", err);
  }
  // --------------------------

  // 1. Add Item to Cart
  const workflowResult = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [{ variant_id, quantity, metadata }],
    },
    throwOnError: false,
  }) as any;

  const { result, errors } = workflowResult;

  if (errors.length || !result) {
    console.error("[CustomCart] Workflow Failed. Errors:", JSON.stringify(errors, null, 2));
    // Return more detailed info to the client
    return res.status(500).json({ 
        message: "Workflow failed",
        details: "Workflow returned empty result. Likely due to missing Cart Region or Inventory Mismatch.",
        debug_errors: errors 
    });
  }

  // 2. Find the Line Item ID
  const addedItem = result.items.find((item: any) => item.variant_id === variant_id);
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    // 3. Force Update the Unit Price
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