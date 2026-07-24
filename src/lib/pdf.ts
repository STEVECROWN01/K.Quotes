// Server-side PDF generation via Puppeteer.
// Renders the document HTML to a 2-page A4 PDF that matches the reference template.

import puppeteer, { type Browser } from "puppeteer";
import { renderDocumentHtml, type DocumentPayload } from "@/components/keter/document-html";
import type { QuoteRecord } from "@/lib/storage";
import fs from "fs";
import path from "path";

let browserInstance: Browser | null = null;

// Find the Puppeteer-bundled Chrome executable. On Railway/production, the
// postinstall hook downloads Chrome into node_modules/.cache/puppeteer.
function findChromeExecutable(): string | undefined {
  // 1. PUPPETEER_EXECUTABLE_PATH env var (set by Railway if needed)
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  // 2. Look in the puppeteer cache directory
  try {
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache", "puppeteer");
    if (fs.existsSync(cacheDir)) {
      const versions = fs.readdirSync(cacheDir);
      for (const v of versions) {
        const chromeDir = path.join(cacheDir, v, "chrome-linux64");
        if (fs.existsSync(chromeDir)) {
          const exe = path.join(chromeDir, "chrome");
          if (fs.existsSync(exe)) return exe;
        }
        // Fallback: chrome-linx (older layout)
        const altDir = path.join(cacheDir, v, "chrome-linux");
        if (fs.existsSync(altDir)) {
          const exe = path.join(altDir, "chrome");
          if (fs.existsSync(exe)) return exe;
        }
      }
    }
  } catch (e) {
    console.warn("[pdf] Could not find Puppeteer Chrome in cache:", e);
  }

  // 3. System chrome (some environments install it globally)
  for (const sysPath of [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
  ]) {
    if (fs.existsSync(sysPath)) return sysPath;
  }

  // 4. Let Puppeteer use its default (works in dev with bundled Chromium)
  return undefined;
}

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.connected) return browserInstance;

  const executablePath = findChromeExecutable();
  console.log("[pdf] Launching browser. executablePath:", executablePath || "(puppeteer default)");

  browserInstance = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--single-process",
      "--no-zygote",
    ],
  });
  return browserInstance;
}

// Accept either a QuoteRecord (from DB) or a DocumentPayload (from form POST).
// `logoSrc` is an optional base64 data URI — needed because Puppeteer's setContent
// has no base URL to resolve relative paths like /keter-logo.png.
export async function generatePdf(
  payload: QuoteRecord | DocumentPayload,
  logoSrc?: string
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Normalize: if it has createdAt, it's a QuoteRecord — convert.
  const p: DocumentPayload =
    "createdAt" in payload
      ? {
          docType: payload.docType,
          language: payload.language,
          clientNumber: payload.clientNumber,
          date: payload.date,
          fullName: payload.fullName,
          city: payload.city,
          country: payload.country,
          phone: payload.phone,
          email: payload.email,
          service: payload.service,
          priceCv: payload.priceCv,
          priceLinkedin: payload.priceLinkedin,
          accountHolder: payload.accountHolder,
          iban: payload.iban,
          bic: payload.bic,
          bank: payload.bank,
          paymentMode: payload.paymentMode,
          paymentConditions: payload.paymentConditions,
          paymentLink: payload.paymentLink,
          paymentStatus: payload.paymentStatus,
          paymentDate: payload.paymentDate,
          quoteNumber: payload.quoteNumber,
        }
      : payload;

  const html = renderDocumentHtml(p, logoSrc);

  // Use 'domcontentloaded' (faster than networkidle0) then explicitly wait for fonts.
  await page.setContent(html, { waitUntil: "domcontentloaded", timeout: 30000 });
  // Wait for web fonts to load (max 5s) so the document renders with Inter etc.
  await page.evaluate(() => {
    return Promise.race([
      (document as any).fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
  });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await page.close();
  return Buffer.from(pdfBuffer);
}

// Optional: gracefully close browser on process exit
process.on("exit", async () => {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
  }
});
