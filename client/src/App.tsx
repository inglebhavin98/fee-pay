import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student/dashboard";
import StudentPayment from "@/pages/student/payment";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCollectFees from "@/pages/admin/collect-fees";
import AdminReports from "@/pages/admin/reports";
import Navbar from "@/components/layout/navbar";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={StudentDashboard} />
      <ProtectedRoute path="/payment/:feeId" component={StudentPayment} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/collect-fees" component={AdminCollectFees} />
      <ProtectedRoute path="/admin/reports" component={AdminReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navbar />
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
