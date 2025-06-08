import React, { useMemo, useState, type ComponentProps, type FC } from "react";
import { STORY_PREPARED } from "storybook/internal/core-events";
import { BatchAcceptIcon, SyncIcon } from "@storybook/icons";
import {
  experimental_useUniversalStore,
  useChannel,
  experimental_UniversalStore,
} from "storybook/internal/manager-api";
import type { State } from "../constants";
import type { StoryPreparedPayload } from "storybook/internal/types";
import { DiffViewer } from "./DiffViewer";
import { styled, typography } from "storybook/internal/theming";
import {
  Bar,
  Button,
  TabsState,
  IconButton,
  WithTooltip,
  Separator,
  P,
  TooltipNote,
  ActionBar,
} from "storybook/internal/components";

interface StatusBarProps {
  status:
    | CallStates.DONE
    | CallStates.ERROR
    | CallStates.ACTIVE
    | CallStates.WAITING;
  storyFileName?: string;
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

const StyledLocation = styled(P)(({ theme }) => ({
  color: theme.textMutedColor,
  justifyContent: "flex-end",
  textAlign: "right",
  whiteSpace: "nowrap",
  marginTop: "auto",
  marginBottom: 1,
  paddingRight: 15,
  fontSize: 13,
}));

const StatusBar: React.FC<StatusBarProps> = ({
  status,
  onScrollToEnd,
  storyFileName,
}) => {
  const buttonText =
    status === CallStates.ERROR ? "Scroll to error" : "Scroll to end";

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
              tooltip={<Note note="Rerun" />}
            >
              <RerunButton
                aria-label="Rerun"
                onClick={() => {
                  console.log("TODO trigger rerun");
                }}
              >
                <SyncIcon />
              </RerunButton>
            </WithTooltip>
          </Group>
          {storyFileName && (
            <Group>
              <StyledLocation>{storyFileName}</StyledLocation>
            </Group>
          )}
        </StyledSubnav>
      </Bar>
    </SubnavWrapper>
  );
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
  const [diffType, setDiffType] = useState<"side-by-side" | "unified">(
    "side-by-side"
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
          {report.status === "failed" && report.result && (
            <>
              <StatusBar
                storyFileName="LoremIpsum.tsx.stories"
                status={CallStates.ACTIVE}
                onScrollToEnd={() => {
                  console.log("TODO implement onScrollToEnd");
                }}
              ></StatusBar>

              <div
                style={{
                  margin: "15px",
                  position: "relative",
                  backgroundColor: "rgb(34, 36, 37)",
                  boxShadow: "rgba(255, 255, 255, 0.1) 0px -1px 0px 0px inset",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
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
                    id="side-by-side"
                    title="Show diff side-by-side"
                    style={{ paddingTop: "5px" }}
                  >
                    <DiffViewer
                      viewType="split"
                      oldStr={report.result.oldStr}
                      diff={report.result.diff.split("\n").slice(2).join("\n")}
                    />
                  </div>
                )}
                {diffType === "unified" && (
                  <div
                    id="unified"
                    title="Show diff unified"
                    style={{ paddingTop: "5px" }}
                  >
                    <DiffViewer
                      viewType="unified"
                      oldStr={report.result.oldStr}
                      diff={report.result.diff.split("\n").slice(2).join("\n")}
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={() => accept(story!.parameters.fileName)}
                variant="solid"
                size="medium"
                animation="glow"
                style={{ marginLeft: "5px", marginTop: "5px" }}
              >
                <BatchAcceptIcon /> Accept All Changes
              </Button>
            </>
          )}
          {report.status === "failed" && !report.result && (
            <p>Error, report result missing</p>
          )}
        </div>
      ) : (
        <p>Run tests to compare markup</p>
      )}
    </div>
  ) : null;
};
