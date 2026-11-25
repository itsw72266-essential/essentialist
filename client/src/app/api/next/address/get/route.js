import { getAddressController } from "@/fullstack/controllers/address/handlers";
import { asAuthGet } from "@/fullstack/lib/nextRoute";

export const GET = asAuthGet(getAddressController);
