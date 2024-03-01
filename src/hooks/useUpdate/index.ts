import { useCallback, useState } from "react";

const useUpdate = () => {
  const [, setState] = useState({});
  // 返回一个函数，通过变更 state，使组件重新渲染
  return useCallback(() => setState({}), []);
};

export default useUpdate;
