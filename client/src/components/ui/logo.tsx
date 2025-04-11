import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({ size = "md" }) => {
  // Size classes based on the size prop
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex items-center">
      <div className="bg-green-500 p-2 rounded-md mr-2">
        <div className="bg-white rounded-md p-1">
          <i className={`fa-solid fa-plus text-red-500 ${iconSizeClasses[size]}`}></i>
        </div>
      </div>
      <span className={`text-green-500 font-bold ${sizeClasses[size]}`}>MediTrack</span>
    </div>
  );
};

export default Logo;
