"use client"
import React, { useState } from 'react';
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6";
import toast from 'react-hot-toast';
import Axios from '../../../utils/Axios';
import SummaryApi from '../../../common/SummaryApi';
import AxiosToastError from '../../../utils/AxiosToastError';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// import bannerMobile from "/public/assets/NYX-PMU-Makeup-Face-TOTAL-CONTROL-PRO-DROP-FOUNDATION-Foundation-Golden-TCPDF13-000-0800897206956-Open.jpg";

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const validValue = Object.values(data).every(el => el);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setIsLoading(true);

        if(data.password !== data.confirmPassword){
            toast.error("Password and confirm password must be same");
            setIsLoading(false);
            return;
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: data
            });
            
            if(response.data.error){
                toast.error(response.data.message);
            }

            if(response.data.success){
                toast.success(response.data.message);
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                });
                router.push("/login");
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 px-2">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm rounded-2xl shadow-lg bg-white border border-gray-200 p-6 flex flex-col items-center"
            >
                <img
                    src="/assets/NYX-PMU-Makeup-Face-TOTAL-CONTROL-PRO-DROP-FOUNDATION-Foundation-Golden-TCPDF13-000-0800897206956-Open.jpg"
                    alt="Makeup Banner"
                    className="w-20 h-20 object-cover rounded-full mb-3 border-4 border-pink-200 shadow"
                    loading="lazy"
                />
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
                <p className="text-sm text-gray-500 mb-6">Welcome to <span className="text-pink-500 font-semibold">EssentialistMakeupStore</span></p>

                <form className="w-full space-y-4" onSubmit={handleSubmit} autoComplete="off">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            placeholder="Jane Doe"
                            className="w-full px-3 py-2 border-2 border-gray-400 text-gray-700 text-base rounded-lg focus:border-pink-500 focus:outline-none placeholder-gray-400 font-medium transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={data.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 border-2 border-gray-400 text-gray-700 text-base rounded-lg focus:border-pink-500 focus:outline-none placeholder-gray-400 font-medium transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border-2 border-gray-400 text-gray-700 text-base rounded-lg focus:border-pink-500 focus:outline-none placeholder-gray-400 font-medium transition pr-10"
                            />
                            <button 
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-500"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border-2 border-gray-400 text-gray-700 text-base rounded-lg focus:border-pink-500 focus:outline-none placeholder-gray-400 font-medium transition pr-10"
                            />
                            <button 
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pink-500"
                                aria-label="Toggle confirm password visibility"
                            >
                                {showConfirmPassword ? <FaRegEye size={18} /> : <FaRegEyeSlash size={18} />}
                            </button>
                        </div>
                    </div>
                    <motion.button
                        whileHover={validValue && !isLoading ? { scale: 1.015 } : {}}
                        whileTap={validValue && !isLoading ? { scale: 0.98 } : {}}
                        type="submit"
                        disabled={!validValue || isLoading}
                        className={`w-full py-2.5 rounded-lg font-bold text-base transition-all duration-200 shadow-sm ${
                            validValue && !isLoading
                                ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                                : "bg-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : 'Sign Up'}
                    </motion.button>
                </form>

                <p className="mt-5 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-pink-500 hover:text-pink-600 transition">
                        Sign in
                    </Link>
                </p>
            </motion.div>
        </section>
    );
};

export default Register;