import React from "react";
import Logo from "@/components/ui/logo";
import { TabProps } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const Sidebar: React.FC<TabProps> = ({ activeTab, setActiveTab }) => {
  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', '/api/users/me');
        return await res.json();
      } catch (error) {
        // If there's an error fetching the user, return null
        return null;
      }
    },
    // This allows the query to return null on 401
    retry: false
  });

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:bg-green-500 md:w-64 md:shadow-lg">
      <div className="flex items-center justify-center h-16 p-4 bg-green-600">
        <Logo />
      </div>
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="mt-5 flex-1 px-2 space-y-1">
          <button 
            onClick={() => setActiveTab("home")}
            className={`flex items-center w-full py-3 px-4 text-white ${
              activeTab === "home" 
                ? "bg-green-600" 
                : "opacity-80 hover:opacity-100 hover:bg-green-600"
            } rounded-md transition duration-150`}
          >
            <i className="fa-solid fa-home text-lg mr-3"></i>
            <span>Home</span>
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center w-full py-3 px-4 text-white ${
              activeTab === "dashboard" 
                ? "bg-green-600" 
                : "opacity-80 hover:opacity-100 hover:bg-green-600"
            } rounded-md transition duration-150`}
          >
            <i className="fa-solid fa-chart-line text-lg mr-3"></i>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab("services")}
            className={`flex items-center w-full py-3 px-4 text-white ${
              activeTab === "services" 
                ? "bg-green-600" 
                : "opacity-80 hover:opacity-100 hover:bg-green-600"
            } rounded-md transition duration-150`}
          >
            <i className="fa-solid fa-search text-lg mr-3"></i>
            <span>Find Services</span>
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex items-center w-full py-3 px-4 text-white ${
              activeTab === "settings" 
                ? "bg-green-600" 
                : "opacity-80 hover:opacity-100 hover:bg-green-600"
            } rounded-md transition duration-150`}
          >
            <i className="fa-solid fa-cog text-lg mr-3"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-green-600">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
            <i className="fa-solid fa-user text-green-500"></i>
          </div>
          <div className="text-white">
            <p className="text-sm font-medium">{user?.fullName || "Guest User"}</p>
            <p className="text-xs opacity-75">{user?.userType || "User"}</p>
          </div>
        </div>
        <button className="mt-3 flex items-center w-full py-2 px-3 text-white opacity-80 hover:opacity-100 rounded-md text-sm">
          <i className="fa-solid fa-sign-out-alt mr-2"></i>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
