import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CheckCircle, Timer } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { bookSlot } from '../lib/api';

export const BookingPanel = ({ station, batteryLevel, requiredCharge, booking, setBooking }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    expected_arrival: '',
  });
  const [loading, setLoading] = useState(false);

  const canBook = station && form.name && form.phone.length >= 7;

  const submit = async (e) => {
    e.preventDefault();
    if (!canBook) {
      toast.error('Fill all fields and select a station.');
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const [hh, mm] = (form.expected_arrival || '').split(':');
      let iso;
      if (hh != null && mm != null) {
        const d = new Date();
        d.setHours(parseInt(hh), parseInt(mm), 0, 0);
        iso = d.toISOString();
      } else {
        iso = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
      }
      const result = await bookSlot({
        station_id: station.station_id,
        name: form.name,
        phone: form.phone,
        expected_arrival: iso,
        battery_level: batteryLevel,
        required_charge: requiredCharge,
      });
      setBooking(result);
      toast.success('Slot booked successfully!');
    } catch (err) {
      toast.error('Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBooking(null);
    setForm({ name: '', phone: '', expected_arrival: '' });
  };

  if (booking) {
    return (
      <div
        data-testid="booking-confirmation"
        className="bg-[#13161C] border border-[#00F58D]/40 rounded-sm p-6 h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={28} weight="fill" className="text-[#00F58D]" />
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#00F58D]">
              Booking Confirmed
            </div>
            <h3 className="text-lg font-heading font-bold text-white">
              Slot Reserved · {booking.station_name}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Info label="Slot Number" value={`#${booking.slot_number}`} />
          <Info label="Duration" value={`${booking.charge_duration_min} min`} />
          <Info label="Start" value={new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
          <Info label="End" value={new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-3 mb-4">
          <div className="text-xs font-mono text-[#8A94A6] mb-1">Booking ID</div>
          <div className="font-mono text-sm text-white break-all">{booking.booking_id}</div>
        </div>

        <Button
          data-testid="new-booking-btn"
          onClick={reset}
          className="w-full bg-transparent border border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 font-bold uppercase tracking-wider rounded-sm h-10"
        >
          Make Another Booking
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#13161C] border border-white/10 rounded-sm p-6 h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center rounded-sm">
          <Timer size={18} weight="bold" className="text-[#00E5FF]" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6]">
            Reservation
          </div>
          <h3 className="text-lg font-heading font-bold text-white">Book a Slot</h3>
        </div>
      </div>

      {!station ? (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-4 text-center text-sm text-[#8A94A6] font-mono">
          Select a station first
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-3">
            <div className="text-xs font-mono uppercase tracking-widest text-[#8A94A6]">
              Station
            </div>
            <div className="font-mono text-sm text-white">{station.name}</div>
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Full Name
            </Label>
            <Input
              data-testid="booking-name-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
              className="bg-[#0A0A0A] border border-white/10 text-white focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent rounded-sm h-10 font-mono"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Phone Number
            </Label>
            <Input
              data-testid="booking-phone-input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^0-9+\-\s]/g, '') })}
              placeholder="+91 98765 43210"
              className="bg-[#0A0A0A] border border-white/10 text-white focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent rounded-sm h-10 font-mono"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Expected Arrival
            </Label>
            <Input
              data-testid="booking-arrival-input"
              type="time"
              value={form.expected_arrival}
              onChange={(e) => setForm({ ...form, expected_arrival: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 text-white focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent rounded-sm h-10 font-mono"
            />
          </div>

          <Button
            type="submit"
            data-testid="booking-submit-btn"
            disabled={loading || !canBook}
            className="w-full bg-[#00E5FF] text-[#0A0A0A] hover:bg-[#00BFFF] font-bold uppercase tracking-wider rounded-sm h-11"
          >
            {loading ? 'Booking…' : 'Confirm Booking'}
          </Button>
        </form>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-[#0A0A0A] border border-white/10 rounded-sm p-3">
    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8A94A6] mb-1">
      {label}
    </div>
    <div className="font-mono font-bold text-white">{value}</div>
  </div>
);
