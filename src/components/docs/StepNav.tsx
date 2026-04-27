"use client";

import { clsx } from "clsx";
import type { ElementType } from "react";

export interface Step {
  id: string;
  label: string;
  icon: ElementType;
}

interface StepNavProps {
  steps: Step[];
  activeStep: string;
  onStepClick: (id: string) => void;
}

export function StepNav({ steps, activeStep, onStepClick }: StepNavProps) {
  const activeIdx = steps.findIndex((s) => s.id === activeStep);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      {steps.map((step, i) => {
        const isActive = step.id === activeStep;
        const isPast = i < activeIdx;
        const Icon = step.icon;

        return (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={clsx(
              "group flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap",
              "transition-all duration-150 shrink-0",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
              isActive
                ? "bg-[#FFFBEB] text-[#92400E] font-medium shadow-sm"
                : isPast
                  ? "text-[#15803D] hover:bg-green-50"
                  : "text-[#71717A] hover:text-[#09090B] hover:bg-[#F4F4F5]"
            )}
          >
            <span
              className={clsx(
                "flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold shrink-0",
                isActive
                  ? "bg-[#B45309] text-white"
                  : isPast
                    ? "bg-[#16A34A] text-white"
                    : "bg-[#E4E4E7] text-[#71717A] group-hover:bg-[#D4D4D8]"
              )}
            >
              {isPast ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5L4 7L8 3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <Icon
              size={14}
              className={clsx(
                "shrink-0 hidden sm:block",
                isActive ? "text-[#B45309]" : ""
              )}
            />
            <span className="hidden md:inline">{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}
