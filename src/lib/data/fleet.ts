// src/lib/data/fleet.ts
// Operational fleet metadata keyed by car ID (maps to CARS in cars.ts).
// Shared between admin fleet page and customer browse page.

export type FleetStatus   = "Available" | "Rented" | "In Service";
export type ListingType   = "rent" | "buy" | "swap";

export interface FleetEntry {
  status:       FleetStatus;
  plate:        string;
  mileage:      number;
  lastService:  string;
  nextService:  string;
  driver:       string;
  location:     string;
  rentalRate:   number;
  salePrice:    number;
  year:         number;
  listingTypes: ListingType[];   // which customer sections this car appears in
}

export const FLEET_DATA: Record<number, FleetEntry> = {
  //  id  status        plate          mileage  lastService       nextService       driver           location                       rentalRate  salePrice  year  listingTypes
  1:  { status:"Available",  plate:"GR-4421-22", mileage:34200, lastService:"Jan 15, 2026", nextService:"Jul 15, 2026", driver:"—",            location:"Liberation Rd, Accra",        rentalRate:85,  salePrice:24900, year:2022, listingTypes:["rent","buy"]        },
  2:  { status:"Rented",     plate:"GT-2819-23", mileage:51800, lastService:"Dec 20, 2025", nextService:"Jun 20, 2026", driver:"Ama Darko",    location:"East Legon",                   rentalRate:65,  salePrice:18500, year:2023, listingTypes:["rent"]             },
  3:  { status:"Rented",     plate:"GN-0032-23", mileage:29400, lastService:"Feb 01, 2026", nextService:"Aug 01, 2026", driver:"Kofi Mensah",  location:"Spintex Road",                 rentalRate:95,  salePrice:27000, year:2023, listingTypes:["rent"]             },
  4:  { status:"Available",  plate:"GS-7731-24", mileage:11300, lastService:"Mar 02, 2026", nextService:"Sep 02, 2026", driver:"—",            location:"Oxford Street, Osu",           rentalRate:72,  salePrice:21500, year:2024, listingTypes:["rent","swap"]       },
  5:  { status:"Rented",     plate:"GE-9912-23", mileage:42600, lastService:"Jan 28, 2026", nextService:"Jul 28, 2026", driver:"Yaw Boateng",  location:"Airport Bypass",               rentalRate:145, salePrice:52000, year:2023, listingTypes:["rent"]             },
  6:  { status:"In Service", plate:"GR-2341-22", mileage:67900, lastService:"Mar 10, 2026", nextService:"Sep 10, 2026", driver:"—",            location:"Community 11 Workshop, Tema",  rentalRate:75,  salePrice:22800, year:2022, listingTypes:["rent"]             },
  7:  { status:"Available",  plate:"GW-1122-24", mileage:8900,  lastService:"Feb 20, 2026", nextService:"Aug 20, 2026", driver:"—",            location:"Cantonments Rd",               rentalRate:195, salePrice:68000, year:2024, listingTypes:["rent","buy","swap"] },
  8:  { status:"Available",  plate:"GT-5512-23", mileage:23100, lastService:"Jan 05, 2026", nextService:"Jul 05, 2026", driver:"—",            location:"Achimota",                     rentalRate:62,  salePrice:19900, year:2023, listingTypes:["rent"]             },
  9:  { status:"Rented",     plate:"GW-9908-22", mileage:55700, lastService:"Dec 10, 2025", nextService:"Jun 10, 2026", driver:"Abena Osei",   location:"Adjiringanor Rd, East Legon",  rentalRate:98,  salePrice:29500, year:2022, listingTypes:["rent","swap"]       },
  10: { status:"Rented",     plate:"GR-5521-22", mileage:38400, lastService:"Feb 14, 2026", nextService:"Aug 14, 2026", driver:"Kwame Asante", location:"Ring Rd Central",              rentalRate:125, salePrice:38000, year:2022, listingTypes:["rent"]             },
  11: { status:"In Service", plate:"GN-8821-22", mileage:72100, lastService:"Mar 12, 2026", nextService:"Sep 12, 2026", driver:"—",            location:"East Legon Workshop",          rentalRate:148, salePrice:44000, year:2022, listingTypes:["rent"]             },
  12: { status:"Available",  plate:"GE-4490-23", mileage:15600, lastService:"Mar 01, 2026", nextService:"Sep 01, 2026", driver:"—",            location:"High Street, Accra",           rentalRate:235, salePrice:72000, year:2023, listingTypes:["rent","buy","swap"] },
};

export const DEFAULT_FLEET_ENTRY: FleetEntry = {
  status:       "Available",
  plate:        "—",
  mileage:      0,
  lastService:  "—",
  nextService:  "—",
  driver:       "—",
  location:     "—",
  rentalRate:   0,
  salePrice:    0,
  year:         new Date().getFullYear(),
  listingTypes: ["rent"],
};

