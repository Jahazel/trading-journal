import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/api";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { setAuth } = useAuth();

  const onSubmit = async (userData) => {
    try {
      const data = await signup(userData);

      setAuth({ token: data.token, username: data.username });

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
    }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="John"
                {...register("username", {
                  required: "Username is required.",
                })}
              />
              {errors.username && <span>{errors.username.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address.",
                  },
                })}
              />
              {errors.email && <span>{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters.",
                  },
                })}
              />
              {errors.password && <span>{errors.password.message}</span>}
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="auth-btn">
              Create Account
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
