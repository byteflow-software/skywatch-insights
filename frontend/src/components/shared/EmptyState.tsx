import React from "react";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 text-[#0EA5E9]">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-[#334155]">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-lg bg-[#0EA5E9] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0EA5E9]/90 focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
