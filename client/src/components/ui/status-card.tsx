import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemStatus } from "@/types";

interface StatusCardProps {
  statuses: SystemStatus[];
  isLoading?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ statuses, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary-900">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0 animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-50 text-green-600";
      case "partial":
        return "bg-yellow-50 text-yellow-600";
      case "offline":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "partial":
        return "Partial";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getIconColorClass = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "partial":
        return "text-yellow-500";
      case "offline":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary-900">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {statuses.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
              <div className="flex items-center">
                <i className={`fa-solid ${item.icon} ${getIconColorClass(item.status)} mr-3`}></i>
                <span className="text-gray-700">{item.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(item.status)}`}>
                {getStatusText(item.status)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
