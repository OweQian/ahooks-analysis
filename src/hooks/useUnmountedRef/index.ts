import {MutableRefObject, useEffect, useRef} from "react";

const useUnmountedRef = (): MutableRefObject<boolean> => {
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    }
  }, []);

  return unmountedRef;
}

export default useUnmountedRef;
