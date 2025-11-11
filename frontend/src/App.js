import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import AuthPage from "@/pages/AuthPage";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import FlowsPage from "@/pages/FlowsPage";
import FlowBuilder from "@/pages/FlowBuilder";
import BroadcastsPage from "@/pages/BroadcastsPage";
import BroadcastCreate from "@/pages/BroadcastCreate";
import AutomationsPage from "@/pages/AutomationsPage";
import SubscribersPage from "@/pages/SubscribersPage";
import InboxPage from "@/pages/InboxPage";
import SettingsPage from "@/pages/SettingsPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/auth" replace />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get(`${API}/auth/me`)
        .then(res => {
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/flows" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <FlowsPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/flows/:flowId" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <FlowBuilder />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/broadcasts" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <BroadcastsPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/broadcasts/new" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <BroadcastCreate />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/automations" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <AutomationsPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/subscribers" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <SubscribersPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/inbox" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <InboxPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/settings" element={
            <PrivateRoute>
              <DashboardLayout user={user}>
                <SettingsPage />
              </DashboardLayout>
            </PrivateRoute>
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
export { API, toast };