// import mongoose from "mongoose";

// const brandSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true, trim: true, unique: true },
//     slug: { type: String, required: true, trim: true, unique: true },
//     description: { type: String, default: "" },
//     logo: { type: String, default: "" },
//     isFeatured: { type: Boolean, default: false },
//     isActive: { type: Boolean, default: true }
//   },
//   { timestamps: true }
// );

// brandSchema.pre("validate", function (next) {
//   if (!this.slug && this.name) {
//     this.slug = this.name
//       .toLowerCase()
//       .replace(/[^a-z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");
//   }
//   next();
// });

// brandSchema.index({ name: "text" });

// const BrandModel = mongoose.model("brand", brandSchema);

// export default BrandModel;



import mongoose from "mongoose";

const brandTranslationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  { _id: false }
);

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "" },
    translations: {
      fr: { type: brandTranslationSchema, default: () => ({}) }
    },
    logo: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// THE FIX: Removed the 'next' parameter. Mongoose handles this automatically now!
brandSchema.pre("validate", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

brandSchema.index({ name: "text", "translations.fr.name": "text" });

const BrandModel = mongoose.model("brand", brandSchema);

export default BrandModel;
