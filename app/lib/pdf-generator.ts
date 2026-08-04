import puppeteer from "puppeteer";
import { preparePdfHtml } from "@/app/lib/pdf-template";

export async function generatePdfBuffer(rawHtml: string) {
  const processedHtml = preparePdfHtml(rawHtml);
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 2000,
    });

    await page.setContent(processedHtml, {
      waitUntil: "load",
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    return pdf;
  } finally {
    await browser.close();
  }
}
