import { useEffect, useState } from "react";
import useThrottleFn from "@/hooks/useThrottleFn";
import type { ThrottleOptions } from "./throttleOptions";

const useThrottle = <T>(value: T, options?: ThrottleOptions) => {
  const [throttled, setThrottled] = useState(value);

  // 依赖 useThrottleFn
  const { run } = useThrottleFn(() => {
    setThrottled(value);
  }, options);

  // 监听 value 变化，执行节流函数，更新 throttled
  useEffect(() => {
    run();
  }, [value]);

  return throttled;
};

export default useThrottle;
