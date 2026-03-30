import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

function RouteFallback() {
  return (
    <div
      className="min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-8 w-8 animate-pulse rounded-full bg-[#8c6b4a]/20"
        role="status"
        aria-label="Checking session"
      />
    </div>
  );
}

/**
 * Renders children only when authenticated. Redirects to /login when not.
 */
export default function ProtectedRoute({ children }) {
  const { token, authReady } = useApp();
  const location = useLocation();

  if (!authReady) {
    return <RouteFallback />;
  }

  if (!token) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return children;
}
