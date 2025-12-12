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

  const cartModuleService = req.scope.resolve(Modules.CART);
  const regionModuleService = req.scope.resolve(Modules.REGION);

  // 1. DIAGNOSTICS & AUTO-FIX
  try {
      const debugCart = await (cartModuleService as any).retrieveCart(cart_id, {
          relations: ["shipping_address"] 
      });

      console.log("--- [CustomCart DEBUG] ---");
      console.log(`Cart ID: ${debugCart.id}`);
      console.log(`Region ID: ${debugCart.region_id}`);
      console.log(`Sales Channel ID: ${debugCart.sales_channel_id}`); // <--- CRITICAL CHECK
      console.log(`Currency: ${debugCart.currency_code}`);
      console.log(`Target Variant: ${variant_id}`);
      console.log("--------------------------");

      // Auto-Fix: Force US Region if missing
      if (!debugCart.region_id) {
          console.warn("[CustomCart] Cart has no Region! Attempting to fix...");
          
          const allRegions = await regionModuleService.listRegions({}, {
              relations: ["countries"]
          });

          const targetRegion = allRegions.find((r: any) => 
              r.countries?.some((c: any) => c.iso_2 === 'us')
          );

          if (targetRegion) {
              console.log(`[CustomCart] Found valid US Region: ${targetRegion.id}. Updating Cart...`);
              await (cartModuleService as any).updateCarts(cart_id, {
                  region_id: targetRegion.id,
                  currency_code: targetRegion.currency_code,
                  shipping_address: { country_code: 'us' }
              });
          } else {
              console.error("[CustomCart] CRITICAL: No Region found for 'us' in Admin Settings!");
          }
      }
  } catch (err) {
      console.error("[CustomCart] Error during cart check:", err);
  }

  // 2. Add Item to Cart
  const { result, errors } = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [{ variant_id, quantity, metadata }],
    },
    throwOnError: false,
  }) as any;

  if (errors.length || !result) {
    console.error("[CustomCart] Workflow Errors:", JSON.stringify(errors, null, 2));
    // Provide a hint in the error response based on logs
    return res.status(500).json({ 
        message: "Workflow failed",
        details: "Item rejected. Check Railway logs for 'Sales Channel ID' or 'Currency' mismatch.",
        debug_errors: errors 
    });
  }

  // 3. Update Price
  const addedItem = result.items.find((item: any) => item.variant_id === variant_id);
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    await (cartModuleService as any).updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    const updatedCart = await (cartModuleService as any).retrieveCart(cart_id, {
      relations: ["items", "items.variant"],
    });

    return res.json({ cart: updatedCart });

  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}