/**
 * scrollTop: 表示一个元素的垂直滚动条滚动的距离
 * scrollHeight: 表示一个元素的内容的总高度，包括不可见部分
 * clientHeight: 表示一个元素在视窗中可见部分的高度
 */

const getScrollTop = (el: Document | Element) => {
  if (
    el === document ||
    el === document.documentElement ||
    el === document.body
  ) {
    return Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
  }
  return (el as Element).scrollTop;
};

const getScrollHeight = (el: Document | Element) => {
  return (
    (el as Element).scrollHeight ||
    Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  );
};

const getClientHeight = (el: Document | Element) => {
  return (
    (el as Element).clientHeight ||
    Math.max(document.documentElement.clientHeight, document.body.clientHeight)
  );
};

export { getClientHeight, getScrollHeight, getScrollTop };
