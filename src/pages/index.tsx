import useUnmount from "@/hooks/useUnmount";
import React from 'react';
import useBoolean from "@/hooks/useBoolean";

const MyComponent = () => {
  useUnmount(() => {
    alert('unmount');
  });

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
