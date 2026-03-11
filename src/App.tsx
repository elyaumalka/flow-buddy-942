import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminLeads from "@/pages/admin/Leads";
import AdminPartners from "@/pages/admin/Partners";
import AdminMarketers from "@/pages/admin/Marketers";
import AdminCustomers from "@/pages/admin/Customers";
import AdminPayments from "@/pages/admin/Payments";
import AdminCollections from "@/pages/admin/Collections";
import AdminCommissions from "@/pages/admin/Commissions";
import AdminReports from "@/pages/admin/Reports";
import AdminStatistics from "@/pages/admin/Statistics";
import AdminTasks from "@/pages/admin/Tasks";
import AdminCalendar from "@/pages/admin/Calendar";
import AdminTickets from "@/pages/admin/Tickets";
import AdminSettings from "@/pages/admin/Settings";
import MarketerLayout from "@/layouts/MarketerLayout";
import MarketerDashboard from "@/pages/marketer/Dashboard";
import MarketerLeads from "@/pages/marketer/Leads";
import MarketerTasks from "@/pages/marketer/Tasks";
import MarketerCustomers from "@/pages/marketer/Customers";
import MarketerCommissions from "@/pages/marketer/Commissions";
import MarketerSettings from "@/pages/marketer/Settings";
import CustomerLayout from "@/layouts/CustomerLayout";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerIncome from "@/pages/customer/Income";
import CustomerExpenses from "@/pages/customer/Expenses";
import CustomerGoals from "@/pages/customer/Goals";
import CustomerStatistics from "@/pages/customer/Statistics";
import CustomerTithes from "@/pages/customer/Tithes";
import CustomerSettings from "@/pages/customer/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RoleRedirect() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (role === "admin") return <Navigate to="/admin" replace />;
  if (role === "marketer") return <Navigate to="/marketer" replace />;
  return <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Role redirect */}
            <Route path="/" element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="partners" element={<AdminPartners />} />
              <Route path="marketers" element={<AdminMarketers />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="collections" element={<AdminCollections />} />
              <Route path="commissions" element={<AdminCommissions />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="statistics" element={<AdminStatistics />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="calendar" element={<AdminCalendar />} />
              <Route path="tickets" element={<AdminTickets />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Marketer routes */}
            <Route path="/marketer" element={
              <ProtectedRoute allowedRoles={["marketer"]}>
                <MarketerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MarketerDashboard />} />
              <Route path="leads" element={<MarketerLeads />} />
              <Route path="tasks" element={<MarketerTasks />} />
              <Route path="customers" element={<MarketerCustomers />} />
              <Route path="commissions" element={<MarketerCommissions />} />
              <Route path="settings" element={<MarketerSettings />} />
            </Route>
            {/* Customer routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CustomerDashboard />} />
              <Route path="income" element={<CustomerIncome />} />
              <Route path="expenses" element={<CustomerExpenses />} />
              <Route path="goals" element={<CustomerGoals />} />
              <Route path="statistics" element={<CustomerStatistics />} />
              <Route path="tithes" element={<CustomerTithes />} />
              <Route path="settings" element={<CustomerSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
