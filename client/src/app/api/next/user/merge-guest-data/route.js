import { mergeGuestDataController } from "@/fullstack/controllers/user/mergeGuestData";
import { asAuthPost } from "@/fullstack/lib/nextRoute";

export const POST = asAuthPost(mergeGuestDataController);
