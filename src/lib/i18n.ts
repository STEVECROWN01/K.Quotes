// All UI + document strings in FR/EN.
// Document language follows the global toggle — labels, headers, bullets,
// thank-you note, section titles, footer.

import type { Language, DocType, ServiceType } from "./services";

export const UI: Record<
  Language,
  {
    appName: string;
    appTagline: string;
    newQuote: string;
    myQuotes: string;
    emptyState: string;
    emptyStateCta: string;
    // Sections
    sectionA: string;
    sectionB: string;
    sectionC: string;
    sectionD: string;
    sectionE: string;
    docTypeLabel: string;
    devis: string;
    facture: string;
    languageLabel: string;
    francais: string;
    english: string;
    // Client fields
    clientNumber: string;
    date: string;
    fullName: string;
    city: string;
    country: string;
    phone: string;
    email: string;
    // Service fields
    serviceType: string;
    cvOnly: string;
    linkedinOnly: string;
    both: string;
    priceCv: string;
    priceLinkedin: string;
    // Bank fields
    accountHolder: string;
    iban: string;
    bic: string;
    bank: string;
    paymentMode: string;
    paymentConditions: string;
    paymentLink: string;
    paymentLinkHint: string;
    resetToDefault: string;
    // Invoice-only
    paymentStatus: string;
    paymentDate: string;
    paid: string;
    pending: string;
    // Actions
    generatePdf: string;
    saveAndGenerateLater: string;
    saved: string;
    download: string;
    generateInvoice: string;
    delete: string;
    cancel: string;
    // Preview
    livePreview: string;
    previewHint: string;
    // Misc
    quoteNumber: string;
    invoiceNumber: string;
    total: string;
    // Table headers
    thType: string;
    thDescription: string;
    thUnitPrice: string;
    thQty: string;
    thTotal: string;
    // Doc
    detailHeading: string;
    bankHeading: string;
    conditionsHeading: string;
    emetteur: string;
    destinataire: string;
    conditionsBlock: string;
    bonPourAccord: string;
    signatureCachet: string;
    qualiteSignataire: string;
    validiteDevis: string;
    notes: string;
    notesText: string;
    modeReglement: string;
    conditionsReglement: string;
    titulaireCompte: string;
    modePaiement: string;
    paymentLinkLabel: string;
    pageXSurY: string;
    documentConfidentiel: string;
    titleDevis: string;
    titleFacture: string;
    // Validation
    required: string;
    invalidEmail: string;
    invalidNumber: string;
  }
> = {
  fr: {
    appName: "Keter Quotes",
    appTagline: "Générateur de devis & factures",
    newQuote: "Nouveau devis",
    myQuotes: "Mes devis",
    emptyState: "Aucun devis enregistré — créez votre premier devis ci-dessus.",
    emptyStateCta: "Créer mon premier devis",
    sectionA: "Type de document & langue",
    sectionB: "Informations client",
    sectionC: "Prestation",
    sectionD: "Coordonnées bancaires & paiement",
    sectionE: "Champs facture",
    docTypeLabel: "Type",
    devis: "Devis",
    facture: "Facture",
    languageLabel: "Langue",
    francais: "Français",
    english: "English",
    clientNumber: "Numéro client",
    date: "Date",
    fullName: "Nom complet",
    city: "Ville",
    country: "Pays",
    phone: "Téléphone",
    email: "Email",
    serviceType: "Type de prestation",
    cvOnly: "Optimisation CV",
    linkedinOnly: "Optimisation LinkedIn",
    both: "CV + LinkedIn",
    priceCv: "Prix CV (€)",
    priceLinkedin: "Prix LinkedIn (€)",
    accountHolder: "Titulaire du compte",
    iban: "IBAN",
    bic: "BIC",
    bank: "Banque",
    paymentMode: "Mode de paiement",
    paymentConditions: "Conditions",
    paymentLink: "Lien de paiement",
    paymentLinkHint: "Affiché dans la section paiement si renseigné.",
    resetToDefault: "Réinitialiser",
    paymentStatus: "Statut du paiement",
    paymentDate: "Date de règlement",
    paid: "Payé",
    pending: "En attente",
    generatePdf: "Générer le PDF",
    saveAndGenerateLater: "Enregistrer & générer la facture plus tard",
    saved: "Devis enregistré",
    download: "Télécharger",
    generateInvoice: "Générer la facture",
    delete: "Supprimer",
    cancel: "Annuler",
    livePreview: "Aperçu en direct",
    previewHint: "Le PDF se construit en temps réel.",
    quoteNumber: "N° Devis",
    invoiceNumber: "N° Facture",
    total: "Total",
    thType: "Type",
    thDescription: "Description",
    thUnitPrice: "Prix unitaire",
    thQty: "Qté",
    thTotal: "Total",
    detailHeading: "Détail",
    bankHeading: "Coordonnées bancaires",
    conditionsHeading: "Conditions générales de vente",
    emetteur: "Emetteur",
    destinataire: "Destinataire",
    conditionsBlock: "Conditions",
    bonPourAccord: "Bon pour accord",
    signatureCachet: "Signature et cachet",
    qualiteSignataire: "Qualité de signataire",
    validiteDevis: "Validité du devis",
    notes: "Notes",
    notesText:
      "Je reste à votre disposition pour toute question complémentaire et vous remercie pour votre confiance.",
    modeReglement: "Mode de règlement",
    conditionsReglement: "Conditions de règlement",
    titulaireCompte: "Titulaire du compte",
    modePaiement: "Mode de paiement",
    paymentLinkLabel: "Paiement en ligne",
    pageXSurY: "Page {x} sur {y}",
    documentConfidentiel: "Document confidentiel — Stevens AKPOVI",
    titleDevis: "Devis",
    titleFacture: "Facture",
    required: "Requis",
    invalidEmail: "Email invalide",
    invalidNumber: "Numéro invalide",
  },
  en: {
    appName: "Keter Quotes",
    appTagline: "Quote & Invoice Generator",
    newQuote: "New quote",
    myQuotes: "My quotes",
    emptyState: "No quotes yet — create your first one above.",
    emptyStateCta: "Create my first quote",
    sectionA: "Document type & language",
    sectionB: "Client information",
    sectionC: "Service",
    sectionD: "Bank & payment details",
    sectionE: "Invoice fields",
    docTypeLabel: "Type",
    devis: "Quote",
    facture: "Invoice",
    languageLabel: "Language",
    francais: "Français",
    english: "English",
    clientNumber: "Client number",
    date: "Date",
    fullName: "Full name",
    city: "City",
    country: "Country",
    phone: "Phone",
    email: "Email",
    serviceType: "Service type",
    cvOnly: "CV Optimization",
    linkedinOnly: "LinkedIn Optimization",
    both: "CV + LinkedIn",
    priceCv: "CV price (€)",
    priceLinkedin: "LinkedIn price (€)",
    accountHolder: "Account holder",
    iban: "IBAN",
    bic: "BIC",
    bank: "Bank",
    paymentMode: "Payment mode",
    paymentConditions: "Conditions",
    paymentLink: "Payment link",
    paymentLinkHint: "Shown in payment section when provided.",
    resetToDefault: "Reset",
    paymentStatus: "Payment status",
    paymentDate: "Payment date",
    paid: "Paid",
    pending: "Pending",
    generatePdf: "Generate PDF",
    saveAndGenerateLater: "Save & generate invoice later",
    saved: "Quote saved",
    download: "Download",
    generateInvoice: "Generate invoice",
    delete: "Delete",
    cancel: "Cancel",
    livePreview: "Live preview",
    previewHint: "The PDF builds in real time.",
    quoteNumber: "Quote #",
    invoiceNumber: "Invoice #",
    total: "Total",
    thType: "Type",
    thDescription: "Description",
    thUnitPrice: "Unit price",
    thQty: "Qty",
    thTotal: "Total",
    detailHeading: "Details",
    bankHeading: "Bank details",
    conditionsHeading: "Terms & conditions",
    emetteur: "Issuer",
    destinataire: "Recipient",
    conditionsBlock: "Terms",
    bonPourAccord: "Approved",
    signatureCachet: "Signature & stamp",
    qualiteSignataire: "Signatory capacity",
    validiteDevis: "Quote validity",
    notes: "Notes",
    notesText:
      "I remain at your disposal for any further questions and thank you for your trust.",
    modeReglement: "Payment method",
    conditionsReglement: "Payment terms",
    titulaireCompte: "Account holder",
    modePaiement: "Payment method",
    paymentLinkLabel: "Online payment",
    pageXSurY: "Page {x} of {y}",
    documentConfidentiel: "Confidential document — Stevens AKPOVI",
    titleDevis: "Quote",
    titleFacture: "Invoice",
    required: "Required",
    invalidEmail: "Invalid email",
    invalidNumber: "Invalid number",
  },
};

export function formatDate(iso: string, lang: Language): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  const months: Record<Language, string[]> = {
    fr: [
      "janvier", "février", "mars", "avril", "mai", "juin",
      "juillet", "août", "septembre", "octobre", "novembre", "décembre",
    ],
    en: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
  };
  return `${d.getDate().toString().padStart(2, "0")} ${months[lang][d.getMonth()]} ${d.getFullYear()}`;
}

export function formatCurrency(amount: number, lang: Language): string {
  // FR: "120,00 €"   EN: "€120.00"
  const formatted = amount.toLocaleString(lang === "fr" ? "fr-FR" : "en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return lang === "fr" ? `${formatted} €` : `€${formatted}`;
}

// Build the doc number: "D" + 2-digit year + 5-digit client number zero-padded
// Example: client 1 in 2026 → D2600001
// Example: client 26 in 2026 → D2600026
// Example: client 2600004 in 2026 → D2600004 (client number uses all digits, year is always 2 digits)
export function buildDocNumber(clientNumber: number, docType: DocType): string {
  const year = new Date().getFullYear().toString().slice(-2); // e.g. "26" for 2026
  const padded = String(clientNumber).padStart(5, "0");
  return `${docType === "devis" ? "D" : "F"}${year}${padded}`;
}

// Convert quote number → invoice number (D→F swap, same digits)
export function quoteToInvoiceNumber(quoteNumber: string): string {
  return quoteNumber.replace(/^D/, "F");
}
