"use client";

import { Minus, Plus } from "iconoir-react";

type QuantityStepperProps = {
  qty: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
};

export function QuantityStepper({ qty, onChange, min = 1, max }: QuantityStepperProps) {
  return (
    <div className="flex h-12 w-[106px] shrink-0 items-center justify-between rounded-full border border-evergreen px-2">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(qty - 1, min))}>
        <Minus width={24} height={24} />
      </button>
      <span className="text-ink">{qty}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(max !== undefined ? Math.min(qty + 1, max) : qty + 1)}
      >
        <Plus width={24} height={24} />
      </button>
    </div>
  );
}
