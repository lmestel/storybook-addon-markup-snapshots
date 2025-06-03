import React from "react";
import { addons, experimental_UniversalStore } from "storybook/manager-api";
import { Addon_TypesEnum, type EventInfo } from "storybook/internal/types";

import { ADDON_ID, PANEL_ID, TEST_PROVIDER_ID } from "./constants";
import { TestProviderRender } from "./components/TestProviderRender";
import { MarkupPanel } from "./components/MarkupPanel";

addons.register(ADDON_ID, () => {
  const store = experimental_UniversalStore.create({
    id: ADDON_ID,
    initialState: {},
  });
  const accept = (storyId: string) => {
    const event = { type: ADDON_ID + "__accept", storyId };
    const eventInfo: EventInfo = { actor: store.actor };
    // @ts-expect-error channel is a private property
    store.channel.emit("UNIVERSAL_STORE:storybook/test", { event, eventInfo });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storybookBuilder = (globalThis as any).STORYBOOK_BUILDER || "";
  if (storybookBuilder.includes("vite")) {
    addons.add(TEST_PROVIDER_ID, {
      type: Addon_TypesEnum.experimental_TEST_PROVIDER,
      render() {
        return <TestProviderRender store={store} />;
      },
    });

    addons.add(PANEL_ID, {
      type: Addon_TypesEnum.PANEL,
      title: "Markup",
      render({ active }) {
        return <MarkupPanel accept={accept} active={active} store={store} />;
      },
    });
  }
});
