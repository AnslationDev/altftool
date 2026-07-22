import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LandingPage from "./pages/LandingPage.jsx";
import PapercallInterceptor from "./components/PapercallInterceptor.jsx";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/:rest*" component={LandingPage} />
    </Switch>
  );
}

export default function App() {
  return (
    <div className="helios-solar-app">
      <QueryClientProvider client={queryClient}>
        <WouterRouter base="/housingneeds/solar/helios-solar">
          <Router />
        </WouterRouter>
        <PapercallInterceptor />
      </QueryClientProvider>
    </div>
  );
}
