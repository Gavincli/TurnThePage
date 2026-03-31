import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

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
            <Route path="/read-now" element={<ReadNow />} />
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
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <Signup />
                </PublicOnlyRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
