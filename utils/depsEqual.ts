import type { DependencyList } from "react";
import { isEqual } from 'lodash';

export const depsEqual = (aDeps: DependencyList[], bDeps: DependencyList[]) => isEqual(aDeps, bDeps);
