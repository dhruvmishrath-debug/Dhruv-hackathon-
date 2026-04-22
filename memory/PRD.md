# Smart EV Charging Decision Engine — PRD

## Problem Statement
Build a full-stack AI-powered web app "Smart EV Charging Decision Engine with Booking System" that helps users find nearest EV charging stations, analyze availability, recommend the best station via AI, handle emergency battery situations, allow booking slots, and provide navigation.

## Tech Stack
- FastAPI backend + MongoDB
- React + Tailwind + shadcn/ui frontend
- Groq API (llama-3.3-70b-versatile) for AI explanations
- Leaflet + react-leaflet (CartoDB Dark) for maps
- Phosphor Icons

## User Persona
Indian EV driver navigating a busy city, needs to decide where to charge quickly — especially under emergency low-battery conditions.

## Core Requirements (static)
- Vehicle data input (battery%, required charge, location, departure)
- Battery range filter (4 km per %)
- Emergency mode when battery < 15%
- Wait time + charging time estimates
- AI scoring engine (distance + wait + speed + urgency)
- Station details with Leaflet route map
- Booking system with slot allocation
- AI explanation via Groq

## Implemented (Feb 2026)
- `POST /api/input` — session log
- `GET /api/stations` — 6 seeded stations
- `POST /api/recommend` — scoring + emergency logic
- `POST /api/book-slot` — slot allocation
- `GET /api/bookings` — list bookings
- `POST /api/explain` — Groq AI reasoning
- Dashboard UI: header, input panel, emergency banner, station list, recommendation big card, station details + leaflet map, time breakdown, booking form
- Dark Performance Pro theme (#0A0A0A base, #00E5FF accent, #FF3B30 emergency)

## Backlog / Next
- P1: Save user preferences (preferred stations, history)
- P1: Real-time slot availability (websocket)
- P2: Real Google Maps integration with traffic data
- P2: Payment integration for pre-booking
- P2: Multi-vehicle profiles
