import { generatePdfBuffer } from "@/app/lib/pdf-generator";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();
    const pdf = await generatePdfBuffer(html);

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
