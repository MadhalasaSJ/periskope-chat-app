"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/chats");
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg w-full max-w-md p-8 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome Back 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-300">Please sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-700 dark:text-gray-200">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-right">
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 text-center bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded">
            {errorMsg}
          </div>
        )}

        <div className="text-right">
          <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-60"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
