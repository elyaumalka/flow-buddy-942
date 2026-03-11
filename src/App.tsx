import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
