import {BasicTarget} from "../../../utils/domTarget";
import useBoolean from "@/hooks/useBoolean";
import useEventListener from "@/hooks/useEventListener";

export interface Options {
  onEnter?: () => void;
  onLeave?: () => void;
  onChange?: (isHovering: boolean) => void;
}

const useHover = (target: BasicTarget, options?: Options): boolean => {
  const { onEnter, onLeave, onChange } = options || {};

  const [state, {setTrue, setFalse}] = useBoolean(false);

  // 监听 mouseenter 触发 onEnter 事件，切换状态为 true
  useEventListener(
    'mouseenter',
    () => {
      onEnter?.();
      setTrue();
      onChange?.(true);
    },
    {
      target,
    }
  );

  // 监听 mouseleave 触发 onLeave 事件，切换状态为 false
  useEventListener(
    'mouseleave',
    () => {
      onLeave?.();
      setFalse();
      onChange?.(false);
    },
    {
      target,
    }
  );

  return state;
};

export default useHover;
