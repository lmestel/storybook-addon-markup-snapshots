import React, {
  useCallback,
  useMemo,
  type ComponentProps,
  type FC,
} from "react";

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
  type API,
} from "storybook/internal/manager-api";
import { styled } from "storybook/theming";
import { PANEL_ID, type State } from "../constants";
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
  api: API;
} & ComponentProps<typeof Container>;

type Status = "idle" | "running" | "passed" | "failed" | "warning";

export const TestProviderRender: FC<TestProviderRenderProps> = ({
  entry,
  store,
  api,
  ...props
}) => {
  const [state] = experimental_useUniversalStore(store);
  const componentTestProviderState = experimental_useTestProviderStore(
    (state) => state["storybook/test"]
  );
  const storyId = entry?.type === "story" && entry.id;
  const statusByStoryId = useMemo<[string, Status][]>(() => {
    if (storyId && state[storyId]) {
      return [[storyId, state[storyId].status]];
    }

    const componentId = entry?.type === "component" && entry.id;
    return Object.entries(state).reduce<[string, Status][]>(
      (prev, [storyId, report]) => {
        if (!componentId || storyId.split("--")[0] === componentId) {
          prev.push([storyId, report.status]);
        }
        return prev;
      },
      []
    );
  }, [state, storyId, entry]);
  const status = useMemo<Status>(() => {
    if (componentTestProviderState === "test-provider-state:running") {
      return "running";
    }

    if (statusByStoryId.length) {
      return statusByStoryId.some(([, status]) => status === "failed")
        ? "failed"
        : "passed";
    }

    return "idle";
  }, [componentTestProviderState, statusByStoryId]);

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
  const firstFailedStoryId = useMemo(() => {
    for (const [storyId, status] of statusByStoryId) {
      if (status === "failed") return storyId;
    }
  }, [statusByStoryId]);
  const openPanel = useCallback(() => {
    const storyToSelect = storyId || firstFailedStoryId;
    if (storyToSelect) {
      api.selectStory(storyToSelect);
    }
    api.setSelectedPanel(PANEL_ID);
    api.togglePanel(true);
  }, [storyId, api, firstFailedStoryId]);

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
          <IconButton
            size="medium"
            disabled={status === "running" || status === "idle"}
            onClick={openPanel}
          >
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
