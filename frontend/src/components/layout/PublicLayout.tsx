import React from "react";
import { Link } from "react-router-dom";
import { getValidAccessToken } from "@/services/api";
import BottomNav from "./BottomNav";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const isAuthenticated = !!getValidAccessToken();

  return (
    <div className={`min-h-screen bg-[#050A18]${isAuthenticated ? ' pb-20' : ''}`}>
      {/* Floating nav — glassmorphism, overlays content */}
      <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 lg:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0EA5E9] to-[#6366F1]">
              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Sky<span className="bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] bg-clip-text text-transparent">Watch</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                to="/settings"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Meu Perfil
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#6366F1] px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#0EA5E9]/25"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>

      {/* Footer — only for non-auth visitors (auth users have bottom nav) */}
      {!isAuthenticated && (
        <footer className="border-t border-white/5 bg-[#050A18] px-4 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#0EA5E9] to-[#6366F1]">
                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">SkyWatch Insights &copy; 2026</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/events" className="transition-colors hover:text-gray-300">Eventos</Link>
              <Link to="/register" className="transition-colors hover:text-gray-300">Cadastrar</Link>
              <Link to="/login" className="transition-colors hover:text-gray-300">Entrar</Link>
            </div>
          </div>
        </footer>
      )}

      {/* Bottom nav for authenticated users */}
      {isAuthenticated && <BottomNav />}
    </div>
  );
};

export default PublicLayout;
