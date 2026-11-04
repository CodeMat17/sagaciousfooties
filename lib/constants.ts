export const CART_STORAGE_KEY = "sagacious-footies-cart:v1";
export const ADMIN_SESSION_COOKIE = "sf_admin_session";

export const AUDIENCE_LABEL = {
  men: "Men",
  women: "Women",
  unisex: "Unisex",
} as const;

export type Audience = keyof typeof AUDIENCE_LABEL;

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_LABEL: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
