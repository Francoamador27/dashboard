import { useEffect, useRef, useState } from "react";

const supportsIO = typeof window !== "undefined" && "IntersectionObserver" in window;

const LazyRender = ({
  children,
  rootMargin = "200px 0px",
  minHeight = 200,
}) => {
  const [isVisible, setIsVisible] = useState(!supportsIO);
  const hostRef = useRef(null);

  useEffect(() => {
    if (!supportsIO || isVisible || !hostRef.current) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(hostRef.current);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  if (isVisible) return children;

  return <div ref={hostRef} style={{ minHeight }} />;
};

export default LazyRender;
