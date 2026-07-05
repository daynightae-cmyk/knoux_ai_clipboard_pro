import { useCallback, useMemo, useRef, useState } from "react";

interface UseVirtualListOptions {
  count: number;
  estimateSize?: number;
  overscan?: number;
}

export function useVirtualList({ count, estimateSize = 168, overscan = 6 }: UseVirtualListOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(640);

  const onScroll = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    setScrollTop(element.scrollTop);
    setViewportHeight(element.clientHeight || 640);
  }, []);

  const virtualItems = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / estimateSize) - overscan);
    const visibleCount = Math.ceil(viewportHeight / estimateSize) + overscan * 2;
    const end = Math.min(count, start + visibleCount);
    return Array.from({ length: Math.max(0, end - start) }, (_, index) => {
      const itemIndex = start + index;
      return { index: itemIndex, start: itemIndex * estimateSize, size: estimateSize };
    });
  }, [count, estimateSize, overscan, scrollTop, viewportHeight]);

  return {
    containerRef,
    onScroll,
    virtualItems,
    totalSize: count * estimateSize,
  };
}
