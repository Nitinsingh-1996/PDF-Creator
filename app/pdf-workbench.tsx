"use client";

import { useEffect, useState } from "react";
import { preparePdfHtml } from "@/app/lib/pdf-template";

type PdfWorkbenchProps = {
  initialHtml: string;
  sourcePath: string;
};

export default function PdfWorkbench({
  initialHtml,
  sourcePath,
}: PdfWorkbenchProps) {
  const [html, setHtml] = useState(initialHtml);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const updateHtml = (nextHtml: string) => {
    setHtml(nextHtml);
    setPdfUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }

      return "";
    });
  };

  const generatePdf = async () => {
    if (!html.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const blob = await response.blob();
      const nextUrl = URL.createObjectURL(blob);

      setPdfUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return nextUrl;
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-6 text-stone-100 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[28px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.16),_transparent_36%),linear-gradient(135deg,_rgba(12,10,9,0.98),_rgba(28,25,23,0.96))] p-6 shadow-2xl shadow-black/30">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-emerald-300/80">
            HTML to PDF workbench
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="font-serif text-4xl leading-tight text-white md:text-5xl">
                Edit the guide, preview it, and regenerate the PDF anytime.
              </h1>
              <p className="mt-3 text-sm leading-7 text-stone-300">
                Source file: {sourcePath}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateHtml(initialHtml)}
                className="rounded-full border border-stone-600 px-5 py-2 text-sm font-medium text-stone-200 transition hover:border-stone-400 hover:text-white"
                type="button"
              >
                Reset HTML
              </button>

              <button
                onClick={generatePdf}
                disabled={!html.trim() || loading}
                className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-stone-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                {loading ? "Generating PDF..." : "Generate PDF"}
              </button>

              {pdfUrl ? (
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-white"
                >
                  Open PDF
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="rounded-[28px] border border-white/10 bg-stone-900 p-4 shadow-xl shadow-black/20">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                HTML editor
              </h2>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                Inline-styled source
              </p>
            </div>

            <textarea
              value={html}
              onChange={(event) => updateHtml(event.target.value)}
              className="h-[720px] w-full rounded-[22px] border border-white/10 bg-stone-950 p-4 font-mono text-xs leading-6 text-emerald-100 outline-none ring-0 placeholder:text-stone-600 focus:border-emerald-400/50"
              spellCheck={false}
            />
          </div>

          <div className="grid gap-6">
            <div className="rounded-[28px] border border-white/10 bg-stone-900 p-4 shadow-xl shadow-black/20">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  HTML preview
                </h2>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Fixed header and footer
                </p>
              </div>

              <div className="h-[348px] overflow-hidden rounded-[22px] border border-white/10 bg-white">
                <iframe
                  title="HTML Preview"
                  srcDoc={preparePdfHtml(html)}
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-stone-900 p-4 shadow-xl shadow-black/20">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  PDF preview
                </h2>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">
                  Regenerate after edits
                </p>
              </div>

              <div className="h-[348px] overflow-hidden rounded-[22px] border border-white/10 bg-white">
                {pdfUrl ? (
                  <iframe
                    title="PDF Preview"
                    src={pdfUrl}
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-stone-500">
                    Generate the PDF to open it here and in a new tab.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
