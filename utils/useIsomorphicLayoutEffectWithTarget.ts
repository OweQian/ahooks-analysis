import isBrowser from "./isBrowser";
import useLayoutEffectWithTarget from "./useLayoutEffectWithTarget";
import useEffectWithTarget from "./useEffectWithTarget";

const useIsomorphicLayoutEffectWithTarget = isBrowser ? useLayoutEffectWithTarget : useEffectWithTarget;

export default useIsomorphicLayoutEffectWithTarget;
