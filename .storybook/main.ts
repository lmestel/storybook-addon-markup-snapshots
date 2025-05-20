import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "../src/addon/preset.ts",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;