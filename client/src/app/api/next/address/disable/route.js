export const dynamic = "force-dynamic";

import { deleteAddresscontroller } from "@/fullstack/controllers/address/handlers";
import { asAuthDelete } from "@/fullstack/lib/nextRoute";

export const DELETE = asAuthDelete(deleteAddresscontroller);
