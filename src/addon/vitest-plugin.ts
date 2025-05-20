import type { Vite, VitestPluginContext } from "vitest/node";
import SnapshotDiffReporter from "./vitest-reporter";

export function plugin(): Vite.Plugin {
  return {
    name: "vitest:markup-plugin",
    configureVitest(context: VitestPluginContext) {
      const { reporters } = context.vitest.config;
      reporters.push(new SnapshotDiffReporter());
    },
  };
}
