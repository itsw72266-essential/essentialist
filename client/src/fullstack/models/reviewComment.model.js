import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewCommentSchema = new Schema(
  {
    review: {
      type: Schema.Types.ObjectId,
      ref: "review",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    authorType: {
      type: String,
      enum: ["registered", "guest", "admin"],
      default: "registered",
    },
    authorName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 140,
    },
    authorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 140,
    },
    guestTokenHash: {
      type: String,
      select: false,
      sparse: true,
    },
    body: {
      type: String,
      trim: true,
      maxlength: 2000,
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "pending", "hidden"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

reviewCommentSchema.index({ review: 1, createdAt: 1 });

const ReviewCommentModel =
  mongoose.models.review_comment ||
  mongoose.model("review_comment", reviewCommentSchema);

export default ReviewCommentModel;