import { Backtracking } from "./Backtracking";
import { BranchAndBound } from "./BranchAndBound";
import { AStar } from "./AStar";
import { IAlgorithm } from "./IAlgorithm";
import { AlgorithmType } from "../constants";

const algorithms: Map<AlgorithmType, IAlgorithm> = new Map<AlgorithmType, IAlgorithm>([
  [AlgorithmType.BACKTRACKING, new Backtracking()],
  [AlgorithmType.A_STAR, new AStar()],
  [AlgorithmType.BRANCH_AND_BOUND, new BranchAndBound()],
])

export function FactoryAlgorithm(algorithmType: AlgorithmType): IAlgorithm {
  console.log(algorithmType)
  console.log(algorithms.get(algorithmType))
  return algorithms.get(algorithmType)
}