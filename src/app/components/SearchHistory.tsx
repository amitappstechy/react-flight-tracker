'use client';

import type { Flight } from '../api/flights/route';

interface SearchHistoryProps {
    history: Flight[];
    onSelect: (flightNumber: string) => void;
}

export default function SearchHistory({ history, onSelect }: SearchHistoryProps) {
    if (history.length === 0) return null;

    return (
        <div className="flight-log-container search-history-container">
            <h3 className="log-title">Recent Search</h3>
            <div className="log-list">
                {history.map((flight) => (
                    <div
                        key={flight.id}
                        className="log-item"
                        onClick={() => onSelect(flight.flightNumber)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="log-date">
                            {/* Using departure time for the date display */}
                            <span className="day" suppressHydrationWarning>{new Date(flight.departure.time).getDate()}</span>
                            <span className="month" suppressHydrationWarning>{new Date(flight.departure.time).toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>

                        <div className="log-details">
                            <div className="log-route">
                                <span className="code">{flight.departure.airport}</span>
                                <span className="arrow">→</span>
                                <span className="code">{flight.arrival.airport}</span>
                            </div>
                            <div className="log-meta">
                                <span className="log-flight-num">{flight.flightNumber}</span>
                                <span className="dot">•</span>
                                <span className="log-airline">{flight.airline}</span>
                            </div>
                        </div>

                        <div className="log-duration">
                            {flight.duration}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
