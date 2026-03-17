import React, { useState } from 'react';
import AdminEventList from './AdminEventList';
import HighlightManager from './HighlightManager';

type Tab = 'events' | 'highlights';

const TABS: { id: Tab; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'highlights', label: 'Highlights' },
];

const AdminPanelPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('events');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Admin Panel</h1>
        <p className="mt-1 text-sm text-[#334155]">Manage events and weekly highlights.</p>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0EA5E9] text-[#0EA5E9]'
                  : 'border-transparent text-[#334155] hover:border-slate-300 hover:text-[#0F172A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'events' && <AdminEventList />}
      {activeTab === 'highlights' && <HighlightManager />}
    </div>
  );
};

export default AdminPanelPage;
