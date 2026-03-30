import React from 'react';
import { Trash2 } from 'lucide-react';

const formatCoordinates = (geo: any) => {
  if (geo.coordinates && geo.coordinates.length > 0) {
    const sliced = geo.coordinates.slice(0, 4);
    const mapped = sliced.map((c: any) => `[${c[0].toFixed(4)}, ${c[1].toFixed(4)}]`).join(' • ');
    return mapped + (geo.coordinates.length > 4 ? ' ...' : '');
  }
  return geo.description || 'Sector monitoring zone';
};

export const GeofenceListItem = ({
  geo,
  onDelete,
}: {
  geo: any;
  onDelete: (id: string) => void;
}) => {
  const isRestricted = geo.category === 'Restricted';

  return (
    <div className="p-4 bg-surface-container-low border-l-4 border-primary-container hover:bg-surface-container-highest transition-colors cursor-pointer group">
      <div className="flex justify-between items-start">
        <h4 className="font-display text-sm">{geo.name}</h4>
        <span
          className={`text-[10px] font-black px-2 py-0.5 tracking-widest uppercase ${
            isRestricted ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {isRestricted ? 'Warning' : 'Active'}
        </span>
      </div>
      <p className="text-[10px] text-outline mt-1 font-mono break-words leading-relaxed">
        {formatCoordinates(geo)}
      </p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
          {geo.category}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(geo.id);
            }}
            className="text-outline hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
