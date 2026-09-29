import clsx from "clsx";
import { Bot, Zap } from "lucide-react";
import type { RotinaAutomatica } from "../types/gemeoDigital";

interface PainelRotinasAutomaticasProps {
  rotinas: RotinaAutomatica[];
}

function formatarHora(data?: string | null) {
  if (!data) return "-";

  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function obterClasseStatus(status: string) {
  if (status === "Executada") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (status === "Atencao") return "border-amber-200 bg-amber-50 text-amber-900";
  if (status === "Monitorando") return "border-sky-200 bg-sky-50 text-sky-900";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export function PainelRotinasAutomaticas({ rotinas }: PainelRotinasAutomaticasProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
          <Bot size={22} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rotinas automáticas do gêmeo</h2>
          <p className="text-sm text-slate-500">
            Decisões que o gêmeo digital executa além de apenas criar alertas.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rotinas.map((rotina) => (
          <div key={rotina.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{rotina.nome}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{rotina.descricao}</p>
              </div>

              <span
                className={clsx(
                  "shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold",
                  obterClasseStatus(rotina.status),
                )}
              >
                {rotina.status}
              </span>
            </div>

            {rotina.resultado && (
              <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                {rotina.resultado}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Última execução: {formatarHora(rotina.ultimaExecucaoEm)}</span>
              {rotina.acaoExecutada && <span>• Ação: {rotina.acaoExecutada}</span>}
              {rotina.economiaEnergiaEstimadaKwh > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                  <Zap size={12} />
                  {rotina.economiaEnergiaEstimadaKwh.toFixed(2)} kWh economizados
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
