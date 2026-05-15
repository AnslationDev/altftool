import { useEffect, useState } from "react";

export function useTypingEffect(text, speed = 28) {
  const [displayed, setDisplayed] = useState(() => "");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return displayed;
}
