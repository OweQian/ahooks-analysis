import { renderHook } from "@testing-library/react";
import useMount from "./index";

// 定义测试套件
describe("useMount", () => {
  // 定义测试用例
  it("test mount", async () => {
    //  创建一个 mock 函数 fn
    const fn = jest.fn();
    // 渲染 useMount Hook，并将 fn 作为参数传递给 useMount
    const hook = renderHook(() => useMount(fn));
    // 断言验证函数 fn 被调用的次数是否为 1
    expect(fn).toHaveBeenCalledTimes(1);

    // 重新渲染
    hook.rerender();
    // 断言验证函数 fn 被调用的次数是否为 1
    expect(fn).toHaveBeenCalledTimes(1);

    // 卸载
    hook.unmount();
    // 断言验证函数 fn 被调用的次数是否为 1
    expect(fn).toHaveBeenCalledTimes(1);

    // 再次渲染 useMount Hook，并立即卸载
    renderHook(() => useMount(fn)).unmount();
    // 断言验证函数 fn 被调用的次数是否为 2
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
