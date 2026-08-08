import type { Card } from "./types";
import { complexityAnalysisCards } from "./complexity-analysis";
import { linearStructuresCards } from "./linear-structures";
import { hashingCards } from "./hashing";
import { treesBstCards } from "./trees-bst";
import { heapsCards } from "./heaps";
import { sortingCards } from "./sorting";
import { searchingCards } from "./searching";
import { graphTraversalCards } from "./graph-traversal";
import { shortestPathsMstCards } from "./shortest-paths-mst";
import { recursionDcCards } from "./recursion-dc";
import { dynamicProgrammingCards } from "./dynamic-programming";
import { greedyCards } from "./greedy";

// Add each module's card array here as it's written. This is the single
// aggregation point the app reads from.
export const ALL_CARDS: Card[] = [
  ...complexityAnalysisCards,
  ...linearStructuresCards,
  ...hashingCards,
  ...treesBstCards,
  ...heapsCards,
  ...sortingCards,
  ...searchingCards,
  ...graphTraversalCards,
  ...shortestPathsMstCards,
  ...recursionDcCards,
  ...dynamicProgrammingCards,
  ...greedyCards,
];

export * from "./types";
export * from "./modules";
