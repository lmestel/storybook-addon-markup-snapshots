import process from "node:process";
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
          const { type, storyId } = event.args[0].event;
          if (type === ADDON_ID + "__accept") {
            console.log("!! accept", storyId);
            // TODO
            // context.vitest.updateSnapshot([storyId])
          }
        }
      });
    },
  };
}
