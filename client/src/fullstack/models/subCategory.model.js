import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },
    translations: {
      fr: {
        name: {
          type: String,
          default: "",
        },
      },
    },
    image: {
      type: String,
      default: "",
    },
    category: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "category",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const SubCategoryModel =
  mongoose.models.subCategory || mongoose.model("subCategory", subCategorySchema);

export default SubCategoryModel;
