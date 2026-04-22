"""Backend tests for Smart EV Charging Decision Engine."""
import os
import pytest
import requests
from datetime import datetime, timezone, timedelta

# Use public backend URL from frontend env
BASE_URL = "https://smart-charging-hub-2.preview.emergentagent.com"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Stations ----------
class TestStations:
    def test_get_stations_returns_6(self, client):
        r = client.get(f"{API}/stations", timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        required = {
            "station_id", "name", "lat", "lng", "total_slots",
            "available_slots", "fast_charger_count", "charging_rate_kw",
        }
        for s in data:
            assert required.issubset(s.keys())
            assert isinstance(s["station_id"], str)
            assert isinstance(s["total_slots"], int)


# ---------- Input ----------
class TestInput:
    def test_post_input_returns_session_id(self, client):
        payload = {
            "battery_level": 60,
            "required_charge": 50,
            "user_lat": 12.9716,
            "user_lng": 77.5946,
            "departure_time": datetime.now(timezone.utc).isoformat(),
        }
        r = client.post(f"{API}/input", json=payload, timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert "session_id" in data
        assert isinstance(data["session_id"], str) and len(data["session_id"]) > 0
        assert data["received"]["battery_level"] == 60


# ---------- Recommend ----------
class TestRecommend:
    def _payload(self, battery):
        return {
            "battery_level": battery,
            "required_charge": 60,
            "user_lat": 12.9716,
            "user_lng": 77.5946,
            "departure_time": datetime.now(timezone.utc).isoformat(),
        }

    def test_recommend_normal_battery(self, client):
        r = client.post(f"{API}/recommend", json=self._payload(60), timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["emergency_mode"] is False
        assert data["remaining_range_km"] == 240.0
        assert data["best_station"] is not None
        assert isinstance(data["stations"], list)
        assert len(data["stations"]) == 6
        # Verify all stations have required metric fields
        for s in data["stations"]:
            for k in ("distance_km", "travel_time_min", "wait_time_min",
                      "charge_time_min", "total_time_min", "in_range", "score"):
                assert k in s
        # sorted ascending by score
        scores = [s["score"] for s in data["stations"]]
        assert scores == sorted(scores)

    def test_recommend_emergency_low_battery(self, client):
        r = client.post(f"{API}/recommend", json=self._payload(10), timeout=20)
        assert r.status_code == 200
        data = r.json()
        assert data["emergency_mode"] is True
        assert data["remaining_range_km"] == 40.0
        # best_station should be nearest in-range (emergency prioritizes distance + fast chargers)
        assert data["best_station"] is not None
        assert data["best_station"]["in_range"] is True

    def test_recommend_out_of_range_flag(self, client):
        # very low battery 2% => 8km range, only nearest ones in-range
        r = client.post(f"{API}/recommend", json=self._payload(2), timeout=20)
        assert r.status_code == 200
        data = r.json()
        out_of_range = [s for s in data["stations"] if not s["in_range"]]
        # at least some stations must be out of range given 8km limit
        assert len(out_of_range) >= 1


# ---------- Book Slot ----------
class TestBooking:
    @pytest.fixture(scope="class")
    def booking_id(self, client):
        arrival = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
        payload = {
            "station_id": "stn-001",
            "name": "TEST_User",
            "phone": "9999999999",
            "expected_arrival": arrival,
            "battery_level": 45,
            "required_charge": 60,
        }
        r = client.post(f"{API}/book-slot", json=payload, timeout=20)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "booking_id" in data
        assert data["station_id"] == "stn-001"
        assert data["station_name"] == "Volt Hub Indiranagar"
        assert isinstance(data["slot_number"], int) and 1 <= data["slot_number"] <= 8
        assert data["charge_duration_min"] > 0
        assert data["status"] == "confirmed"
        return data["booking_id"]

    def test_booking_persisted_and_listed(self, client, booking_id):
        r = client.get(f"{API}/bookings", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # Ensure no _id leaked from MongoDB
        for it in items:
            assert "_id" not in it
        ids = [b["booking_id"] for b in items]
        assert booking_id in ids
        # sorted by created_at desc - first one should be most recent
        timestamps = [b["created_at"] for b in items]
        assert timestamps == sorted(timestamps, reverse=True)

    def test_booking_invalid_station_404(self, client):
        payload = {
            "station_id": "does-not-exist",
            "name": "TEST_X",
            "phone": "1234567890",
            "expected_arrival": datetime.now(timezone.utc).isoformat(),
            "battery_level": 50,
            "required_charge": 50,
        }
        r = client.post(f"{API}/book-slot", json=payload, timeout=20)
        assert r.status_code == 404


# ---------- Explain (Groq) ----------
class TestExplain:
    def test_explain_returns_text(self, client):
        # First get a station via recommend
        rec = client.post(f"{API}/recommend", json={
            "battery_level": 45,
            "required_charge": 60,
            "user_lat": 12.9716,
            "user_lng": 77.5946,
        }, timeout=20).json()
        station = rec["best_station"]
        r = client.post(f"{API}/explain", json={
            "station": station,
            "battery_level": 45,
            "required_charge": 60,
            "emergency_mode": False,
        }, timeout=45)
        assert r.status_code == 200
        data = r.json()
        assert "explanation" in data
        assert isinstance(data["explanation"], str)
        assert len(data["explanation"]) > 20
