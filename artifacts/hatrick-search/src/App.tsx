import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import NotFound from "@/pages/not-found";
import { IntroScreen } from "@/components/IntroScreen";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Show intro only once per session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem("hatrick_intro_seen");
  });

  useEffect(() => {
    if (showIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        sessionStorage.setItem("hatrick_intro_seen", "true");
      }, 2800); // 2.8s total intro time
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
          <AnimatePresence mode="wait">
            {showIntro ? (
              <IntroScreen key="intro" />
            ) : (
              <div key="app" className="animate-in fade-in duration-1000">
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
              </div>
            )}
          </AnimatePresence>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
