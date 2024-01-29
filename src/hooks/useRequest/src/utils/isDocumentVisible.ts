import isBrowser from "../../../../../utils/isBrowser";

export default function isDocumentVisible(): boolean {
  if (isBrowser) {
    // document.visibilityState 只读属性，返回 document 的可见性
    return document.visibilityState !== 'hidden';
  }

  return true;
}
