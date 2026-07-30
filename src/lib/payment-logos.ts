// Payment method logos — local SVG files embedded as data URIs.
// Used in the invoice PDF to show the payment method with its branded logo.
// SVGs are simple branded badges (colored background + white text).

import fs from "fs";
import path from "path";

const logoCache: Record<string, string> = {};

function getLogoDataUri(filename: string): string | null {
  if (logoCache[filename]) return logoCache[filename];
  try {
    const logoPath = path.join(process.cwd(), "public", "payment-logos", filename);
    const buf = fs.readFileSync(logoPath);
    const svg = buf.toString("utf-8");
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    logoCache[filename] = dataUri;
    return dataUri;
  } catch {
    return null;
  }
}

export function getPaymentMethodLogo(methodName: string): string | null {
  const logoMap: Record<string, string> = {
    "MTN Mobile Money": "mtn.svg",
    "Moov Money": "moov.svg",
    "Orange Money": "orange.svg",
    "Wave": "wave.svg",
    "Celtiis Cash": "celtiis.svg",
    "M-Pesa": "mpesa.svg",
    "PayPal": "paypal.svg",
    "Virement bancaire": "bank.svg",
    "Cash": null,
  };
  const filename = logoMap[methodName];
  if (!filename) return null;
  return getLogoDataUri(filename);
}

// Format the payment method display with logo (for PDF HTML)
export function formatPaymentMethodWithLogo(methodName: string): string {
  const logoUri = getPaymentMethodLogo(methodName);
  if (logoUri) {
    return `<img src="${logoUri}" alt="${methodName}" style="height:16px; vertical-align:middle; margin-right:6px;" />${methodName}`;
  }
  return methodName;
}
