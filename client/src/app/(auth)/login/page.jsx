"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from "react-hot-toast";
import SummaryApi from "@/backend/contracts/summaryApi";
import AxiosToastError from "@/lib/axiosToastError";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import fetchUserDetails from "@/utils/fetchUserDetails";
import { useDispatch } from "react-redux";
import { setUserDetails } from "@/store/userSlice";
import { motion } from "framer-motion";
import Image from "next/image";
import Axios from "@/lib/apiClient";
import {
  AUTH_PROVIDER,
  getLastAuthProvider,
  setLastAuthProvider,
} from "@/utils/lastAuthPreference";

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

function GoogleMark({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const Login = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAuthMethod, setLastAuthMethod] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    setLastAuthMethod(getLastAuthProvider());
  }, []);

  useEffect(() => {
    const param = searchParams.get("lastAuth");
    if (param !== AUTH_PROVIDER.GOOGLE && param !== AUTH_PROVIDER.EMAIL) return;
    setLastAuthProvider(param);
    setLastAuthMethod(param);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lastAuth");
    const qs = params.toString();
    router.replace(qs ? `/login?${qs}` : "/login", { scroll: false });
  }, [searchParams, router]);

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
        setLastAuthProvider(AUTH_PROVIDER.EMAIL);
        setLastAuthMethod(AUTH_PROVIDER.EMAIL);

        const tokens = response.data?.data ?? {};
        const mergedGuestOrders = tokens.mergedGuestOrders ?? [];

        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshToken");
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
        const redirectTo =
          searchParams.get("redirect")?.trim() ||
          searchParams.get("from")?.trim() ||
          "/";
        router.push(redirectTo.startsWith("/") ? redirectTo : "/");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    const startUrl = process.env.NEXT_PUBLIC_GOOGLE_SIGNIN_URL?.trim();
    if (!startUrl) {
      toast(t("auth.googleNotConfigured"), { icon: "ℹ️" });
      return;
    }
    window.location.assign(startUrl);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-2 md:p-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden rounded-3xl shadow-2xl bg-white">
        <div className="relative h-40 md:h-auto md:w-1/2 bg-pink-400">
          <Image
            src="/assets/staymattebutnotflatpowderfoundationmain.jpg"
            alt=""
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
              {t("auth.welcomeBack")}
            </h1>
            <p className="text-black">{t("auth.signInSubtitle")}</p>
          </div>

          <div className="relative w-full mb-2">
            {lastAuthMethod === AUTH_PROVIDER.GOOGLE && (
              <span className="pointer-events-none absolute -top-2 right-3 z-10 rounded-full border border-zinc-600 bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                {t("auth.lastUsed")}
              </span>
            )}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-600/80 bg-zinc-800 py-3 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <GoogleMark className="h-5 w-5 shrink-0" />
              {t("auth.continueGoogle")}
            </button>
          </div>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 font-medium uppercase tracking-wide text-gray-500">
                {t("auth.orWithEmail")}
              </span>
            </div>
          </div>

          <form className="space-y-7" onSubmit={handleSubmit} autoComplete="on">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("auth.emailAddress")}
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-gray-50 transition-all"
                name="email"
                value={data.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-black"
                >
                  {t("auth.password")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-pink-500 hover:text-pink-600 font-medium transition-colors"
                >
                  {t("auth.forgotPassword")}
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
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
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
                  {t("auth.signingIn")}
                </span>
              ) : (
                t("auth.signIn")
              )}
            </motion.button>
          </form>

          <p className="mt-7 text-center text-sm text-black">
            {t("auth.noAccount")}{" "}
            <Link
              href="/register"
              className="font-semibold text-pink-500 hover:text-pink-600 transition-colors"
            >
              {t("auth.createAccount")}
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