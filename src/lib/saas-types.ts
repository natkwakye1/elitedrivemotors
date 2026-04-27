// src/lib/saas-types.ts
// Core SaaS platform types for EliteDriveMotors multi-tenant system.

export type PlanTier = "free" | "starter" | "pro" | "enterprise";
export type CompanyRole = "owner" | "admin" | "finance" | "employee";
export type PermissionKey =
  | "manage_cars"
  | "manage_customers"
  | "manage_bookings"
  | "manage_payments"
  | "view_reports"
  | "manage_employees"
  | "manage_roles"
  | "approve_leave"
  | "submit_leave"
  | "view_payroll"
  | "manage_settings"
  | "manage_swaps"
  | "manage_rentals";

export interface CompanyPlan {
  tier: PlanTier;
  name: string;
  price: number; // GHS/month
  employeeLimit: number;
  features: string[];
  popular?: boolean;
}

export const PLANS: CompanyPlan[] = [
  {
    tier: "free",
    name: "Starter",
    price: 0,
    employeeLimit: 5,
    features: [
      "Up to 5 team members",
      "Car listing & management",
      "Basic customer portal",
      "Rental & booking tracking",
      "Email support",
    ],
  },
  {
    tier: "starter",
    name: "Growth",
    price: 199,
    employeeLimit: 20,
    features: [
      "Up to 20 team members",
      "All Starter features",
      "Stripe & Paystack payments",
      "Advanced analytics",
      "SMS notifications",
      "Priority support",
    ],
    popular: true,
  },
  {
    tier: "pro",
    name: "Professional",
    price: 499,
    employeeLimit: 100,
    features: [
      "Up to 100 team members",
      "All Growth features",
      "Custom domain portal",
      "White-label branding",
      "API access",
      "Dedicated account manager",
    ],
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: -1, // custom pricing
    employeeLimit: Infinity,
    features: [
      "Unlimited team members",
      "All Professional features",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "24/7 dedicated support",
    ],
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<CompanyRole, PermissionKey[]> = {
  owner: [
    "manage_cars", "manage_customers", "manage_bookings", "manage_payments",
    "view_reports", "manage_employees", "manage_roles", "approve_leave",
    "view_payroll", "manage_settings", "manage_swaps", "manage_rentals",
  ],
  admin: [
    "manage_cars", "manage_customers", "manage_bookings", "manage_payments",
    "view_reports", "manage_employees", "approve_leave", "view_payroll",
    "manage_swaps", "manage_rentals",
  ],
  finance: ["manage_payments", "view_reports", "view_payroll"],
  employee: ["submit_leave", "manage_bookings", "manage_rentals"],
};

export interface Company {
  id: string;
  name: string;
  slug: string; // used as email domain: name@slug.com
  logoUrl?: string;
  logoDataUrl?: string; // base64 for local storage
  industry: string;
  size: number;
  plan: PlanTier;
  address?: string;
  phone?: string;
  website?: string;
  primaryColor?: string;
  ownerId: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface CompanyUser {
  id: string;
  companyId: string;
  companySlug: string;
  name: string;
  email: string; // firstname@companyslug.com
  passwordHash: string; // sha256 hex for demo; replace with bcrypt in prod
  role: CompanyRole;
  permissions: PermissionKey[];
  avatar?: string; // initials
  avatarColor?: string;
  status: "active" | "inactive" | "pending";
  position?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  companyId: string;
  type: "annual" | "sick" | "emergency" | "other";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewNote?: string;
  createdAt: string;
}

// ── Company car listing (each dealership's own inventory) ─────────────────────
export type ServiceType = "rental" | "sale" | "swap";
export type CarStatus   = "available" | "booked" | "maintenance";

export interface CompanyCar {
  id:           string;
  companyId:    string;
  name:         string;
  spec:         string;
  serviceType:  ServiceType;
  price:        number;        // per day for rental; total price for sale/swap
  currency:     string;        // "GHS"
  imageUrl:     string;
  bodyType:     string;        // Sedan, SUV, Hatchback…
  fuel:         string;
  transmission: string;
  seats:        number;
  year:         number;
  status:       CarStatus;
  createdAt:    string;
}

// ── Local storage keys ────────────────────────────────────────────────────────
export const SAAS_STORAGE = {
  companies:      "edm_saas_companies",
  users:          "edm_saas_users",
  currentUser:    "edm_saas_current_user",
  currentCompany: "edm_saas_current_company",
  leaves:         "edm_saas_leaves",
  cars:           "edm_saas_cars",
};
