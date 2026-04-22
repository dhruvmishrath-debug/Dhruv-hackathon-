import React from 'react';
import { Lightning, MapPin, Users } from '@phosphor-icons/react';

export const StationList = ({ stations, selectedId, onSelect, bestId, emergency }) => {
  return (
    <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
            Grid Sweep
          </div>
          <h3 className="text-lg font-heading font-bold text-white">Nearby Stations</h3>
        </div>
        <div className="text-xs font-mono text-[#8A94A6]">{stations.length} found</div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1" data-testid="station-list">
        {stations.map((s, i) => {
          const isSelected = s.station_id === selectedId;
          const isBest = s.station_id === bestId;
          const outOfRange = !s.in_range;
          return (
            <button
              key={s.station_id}
              data-testid={`station-card-${s.station_id}`}
              onClick={() => onSelect(s)}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`stagger-item w-full text-left p-4 border rounded-sm transition-all duration-200 hover:-translate-y-0.5 ${
                isSelected
                  ? 'bg-[#00E5FF]/5 border-[#00E5FF]'
                  : isBest
                  ? 'bg-[#13161C] border-[#00F58D]/50 hover:border-[#00F58D]'
                  : 'bg-[#0A0A0A] border-white/10 hover:border-[#00E5FF]/40'
              } ${outOfRange ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isBest && (
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-[#00F58D] text-[#0A0A0A] px-1.5 py-0.5 rounded-sm">
                        {emergency ? 'Priority' : 'Best'}
                      </span>
                    )}
                    {outOfRange && (
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3B30]">
                        Out of Range
                      </span>
                    )}
                  </div>
                  <div className="font-heading font-bold text-sm text-white truncate">
                    {s.name}
                  </div>
                </div>
                <div className="font-mono font-bold text-lg text-[#00E5FF] ml-2 whitespace-nowrap">
                  {s.distance_km} km
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A94A6]">
                    Slots
                  </div>
                  <div className="font-mono font-bold text-sm text-white flex items-center gap-1">
                    <Users size={12} className="text-[#8A94A6]" />
                    {s.available_slots}/{s.total_slots}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A94A6]">
                    Fast
                  </div>
                  <div className="font-mono font-bold text-sm text-white flex items-center gap-1">
                    <Lightning size={12} weight="fill" className="text-[#FF9F0A]" />
                    {s.fast_charger_count}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A94A6]">
                    Rate
                  </div>
                  <div className="font-mono font-bold text-sm text-white">
                    {s.charging_rate_kw}kW
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
