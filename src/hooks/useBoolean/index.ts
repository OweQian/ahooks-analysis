import useToggle from "../useToggle";
import { useMemo } from "react";

export interface Actions {
  setTrue: () => void;
  setFalse: () => void;
  set: (value: boolean) => void;
  toggle: () => void;
}

const useBoolean = (defaultValue = false): [boolean, Actions] => {
  const [state, { toggle, set }] = useToggle(!!defaultValue);

  const actions: Actions = useMemo(() => {
    const setTrue = () => set(true);
    const setFalse = () => set(false);
    return {
      // 切换 state
      toggle,
      // 修改 state
      set: (v) => set(!!v),
      // 设置为 true
      setTrue,
      // 设置为 false
      setFalse,
    };
  }, []);

  return [state, actions];
};

export default useBoolean;
