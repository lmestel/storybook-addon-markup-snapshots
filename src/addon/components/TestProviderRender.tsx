import React, { type ComponentProps, type FC } from "react";

import {
  Checkbox,
  IconButton,
  ListItem,
  TooltipNote,
  WithTooltip,
} from "storybook/internal/components";
import type { API_HashEntry } from "storybook/internal/types";
import { experimental_useTestProviderStore } from "storybook/internal/manager-api";
import { styled } from "storybook/theming";

import { TestStatusIcon } from "./TestStatusIcon";

const Container = styled.div({
  display: "flex",
  flexDirection: "column",
  marginBottom: 2,
});

const Row = styled.div({
  display: "flex",
  gap: 4,
});

type TestProviderRenderProps = {
  entry?: API_HashEntry;
} & ComponentProps<typeof Container>;

export const TestProviderRender: FC<TestProviderRenderProps> = ({
  entry,
  ...props
}) => {
  const componentTestProviderState = experimental_useTestProviderStore(
    (state) => state["storybook/test"]
  );
  const isRunning =
    componentTestProviderState === "test-provider-state:running";

  const [componentTestStatusIcon, componentTestStatusLabel]: [
    ComponentProps<typeof TestStatusIcon>["status"],
    string
  ] = isRunning
    ? ["unknown", "Testing in progress"]
    : ["unknown", "Run tests to see results"];

  return (
    <Container {...props}>
      <Row>
        <ListItem
          as="label"
          title="Markup changes"
          icon={entry ? null : <Checkbox checked disabled />}
        />
        <WithTooltip
          hasChrome={false}
          trigger="hover"
          tooltip={<TooltipNote note={componentTestStatusLabel} />}
        >
          <IconButton size="medium" disabled>
            <TestStatusIcon
              status={componentTestStatusIcon}
              aria-label={componentTestStatusLabel}
              isRunning={isRunning}
            />
          </IconButton>
        </WithTooltip>
      </Row>
    </Container>
  );
};
