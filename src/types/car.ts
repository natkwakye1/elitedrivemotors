// src/types/car.ts

export interface Car {
  id:           number;
  name:         string;
  spec:         string;
  price:        number;
  rating:       number;
  reviews:      number;
  dist:         string;
  walkMin:      number;
  type:         string;
  fuel:         string;
  transmission: string;
  seats:        number;
  image:        string;
  favourite?:   boolean;
}

export interface Filters {
  search:       string;
  priceMin:     number;
  priceMax:     number;
  rentalType:   string;     // "Any" | "Per day" | "Per hour"
  availableNow: boolean;
  listingType:  string;     // "Any" | "Rent" | "Buy" | "Swap"
  bodyTypes:    string[];
  fuelTypes:    string[];
  transmission: string;
}

export const DEFAULT_FILTERS: Filters = {
  search:       "",
  priceMin:     0,
  priceMax:     200,
  rentalType:   "Any",
  availableNow: false,
  listingType:  "Any",
  bodyTypes:    [],
  fuelTypes:    [],
  transmission: "Any",
};