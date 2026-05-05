import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/api";
import { useState } from "react";
import { SignupData } from "../types/auth.types";
import { AxiosError } from "axios";

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupData>({ mode: "onTouched" });

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (userData: SignupData): Promise<void> => {
    try {
      await signup(userData);

      navigate("/login");
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message || "Signup failed. Please try again.",
        );
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-alt">
      <div className="bg-surface p-10 rounded-xl shadow-ambient w-full max-w-[420px] border border-border">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink-primary">
            Create Account
          </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-ink-secondary mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="John"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink-primary outline-none transition-colors focus:border-sage"
              {...register("username", {
                required: "Username is required.",
              })}
            />
            {errors.username && (
              <span className="block text-xs text-red-500 mt-1">
                {errors.username.message}
              </span>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-ink-secondary mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink-primary outline-none transition-colors focus:border-sage"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address.",
                },
              })}
            />
            {errors.email && (
              <span className="block text-xs text-red-500 mt-1">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-ink-secondary mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-ink-primary outline-none transition-colors focus:border-sage"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
              })}
            />
            {errors.password && (
              <span className="block text-xs text-red-500 mt-1">
                {errors.password.message}
              </span>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 bg-sage text-surface rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-sage-hover mt-2"
          >
            Create Account
          </button>
        </form>
        <p className="text-center mt-5 text-sm text-ink-secondary">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-sage font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
