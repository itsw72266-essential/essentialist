import { getBrandsController } from "@/fullstack/controllers/brand/handlers";
import { asPublicGet } from "@/fullstack/lib/nextRoute";

export const GET = asPublicGet(getBrandsController);
