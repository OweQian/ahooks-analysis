import { createUseStorageState } from "@/hooks/createUseStorageState";
import isBrowser from '../../../utils/isBrowser';

/**
 * 调用 createUseStorageState
 * 入参判断是否为浏览器环境
 * */
const useSessionStorageState = createUseStorageState(() => isBrowser ? sessionStorage : undefined);

export default useSessionStorageState;
