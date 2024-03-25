import { renderHook } from "@testing-library/react";
import useUnmountedRef from "./index";

describe("useUnmountedRef", () => {
  it("useUnmountedRef", async () => {
    const hook = renderHook(() => useUnmountedRef());
    expect(hook.result.current.current).toBe(false);

    hook.rerender();
    expect(hook.result.current.current).toBe(false);

    hook.unmount();
    expect(hook.result.current.current).toBe(true);
  });
});
