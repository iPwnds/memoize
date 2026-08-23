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
import { mit6045ComputabilityCards } from "./mit6045-computability";
import { mit6045ComplexityCards } from "./mit6045-complexity";
import { mit6045CryptographyCards } from "./mit6045-cryptography";
import { mit6045LearningQuantumCards } from "./mit6045-learning-quantum";
import { mit6046DivideConquerCards } from "./mit6046-divide-conquer";
import { mit6046AmortizationRandomizationCards } from "./mit6046-amortization-randomization";
import { mit6046AugmentationDpGreedyCards } from "./mit6046-augmentation-dp-greedy";
import { mit6046FlowLpCards } from "./mit6046-flow-lp";
import { mit6046ComplexityApproxCards } from "./mit6046-complexity-approx";
import { mit6046DistributedCards } from "./mit6046-distributed";
import { mit6046CryptoCacheObliviousCards } from "./mit6046-crypto-cache-oblivious";
import { mit6004InfoDigitalCmosCards } from "./mit6004-info-digital-cmos";
import { mit6004LogicSequentialFsmCards } from "./mit6004-logic-sequential-fsm";
import { mit6004PipeliningMultipliersCards } from "./mit6004-pipelining-multipliers";
import { mit6004BetaIsaAssemblyCards } from "./mit6004-beta-isa-assembly";
import { mit6004ArchImplMemPipeCards } from "./mit6004-arch-impl-mem-pipe";
import { mit6004VmOsDevicesCards } from "./mit6004-vm-os-devices";
import { mit6004CommSyncParallelCards } from "./mit6004-comm-sync-parallel";
import { mit6828IntroX86IsolationCards } from "./mit6828-intro-x86-isolation";
import { mit6828VmInterruptsCards } from "./mit6828-vm-interrupts";
import { mit6828ConcProcessesSleepCards } from "./mit6828-conc-processes-sleep";
import { mit6828FsCrashRecoveryCards } from "./mit6828-fs-crash-recovery";

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
  ...mit6045ComputabilityCards,
  ...mit6045ComplexityCards,
  ...mit6045CryptographyCards,
  ...mit6045LearningQuantumCards,
  ...mit6046DivideConquerCards,
  ...mit6046AmortizationRandomizationCards,
  ...mit6046AugmentationDpGreedyCards,
  ...mit6046FlowLpCards,
  ...mit6046ComplexityApproxCards,
  ...mit6046DistributedCards,
  ...mit6046CryptoCacheObliviousCards,
  ...mit6004InfoDigitalCmosCards,
  ...mit6004LogicSequentialFsmCards,
  ...mit6004PipeliningMultipliersCards,
  ...mit6004BetaIsaAssemblyCards,
  ...mit6004ArchImplMemPipeCards,
  ...mit6004VmOsDevicesCards,
  ...mit6004CommSyncParallelCards,
  ...mit6828IntroX86IsolationCards,
  ...mit6828VmInterruptsCards,
  ...mit6828ConcProcessesSleepCards,
  ...mit6828FsCrashRecoveryCards,
];

export * from "./types";
export * from "./modules";
export * from "./courses";

/** The `course` id of the module a card belongs to, or undefined for cards
 *  in the generic tiered curriculum. */
export const courseOfCard = (card: Card): string | undefined =>
  moduleBySlug(card.module)?.course;
