import { useEffect } from "react";

export default function Wrapper({ children }) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    document.head.appendChild(script);
  }, []);

  return <div style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{children}</div>;
}
