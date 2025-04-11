import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import EmergencyButton from "@/components/ui/emergency-button";
import StatusCard from "@/components/ui/status-card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { LocationCoordinates, SystemStatus, Activity } from "@/types";

const Home: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system statuses
  const { data: systemStatuses, isLoading: isLoadingStatuses } = useQuery<SystemStatus[]>({
    queryKey: ['/api/system-status'],
  });

  // Fetch recent activities
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  // Create emergency request mutation
  const createEmergencyRequest = useMutation({
    mutationFn: async (data: { latitude: string; longitude: string; description?: string }) => {
      const response = await apiRequest('POST', '/api/emergency-requests', data);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/emergency-requests/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create emergency request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleEmergencyRequest = (coordinates: LocationCoordinates, description?: string) => {
    createEmergencyRequest.mutate({
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      description
    });
  };

  return (
    <div>
      {/* Emergency Card */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Emergency Assistance</h2>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <div className="flex items-center">
              <i className="fa-solid fa-exclamation-circle text-red-500 text-2xl mr-3"></i>
              <div>
                <h3 className="font-bold text-red-600">Need immediate help?</h3>
                <p className="text-gray-700">Request emergency assistance with your current location</p>
              </div>
            </div>
          </div>
          
          <EmergencyButton 
            onRequest={handleEmergencyRequest} 
            isLoading={createEmergencyRequest.isPending}
          />
          
          <div className="text-sm text-gray-600 text-center mt-4">
            Your location will be shared with emergency responders
          </div>
        </CardContent>
      </Card>

      {/* System Status Card */}
      <StatusCard 
        statuses={systemStatuses || []} 
        isLoading={isLoadingStatuses} 
      />

      {/* Recent Activities */}
      <Card className="my-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Recent Activities</h2>
          
          {isLoadingActivities ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start border-b border-gray-200 pb-3 last:border-0 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start border-b border-gray-200 pb-3 last:border-0">
                    <div className={`${activity.iconBg || 'bg-blue-100'} p-2 rounded-full mr-3`}>
                      <i className={`fa-solid ${activity.icon || 'fa-check'} text-blue-600`}></i>
                    </div>
                    <div>
                      <p className="text-gray-800 font-medium">{activity.title}</p>
                      <p className="text-gray-500 text-sm">{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities to display</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
