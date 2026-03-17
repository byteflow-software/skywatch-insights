import React from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { LoadingState, ErrorState } from '@/components/shared';
import WeeklyHighlightCard from './WeeklyHighlightCard';
import UpcomingEventsWidget from './UpcomingEventsWidget';
import FavoritesSummaryWidget from './FavoritesSummaryWidget';
import StatsWidget from './StatsWidget';
import AstroConditionsWidget from './AstroConditionsWidget';

const DashboardPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isLoading) return <LoadingState message="Carregando dashboard..." />;

  if (isError) {
    return (
      <ErrorState
        title="Erro ao carregar dashboard"
        message="Não foi possível carregar o dashboard. Tente novamente."
        onRetry={() => refetch()}
      />
    );
  }

  const weeklyHighlight = data?.weeklyHighlight ?? data?.weekly_highlight ?? null;
  const upcomingEvents = data?.upcomingEvents ?? data?.upcoming_events ?? [];
  const recentFavorites = data?.recentFavorites ?? data?.recent_favorites ?? [];
  const statsData = data?.stats ?? {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-[#0F172A]">Dashboard</h1>

      {/* Stats */}
      <div className="mb-6">
        <StatsWidget
          totalFavorites={statsData.totalFavorites ?? statsData.total_favorites ?? 0}
          totalObservations={statsData.totalObservations ?? statsData.total_observations ?? 0}
          totalExports={statsData.totalExports ?? statsData.total_exports ?? 0}
        />
      </div>

      {/* Weekly highlight */}
      {weeklyHighlight && (
        <div className="mb-6">
          <WeeklyHighlightCard event={weeklyHighlight} />
        </div>
      )}

      {/* Two-column widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingEventsWidget events={upcomingEvents.slice(0, 5)} />
        <AstroConditionsWidget />
      </div>

      {/* Favorites */}
      <div className="mt-6">
        <FavoritesSummaryWidget favorites={recentFavorites.slice(0, 3)} />
      </div>
    </div>
  );
};

export default DashboardPage;
