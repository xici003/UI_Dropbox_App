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

// Router config
const appRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <Dashboard />
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

// App component
function App() {
  const { isCheckingAuth, checkAuth } = useAuthenticated();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("contactId");
    console.log(id);
  }, []);

  if (isCheckingAuth) return <div className="loading">Loading...</div>;

  return <RouterProvider router={appRouter} />;
}

export default App;
