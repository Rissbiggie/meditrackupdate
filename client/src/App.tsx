import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import FindServices from "@/pages/find-services";
import Settings from "@/pages/settings";

// Main AppLayout component
const AppLayout = () => {
  const [activeTab, setActiveTab] = useState("home");
  
  // Render appropriate component based on active tab
  const renderActiveTab = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "dashboard":
        return <Dashboard />;
      case "services":
        return <FindServices />;
      case "settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  // Link CSS to add FontAwesome icons
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="bg-blue-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Sidebar (desktop) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <main className="flex-grow mt-16 mb-16 md:mb-0 md:ml-64 p-4 overflow-y-auto">
        {renderActiveTab()}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

// App component with routing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={AppLayout} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
