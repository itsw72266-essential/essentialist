import { addAddressController } from "@/fullstack/controllers/address/handlers";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(addAddressController);
