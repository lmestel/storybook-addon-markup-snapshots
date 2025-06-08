import React, { type ComponentType, type JSX } from "react";
import {
  parseDiff,
  Diff,
  Hunk,
  markEdits,
  tokenize,
  type TokenizeOptions,
  withSourceExpansion,
  minCollapsedLines,
  type HunkData,
  type DiffProps,
  type ViewType,
} from "react-diff-view";
import * as refractor from "refractor";

import "react-diff-view/style/index.css";
import "./diff-viewer.css";
import { Button } from "storybook/internal/components";

const EMPTY_HUNKS: HunkData[] = [];

type UnfoldCollapsedProps = {
  previousHunk?: HunkData;
  currentHunk: HunkData;
  onClick: (start: number, end: number) => void;
};
const UnfoldCollapsed = ({
  previousHunk,
  currentHunk,
  onClick,
}: UnfoldCollapsedProps) => {
  const start = previousHunk
    ? previousHunk.oldStart + previousHunk.oldLines
    : 1;
  const end = currentHunk.oldStart - 1;

  // TODO there's a bug here, I think
  // there are files now that have hidden lines at the end,
  // that can't be expanded
  if (end - start + 1 <= 0) return;

  return (
    <tbody>
      <tr onClick={() => onClick(start, end)}>
        <td
          data-start={start}
          data-end={end}
          colSpan={4}
          style={{
            padding: "8px",
            textAlign: "center",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          <Button variant="outline" size="small">
            Show unchanged ({end - start + 1} lines)
          </Button>
        </td>
      </tr>
    </tbody>
  );
};

const customTokenize = (hunks: HunkData[], oldSource?: string) => {
  if (!hunks) {
    return undefined;
  }

  const options: TokenizeOptions = {
    refractor,
    language: "html",
    oldSource,
    highlight: true,
    enhancers: [markEdits(hunks, { type: "block" })],
  };

  try {
    return tokenize(hunks, options);
  } catch (ex) {
    console.error("Error tokenizing hunks:", ex);
    return undefined;
  }
};

const DiffView: ComponentType<
  DiffProps & {
    oldSource?: string;
    onExpandRange?: (start: number, end: number) => void;
  }
> = ({ hunks, oldSource, onExpandRange, diffType, viewType }) => {
  const tokens = customTokenize(hunks, oldSource);

  const renderHunk = (children: JSX.Element[], hunk: HunkData) => {
    const previousElement = children[children.length - 1];
    const decorationElement = (
      <UnfoldCollapsed
        key={"decoration-" + hunk.content}
        previousHunk={previousElement && previousElement.props.hunk}
        currentHunk={hunk}
        onClick={onExpandRange || (() => {})}
      />
    );
    children.push(decorationElement);

    const hunkElement = <Hunk key={"hunk-" + hunk.content} hunk={hunk} />;
    children.push(hunkElement);

    return children;
  };

  return (
    <Diff
      viewType={viewType}
      diffType={diffType}
      hunks={hunks || EMPTY_HUNKS}
      tokens={tokens}
    >
      {(hunks) => hunks.reduce(renderHunk, [])}
    </Diff>
  );
};

const ExpandableDiffView = withSourceExpansion()(
  minCollapsedLines(10)(DiffView)
);

export function DiffViewer({
  oldStr,
  diff,
  viewType,
}: {
  oldStr: string;
  diff: string;
  viewType: ViewType;
}) {
  const files = parseDiff(diff, { nearbySequences: "zip" });
  return (
    <div style={{ fontSize: "14px" }}>
      {files &&
        files.length > 0 &&
        files.map((file) => {
          return (
            <ExpandableDiffView
              onExpandRange={() => {}}
              diffType="modify"
              viewType={viewType}
              {...file}
              oldSource={oldStr}
            />
          );
        })}
    </div>
  );
}
