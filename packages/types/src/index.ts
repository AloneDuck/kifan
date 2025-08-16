export type Currency = "TOMAN" | "RIAL";

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  preferredCurrency: Currency;
}
