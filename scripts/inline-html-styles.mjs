import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer";

const sourceArg = process.argv[2];

if (!sourceArg) {
  console.error("Usage: node scripts/inline-html-styles.mjs <html-file>");
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), sourceArg);
const parsedPath = path.parse(sourcePath);
const outputPath = path.join(
  parsedPath.dir,
  `${parsedPath.name}.inline${parsedPath.ext}`
);

const rawHtml = await fs.readFile(sourcePath, "utf8");

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

try {
  const page = await browser.newPage();
  await page.setContent(rawHtml, { waitUntil: "load" });

  const inlinedHtml = await page.evaluate(() => {
    const normalizeValue = (value) =>
      value.replace(/\s+/g, " ").trim();

    const variableMap = new Map();
    const rootStyle = document.documentElement.style;

    for (const sheet of Array.from(document.styleSheets)) {
      let rules;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      for (const rule of Array.from(rules)) {
        if (rule.type !== CSSRule.STYLE_RULE) {
          continue;
        }

        if (rule.selectorText?.trim() !== ":root") {
          continue;
        }

        for (const propertyName of Array.from(rule.style)) {
          const value = normalizeValue(
            rule.style.getPropertyValue(propertyName)
          );

          variableMap.set(propertyName, value);
          rootStyle.setProperty(propertyName, value);
        }
      }
    }

    const applyDeclarations = (selectorText, styleDeclaration) => {
      const selectors = selectorText
        .split(",")
        .map((selector) => selector.trim())
        .filter(Boolean);

      for (const selector of selectors) {
        if (selector.includes("::")) {
          continue;
        }

        let elements;

        try {
          elements = Array.from(document.querySelectorAll(selector));
        } catch {
          continue;
        }

        for (const element of elements) {
          for (const propertyName of Array.from(styleDeclaration)) {
            if (propertyName.startsWith("--")) {
              continue;
            }

            let value = normalizeValue(
              styleDeclaration.getPropertyValue(propertyName)
            );

            value = value.replace(
              /var\((--[\w-]+)\)/g,
              (_, variableName) => variableMap.get(variableName) ?? ""
            );

            if (!value) {
              continue;
            }

            element.style.setProperty(
              propertyName,
              value,
              styleDeclaration.getPropertyPriority(propertyName)
            );
          }
        }
      }
    };

    const processRuleList = (rules, media = "") => {
      for (const rule of Array.from(rules)) {
        if (rule.type === CSSRule.STYLE_RULE) {
          if (rule.selectorText?.trim() === ":root") {
            continue;
          }

          applyDeclarations(rule.selectorText, rule.style);
          continue;
        }

        if (
          rule.type === CSSRule.MEDIA_RULE &&
          /print/i.test(media || rule.conditionText || "")
        ) {
          processRuleList(
            rule.cssRules,
            media || rule.conditionText || ""
          );
        }
      }
    };

    for (const sheet of Array.from(document.styleSheets)) {
      let rules;

      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      processRuleList(rules);
    }

    for (const styleElement of Array.from(document.querySelectorAll("style"))) {
      styleElement.remove();
    }

    return "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
  });

  await fs.writeFile(outputPath, inlinedHtml, "utf8");
  console.log(outputPath);
} finally {
  await browser.close();
}
