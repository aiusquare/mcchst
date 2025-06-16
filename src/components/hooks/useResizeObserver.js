import { useEffect, useState, useRef } from "react";

const useResizeObserver = (callback) => {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      requestAnimationFrame(() => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
          if (callback) callback({ width, height });
        }
      });
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [callback]);

  return [ref, size];
};

export default useResizeObserver;
