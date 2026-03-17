import React from 'react';
import BottomNav from './BottomNav';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#050A18] pb-20">
      <main>{children}</main>
      <BottomNav />
    </div>
  );
};

export default AuthLayout;
