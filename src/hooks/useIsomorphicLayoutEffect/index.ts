import isBrowser from "../../../utils/isBrowser";
import {useEffect, useLayoutEffect} from "react";

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
