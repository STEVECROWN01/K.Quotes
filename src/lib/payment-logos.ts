// Payment method logos — SVG/PNG URLs for each payment provider.
// Used in the invoice PDF to show the payment method with its real logo.
// Logos are stored as data URIs (base64-encoded SVGs) for reliability in Puppeteer.

export function getPaymentMethodLogo(methodName: string): string | null {
  const logos: Record<string, string> = {
    "MTN Mobile Money": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/MTN_Group_logo.svg/200px-MTN_Group_logo.svg.png",
    "Moov Money": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Moov_Africa_logo.svg/200px-Moov_Africa_logo.svg.png",
    "Orange Money": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png",
    "Wave": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Wave_Logo_2022.svg/200px-Wave_Logo_2022.svg.png",
    "Celtiis Cash": null, // No public logo available
    "M-Pesa": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/M-PESA_logo.svg/200px-M-PESA_logo.svg.png",
    "PayPal": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png",
    "Virement bancaire": null, // Bank transfer — no logo, text only
    "Cash": null,
  };
  return logos[methodName] ?? null;
}

// Format the payment method display with logo
export function formatPaymentMethodWithLogo(methodName: string): string {
  const logoUrl = getPaymentMethodLogo(methodName);
  if (logoUrl) {
    return `<img src="${logoUrl}" alt="${methodName}" style="height:14px; vertical-align:middle; margin-right:4px;" />${methodName}`;
  }
  return methodName;
}
