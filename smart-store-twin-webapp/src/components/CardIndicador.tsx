import type { ReactNode } from "react";

interface CardIndicadorProps {
  titulo: string;
  valor: string;
  descricao?: string;
  icone?: ReactNode;
  destaque?: "normal" | "bom" | "atencao" | "critico";
}

const estilos = {
  normal: "border-slate-200 bg-white",
  bom: "border-emerald-200 bg-emerald-50",
  atencao: "border-amber-200 bg-amber-50",
  critico: "border-red-200 bg-red-50",
};

export function CardIndicador({
  titulo,
  valor,
  descricao,
  icone,
  destaque = "normal",
}: CardIndicadorProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${estilos[destaque]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <strong className="mt-1 block text-2xl font-semibold text-slate-900">
            {valor}
          </strong>
        </div>

        {icone && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-slate-700 shadow-sm">
            {icone}
          </div>
        )}
      </div>

      {descricao && <p className="mt-2 text-xs text-slate-500">{descricao}</p>}
    </div>
  );
}
