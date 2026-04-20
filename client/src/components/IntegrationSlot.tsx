import React from "react";

type IntegrationSlotProps = {
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

// A lightweight wrapper to host integrated elements from another project
export function IntegrationSlot({ title, children, className }: IntegrationSlotProps) {
  return (
    <section className={`p-4 rounded-xl border border-[var(--earth-border)] bg-[var(--earth-card)] ${className ?? ""}`}>
      {title && <h2 className="text-white font-semibold mb-3">{title}</h2>}
      <div className="overflow-hidden">{children}</div>
    </section>
  );
}
