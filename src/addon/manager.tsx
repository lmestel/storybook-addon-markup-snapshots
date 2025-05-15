import React from "react";
import { addons } from "storybook/manager-api";
import { Addon_TypesEnum } from "storybook/internal/types";

import { ADDON_ID, PANEL_ID, TEST_PROVIDER_ID } from "./constants";
import { TestProviderRender } from "./components/TestProviderRender";
import { MarkupPanel } from "./components/MarkupPanel";

addons.register(ADDON_ID, () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storybookBuilder = (globalThis as any).STORYBOOK_BUILDER || "";
  if (storybookBuilder.includes("vite")) {
    addons.add(TEST_PROVIDER_ID, {
      type: Addon_TypesEnum.experimental_TEST_PROVIDER,
      render() {
        return <TestProviderRender />;
      },
    });

    addons.add(PANEL_ID, {
      type: Addon_TypesEnum.PANEL,
      title: "Markup",
      render({ active }) {
        return active ? <MarkupPanel /> : null;
      },
    });
  }
});
