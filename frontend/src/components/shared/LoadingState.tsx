import React from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E0F2FE] border-t-[#0EA5E9]" />
      {message && <p className="text-sm text-[#334155]">{message}</p>}
    </div>
  );
};

export default LoadingState;
