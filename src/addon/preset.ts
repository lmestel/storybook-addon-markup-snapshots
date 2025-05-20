import type { Channel } from "storybook/internal/channels";
import { experimental_UniversalStore } from "storybook/internal/core-server";
import { ADDON_ID } from "./constants";

export const experimental_serverChannel = async (channel: Channel) => {
  const store = experimental_UniversalStore.create({
    id: ADDON_ID,
    initialState: new Map(),
    leader: true,
  });
  store.onStateChange((state) => {
    console.log("onStateChange", state);
  });

  return channel;
};

export const previewAnnotations = [require.resolve("./preview")];

export const managerEntries = [require.resolve("./manager")];
