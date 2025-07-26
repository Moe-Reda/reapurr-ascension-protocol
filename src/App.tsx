import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wagmi';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import BackgroundEffect from "./components/BackgroundEffect";
import Index from "./pages/Index";
import Awakening from "./pages/Awakening";
import Lazarus from "./pages/Lazarus";
import Sepulchre from "./pages/Sepulchre";
import Purgatory from "./pages/Purgatory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen w-full">
            <BackgroundEffect />
            <Navigation />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/awakening" element={<Awakening />} />
              <Route path="/lazarus" element={<Lazarus />} />
              <Route path="/sepulchre" element={<Sepulchre />} />
              <Route path="/purgatory" element={<Purgatory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
