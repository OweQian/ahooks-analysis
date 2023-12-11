import isBrowser from "../../../utils/isBrowser";
import {useState} from "react";
import useEventListener from "@/hooks/useEventListener";

/**
 * 'hidden': 页面对用户不可见。即文档处于背景标签页、或窗口处于最小化状态，或操作系统正处于"锁屏状态"
 * 'visible': 页面内容至少部分可见。即文档处于前景标签页并且窗口没有最小化
 * 'prerender': 页面此时正在渲染中。文档只能从此状态开始，永远不能从其他值变为此状态
 * */
type VisibilityState = 'hidden' | 'visible' | 'prerender' | undefined;

const getVisibility = () => {
  if (!isBrowser) {
    return 'visible'
  }

  // 只读属性，返回 document 的可见性，即当前可见元素的上下文环境
  return document.visibilityState;
};

const useDocumentVisibility = (): VisibilityState => {
  const [documentVisibility, setDocumentVisibility] = useState<VisibilityState>(() => getVisibility());

  useEventListener(
    // 监听该事件
    'visibilitychange',
    () => {
      setDocumentVisibility(getVisibility());
  }, {
      target: () => document,
    });

  return documentVisibility;
}

export default useDocumentVisibility;
