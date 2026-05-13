import UserModel from "../models/user.model.js";

const adminOnly = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Authentication required",
      });
    }

    const user = await UserModel.findById(req.userId).select(
      "role name email avatar"
    );

    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "Admin privilege required",
      });
    }

    req.requestUser = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: true,
      message: error.message || "Admin check failed",
    });
  }
};

export default adminOnly;