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
import GuideDetail from "./pages/GuideDetail";
import CreateGuide from "./pages/CreateGuide";
import CreateMeter from "./pages/CreateMeter";
import MeterBehaviors from "./pages/MeterBehaviors";
import BehaviorDetail from "./pages/BehaviorDetail";
import CreateBehavior from "./pages/CreateBehavior";
import Community from "./pages/Community";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import MeterDetail from "./pages/MeterDetail";

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
            <Route path="/guides/:id" element={<GuideDetail />} />
            <Route path="/guides/create" element={<ProtectedRoute><CreateGuide /></ProtectedRoute>} />
            <Route path="/behaviors" element={<MeterBehaviors />} />
            <Route path="/behaviors/:id" element={<BehaviorDetail />} />
            <Route path="/behaviors/create" element={<ProtectedRoute><CreateBehavior /></ProtectedRoute>} />
            <Route path="/community" element={<Community />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/directory/:id" element={<MeterDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
