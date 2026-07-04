import { useEffect } from "react";

export default function DarkVisualRuntime() {
  useEffect(() => {
    const paint = () => {
      document.body.style.background = "#07030E";
      document.body.style.color = "#F8F2FF";
      document.querySelectorAll<HTMLElement>("[class]").forEach((el) => {
        const cls = el.className.toString();
        if (cls.includes("bg-white") || cls.includes("from-white") || cls.includes("via-white") || cls.includes("to-white") || cls.includes("#FCFAFF") || cls.includes("#F7F2FF")) {
          el.style.backgroundColor = "rgba(18, 8, 31, 0.72)";
          el.style.backdropFilter = "blur(18px) saturate(130%)";
        }
        if (cls.includes("text-knoux-dark-text")) el.style.color = "#F8F2FF";
        if (cls.includes("text-knoux-muted-text")) el.style.color = "#BFA7DB";
      });
    };
    paint();
    const timer = window.setInterval(paint, 900);
    return () => window.clearInterval(timer);
  }, []);
  return null;
}
