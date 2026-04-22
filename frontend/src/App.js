import React, { useEffect, useState } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Lightning } from '@phosphor-icons/react';
import { InputPanel } from './components/InputPanel';
import { EmergencyBanner } from './components/EmergencyBanner';
import { StationList } from './components/StationList';
import { RecommendationCard } from './components/RecommendationCard';
import { StationDetails } from './components/StationDetails';
import { TimeBreakdown } from './components/TimeBreakdown';
import { BookingPanel } from './components/BookingPanel';
import { recommend, explain, submitInput } from './lib/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const [input, setInput] = useState({
    battery_level: 45,
    required_charge: 60,
    user_lat: 12.9750,
    user_lng: 77.6050,
    departure_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // { emergency_mode, stations, best_station, remaining_range_km }
  const [selected, setSelected] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [booking, setBooking] = useState(null);

  const runAnalysis = async () => {
    setLoading(true);
    setBooking(null);
    try {
      // Fire-and-forget session log
      submitInput(input).catch(() => {});
      const res = await recommend(input);
      setData(res);
      setSelected(res.best_station || (res.stations?.[0] ?? null));

      // Generate AI explanation
      if (res.best_station) {
        setExplanationLoading(true);
        setExplanation('');
        try {
          const ex = await explain({
            station: res.best_station,
            battery_level: input.battery_level,
            required_charge: input.required_charge,
            emergency_mode: res.emergency_mode,
          });
          setExplanation(ex.explanation);
        } catch (e) {
          setExplanation(
            `${res.best_station.name} is ${res.best_station.distance_km} km away with ${res.best_station.available_slots} slots free — optimal choice.`
          );
        } finally {
          setExplanationLoading(false);
        }
      }

      if (res.emergency_mode) {
        toast.error('Emergency Mode Activated — Battery critical!');
      } else {
        toast.success('Best station identified');
      }
    } catch (e) {
      toast.error('Failed to analyze. Check backend.');
    } finally {
      setLoading(false);
    }
  };

  // Initial run
  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNavigate = () => {
    if (!selected) return;
    const url = `https://www.openstreetmap.org/directions?from=${input.user_lat},${input.user_lng}&to=${selected.lat},${selected.lng}`;
    window.open(url, '_blank');
    toast.success(`Navigating to ${selected.name}`);
  };

  const onBook = () => {
    const el = document.getElementById('booking-panel');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const stations = data?.stations || [];
  const best = data?.best_station;
  const emergency = data?.emergency_mode || false;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white grid-bg">
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#13161C',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            fontFamily: 'JetBrains Mono, monospace',
            borderRadius: 2,
          },
        }}
      />

      {/* Top header bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0A0A0A]/80 border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00E5FF] flex items-center justify-center rounded-sm">
              <Lightning size={22} weight="fill" className="text-[#0A0A0A]" />
            </div>
            <div>
              <div className="font-heading font-black text-lg tracking-tight text-white leading-none">
                VOLTPATH
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8A94A6] mt-0.5">
                EV Decision Engine · v1.0
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[#8A94A6]">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00F58D] rounded-full emergency-pulse" />
              Groq AI Online
            </div>
            <div className="hidden lg:block">
              Range · <span className="text-[#00E5FF] font-bold">{(input.battery_level * 4).toFixed(0)}km</span>
            </div>
          </div>
        </div>
        {emergency && <EmergencyBanner batteryLevel={input.battery_level} />}
      </header>

      <main className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Top Input Panel */}
        <InputPanel
          input={input}
          setInput={setInput}
          onAnalyze={runAnalysis}
          loading={loading}
        />

        {/* Center row: left list, center reco, right details */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 lg:col-span-3">
            <StationList
              stations={stations}
              selectedId={selected?.station_id}
              onSelect={setSelected}
              bestId={best?.station_id}
              emergency={emergency}
            />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <RecommendationCard
              best={best}
              explanation={explanation}
              explanationLoading={explanationLoading}
              emergency={emergency}
              onNavigate={onNavigate}
              onBook={onBook}
            />
          </div>
          <div className="col-span-12 lg:col-span-3">
            <StationDetails station={selected} user={input} />
          </div>
        </div>

        {/* Bottom row: time + booking */}
        <div id="booking-panel" className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 lg:col-span-6">
            <TimeBreakdown station={selected} />
          </div>
          <div className="col-span-12 lg:col-span-6">
            <BookingPanel
              station={selected}
              batteryLevel={input.battery_level}
              requiredCharge={input.required_charge}
              booking={booking}
              setBooking={setBooking}
            />
          </div>
        </div>

        <footer className="text-center text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]/60 pt-6 pb-10">
          VOLTPATH · Smart EV Decision Engine · Powered by Groq · Leaflet · FastAPI
        </footer>
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
