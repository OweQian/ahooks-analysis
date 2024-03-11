import useRafState from "@/hooks/useRafState";
import useLatest from "@/hooks/useLatest";
import type { BasicTarget } from "../../../utils/domTarget";
import { getTargetElement } from "../../../utils/domTarget";
import useEffectWithTarget from "../../../utils/useEffectWithTarget";

type Position = { left: number; top: number };

export type Target = BasicTarget<Element | Document>;
export type ScrollListenController = (val: Position) => boolean;

const useScroll = (
  target?: Target,
  shouldUpdate: ScrollListenController = () => true
): Position | undefined => {
  const [position, setPosition] = useRafState<Position>();

  const shouldUpdateRef = useLatest(shouldUpdate);

  useEffectWithTarget(
    () => {
      const el = getTargetElement(target, document);
      if (!el) {
        return;
      }

      const updatePosition = () => {
        let newPosition: Position;
        // document
        if (el === document) {
          /**
           * scrollingElement（Document 的只读属性）返回滚动文档的 Element 对象的引用
           * 标准模式下，这是文档的根元素，document.documentElement
           * */
          if (document.scrollingElement) {
            newPosition = {
              left: document.scrollingElement.scrollLeft,
              top: document.scrollingElement.scrollTop,
            };
          } else {
            /**
             * 怪异模式下，scrollingElement 属性返回 HTML body 元素（若不存在返回 null）
             * */
            // When in quirks mode, the scrollingElement attribute returns the HTML body element if it exists and is potentially scrollable, otherwise it returns null.
            // https://developer.mozilla.org/zh-CN/docs/Web/API/Document/scrollingElement
            // https://stackoverflow.com/questions/28633221/document-body-scrolltop-firefox-returns-0-only-js
            newPosition = {
              left: Math.max(
                window.pageXOffset,
                document.documentElement.scrollLeft,
                document.body.scrollLeft
              ),
              top: Math.max(
                window.pageYOffset,
                document.documentElement.scrollTop,
                document.body.scrollTop
              ),
            };
          }
        } else {
          // DOM 元素
          newPosition = {
            left: (el as Element).scrollLeft,
            top: (el as Element).scrollTop,
          };
        }
        if (shouldUpdateRef.current(newPosition)) {
          setPosition(newPosition);
        }
      };

      updatePosition();

      // 注册 scroll 事件监听器
      el.addEventListener("scroll", updatePosition);
      return () => {
        // 清除事件监听器
        el.removeEventListener("scroll", updatePosition);
      };
    },
    [],
    target
  );
  return position;
};

export default useScroll;
