const PRINT_OVERRIDES = `
  <style id="pdf-inline-overrides">
    @page {
      size: A4;
      margin: 0;
    }

    html,
    body {
      margin: 0;
      padding: 0;
    }

    body {
      background: #e5e7eb;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto 14mm;
      background: #ffffff;
      position: relative;
      overflow: hidden;
      box-shadow: none;
      page-break-after: always;
      break-after: page;
    }

    .page:last-child {
      margin-bottom: 0;
      page-break-after: auto;
      break-after: auto;
    }

    .running-header,
    .running-footer {
      position: absolute;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .running-header {
      top: 0;
      min-height: 18mm;
    }

    .running-footer {
      bottom: 0;
      min-height: 14mm;
    }

    .running-header + .page-body {
      min-height: calc(297mm - 32mm);
      padding-top: 30mm;
      padding-bottom: 22mm;
    }

    .cover-page {
      min-height: 297mm;
      position: relative;
    }

    @media screen {
      body {
        padding: 24px;
      }

      .page {
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
      }
    }

    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .page {
        margin: 0;
      }
    }
  </style>
`;

const REMOTE_FONT_IMPORT =
  /@import\s+url\(['"]https:\/\/fonts\.googleapis\.com\/css2[^;]+;\s*/g;

export function preparePdfHtml(rawHtml: string) {
  const withoutRemoteFonts = rawHtml.replace(REMOTE_FONT_IMPORT, "");

  if (withoutRemoteFonts.includes('id="pdf-inline-overrides"')) {
    return withoutRemoteFonts;
  }

  if (withoutRemoteFonts.includes("</head>")) {
    return withoutRemoteFonts.replace(
      "</head>",
      `${PRINT_OVERRIDES}\n</head>`
    );
  }

  return `${PRINT_OVERRIDES}\n${withoutRemoteFonts}`;
}
