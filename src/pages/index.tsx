import useMemoizedFn from "@/hooks/useMemoizedFn";
import React, {useCallback, useMemo, useRef, useState} from 'react';
import useLatest from "@/hooks/useLatest";

export default function HomePage() {
  const [count, setCount] = useState(0);

  // const memoizedFn = useMemoizedFn(() => {
  //   alert(`Current count is ${count}`);
  // });

  const memoizedFn = () => {
    alert(`Current count is ${count}`);
  };

  return (
    <>
      <p>count: {count}</p>
      <button
        type="button"
        onClick={() => {
          setCount((c) => c + 1);
        }}
      >
        Add Count
      </button>

      <p>You can click the button to see the number of sub-component renderings</p>

      <div style={{ marginTop: 32 }}>
        <h3>Component with useMemoizedFn function:</h3>
        {/* use memoized function, ExpensiveTree component will only render once */}
        <ExpensiveTree showCount={memoizedFn} />
      </div>
    </>
  );
};

// some expensive component with React.memo
const ExpensiveTree = React.memo<{ [key: string]: any }>(({ showCount }) => {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  const showCountRef = useLatest(showCount);
  const buttonProps = useMemo(() => {
    return {
      type: 'button',
      onClick: showCountRef.current
    }
  }, [showCount])
  return (
    <div>
      <p>Render Count: {renderCountRef.current}</p>
      <button {...buttonProps}>
        showParentCount
      </button>
    </div>
  );
});
