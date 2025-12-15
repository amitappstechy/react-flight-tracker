import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Mock AI Logic (Regex/Heuristics)
        const lowerQuery = query.toLowerCase();
        let airline = null;
        let destination = null;
        let flightNumber = null;

        // 1. Check for explicit flight number format (e.g. AA123)
        const flightNumMatch = query.match(/([A-Z]{2,3})\d{3,4}/i);
        if (flightNumMatch) {
            flightNumber = flightNumMatch[0].toUpperCase();
        }

        // 2. Check for "to [Destination]"
        const toMatch = lowerQuery.match(/to\s+([a-zA-Z\s]+)/);
        if (toMatch) {
            // Stop at common words if needed, or simple take next word(s)
            // Simple: take everything after "to" until end or "from"
            let dest = toMatch[1].trim();
            if (dest.includes(' from')) {
                dest = dest.split(' from')[0];
            }
            destination = dest.charAt(0).toUpperCase() + dest.slice(1);
        }

        // 3. Check for known airlines (Simple Keyword Matching)
        const airlineKeywords: Record<string, string> = {
            'american': 'American Airlines',
            'british': 'British Airways',
            'united': 'United Airlines',
            'delta': 'Delta Air Lines',
            'japan': 'Japan Airlines',
            'jal': 'Japan Airlines',
            'ana': 'All Nippon Airways',
            'emirates': 'Emirates',
            'singapore': 'Singapore Airlines',
            'cathay': 'Cathay Pacific',
        };

        for (const [key, value] of Object.entries(airlineKeywords)) {
            if (lowerQuery.includes(key)) {
                airline = value;
                break;
            }
        }

        // Return structured data for the frontend to use
        // If nothing found but query exists, maybe default to treating it as destination or airline?
        // Let's be strict for now to show "AI" working only when it "understands".

        return NextResponse.json({
            flightNumber,
            airline,
            destination,
            originalQuery: query
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
