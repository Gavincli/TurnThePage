import React, { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";

const Home = lazy(() => import("./pages/Home"));
const Goals = lazy(() => import("./pages/Goals"));
const ReadNow = lazy(() => import("./pages/ReadNow"));
const LogReading = lazy(() => import("./pages/LogReading"));
const Shop = lazy(() => import("./pages/Shop"));
const AvatarSelect = lazy(() => import("./pages/AvatarSelect"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));

function PageFallback() {
  return (
    <div
      className="min-h-screen bg-[linear-gradient(to_bottom,_#fefdfb_0%,_#fbf8f2_40%,_#f4ede2_100%)] flex items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-8 w-8 animate-pulse rounded-full bg-[#8c6b4a]/20"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { authReady, userId } = useApp();
  if (!authReady) return <PageFallback />;
  if (!userId) return <Navigate to="/login" replace />;
  return children;
}

function GuestOnlyRoute({ children }) {
  const { authReady, userId } = useApp();
  if (!authReady) return <PageFallback />;
  if (userId) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/read-now"
              element={
                <ProtectedRoute>
                  <ReadNow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/log-reading"
              element={
                <ProtectedRoute>
                  <LogReading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <Shop />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatar"
              element={
                <ProtectedRoute>
                  <AvatarSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestOnlyRoute>
                  <Login />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestOnlyRoute>
                  <Signup />
                </GuestOnlyRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
