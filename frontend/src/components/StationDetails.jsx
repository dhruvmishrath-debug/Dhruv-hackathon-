import React from 'react';
import { StationMap } from './StationMap';

export const StationDetails = ({ station, user }) => {
  if (!station) {
    return (
      <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full flex items-center justify-center text-center">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-2">
            Awaiting Target
          </div>
          <div className="font-heading text-lg text-white/40">
            Select a station to view details
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full flex flex-col">
      <div className="mb-4">
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
          Target Intel
        </div>
        <h3 className="text-lg font-heading font-bold text-white truncate">
          {station.name}
        </h3>
        <div className="text-xs font-mono text-[#8A94A6] mt-1">
          {station.address}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <DetailStat label="Slots Free" value={`${station.available_slots}/${station.total_slots}`} />
        <DetailStat label="Fast" value={station.fast_charger_count} />
        <DetailStat label="Rate" value={`${station.charging_rate_kw}kW`} />
        <DetailStat label="₹/kWh" value={station.price_per_kwh} />
        <DetailStat label="Wait" value={`${station.wait_time_min || 0}m`} />
        <DetailStat
          label="Peak"
          value={station.is_peak ? 'YES' : 'NO'}
          accent={station.is_peak ? 'warning' : 'success'}
        />
      </div>

      <div
        data-testid="station-map"
        className="flex-1 border border-white/10 rounded-sm overflow-hidden min-h-[220px]"
      >
        <StationMap station={station} user={user} />
      </div>
    </div>
  );
};

const DetailStat = ({ label, value, accent }) => {
  const color =
    accent === 'warning' ? 'text-[#FF9F0A]' : accent === 'success' ? 'text-[#00F58D]' : 'text-white';
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-3">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-1">
        {label}
      </div>
      <div className={`font-mono font-bold text-base ${color}`}>{value}</div>
    </div>
  );
};
