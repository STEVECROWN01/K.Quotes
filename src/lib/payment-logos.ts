// Payment method logos — SVG content embedded directly as data URIs.
// No fs/path imports (would break client-side build).
// Each logo is a simple branded badge: colored background + white/dark text.

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// Pre-built SVG badges for each payment method
const SVG_LOGOS: Record<string, string> = {
  "MTN Mobile Money": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="18" viewBox="0 0 50 18"><rect width="50" height="18" fill="#FFCC00" rx="3"/><text x="25" y="13" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="#000" text-anchor="middle">MTN</text></svg>'),
  "Moov Money": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="55" height="18" viewBox="0 0 55 18"><rect width="55" height="18" fill="#0066B3" rx="3"/><text x="27" y="13" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">Moov</text></svg>'),
  "Orange Money": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18" viewBox="0 0 60 18"><rect width="60" height="18" fill="#FF7900" rx="3"/><text x="30" y="13" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">Orange</text></svg>'),
  "Wave": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="18" viewBox="0 0 50 18"><rect width="50" height="18" fill="#1DC8FF" rx="3"/><text x="25" y="13" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">Wave</text></svg>'),
  "Celtiis Cash": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="55" height="18" viewBox="0 0 55 18"><rect width="55" height="18" fill="#00A651" rx="3"/><text x="27" y="13" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">Celtiis</text></svg>'),
  "M-Pesa": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18" viewBox="0 0 60 18"><rect width="60" height="18" fill="#4CAF50" rx="3"/><text x="30" y="13" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">M-PESA</text></svg>'),
  "PayPal": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="18" viewBox="0 0 60 18"><rect width="60" height="18" fill="#003087" rx="3"/><text x="30" y="13" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="#fff" text-anchor="middle">PayPal</text></svg>'),
  "Virement bancaire": svgToDataUri('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="18" viewBox="0 0 80 18"><rect width="80" height="18" fill="#374151" rx="3"/><text x="40" y="13" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">Bank Transfer</text></svg>'),
};

export function getPaymentMethodLogo(methodName: string): string | null {
  return SVG_LOGOS[methodName] ?? null;
}

// Format the payment method display with logo (for PDF HTML)
export function formatPaymentMethodWithLogo(methodName: string): string {
  const logoUri = getPaymentMethodLogo(methodName);
  if (logoUri) {
    return `<img src="${logoUri}" alt="${methodName}" style="height:16px; vertical-align:middle; margin-right:6px;" />${methodName}`;
  }
  return methodName;
}
