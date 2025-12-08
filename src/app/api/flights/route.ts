import { NextResponse } from 'next/server';

export interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    status: 'On Time' | 'Delayed' | 'Cancelled' | 'Arrived';
    departure: {
        location: string;
        airport: string;
        time: string; // ISO string
        timezone: string;
    };
    arrival: {
        location: string;
        airport: string;
        time: string; // ISO string
        timezone: string;
    };
    duration: string;
}

const MOCK_FLIGHTS: Flight[] = [
    {
        id: '1',
        flightNumber: 'AA123',
        airline: 'American Airlines',
        status: 'On Time',
        departure: {
            location: 'New York, NY',
            airport: 'JFK',
            time: '2025-12-08T14:00:00',
            timezone: 'America/New_York',
        },
        arrival: {
            location: 'London, UK',
            airport: 'LHR',
            time: '2025-12-09T02:00:00',
            timezone: 'Europe/London',
        },
        duration: '7h 0m',
    },
    {
        id: '2',
        flightNumber: 'BA456',
        airline: 'British Airways',
        status: 'Delayed',
        departure: {
            location: 'London, UK',
            airport: 'LHR',
            time: '2025-12-08T16:30:00',
            timezone: 'Europe/London',
        },
        arrival: {
            location: 'Paris, FR',
            airport: 'CDG',
            time: '2025-12-08T18:45:00',
            timezone: 'Europe/Paris',
        },
        duration: '1h 15m',
    },
    {
        id: '3',
        flightNumber: 'JL789',
        airline: 'Japan Airlines',
        status: 'In Air',
        departure: {
            location: 'Tokyo, JP',
            airport: 'HND',
            time: '2025-12-08T10:00:00',
            timezone: 'Asia/Tokyo',
        },
        arrival: {
            location: 'San Francisco, CA',
            airport: 'SFO',
            time: '2025-12-08T08:30:00', // Arrives "before" it leaves due to timezone
            timezone: 'America/Los_Angeles',
        },
        duration: '9h 30m',
    },
    {
        id: '4',
        flightNumber: 'UA101',
        airline: 'United Airlines',
        status: 'On Time',
        departure: {
            location: 'San Francisco, CA',
            airport: 'SFO',
            time: '2025-12-09T09:00:00',
            timezone: 'America/Los_Angeles',
        },
        arrival: {
            location: 'New York, NY',
            airport: 'JFK',
            time: '2025-12-09T17:30:00',
            timezone: 'America/New_York',
        },
        duration: '5h 30m',
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('flightNumber');

    if (!query) {
        return NextResponse.json(MOCK_FLIGHTS);
    }

    const flight = MOCK_FLIGHTS.find((f) =>
        f.flightNumber.toLowerCase() === query.toLowerCase()
    );

    if (flight) {
        return NextResponse.json([flight]);
    }

    return NextResponse.json([]);
}
