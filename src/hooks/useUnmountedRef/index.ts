import { MutableRefObject, useEffect, useRef } from "react";

const useUnmountedRef = (): MutableRefObject<boolean> => {
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    // 组件挂载，unmountedRef.current 置为 false
    unmountedRef.current = false;
    return () => {
      // 组件卸载，unmountedRef.current 置为 true
      unmountedRef.current = true;
    };
  }, []);

  return unmountedRef;
};

export default useUnmountedRef;
