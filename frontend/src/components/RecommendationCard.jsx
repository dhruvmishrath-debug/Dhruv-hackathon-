import React from 'react';
import { Sparkle, Lightning, Compass, Timer } from '@phosphor-icons/react';

export const RecommendationCard = ({ best, explanation, explanationLoading, emergency, onNavigate, onBook }) => {
  if (!best) {
    return (
      <div className="bg-[#13161C] border border-white/10 rounded-sm p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-2">
            Standby
          </div>
          <div className="font-heading text-2xl text-white/40">
            Configure mission parameters
          </div>
          <div className="text-sm text-[#8A94A6] mt-2 font-mono">
            Set your battery & location, then run analysis
          </div>
        </div>
      </div>
    );
  }

  const bgImage =
    'https://images.pexels.com/photos/27141313/pexels-photo-27141313.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

  return (
    <div
      data-testid="recommendation-card"
      className="relative overflow-hidden border border-[#00E5FF]/30 rounded-sm h-full"
      style={{
        boxShadow: 'inset 0 0 30px rgba(0, 229, 255, 0.08)',
      }}
    >
      {/* BG image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A]/95 via-[#0A0A0A]/80 to-[#13161C]/95" />

      <div className="relative p-6 lg:p-8 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#00E5FF] flex items-center justify-center rounded-sm">
            <Sparkle size={20} weight="fill" className="text-[#0A0A0A]" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#00E5FF]">
              {emergency ? 'Emergency Recommendation' : 'AI Recommendation'}
            </div>
            <div className="text-xs font-mono text-[#8A94A6] mt-0.5">
              Score {best.score} · Analyzed in realtime
            </div>
          </div>
        </div>

        <h1
          data-testid="recommended-station-name"
          className="font-heading font-black text-4xl lg:text-5xl tracking-tighter text-white mb-1"
        >
          {best.name}
        </h1>
        <div className="text-sm text-[#8A94A6] font-mono mb-6">{best.address}</div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat
            label="Distance"
            value={`${best.distance_km}`}
            unit="km"
            testid="reco-distance"
          />
          <Stat
            label="Wait"
            value={`${best.wait_time_min}`}
            unit="min"
            testid="reco-wait"
          />
          <Stat
            label="Charge"
            value={`${best.charge_time_min}`}
            unit="min"
            testid="reco-charge"
          />
          <Stat
            label="Total"
            value={`${best.total_time_min}`}
            unit="min"
            testid="reco-total"
            accent
          />
        </div>

        {/* AI explanation */}
        <div
          data-testid="ai-explanation"
          className="bg-[#0A0A0A]/60 border border-white/10 rounded-sm p-4 mb-6 fade-in"
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00E5FF] mb-2 flex items-center gap-2">
            <Sparkle size={10} weight="fill" /> Groq AI Decision Rationale
          </div>
          {explanationLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-white/5 rounded-sm w-full animate-pulse" />
              <div className="h-3 bg-white/5 rounded-sm w-11/12 animate-pulse" />
              <div className="h-3 bg-white/5 rounded-sm w-9/12 animate-pulse" />
            </div>
          ) : (
            <p className="text-sm text-white/80 leading-relaxed">{explanation}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <button
            data-testid="navigate-btn"
            onClick={onNavigate}
            className="flex-1 bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00BFFF] font-bold uppercase tracking-wider rounded-sm h-12 flex items-center justify-center gap-2 transition-colors"
          >
            <Compass size={18} weight="fill" /> Navigate
          </button>
          <button
            data-testid="book-btn"
            onClick={onBook}
            className="flex-1 bg-transparent border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 font-bold uppercase tracking-wider rounded-sm h-12 flex items-center justify-center gap-2 transition-colors"
          >
            <Timer size={18} weight="bold" /> Book Slot
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value, unit, accent, testid }) => (
  <div
    className={`border rounded-sm p-3 ${
      accent ? 'bg-[#00E5FF]/10 border-[#00E5FF]/30' : 'bg-[#13161C] border-white/10'
    }`}
  >
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-1">
      {label}
    </div>
    <div className="flex items-baseline gap-1">
      <span
        data-testid={testid}
        className={`font-mono font-black text-2xl ${accent ? 'text-[#00E5FF]' : 'text-white'}`}
      >
        {value}
      </span>
      <span className="text-xs font-mono text-[#8A94A6]">{unit}</span>
    </div>
  </div>
);
