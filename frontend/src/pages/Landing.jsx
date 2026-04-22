import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Lightning, ArrowRight, Gauge, BatteryCharging, MapPin } from '@phosphor-icons/react';

const VEHICLES = [
  {
    brand: 'Ather',
    model: '450X',
    type: 'Electric Scooter',
    image:
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1200&q=80',
    range: '150 km',
    top_speed: '90 km/h',
    charge_time: '4h 30m',
    color: '#00E5FF',
  },
  {
    brand: 'Tata',
    model: 'Nexon EV',
    type: 'Electric SUV',
    image:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    range: '465 km',
    top_speed: '150 km/h',
    charge_time: '56 min (DC)',
    color: '#00F58D',
  },
  {
    brand: 'Revolt',
    model: 'RV400',
    type: 'Electric Motorcycle',
    image:
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    range: '150 km',
    top_speed: '85 km/h',
    charge_time: '4h 30m',
    color: '#FF9F0A',
  },
  {
    brand: 'Ola',
    model: 'S1 Pro',
    type: 'Electric Scooter',
    image:
      'https://images.unsplash.com/photo-1604868189265-219ba7bf7ea3?auto=format&fit=crop&w=1200&q=80',
    range: '181 km',
    top_speed: '116 km/h',
    charge_time: '6h 30m',
    color: '#FF3B8B',
  },
];

const VehicleSection = ({ vehicle, index, total }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 6]);
  const idxStr = String(index + 1).padStart(2, '0');

  const reverse = index % 2 === 1;

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center justify-center px-4 md:px-6 py-20 relative overflow-hidden"
      data-testid={`vehicle-section-${vehicle.brand.toLowerCase()}`}
    >
      {/* Floating gradient blob */}
      <motion.div
        style={{ y, opacity }}
        className="absolute -z-10 w-[600px] h-[600px] rounded-full blur-3xl"
        initial={false}
        animate={{
          background: `radial-gradient(circle, ${vehicle.color}22 0%, transparent 70%)`,
        }}
      />

      <div
        className={`max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
          reverse ? 'lg:grid-flow-dense' : ''
        }`}
      >
        {/* Text side */}
        <motion.div
          style={{ opacity }}
          className={reverse ? 'lg:col-start-2' : ''}
        >
          <div
            className="text-xs font-mono uppercase tracking-[0.3em] mb-4"
            style={{ color: vehicle.color }}
          >
            <span className="opacity-60">{idxStr}</span>
            <span className="opacity-30 mx-2">/</span>
            <span className="opacity-60">{String(total).padStart(2, '0')}</span>
            <span className="mx-3 opacity-30">·</span>
            {vehicle.type}
          </div>

          <h2 className="font-heading font-black text-5xl md:text-6xl lg:text-7xl tracking-tighter text-white leading-none mb-2">
            {vehicle.brand}
          </h2>
          <h3
            className="font-heading font-light text-3xl md:text-4xl tracking-tight mb-8"
            style={{ color: vehicle.color }}
          >
            {vehicle.model}
          </h3>

          <div className="grid grid-cols-3 gap-3 mb-8 max-w-md">
            <Spec
              icon={MapPin}
              label="Range"
              value={vehicle.range}
              color={vehicle.color}
            />
            <Spec
              icon={Gauge}
              label="Top Speed"
              value={vehicle.top_speed}
              color={vehicle.color}
            />
            <Spec
              icon={BatteryCharging}
              label="Charge"
              value={vehicle.charge_time}
              color={vehicle.color}
            />
          </div>

          <p className="text-base text-[#8A94A6] leading-relaxed max-w-md mb-6">
            Compatible with all VoltPath stations. AI finds the best charger for
            your {vehicle.brand} {vehicle.model} based on battery & route.
          </p>
        </motion.div>

        {/* Image side with parallax */}
        <motion.div
          style={{ y, scale, rotate }}
          className={`relative ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
        >
          <div
            className="absolute inset-0 rounded-sm blur-2xl opacity-40"
            style={{ background: vehicle.color }}
          />
          <div
            className="relative aspect-square md:aspect-[4/5] rounded-sm overflow-hidden border"
            style={{ borderColor: `${vehicle.color}40` }}
          >
            <img
              src={vehicle.image}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]/20" />

            {/* Corner label */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <div
                  className="text-[10px] font-mono uppercase tracking-[0.25em] mb-1"
                  style={{ color: vehicle.color }}
                >
                  Compatible
                </div>
                <div className="font-heading text-white text-lg font-bold">
                  {vehicle.brand} {vehicle.model}
                </div>
              </div>
              <div
                className="w-10 h-10 flex items-center justify-center border rounded-sm"
                style={{ borderColor: `${vehicle.color}60`, background: `${vehicle.color}15` }}
              >
                <Lightning
                  size={18}
                  weight="fill"
                  style={{ color: vehicle.color }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Spec = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#13161C] border border-white/10 rounded-sm p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={11} style={{ color }} />
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
        {label}
      </div>
    </div>
    <div className="font-mono font-bold text-sm text-white">{value}</div>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });
  const progressWidth = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#00E5FF] origin-left z-50"
        style={{ width: progressWidth }}
        data-testid="scroll-progress"
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#0A0A0A]/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00E5FF] flex items-center justify-center rounded-sm">
              <Lightning size={18} weight="fill" className="text-[#0A0A0A]" />
            </div>
            <div>
              <div className="font-heading font-black text-base tracking-tight leading-none">
                VOLTPATH
              </div>
              <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#8A94A6] mt-0.5">
                Smart EV Charging
              </div>
            </div>
          </div>
          <button
            data-testid="launch-app-header-btn"
            onClick={() => navigate('/dashboard')}
            className="text-xs font-mono uppercase tracking-widest px-4 py-2 border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF] hover:text-[#0A0A0A] rounded-sm transition-colors flex items-center gap-2"
          >
            Launch App <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="min-h-screen flex items-center justify-center px-4 md:px-6 relative overflow-hidden pt-20">
        {/* Grid backdrop */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 229, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.04) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute -z-10 w-[800px] h-[800px] rounded-full bg-[#00E5FF]/10 blur-3xl" />

        <div className="relative max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#00E5FF]/40 bg-[#00E5FF]/5 rounded-sm mb-6"
          >
            <div className="w-1.5 h-1.5 bg-[#00F58D] rounded-full emergency-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#00E5FF]">
              Powered by Groq AI
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-heading font-black text-5xl sm:text-6xl lg:text-8xl tracking-tighter leading-[0.9] mb-6"
          >
            Charge smarter.
            <br />
            <span className="text-[#00E5FF]">Never strand.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base md:text-lg text-[#8A94A6] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI that picks the best EV charger in real time for your Ather, Tata,
            Revolt or Ola. Book a slot in seconds. Stay ahead of the queue.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <button
              data-testid="hero-launch-btn"
              onClick={() => navigate('/dashboard')}
              className="bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00BFFF] font-bold uppercase tracking-wider rounded-sm h-12 px-7 flex items-center gap-2 transition-colors"
            >
              Start Charging <ArrowRight size={16} weight="bold" />
            </button>
            <a
              href="#vehicles"
              className="text-xs font-mono uppercase tracking-widest text-[#8A94A6] hover:text-white transition-colors flex items-center gap-2"
            >
              Scroll to explore <ArrowRight size={12} className="rotate-90" />
            </a>
          </motion.div>

          {/* Hero stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto"
          >
            {[
              { k: '6+', v: 'Stations' },
              { k: '< 3s', v: 'AI Decision' },
              { k: '4', v: 'EV Brands' },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-[#13161C]/60 backdrop-blur border border-white/10 rounded-sm p-4"
              >
                <div className="font-heading font-black text-3xl text-[#00E5FF]">
                  {s.k}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A94A6] mt-1">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint arrow */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#8A94A6] text-xs font-mono uppercase tracking-widest flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-[#00E5FF]/60" />
          Scroll
        </motion.div>
      </section>

      {/* Section tag */}
      <div id="vehicles" className="max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#00E5FF] mb-2">
          · Compatible Fleet ·
        </div>
        <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tighter text-white">
          Every ride. Every charge.
        </h2>
        <div className="text-sm text-[#8A94A6] mt-2 max-w-xl">
          Scroll through the EVs VoltPath supports — from scooters to SUVs.
        </div>
      </div>

      {/* Vehicle sections */}
      {VEHICLES.map((v, i) => (
        <VehicleSection
          key={v.brand}
          vehicle={v}
          index={i}
          total={VEHICLES.length}
        />
      ))}

      {/* Final CTA */}
      <section className="min-h-[60vh] flex items-center justify-center px-4 md:px-6 py-20 relative">
        <div className="absolute -z-10 w-[600px] h-[600px] rounded-full bg-[#00E5FF]/10 blur-3xl" />
        <div className="text-center max-w-3xl">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-[#00E5FF] mb-4">
            Ready to roll
          </div>
          <h2 className="font-heading font-black text-4xl md:text-6xl tracking-tighter mb-6 leading-[0.95]">
            Let AI pick
            <br />
            your next charge.
          </h2>
          <button
            data-testid="final-cta-btn"
            onClick={() => navigate('/dashboard')}
            className="bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00BFFF] font-bold uppercase tracking-wider rounded-sm h-14 px-10 inline-flex items-center gap-3 transition-colors"
          >
            Launch VoltPath <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </section>

      <footer className="text-center text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]/60 pb-10">
        VOLTPATH · Powered by Groq · FastAPI · Leaflet
      </footer>
    </div>
  );
}
