import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Directory from "./pages/Directory";
import ErrorCodes from "./pages/ErrorCodes";
import Guides from "./pages/Guides";
import CreateGuide from "./pages/CreateGuide";
import CreateMeter from "./pages/CreateMeter";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory/create" element={<ProtectedRoute><CreateMeter /></ProtectedRoute>} />
            <Route path="/error-codes" element={<ErrorCodes />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/create" element={<ProtectedRoute><CreateGuide /></ProtectedRoute>} />
            <Route path="/community" element={<Community />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
