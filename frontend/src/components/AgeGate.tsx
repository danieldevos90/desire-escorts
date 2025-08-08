"use client";
import { useEffect, useState } from "react";

const COOKIE_NAME = "age_gate_accepted";
const COOKIE_MAX_AGE_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean>(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const val = getCookie(COOKIE_NAME);
    setAllowed(val === "1");
  }, []);

  if (allowed) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="max-w-md w-full bg-white text-black rounded-lg p-6 mx-4">
        <h2 className="text-xl font-semibold mb-2">Are you 18 or older?</h2>
        <p className="mb-4 text-sm">This site contains adult-oriented content. You must be at least 18 years old to enter.</p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded border border-gray-300"
            onClick={() => {
              window.location.href = "https://www.google.com";
            }}
          >
            Leave
          </button>
          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={() => {
              setCookie(COOKIE_NAME, "1", COOKIE_MAX_AGE_DAYS);
              setAllowed(true);
            }}
          >
            I am 18+
          </button>
        </div>
      </div>
    </div>
  );
}


