import { useEffect } from "react";

// 存储不同图片的 MIME 类型
const ImgTypeMap = {
  SVG: "image/svg+xml",
  ICO: "image/x-icon",
  GIF: "image/gif",
  PNG: "image/png",
};

type ImgTypes = keyof typeof ImgTypeMap;

const useFavicon = (href: string) => {
  useEffect(() => {
    if (!href) return;

    // 获取图片后缀
    const cutUrl = href.split(".");
    const imgSuffix = cutUrl[cutUrl.length - 1].toLocaleUpperCase() as ImgTypes;

    // 通过 link 标签设置 favicon，获取或新建
    const link: HTMLLinkElement =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");

    // 设置 link 标签的 type、href、rel 属性
    link.type = ImgTypeMap[imgSuffix];
    link.href = href;
    link.rel = "shortcut icon";

    // 添加到 head 标签中
    document.getElementsByTagName("head")[0].appendChild(link);
  }, [href]);
};

export default useFavicon;
