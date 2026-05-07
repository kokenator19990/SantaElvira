"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { reabrirAlerta } from "@/lib/db/actions/alertas";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface Props {
  alertaId: string;
  equipoId: string;
  kpiLabel: string;
}

export function ReabrirButton({ alertaId, equipoId, kpiLabel }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await reabrirAlerta(Number(alertaId));
      setShowConfirm(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={pending}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-[5px] text-[11px] text-[#71717A] hover:text-[#B45309] hover:bg-[#FFFBEB] transition-colors disabled:opacity-50"
        title="Reabrir esta alerta (deshacer resolución)"
      >
        <RotateCcw size={11} />
        {pending ? "Reabriendo…" : "Reabrir"}
      </button>
      <ConfirmDialog
        open={showConfirm}
        titulo="Reabrir alerta"
        mensaje={`Se reabrirá la alerta de ${equipoId} (${kpiLabel}). La alerta volverá al panel de alertas activas y se registrará en el log de auditoría.`}
        textoConfirmar="Reabrir alerta"
        variante="advertencia"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
