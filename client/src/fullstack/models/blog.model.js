import mongoose from "mongoose";

const blogTranslationSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    tags: [{ type: String, trim: true }],
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      default: null
    },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    translations: {
      fr: { type: blogTranslationSchema, default: () => ({}) }
    },
    readingTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

blogSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  "translations.fr.title": "text",
  "translations.fr.excerpt": "text",
  "translations.fr.content": "text"
});

const BlogModel = mongoose.models.blog || mongoose.model("blog", blogSchema);

export default BlogModel;
