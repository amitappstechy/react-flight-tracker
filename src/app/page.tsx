'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Flight } from './api/flights/route';
import FlightLog from './components/FlightLog';
import SearchHistory from './components/SearchHistory';

export default function Home() {
  const [query, setQuery] = useState('');
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<Flight[]>([]);

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'On Time': return 'on-time';
      case 'Delayed': return 'delayed';
      case 'Cancelled': return 'cancelled';
      case 'In Air': return 'in-air';
      default: return 'on-time';
    }
  };

  const generateCalendarUrl = (flight: Flight) => {
    const title = `Flight ${flight.flightNumber} to ${flight.arrival.location}`;
    const start = flight.departure.time.replace(/[-:.]/g, '');
    const end = flight.arrival.time.replace(/[-:.]/g, '');
    const details = `Flight: ${flight.airline} ${flight.flightNumber}\nStatus: ${flight.status}\nRoute: ${flight.departure.airport} to ${flight.arrival.airport}`;
    const location = `${flight.departure.location} to ${flight.arrival.location}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  };

  const performSearch = async (flightNum: string) => {
    if (!flightNum.trim()) return;

    setLoading(true);
    setError('');
    setFlights(null);

    try {
      const res = await fetch(`/api/flights?flightNumber=${encodeURIComponent(flightNum)}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      const data = await res.json();
      setFlights(data);
      if (data.length === 0) {
        setError('No flights found with that number');
      } else {
        setSearchHistory(prev => {
          const flight = data[0]; // Assuming single flight result
          // Remove if it exists (by flight number equality) to move to top
          const filtered = prev.filter(h => h.flightNumber !== flight.flightNumber);
          const newHistory = [flight, ...filtered];
          return newHistory.slice(0, 5);
        });
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <main className="container">
      <div className="header-container">
        <Image
          src="/logo.png"
          alt="AppsTechy Logo"
          width={80}
          height={80}
          className="app-logo"
        />
        <h1 className="title">AppsTechy Flight Booking Portal</h1>
      </div>

      <form onSubmit={onFormSubmit} className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Flight Number (e.g. AA999)..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      <div className="results">
        {flights?.map((flight) => (
          <a
            key={flight.id}
            href={generateCalendarUrl(flight)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-link"
          >
            <div className="card">
              <div className="flight-header">
                <div>
                  <div className="flight-number">{flight.flightNumber}</div>
                  <div className="airline">{flight.airline}</div>
                </div>
                <div className={`status ${getStatusClass(flight.status)}`}>
                  {flight.status}
                </div>
              </div>

              <div className="flight-route">
                <div className="location-info">
                  <div className="airport-code">{flight.departure.airport}</div>
                  <div className="city">{flight.departure.location}</div>
                  <div className="time" suppressHydrationWarning>{formatTime(flight.departure.time)}</div>
                  <div className="timezone">{flight.departure.timezone}</div>
                </div>

                <div className="duration-line">
                  <span className="duration-text">{flight.duration}</span>
                  <span className="plane-icon">✈</span>
                </div>

                <div className="location-info end">
                  <div className="airport-code">{flight.arrival.airport}</div>
                  <div className="city">{flight.arrival.location}</div>
                  <div className="time" suppressHydrationWarning>{formatTime(flight.arrival.time)}</div>
                  <div className="timezone">{flight.arrival.timezone}</div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <SearchHistory history={searchHistory} onSelect={(flightNumber) => {
        setQuery(flightNumber);
        performSearch(flightNumber);
      }} />

      <FlightLog />
    </main>
  );
}
