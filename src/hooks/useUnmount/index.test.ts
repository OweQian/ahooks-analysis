import { renderHook } from "@testing-library/react";
import useUnmount from "./index";

describe("useUnmount", () => {
  it("useUnmount should work", async () => {
    const fn = jest.fn();

    const hook = renderHook(() => useUnmount(fn));
    expect(fn).toHaveBeenCalledTimes(0);

    hook.rerender();
    expect(fn).toHaveBeenCalledTimes(0);

    hook.unmount();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
