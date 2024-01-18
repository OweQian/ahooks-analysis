import {DependencyList, useRef} from "react";
import depsAreSame from "../../../utils/depsAreSame";

const useCreation = <T>(factory: () => T, deps: DependencyList): T => {
  const {
    current
  } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false, // 初始化标志
  });

  // 初始化或依赖项列表前后不相等时（通过 Object.is 进行判断）
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    // 更新依赖
    current.deps = deps;
    // 执行工厂函数
    current.obj = factory();
    // 初始化标志设置为 true
    current.initialized = true;
  }

  return current.obj as T;
}

export default useCreation;
