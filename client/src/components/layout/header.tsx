import React from "react";
import Logo from "@/components/ui/logo";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 py-4 px-4 shadow-md fixed top-0 w-full z-10">
      <div className="container mx-auto flex justify-center items-center">
        <Logo size="md" />
      </div>
    </header>
  );
};

export default Header;
