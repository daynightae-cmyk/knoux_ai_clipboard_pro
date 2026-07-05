import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UseVirtualListOptions {
  count: number;
  estimateSize?: number;
  overscan?: number;
  storageKey?: string;
}

export function useVirtualList({
  count,
  estimateSize = 168,
  overscan = 6,
  storageKey,
}: UseVirtualListOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(640);
  const frameRef = useRef<number | null>(null);

  const onScroll = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const nextTop = element.scrollTop;
      setScrollTop(nextTop);
      setViewportHeight(element.clientHeight || 640);
      if (storageKey) sessionStorage.setItem(storageKey, String(nextTop));
    });
  }, [storageKey]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setViewportHeight(element.clientHeight || 640);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !storageKey) return;
    const saved = Number(sessionStorage.getItem(storageKey) || "0");
    if (Number.isFinite(saved) && saved > 0) {
      element.scrollTop = saved;
      setScrollTop(saved);
    }
  }, [storageKey]);

  useEffect(() => () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
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
    viewportHeight,
  };
}
