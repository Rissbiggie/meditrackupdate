import React from "react";
import { ServiceCardProps } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  // Icon based on service type
  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'hospital':
        return 'fa-hospital';
      case 'clinic':
        return 'fa-briefcase-medical';
      case 'pharmacy':
        return 'fa-pills';
      case 'dentist':
        return 'fa-tooth';
      case 'optician':
        return 'fa-eye';
      default:
        return 'fa-stethoscope';
    }
  };

  // Generate star rating based on rating value
  const renderStarRating = (rating: string | undefined) => {
    if (!rating) return null;
    
    const ratingValue = parseFloat(rating);
    const fullStars = Math.floor(ratingValue);
    const hasHalfStar = ratingValue % 1 >= 0.5;
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center mt-1">
        <div className="flex text-yellow-400">
          {[...Array(fullStars)].map((_, i) => (
            <i key={`full-${i}`} className="fa-solid fa-star text-xs"></i>
          ))}
          {hasHalfStar && <i className="fa-solid fa-star-half-alt text-xs"></i>}
          {[...Array(remainingStars)].map((_, i) => (
            <i key={`empty-${i}`} className="fa-regular fa-star text-xs"></i>
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">
          {rating} {service.reviewCount && `(${service.reviewCount})`}
        </span>
      </div>
    );
  };

  const handleClick = () => {
    if (onClick) {
      onClick(service);
    }
  };

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <i className={`fa-solid ${getServiceIcon(service.type)} text-blue-600 text-xl`}></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              <p className="text-gray-500 text-sm">
                {service.distance && `${service.distance} miles away`}
                {service.openingHours && ` • ${service.openingHours}`}
              </p>
              {renderStarRating(service.rating)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-blue-600 hover:text-blue-800"
            onClick={handleClick}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
