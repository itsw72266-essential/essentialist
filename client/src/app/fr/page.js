export { default } from "../page";

import { generateHomePageMetadata } from "@/lib/seo/homePageMetadata";

/** French home at /fr (works even when middleware does not rewrite). */
export async function generateMetadata() {
  return generateHomePageMetadata("fr");
}
