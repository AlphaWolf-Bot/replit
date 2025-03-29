import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { useEffect, useState } from "react";
import { isTelegramWebApp } from "./lib/telegram";

// Pages
import LandingPage from "@/pages/LandingPage";
import MainPage from "@/pages/MainPage";
import EarnPage from "@/pages/EarnPage";
import WalletPage from "@/pages/WalletPage";
import FriendsPage from "@/pages/FriendsPage";
import GamesPage from "@/pages/GamesPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";

// Components
import TelegramWebApp from "@/components/TelegramWebApp";
import WolfLoader from "@/components/WolfLoader";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const isTelegramApp = isTelegramWebApp();

  useEffect(() => {
    // Simulate initialization loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading ? (
        <WolfLoader />
      ) : isTelegramApp ? (
        <TelegramWebApp>
          <Switch>
            <Route path="/" component={MainPage} />
            <Route path="/earn" component={EarnPage} />
            <Route path="/wallet" component={WalletPage} />
            <Route path="/friends" component={FriendsPage} />
            <Route path="/games" component={GamesPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/admin" component={AdminPage} />
            <Route component={NotFound} />
          </Switch>
        </TelegramWebApp>
      ) : (
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFound} />
        </Switch>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
