import React from 'react';
import { Link } from 'react-router-dom';

interface FavoriteEvent {
  id: string;
  slug: string;
  title: string;
  type: string;
  imageUrl?: string;
  image_url?: string;
}

interface FavoritesSummaryWidgetProps {
  favorites: FavoriteEvent[];
}

const FavoritesSummaryWidget: React.FC<FavoritesSummaryWidgetProps> = ({
  favorites,
}) => {
  return (
    <div className="rounded-xl border border-[#E0F2FE] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#0F172A]">Favoritos</h3>
        <Link
          to="/favorites"
          className="text-xs font-medium text-[#0EA5E9] hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {favorites.length === 0 ? (
        <p className="py-4 text-center text-sm text-[#334155]">
          Nenhum favorito ainda.
        </p>
      ) : (
        <div className="grid gap-3">
          {favorites.map((fav) => {
            const img = fav.imageUrl ?? fav.image_url;

            return (
              <Link
                key={fav.id}
                to={`/events/${fav.slug}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#E0F2FE]/30"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#E0F2FE]">
                  {img ? (
                    <img
                      src={img}
                      alt={fav.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-5 w-5 text-[#0EA5E9]/40"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#0F172A]">
                    {fav.title}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[#334155]">
                    {fav.type}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesSummaryWidget;
