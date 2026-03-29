import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useApp } from "../context/AppContext";

const Login = () => {
  const navigate = useNavigate();
  const { authReady } = useApp();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const raw = emailOrUsername.trim();
      if (!raw || !password) {
        setError("Email/username and password are required.");
        return;
      }

      let loginEmail = raw;
      if (!raw.includes("@")) {
        const { data: rows, error: lookupErr } = await supabase.rpc(
          "lookup_login_email",
          { p_login: raw },
        );
        if (lookupErr) {
          setError("Could not look up account.");
          return;
        }
        const found = rows?.[0]?.email;
        if (!found) {
          setError("Invalid login credentials.");
          return;
        }
        loginEmail = found;
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full rounded border p-3"
          placeholder="Email or username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          className="w-full rounded border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-[#8c6b4a] p-3 font-semibold text-white"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-sm">
          Need an account?{" "}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
