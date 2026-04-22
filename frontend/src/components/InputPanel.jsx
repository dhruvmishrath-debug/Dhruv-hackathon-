import React from 'react';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Lightning, MapPin, Clock, BatteryCharging } from '@phosphor-icons/react';

const LOCATIONS = [
  { name: 'MG Road', lat: 12.9750, lng: 77.6050 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Jayanagar', lat: 12.9250, lng: 77.5938 },
];

export const InputPanel = ({ input, setInput, onAnalyze, loading }) => {
  const selectedLoc = LOCATIONS.find(
    (l) => l.lat === input.user_lat && l.lng === input.user_lng
  ) || LOCATIONS[0];

  return (
    <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center rounded-sm">
            <Lightning size={20} weight="fill" className="text-[#00E5FF]" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
              Mission Brief
            </div>
            <h2 className="text-xl font-heading font-bold text-white">
              EV Charging Decision Console
            </h2>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8A94A6]">
          <div className="w-2 h-2 bg-[#00F58D] rounded-full emergency-pulse" />
          Live Grid Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Battery */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4">
          <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-3 flex items-center gap-2">
            <BatteryCharging size={14} /> Battery Level
          </Label>
          <div className="flex items-end justify-between mb-3">
            <span
              data-testid="battery-level-display"
              className={`font-mono font-black text-4xl ${input.battery_level < 15 ? 'text-[#FF3B30]' : 'text-[#00E5FF]'}`}
            >
              {input.battery_level}
            </span>
            <span className="text-sm font-mono text-[#8A94A6]">%</span>
          </div>
          <Slider
            data-testid="battery-slider"
            value={[input.battery_level]}
            min={1}
            max={100}
            step={1}
            onValueChange={(v) => setInput({ ...input, battery_level: v[0] })}
            className="mt-2"
          />
          <div className="text-xs font-mono text-[#8A94A6] mt-2">
            Range: ~{(input.battery_level * 4).toFixed(0)} km
          </div>
        </div>

        {/* Required charge */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4">
          <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-3 flex items-center gap-2">
            <Lightning size={14} /> Required Charge
          </Label>
          <div className="flex items-end justify-between mb-3">
            <span
              data-testid="required-charge-display"
              className="font-mono font-black text-4xl text-white"
            >
              {input.required_charge}
            </span>
            <span className="text-sm font-mono text-[#8A94A6]">%</span>
          </div>
          <Slider
            data-testid="required-charge-slider"
            value={[input.required_charge]}
            min={10}
            max={100}
            step={5}
            onValueChange={(v) => setInput({ ...input, required_charge: v[0] })}
            className="mt-2"
          />
          <div className="text-xs font-mono text-[#8A94A6] mt-2">
            ~{((input.required_charge / 100) * 60).toFixed(0)} kWh needed
          </div>
        </div>

        {/* Location */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4">
          <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-3 flex items-center gap-2">
            <MapPin size={14} /> Current Location
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {LOCATIONS.slice(0, 4).map((loc) => (
              <button
                key={loc.name}
                data-testid={`location-btn-${loc.name.toLowerCase()}`}
                onClick={() =>
                  setInput({ ...input, user_lat: loc.lat, user_lng: loc.lng })
                }
                className={`text-xs font-mono uppercase tracking-wider py-2 px-2 border rounded-sm transition-colors ${
                  selectedLoc.name === loc.name
                    ? 'bg-[#00E5FF] text-[#0A0A0A] border-[#00E5FF]'
                    : 'bg-transparent text-[#8A94A6] border-white/10 hover:border-[#00E5FF]/50 hover:text-white'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>
          <div className="text-xs font-mono text-[#8A94A6] mt-3">
            {selectedLoc.lat.toFixed(4)}, {selectedLoc.lng.toFixed(4)}
          </div>
        </div>

        {/* Departure */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4 flex flex-col">
          <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-3 flex items-center gap-2">
            <Clock size={14} /> Departure Time
          </Label>
          <Input
            data-testid="departure-time-input"
            type="time"
            value={input.departure_time || ''}
            onChange={(e) => setInput({ ...input, departure_time: e.target.value })}
            className="bg-[#13161C] border border-white/10 text-white focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent rounded-sm h-10 font-mono"
          />
          <Button
            data-testid="analyze-btn"
            onClick={onAnalyze}
            disabled={loading}
            className="mt-auto bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00BFFF] font-bold uppercase tracking-wider rounded-sm h-10 mt-3"
          >
            {loading ? 'Analyzing…' : 'Find Best Station'}
          </Button>
        </div>
      </div>
    </div>
  );
};
