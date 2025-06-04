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
} from "react-diff-view";
import * as refractor from "refractor";

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

  return (
    <tbody>
      <tr onClick={() => onClick(start, end)}>
        <td
          data-start={start}
          data-end={end}
          colSpan={4}
          style={{
            padding: "10px",
            textAlign: "center",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          {end - start + 1 > 0
            ? `Mehr anzeigen (${end - start + 1} Zeilen)`
            : `Rest anzeigen`}
        </td>
      </tr>
    </tbody>
  );
};

const customTokenize = (hunks: HunkData[], oldSource: string) => {
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
    console.log(ex);
    return undefined;
  }
};

const DiffView: ComponentType<DiffProps> = ({
  hunks,
  oldSource,
  onExpandRange,
}) => {
  console.log("actually getting here");
  const tokens = customTokenize(hunks, oldSource);

  const renderHunk = (children: JSX.Element[], hunk: HunkData) => {
    console.log("hunk", hunk);
    const previousElement = children[children.length - 1];
    const decorationElement = (
      <UnfoldCollapsed
        key={"decoration-" + hunk.content}
        previousHunk={previousElement && previousElement.props.hunk}
        currentHunk={hunk}
        onClick={onExpandRange}
      />
    );
    children.push(decorationElement);

    const hunkElement = <Hunk key={"hunk-" + hunk.content} hunk={hunk} />;
    children.push(hunkElement);

    return children;
  };

  console.log("still here");
  console.log(hunks.reduce(renderHunk, []));
  console.log("tokens", tokens);

  return (
    <Diff
      viewType="split"
      diffType="modify"
      hunks={hunks || EMPTY_HUNKS}
      tokens={tokens}
    >
      {(hunks) => hunks.reduce(renderHunk, [])}
    </Diff>
  );
};

const ExpandableDiffView = DiffView;
export function DiffViewer({ oldStr, newStr, diff }: DiffProps) {
  const files = parseDiff(diff, { nearbySequences: "zip" });

  console.log("files", files, oldStr);

  return (
    <div style={{ fontSize: "12px" }}>
      {files &&
        files.length > 0 &&
        files.map((file, index) => {
          return <ExpandableDiffView {...file} oldSource={oldStr} />;
        })}
    </div>
  );
}
