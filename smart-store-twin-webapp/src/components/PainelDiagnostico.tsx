import { AlertTriangle, CheckCircle2, ClipboardCheck, Siren } from "lucide-react";
import type { EstadoGemeoDigital } from "../types/gemeoDigital";

interface PainelDiagnosticoProps {
  estado: EstadoGemeoDigital;
}

function obterResumo(saude: number) {
  if (saude >= 80) {
    return {
      titulo: "Operação estável",
      descricao: "A loja opera dentro dos parâmetros esperados.",
      classe: "border-emerald-200 bg-emerald-50 text-emerald-900",
      icone: CheckCircle2,
    };
  }

  if (saude >= 50) {
    return {
      titulo: "Operação em atenção",
      descricao: "Existem riscos operacionais que precisam ser acompanhados.",
      classe: "border-amber-200 bg-amber-50 text-amber-900",
      icone: AlertTriangle,
    };
  }

  return {
    titulo: "Operação crítica",
    descricao: "O gêmeo digital detectou situação crítica na loja.",
    classe: "border-red-200 bg-red-50 text-red-900",
    icone: Siren,
  };
}

export function PainelDiagnostico({ estado }: PainelDiagnosticoProps) {
  const alertasAbertos = estado.alertas.filter((a) => a.status !== "Resolvido");
  const alertasCriticos = alertasAbertos.filter((a) => a.severidade === "Critica");
  const zonasAfetadas = estado.zonas.filter((z) => z.status !== "Normal");
  const principalAlerta = alertasCriticos[0] ?? alertasAbertos[0];
  const ultimaAcao = estado.linhaDoTempo.find((e) => e.tipo === "AcaoAtuador");
  const resumo = obterResumo(estado.saudeOperacional);
  const IconeResumo = resumo.icone;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className={`rounded-2xl border p-3 ${resumo.classe}`}>
          <IconeResumo size={22} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Diagnóstico do gêmeo
          </h2>
          <p className="text-sm text-slate-500">
            Resumo automático do estado operacional atual.
          </p>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${resumo.classe}`}>
        <p className="font-semibold">{resumo.titulo}</p>
        <p className="mt-1 text-sm opacity-80">{resumo.descricao}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Alertas abertos</p>
          <strong className="mt-1 block text-xl font-semibold text-slate-900">
            {alertasAbertos.length}
          </strong>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">Zonas afetadas</p>
          <strong className="mt-1 block text-xl font-semibold text-slate-900">
            {zonasAfetadas.length}
          </strong>
        </div>
      </div>

      {principalAlerta ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ClipboardCheck size={16} />
            Principal recomendação
          </div>
          <p className="text-sm text-slate-700">{principalAlerta.titulo}</p>
          {principalAlerta.recomendacao && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {principalAlerta.recomendacao}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Nenhuma recomendação crítica no momento.
        </div>
      )}

      {ultimaAcao && (
        <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
          <strong>Última ação:</strong> {ultimaAcao.descricao}
        </div>
      )}
    </section>
  );
}
