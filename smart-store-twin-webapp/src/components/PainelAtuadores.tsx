import {
  Bolt,
  DoorOpen,
  Lightbulb,
  Monitor,
  Refrigerator,
  CreditCard,
} from "lucide-react";
import type { AtuadorLoja } from "../types/gemeoDigital";

interface PainelAtuadoresProps {
  atuadores: AtuadorLoja[];
  carregando: boolean;
  onAcionar: (atuadorId: string, acao: string) => void;
}

function obterIcone(tipo: string) {
  if (tipo === "PortaAutomatica") return <DoorOpen size={18} />;
  if (tipo === "Refrigeracao") return <Refrigerator size={18} />;
  if (tipo === "Iluminacao") return <Lightbulb size={18} />;
  if (tipo === "Checkout") return <CreditCard size={18} />;
  if (tipo === "PainelDigital") return <Monitor size={18} />;

  return <Bolt size={18} />;
}

function obterAcoes(tipo: string) {
  if (tipo === "PortaAutomatica")
    return ["Liberada", "Entrada limitada", "Bloqueada"];
  if (tipo === "Refrigeracao")
    return ["Normal", "Refrigeracao maxima", "Modo economico"];
  if (tipo === "Iluminacao")
    return ["Normal", "Modo economico", "Alerta visual"];
  if (tipo === "Checkout")
    return ["Operacional", "Modo manutencao", "Reiniciar terminal"];
  if (tipo === "PainelDigital")
    return [
      "Mensagem padrao",
      "Solicitar conferencia operacional",
      "Produto indisponivel",
    ];

  return ["Normal"];
}

export function PainelAtuadores({
  atuadores,
  carregando,
  onAcionar,
}: PainelAtuadoresProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Atuadores</h2>
        <p className="text-sm text-slate-500">
          Dispositivos simulados que alteram o estado da loja.
        </p>
      </div>

      <div className="space-y-3">
        {atuadores.map((atuador) => (
          <div
            key={atuador.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                {obterIcone(atuador.tipo)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">
                  {atuador.nome}
                </p>
                <p className="text-xs text-slate-500">
                  Status: {atuador.status}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {obterAcoes(atuador.tipo).map((acao) => (
                <button
                  key={acao}
                  type="button"
                  disabled={carregando}
                  onClick={() => onAcionar(atuador.id, acao)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50 disabled:opacity-60"
                >
                  {acao}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
