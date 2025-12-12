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
      // [FIX] Removed "region" from relations to prevent module isolation errors
      const debugCart = await (cartModuleService as any).retrieveCart(cart_id, {
          relations: ["shipping_address"] 
      });

      console.log(`[CustomCart] Checking Cart ${cart_id}. Region ID: ${debugCart.region_id}`);

      // [FIX] If Cart has no Region, FORCE it to a valid US Region
      if (!debugCart.region_id) {
          console.warn("[CustomCart] Cart has no Region! Attempting to fix...");
          
          // [TYPE FIX] Use listCountries instead of listRegions to filter by ISO code
          const countries = await regionModuleService.listCountries({
              iso_2: "us"
          }, { 
              take: 1,
              relations: ["region"] 
          });

          if (countries.length > 0 && countries[0].region) {
              const targetRegion = countries[0].region;
              console.log(`[CustomCart] Found valid US Region: ${targetRegion.id}. Updating Cart...`);
              
              await (cartModuleService as any).updateCarts(cart_id, {
                  region_id: targetRegion.id,
                  currency_code: targetRegion.currency_code,
                  shipping_address: { country_code: 'us' }
              });
              console.log("[CustomCart] Cart repaired.");
          } else {
              console.error("[CustomCart] CRITICAL: No Region found for 'us' in Admin Settings!");
          }
      }
  } catch (err) {
      console.error("[CustomCart] Error during cart check:", err);
  }

  // 2. Add Item to Cart (Standard Workflow)
  const { result, errors } = await addToCartWorkflow(req.scope).run({
    input: {
      cart_id,
      items: [{ variant_id, quantity, metadata }],
    },
    throwOnError: false,
  }) as any;

  if (errors.length || !result) {
    console.error("[CustomCart] Workflow Errors:", JSON.stringify(errors, null, 2));
    return res.status(500).json({ 
        message: "Workflow failed",
        details: "Item could not be added. Check Railway logs for '[CustomCart]' details.",
        debug_errors: errors 
    });
  }

  // 3. Find Item & Update Price
  const addedItem = result.items.find((item: any) => item.variant_id === variant_id);
  const targetItemId = addedItem ? addedItem.id : result.items[result.items.length - 1].id;

  try {
    await (cartModuleService as any).updateLineItems(targetItemId, {
      unit_price: unit_price,
    });
    
    // Retrieve fresh cart (Do not expand region to avoid cross-module errors)
    const updatedCart = await (cartModuleService as any).retrieveCart(cart_id, {
      relations: ["items", "items.variant"],
    });

    return res.json({ cart: updatedCart });

  } catch (error: any) {
    return res.status(500).json({ message: "Failed to update custom price", error: error.message });
  }
}