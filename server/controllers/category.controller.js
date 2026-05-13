// import CategoryModel from "../models/category.model.js";
// import SubCategoryModel from "../models/subCategory.model.js";
// import ProductModel from "../models/product.model.js";

// export const AddCategoryController = async(request,response)=>{
//     try {
//         const { name , image } = request.body 

//         if(!name || !image){
//             return response.status(400).json({
//                 message : "Enter required fields",
//                 error : true,
//                 success : false
//             })
//         }

//         const addCategory = new CategoryModel({
//             name,
//             image
//         })

//         const saveCategory = await addCategory.save()

//         if(!saveCategory){
//             return response.status(500).json({
//                 message : "Not Created",
//                 error : true,
//                 success : false
//             })
//         }

//         return response.json({
//             message : "Add Category",
//             data : saveCategory,
//             success : true,
//             error : false
//         })

//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// export const getCategoryController = async(request,response)=>{
//     try {
        
//         const data = await CategoryModel.find().sort({ createdAt : -1 })

//         return response.json({
//             data : data,
//             error : false,
//             success : true
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.messsage || error,
//             error : true,
//             success : false
//         })
//     }
// }

// export const updateCategoryController = async(request,response)=>{
//     try {
//         const { _id ,name, image } = request.body 

//         const update = await CategoryModel.updateOne({
//             _id : _id
//         },{
//            name, 
//            image 
//         })

//         return response.json({
//             message : "Updated Category",
//             success : true,
//             error : false,
//             data : update
//         })
//     } catch (error) {
//         return response.status(500).json({
//             message : error.message || error,
//             error : true,
//             success : false
//         })
//     }
// }

// export const deleteCategoryController = async(request,response)=>{
//     try {
//         const { _id } = request.body 

//         const checkSubCategory = await SubCategoryModel.find({
//             category : {
//                 "$in" : [ _id ]
//             }
//         }).countDocuments()

//         const checkProduct = await ProductModel.find({
//             category : {
//                 "$in" : [ _id ]
//             }
//         }).countDocuments()

//         if(checkSubCategory >  0 || checkProduct > 0 ){
//             return response.status(400).json({
//                 message : "Category is already use can't delete",
//                 error : true,
//                 success : false
//             })
//         }

//         const deleteCategory = await CategoryModel.deleteOne({ _id : _id})

//         return response.json({
//             message : "Delete category successfully",
//             data : deleteCategory,
//             error : false,
//             success : true
//         })

//     } catch (error) {
//        return response.status(500).json({
//             message : error.message || error,
//             success : false,
//             error : true
//        }) 
//     }
// }




import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";
import { invalidateCacheNamespaces } from "../middleware/cache.middleware.js";
import {
  getRequestLocale,
  localizeDocuments,
  sanitizeTranslations,
} from "../utils/localization.js";

export const CATEGORY_CACHE_NAMESPACE = "category:list";

const invalidateCategoryCache = async () => {
  await invalidateCacheNamespaces(CATEGORY_CACHE_NAMESPACE);
};

export const AddCategoryController = async (request, response) => {
  try {
    const { name, image, translations } = request.body;

    if (!name || !image) {
      return response.status(400).json({
        message: "Enter required fields",
        error: true,
        success: false,
      });
    }

    const addCategory = new CategoryModel({
      name,
      image,
      translations: sanitizeTranslations(translations, ["name"]),
    });

    const saveCategory = await addCategory.save();

    if (!saveCategory) {
      return response.status(500).json({
        message: "Not Created",
        error: true,
        success: false,
      });
    }

    await invalidateCategoryCache();

    return response.json({
      message: "Add Category",
      data: saveCategory,
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCategoryController = async (request, response) => {
  try {
    const locale = getRequestLocale(request);
    const data = await CategoryModel.find().sort({ createdAt: -1 }).lean();

    return response.json({
      data: localizeDocuments(data, ["name"], locale),
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.messsage || error,
      error: true,
      success: false,
    });
  }
};

export const updateCategoryController = async (request, response) => {
  try {
    const { _id, name, image, translations } = request.body;
    const updatePayload = {
      name,
      image,
    };

    if (translations !== undefined) {
      updatePayload.translations = sanitizeTranslations(translations, ["name"]);
    }

    const update = await CategoryModel.updateOne(
      {
        _id: _id,
      },
      updatePayload
    );

    await invalidateCategoryCache();

    return response.json({
      message: "Updated Category",
      success: true,
      error: false,
      data: update,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteCategoryController = async (request, response) => {
  try {
    const { _id } = request.body;

    const checkSubCategory = await SubCategoryModel.find({
      category: {
        $in: [_id],
      },
    }).countDocuments();

    const checkProduct = await ProductModel.find({
      category: {
        $in: [_id],
      },
    }).countDocuments();

    if (checkSubCategory > 0 || checkProduct > 0) {
      return response.status(400).json({
        message: "Category is already use can't delete",
        error: true,
        success: false,
      });
    }

    const deleteCategory = await CategoryModel.deleteOne({ _id: _id });

    await invalidateCategoryCache();

    return response.json({
      message: "Delete category successfully",
      data: deleteCategory,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
};
