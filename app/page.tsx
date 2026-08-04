import { readFile } from "node:fs/promises";
import path from "node:path";
import PdfWorkbench from "@/app/pdf-workbench";

export const runtime = "nodejs";
export const maxDuration = 300;

export default async function Home() {
  const sourcePath = path.join(
    process.cwd(),
    "app",
    "retirement_readiness_guideNew.html"
  );
  const initialHtml = await readFile(sourcePath, "utf8");

  return (
    <PdfWorkbench
      initialHtml={initialHtml}
      sourcePath={sourcePath}
    />
  );
}
