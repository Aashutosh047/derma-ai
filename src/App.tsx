import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConsultDoctor from "./pages/ConsultDoctor";
import ConsultRoom from "./pages/ConsultRoom";
import { DermAIChatBubble } from "@/components/assessment/DermAIChatBubble";

const queryClient = new QueryClient();

const App = () => {
  const [diagnosisReport, setDiagnosisReport] = useState<any>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onReportReady={setDiagnosisReport} />} />
            <Route path="/consult" element={<ConsultDoctor />} />
            <Route path="/consult/room" element={<ConsultRoom />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Floating chat bubble — always visible, gets report when assessment is done */}
          <DermAIChatBubble report={diagnosisReport} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;