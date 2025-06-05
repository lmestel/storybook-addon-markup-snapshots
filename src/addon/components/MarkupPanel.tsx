import React, { useMemo, useState, type FC } from "react";
import { STORY_PREPARED } from "storybook/internal/core-events";
import { TabsState, Button } from "storybook/internal/components";
import { BatchAcceptIcon } from "@storybook/icons";
import {
  experimental_useUniversalStore,
  useChannel,
  experimental_UniversalStore,
} from "storybook/internal/manager-api";
import type { State } from "../constants";
import type { StoryPreparedPayload } from "storybook/internal/types";
import { DiffViewer } from "./DiffViewer";

type MarkupPanelProps = {
  accept: (fileName: string) => void;
  active?: boolean;
  store: experimental_UniversalStore<State>;
};

export const MarkupPanel: FC<MarkupPanelProps> = ({
  accept,
  active,
  store,
}) => {
  const [story, setStory] = useState<StoryPreparedPayload>();
  useChannel(
    {
      [STORY_PREPARED]: setStory,
    },
    [setStory]
  );
  const [state] = experimental_useUniversalStore(store);
  const report = useMemo(() => {
    if (story && state) {
      return state[story.id];
    }
  }, [story, state]);

  return active ? (
    <div>
      {report ? (
        <div>
          {report.status === "passed" && <p>No Markup changes</p>}
          {report.status === "failed" && (
            <>
              <TabsState initial="side-by-side" menuName="Diff Type">
                <div id="side-by-side" title="Show diff Side-by-Side">
                  <DiffViewer
                    viewType="split"
                    oldStr={report.result.oldStr}
                    diff={report.result.diff.split("\n").slice(2).join("\n")}
                  />
                </div>
                <div id="unified" title="Show diff unified">
                  <DiffViewer
                    viewType="unified"
                    oldStr={report.result.oldStr}
                    diff={report.result.diff.split("\n").slice(2).join("\n")}
                  />
                </div>
              </TabsState>

              <Button
                onClick={() => accept(story!.parameters.fileName)}
                variant="solid"
                size="medium"
                animation="glow"
              >
                <BatchAcceptIcon /> Accept All Changes
              </Button>
            </>
          )}
        </div>
      ) : (
        <p>Run tests to compare markup</p>
      )}
    </div>
  ) : null;
};
