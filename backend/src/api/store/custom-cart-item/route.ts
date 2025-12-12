import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
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
  const productModuleService = req.scope.resolve(Modules.PRODUCT);

  try {
      // 1. AUTO-FIX: Ensure Cart has a Region
      // We only fetch 'shipping_address' which belongs to Cart Module. Safe.
      const debugCart = await (cartModuleService as any).retrieveCart(cart_id, {
          relations: ["shipping_address"] 
      });

      console.log(`[CustomCart] Processing Cart ${cart_id}. Current Region: ${debugCart.region_id}`);

      if (!debugCart.region_id) {
          console.warn("[CustomCart] Cart has no Region! Attempting to fix...");
          
          const allRegions = await regionModuleService.listRegions({}, { relations: ["countries"] });
          // Find US Region
          const targetRegion = allRegions.find((r: any) => 
              r.countries?.some((c: any) => c.iso_2 === 'us')
          );

          if (targetRegion) {
              await (cartModuleService as any).updateCarts(cart_id, {
                  region_id: targetRegion.id,
                  currency_code: targetRegion.currency_code,
                  shipping_address: { country_code: 'us' }
              });
              console.log("[CustomCart] Cart repaired with Region:", targetRegion.id);
          } else {
              console.error("[CustomCart] CRITICAL: No US Region found.");
          }
      }

      // 2. FETCH VARIANT DETAILS (For clean display in Cart)
      const variant = await productModuleService.retrieveProductVariant(variant_id, {
          relations: ["product"]
      });

      // 3. DIRECT INJECTION (Bypass Workflow)
      await (cartModuleService as any).addLineItems(cart_id, [{
          variant_id: variant_id,
          quantity: quantity,
          unit_price: unit_price,
          title: variant.title === "Default variant" ? variant.product.title : `${variant.product.title} - ${variant.title}`,
          thumbnail: variant.product.thumbnail,
          metadata: metadata
      }]);

      console.log(`[CustomCart] Successfully injected custom item: ${variant.product.title}`);

      // 4. Retrieve fresh cart for response
      // [FIX] REMOVED "items.variant" from relations.
      // The Cart Module cannot join the Product Module table directly.
      // We retrieve "items" (which are inside Cart Module) and "shipping_address".
      const updatedCart = await (cartModuleService as any).retrieveCart(cart_id, {
          relations: ["items", "shipping_address"],
      });

      return res.json({ cart: updatedCart });

  } catch (error: any) {
      console.error("[CustomCart] Operation Failed:", error);
      return res.status(500).json({ 
          message: "Failed to add custom item", 
          error: error.message,
          stack: error.stack 
      });
  }
}