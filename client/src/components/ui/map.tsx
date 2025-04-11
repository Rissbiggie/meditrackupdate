import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationCoordinates, ResponseTeam } from "@/types";

interface MapProps {
  title?: string;
  userLocation?: LocationCoordinates;
  responseTeams?: ResponseTeam[];
  isLoading?: boolean;
}

export const Map: React.FC<MapProps> = ({
  title = "Response Team Locations",
  userLocation,
  responseTeams = [],
  isLoading = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // In a real implementation, you would integrate with MapBox or Google Maps
  // For now, we'll just show a placeholder

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={mapRef}
          className="h-64 md:h-80 rounded-lg relative bg-gray-100"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
              <div className="text-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-primary-600 mb-2"></i>
                <p className="text-gray-700">Loading map...</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
              <div className="text-center">
                <i className="fa-solid fa-map-marker-alt text-4xl text-primary-600 mb-2"></i>
                <p className="text-gray-700">Map visualization</p>
                <Button 
                  variant="default" 
                  size="sm"
                  className="mt-2 bg-primary-600 hover:bg-primary-700"
                >
                  Refresh Map
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
