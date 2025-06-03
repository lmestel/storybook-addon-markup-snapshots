import type { Report } from "storybook/preview-api";

export const PARAM_KEY = "markup";
export const ADDON_ID = "storybook/addon-markup";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const TEST_PROVIDER_ID = `${ADDON_ID}/test-provider`;

export type State = {
  [key: string]: Report<string>;
};
export type Event = {
  storyId: string;
  report: Report<string>;
};
