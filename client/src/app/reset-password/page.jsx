"use client";

import React, { Suspense, useEffect, useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import SummaryApi from "@/backend/contracts/summaryApi";
import toast from "react-hot-toast";
import AxiosToastError from "@/lib/axiosToastError";
import Axios from "@/lib/apiClient";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const ResetPasswordForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const valideValue = Object.values(data).every((el) => el);

  const success = searchParams.get("success");
  const emailFromQuery = searchParams.get("email");

  useEffect(() => {
    if (success !== "1" || !emailFromQuery) {
      router.replace("/");
    } else {
      setData((prev) => ({
        ...prev,
        email: emailFromQuery,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, emailFromQuery, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (data.newPassword !== data.confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        router.push("/login");
        setData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        <p className="font-semibold text-lg">{t("auth.resetTitle")}</p>
        <p className="text-sm text-gray-600 mt-1">{t("auth.resetSubtitle")}</p>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="newPassword">{t("auth.newPassword")}</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="w-full outline-none"
                name="newPassword"
                value={data.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="cursor-pointer"
                aria-label={
                  showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                }
              >
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="confirmPassword">{t("auth.confirmPassword")}</label>
            <div className="bg-blue-50 p-2 border rounded flex items-center focus-within:border-primary-200">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full outline-none"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="cursor-pointer"
                aria-label={
                  showConfirmPassword
                    ? t("auth.hidePassword")
                    : t("auth.showPassword")
                }
              >
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!valideValue}
            className={`${
              valideValue
                ? "bg-pink-400 hover:bg-yellow-400"
                : "bg-gray-500"
            } text-white py-2 rounded font-semibold my-3 tracking-wide`}
          >
            {t("auth.resetSubmit")}
          </button>
        </form>

        <p>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-green-700 hover:text-yellow-400"
          >
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </section>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
