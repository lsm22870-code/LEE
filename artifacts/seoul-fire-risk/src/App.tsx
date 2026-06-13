import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Alerts from "@/pages/Alerts";
import Statistics from "@/pages/Statistics";
import MapPage from "@/pages/MapPage";
import FirefighterPage from "@/pages/FirefighterPage";
import DistrictDetail from "@/pages/DistrictDetail";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/map" component={MapPage} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/firefighter" component={FirefighterPage} />
      <Route path="/statistics" component={Statistics} />
      <Route path="/district/:name" component={DistrictDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
