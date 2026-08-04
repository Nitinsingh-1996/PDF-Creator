"use server";

import { generatePdfBuffer } from "@/app/lib/pdf-generator";

export async function generatePdfAction(html: string) {
  if (!html.trim()) {
    throw new Error("HTML is required");
  }

  const pdf = await generatePdfBuffer(html);

  return Buffer.from(pdf).toString("base64");
}
