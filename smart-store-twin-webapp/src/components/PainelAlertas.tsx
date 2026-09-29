import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import type { AlertaLoja } from "../types/gemeoDigital";

interface PainelAlertasProps {
  alertas: AlertaLoja[];
  carregando: boolean;
  onResolver: (alertaId: string) => void;
}

function estiloSeveridade(severidade: string) {
  if (severidade === "Critica") return "border-red-200 bg-red-50 text-red-900";
  if (severidade === "Alta")
    return "border-orange-200 bg-orange-50 text-orange-900";
  if (severidade === "Media")
    return "border-amber-200 bg-amber-50 text-amber-900";

  return "border-slate-200 bg-slate-50 text-slate-800";
}

export function PainelAlertas({
  alertas,
  carregando,
  onResolver,
}: PainelAlertasProps) {
  const alertasAbertos = alertas.filter(
    (alerta) => alerta.status !== "Resolvido",
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Alertas operacionais
        </h2>
        <p className="text-sm text-slate-500">
          Riscos, anomalias e recomendações do gêmeo digital.
        </p>
      </div>

      {alertasAbertos.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Nenhum alerta aberto no momento.
        </div>
      ) : (
        <div className="space-y-3">
          {alertasAbertos.map((alerta) => (
            <div
              key={alerta.id}
              className={clsx(
                "rounded-2xl border p-4",
                estiloSeveridade(alerta.severidade),
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-2 inline-flex rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                    {alerta.severidade}
                  </div>

                  <p className="font-semibold">{alerta.titulo}</p>
                  <p className="mt-1 text-sm opacity-80">{alerta.descricao}</p>
                </div>

                <button
                  type="button"
                  disabled={carregando}
                  onClick={() => onResolver(alerta.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-xs font-medium shadow-sm hover:bg-white disabled:opacity-60"
                >
                  <CheckCircle2 size={14} />
                  Resolver
                </button>
              </div>

              {alerta.recomendacao && (
                <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm">
                  <strong>Recomendação:</strong> {alerta.recomendacao}
                </div>
              )}

              {alerta.impactoFinanceiroEstimado !== null &&
                alerta.impactoFinanceiroEstimado !== undefined &&
                alerta.impactoFinanceiroEstimado > 0 && (
                  <p className="mt-2 text-xs font-medium">
                    Impacto estimado: R${" "}
                    {alerta.impactoFinanceiroEstimado.toFixed(2)}
                  </p>
                )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
