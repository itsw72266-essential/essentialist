import { connectMongo } from "../../db/mongoose.js";
import uploadImageClodinary from "../../lib/uploadImageClodinary.js";
import UserModel from "../../models/user.model.js";

export async function uploadAvatarForUserId(userId, buffer) {
  if (!userId || !buffer?.length) {
    throw new Error("Missing user or image");
  }
  await connectMongo();
  const upload = await uploadImageClodinary({ buffer });
  await UserModel.findByIdAndUpdate(userId, { avatar: upload.url });
  return { _id: userId, avatar: upload.url };
}
