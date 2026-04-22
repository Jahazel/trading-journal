import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/api";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types/auth.types";
import { AxiosError } from "axios";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({ mode: "onTouched" });

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { setAuth } = useAuth();

  const onSubmit = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const data = await login(credentials);

      setAuth({ token: data.token, username: data.username });

      navigate("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(
          error.response?.data?.message ||
            "Login failed. Please check your credentials.",
        );
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-[420px] border border-gray-200">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
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
              className="block text-sm font-medium text-gray-600 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 outline-none transition-colors focus:border-blue-500"
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
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors hover:bg-blue-700 mt-2"
          >
            Sign In
          </button>
        </form>
        <p className="text-center mt-5 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-500 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
