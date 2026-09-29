import clsx from "clsx";
import { Bot, Database, FileText, PackageSearch, Store } from "lucide-react";

export type VisaoGemeo =
  | "simulacro"
  | "fluxo-dados"
  | "estoque"
  | "decisoes"
  | "relatorio";

interface NavegacaoGemeoProps {
  visaoAtiva: VisaoGemeo;
  onAlterarVisao: (visao: VisaoGemeo) => void;
}

const itens = [
  {
    chave: "simulacro" as const,
    titulo: "Loja 2D",
    descricao: "operação",
    icone: Store,
  },
  {
    chave: "fluxo-dados" as const,
    titulo: "Dados",
    descricao: "ambiente",
    icone: Database,
  },
  {
    chave: "estoque" as const,
    titulo: "Estoque",
    descricao: "produtos",
    icone: PackageSearch,
  },
  {
    chave: "decisoes" as const,
    titulo: "Decisões",
    descricao: "automação",
    icone: Bot,
  },
  {
    chave: "relatorio" as const,
    titulo: "Fechamento",
    descricao: "gerencial",
    icone: FileText,
  },
];

export function NavegacaoGemeo({ visaoAtiva, onAlterarVisao }: NavegacaoGemeoProps) {
  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/95 px-3 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1800px] gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {itens.map((item) => {
          const Icone = item.icone;
          const ativo = item.chave === visaoAtiva;

          return (
            <button
              key={item.chave}
              type="button"
              onClick={() => onAlterarVisao(item.chave)}
              className={clsx(
                "flex min-w-[150px] items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                ativo
                  ? "border-sky-200 bg-sky-50 text-sky-900 shadow-sm"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
              )}
            >
              <div
                className={clsx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  ativo ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500",
                )}
              >
                <Icone size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold">{item.titulo}</p>
                <p className="text-[11px] uppercase tracking-wide opacity-70">{item.descricao}</p>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
