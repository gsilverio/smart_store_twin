import {
  PauseCircle,
  PlayCircle,
  RotateCcw,
  StepForward,
  TimerReset,
} from "lucide-react";

interface ControleSimulacaoProps {
  simulacaoAtiva: boolean;
  tickAtual: number;
  ultimoTickEm?: string | null;
  clientesAtivos: number;
  carregando: boolean;
  onIniciar: () => void;
  onParar: () => void;
  onTick: () => void;
  onReiniciar: () => void;
}

function formatarHora(data?: string | null) {
  if (!data) return "-";

  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function ControleSimulacao({
  simulacaoAtiva,
  tickAtual,
  ultimoTickEm,
  clientesAtivos,
  carregando,
  onIniciar,
  onParar,
  onTick,
  onReiniciar,
}: ControleSimulacaoProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Operação live da loja
            </h2>

            <span
              className={
                simulacaoAtiva
                  ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                  : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
              }
            >
              {simulacaoAtiva ? "Rodando" : "Pausada"}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Fluxo automático de clientes, sensores, estoque, checkout e rotinas do gêmeo digital.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!simulacaoAtiva ? (
            <button
              type="button"
              disabled={carregando}
              onClick={onIniciar}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              <PlayCircle size={18} />
              Iniciar
            </button>
          ) : (
            <button
              type="button"
              disabled={carregando}
              onClick={onParar}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-900 disabled:opacity-60"
            >
              <PauseCircle size={18} />
              Pausar
            </button>
          )}

          <button
            type="button"
            disabled={carregando}
            onClick={onTick}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <StepForward size={18} />
            Tick manual
          </button>

          <button
            type="button"
            disabled={carregando}
            onClick={onReiniciar}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RotateCcw size={18} />
            Reiniciar
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Tick atual</p>
          <strong className="mt-1 block text-xl font-semibold text-slate-900">
            #{tickAtual}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Última atualização</p>
          <strong className="mt-1 block text-xl font-semibold text-slate-900">
            {formatarHora(ultimoTickEm)}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Clientes na loja</p>
          <strong className="mt-1 block text-xl font-semibold text-slate-900">
            {clientesAtivos}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Modo de dados</p>
          <strong className="mt-1 flex items-center gap-2 text-xl font-semibold text-slate-900">
            <TimerReset size={18} />
            {simulacaoAtiva ? "Live" : "Manual"}
          </strong>
        </div>
      </div>
    </section>
  );
}
