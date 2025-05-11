import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import Dashboard from "./pages/dashboard";
import Header from "./components/custom/header";
import { AppSidebar } from "./components/custom/sidebar";
import Login from "./pages/Login";
import SegmentFlow from "./pages/segment";
import { SidebarTrigger } from "./components/ui/sidebar";
import { signIn } from "./store/authSlice";
import Campaign from "./pages/campaign";
import { fetchCampaigns } from "./store/campaignSlice";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const dispatch = useDispatch();
  
  // Get isLoggedIn state from Redux
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  
  // Add loading state while checking authentication
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await axios.get("http://localhost:5000/api/verify-token", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // Dispatch the user data to Redux
          dispatch(signIn(res.data.user));
        } catch (err) {
          console.error("Token invalid or expired", err);
          localStorage.removeItem("token"); // Remove invalid token
        }
      }
      // Mark authentication check as complete
      setAuthChecked(true);
    };
    
    verifyUser();
  }, [dispatch]);

  // Show loading state while checking authentication
  if (!authChecked) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Authentication has been checked, now we can safely render routes
  if (isLoginPage) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <SidebarTrigger />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/segment" element={<SegmentFlow />} />
            <Route path="/campaign" element={< Campaign/>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;