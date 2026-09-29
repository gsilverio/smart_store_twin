import { Clock3 } from "lucide-react";
import type { EventoLinhaDoTempo } from "../types/gemeoDigital";

interface LinhaDoTempoProps {
  eventos: EventoLinhaDoTempo[];
}

function formatarHora(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LinhaDoTempo({ eventos }: LinhaDoTempoProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Linha do tempo</h2>
        <p className="text-sm text-slate-500">
          Histórico das leituras, alertas e ações executadas.
        </p>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
        {eventos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
        ) : (
          eventos.map((evento) => (
            <div
              key={evento.id}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
                <Clock3 size={15} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    {formatarHora(evento.criadoEm)}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                    {evento.tipo}
                  </span>
                  {evento.origem && (
                    <span className="text-[11px] text-slate-400">
                      {evento.origem}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {evento.descricao}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
