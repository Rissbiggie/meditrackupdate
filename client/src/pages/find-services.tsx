import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ui/service-card";
import { useQuery } from "@tanstack/react-query";
import { MedicalService } from "@/types";
import { getCurrentLocation } from "@/lib/location";
import { useToast } from "@/hooks/use-toast";

const FindServices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch medical services
  const { data: medicalServices, isLoading } = useQuery<MedicalService[]>({
    queryKey: ['/api/medical-services'],
  });

  // Filter services based on search term and selected type
  const filteredServices = medicalServices?.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedType || service.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Handle service type selection
  const handleTypeSelection = (type: string) => {
    setSelectedType(selectedType === type ? null : type);
  };

  // Refresh user location
  const refreshLocation = async () => {
    try {
      await getCurrentLocation();
      toast({
        title: "Location updated",
        description: "Your current location has been updated",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Location error",
        description: "Could not update your location. Please enable location services.",
        variant: "destructive",
      });
    }
  };

  // Handle service selection
  const handleServiceClick = (service: MedicalService) => {
    // In a real app, this would navigate to a detail page
    toast({
      title: service.name,
      description: `${service.address} • ${service.phone || 'No phone available'}`,
      variant: "default",
    });
  };

  // Service type buttons
  const serviceTypes = [
    { type: "hospital", icon: "fa-hospital", label: "Hospitals" },
    { type: "clinic", icon: "fa-briefcase-medical", label: "Clinics" },
    { type: "pharmacy", icon: "fa-pills", label: "Pharmacies" },
    { type: "dentist", icon: "fa-tooth", label: "Dentists" },
    { type: "optician", icon: "fa-eye", label: "Opticians" },
    { type: "other", icon: "fa-ellipsis-h", label: "More" }
  ];

  return (
    <div>
      {/* Service Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Find Medical Services</h2>
          
          <div className="mb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for hospitals, clinics, pharmacies..."
                className="pl-10 pr-4 py-6"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <i className="fa-solid fa-search"></i>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {serviceTypes.map((item) => (
              <Button
                key={item.type}
                variant={selectedType === item.type ? "default" : "outline"}
                className={`py-2 px-3 text-sm flex items-center justify-center ${
                  selectedType === item.type 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
                onClick={() => handleTypeSelection(item.type)}
              >
                <i className={`fa-solid ${item.icon} mr-1`}></i> {item.label}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
            <i className="fa-solid fa-location-arrow text-blue-600 mr-2"></i>
            <p className="flex-1">Using your current location to find nearby services</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600"
              onClick={refreshLocation}
            >
              <i className="fa-solid fa-sync-alt mr-1"></i> Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Services */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900">Nearby Services</h2>
            <div className="text-sm text-gray-500">
              <i className="fa-solid fa-map-marker-alt text-blue-600 mr-1"></i> 
              Within 5 miles
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices && filteredServices.length > 0 ? (
                <>
                  {filteredServices.map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onClick={handleServiceClick}
                    />
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full py-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
                  >
                    View More Services
                  </Button>
                </>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  {selectedType || searchTerm 
                    ? "No matching services found. Try adjusting your filters." 
                    : "No nearby services found."}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FindServices;
