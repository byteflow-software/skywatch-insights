import React from "react";
import { NavLink } from "react-router-dom";
import {
  Calendar,
  Heart,
  Telescope,
  Share2,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/events", label: "Eventos", icon: Calendar },
  { to: "/favorites", label: "Favoritos", icon: Heart },
  { to: "/observations", label: "Observações", icon: Telescope },
  { to: "/exports", label: "Exportar", icon: Share2 },
  { to: "/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-20 h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto bg-[#0F172A] transition-transform duration-200 lg:sticky lg:top-16 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0EA5E9]/20 text-[#0EA5E9]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 h-6 w-1 rounded-r bg-[#0EA5E9]" />
                  )}
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
