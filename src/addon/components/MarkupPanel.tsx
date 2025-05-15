import React, { useCallback } from "react";
import {
  STORY_FINISHED,
  type StoryFinishedPayload,
} from "storybook/internal/core-events";
import { useChannel } from "storybook/internal/manager-api";

export const MarkupPanel = () => {
  const handleReport = useCallback((payload: StoryFinishedPayload) => {
    console.log("StoryFinishedPayload", payload);
  }, []);
  useChannel(
    {
      [STORY_FINISHED]: handleReport,
    },
    [handleReport]
  );

  return <pre>TODO: show story markup</pre>;
};
