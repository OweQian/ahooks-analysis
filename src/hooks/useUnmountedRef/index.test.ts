import { renderHook } from "@testing-library/react";
import useUnmountedRef from "./index";

// 定义测试套件
describe("useUnmountedRef", () => {
  // 定义测试用例
  it("useUnmountedRef", async () => {
    // 渲染 useUnmountedRef Hook
    const hook = renderHook(() => useUnmountedRef());
    // 断言组件是否已经卸载
    expect(hook.result.current.current).toBe(false);

    // 重新渲染
    hook.rerender();
    // 断言组件是否已经卸载
    expect(hook.result.current.current).toBe(false);

    // 卸载
    hook.unmount();
    // 断言组件是否已经卸载
    expect(hook.result.current.current).toBe(true);
  });
});
