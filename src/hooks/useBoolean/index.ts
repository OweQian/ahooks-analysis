import useToggle from '../useToggle';
import {useMemo} from 'react';

export interface Actions {
  toggle: () => void;
  set: (value: boolean) => void;
  setTrue: () => void;
  setFalse: () => void;
}

const useBoolean = (defaultValue = false): [boolean, Actions] => {
  const [state, {toggle, set}] = useToggle(defaultValue);

  const actions: Actions = useMemo(() => {
    const setTrue = () => set(true);
    const setFalse = () => set(false);

    return {
      toggle,
      set: (v) => set(v),
      setTrue,
      setFalse,
    }
  }, []);

  return [state, actions]
}

export default useBoolean;
