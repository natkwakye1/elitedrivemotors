// src/lib/data/customerData.ts
// Per-customer data keyed by customer id. Replace with API calls in production.

export const CUSTOMER_RENTALS: Record<string, any[]> = {
  "CUS-001": [
    { id:"RNT-001", car:"BMW 3 Series",     plate:"GR-2341-22", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", start:"Jan 10, 2025", end:"Jan 14, 2025", days:4, daily:85,  amount:"$342.00", status:"Completed", pickup:"Accra Central", dropoff:"Tema"       },
    { id:"RNT-005", car:"Audi A4",          plate:"GE-4490-23", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", start:"May 01, 2025", end:"May 05, 2025", days:4, daily:97,  amount:"$390.00", status:"Active",    pickup:"East Legon",   dropoff:"Achimota"   },
  ],
  "CUS-002": [
    { id:"RNT-002", car:"Toyota Camry",     plate:"GT-5512-23", image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80", start:"Feb 03, 2025", end:"Feb 08, 2025", days:5, daily:55,  amount:"$275.00", status:"Completed", pickup:"Airport Accra", dropoff:"Kumasi"     },
    { id:"RNT-006", car:"Honda Accord",     plate:"GS-7731-24", image:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80", start:"Jun 10, 2025", end:"Jun 13, 2025", days:3, daily:70,  amount:"$210.00", status:"Upcoming",  pickup:"Dome Market",  dropoff:"University" },
  ],
  "CUS-003": [
    { id:"RNT-003", car:"Tesla Model S",    plate:"GW-1122-24", image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", start:"Mar 20, 2025", end:"Mar 23, 2025", days:3, daily:170, amount:"$510.00", status:"Completed", pickup:"Osu, Accra",   dropoff:"East Legon" },
    { id:"RNT-004", car:"Mercedes C-Class", plate:"GN-8821-22", image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80", start:"Apr 15, 2025", end:"Apr 20, 2025", days:5, daily:96,  amount:"$480.00", status:"Completed", pickup:"Cantonments",  dropoff:"Spintex"    },
  ],
};

export const CUSTOMER_PURCHASES: Record<string, any[]> = {
  "CUS-001": [
    { id:"PUR-001", car:"Audi A4 2023",        image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", price:"$18,500", date:"Feb 14, 2025", method:"Bank Transfer", status:"Completed", mileage:"12,400 km", fuel:"Petrol",  transmission:"Automatic", color:"Phantom Black", receipt:"RCP-20250214" },
  ],
  "CUS-002": [
    { id:"PUR-002", car:"Toyota Corolla 2022",  image:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80", price:"$11,200", date:"Aug 30, 2024", method:"Cash",          status:"Completed", mileage:"28,600 km", fuel:"Hybrid",  transmission:"Automatic", color:"Pearl White",   receipt:"RCP-20240830" },
  ],
  "CUS-003": [],
};

export const CUSTOMER_SWAPS: Record<string, any[]> = {
  "CUS-001": [
    { id:"SWP-001", offering:"VW Golf 2021",    offeringImg:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70", offering_spec:"1.4 TSI · Manual · 46,000 km",      wanting:"Mazda CX-5",     wanting_spec:"2.5 SkyActiv · Auto", date:"Mar 10, 2025", status:"Pending",   note:"Good condition, full service history." },
    { id:"SWP-003", offering:"Hyundai Elantra", offeringImg:"https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=200&q=70", offering_spec:"2.0 MPI · Auto · 61,200 km",       wanting:"Kia Sportage",   wanting_spec:"1.6 T-GDI · Auto",    date:"Nov 05, 2024", status:"Completed", note:"Negotiable on extras." },
  ],
  "CUS-002": [
    { id:"SWP-002", offering:"Honda Civic 2020", offeringImg:"https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=200&q=70", offering_spec:"1.5 VTEC Turbo · Auto · 32,000 km", wanting:"Toyota RAV4",    wanting_spec:"2.5 Hybrid · Auto",   date:"Jan 22, 2025", status:"Approved",  note:"Low mileage, second owner." },
  ],
  "CUS-003": [
    { id:"SWP-004", offering:"Ford Focus 2019",  offeringImg:"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&q=70", offering_spec:"1.5 EcoBoost · Manual · 74,000 km",  wanting:"Nissan X-Trail", wanting_spec:"2.5 · CVT · 4WD",     date:"Sep 18, 2024", status:"Rejected",  note:"All documents ready." },
  ],
};

export const CUSTOMER_BOOKINGS: Record<string, any[]> = {
  "CUS-001": [
    { id:"BKG-001", car:"BMW 3 Series",     plate:"GR-2341-22", image:"https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80", date:"May 01, 2025", time:"09:00 AM", pickup:"Accra Central",  dropoff:"Tema",        days:3, daily:85,  amount:"$255.00", status:"Confirmed" },
    { id:"BKG-004", car:"Audi Q5",          plate:"GA-5544-23", image:"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&q=80", date:"Mar 15, 2025", time:"08:30 AM", pickup:"East Legon",    dropoff:"Cantonments", days:4, daily:120, amount:"$480.00", status:"Cancelled" },
  ],
  "CUS-002": [
    { id:"BKG-002", car:"Tesla Model S",    plate:"GW-1122-24", image:"https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&q=80", date:"May 12, 2025", time:"02:00 PM", pickup:"Airport Accra",  dropoff:"Kumasi",      days:2, daily:170, amount:"$340.00", status:"Pending"   },
    { id:"BKG-005", car:"Honda CR-V",       plate:"GH-3310-24", image:"https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=400&q=80", date:"Jun 05, 2025", time:"10:00 AM", pickup:"Achimota",       dropoff:"Spintex",     days:2, daily:95,  amount:"$190.00", status:"Confirmed" },
  ],
  "CUS-003": [
    { id:"BKG-003", car:"Mercedes C-Class", plate:"GN-8821-22", image:"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80", date:"Apr 20, 2025", time:"11:00 AM", pickup:"Osu, Accra",    dropoff:"Osu, Accra",  days:1, daily:96,  amount:"$96.00",  status:"Completed" },
  ],
};