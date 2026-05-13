import CartProductModel from "../../models/cartproduct.model.js";
import UserModel from "../../models/user.model.js";

export const addToCartItemController = async (request, response) => {
  try {
    const userId = request.userId;
    const { productId, guestCartId } = request.body;

    if (!productId) {
      return response.status(402).json({
        message: "Provide productId",
        error: true,
        success: false,
      });
    }

    if (!userId) {
      return response.json({
        message: "Item added to guest cart",
        error: false,
        success: true,
        isGuest: true,
      });
    }

    const checkItemCart = await CartProductModel.findOne({
      userId,
      productId,
    });

    if (checkItemCart) {
      return response.status(400).json({
        message: "Item already in cart",
      });
    }

    const cartItem = new CartProductModel({
      quantity: 1,
      userId,
      productId,
    });
    const save = await cartItem.save();

    await UserModel.updateOne(
      { _id: userId },
      {
        $push: {
          shopping_cart: productId,
        },
      }
    );

    return response.json({
      data: save,
      message: "Item add successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const getCartItemController = async (request, response) => {
  try {
    const userId = request.userId;

    const cartItem = await CartProductModel.find({
      userId,
    }).populate("productId");

    return response.json({
      data: cartItem,
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const updateCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id, qty } = request.body;

    if (!_id || !qty) {
      return response.status(400).json({
        message: "provide _id, qty",
      });
    }

    const updateCartitem = await CartProductModel.updateOne(
      {
        _id,
        userId,
      },
      {
        quantity: qty,
      }
    );

    return response.json({
      message: "Update cart",
      success: true,
      error: false,
      data: updateCartitem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

export const deleteCartItemQtyController = async (request, response) => {
  try {
    const userId = request.userId;
    const { _id } = request.body;

    if (!_id) {
      return response.status(400).json({
        message: "Provide _id",
        error: true,
        success: false,
      });
    }

    const deleteCartItem = await CartProductModel.deleteOne({ _id, userId });

    return response.json({
      message: "Item remove",
      error: false,
      success: true,
      data: deleteCartItem,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
