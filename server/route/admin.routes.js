// backend/routes/admin.routes.js
import { Router } from 'express';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/Admin.js';
import { getAdminDashboardStats } from '../controllers/admin.controller.js';

const adminRouter = Router();

// GET /api/admin/dashboard
adminRouter.get('/dashboard', auth, admin, getAdminDashboardStats);

export default adminRouter;


