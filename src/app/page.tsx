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
  const [date, setDate] = useState('');

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

  const performSearch = async (flightNumOrQuery: string) => {
    if (!flightNumOrQuery.trim()) return;

    setLoading(true);
    setError('');
    setFlights(null);

    try {
      // Determine if simple flight number or parsing needed
      // Simple logic: if it has spaces or doesn't look like XX123, try AI
      const isSimpleFlightNum = /^[A-Z0-9]{2,3}\d{1,4}$/i.test(flightNumOrQuery.trim());

      let searchParams = new URLSearchParams();

      if (isSimpleFlightNum) {
        searchParams.set('flightNumber', flightNumOrQuery.trim());
      } else {
        // Call AI Endpoint
        const aiRes = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: flightNumOrQuery })
        });

        if (!aiRes.ok) throw new Error('AI processing failed');

        const aiData = await aiRes.json();

        // Map AI result to Search Params
        if (aiData.flightNumber) searchParams.set('flightNumber', aiData.flightNumber);
        if (aiData.airline) searchParams.set('airline', aiData.airline);
        if (aiData.destination) searchParams.set('destination', aiData.destination);

        if (!aiData.flightNumber && !aiData.airline && !aiData.destination) {
          throw new Error('Sorry, I couldn\'t understand that flight query.');
        }
      }

      if (date) {
        searchParams.set('date', date);
      }

      const res = await fetch(`/api/flights?${searchParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch flights');
      const data = await res.json();
      setFlights(data);
      if (data.length === 0) {
        setError('No flights found matching your request.');
      } else {
        setSearchHistory(prev => {
          const flight = data[0];
          // Use query string for history display if it was an AI search? 
          // Or just store the resolved flight? 
          // Current history logic stores full flights, which is good.
          // Just unshift resolved flight.
          const filtered = prev.filter(h => h.flightNumber !== flight.flightNumber);
          const newHistory = [flight, ...filtered];
          return newHistory.slice(0, 5);
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
        <div className="search-fields">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'AA999' or 'American to London'..."
            className="search-input"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-input"
          />
        </div>
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
