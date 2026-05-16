"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Axios from "@/lib/apiClient";
import SummaryApi from "@/backend/contracts/summaryApi";
import AxiosToastError from "@/lib/axiosToastError";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [data, setData] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const valideValue = Object.values(data).every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await Axios({
        ...SummaryApi.forgot_password,
        data: data,
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        router.push(`/verification-otp?email=${encodeURIComponent(data.email)}`);
        setData({ email: "" });
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        <p className="font-semibold text-lg">{t("auth.forgotTitle")}</p>
        <p className="text-sm text-gray-600 mt-1">{t("auth.forgotSubtitle")}</p>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="email">{t("auth.email")}</label>
            <input
              type="email"
              id="email"
              className="bg-blue-50 p-2 border rounded outline-none focus:border-primary-200"
              name="email"
              value={data.email}
              onChange={handleChange}
              placeholder={t("auth.emailPlaceholder")}
            />
          </div>
          <button
            type="submit"
            disabled={!valideValue || isLoading}
            className={`${
              valideValue && !isLoading
                ? "bg-pink-400 hover:bg-yellow-400"
                : "bg-gray-500"
            } text-white py-2 rounded font-semibold my-3 tracking-wide`}
          >
            {isLoading ? t("auth.sending") : t("auth.sendReset")}
          </button>
        </form>
        <p>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            href="/login"
            className="font-semibold text-green-700 hover:text-green-800"
          >
            {t("auth.signInLink")}
          </Link>
        </p>
      </div>
    </section>
  );
};

export default ForgotPassword;
