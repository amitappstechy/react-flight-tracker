import { NextResponse } from 'next/server';
import { findAirline, getRandomAirports } from '../../../lib/db';

export interface Flight {
    id: string;
    flightNumber: string;
    airline: string;
    status: 'On Time' | 'Delayed' | 'Cancelled' | 'Arrived' | 'In Air';
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('flightNumber'); // e.g., "AA123"

    if (!query) {
        return NextResponse.json([]);
    }

    // 1. Parse Airline Code (First 2 chars approx)
    // Simple logic: Take first 2 letters. 
    const airlineCode = query.substring(0, 2).toUpperCase();
    const flightNumberPart = query.substring(2);

    const airline = findAirline(airlineCode);

    if (!airline) {
        return NextResponse.json([]);
    }

    // 2. Get Random Airports for route
    const airports = getRandomAirports(2);
    if (airports.length < 2) {
        return NextResponse.json([]);
    }
    const depAirport = airports[0];
    const arrAirport = airports[1];

    // 3. Construct Flight Object
    const now = new Date();
    const depTime = new Date(now.getTime() + 3600000 * 2); // +2 hours
    const arrTime = new Date(now.getTime() + 3600000 * 8); // +8 hours

    const flight: Flight = {
        id: `real-${Date.now()}`,
        flightNumber: `${airline.codeIataAirline}${flightNumberPart}`,
        airline: airline.nameAirline, // Real Name from DB!
        status: 'On Time',
        departure: {
            location: depAirport.codeIso2Country, // Using Country Code as City for now as City DB link is complex
            airport: depAirport.codeIataAirport,
            time: depTime.toISOString(),
            timezone: depAirport.timezone,
        },
        arrival: {
            location: arrAirport.codeIso2Country,
            airport: arrAirport.codeIataAirport,
            time: arrTime.toISOString(),
            timezone: arrAirport.timezone,
        },
        duration: '6h 0m'
    };

    return NextResponse.json([flight]);
}
