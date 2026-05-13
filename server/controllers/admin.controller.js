// backend/controllers/admin.controller.js
import UserModel from '../models/user.model.js';
import ProductModel from '../models/product.model.js';
import OrderModel from '../models/order.model.js';
import { startOfMonth, subMonths } from 'date-fns';

function buildLast12Months() {
  const buckets = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const start = startOfMonth(subMonths(now, i));
    const key = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({ start, key, label: start.toLocaleString('en-US', { month: 'short', year: 'numeric' }) });
  }
  return buckets;
}

function safeNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function calcGrowth(curr, prev) {
  const c = safeNumber(curr);
  const p = safeNumber(prev);
  if (p === 0) return c > 0 ? 100 : 0;
  return ((c - p) / p) * 100;
}

export async function getAdminDashboardStats(req, res) {
  try {
    const months = buildLast12Months();
    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const [totalUsers, totalProducts, orders] = await Promise.all([
      UserModel.countDocuments({}),
      ProductModel.countDocuments({}),
      OrderModel.find({}).select('createdAt totalAmt subTotalAmt products payment_status').lean()
    ]);

    let totalRevenue = 0;
    let totalSalesUnits = 0;

    const revenueByMonthMap = new Map();
    const unitsByMonthMap = new Map();
    months.forEach((m) => {
      revenueByMonthMap.set(m.key, 0);
      unitsByMonthMap.set(m.key, 0);
    });

    for (const o of orders) {
      const created = new Date(o.createdAt);
      const key = monthKey(created);
      const orderTotal = safeNumber(o.totalAmt || o.subTotalAmt || 0);
      totalRevenue += orderTotal;

      const products = Array.isArray(o.products) ? o.products : [];
      const units = products.reduce((acc, it) => acc + safeNumber(it.quantity || 1), 0);
      totalSalesUnits += units;

      if (revenueByMonthMap.has(key)) {
        revenueByMonthMap.set(key, safeNumber(revenueByMonthMap.get(key)) + orderTotal);
      }
      if (unitsByMonthMap.has(key)) {
        unitsByMonthMap.set(key, safeNumber(unitsByMonthMap.get(key)) + units);
      }
    }

    const usersRaw = await UserModel.find({}).select('createdAt').lean();
    const usersByMonthMap = new Map();
    months.forEach((m) => usersByMonthMap.set(m.key, 0));
    for (const u of usersRaw) {
      const created = new Date(u.createdAt);
      const key = monthKey(created);
      if (usersByMonthMap.has(key)) {
        usersByMonthMap.set(key, safeNumber(usersByMonthMap.get(key)) + 1);
      }
    }

    const productsRaw = await ProductModel.find({}).select('createdAt').lean();
    const productsByMonthMap = new Map();
    months.forEach((m) => productsByMonthMap.set(m.key, 0));
    for (const p of productsRaw) {
      const created = new Date(p.createdAt);
      const key = monthKey(created);
      if (productsByMonthMap.has(key)) {
        productsByMonthMap.set(key, safeNumber(productsByMonthMap.get(key)) + 1);
      }
    }

    const revenueByMonth = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: safeNumber(revenueByMonthMap.get(m.key)),
    }));
    const usersByMonth = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: safeNumber(usersByMonthMap.get(m.key)),
    }));
    const productsByMonth = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: safeNumber(productsByMonthMap.get(m.key)),
    }));
    const salesUnitsByMonth = months.map((m) => ({
      key: m.key,
      label: m.label,
      value: safeNumber(unitsByMonthMap.get(m.key)),
    }));

    const lastIdx = revenueByMonth.length - 1;
    const prevIdx = revenueByMonth.length - 2;

    const revenueGrowth = calcGrowth(revenueByMonth[lastIdx]?.value || 0, revenueByMonth[prevIdx]?.value || 0);
    const salesGrowth = calcGrowth(salesUnitsByMonth[lastIdx]?.value || 0, salesUnitsByMonth[prevIdx]?.value || 0);
    const lastProfit = (revenueByMonth[lastIdx]?.value || 0) * 0.35;
    const prevProfit = (revenueByMonth[prevIdx]?.value || 0) * 0.35;
    const profitGrowth = calcGrowth(lastProfit, prevProfit);

    const userGrowth = calcGrowth(usersByMonth[lastIdx]?.value || 0, usersByMonth[prevIdx]?.value || 0);
    const productGrowth = calcGrowth(productsByMonth[lastIdx]?.value || 0, productsByMonth[prevIdx]?.value || 0);

    return res.json({
      message: 'Admin dashboard stats',
      success: true,
      error: false,
      data: {
        totals: {
          totalUsers,
          totalProducts,
          totalOrders: orders.length,
          totalRevenue,
          totalSalesUnits,
          totalProfit: Math.round(totalRevenue * 0.35),
        },
        growth: {
          revenueGrowth,
          salesGrowth,
          profitGrowth,
          userGrowth,
          productGrowth,
        },
        series: {
          revenueByMonth,
          usersByMonth,
          productsByMonth,
          salesUnitsByMonth,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      success: false,
      error: true,
    });
  }
}
