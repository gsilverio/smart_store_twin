import {
  AlertTriangle,
  BatteryWarning,
  CreditCard,
  Refrigerator,
  RotateCcw,
  Users,
  PackageMinus,
} from "lucide-react";

interface PainelCenariosProps {
  carregando: boolean;
  onSimular: (cenario: string) => void;
  onReiniciar: () => void;
}

const cenarios = [
  {
    chave: "horario-pico",
    titulo: "Horário de pico",
    descricao: "Aumenta fluxo de pessoas e risco de fila.",
    icone: Users,
  },
  {
    chave: "falha-geladeira",
    titulo: "Falha na geladeira",
    descricao: "Eleva temperatura e gera risco financeiro.",
    icone: Refrigerator,
  },
  {
    chave: "checkout-fora-do-ar",
    titulo: "Checkout fora do ar",
    descricao: "Coloca o terminal em manutenção.",
    icone: CreditCard,
  },
  {
    chave: "divergencia-pagamento",
    titulo: "Divergência de pagamento",
    descricao: "Simula produto retirado sem pagamento equivalente.",
    icone: AlertTriangle,
  },
  {
    chave: "pico-energia",
    titulo: "Pico de energia",
    descricao: "Aumenta consumo e ativa modo econômico.",
    icone: BatteryWarning,
  },
  {
    chave: "estoque-critico",
    titulo: "Estoque crítico",
    descricao: "Reduz estoque de bebidas e gera reposição.",
    icone: PackageMinus,
  },
];

export function PainelCenarios({
  carregando,
  onSimular,
  onReiniciar,
}: PainelCenariosProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Simulações de cenário
          </h2>
          <p className="text-sm text-slate-500">
            Dispare eventos para observar como o gêmeo digital reage.
          </p>
        </div>

        <button
          type="button"
          disabled={carregando}
          onClick={onReiniciar}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RotateCcw size={16} />
          Reiniciar
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cenarios.map((cenario) => {
          const Icone = cenario.icone;

          return (
            <button
              key={cenario.chave}
              type="button"
              disabled={carregando}
              onClick={() => onSimular(cenario.chave)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm disabled:opacity-60"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                <Icone size={20} />
              </div>

              <p className="font-semibold text-slate-900">{cenario.titulo}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {cenario.descricao}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
