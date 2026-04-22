from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import math
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Tuple
from datetime import datetime, timezone, timedelta
from groq import Groq


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Groq client
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Create the main app
app = FastAPI(title="Smart EV Charging Decision Engine")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class UserInput(BaseModel):
    battery_level: float = Field(..., ge=0, le=100)
    required_charge: float = Field(..., ge=0, le=100)
    user_lat: float = 12.9716
    user_lng: float = 77.5946
    departure_time: Optional[str] = None  # ISO


class Station(BaseModel):
    model_config = ConfigDict(extra="ignore")
    station_id: str
    name: str
    lat: float
    lng: float
    address: str
    total_slots: int
    available_slots: int
    fast_charger_count: int
    charging_rate_kw: float
    price_per_kwh: float
    is_peak: bool
    thumbnail: str
    queue_length: int


class StationWithMetrics(Station):
    distance_km: float
    travel_time_min: float
    wait_time_min: float
    charge_time_min: float
    total_time_min: float
    in_range: bool
    score: float


class RecommendRequest(UserInput):
    pass


class RecommendResponse(BaseModel):
    emergency_mode: bool
    remaining_range_km: float
    best_station: Optional[StationWithMetrics]
    stations: List[StationWithMetrics]


class BookingRequest(BaseModel):
    station_id: str
    name: str
    phone: str
    expected_arrival: str  # ISO time string
    battery_level: float
    required_charge: float


class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: str
    station_id: str
    station_name: str
    name: str
    phone: str
    expected_arrival: str
    slot_number: int
    start_time: str
    end_time: str
    charge_duration_min: float
    created_at: str
    status: str = "confirmed"


class ExplainRequest(BaseModel):
    station: dict
    battery_level: float
    required_charge: float
    emergency_mode: bool


class ExplainResponse(BaseModel):
    explanation: str


# ---------- Seed Data ----------
# Center around Bangalore (12.9716, 77.5946)
SEED_STATIONS: List[dict] = [
    {
        "station_id": "stn-001",
        "name": "Volt Hub Indiranagar",
        "lat": 12.9784,
        "lng": 77.6408,
        "address": "100 Feet Rd, Indiranagar, Bangalore",
        "total_slots": 8,
        "available_slots": 3,
        "fast_charger_count": 4,
        "charging_rate_kw": 60.0,
        "price_per_kwh": 18.0,
        "is_peak": False,
        "thumbnail": "https://images.unsplash.com/photo-1743993412497-c77a5cfc0019?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBkYXJrfGVufDB8fHx8MTc3Njg0MTE3NHww&ixlib=rb-4.1.0&q=85",
        "queue_length": 1,
    },
    {
        "station_id": "stn-002",
        "name": "Ampere Station Koramangala",
        "lat": 12.9352,
        "lng": 77.6245,
        "address": "80 Feet Rd, Koramangala, Bangalore",
        "total_slots": 6,
        "available_slots": 0,
        "fast_charger_count": 2,
        "charging_rate_kw": 50.0,
        "price_per_kwh": 16.0,
        "is_peak": True,
        "thumbnail": "https://images.pexels.com/photos/12860663/pexels-photo-12860663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "queue_length": 3,
    },
    {
        "station_id": "stn-003",
        "name": "ChargePoint MG Road",
        "lat": 12.9750,
        "lng": 77.6050,
        "address": "MG Road Metro, Bangalore",
        "total_slots": 4,
        "available_slots": 2,
        "fast_charger_count": 1,
        "charging_rate_kw": 30.0,
        "price_per_kwh": 14.0,
        "is_peak": False,
        "thumbnail": "https://images.unsplash.com/photo-1670701951026-f83b1bcf6561?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBkYXJrfGVufDB8fHx8MTc3Njg0MTE3NHww&ixlib=rb-4.1.0&q=85",
        "queue_length": 0,
    },
    {
        "station_id": "stn-004",
        "name": "HyperCharge Whitefield",
        "lat": 12.9698,
        "lng": 77.7500,
        "address": "ITPL Main Rd, Whitefield, Bangalore",
        "total_slots": 10,
        "available_slots": 5,
        "fast_charger_count": 6,
        "charging_rate_kw": 120.0,
        "price_per_kwh": 22.0,
        "is_peak": False,
        "thumbnail": "https://images.unsplash.com/photo-1743993412497-c77a5cfc0019?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBkYXJrfGVufDB8fHx8MTc3Njg0MTE3NHww&ixlib=rb-4.1.0&q=85",
        "queue_length": 0,
    },
    {
        "station_id": "stn-005",
        "name": "EcoCharge Jayanagar",
        "lat": 12.9250,
        "lng": 77.5938,
        "address": "4th Block, Jayanagar, Bangalore",
        "total_slots": 5,
        "available_slots": 4,
        "fast_charger_count": 2,
        "charging_rate_kw": 45.0,
        "price_per_kwh": 15.0,
        "is_peak": False,
        "thumbnail": "https://images.pexels.com/photos/12860663/pexels-photo-12860663.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "queue_length": 0,
    },
    {
        "station_id": "stn-006",
        "name": "BoltBay HSR Layout",
        "lat": 12.9120,
        "lng": 77.6390,
        "address": "Sector 2, HSR Layout, Bangalore",
        "total_slots": 7,
        "available_slots": 1,
        "fast_charger_count": 3,
        "charging_rate_kw": 75.0,
        "price_per_kwh": 19.0,
        "is_peak": True,
        "thumbnail": "https://images.unsplash.com/photo-1670701951026-f83b1bcf6561?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBkYXJrfGVufDB8fHx8MTc3Njg0MTE3NHww&ixlib=rb-4.1.0&q=85",
        "queue_length": 2,
    },
]


# ---------- Helpers ----------
def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    to_rad = math.pi / 180.0
    dlat = (lat2 - lat1) * to_rad
    dlng = (lng2 - lng1) * to_rad
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1 * to_rad) * math.cos(lat2 * to_rad) * math.sin(dlng / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def compute_metrics(station: dict, user_lat: float, user_lng: float, battery: float, required_charge: float, emergency: bool) -> dict:
    # Battery range: ~4 km per 1% (assume 400km full range)
    remaining_range = battery * 4.0
    distance = haversine(user_lat, user_lng, station["lat"], station["lng"])
    # Travel time ~ 30 km/h avg in city
    travel_time = (distance / 30.0) * 60.0
    # Wait time = queue_length * 10 min if available_slots == 0, else 0-3 min
    if station["available_slots"] > 0:
        wait_time = 0.0
    else:
        wait_time = station["queue_length"] * 10.0
    # Charge time: (required_charge / 100) * battery_kwh / charging_rate * 60
    # Assume 60 kWh battery
    energy_needed = (required_charge / 100.0) * 60.0
    charge_time = (energy_needed / station["charging_rate_kw"]) * 60.0
    total_time = travel_time + wait_time + charge_time
    in_range = distance <= remaining_range

    # Scoring: lower is better. Normalize each component 0-100 approx.
    # Weights depend on emergency
    if emergency:
        # Prioritize distance + fast charging
        distance_w, wait_w, speed_w, urgency_w = 0.6, 0.1, 0.3, 0.0
    else:
        distance_w, wait_w, speed_w, urgency_w = 0.3, 0.3, 0.25, 0.15

    # Lower score = better station
    distance_score = distance * 5  # up to ~50
    wait_score = wait_time  # up to ~30
    speed_score = max(0, 150 - station["charging_rate_kw"])  # 150kw best -> 0
    # Urgency: if battery low, favor stations with immediate availability
    urgency_score = 0 if station["available_slots"] > 0 else 20

    score = (
        distance_w * distance_score
        + wait_w * wait_score
        + speed_w * speed_score
        + urgency_w * urgency_score
    )

    return {
        "distance_km": round(distance, 2),
        "travel_time_min": round(travel_time, 1),
        "wait_time_min": round(wait_time, 1),
        "charge_time_min": round(charge_time, 1),
        "total_time_min": round(total_time, 1),
        "in_range": in_range,
        "score": round(score, 2),
    }


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"status": "ok", "service": "Smart EV Charging Decision Engine"}


@api_router.get("/stations", response_model=List[Station])
async def get_stations():
    return [Station(**s) for s in SEED_STATIONS]


@api_router.post("/input")
async def submit_input(payload: UserInput):
    # Persist input session
    doc = payload.model_dump()
    doc["session_id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.sessions.insert_one(doc.copy())
    return {"session_id": doc["session_id"], "received": payload.model_dump()}


@api_router.post("/recommend", response_model=RecommendResponse)
async def recommend(payload: RecommendRequest):
    emergency = payload.battery_level < 15
    remaining_range = payload.battery_level * 4.0

    results: List[StationWithMetrics] = []
    for s in SEED_STATIONS:
        metrics = compute_metrics(
            s, payload.user_lat, payload.user_lng,
            payload.battery_level, payload.required_charge, emergency
        )
        combined = {**s, **metrics}
        results.append(StationWithMetrics(**combined))

    # Filter
    candidates = [r for r in results if r.in_range]
    if emergency:
        # Sort by distance, prefer fast chargers
        candidates.sort(key=lambda r: (r.distance_km, -r.fast_charger_count))
    else:
        candidates.sort(key=lambda r: r.score)

    best = candidates[0] if candidates else None

    # Sort the full list by score too
    results_sorted = sorted(results, key=lambda r: r.score)

    return RecommendResponse(
        emergency_mode=emergency,
        remaining_range_km=round(remaining_range, 2),
        best_station=best,
        stations=results_sorted,
    )


@api_router.post("/book-slot", response_model=Booking)
async def book_slot(payload: BookingRequest):
    station = next((s for s in SEED_STATIONS if s["station_id"] == payload.station_id), None)
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    # Assign slot number: next available slot index (1..total_slots)
    existing = await db.bookings.count_documents({"station_id": payload.station_id})
    slot_number = (existing % station["total_slots"]) + 1

    try:
        arrival_dt = datetime.fromisoformat(payload.expected_arrival.replace("Z", "+00:00"))
    except Exception:
        arrival_dt = datetime.now(timezone.utc) + timedelta(minutes=15)

    energy_needed = (payload.required_charge / 100.0) * 60.0
    charge_duration = (energy_needed / station["charging_rate_kw"]) * 60.0
    end_dt = arrival_dt + timedelta(minutes=charge_duration)

    booking = Booking(
        booking_id=str(uuid.uuid4()),
        station_id=payload.station_id,
        station_name=station["name"],
        name=payload.name,
        phone=payload.phone,
        expected_arrival=arrival_dt.isoformat(),
        slot_number=slot_number,
        start_time=arrival_dt.isoformat(),
        end_time=end_dt.isoformat(),
        charge_duration_min=round(charge_duration, 1),
        created_at=datetime.now(timezone.utc).isoformat(),
        status="confirmed",
    )

    await db.bookings.insert_one(booking.model_dump())
    return booking


@api_router.get("/bookings", response_model=List[Booking])
async def list_bookings():
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return [Booking(**d) for d in docs]


@api_router.post("/explain", response_model=ExplainResponse)
async def explain(payload: ExplainRequest):
    if not groq_client:
        return ExplainResponse(
            explanation="This station is recommended based on its proximity, availability, and charging speed."
        )

    station = payload.station
    mode = "EMERGENCY MODE" if payload.emergency_mode else "STANDARD MODE"

    prompt = f"""You are an expert EV charging assistant. Explain concisely (2-3 sentences, no markdown) why this charging station is recommended for the driver.

Context:
- Mode: {mode}
- Driver battery: {payload.battery_level}%
- Required charge: {payload.required_charge}%

Station:
- Name: {station.get('name')}
- Distance: {station.get('distance_km')} km
- Available slots: {station.get('available_slots')}/{station.get('total_slots')}
- Fast chargers: {station.get('fast_charger_count')}
- Charging rate: {station.get('charging_rate_kw')} kW
- Wait time: {station.get('wait_time_min')} min
- Total time: {station.get('total_time_min')} min

Write in a confident, concise, helpful tone. Mention concrete numbers."""

    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a concise EV charging decision assistant."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.6,
            max_tokens=200,
        )
        text = completion.choices[0].message.content.strip()
        return ExplainResponse(explanation=text)
    except Exception as e:
        logger.error(f"Groq error: {e}")
        return ExplainResponse(
            explanation=f"Recommended: {station.get('name')} is {station.get('distance_km')} km away with {station.get('available_slots')} slots available and {station.get('charging_rate_kw')} kW charging — ideal for your current battery level."
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
