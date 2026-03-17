import React, { useState, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuthContext } from "@/features/auth/AuthProvider";
import CitySelectionModal from "@/components/shared/CitySelectionModal";
import { useQueryClient } from "@tanstack/react-query";

interface MainLayoutProps {
  children: React.ReactNode;
}

const CITY_MODAL_DISMISSED_KEY = "skywatch_city_modal_dismissed";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuthContext();
  const queryClient = useQueryClient();
  const [cityModalDismissed, setCityModalDismissed] = useState(
    () => sessionStorage.getItem(CITY_MODAL_DISMISSED_KEY) === "true"
  );

  const showCityModal =
    !isLoading &&
    !!user &&
    user.preferredCity === null &&
    !cityModalDismissed;

  const handleCitySelected = useCallback(() => {
    setCityModalDismissed(true);
    sessionStorage.setItem(CITY_MODAL_DISMISSED_KEY, "true");
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }, [queryClient]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-h-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <Footer />

      <CitySelectionModal
        open={showCityModal}
        onCitySelected={handleCitySelected}
      />
    </div>
  );
};

export default MainLayout;
