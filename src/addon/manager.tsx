import React from "react";
import {
  addons,
  experimental_UniversalStore,
  experimental_getStatusStore,
} from "storybook/manager-api";
import {
  Addon_TypesEnum,
  type EventInfo,
  type Status,
} from "storybook/internal/types";

import { ADDON_ID, PANEL_ID, type State, TEST_PROVIDER_ID } from "./constants";
import { TestProviderRender } from "./components/TestProviderRender";
import { MarkupPanel } from "./components/MarkupPanel";

addons.register(ADDON_ID, (api) => {
  const store = experimental_UniversalStore.create<State>({
    id: ADDON_ID,
    initialState: {},
  });

  const accept = (fileName: string) => {
    const event = { type: ADDON_ID + "__accept", fileName };
    const eventInfo: EventInfo = { actor: store.actor };
    // @ts-expect-error channel is a private property
    store.channel.emit("UNIVERSAL_STORE:storybook/test", { event, eventInfo });
  };

  const statusStore = experimental_getStatusStore(ADDON_ID);
  store.onStateChange((state) => {
    const statuses: Status[] = [];
    for (const storyId in state) {
      const report = state[storyId];
      statuses.push({
        storyId,
        value:
          report.status === "failed"
            ? "status-value:error"
            : report.status === "passed"
              ? "status-value:success"
              : report.status === "warning"
                ? "status-value:warning"
                : "status-value:unknown",
        typeId: ADDON_ID,
        description: "",
        title: "Markup changes",
        sidebarContextMenu: true,
      });
    }
    statusStore.set(statuses);
  });
  statusStore.onSelect(() => {
    api.setSelectedPanel(PANEL_ID);
    api.togglePanel(true);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storybookBuilder = (globalThis as any).STORYBOOK_BUILDER || "";
  if (storybookBuilder.includes("vite")) {
    addons.add(TEST_PROVIDER_ID, {
      type: Addon_TypesEnum.experimental_TEST_PROVIDER,
      render() {
        return <TestProviderRender store={store} api={api} />;
      },
      sidebarContextMenu: ({ context }) => {
        if (context.type === "docs") {
          return null;
        }
        if (context.type === "story" && !context.tags.includes("test")) {
          return null;
        }
        return <TestProviderRender store={store} entry={context} api={api} />;
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
