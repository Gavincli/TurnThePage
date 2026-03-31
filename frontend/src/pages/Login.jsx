import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useApp } from "../context/AppContext";
import MuseumBackground from "../components/MuseumBackground";

const Login = () => {
  const navigate = useNavigate();
  const { authReady } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const raw = username.trim();
      if (!raw || !password) {
        setError("Username and password are required.");
        return;
      }

      const { data: rows, error: lookupErr } = await supabase.rpc(
        "lookup_login_email",
        { p_login: raw },
      );
      if (lookupErr) {
        setError("Could not look up account.");
        return;
      }
      const loginEmail = rows?.[0]?.email;
      if (!loginEmail) {
        setError("Invalid login credentials.");
        return;
      }

      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (signErr) {
        setError("Invalid login credentials.");
        return;
      }

      navigate("/");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-[#8a8178]">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] flex items-center justify-center p-6 overflow-hidden">
      <MuseumBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a8178]">Turn The Page</p>
          <h1 className="mt-2 text-4xl font-serif font-medium tracking-tight text-[#2b2724]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#8a8178]">Sign in to continue reading</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-[2rem] border border-[#eeebe4] bg-white/90 backdrop-blur-md p-8 shadow-[0_20px_60px_rgba(71,63,55,0.1)]"
        >
          <div>
            <label htmlFor="login-username" className="mb-1.5 block text-sm font-bold text-[#6b645d]">
              Username
            </label>
            <input
              id="login-username"
              className="w-full rounded-xl border border-[#dcd7d0] bg-white/70 px-4 py-3 text-[#2b2724] placeholder-[#a09890] outline-none transition focus:border-[#8c6b4a] focus:ring-4 focus:ring-[#8c6b4a]/10"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-bold text-[#6b645d]">
              Password
            </label>
            <input
              id="login-password"
              className="w-full rounded-xl border border-[#dcd7d0] bg-white/70 px-4 py-3 text-[#2b2724] placeholder-[#a09890] outline-none transition focus:border-[#8c6b4a] focus:ring-4 focus:ring-[#8c6b4a]/10"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-[1.4rem] bg-gradient-to-r from-[#8c6b4a] to-[#73583d] py-3.5 font-semibold text-white shadow-lg shadow-[#8c6b4a]/20 transition hover:scale-[1.01] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-[#6b645d]">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-[#8c6b4a] hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
