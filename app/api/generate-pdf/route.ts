import puppeteer from "puppeteer";
import { preparePdfHtml } from "@/app/lib/pdf-template";

export async function POST(req: Request) {
    try {
        const { html } = await req.json();
        const processedHtml = preparePdfHtml(html);

        const browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
            ],
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: 1440,
            height: 2000,
        });

        await page.setContent(processedHtml, {
            // puppeteer types expect 'load' | 'domcontentloaded' for waitUntil
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

        await browser.close();

        return new Response(Buffer.from(pdf), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition":
                    'inline; filename="document.pdf"',
            },
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            {
                error: "Failed to generate PDF",
            },
            {
                status: 500,
            }
        );
    }
}
