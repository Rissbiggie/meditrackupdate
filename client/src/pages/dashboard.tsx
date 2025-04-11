import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Map from "@/components/ui/map";
import { useQuery } from "@tanstack/react-query";
import { EmergencyRequest, Stats, ResponseTeam } from "@/types";

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  // Fetch emergency requests
  const { data: emergencies, isLoading: isLoadingEmergencies } = useQuery<EmergencyRequest[]>({
    queryKey: ['/api/emergency-requests'],
  });

  // Fetch response teams
  const { data: responseTeams, isLoading: isLoadingTeams } = useQuery<ResponseTeam[]>({
    queryKey: ['/api/response-teams'],
  });

  // Render stats skeleton during loading
  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render stats when loaded
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full mr-4">
              <i className="fa-solid fa-user-md text-blue-600 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Response Teams</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.responseTeams || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-green-50 p-3 rounded-full mr-4">
              <i className="fa-solid fa-check-circle text-green-500 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Resolved Cases</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.resolvedCases || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <i className="fa-solid fa-clock text-yellow-500 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.pendingCases || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="bg-red-50 p-3 rounded-full mr-4">
              <i className="fa-solid fa-ambulance text-red-500 text-xl"></i>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Critical</p>
              <p className="text-2xl font-bold text-gray-800">{stats?.criticalCases || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Get status badge classes
  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 text-red-600';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-50 text-green-600';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get formatted status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Critical';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'pending':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <div>
      {/* Dashboard Stats */}
      {isLoadingStats ? renderStatsSkeleton() : renderStats()}

      {/* Map Card */}
      <Map
        title="Response Team Locations"
        responseTeams={responseTeams}
        isLoading={isLoadingTeams}
      />

      {/* Active Emergencies */}
      <Card className="my-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900">Active Emergencies</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>
          
          {isLoadingEmergencies ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-t w-full mb-2"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 w-full mb-1"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {emergencies && emergencies.length > 0 ? (
                    emergencies.map((emergency) => {
                      // Find response team by ID
                      const team = responseTeams?.find(t => t.id === emergency.responseTeamId);
                      
                      return (
                        <tr key={emergency.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{emergency.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {`${emergency.latitude.substring(0, 6)}, ${emergency.longitude.substring(0, 6)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(emergency.status)}`}>
                              {getStatusText(emergency.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {team?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">Details</button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No active emergencies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
