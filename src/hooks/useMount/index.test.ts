import { renderHook } from "@testing-library/react";
import useMount from "./index";

describe("useMount", () => {
  it("test mount", async () => {
    const fn = jest.fn();

    const hook = renderHook(() => useMount(fn));
    expect(fn).toHaveBeenCalledTimes(1);

    hook.rerender();
    expect(fn).toHaveBeenCalledTimes(1);

    hook.unmount();
    expect(fn).toHaveBeenCalledTimes(1);

    renderHook(() => useMount(fn)).unmount();
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
