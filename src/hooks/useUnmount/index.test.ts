import { renderHook } from "@testing-library/react";
import useUnmount from "./index";

// 定义测试套件
describe("useUnmount", () => {
  // 定义测试用例
  it("useUnmount", async () => {
    //  创建一个 mock 函数 fn
    const fn = jest.fn();
    // 渲染 useUnmount Hook，并将 fn 作为参数传递给 useUnmount
    const hook = renderHook(() => useUnmount(fn));
    // 断言验证函数 fn 被调用的次数是否为 0
    expect(fn).toHaveBeenCalledTimes(0);

    // 重新渲染
    hook.rerender();
    // 断言验证函数 fn 被调用的次数是否为 0
    expect(fn).toHaveBeenCalledTimes(0);

    // 卸载
    hook.unmount();
    // 断言验证函数 fn 被调用的次数是否为 1
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
