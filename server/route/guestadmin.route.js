import { Router } from "express";
import auth from "../middleware/auth.js";
// import { admin } from "../middleware/admin.js";
import {
  getAdminDashboardController,
  getAllOrdersController,
  getGuestOrdersController,
  markOrderDeliveredController,
} from "../controllers/guestadmin.controller.js";
import { admin } from "../middleware/Admin.js";

const guestAdminRouter = Router();

guestAdminRouter.get("/dashboard", auth, admin, getAdminDashboardController);
guestAdminRouter.get("/orders", auth, admin, getAllOrdersController);
guestAdminRouter.get("/guest-orders", auth, admin, getGuestOrdersController);
guestAdminRouter.patch(
  "/orders/:orderId/deliver",
  auth,
  admin,
  markOrderDeliveredController
);

export default guestAdminRouter;