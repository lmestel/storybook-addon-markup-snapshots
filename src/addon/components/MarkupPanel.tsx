import React, { useCallback, useMemo, useState, type FC } from "react";
import {
  STORY_FINISHED,
  type StoryFinishedPayload,
} from "storybook/internal/core-events";
import {
  experimental_useUniversalStore,
  useChannel,
  experimental_UniversalStore,
} from "storybook/internal/manager-api";
import type { State } from "../constants";

type MarkupPanelProps = {
  accept: (storyId: string) => void;
  active?: boolean;
  store: experimental_UniversalStore<State>;
};

export const MarkupPanel: FC<MarkupPanelProps> = ({
  accept,
  active,
  store,
}) => {
  const [storyId, setStoryId] = useState<string>();
  const handleReport = useCallback((payload: StoryFinishedPayload) => {
    setStoryId(payload.storyId);
  }, []);
  useChannel(
    {
      [STORY_FINISHED]: handleReport,
    },
    [handleReport]
  );
  const [state] = experimental_useUniversalStore(store);
  const report = useMemo(() => {
    if (storyId && state) {
      return state[storyId];
    }
  }, [storyId, state]);

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
              <button type="button" onClick={() => accept(storyId!)}>
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
