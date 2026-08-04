import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { preparePdfHtml } from "@/app/lib/pdf-template";

export async function generatePdfBuffer(rawHtml: string) {
  const processedHtml = preparePdfHtml(rawHtml);
  chromium.setGraphicsMode = false;

  const browser = await puppeteer.launch({
    args: await puppeteer.defaultArgs({
      args: chromium.args,
      headless: "shell",
    }),
    executablePath: await chromium.executablePath(),
    headless: "shell",
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
