import React from 'react';
import { Car, Hourglass, Lightning, Clock } from '@phosphor-icons/react';

export const TimeBreakdown = ({ station }) => {
  if (!station) {
    return (
      <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
            Time Telemetry
          </div>
          <div className="font-heading text-lg text-white/40 mt-2">
            No station selected
          </div>
        </div>
      </div>
    );
  }

  const total = station.total_time_min;
  const segments = [
    {
      label: 'Travel',
      value: station.travel_time_min,
      color: '#00E5FF',
      icon: Car,
    },
    {
      label: 'Wait',
      value: station.wait_time_min,
      color: '#FF9F0A',
      icon: Hourglass,
    },
    {
      label: 'Charge',
      value: station.charge_time_min,
      color: '#00F58D',
      icon: Lightning,
    },
  ];

  return (
    <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
            Time Telemetry
          </div>
          <h3 className="text-lg font-heading font-bold text-white">
            Time Breakdown
          </h3>
        </div>
        <div className="flex items-baseline gap-1">
          <Clock size={16} className="text-[#8A94A6] self-center mr-1" />
          <span
            data-testid="total-time-display"
            className="font-mono font-black text-3xl text-[#00E5FF]"
          >
            {total}
          </span>
          <span className="text-xs font-mono text-[#8A94A6]">min</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full rounded-sm overflow-hidden mb-4 border border-white/10">
        {segments.map((s) => (
          <div
            key={s.label}
            className="h-full transition-all"
            style={{
              width: `${(s.value / total) * 100}%`,
              background: s.color,
            }}
            title={`${s.label}: ${s.value} min`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {segments.map((s) => {
          const Icon = s.icon;
          const pct = ((s.value / total) * 100).toFixed(0);
          return (
            <div
              key={s.label}
              className="flex items-center justify-between bg-[#0A0A0A] border border-white/10 rounded-sm p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-sm"
                  style={{ background: `${s.color}20`, border: `1px solid ${s.color}60` }}
                >
                  <Icon size={16} weight="fill" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-widest text-[#8A94A6]">
                    {s.label}
                  </div>
                  <div className="font-mono font-bold text-white">
                    {s.value} min
                  </div>
                </div>
              </div>
              <div className="font-mono text-sm text-[#8A94A6]">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
