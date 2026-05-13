import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", index: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    anonId: { type: String, default: null, index: true },
    value: { type: Number, required: true, min: 0.5, max: 5 },
  },
  { timestamps: true }
);

RatingSchema.index({ product: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: "objectId" } } });
RatingSchema.index({ product: 1, anonId: 1 }, { unique: true, partialFilterExpression: { anonId: { $type: "string" } } });


const RatingModel = mongoose.models.Rating || mongoose.model("Rating", RatingSchema);
export default RatingModel;