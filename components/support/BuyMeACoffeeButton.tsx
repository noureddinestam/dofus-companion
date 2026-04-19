"use client";

import { useEffect, useRef } from "react";

interface BuyMeACoffeeButtonProps {
  /** Localized label shown on the branded button. */
  text?: string;
}

/**
 * Injects the official Buy Me a Coffee widget button. The BMC script
 * (button.prod.min.js) replaces its own `<script>` tag in the DOM with a
 * branded yellow button, so we append the tag inside a ref'd container
 * after mount to control where the button lands. Strict-mount safe: the
 * effect clears the container on cleanup before re-appending.
 */
export function BuyMeACoffeeButton({ text = "Buy me a coffee" }: BuyMeACoffeeButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    host.innerHTML = "";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "dofuscompanion");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "☕");
    script.setAttribute("data-font", "Cookie");
    script.setAttribute("data-text", text);
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");
    host.appendChild(script);

    return () => {
      host.innerHTML = "";
    };
  }, [text]);

  return <div ref={ref} className="flex justify-center" aria-hidden="false" />;
}
