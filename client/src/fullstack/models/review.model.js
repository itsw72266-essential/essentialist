// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const SUBJECT_TYPES = [
//   "product",
//   "customer_service",
//   "environment",
//   "shipping",
//   "website",
//   "other",
// ];

// const reviewSchema = new Schema(
//   {
//     product: {
//       type: Schema.Types.ObjectId,
//       ref: "product",
//       default: null,
//       index: true,
//     },
//     user: {
//       type: Schema.Types.ObjectId,
//       ref: "user",
//     },
//     authorType: {
//       type: String,
//       enum: ["registered", "guest", "admin"],
//       default: "registered",
//     },
//     authorName: {
//       type: String,
//       trim: true,
//       required: true,
//       maxlength: 140,
//     },
//     authorEmail: {
//       type: String,
//       trim: true,
//       lowercase: true,
//       maxlength: 140,
//     },
//     authorAvatar: {
//       type: String,
//       trim: true,
//       maxlength: 500,
//     },
//     guestTokenHash: {
//       type: String,
//       select: false,
//       sparse: true,
//     },
//     subjectType: {
//       type: String,
//       enum: SUBJECT_TYPES,
//       default: "product",
//       index: true,
//     },
//     experienceTags: {
//       type: [String],
//       default: [],
//     },
//     locationContext: {
//       type: String,
//       trim: true,
//       maxlength: 140,
//     },
//     rating: {
//       type: Number,
//       required: true,
//       min: 0.5,
//       max: 5,
//     },
//     title: {
//       type: String,
//       trim: true,
//       maxlength: 140,
//     },
//     comment: {
//       type: String,
//       trim: true,
//       maxlength: 500,
//     },
//     contentHtml: {
//       type: String,
//       trim: true,
//       maxlength: 8000,
//     },
//     contentDelta: {
//       type: Object,
//     },
//     isVerifiedPurchase: {
//       type: Boolean,
//       default: false,
//     },
//     status: {
//       type: String,
//       enum: ["published", "pending", "hidden"],
//       default: "pending",
//       index: true,
//     },
//     publishedAt: {
//       type: Date,
//       default: Date.now,
//     },
//     createdByAdmin: {
//       type: Boolean,
//       default: false,
//     },
//     commentsCount: {
//       type: Number,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// reviewSchema.path("product").validate({
//   validator(value) {
//     if (this.subjectType === "product") {
//       return Boolean(value);
//     }
//     return true;
//   },
//   message: "Product is required for product reviews",
// });

// reviewSchema.index({ product: 1, createdAt: -1 });
// reviewSchema.index({ subjectType: 1, createdAt: -1 });
// reviewSchema.index(
//   { user: 1, product: 1, subjectType: 1 },
//   {
//     unique: true,
//     partialFilterExpression: { user: { $exists: true } },
//   }
// );
// reviewSchema.index(
//   { guestTokenHash: 1, product: 1, subjectType: 1 },
//   { unique: true, sparse: true }
// );

// const ReviewModel =
//   mongoose.models.review || mongoose.model("review", reviewSchema);
// export default ReviewModel;



// models/review.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const SUBJECT_TYPES = [
  "product",
  "customer_service",
  "environment",
  "shipping",
  "website",
  "other",
];

const reviewSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      default: null,
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
    authorAvatar: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    guestTokenHash: {
      type: String,
      select: false,
      sparse: true,
    },
    guestFingerprintHash: {
      type: String,
      select: false,
      sparse: true,
      index: true,
    },
    subjectType: {
      type: String,
      enum: SUBJECT_TYPES,
      default: "product",
      index: true,
    },
    experienceTags: {
      type: [String],
      default: [],
    },
    locationContext: {
      type: String,
      trim: true,
      maxlength: 140,
    },
    rating: {
      type: Number,
      required: true,
      min: 0.5,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 140,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    contentHtml: {
      type: String,
      trim: true,
      maxlength: 8000,
    },
    contentDelta: {
      type: Object,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["published", "pending", "hidden"],
      default: "pending",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdByAdmin: {
      type: Boolean,
      default: false,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reviewSchema.path("product").validate({
  validator(value) {
    if (this.subjectType === "product") {
      return Boolean(value);
    }
    return true;
  },
  message: "Product is required for product reviews",
});

reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ subjectType: 1, createdAt: -1 });
reviewSchema.index(
  { user: 1, product: 1, subjectType: 1 },
  {
    unique: true,
    partialFilterExpression: { user: { $exists: true } },
  }
);
reviewSchema.index({ authorEmail: 1, product: 1, subjectType: 1 });
reviewSchema.index(
  { guestTokenHash: 1, product: 1, subjectType: 1 },
  { unique: true, sparse: true }
);

const ReviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);
export default ReviewModel;