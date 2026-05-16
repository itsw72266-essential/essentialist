"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Axios from "@/lib/apiClient";
import SummaryApi from "@/backend/contracts/summaryApi";
import AxiosToastError from "@/lib/axiosToastError";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const OtpVerificationForm = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRef = useRef([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/forgot-password");
    }
  }, [email, router]);

  const valideValue = data.every((el) => el);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await Axios({
        ...SummaryApi.forgot_password_otp_verification,
        data: {
          otp: data.join(""),
          email,
        },
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&success=1`
        );
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || isResending) return;
    setIsResending(true);
    try {
      const response = await Axios({
        ...SummaryApi.forgot_password,
        data: { email },
      });

      if (response.data.error) {
        toast.error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setData(["", "", "", "", "", ""]);
        inputRef.current[0]?.focus();
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="w-full container mx-auto px-2">
      <div className="bg-white my-4 w-full max-w-lg mx-auto rounded p-7">
        <p className="font-semibold text-lg">{t("auth.otpTitle")}</p>
        <p className="text-sm text-gray-600 mt-1">{t("auth.otpSubtitle")}</p>
        <form className="grid gap-4 py-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <div className="flex items-center gap-2 justify-between mt-3">
              {data.map((element, index) => (
                <input
                  key={"otp" + index}
                  type="text"
                  id={index === 0 ? "otp" : undefined}
                  ref={(ref) => {
                    inputRef.current[index] = ref;
                    return ref;
                  }}
                  value={data[index]}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*$/.test(value)) return;

                    const newData = [...data];
                    newData[index] = value;
                    setData(newData);

                    if (value && index < 5) {
                      inputRef.current[index + 1]?.focus();
                    }
                  }}
                  maxLength={1}
                  className="bg-blue-50 w-full max-w-16 p-2 border rounded outline-none focus:border-primary-200 text-center font-semibold"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!valideValue || isLoading}
            className={`${
              valideValue && !isLoading
                ? "bg-green-800 hover:bg-green-700"
                : "bg-gray-500"
            } text-white py-2 rounded font-semibold my-3 tracking-wide`}
          >
            {isLoading ? t("auth.verifying") : t("auth.verify")}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-semibold text-green-700 hover:text-green-800 disabled:opacity-50"
          >
            {isResending ? t("auth.sending") : t("auth.resendOtp")}
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

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={null}>
      <OtpVerificationForm />
    </Suspense>
  );
};
