import React, { useMemo, useState, type ComponentProps, type FC } from "react";
import { STORY_PREPARED } from "storybook/internal/core-events";
import {
  BatchAcceptIcon,
  CopyIcon,
  FastForwardIcon,
  PlayBackIcon,
  PlayNextIcon,
  RewindIcon,
  SyncIcon,
} from "@storybook/icons";
import {
  experimental_useUniversalStore,
  useChannel,
  experimental_UniversalStore,
} from "storybook/internal/manager-api";
import { internal_fullTestProviderStore } from "storybook/manager-api";
import type { State } from "../constants";
import type { StoryPreparedPayload } from "storybook/internal/types";
import { DiffViewer } from "./DiffViewer";
import { styled, typography } from "storybook/internal/theming";
import {
  Bar,
  Button,
  IconButton,
  WithTooltip,
  Separator,
  P,
  TooltipNote,
  ActionBar,
  EmptyTabContent,
  Link,
} from "storybook/internal/components";
import { parseDiff } from "react-diff-view";

interface StatusBarProps {
  status:
    | CallStates.DONE
    | CallStates.ERROR
    | CallStates.ACTIVE
    | CallStates.WAITING;
  accept: (fileName: string) => void;
  story?: StoryPreparedPayload;
  onScrollToEnd?: () => void;
}

enum CallStates {
  DONE = "done",
  ERROR = "error",
  ACTIVE = "active",
  WAITING = "waiting",
}

interface StatusBadgeProps {
  status:
    | CallStates.DONE
    | CallStates.ERROR
    | CallStates.ACTIVE
    | CallStates.WAITING;
}

interface AnimatedButtonProps {
  animating?: boolean;
}

type MarkupPanelProps = {
  accept: (fileName: string) => void;
  active?: boolean;
  store: experimental_UniversalStore<State>;
};

const SubnavWrapper = styled.div(({ theme }) => ({
  boxShadow: `${theme.appBorderColor} 0 -1px 0 0 inset`,
  background: theme.background.app,
  position: "sticky",
  top: 0,
  zIndex: 1,
}));

const StyledSubnav = styled.nav(() => ({
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingLeft: 15,
  paddingRight: 15,
}));

const Group = styled.div({
  display: "flex",
  alignItems: "center",
});

const StatusColorMapping = {
  [CallStates.DONE]: "positive",
  [CallStates.ERROR]: "negative",
  [CallStates.ACTIVE]: "warning",
  [CallStates.WAITING]: "warning",
} as const;

const StatusTextMapping = {
  [CallStates.DONE]: "Pass",
  [CallStates.ERROR]: "Fail",
  [CallStates.ACTIVE]: "Runs",
  [CallStates.WAITING]: "Runs",
} as const;

const StyledBadge = styled.div<StatusBadgeProps>(({ theme, status }) => {
  const backgroundColor = theme.color[StatusColorMapping[status!]];
  return {
    padding: "4px 6px 4px 8px",
    borderRadius: "4px",
    backgroundColor,
    color: "white",
    fontFamily: typography.fonts.base,
    textTransform: "uppercase",
    fontSize: typography.size.s1,
    letterSpacing: 3,
    fontWeight: typography.weight.bold,
    width: 65,
    textAlign: "center",
  };
});

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeText = StatusTextMapping[status!];
  return (
    <StyledBadge aria-label="Status of the test run" status={status}>
      {badgeText}
    </StyledBadge>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 4,
  padding: 6,
  color: theme.textMutedColor,
  "&:not(:disabled)": {
    "&:hover,&:focus-visible": {
      color: theme.color.secondary,
    },
  },
}));

const JumpToEndButton = styled(StyledButton)({
  marginLeft: 9,
  marginRight: 9,
  marginBottom: 1,
  lineHeight: "12px",
});

const StyledSeparator = styled(Separator)({
  marginTop: 0,
});

const Note = styled(TooltipNote)(({ theme }) => ({
  fontFamily: theme.typography.fonts.base,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.textMutedColor,
  margin: "0 3px",
}));

const RerunButton = styled(StyledIconButton)<
  AnimatedButtonProps & ComponentProps<typeof StyledIconButton>
>(({ theme, animating, disabled }) => ({
  opacity: disabled ? 0.5 : 1,
  svg: {
    animation: animating
      ? `${theme.animation.rotate360} 200ms ease-out`
      : undefined,
  },
}));

const StyledStoryPath = styled(P)(({ theme }) => ({
  color: theme.textMutedColor,
  justifyContent: "flex-end",
  textAlign: "right",
  whiteSpace: "nowrap",
  marginTop: 4,
  marginBottom: 1,
  paddingRight: 15,
  fontSize: 13,
}));

const StyledDetectedChanges = styled(P)(({ theme }) => ({
  color: theme.textMutedColor,
  justifyContent: "flex-start",
  textAlign: "left",
  whiteSpace: "nowrap",
  marginTop: 4,
  marginBottom: 1,
  paddingLeft: 15,
  fontSize: 13,
}));

const RewindButton = styled(StyledIconButton)({
  marginLeft: 9,
});

interface AcceptButtonProps {
  onClick: (fileName: string) => void;
  fileName: string;
}

const AcceptButton: React.FC<AcceptButtonProps> = ({ onClick, fileName }) => {
  return (
    <Button
      onClick={() => onClick(fileName)}
      variant="solid"
      size="small"
      animation="glow"
    >
      <BatchAcceptIcon /> Accept XX (TODO) changes
    </Button>
  );
};

const StatusBar: React.FC<StatusBarProps> = ({
  status,
  onScrollToEnd,
  accept,
  story,
}) => {
  const buttonText = status === CallStates.ERROR ? "Expand all" : "Expand all";

  return (
    <SubnavWrapper>
      <Bar>
        <StyledSubnav aria-label="Component tests toolbar">
          <Group>
            <StatusBadge status={status} />
            <JumpToEndButton onClick={onScrollToEnd} disabled={!onScrollToEnd}>
              {buttonText}
            </JumpToEndButton>

            <StyledSeparator />

            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Previous component" />}
            >
              <RewindButton
                aria-label="Go to start"
                onClick={() => {
                  console.log("TODO implement navigation");
                }}
                disabled={false}
              >
                <RewindIcon />
              </RewindButton>
            </WithTooltip>

            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Previous variant" />}
            >
              <StyledIconButton
                aria-label="Go back"
                onClick={() => {
                  console.log("TODO implement navigation");
                }}
                disabled={false}
              >
                <PlayBackIcon />
              </StyledIconButton>
            </WithTooltip>

            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Next variant" />}
            >
              <StyledIconButton
                aria-label="Go forward"
                onClick={() => {
                  console.log("TODO implement navigation");
                }}
                disabled={false}
              >
                <PlayNextIcon />
              </StyledIconButton>
            </WithTooltip>

            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Go to end" />}
            >
              <StyledIconButton
                aria-label="Go to end"
                onClick={() => {
                  console.log("TODO implement navigation");
                }}
                disabled={false}
              >
                <FastForwardIcon />
              </StyledIconButton>
            </WithTooltip>
          </Group>
          <Group>
            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Rerun" />}
            >
              <RerunButton
                aria-label="Rerun"
                onClick={() => {
                  internal_fullTestProviderStore.runAll();
                }}
              >
                <SyncIcon />
              </RerunButton>
            </WithTooltip>

            <StyledSeparator />
            <WithTooltip
              trigger="hover"
              hasChrome={false}
              tooltip={<Note note="Accept XX (TODO) changes" />}
            >
              <AcceptButton
                onClick={accept}
                fileName={story!.parameters.fileName}
              />
            </WithTooltip>
          </Group>
        </StyledSubnav>
      </Bar>
    </SubnavWrapper>
  );
};

const CopyButton = ({ code }: { code: string }) => (
  <Button
    onClick={() => {
      return copyTextToClipboard(code);
    }}
    variant="outline"
    size="medium"
    animation="glow"
    className="diff-viewer-copy-code"
  >
    <CopyIcon />
  </Button>
);

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => {},
    (err) => {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

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
  const [diffType, setDiffType] = useState<"side-by-side" | "unified">(
    "side-by-side"
  );
  const [state] = experimental_useUniversalStore(store);
  const report = useMemo(() => {
    console.log(story, state, story && state[story?.id]);
    if (story && state) {
      return state[story.id];
    }
  }, [story, state]);
  const diff = useMemo(() => {
    if (report && report.result) {
      return parseDiff(report.result.diff.split("\n").slice(2).join("\n"), {
        nearbySequences: "zip",
      });
    }
  }, [report]);
  // const componentStories = useMemo(() => {
  //   const map = new Map();
  // }, [state]);
  const storyFileName = useMemo(() => {
    if (story && story.parameters.fileName) {
      return story.parameters.fileName;
    }
    return "Unknown file";
  }, [story]);

  return active ? (
    <div className="diff-viewer">
      {report ? (
        <div className="diff-viewer-wrapper">
          {report.status === "passed" && (
            <div className="diff-viewer--no-changes">
              <EmptyTabContent
                description="There were no markup changes detected"
                title="No changes"
                footer={
                  <Link
                    onClick={() => {
                      internal_fullTestProviderStore.runAll();
                    }}
                    withArrow
                  >
                    Run tests again
                  </Link>
                }
              />
            </div>
          )}
          {report.status === "failed" && report.result && (
            <>
              <StatusBar
                accept={accept}
                story={story}
                status={CallStates.ACTIVE}
                onScrollToEnd={() => {
                  console.log("TODO implement onScrollToEnd");
                }}
              ></StatusBar>

              <div className="diff-viewer-diffmeta">
                {diff && diff[0] && (
                  <StyledDetectedChanges className="diff-viewer-changecount">
                    {diff[0].hunks.length}{" "}
                    {diff[0].hunks.length > 1 ? "changes" : "change"} in
                  </StyledDetectedChanges>
                )}

                <StyledStoryPath className="diff-viewer-storypath">
                  {storyFileName}
                </StyledStoryPath>
              </div>

              <div className="diff-viewer-diffstage">
                <ActionBar
                  actionItems={[
                    {
                      title: "Side by side",
                      onClick: () => {
                        setDiffType("side-by-side");
                      },
                    },
                    {
                      title: "Unified",
                      onClick: () => {
                        setDiffType("unified");
                      },
                    },
                  ]}
                />
                {diffType === "side-by-side" && (
                  <div
                    className="diff-viewer-diff"
                    title="Show diff side-by-side"
                  >
                    <CopyButton code={report.result.diff} />
                    <DiffViewer
                      viewType="split"
                      oldStr={report.result.oldStr}
                      files={parseDiff(
                        report.result.diff.split("\n").slice(2).join("\n"),
                        { nearbySequences: "zip" }
                      )}
                    />
                  </div>
                )}
                {diffType === "unified" && (
                  <div className="diff-viewer-diff" title="Show diff unified">
                    <CopyButton code={report.result.diff} />
                    <DiffViewer
                      viewType="unified"
                      oldStr={report.result.oldStr}
                      files={parseDiff(
                        report.result.diff.split("\n").slice(2).join("\n"),
                        { nearbySequences: "zip" }
                      )}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          {report.status === "failed" && !report.result && (
            <p>
              TODO Error, report result missing (what does this actually mean?)
            </p>
          )}
        </div>
      ) : (
        <div className="diff-viewer--empty">
          <EmptyTabContent
            description="Run tests to compare markup"
            title="No tests yet"
            footer={
              <Link
                onClick={() => {
                  internal_fullTestProviderStore.runAll();
                }}
                withArrow
              >
                Run tests now
              </Link>
            }
          />
        </div>
      )}
    </div>
  ) : null;
};
