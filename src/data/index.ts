import type { Card } from "./types";
import { moduleBySlug } from "./modules";
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
import { specializedTreesCards } from "./specialized-trees";
import { advancedGraphsCards } from "./advanced-graphs";
import { stringAlgorithmsCards } from "./string-algorithms";
import { twoPointersWindowCards } from "./two-pointers-window";
import { backtrackingCards } from "./backtracking";
import { bitManipulationCards } from "./bit-manipulation";
import { persistentStructuresCards } from "./persistent-structures";
import { probabilisticStructuresCards } from "./probabilistic-structures";
import { computationalGeometryCards } from "./computational-geometry";
import { npCompletenessCards } from "./np-completeness";
import { numberTheoryCards } from "./number-theory";
import { systemsAdjacentCards } from "./systems-adjacent";
import { mit6006FoundationsCards } from "./mit6006-foundations";
import { mit6006SortingHashingCards } from "./mit6006-sorting-hashing";
import { mit6006TreesHeapsCards } from "./mit6006-trees-heaps";
import { mit6006GraphsCards } from "./mit6006-graphs";
import { mit6006DynamicProgrammingCards } from "./mit6006-dynamic-programming";
import { mit6006ComplexityCards } from "./mit6006-complexity";
import { mit6045AutomataCards } from "./mit6045-automata";

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
  ...specializedTreesCards,
  ...advancedGraphsCards,
  ...stringAlgorithmsCards,
  ...twoPointersWindowCards,
  ...backtrackingCards,
  ...bitManipulationCards,
  ...persistentStructuresCards,
  ...probabilisticStructuresCards,
  ...computationalGeometryCards,
  ...npCompletenessCards,
  ...numberTheoryCards,
  ...systemsAdjacentCards,
  ...mit6006FoundationsCards,
  ...mit6006SortingHashingCards,
  ...mit6006TreesHeapsCards,
  ...mit6006GraphsCards,
  ...mit6006DynamicProgrammingCards,
  ...mit6006ComplexityCards,
  ...mit6045AutomataCards,
];

export * from "./types";
export * from "./modules";
export * from "./courses";

/** The `course` id of the module a card belongs to, or undefined for cards
 *  in the generic tiered curriculum. */
export const courseOfCard = (card: Card): string | undefined =>
  moduleBySlug(card.module)?.course;
