import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import api from "../api/api";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const onSubmit = async (credentials) => {
    try {
      const response = await api.post("/api/auth/login", credentials);

      localStorage.setItem("token", response.data.token);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Login</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <button type="submit" className="auth-btn">
              Sign In
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
