import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Settings, LogOut, MapPin } from "lucide-react";
import { useAuthContext } from "@/features/auth/AuthProvider";
import UserAvatar from "@/components/shared/UserAvatar";
import api from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/events", label: "Eventos" },
  { to: "/favorites", label: "Favoritos" },
  { to: "/observations", label: "Observações" },
];

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
        setCityQuery("");
        setCityResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced city search
  useEffect(() => {
    if (cityQuery.length < 2) {
      setCityResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get("/cities/search", { params: { q: cityQuery, limit: 6 } });
        setCityResults(data?.data ?? []);
      } catch {
        setCityResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [cityQuery]);

  const handleSelectCity = async (city: any) => {
    try {
      await api.patch("/me/preferences", {
        preferredCityId: city.id,
        timezone: city.timezone,
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setCityDropdownOpen(false);
      setCityQuery("");
      setCityResults([]);
    } catch {
      // ignore
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-[#0F172A] px-4 lg:px-6">
      {/* Left: logo + mobile toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-white lg:hidden"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            SkyWatch <span className="text-[#0EA5E9]">Insights</span>
          </span>
        </Link>
      </div>

      {/* Center: desktop nav */}
      <nav className="hidden items-center gap-1 lg:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(link.to)
                ? "bg-[#0EA5E9]/20 text-[#0EA5E9]"
                : "text-gray-300 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right: city selector + user menu */}
      <div className="flex items-center gap-2">
        {/* City selector */}
        <div className="relative" ref={cityRef}>
          <button
            onClick={() => setCityDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-300 transition-colors hover:text-white"
          >
            <MapPin size={15} />
            <span className="hidden max-w-[120px] truncate sm:inline">
              {user?.preferredCity?.name ?? "Selecionar cidade"}
            </span>
            <ChevronDown size={12} />
          </button>

          {cityDropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 rounded-lg bg-white shadow-xl ring-1 ring-black/5">
              <div className="p-2">
                <input
                  type="text"
                  value={cityQuery}
                  onChange={(e) => setCityQuery(e.target.value)}
                  placeholder="Buscar cidade ou CEP..."
                  autoFocus
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9]"
                />
              </div>
              {isSearching && (
                <div className="flex justify-center py-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E0F2FE] border-t-[#0EA5E9]" />
                </div>
              )}
              {cityResults.length > 0 && (
                <ul className="max-h-48 overflow-y-auto border-t border-gray-100">
                  {cityResults.map((city: any) => (
                    <li key={city.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-[#0F172A] hover:bg-[#E0F2FE]/50"
                      >
                        <span>{city.name}</span>
                        <span className="text-xs text-gray-400">{city.timezone}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {cityQuery.length >= 2 && !isSearching && cityResults.length === 0 && (
                <p className="px-3 py-3 text-center text-xs text-gray-400">Nenhuma cidade encontrada</p>
              )}
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-300 transition-colors hover:text-white"
          >
            <UserAvatar name={user?.name ?? ''} avatarUrl={user?.avatarUrl} size="sm" />
            <span className="hidden sm:inline">{user?.name?.split(" ")[0] ?? "Conta"}</span>
            <ChevronDown size={14} />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-[#334155] hover:bg-[#E0F2FE]"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings size={16} />
                Configurações
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  window.location.href = "/login";
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#334155] hover:bg-[#E0F2FE]"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
