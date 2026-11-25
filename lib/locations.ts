// Bundled list of Indian cities for the location autocomplete. Pure data and
// pure functions only: no network, no geolocation API (both are blocked by
// design, see lib/csp.ts and the Permissions-Policy header).

export interface Location {
  city: string;
  state: string;
}

export const LOCATIONS: readonly Location[] = [
  { city: 'Agra', state: 'Uttar Pradesh' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Amritsar', state: 'Punjab' },
  { city: 'Aurangabad', state: 'Maharashtra' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Chandigarh', state: 'Chandigarh' },
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Dehradun', state: 'Uttarakhand' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Dhanbad', state: 'Jharkhand' },
  { city: 'Faridabad', state: 'Haryana' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh' },
  { city: 'Goa (Panaji)', state: 'Goa' },
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Guwahati', state: 'Assam' },
  { city: 'Gwalior', state: 'Madhya Pradesh' },
  { city: 'Hubballi', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Jabalpur', state: 'Madhya Pradesh' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Jalandhar', state: 'Punjab' },
  { city: 'Jammu', state: 'Jammu and Kashmir' },
  { city: 'Jamshedpur', state: 'Jharkhand' },
  { city: 'Jodhpur', state: 'Rajasthan' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Kota', state: 'Rajasthan' },
  { city: 'Kozhikode', state: 'Kerala' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Mangaluru', state: 'Karnataka' },
  { city: 'Meerut', state: 'Uttar Pradesh' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Mysuru', state: 'Karnataka' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Nashik', state: 'Maharashtra' },
  { city: 'Navi Mumbai', state: 'Maharashtra' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Puducherry', state: 'Puducherry' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Raipur', state: 'Chhattisgarh' },
  { city: 'Rajkot', state: 'Gujarat' },
  { city: 'Ranchi', state: 'Jharkhand' },
  { city: 'Shimla', state: 'Himachal Pradesh' },
  { city: 'Srinagar', state: 'Jammu and Kashmir' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Thane', state: 'Maharashtra' },
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Tiruchirappalli', state: 'Tamil Nadu' },
  { city: 'Udaipur', state: 'Rajasthan' },
  { city: 'Vadodara', state: 'Gujarat' },
  { city: 'Varanasi', state: 'Uttar Pradesh' },
  { city: 'Vijayawada', state: 'Andhra Pradesh' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh' },
];

/** "Pune, Maharashtra" — the canonical text stored when a location is chosen. */
export function formatLocation(loc: Location): string {
  return `${loc.city}, ${loc.state}`;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * Suggestions for what the user has typed. Cities starting with the query come
 * first, then cities/states containing it. Empty query → no suggestions.
 */
export function searchLocations(query: string, limit = 6): Location[] {
  const q = norm(query);
  if (q === '') return [];
  const starts: Location[] = [];
  const contains: Location[] = [];
  for (const loc of LOCATIONS) {
    const city = norm(loc.city);
    const full = norm(formatLocation(loc));
    if (city.startsWith(q) || full.startsWith(q)) starts.push(loc);
    else if (city.includes(q) || norm(loc.state).includes(q)) contains.push(loc);
  }
  return [...starts, ...contains].slice(0, limit);
}

/**
 * Resolve free text to a known location: exact city name ("pune") or the full
 * canonical text ("Pune, Maharashtra"), case-insensitive. Otherwise null.
 */
export function resolveLocation(text: string): Location | null {
  const q = norm(text);
  if (q === '') return null;
  return LOCATIONS.find((l) => norm(l.city) === q || norm(formatLocation(l)) === q) ?? null;
}
