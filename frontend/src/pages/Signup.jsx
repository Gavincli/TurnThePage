import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const Signup = () => {
  const navigate = useNavigate();
  const { authReady, loginWithCredentials } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const cleanUsername = username.trim();
      if (!cleanUsername) {
        setError("Username is required.");
        return;
      }
      if (cleanUsername.length < 3 || cleanUsername.length > 50) {
        setError("Username must be 3-50 characters.");
        return;
      }
      if (!password || password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      await loginWithCredentials({
        action: "signup",
        username: cleanUsername,
        password,
      });
      navigate("/");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
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
        <h1 className="text-2xl font-bold">Demo Signup</h1>
        <p className="text-sm text-[#6b645d]">
          Create a unique username and password for demo login.
        </p>

        <input
          className="w-full rounded border p-3"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-[#8c6b4a] p-3 font-semibold text-white"
        >
          {isSubmitting ? "Creating profile…" : "Continue"}
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
