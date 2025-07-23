import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";

import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Dashboard from "./components/Dashboard";

import { useAuthenticated } from "./store/useAuthenticated";

// Protected Route
const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated } = useAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Authenticated Redirect (nếu đã login thì không cho vào signup/login)
const AuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useAuthenticated();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// App component
function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthenticated();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <div className="loading">Loading...</div>;

  // Router config
  const appRouter = createBrowserRouter([
    {
      path: "/",
      element: (
        <ProtectedRoutes>
          <Dashboard key={isAuthenticated ? "auth" : "unauth"} />
        </ProtectedRoutes>
      ),
    },
    {
      path: "/login",
      element: (
        <AuthenticatedUser>
          <Login />
        </AuthenticatedUser>
      ),
    },
    {
      path: "/signup",
      element: (
        <AuthenticatedUser>
          <SignUp />
        </AuthenticatedUser>
      ),
    },
  ]);

  return <RouterProvider router={appRouter} />;
}

export default App;
