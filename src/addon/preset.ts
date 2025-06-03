import type { Channel } from "storybook/internal/channels";
import { experimental_UniversalStore } from "storybook/internal/core-server";
import { ADDON_ID, type State, type Event } from "./constants";

export const experimental_serverChannel = async (channel: Channel) => {
  const store = experimental_UniversalStore.create<State>({
    id: ADDON_ID,
    initialState: {},
    leader: true,
  });

  channel.on(ADDON_ID, ({ event }: { event: Event }) => {
    store.setState((state) => {
      return {
        ...state,
        [event.storyId]: event.report,
      };
    });
  });

  return channel;
};

export const previewAnnotations = [require.resolve("./preview")];

export const managerEntries = [require.resolve("./manager")];
