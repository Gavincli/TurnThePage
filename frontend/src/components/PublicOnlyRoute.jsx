import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

/**
 * For /login and /signup: redirect to home when already logged in.
 */
export default function PublicOnlyRoute({ children }) {
  const { token, authReady } = useApp();

  if (!authReady) {
    return (
      <div
        className="min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] flex items-center justify-center"
        aria-busy="true"
      >
        <div className="h-8 w-8 animate-pulse rounded-full bg-[#8c6b4a]/20" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
