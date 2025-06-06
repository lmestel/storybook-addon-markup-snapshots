import path from "node:path";
import fs from "node:fs";
import process from "node:process";
import type { Reporter } from "vitest/reporters";
import type { TaskMeta } from "@vitest/runner";
import type { TestCase } from "vitest/node";
import type { Report } from "storybook/preview-api";
import { ADDON_ID, TEST_PROVIDER_ID, type Event } from "./constants";

const write = process.env.VITEST_STORYBOOK !== "true";

export default class SnapshotDiffReporter implements Reporter {
  outputDir = "story-patches";

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
          if (report.type === TEST_PROVIDER_ID) {
          if (write) {
            if (report.status === "failed") {
              const outputPath = path.resolve(
                this.outputDir,
                `${storyId}.patch`
              );
              fs.writeFileSync(outputPath, report.result);
              console.log(`📝 Wrote snapshot diff to: ${outputPath}`);
            }
          } else {
            const event: Event = { storyId, report };
            process.send?.({
              type: ADDON_ID,
              args: [{ event }],
              from: "server",
            });
          }
        }
      }
    }
  }
}
