export const dynamic = "force-dynamic";

import { updateAddressController } from "@/fullstack/controllers/address/handlers";
import { asAuthPut } from "@/fullstack/lib/nextRoute";

export const PUT = asAuthPut(updateAddressController);
