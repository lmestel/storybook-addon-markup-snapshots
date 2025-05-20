import path from "node:path";
import fs from "node:fs";
import { createRequire } from "node:module";
import type { Reporter } from "vitest/reporters";
import type { TaskMeta } from "@vitest/runner";
import type { TestCase } from "vitest/node";
import type { Report } from "storybook/preview-api";
import { ADDON_ID, TEST_PROVIDER_ID } from "./constants";

const require = createRequire(import.meta.url);

// we need to require core-server here, because its ESM output is not valid
const { experimental_UniversalStore } =
  require("storybook/internal/core-server") as {
    experimental_UniversalStore: typeof import("storybook/internal/core-server").experimental_UniversalStore;
  };

const write = process.env.VITEST_STORYBOOK !== "true";

const store = experimental_UniversalStore.create({
  id: ADDON_ID,
  initialState: new Map(),
});

export default class SnapshotDiffReporter implements Reporter {
  outputDir = "story-patches";

  async onInit() {
    if (!write) {
      await store.untilReady();
    }
  }

  onTestRunStart() {
    if (write) {
      fs.rmSync(this.outputDir, { recursive: true, force: true });
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onTestCaseResult(testCase: TestCase) {
    const { storyId, reports } = testCase.meta() as TaskMeta &
      Partial<{ storyId: string; reports: Report<string>[] }>;
    if (storyId && reports) {
      for (const report of reports) {
        if (report.type === TEST_PROVIDER_ID && report.status === "failed") {
          const outputPath = path.resolve(this.outputDir, `${storyId}.patch`);
          if (write) {
            fs.writeFileSync(outputPath, report.result);
            console.log(`📝 Wrote snapshot diff to: ${outputPath}`);
          } else {
            store.setState((store) => store.set(storyId, report.result));
          }
        }
      }
    }
  }
}
