import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/api";
import { useAuth } from "../contexts/AuthContext";
import { LoginCredentials } from "../types/auth.types";
import { AxiosError } from "axios";
import {
  BrandPanel,
  MobileHeader,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  SpinnerIcon,
} from "../components/AuthLayout";

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2.5 bg-surface border rounded-lg text-sm text-ink-primary placeholder:text-ink-muted outline-none transition-colors duration-150 focus:border-accent ${
    hasError ? "border-pnl-negative" : "border-border"
  }`;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({ mode: "onTouched" });

  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth } = useAuth();

  const onSubmit = async (credentials: LoginCredentials): Promise<void> => {
    setAuthError(null);
    try {
      const data = await login(credentials);
      setAuth({
        token: data.token,
        username: data.username,
        userId: data.userId,
      });
      navigate("/dashboard");
    } catch (error) {
      if (error instanceof AxiosError) {
        setAuthError(
          error.response?.data?.message ?? "Check your credentials and try again.",
        );
      } else {
        setAuthError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <main className="flex-1 flex flex-col">
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center bg-surface-alt px-6 py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-7">
              <h1 className="text-[1.25rem] font-semibold text-ink-primary tracking-[-0.005em] leading-[1.3] mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-ink-muted">
                Sign in to continue to your journal.
              </p>
            </div>

            <div className="bg-surface rounded-xl p-8">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-ink-secondary mb-1.5 tracking-[0.01em]"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    aria-describedby={errors.email ? "email-error" : undefined}
                    aria-invalid={!!errors.email}
                    className={inputClass(!!errors.email)}
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Enter a valid email address.",
                      },
                    })}
                  />
                  {errors.email && (
                    <span
                      id="email-error"
                      role="alert"
                      className="block text-xs text-pnl-negative mt-1.5"
                    >
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-ink-secondary mb-1.5 tracking-[0.01em]"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      aria-invalid={!!errors.password}
                      className={`${inputClass(!!errors.password)} pr-10`}
                      {...register("password", {
                        required: "Password is required.",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters.",
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary transition-colors duration-150 rounded focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-1"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <span
                      id="password-error"
                      role="alert"
                      className="block text-xs text-pnl-negative mt-1.5"
                    >
                      {errors.password.message}
                    </span>
                  )}
                </div>

                {authError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 bg-surface-alt border border-border rounded-lg px-3.5 py-2.5 mb-4 text-ink-secondary"
                  >
                    <AlertCircleIcon />
                    <p className="text-sm leading-[1.5]">{authError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 mt-1 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:pointer-events-none text-surface rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-150 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerIcon />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>
            </div>

            <p className="text-center mt-5 text-sm text-ink-muted">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-accent font-medium hover:underline underline-offset-2 transition-opacity duration-150"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
