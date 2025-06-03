import React, { useMemo, useState, type FC } from "react";
import { STORY_PREPARED } from "storybook/internal/core-events";
import {
  experimental_useUniversalStore,
  useChannel,
  experimental_UniversalStore,
} from "storybook/internal/manager-api";
import type { State } from "../constants";
import type { StoryPreparedPayload } from "storybook/internal/types";

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
      <pre>TODO: show story markup</pre>

      {report ? (
        <>
          <h2>Snapshot Report</h2>
          {report.status === "passed" && <p>No Markup changes</p>}
          {report.status === "failed" && (
            <>
              <pre>{report.result}</pre>
              <button
                type="button"
                onClick={() => accept(story!.parameters.fileName)}
              >
                accept
              </button>
            </>
          )}
        </>
      ) : (
        <p>Run tests to compare markup</p>
      )}
    </div>
  ) : null;
};
