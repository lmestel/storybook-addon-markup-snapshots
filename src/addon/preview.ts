/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Preview as markupAddonAnnotations } from "@storybook/react";
import { TEST_PROVIDER_ID } from "./constants";

let vitestSuite: Awaited<typeof import("vitest/suite")>;

if ((globalThis as any).__vitest_browser__) {
  import("vitest/suite").then((m) => {
    vitestSuite = m;
  });
}

const preview: markupAddonAnnotations = {
  afterEach(storyContext) {
    const test = vitestSuite?.getCurrentTest();
    if (!test) return;

    try {
      const html = storyContext.canvasElement.innerHTML;
      test.context.expect(html).toMatchSnapshot();
      storyContext.reporting.addReport({
        type: TEST_PROVIDER_ID,
        version: 1,
        result: undefined,
        status: "passed",
      });
    } catch (error) {
      storyContext.reporting.addReport({
        type: TEST_PROVIDER_ID,
        version: 1,
        result: { error },
        status: "failed",
      });
    }
  },
};

export default preview;
