import { useEffect, useRef } from "react";

export type IProps = Record<string, any>;

const useWhyDidYouUpdate = (componentName: string, props: IProps) => {
  // 保存上一次的 props
  const prevProps = useRef<IProps>({});

  useEffect(() => {
    if (prevProps.current) {
      // 获取所有 props
      const allKeys = Object.keys({ ...prevProps, ...props });
      const changedProps: IProps = {};

      allKeys.forEach((key) => {
        // 哪些 key 进行了更新
        if (!Object.is(prevProps[key], props[key])) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
      });

      // 有 diff，控制台输出
      if (Object.keys(changedProps).length) {
        console.log("[why-did-you-update]", componentName, changedProps);
      }
    }

    // 更新 prevProps
    prevProps.current = props;
  });
};

export default useWhyDidYouUpdate;
