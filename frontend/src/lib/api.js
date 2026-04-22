import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' },
});

export const getStations = () => api.get('/stations').then((r) => r.data);
export const submitInput = (payload) => api.post('/input', payload).then((r) => r.data);
export const recommend = (payload) => api.post('/recommend', payload).then((r) => r.data);
export const bookSlot = (payload) => api.post('/book-slot', payload).then((r) => r.data);
export const explain = (payload) => api.post('/explain', payload).then((r) => r.data);
export const getBookings = () => api.get('/bookings').then((r) => r.data);
