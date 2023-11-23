import React, {useEffect} from 'react';
import useBoolean from "@/hooks/useBoolean";
import useUnmountedRef from "@/hooks/useUnmountedRef";

const MyComponent = () => {
  const unmountedRef = useUnmountedRef();
  useEffect(() => {
    setTimeout(() => {
      if (!unmountedRef.current) {
        alert('component is alive');
      }
    }, 3000);
  }, []);

  return <p>Hello World!</p>;
};

export default function HomePage() {
  const [state, { toggle }] = useBoolean(true);

  return (
    <>
      <button type="button" onClick={toggle}>
        {state ? 'unmount' : 'mount'}
      </button>
      {state && <MyComponent />}
    </>
  );
}
