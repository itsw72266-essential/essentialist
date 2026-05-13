import mongoose from "mongoose";

const productTranslationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    unit: { type: String, default: "" },
    description: { type: String, default: "" },
    specifications: { type: String, default: "" },
    more_details: { type: Object, default: {} },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: Array, default: [] },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],
    subCategory: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
      default: null,
    },
    unit: { type: String, default: "" },
    stock: { type: Number, default: null },
    bulkPrice: { type: Number, default: null },
    price: { type: Number, default: null },
    discount: { type: Number, default: null },
    description: { type: String, default: "" },
    specifications: { type: String, default: "" },
    more_details: { type: Object, default: {} },
    translations: {
      fr: { type: productTranslationSchema, default: () => ({}) },
    },
    publish: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index(
  {
    name: "text",
    description: "text",
    "translations.fr.name": "text",
    "translations.fr.description": "text",
  },
  {
    weights: {
      name: 10,
      description: 5,
      "translations.fr.name": 8,
      "translations.fr.description": 4,
    },
    name: "product_text_index",
  }
);

productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ discount: 1 });

const ProductModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default ProductModel;
