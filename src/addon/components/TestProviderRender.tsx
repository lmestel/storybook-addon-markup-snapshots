import React, { useMemo, type ComponentProps, type FC } from "react";

import {
  Checkbox,
  IconButton,
  ListItem,
  TooltipNote,
  WithTooltip,
} from "storybook/internal/components";
import type { API_HashEntry } from "storybook/internal/types";
import {
  experimental_UniversalStore,
  experimental_useTestProviderStore,
  experimental_useUniversalStore,
} from "storybook/internal/manager-api";
import { styled } from "storybook/theming";
import type { State } from "../constants";
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
  store: experimental_UniversalStore<State>;
} & ComponentProps<typeof Container>;

export const TestProviderRender: FC<TestProviderRenderProps> = ({
  entry,
  store,
  ...props
}) => {
  const [state] = experimental_useUniversalStore(store);
  const componentTestProviderState = experimental_useTestProviderStore(
    (state) => state["storybook/test"]
  );
  const status = useMemo<"idle" | "running" | "passed" | "failed">(() => {
    if (componentTestProviderState === "test-provider-state:running") {
      return "running";
    }

    const reports = Object.values(state);
    if (reports.length) {
      return reports.some((report) => report.status === "failed")
        ? "failed"
        : "passed";
    }

    return "idle";
  }, [componentTestProviderState, state]);

  const [componentTestStatusIcon, componentTestStatusLabel]: [
    ComponentProps<typeof TestStatusIcon>["status"],
    string,
  ] =
    status === "failed"
      ? ["negative", "Markup changes detected"]
      : status === "passed"
        ? ["positive", "No markup changes"]
        : status === "running"
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
              isRunning={status === "running"}
            />
          </IconButton>
        </WithTooltip>
      </Row>
    </Container>
  );
};
