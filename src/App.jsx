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
import { useContactStore } from "./store/useContactStore";

// Protected Route
const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated } = useAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
  const { setContactIdFromUrl, fetchContactDetails } = useContactStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const setup = async () => {
      if (isAuthenticated) {
        const id = setContactIdFromUrl();
        if (id) await fetchContactDetails();
      }
    };
    setup();
  }, [isAuthenticated]);

  if (isCheckingAuth)
    return (
      <div className="flex w-full h-screen flex-col gap-4 items-center justify-center">
        <div className="skeleton h-32 w-full"></div>
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    );

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

  return <RouterProvider router={appRouter} />;
}

export default App;
