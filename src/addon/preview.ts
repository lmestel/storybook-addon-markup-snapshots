/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Preview as markupAddonAnnotations } from "@storybook/react";
import { format } from "prettier";
import prettierHtml from "prettier/plugins/html";
import { createPatch } from "diff";
import { TEST_PROVIDER_ID } from "./constants";

const prettierConfig = {
  htmlWhitespaceSensitivity: "ignore" as const,
  parser: "html",
  plugins: [prettierHtml],
};

let vitestSuite: Awaited<typeof import("vitest/suite")>;

if ((globalThis as any).__vitest_browser__) {
  import("vitest/suite").then((m) => {
    vitestSuite = m;
  });
}

const preview: markupAddonAnnotations = {
  async afterEach(storyContext) {
    const test = vitestSuite?.getCurrentTest();
    if (!test) return;

    try {
      const html = storyContext.canvasElement.innerHTML;
      test.context.expect(await format(html, prettierConfig)).toMatchSnapshot();
      storyContext.reporting.addReport({
        type: TEST_PROVIDER_ID,
        version: 1,
        result: undefined,
        status: "passed",
      });
    } catch (error: any) {
      const expected = error.expected
        .substring(1, error.expected.length - 1)
        .replace(/^\n|\n$/g, "");
      const actual = error.actual
        .substring(1, error.actual.length - 1)
        .replace(/^\n|\n$/g, "");

      storyContext.reporting.addReport({
        type: TEST_PROVIDER_ID,
        version: 1,
        result: {
          oldStr: expected,
          diff: createPatch(storyContext.id, expected, actual),
        },
        status: "failed",
      });
    }
  },
};

export default preview;
