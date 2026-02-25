import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useUser } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemPage from "./pages/ProblemPage";
import SessionPage from "./pages/SessionPage";


function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();

  // Show a loading screen instead of unmounting children.
  // Returning null here would destroy all child state (including open modals)
  // whenever Clerk briefly re-checks auth status.
  if (!isLoaded) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#060710",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: "3px solid rgba(99,102,241,0.15)",
            borderTopColor: "#6366f1",
            borderRadius: "50%",
            animation: "protectedSpin .8s linear infinite",
          }}
        />
        <style>{`@keyframes protectedSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

// Redirect already-authenticated users away from the landing page
function PublicRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem/:id" element={<ProblemPage />} />

        <Route
          path="/session/:id"
          element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
