import React from 'react';

export interface FlightLogEntry {
    id: string;
    date: string;
    flightNumber: string;
    airline: string;
    from: string; // Airport code
    to: string; // Airport code
    duration: string;
}

const MOCK_LOGS: FlightLogEntry[] = [
    {
        id: 'log1',
        date: '2025-11-15',
        flightNumber: 'AA101',
        airline: 'American Airlines',
        from: 'JFK',
        to: 'LHR',
        duration: '7h 15m'
    },
    {
        id: 'log2',
        date: '2025-10-22',
        flightNumber: 'JL005',
        airline: 'Japan Airlines',
        from: 'HND',
        to: 'JFK',
        duration: '12h 45m'
    },
    {
        id: 'log3',
        date: '2025-09-05',
        flightNumber: 'BA293',
        airline: 'British Airways',
        from: 'LHR',
        to: 'IAD',
        duration: '8h 05m'
    },
    {
        id: 'log4',
        date: '2025-08-14',
        flightNumber: 'UA888',
        airline: 'United Airlines',
        from: 'SFO',
        to: 'PEK',
        duration: '11h 20m'
    }
];

export default function FlightLog() {
    return (
        <section className="flight-log-container">
            <h2 className="log-title">Recent Flights</h2>
            <div className="log-list">
                {MOCK_LOGS.map((log) => (
                    <div key={log.id} className="log-item">
                        <div className="log-date">
                            <span className="day" suppressHydrationWarning>{new Date(log.date).getDate()}</span>
                            <span className="month" suppressHydrationWarning>{new Date(log.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                        </div>

                        <div className="log-details">
                            <div className="log-route">
                                <span className="code">{log.from}</span>
                                <span className="arrow">→</span>
                                <span className="code">{log.to}</span>
                            </div>
                            <div className="log-meta">
                                <span className="log-flight-num">{log.flightNumber}</span>
                                <span className="dot">•</span>
                                <span className="log-airline">{log.airline}</span>
                            </div>
                        </div>

                        <div className="log-duration">
                            {log.duration}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
