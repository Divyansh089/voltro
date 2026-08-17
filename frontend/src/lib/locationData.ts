export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "USA", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "Canada", name: "Canada", flag: "🇨🇦", dialCode: "+1" },
  { code: "India", name: "India", flag: "🇮🇳", dialCode: "+91" },
];

export const STATES_BY_COUNTRY: Record<string, string[]> = {
  USA: [
    "California",
    "New York",
    "Texas",
    "Florida",
    "Washington",
    "Illinois",
    "Massachusetts",
    "Georgia",
    "Colorado",
    "Pennsylvania",
    "North Carolina",
    "Ohio",
    "Michigan",
  ],
  Canada: [
    "Ontario",
    "British Columbia",
    "Quebec",
    "Alberta",
    "Nova Scotia",
    "Manitoba",
    "Saskatchewan",
  ],
  India: [
    "Maharashtra",
    "Karnataka",
    "Delhi NCR",
    "Tamil Nadu",
    "Gujarat",
    "Telangana",
    "West Bengal",
    "Uttar Pradesh",
    "Kerala",
    "Rajasthan",
    "Punjab",
    "Haryana",
  ],
};

export const CITIES_BY_STATE: Record<string, string[]> = {
  // USA States
  California: ["San Francisco", "Los Angeles", "San Diego", "San Jose", "Sacramento", "Oakland", "Irvine"],
  "New York": ["New York City", "Buffalo", "Albany", "Rochester", "Syracuse", "Yonkers"],
  Texas: ["Austin", "Houston", "Dallas", "San Antonio", "Fort Worth", "El Paso", "Arlington"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
  Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Redmond"],
  Illinois: ["Chicago", "Springfield", "Peoria", "Rockford", "Evanston", "Naperville"],
  Massachusetts: ["Boston", "Cambridge", "Worcester", "Springfield", "Lowell", "Quincy"],
  Georgia: ["Atlanta", "Savannah", "Augusta", "Athens", "Macon"],
  Colorado: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  Michigan: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Ann Arbor"],

  // Canada Provinces
  Ontario: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London", "Kitchener"],
  "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna"],
  Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"],
  Alberta: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat"],
  "Nova Scotia": ["Halifax", "Sydney", "Dartmouth", "Truro", "New Glasgow"],
  Manitoba: ["Winnipeg", "Brandon", "Steinbach", "Thompson"],
  Saskatchewan: ["Saskatoon", "Regina", "Prince Albert", "Moose Jaw"],

  // India States
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi", "Davangere"],
  "Delhi NCR": ["New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Uttar Pradesh": ["Noida", "Lucknow", "Kanpur", "Agra", "Varanasi", "Prayagraj", "Ghaziabad"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal"],
};

export function getCountries() {
  return COUNTRIES;
}

export function getStatesForCountry(countryCodeOrName: string): string[] {
  if (!countryCodeOrName) return STATES_BY_COUNTRY["USA"];
  // Normalize US/USA/IN/IND/CA/CAN
  const c = countryCodeOrName.trim().toUpperCase();
  if (c === "US" || c === "USA" || c.includes("UNITED STATES")) return STATES_BY_COUNTRY["USA"];
  if (c === "CA" || c === "CAN" || c.includes("CANADA")) return STATES_BY_COUNTRY["Canada"];
  if (c === "IN" || c === "IND" || c.includes("INDIA")) return STATES_BY_COUNTRY["India"];

  return STATES_BY_COUNTRY[countryCodeOrName] || STATES_BY_COUNTRY["USA"];
}

export function getCitiesForState(stateName: string): string[] {
  if (!stateName) return CITIES_BY_STATE["California"];
  return CITIES_BY_STATE[stateName] || [
    `${stateName} Central`,
    `${stateName} Metro`,
    "Main City",
  ];
}
