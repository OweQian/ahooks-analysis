import { useLayoutEffect } from "react";
import createDeepCompareEffect from "@/hooks/createDeepCompareEffect";

export default createDeepCompareEffect(useLayoutEffect);
