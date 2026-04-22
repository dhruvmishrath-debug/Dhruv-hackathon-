import React from 'react';
import { WarningCircle } from '@phosphor-icons/react';

export const EmergencyBanner = ({ batteryLevel }) => {
  return (
    <div
      data-testid="emergency-banner"
      className="bg-[#FF3B30]/10 border border-[#FF3B30] rounded-sm py-3 px-6 flex items-center justify-center gap-4 emergency-pulse"
    >
      <WarningCircle size={20} weight="fill" className="text-[#FF3B30]" />
      <span className="font-mono uppercase tracking-[0.2em] text-[#FF3B30] text-sm font-bold">
        Emergency Mode Activated · Battery {batteryLevel}% · Nearest Fast Charger Priority
      </span>
      <WarningCircle size={20} weight="fill" className="text-[#FF3B30]" />
    </div>
  );
};
