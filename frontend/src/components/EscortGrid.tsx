import EscortCard from "./EscortCard";
import type { Escort } from "@/types/strapi";

export default function EscortGrid({ escorts }: { escorts: Escort[] }) {
  return (
    <div className="grid grid-2" style={{ gap: 'var(--space-4)' }}>
      {escorts.map((e) => (
        <EscortCard key={e.id} escort={e} />
      ))}
    </div>
  );
}


