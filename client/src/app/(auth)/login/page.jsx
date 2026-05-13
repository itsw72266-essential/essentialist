"use client";

import React, { useState, Suspense } from "react"; // Added Suspense import
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import SummaryApi from "./../../../common/SummaryApi";
import AxiosToastError from "./../../../utils/AxiosToastError";
import Link from "next/link";
import { useRouter } from "next/navigation";
import fetchUserDetails from "./../../../utils/fetchUserDetails";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./../../../store/userSlice";
import { motion } from "framer-motion";
import Image from "next/image";
import Axios from "./../../../utils/Axios";

const GUEST_ORDER_STORAGE_KEY = "guestOrderHistory";

const isBrowser = typeof window !== "undefined";

function readGuestOrderHistorySafe() {
  if (!isBrowser) return [];
  try {
    const raw = window.localStorage.getItem(GUEST_ORDER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Unable to parse guestOrderHistory", error);
    return [];
  }
}

function buildGuestOrderSyncPayload() {
  const history = readGuestOrderHistorySafe();
  const seen = new Set();
  const payload = [];

  history.forEach((entry) => {
    if (!entry?.orderId || !entry?.integrityToken) return;
    if (seen.has(entry.orderId)) return;
    seen.add(entry.orderId);
    payload.push({
      orderId: entry.orderId,
      integrityToken: entry.integrityToken,
    });
  });

  return payload;
}

function pruneSyncedGuestOrders(orderIds = []) {
  if (!isBrowser || !Array.isArray(orderIds) || !orderIds.length) return;
  const idSet = new Set(orderIds);
  const history = readGuestOrderHistorySafe();
  const filtered = history.filter((entry) => !idSet.has(entry?.orderId));
  window.localStorage.setItem(
    GUEST_ORDER_STORAGE_KEY,
    JSON.stringify(filtered)
  );
  window.dispatchEvent(
    new CustomEvent("guestOrderHistoryUpdated", { detail: filtered })
  );
}

const Login = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const guestOrdersPayload = buildGuestOrderSyncPayload();

    try {
      const response = await Axios({
        ...SummaryApi.login,
        data: {
          ...data,
          guestOrders: guestOrdersPayload,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);

        const tokens = response.data?.data ?? {};
        const mergedGuestOrders = tokens.mergedGuestOrders ?? [];

        if (tokens.accessToken) {
          localStorage.setItem("accessToken", tokens.accessToken);
          localStorage.setItem("accesstoken", tokens.accessToken);
        }
        if (tokens.refreshToken) {
          localStorage.setItem("refreshToken", tokens.refreshToken);
        }
        if (mergedGuestOrders.length) {
          pruneSyncedGuestOrders(mergedGuestOrders);
        }

        const userDetails = await fetchUserDetails();
        dispatch(setUserDetails(userDetails.data));

        setData({
          email: "",
          password: "",
        });
        router.push("/");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-2 md:p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-2xl bg-white">
        <div className="relative h-40 md:h-auto md:w-1/2 bg-pink-400">
          <Image
            src="/assets/staymattebutnotflatpowderfoundationmain.jpg"
            alt="Cosmetics sale banner"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ zIndex: 1 }}
          />
          <div className="absolute inset-0 bg-pink-100 bg-opacity-10" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-10 md:p-12"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-black">
              Sign in to continue your beauty experience
            </p>
          </div>

          <form className="space-y-7" onSubmit={handleSubmit} autoComplete="on">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-gray-50 transition-all"
                name="email"
                value={data.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-black"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full p-3 border focus:text-black text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-gray-50 pr-12 transition-all"
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <FaRegEye size={20} /> : <FaRegEyeSlash size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: validValue && !isLoading ? 1.02 : 1 }}
              whileTap={{ scale: validValue && !isLoading ? 0.98 : 1 }}
              disabled={!validValue || isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 text-base shadow-md
                ${
                  validValue && !isLoading
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-sm text-black">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-pink-500 hover:text-pink-600 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Wrap the export in Suspense to satisfy Next.js build constraints
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}