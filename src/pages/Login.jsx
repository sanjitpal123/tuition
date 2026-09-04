import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import api from "../lib/api";
import { useData } from "../context/DataContext";

export default function Login() {
  const navigate = useNavigate();
  const { refreshData } = useData();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isStudentLogin, setIsStudentLogin] = useState(false); // Added student login toggle

  useEffect(() => {
    if (localStorage.getItem("tutorToken")) {
      navigate("/dashboard");
    } else if (localStorage.getItem("studentToken")) {
      navigate("/student/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const email = e.target.email.value.trim();
      const password = e.target.password.value.trim();

      if (isResetMode) {
        // Handle Password Reset
        await api.post("/auth/reset-password", {
          email,
          newPassword: password,
        });
        setSuccess("Password changed successfully! You can now sign in.");
        setIsResetMode(false); // Switch back to login
      } else {
        if (isStudentLogin) {
          // Handle Student Login using studentApi (wait we imported it? I will add import in next step)
          const { studentApi } = await import("../lib/api");
          const { data } = await studentApi.post("/student-auth/login", {
            email,
            password,
          });
          localStorage.setItem("studentToken", data.token);
          localStorage.setItem("studentProfile", JSON.stringify(data));
          navigate("/student/dashboard");
        } else {
          // Handle Tutor Login
          const { data } = await api.post("/auth/login", { email, password });
          localStorage.setItem("tutorToken", data.token);
          localStorage.setItem("tutorProfile", JSON.stringify(data));
          await refreshData();
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isResetMode ? "Failed to reset password" : "Failed to login"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-indigo-950 opacity-90"></div>
        {/* Abstract pattern placeholder */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="relative z-10 p-12 max-w-lg text-center">
          <div className="mb-8 inline-block p-4 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl/50 rounded-2xl border border-red-700/50 shadow-2xl">
            <span className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight block mb-2">
              Setupclass
            </span>
            <span className="text-red-300 font-medium">
              Simple management for smarter tutors.
            </span>
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
            Manage your students.
            <br />
            Focus on teaching.
          </h2>
          <p className="text-red-300 text-lg">
            The all-in-one platform built specifically for individual tutors to
            handle attendance, fees, schedules, and more.
          </p>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="lg:hidden text-center mb-8">
            <span className="text-3xl font-bold text-red-500 tracking-tight">
              Setupclass
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {isResetMode
                ? "Change Password"
                : isStudentLogin
                  ? "Student Login"
                  : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              {isResetMode
                ? "Enter your email and a new password to reset it."
                : "Please enter your details to sign in."}
            </p>
          </div>

          {!isResetMode && (
            <div className="mt-6 flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isStudentLogin ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                onClick={() => setIsStudentLogin(false)}
              >
                Tutor
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isStudentLogin ? "bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                onClick={() => setIsStudentLogin(true)}
              >
                Student
              </button>
            </div>
          )}

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100"
                >
                  {isStudentLogin ? "Email or Phone" : "Email address"}
                </label>
                <div className="mt-2">
                  <Input
                    id="email"
                    name="email"
                    type={isStudentLogin ? "text" : "email"}
                    autoComplete="off"
                    placeholder={isStudentLogin ? "Enter your email or phone" : "Enter your email"}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100"
                >
                  {isResetMode ? "New Password" : "Password"}
                </label>
                <div className="mt-2">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder={isResetMode ? "Enter your new password" : "Enter your password"}
                    required
                  />
                </div>
              </div>

              {!isResetMode && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-red-500 focus:ring-red-600"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-3 block text-sm leading-6 text-zinc-400 dark:text-zinc-500 dark:text-zinc-400"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm leading-6">
                    <button
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="font-semibold text-red-500 hover:text-red-400"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 text-sm text-green-500">
                  {success}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading
                    ? isResetMode
                      ? "Changing..."
                      : "Signing In..."
                    : isResetMode
                      ? "Change Password"
                      : "Sign In"}
                </Button>
              </div>

              {isResetMode && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                  >
                    Wait, I remember my password
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
              New to Setupclass?{" "}
              <button
                onClick={() => navigate("/onboarding")}
                className="font-semibold leading-6 text-red-500 hover:text-red-500"
              >
                Create your tutor account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
