import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useApp } from "../context/AppContext";

const Signup = () => {
  const navigate = useNavigate();
  const { authReady } = useApp();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      const u = username.trim();
      const em = email.trim().toLowerCase();
      if (!u) {
        setError("Username is required.");
        return;
      }
      if (!em) {
        setError("Email is required.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email: em,
        password,
        options: {
          data: {
            username: u,
            display_name: u,
          },
        },
      });

      if (signErr) {
        setError(signErr.message || "Signup failed.");
        return;
      }

      if (data.session) {
        navigate("/");
      } else {
        setInfo(
          "Check your email to confirm your account, then sign in here.",
        );
      }
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
        <h1 className="text-2xl font-bold">Create Account</h1>

        <input
          className="w-full rounded border p-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          className="w-full rounded border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          className="w-full rounded border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        {error && <p className="text-red-600">{error}</p>}
        {info && <p className="text-[#5a6b4a]">{info}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-[#8c6b4a] p-3 font-semibold text-white"
        >
          {isSubmitting ? "Creating account…" : "Sign up"}
        </button>

        <p className="text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;
