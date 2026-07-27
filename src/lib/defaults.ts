// Default bank details and payment link — pre-filled in the form,
// editable per quote. "Reset to default" button restores these values.

export const DEFAULT_BANK_DETAILS = {
  accountHolder: "TCHOGNON STEVENS AKPOVI",
  iban: "MT33CFTE28904000000000006119777",
  bic: "CFTEMTM1XXX",
  bank: "Moneco",
  paymentMode: "Virement bancaire",
  paymentConditions: "À réception",
} as const;

export const DEFAULT_PAYMENT_LINK =
  "https://shefapro.mymaketou.shop/products/cv-premium-optimisation-linkedin-profil-qui-attire-les-recruteurs/checkout";

// Emetteur (issuer) — static Keter Marketing info shown on every document.
// Matches the reference PDF exactly.
export const EMETTEUR = {
  societe: "Keter Marketing",
  subText: "(Pôle d'activité de YEHI OR TECH)",
  ifu: "0202212825543",
  rccm: "RB/PKO/23 A 18020",
  contact: "Stevens AKPOVI",
  adresse: "Parakou, Borgou, Bénin",
  pays: "Bénin",
  signatory: "Stevens AKPOVI",
} as const;

// Validity period for quotes (in days)
export const QUOTE_VALIDITY_DAYS = 5;
