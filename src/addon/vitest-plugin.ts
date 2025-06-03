import process from "node:process";
import path from "node:path";
import type { Vite, VitestPluginContext } from "vitest/node";
import SnapshotDiffReporter from "./vitest-reporter";
import { ADDON_ID } from "./constants";

export function plugin(): Vite.Plugin {
  return {
    name: "vitest:markup-plugin",
    configureVitest(context: VitestPluginContext) {
      const { reporters } = context.vitest.config;
      reporters.push(new SnapshotDiffReporter());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      process.on("message", (event: any) => {
        if (event?.type === "UNIVERSAL_STORE:storybook/test") {
          const { type, fileName } = event.args[0].event;
          if (type === ADDON_ID + "__accept") {
            context.vitest.updateSnapshot([
              path.resolve(context.vitest.config.root, fileName),
            ]);
          }
        }
      });
    },
  };
}
