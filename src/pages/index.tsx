import React, {useState, useRef} from 'react';
import useEventListener from "@/hooks/useEventListener";

export default function HomePage() {
  const [value, setValue] = useState('');

  useEventListener('keydown', (ev) => {
    setValue(ev.code);
  });

  return <p>Your press key is {value}</p>;
}
