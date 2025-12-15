import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

interface Airline {
    airlineId: number;
    codeIataAirline: string; // "AA"
    nameAirline: string; // "American Airlines"
}

interface Airport {
    airportId: number;
    codeIataAirport: string; // "JFK"
    nameAirport: string; // "John F Kennedy Intl"
    codeIso2Country: string; // "US"
    latitudeAirport: number;
    longitudeAirport: number;
    timezone: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');

let airlinesCache: Airline[] | null = null;
let airportsCache: Airport[] | null = null;

function loadSheet<T>(fileName: string): T[] {
    try {
        const filePath = path.join(DATA_DIR, fileName);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${fileName}`);
            return [];
        }
        const fileBuffer = fs.readFileSync(filePath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } catch (error) {
        console.error(`Error loading ${fileName}:`, error);
        return [];
    }
}

export function getAirlines(): Airline[] {
    if (!airlinesCache) {
        airlinesCache = loadSheet<Airline>('AE Airlines DB - Sample.xls');
    }
    return airlinesCache;
}

export function getAirports(): Airport[] {
    if (!airportsCache) {
        airportsCache = loadSheet<Airport>('AE Airports DB - Sample.xlsx');
    }
    return airportsCache;
}

export function findAirline(code: string): Airline | undefined {
    const airlines = getAirlines();
    return airlines.find(a => a.codeIataAirline === code.toUpperCase());
}

export function getRandomAirports(count: number = 2): Airport[] {
    const airports = getAirports(); // Should be ~30,000, filtering for large ones might be tough without more data, so we pick random
    if (airports.length === 0) return [];

    const results: Airport[] = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * airports.length);
        results.push(airports[randomIndex]);
    }
    return results;
}
