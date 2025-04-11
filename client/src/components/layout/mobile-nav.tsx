import React from "react";
import { TabProps } from "@/types";

const MobileNav: React.FC<TabProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-green-500 fixed bottom-0 w-full md:hidden z-10">
      <div className="flex justify-around">
        <button 
          onClick={() => setActiveTab("home")} 
          className={`flex flex-col items-center py-2 px-3 w-full text-white ${
            activeTab === "home" ? "bg-green-600" : "opacity-80 hover:opacity-100"
          }`}
        >
          <i className="fa-solid fa-home text-lg"></i>
          <span className="text-xs mt-1">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab("dashboard")} 
          className={`flex flex-col items-center py-2 px-3 w-full text-white ${
            activeTab === "dashboard" ? "bg-green-600" : "opacity-80 hover:opacity-100"
          }`}
        >
          <i className="fa-solid fa-chart-line text-lg"></i>
          <span className="text-xs mt-1">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab("services")} 
          className={`flex flex-col items-center py-2 px-3 w-full text-white ${
            activeTab === "services" ? "bg-green-600" : "opacity-80 hover:opacity-100"
          }`}
        >
          <i className="fa-solid fa-search text-lg"></i>
          <span className="text-xs mt-1">Services</span>
        </button>
        <button 
          onClick={() => setActiveTab("settings")} 
          className={`flex flex-col items-center py-2 px-3 w-full text-white ${
            activeTab === "settings" ? "bg-green-600" : "opacity-80 hover:opacity-100"
          }`}
        >
          <i className="fa-solid fa-cog text-lg"></i>
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNav;
