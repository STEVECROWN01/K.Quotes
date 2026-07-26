// Service descriptions, bullet lists, and thank-you notes in FR/EN.
// Adapted verbatim from the brief §4. Bullet counts match between languages.

export type ServiceType = "cv" | "linkedin" | "both";
export type Language = "fr" | "en";
export type DocType = "devis" | "facture";

export const SERVICE_DESCRIPTIONS: Record<
  Language,
  Record<ServiceType, { name: string; bullets: string[]; deliveryNote: string }>
> = {
  fr: {
    cv: {
      name: "Optimisation CV — Repositionnement exécutif",
      bullets: [
        "Audit stratégique du profil et du positionnement",
        "Refonte exécutive du CV optimisé ATS",
        "Restructuration et mise en valeur de vos compétences",
        "Repositionnement du discours professionnel",
        "Amélioration de la lisibilité et de l'impact candidat",
        "Présentation stratégique adaptée au marché ciblé",
      ],
      deliveryNote: "Délai estimé : 48h à 72h | Livraison numérique",
    },
    linkedin: {
      name: "Optimisation LinkedIn — Visibilité & positionnement",
      bullets: [
        "Optimisation du positionnement LinkedIn",
        "Amélioration de la visibilité et de l'attractivité recruteur",
        "Restructuration complète du profil",
        "Branding professionnel stratégique",
        "Renforcement de la présence en ligne",
      ],
      deliveryNote: "Délai estimé : 48h à 72h | Livraison numérique",
    },
    both: {
      // 'both' is never rendered as a single line item — see buildLineItems()
      name: "Optimisation CV + LinkedIn",
      bullets: [],
      deliveryNote: "Délai estimé : 48h à 72h | Livraison numérique",
    },
  },
  en: {
    cv: {
      name: "CV Optimization — Executive Repositioning",
      bullets: [
        "Strategic audit of profile and positioning",
        "Executive rebuild of ATS-optimized CV",
        "Restructuring and highlighting of skills",
        "Repositioning of professional narrative",
        "Improvement of readability and candidate impact",
        "Strategic presentation tailored to target market",
      ],
      deliveryNote: "Estimated turnaround: 48–72h | Digital delivery",
    },
    linkedin: {
      name: "LinkedIn Optimization — Visibility & Positioning",
      bullets: [
        "Optimization of LinkedIn positioning",
        "Improvement of visibility and recruiter appeal",
        "Complete profile restructuring",
        "Strategic professional branding",
        "Reinforcement of online presence",
      ],
      deliveryNote: "Estimated turnaround: 48–72h | Digital delivery",
    },
    both: {
      name: "CV + LinkedIn Optimization",
      bullets: [],
      deliveryNote: "Estimated turnaround: 48–72h | Digital delivery",
    },
  },
};

export const THANK_YOU_NOTES: Record<Language, Record<ServiceType, string>> = {
  fr: {
    cv: "Le présent devis concerne un accompagnement stratégique en optimisation de CV et repositionnement professionnel exécutif.",
    linkedin:
      "Le présent devis concerne un accompagnement stratégique en optimisation de votre visibilité et positionnement LinkedIn.",
    both: "Le présent devis concerne un accompagnement stratégique en optimisation de CV, positionnement professionnel et visibilité LinkedIn.",
  },
  en: {
    cv: "This quote covers strategic CV optimization and executive professional repositioning.",
    linkedin:
      "This quote covers strategic optimization of your LinkedIn visibility and positioning.",
    both: "This quote covers strategic CV optimization, professional positioning, and LinkedIn visibility.",
  },
};

export const THANK_YOU_PREFIX: Record<Language, string> = {
  fr: "Merci pour votre confiance.",
  en: "Thank you for your trust.",
};

export const GENERAL_CONDITIONS: Record<Language, string[]> = {
  fr: [
    "Mission réalisée à distance.",
    "Livraison des livrables au format numérique.",
    "Démarrage du travail après réception du règlement.",
    "Une série d'ajustements mineurs est incluse après livraison.",
    "Les informations transmises par le client restent strictement confidentielles.",
  ],
  en: [
    "Mission carried out remotely.",
    "Deliverables provided in digital format.",
    "Work begins upon receipt of payment.",
    "A round of minor adjustments is included after delivery.",
    "Information provided by the client remains strictly confidential.",
  ],
};

// Build line items: 1 for cv-only or linkedin-only, 2 for combo.
// CV quantity is configurable (1, 2, 3, 4+ for multiple CVs in different domains).
// LinkedIn quantity is always 1.
export type LineItem = {
  serviceKey: "cv" | "linkedin";
  name: string;
  bullets: string[];
  deliveryNote: string;
  unitPrice: number;
  quantity: number;
  total: number;
};

export function buildLineItems(
  service: ServiceType,
  priceCv: number,
  priceLinkedin: number,
  lang: Language,
  cvQuantity: number = 1
): LineItem[] {
  const dict = SERVICE_DESCRIPTIONS[lang];
  const items: LineItem[] = [];
  const cvQty = Math.max(1, cvQuantity);
  if (service === "cv" || service === "both") {
    items.push({
      serviceKey: "cv",
      name: dict.cv.name,
      bullets: dict.cv.bullets,
      deliveryNote: dict.cv.deliveryNote,
      unitPrice: priceCv,
      quantity: cvQty,
      total: priceCv * cvQty,
    });
  }
  if (service === "linkedin" || service === "both") {
    items.push({
      serviceKey: "linkedin",
      name: dict.linkedin.name,
      bullets: dict.linkedin.bullets,
      deliveryNote: dict.linkedin.deliveryNote,
      unitPrice: priceLinkedin,
      quantity: 1,
      total: priceLinkedin,
    });
  }
  return items;
}
