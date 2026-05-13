'use client';

import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useSelector } from 'react-redux';
import SummaryApi, { callSummaryApi, apiFetch } from '../common/SummaryApi';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../@/components/ui/card';
import { Badge } from '../../@/components/ui/badge';
import { Button } from '../../@/components/ui/button';
import { Input } from '../../@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../@/components/ui/select';
import { ChartContainer } from '../../@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '../../@/components/ui/toggle-group';

import {
  ArrowUpRight,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Search,
  Eye,
  TrendingUp,
  Crown,
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Hash,
  Globe,
  CheckCircle2,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

import {
  format as formatDate,
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from 'date-fns';
import { useGlobalContext } from '@/providers/ReactQueryProvider';

const currency = 'XAF';
const PAGE_SIZE = 10;

const COLORS = [
  '#7C3AED',
  '#06B6D4',
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#8B5CF6',
  '#3B82F6',
  '#EC4899',
];

function sum(arr = [], selector = (item) => item) {
  return arr.reduce((acc, item) => acc + selector(item), 0);
}

function safeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  try {
    return Number(value).toLocaleString('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    });
  } catch {
    return `${value} ${currency}`;
  }
}

function groupBy(arr, selector) {
  return arr.reduce((acc, item) => {
    const key = selector(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function ordersToRevenuePoints(orders) {
  return (orders || []).map((order) => ({
    createdAt: new Date(order.createdAt),
    totalAmt: safeNumber(order.totalAmt || order.subTotalAmt || 0),
    profit: Math.round(safeNumber(order.totalAmt || 0) * 0.35),
  }));
}

function bucketizeByRange(data, range) {
  let periods = 12;
  let labelFormat = 'MMM';
  let getBucketStart;

  if (range === 'daily') {
    periods = 7;
    labelFormat = 'EEE';
    getBucketStart = (d) => startOfDay(d);
  } else if (range === 'weekly') {
    periods = 12;
    labelFormat = 'MMM dd';
    getBucketStart = (d) => startOfWeek(d, { weekStartsOn: 1 });
  } else {
    periods = 12;
    labelFormat = 'MMM';
    getBucketStart = (d) => startOfMonth(d);
  }

  const buckets = [];
  const now = new Date();

  for (let i = periods - 1; i >= 0; i -= 1) {
    if (range === 'daily') buckets.push(startOfDay(subDays(now, i)));
    else if (range === 'weekly') buckets.push(startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }));
    else buckets.push(startOfMonth(subMonths(now, i)));
  }

  const grouped = groupBy(data, (point) => getBucketStart(point.createdAt).toISOString());

  return buckets.map((start) => {
    const key = start.toISOString();
    const points = grouped[key] || [];
    const revenue = sum(points, (p) => safeNumber(p.totalAmt));
    const profit = sum(points, (p) => safeNumber(p.profit));
    const expenses = Math.max(0, revenue - profit);

    return {
      name: formatDate(start, labelFormat),
      revenue,
      profit,
      expenses,
      date: start,
    };
  });
}

function salesSeriesFromOrders(orders, range) {
  const salesPoints = (orders || []).map((order) => ({
    createdAt: new Date(order.createdAt),
    online:
      order.payment_status && order.payment_status !== 'CASH ON DELIVERY'
        ? safeNumber(order.totalAmt || 0)
        : 0,
    inStore:
      order.payment_status === 'CASH ON DELIVERY'
        ? safeNumber(order.totalAmt || 0)
        : 0,
  }));

  const now = new Date();
  const periods = range === 'daily' ? 7 : 12;
  const getStart =
    range === 'daily'
      ? (d) => startOfDay(d)
      : range === 'weekly'
      ? (d) => startOfWeek(d, { weekStartsOn: 1 })
      : (d) => startOfMonth(d);

  const bucketStarts = [];
  for (let i = periods - 1; i >= 0; i -= 1) {
    if (range === 'daily') bucketStarts.push(startOfDay(subDays(now, i)));
    else if (range === 'weekly') bucketStarts.push(startOfWeek(subWeeks(now, i), { weekStartsOn: 1 }));
    else bucketStarts.push(startOfMonth(subMonths(now, i)));
  }

  const grouped = groupBy(salesPoints, (point) => getStart(point.createdAt).toISOString());

  return bucketStarts.map((start) => {
    const key = start.toISOString();
    const items = grouped[key] || [];

    return {
      name:
        range === 'daily'
          ? formatDate(start, 'EEE')
          : range === 'weekly'
          ? formatDate(start, 'MMM dd')
          : formatDate(start, 'MMM'),
      online: sum(items, (x) => x.online),
      inStore: sum(items, (x) => x.inStore),
      date: start,
    };
  });
}

function categoryDistributionFromProducts(products) {
  const grouped = groupBy(products, (product) => {
    const c = product.category;
    if (Array.isArray(c) && c.length > 0) return c[0]?.name || 'Other';
    if (typeof c === 'object' && c?.name) return c.name;
    return typeof c === 'string' && c ? c : 'Other';
  });
  const entries = Object.entries(grouped).map(([name, arr]) => ({ name, value: arr.length }));
  entries.sort((a, b) => b.value - a.value);
  return entries;
}

function dedupeOrders(orders = []) {
  const map = new Map();
  orders.forEach((order) => {
    if (!order) return;
    const key = String(
      order.orderId ||
        order._id ||
        order.id ||
        order.id_str ||
        Math.random().toString(36).slice(2)
    );
    if (!map.has(key)) {
      map.set(key, order);
    } else {
      const current = map.get(key);
      map.set(key, { ...current, ...order });
    }
  });
  return Array.from(map.values());
}

function buildRecentOrders(orders = []) {
  return [...orders]
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
    .map((order) => {
      const products = Array.isArray(order.products) ? order.products : [];
      const itemsCount = sum(products, (item) => safeNumber(item.quantity || 1));
      return {
        id: order.orderId || order._id,
        amount: safeNumber(order.totalAmt || order.subTotalAmt || 0),
        status: order.payment_status || 'Processing',
        fulfillmentStatus:
          order.fulfillment_status || order.fulfillmentStatus || 'Processing',
        date: new Date(order.createdAt),
        deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
        itemsCount,
        isGuest: Boolean(order.is_guest),
        paymentMethod:
          order.paymentMethod ||
          (order.payment_status === 'CASH ON DELIVERY'
            ? 'Cash on Delivery'
            : 'Online'),
        contact: {
          name:
            order.contact_info?.name ||
            order.contact?.name ||
            order.delivery_address?.name ||
            'Customer',
          email:
            order.contact_info?.customer_email ||
            order.contact_info?.email ||
            order.contact?.email ||
            '',
          mobile:
            order.contact_info?.mobile ||
            order.contact?.mobile ||
            order.delivery_address?.mobile ||
            '',
        },
        address:
          typeof order.delivery_address === 'object'
            ? order.delivery_address
            : {},
      };
    });
}

function computeTopProducts(orders = []) {
  const productMap = new Map();

  orders.forEach((order) => {
    const items = Array.isArray(order.products) ? order.products : [];
    items.forEach((entry) => {
      const key =
        String(entry.productId) ||
        entry.product_details?._id ||
        entry.product_details?.name ||
        Math.random().toString(36).slice(2);

      const previous = productMap.get(key) || {
        id: entry.productId || entry.product_details?._id || key,
        name: entry.product_details?.name || 'Product',
        sales: 0,
        revenue: 0,
      };

      const qty = safeNumber(entry.quantity || 1);
      const price = safeNumber(entry.price || entry.product_details?.price || 0);

      previous.sales += qty;
      previous.revenue += qty * price;

      productMap.set(key, previous);
    });
  });

  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((product, idx) => ({
      ...product,
      rank: idx + 1,
      growth: Math.round((Math.random() * 30 + 5) * 10) / 10,
    }));
}

function percentChange(current, previous) {
  if (!Number.isFinite(previous) || previous === 0) {
    return Number.isFinite(current) && current !== 0 ? 100 : 0;
  }
  const value = ((current - previous) / previous) * 100;
  return Math.round(value * 10) / 10;
}

function computeGrowthFallback(orders = []) {
  if (!orders.length) {
    return { revenueGrowth: 0, salesGrowth: 0, profitGrowth: 0 };
  }

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * dayMs;
  const sixtyDaysAgo = now - 60 * dayMs;

  const currentOrders = orders.filter(
    (order) => new Date(order.createdAt).getTime() >= thirtyDaysAgo
  );
  const previousOrders = orders.filter((order) => {
    const timestamp = new Date(order.createdAt).getTime();
    return timestamp >= sixtyDaysAgo && timestamp < thirtyDaysAgo;
  });

  const currentRevenue = sum(currentOrders, (order) =>
    safeNumber(order.totalAmt || order.subTotalAmt || 0)
  );
  const previousRevenue = sum(previousOrders, (order) =>
    safeNumber(order.totalAmt || order.subTotalAmt || 0)
  );

  const currentUnits = sum(currentOrders, (order) =>
    sum(Array.isArray(order.products) ? order.products : [], (item) =>
      safeNumber(item.quantity || 1)
    )
  );
  const previousUnits = sum(previousOrders, (order) =>
    sum(Array.isArray(order.products) ? order.products : [], (item) =>
      safeNumber(item.quantity || 1)
    )
  );

  const currentProfit = Math.round(currentRevenue * 0.35);
  const previousProfit = Math.round(previousRevenue * 0.35);

  return {
    revenueGrowth: percentChange(currentRevenue, previousRevenue),
    salesGrowth: percentChange(currentUnits, previousUnits),
    profitGrowth: percentChange(currentProfit, previousProfit),
  };
}

function computeStats({ adminData, orders = [], products = [] }) {
  const totals = adminData?.totals ?? {};
  const growth = adminData?.growth ?? computeGrowthFallback(orders);

  const totalOrders = totals.totalOrders ?? orders.length;
  const totalProducts = totals.totalProducts ?? products.length;
  const totalRevenue =
    totals.totalRevenue ??
    sum(orders, (order) => safeNumber(order.totalAmt || order.subTotalAmt || 0));
  const totalSalesUnits =
    totals.totalSalesUnits ??
    sum(orders, (order) =>
      sum(Array.isArray(order.products) ? order.products : [], (item) =>
        safeNumber(item.quantity || 1)
      )
    );
  const totalProfit = totals.totalProfit ?? Math.round(totalRevenue * 0.35);

  const guestOrders = totals.guestOrders ?? orders.filter((order) => Boolean(order.is_guest)).length;
  const deliveredOrders =
    totals.deliveredOrders ??
    orders.filter((order) => {
      const status =
        order.fulfillment_status || order.fulfillmentStatus || 'Processing';
      return status.toLowerCase() === 'delivered';
    }).length;

  const pendingDeliveries = totals.pendingDeliveries ?? Math.max(0, totalOrders - deliveredOrders);

  const uniqueUsers = new Set();
  orders.forEach((order) => {
    if (order.userId) {
      uniqueUsers.add(String(order.userId));
      return;
    }
    const email =
      order.contact_info?.customer_email ||
      order.contact?.email ||
      order.delivery_address?.customer_email;
    const phone =
      order.contact_info?.mobile ||
      order.contact?.mobile ||
      order.delivery_address?.mobile;

    if (email) uniqueUsers.add(email.toLowerCase());
    else if (phone) uniqueUsers.add(phone);
    else uniqueUsers.add(`guest-${order.orderId || order._id}`);
  });

  const totalUsers = totals.totalUsers ?? uniqueUsers.size;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return {
    totalProducts,
    totalUsers,
    totalRevenue,
    totalSales: totalSalesUnits,
    totalProfit,
    totalOrders,
    avgOrderValue,
    revenueGrowth: growth.revenueGrowth ?? 0,
    salesGrowth: growth.salesGrowth ?? 0,
    profitGrowth: growth.profitGrowth ?? 0,
    guestOrders,
    deliveredOrders,
    pendingDeliveries,
  };
}

function getPaymentBadgeClass(status = '') {
  const normalized = status.toLowerCase();
  if (normalized.includes('completed') || normalized.includes('paid')) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (normalized.includes('cancel')) {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  if (normalized.includes('pending')) {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }
  return 'bg-sky-100 text-sky-800 border-sky-200';
}

function getFulfillmentBadgeClass(status = '') {
  const normalized = status.toLowerCase();
  if (normalized === 'delivered') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (normalized.includes('dispatch') || normalized.includes('out')) {
    return 'bg-sky-100 text-sky-700 border-sky-200';
  }
  if (normalized.includes('cancel') || normalized.includes('failed')) {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  return 'bg-amber-100 text-amber-800 border-amber-200';
}

function mapOrderForList(order) {
  const products = Array.isArray(order.products) ? order.products : [];
  const itemCount = sum(products, (item) => safeNumber(item.quantity || 1));

  return {
    id: order.orderId || order._id,
    amount: safeNumber(order.totalAmt || order.subTotalAmt || 0),
    status: order.payment_status || 'Processing',
    fulfillmentStatus:
      order.fulfillment_status || order.fulfillmentStatus || 'Processing',
    createdAt: order.createdAt ? new Date(order.createdAt) : null,
    deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null,
    itemCount,
    paymentMethod:
      order.paymentMethod ||
      (order.payment_status === 'CASH ON DELIVERY'
        ? 'Cash on Delivery'
        : 'Online'),
    contactName:
      order.contact_info?.name ||
      order.contact?.name ||
      order.delivery_address?.name ||
      'Customer',
    email:
      order.contact_info?.customer_email ||
      order.contact_info?.email ||
      order.contact?.email ||
      '',
    mobile:
      order.contact_info?.mobile ||
      order.contact?.mobile ||
      order.delivery_address?.mobile ||
      '',
    address:
      typeof order.delivery_address === 'object'
        ? order.delivery_address
        : {},
    isGuest: Boolean(order.is_guest),
    integrityToken: order.integrityToken || '',
  };
}

const PrettyTooltip = ({ active, payload, label, currencyMode = false }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 px-3 py-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
        {label}
      </div>
      {payload.map((p, idx) => (
        <div key={idx} className="text-[11px] flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-gray-600 dark:text-gray-300">{p.name}:</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currencyMode ? formatCurrency(p.value) : p.value?.toLocaleString?.()}
          </span>
        </div>
      ))}
    </div>
  );
};

const RevenueAreaInteractive = ({ series, timeRange, setTimeRange }) => {
  const filtered = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    return (series || []).filter((d) => (d.date ? d.date >= start : true));
  }, [series, timeRange]);

  const chartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    profit: { label: 'Profit', color: 'hsl(var(--chart-2))' },
  };

  return (
    <Card className="shadow-xl border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-md">
      <CardHeader className="relative pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
              Revenue Overview
            </CardTitle>
            <CardDescription>Revenue and profit over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(value) => value && setTimeRange(value)}
              variant="outline"
              className="hidden md:flex"
            >
              <ToggleGroupItem value="90d" className="h-8 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                90d
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="h-8 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                30d
              </ToggleGroupItem>
              <ToggleGroupItem value="7d" className="h-8 px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                7d
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="md:hidden w-[140px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
        <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
          <AreaChart data={filtered}>
            <defs>
              <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue, #6366F1)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-revenue, #6366F1)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit, #10B981)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-profit, #10B981)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<PrettyTooltip currencyMode />} />
            <Area
              dataKey="revenue"
              name="Revenue"
              type="monotone"
              fill="url(#revFill)"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
            />
            <Area
              dataKey="profit"
              name="Profit"
              type="monotone"
              fill="url(#profFill)"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  // const user = useSelector((state) => state.user);
  const { user } = useGlobalContext();

  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalSales: 0,
    totalProfit: 0,
    revenueGrowth: 0,
    salesGrowth: 0,
    profitGrowth: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    guestOrders: 0,
    deliveredOrders: 0,
    pendingDeliveries: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');

  const [allOrders, setAllOrders] = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const [ordersPage, setOrdersPage] = useState(1);
  const [guestPage, setGuestPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [soldPage, setSoldPage] = useState(1);

  const [deliveryLoading, setDeliveryLoading] = useState({});
  const [alert, setAlert] = useState(null);
  const [isTransitioning, startTransition] = useTransition();

  const isMountedRef = useRef(false);
  const dataStoreRef = useRef({
    adminData: null,
    orders: [],
    guestOrders: [],
    products: [],
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 6000);
    return () => clearTimeout(timer);
  }, [alert]);

  const assertSuccess = useCallback((response, fallbackMessage) => {
    if (response && typeof response === 'object' && 'success' in response) {
      if (response.success) {
        return response.data ?? null;
      }
      throw new Error(response.message || fallbackMessage);
    }
    return response ?? null;
  }, []);

  const fetchProducts = useCallback(async () => {
    const response = await callSummaryApi(SummaryApi.getProduct, {
      payload: { page: 1, limit: 5000 },
    });
    return assertSuccess(response, 'Failed to fetch products') ?? [];
  }, [assertSuccess]);

  const fetchOrders = useCallback(async () => {
    const response = await callSummaryApi(SummaryApi.adminOrders, {
      credentials: 'include',
    });
    return assertSuccess(response, 'Failed to fetch admin orders') ?? [];
  }, [assertSuccess]);

  const fetchGuestOrders = useCallback(async () => {
    const response = await callSummaryApi(SummaryApi.getGuestOrders, {
      credentials: 'include',
    });
    return assertSuccess(response, 'Failed to fetch guest orders') ?? [];
  }, [assertSuccess]);

  const fetchAdminDashboard = useCallback(async () => {
    const response = await apiFetch('/api/admin/dashboard', {
      credentials: 'include',
    });
    return assertSuccess(response, 'Failed to fetch admin dashboard') ?? null;
  }, [assertSuccess]);

  const normalizeOrdersArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.orders)) return value.orders;
    return [];
  };

  const normalizeProductsArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (Array.isArray(value.data)) return value.data;
    return [];
  };

  const applyDashboardState = useCallback(
    ({ adminData, orders, guestOrders: guestOrderList, products }) => {
      dataStoreRef.current = {
        ...dataStoreRef.current,
        ...(adminData !== undefined ? { adminData } : {}),
        ...(orders !== undefined ? { orders } : {}),
        ...(guestOrderList !== undefined ? { guestOrders: guestOrderList } : {}),
        ...(products !== undefined ? { products } : {}),
      };

      const snapshot = dataStoreRef.current;

      const baseOrders = normalizeOrdersArray(snapshot.orders);
      const guestOnlyOrders = normalizeOrdersArray(snapshot.guestOrders);
      const normalizedProducts = normalizeProductsArray(snapshot.products);

      const combinedOrders = dedupeOrders([...baseOrders, ...guestOnlyOrders]).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const combinedGuestOrders = combinedOrders.filter((order) => Boolean(order.is_guest));

      const orderPoints = ordersToRevenuePoints(combinedOrders);
      const nextRevenueData = bucketizeByRange(orderPoints, 'monthly');
      const nextSalesData = salesSeriesFromOrders(combinedOrders, 'monthly');
      const nextCategoryDistribution = categoryDistributionFromProducts(normalizedProducts);
      const nextRecentOrders = buildRecentOrders(combinedOrders);
      const nextTopProducts = computeTopProducts(combinedOrders);
      const nextStats = computeStats({
        adminData: snapshot.adminData,
        orders: combinedOrders,
        products: normalizedProducts,
      });

      startTransition(() => {
        setAllProducts(normalizedProducts);
        setAllOrders(combinedOrders);
        setGuestOrders(combinedGuestOrders);
        setCategoryDistribution(nextCategoryDistribution);
        setRecentOrders(nextRecentOrders);
        setTopProducts(nextTopProducts);
        setStats(nextStats);
        setRevenueData(nextRevenueData);
        setSalesData(nextSalesData);
      });
    },
    [startTransition]
  );

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);

      try {
        const [adminData, orders] = await Promise.all([
          fetchAdminDashboard(),
          fetchOrders(),
        ]);

        if (!isMountedRef.current) return;

        applyDashboardState({ adminData, orders });

        if (!silent && isMountedRef.current) {
          setLoading(false);
        }

        if (!isMountedRef.current) return;

        setBackgroundLoading(true);

        const [productsResult, guestResult] = await Promise.allSettled([
          fetchProducts(),
          fetchGuestOrders(),
        ]);

        if (!isMountedRef.current) return;

        const resolvedProducts =
          productsResult.status === 'fulfilled' ? productsResult.value : [];
        const resolvedGuestOrders =
          guestResult.status === 'fulfilled' ? guestResult.value : [];

        applyDashboardState({
          products: resolvedProducts,
          guestOrders: resolvedGuestOrders,
        });
      } catch (error) {
        console.error('Dashboard load error', error);
        if (!silent && isMountedRef.current) {
          setAlert({
            type: 'error',
            text:
              error?.message ||
              'Unable to refresh dashboard data. Please retry shortly.',
          });
        }
      } finally {
        if (!silent && isMountedRef.current) {
          setLoading(false);
        }
        if (isMountedRef.current) {
          setBackgroundLoading(false);
        }
      }
    },
    [
      applyDashboardState,
      fetchAdminDashboard,
      fetchGuestOrders,
      fetchOrders,
      fetchProducts,
    ]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    setOrdersPage(1);
    setGuestPage(1);
    setProductsPage(1);
    setSoldPage(1);
  }, [deferredQuery, activeTab]);

  const applySearch = useCallback(
    (items, keys) => {
      const searchValue = deferredQuery?.trim().toLowerCase();
      if (!searchValue) return items;
      return items.filter((item) =>
        keys.some((key) =>
          String(item[key] ?? '')
            .toLowerCase()
            .includes(searchValue)
        )
      );
    },
    [deferredQuery]
  );

  const paginate = useCallback((items, page) => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, []);

  const ordersForList = useMemo(() => {
    const normalized = (allOrders || []).map(mapOrderForList);
    const filtered = applySearch(normalized, [
      'id',
      'contactName',
      'email',
      'status',
      'fulfillmentStatus',
      'paymentMethod',
    ]);
    return { total: filtered.length, items: paginate(filtered, ordersPage) };
  }, [allOrders, applySearch, paginate, ordersPage]);

  const guestOrdersForList = useMemo(() => {
    const normalized = (guestOrders || []).map(mapOrderForList);
    const filtered = applySearch(normalized, [
      'id',
      'contactName',
      'email',
      'status',
      'fulfillmentStatus',
      'paymentMethod',
    ]);
    return { total: filtered.length, items: paginate(filtered, guestPage) };
  }, [guestOrders, applySearch, paginate, guestPage]);

  const productsForList = useMemo(() => {
    const normalized = (allProducts || [])
      .map((product) => ({
        id: product._id || product.id,
        name: product.name || product.productName || 'Product',
        sku: product.sku || '',
        price: safeNumber(product.price || product.sellingPrice || 0),
        stock: safeNumber(product.stock || product.quantity || 0),
        category: Array.isArray(product.category)
          ? product.category[0]?.name || ''
          : product.category?.name || product.category || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const filtered = applySearch(normalized, ['name', 'sku', 'category']);
    return { total: filtered.length, items: paginate(filtered, productsPage) };
  }, [allProducts, applySearch, paginate, productsPage]);

  const productsSold = useMemo(() => {
    const map = new Map();
    for (const order of allOrders) {
      const items = Array.isArray(order.products) ? order.products : [];
      for (const entry of items) {
        const id =
          entry.productId ||
          entry.product_details?._id ||
          entry.product_details?.name ||
          Math.random().toString(36).slice(2);
        const name = entry.product_details?.name || 'Product';
        const qty = safeNumber(entry.quantity || 1);
        const price = safeNumber(entry.price || entry.product_details?.price || 0);

        const previous = map.get(id) || {
          id,
          name,
          quantity: 0,
          revenue: 0,
          dates: [],
        };

        previous.quantity += qty;
        previous.revenue += qty * price;
        previous.dates.push(new Date(order.createdAt));
        map.set(id, previous);
      }
    }

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgPrice: item.quantity ? item.revenue / item.quantity : 0,
        firstSold: item.dates.length
          ? new Date(Math.min(...item.dates.map((d) => d.getTime())))
          : null,
        lastSold: item.dates.length
          ? new Date(Math.max(...item.dates.map((d) => d.getTime())))
          : null,
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [allOrders]);

  const soldForList = useMemo(() => {
    const filtered = applySearch(productsSold, ['name']);
    return { total: filtered.length, items: paginate(filtered, soldPage) };
  }, [productsSold, applySearch, paginate, soldPage]);

  const goTab = useCallback((tab) => setActiveTab(tab), []);

  const handleConfirmDelivery = useCallback(
    async (orderId) => {
      if (!orderId) return;

      setDeliveryLoading((prev) => ({ ...prev, [orderId]: true }));

      try {
        const response = await callSummaryApi(
          SummaryApi.markOrderDelivered(orderId),
          {
            payload: {
              note: 'Delivery confirmed via admin dashboard',
            },
            credentials: 'include',
          }
        );
        const updated = assertSuccess(response, 'Unable to mark order as delivered');
        if (updated) {
          setAlert({
            type: 'success',
            text: `Order ${orderId} marked as delivered.`,
          });
          await loadDashboard({ silent: true });
        }
      } catch (error) {
        console.error('Failed to confirm delivery', error);
        setAlert({
          type: 'error',
          text:
            error?.message ||
            'Unable to mark the order as delivered. Please retry.',
        });
      } finally {
        setDeliveryLoading((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
      }
    },
    [assertSuccess, loadDashboard]
  );

  const isBusy = loading || backgroundLoading || isTransitioning;

  const Header = (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.name || 'Admin'}
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(new Date(), 'EEEE, MMM dd, yyyy')}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(new Date(), 'HH:mm')}
          </Badge>
          {(backgroundLoading || isTransitioning) && (
            <Badge variant="outline" className="gap-1 text-emerald-600 border-emerald-200 bg-emerald-50">
              <Loader2 className="h-3 w-3 animate-spin" />
              Syncing in background
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="relative flex-1 lg:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search orders, products, customers..."
            className="pl-9 w-full lg:w-72 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <Button
          onClick={() => loadDashboard({ silent: false })}
          className="gap-2 border border-primary bg-transparent text-primary hover:bg-primary/10"
          variant="outline"
          disabled={isBusy}
        >
          <RefreshCw className={`h-4 w-4 ${isBusy ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={() => window.print()}
          className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
        >
          <BarChart3 className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );

  const Tabs = (
    <div className="flex flex-wrap gap-2 mb-6">
      {[
        { key: 'overview', label: 'Overview', icon: TrendingUp },
        { key: 'orders', label: 'Orders', icon: ShoppingCart },
        { key: 'guest', label: 'Guest Orders', icon: Globe },
        { key: 'products', label: 'Products', icon: Package },
        { key: 'sold', label: 'Sold Products', icon: Crown },
        { key: 'customers', label: 'Users', icon: Users },
      ].map((tab) => (
        <Button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          variant={activeTab === tab.key ? 'default' : 'outline'}
          className={`gap-2 ${
            activeTab === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  );

  const buildPaginationFooter = ({
    total,
    page,
    setPage,
  }) => {
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const end = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

    return (
      <>
        <div className="text-xs text-muted-foreground">
          {total === 0 ? (
            'No records to display'
          ) : (
            <>
              Showing {start}-{end} of {total}
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => (prev >= totalPages ? prev : prev + 1))
            }
            disabled={page >= totalPages}
            className="border-primary text-primary hover:bg-primary/10"
          >
            Next
          </Button>
        </div>
      </>
    );
  };

  const OrdersTableCard = ({
    dataset,
    title,
    description,
    emptyMessage,
    page,
    setPage,
  }) => {
    return (
      <Card className="hover:shadow-lg transition">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {dataset.items.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <div className="min-w-[1050px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-3 px-3">Order</th>
                    <th className="text-left py-3 px-3">Customer</th>
                    <th className="text-left py-3 px-3">Contact</th>
                    <th className="text-left py-3 px-3">Address</th>
                    <th className="text-left py-3 px-3">Items</th>
                    <th className="text-left py-3 px-3">Amount</th>
                    <th className="text-left py-3 px-3">Payment</th>
                    <th className="text-left py-3 px-3">Fulfillment</th>
                    <th className="text-left py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.items.map((order) => {
                    const isDelivered =
                      order.fulfillmentStatus?.toLowerCase() === 'delivered';
                    return (
                      <tr
                        key={order.id}
                        className={`border-b hover:bg-accent/30 ${
                          order.isGuest
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/30'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono text-xs text-primary font-semibold">
                          <div className="flex flex-col gap-1">
                            <span className="break-all">#{order.id}</span>
                            {order.isGuest ? (
                              <Badge
                                variant="outline"
                                className="w-fit gap-1 bg-emerald-100 text-emerald-700 border-emerald-200"
                              >
                                <Globe className="h-3 w-3" />
                                Guest
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium">{order.contactName}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-1">
                            {order.email && (
                              <span className="inline-flex items-center gap-1 break-all">
                                <Mail className="h-3.5 w-3.5" /> {order.email}
                              </span>
                            )}
                            {order.mobile && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {order.mobile}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="max-w-[260px] text-xs text-muted-foreground">
                            {[
                              order.address?.address_line,
                              order.address?.city,
                              order.address?.state,
                              order.address?.country,
                              order.address?.pincode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline">{order.itemCount} items</Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-emerald-600">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            className={getPaymentBadgeClass(order.status)}
                            variant="outline"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-col gap-2">
                            <Badge
                              className={getFulfillmentBadgeClass(
                                order.fulfillmentStatus
                              )}
                              variant="outline"
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                            {order.deliveredAt ? (
                              <span className="text-[11px] text-muted-foreground">
                                Delivered{' '}
                                {formatDate(order.deliveredAt, 'MMM dd, yyyy')}
                              </span>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="justify-start gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                disabled={
                                  isDelivered || Boolean(deliveryLoading[order.id])
                                }
                                onClick={() => handleConfirmDelivery(order.id)}
                              >
                                {deliveryLoading[order.id] ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Confirm delivery
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-xs text-muted-foreground">
                            {order.createdAt
                              ? formatDate(order.createdAt, 'MMM dd, yyyy HH:mm')
                              : ''}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          {buildPaginationFooter({ total: dataset.total, page, setPage })}
        </CardFooter>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {Header}
      {alert ? (
        <div
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
            alert.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="font-medium">{alert.text}</span>
        </div>
      ) : null}
      {Tabs}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card
              onClick={() => goTab('products')}
              className="cursor-pointer hover:shadow-lg transition focus-within:ring-2 focus-within:ring-primary"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Products
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-3xl font-bold">
                  {stats.totalProducts.toLocaleString()}
                </div>
                <Package className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>

            <Card
              onClick={() => goTab('customers')}
              className="cursor-pointer hover:shadow-lg transition focus-within:ring-2 focus-within:ring-primary"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify_between">
                <div className="text-3xl font-bold">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <Users className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>

            <Card
              onClick={() => goTab('orders')}
              className="cursor-pointer hover:shadow-lg transition focus-within:ring-2 focus-within:ring-primary"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-end justify-between">
                  <div className="text-3xl font-bold">
                    {stats.totalOrders.toLocaleString()}
                  </div>
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-emerald-500" />
                  Guest orders: {stats.guestOrders.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3" />
                    {stats.revenueGrowth}% vs prev
                  </div>
                </div>
                <DollarSign className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Delivered Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-3xl font-bold text-emerald-600">
                  {stats.deliveredOrders.toLocaleString()}
                </div>
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div className="text-3xl font-bold text-amber-600">
                  {stats.pendingDeliveries.toLocaleString()}
                </div>
                <Clock className="h-6 w-6 text-amber-500" />
              </CardContent>
            </Card>
          </div>

          <RevenueAreaInteractive
            series={revenueData}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Sales Channels</CardTitle>
                <CardDescription>Online vs Cash on Delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<PrettyTooltip currencyMode />} />
                      <Bar
                        dataKey="online"
                        name="Online"
                        fill="#6366F1"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="inStore"
                        name="Cash on Delivery"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Inventory distribution</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryDistribution.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PrettyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition focus-within:ring-2 focus-within:ring-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg md:text-xl">Recent Orders</CardTitle>
                    <CardDescription>Latest purchases with details</CardDescription>
                  </div>
                  <Button
                    onClick={() => goTab('orders')}
                    className="bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[560px] overflow-auto pr-1">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition focus-within:ring-2 focus-within:ring-primary"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                      <div className="xl:col-span-7 2xl:col-span-8 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="font-mono break-all">
                              #{order.id}
                            </span>
                          </span>
                          {order.isGuest ? (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="inline-flex items-center gap-1 text-emerald-600">
                                <Globe className="h-3.5 w-3.5" />
                                Guest Order
                              </span>
                            </>
                          ) : null}
                          <span className="hidden sm:inline">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.date, 'MMM dd, yyyy HH:mm')}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span className="inline-flex items-center gap-1">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {order.itemsCount} items
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="font-semibold text-sm sm:text-base truncate">
                            {order.contact.name}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {order.contact.email ? (
                              <span className="inline-flex items-center gap-1 break-all">
                                <Mail className="h-3.5 w-3.5" /> {order.contact.email}
                              </span>
                            ) : null}
                            {order.contact.mobile ? (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" /> {order.contact.mobile}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {order.address && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-start gap-1">
                              <MapPin className="h-3.5 w-3.5 mt-[1px] shrink-0 text-rose-500" />
                              <span className="line-clamp-2 break-words">
                                {[
                                  order.address.address_line,
                                  order.address.city,
                                  order.address.state,
                                  order.address.country,
                                  order.address.pincode,
                                ]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="xl:col-span-5 2xl:col-span-4 flex xl:flex-col items-end xl:items-end justify-between gap-2">
                        <div className="text-right">
                          <div className="text-base sm:text-lg font-extrabold text-emerald-600">
                            {formatCurrency(order.amount)}
                          </div>
                          <div className="flex flex-wrap justify-end gap-2 mt-2">
                            <Badge
                              className={getPaymentBadgeClass(order.status)}
                              variant="outline"
                            >
                              {order.status}
                            </Badge>
                            <Badge
                              className={getFulfillmentBadgeClass(
                                order.fulfillmentStatus
                              )}
                              variant="outline"
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                          </div>
                          {order.deliveredAt ? (
                            <div className="text-[11px] text-muted-foreground mt-1">
                              Delivered{' '}
                              {formatDate(order.deliveredAt, 'MMM dd, yyyy')}
                            </div>
                          ) : null}
                        </div>

                        <Button
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                          size="sm"
                          onClick={() => goTab('orders')}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-3">
                <Button
                  variant="outline"
                  className="w-full justify-center border-primary text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => goTab('orders')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View all orders
                </Button>
              </CardFooter>
            </Card>

            <Card className="hover:shadow-lg transition">
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Highest revenue items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/30 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {product.rank}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.sales} units
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">
                          {formatCurrency(product.revenue)}
                        </div>
                        <div className="text-xs text-emerald-600 flex items-center justify-end gap-1">
                          <ArrowUpRight className="h-3 w-3" /> {product.growth}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <OrdersTableCard
          dataset={ordersForList}
          title="All Orders"
          description="Full list with customer, address, payment and fulfillment details"
          emptyMessage={
            deferredQuery
              ? 'No orders match your search.'
              : 'No orders have been placed yet.'
          }
          page={ordersPage}
          setPage={setOrdersPage}
        />
      )}

      {activeTab === 'guest' && (
        <OrdersTableCard
          dataset={guestOrdersForList}
          title="Guest Orders"
          description="Orders placed without customer accounts"
          emptyMessage={
            deferredQuery
              ? 'No guest orders match your search.'
              : 'No guest orders have been placed yet.'
          }
          page={guestPage}
          setPage={setGuestPage}
        />
      )}

      {activeTab === 'products' && (
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>All Products</CardTitle>
            <CardDescription>Complete product catalog since day one</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-3 px-3">Product</th>
                    <th className="text-left py-3 px-3">SKU</th>
                    <th className="text-left py-3 px-3">Category</th>
                    <th className="text-left py-3 px-3">Price</th>
                    <th className="text-left py-3 px-3">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {productsForList.items.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-accent/30">
                      <td className="py-3 px-3 font-medium">{product.name}</td>
                      <td className="py-3 px-3 font-mono text-xs">
                        {product.sku || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{product.category || '—'}</Badge>
                      </td>
                      <td className="py-3 px-3 font-semibold">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge
                          variant={
                            product.stock > 10
                              ? 'default'
                              : product.stock > 0
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {product.stock} units
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            {buildPaginationFooter({
              total: productsForList.total,
              page: productsPage,
              setPage: setProductsPage,
            })}
          </CardFooter>
        </Card>
      )}

      {activeTab === 'sold' && (
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>All Sold Products</CardTitle>
            <CardDescription>
              Units, average price, revenue, and dates
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-[900px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-3 px-3">Product</th>
                    <th className="text-left py-3 px-3">Units Sold</th>
                    <th className="text-left py-3 px-3">Avg Price</th>
                    <th className="text-left py-3 px-3">Revenue</th>
                    <th className="text-left py-3 px-3">First Sold</th>
                    <th className="text-left py-3 px-3">Last Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {soldForList.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-accent/30">
                      <td className="py-3 px-3 font-medium">{item.name}</td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{item.quantity}</Badge>
                      </td>
                      <td className="py-3 px-3">{formatCurrency(item.avgPrice)}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-600">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="py-3 px-3">
                        {item.firstSold ? formatDate(item.firstSold, 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="py-3 px-3">
                        {item.lastSold ? formatDate(item.lastSold, 'MMM dd, yyyy') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            {buildPaginationFooter({
              total: soldForList.total,
              page: soldPage,
              setPage: setSoldPage,
            })}
          </CardFooter>
        </Card>
      )}

      {activeTab === 'customers' && (
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>
              Unique customers derived from orders or admin stats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Ensure your admin endpoint provides total users for exact counts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;