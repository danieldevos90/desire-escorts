"use client";
import { useEffect, useState } from "react";

const COOKIE_NAME = "cookie_consent";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const val = getCookie(COOKIE_NAME);
    setVisible(val !== "1");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto max-w-3xl m-4 rounded-lg bg-gray-900 text-white p-4 shadow-lg">
        <p className="text-sm">
          We use cookies to enhance your experience. Read our privacy and cookie policy for more information.
        </p>
        <div className="mt-3 flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded bg-white text-black"
            onClick={() => {
              setCookie(COOKIE_NAME, "1", 365);
              setVisible(false);
            }}
          >
            Accept
          </button>
          <a
            className="px-4 py-2 rounded border border-white"
            href="/privacy"
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}


