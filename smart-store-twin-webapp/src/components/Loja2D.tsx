import clsx from "clsx";
import type { ReactNode } from "react";
import {
  CreditCard,
  DoorOpen,
  Monitor,
  Refrigerator,
  ShoppingBasket,
  Users,
} from "lucide-react";
import type {
  AtuadorLoja,
  ClienteSimulado,
  ZonaLoja,
} from "../types/gemeoDigital";

interface Loja2DProps {
  zonas: ZonaLoja[];
  atuadores: AtuadorLoja[];
  clientes: ClienteSimulado[];
  simulacaoAtiva: boolean;
}

interface AreaLayout {
  chave: string;
  titulo: string;
  className: string;
  encontrarZona: (zonas: ZonaLoja[]) => ZonaLoja | undefined;
  icone: ReactNode;
}

const areas: AreaLayout[] = [
  {
    chave: "entrada",
    titulo: "Entrada / Saída",
    className: "left-[4%] top-[5%] h-[17%] w-[28%]",
    encontrarZona: (zonas) => zonas.find((z) => z.tipo === "Entrada"),
    icone: <DoorOpen size={22} />,
  },
  {
    chave: "painel",
    titulo: "Painel digital",
    className: "right-[4%] top-[5%] h-[17%] w-[28%]",
    encontrarZona: (zonas) => zonas.find((z) => z.tipo === "PainelDigital"),
    icone: <Monitor size={22} />,
  },
  {
    chave: "bebidas",
    titulo: "Bebidas",
    className: "left-[4%] top-[30%] h-[24%] w-[27%]",
    encontrarZona: (zonas) => zonas.find((z) => z.nome.includes("Bebidas")),
    icone: <ShoppingBasket size={22} />,
  },
  {
    chave: "snacks",
    titulo: "Snacks",
    className: "left-[36.5%] top-[30%] h-[24%] w-[27%]",
    encontrarZona: (zonas) => zonas.find((z) => z.nome.includes("Snacks")),
    icone: <ShoppingBasket size={22} />,
  },
  {
    chave: "geladeira",
    titulo: "Geladeira",
    className: "right-[4%] top-[30%] h-[24%] w-[27%]",
    encontrarZona: (zonas) => zonas.find((z) => z.tipo === "Geladeira"),
    icone: <Refrigerator size={22} />,
  },
  {
    chave: "circulacao",
    titulo: "Circulação",
    className: "left-[4%] bottom-[7%] h-[26%] w-[36%]",
    encontrarZona: (zonas) => zonas.find((z) => z.tipo === "Circulacao"),
    icone: <Users size={22} />,
  },
  {
    chave: "checkout",
    titulo: "Checkout",
    className: "right-[4%] bottom-[7%] h-[26%] w-[36%]",
    encontrarZona: (zonas) => zonas.find((z) => z.tipo === "Checkout"),
    icone: <CreditCard size={22} />,
  },
];

function obterClasseStatus(status?: string) {
  if (status === "Critico") {
    return "border-red-300 bg-red-50 text-red-900 shadow-red-100";
  }

  if (status === "Atencao") {
    return "border-amber-300 bg-amber-50 text-amber-900 shadow-amber-100";
  }

  if (status === "Manutencao") {
    return "border-purple-300 bg-purple-50 text-purple-900 shadow-purple-100";
  }

  if (status === "Bloqueado") {
    return "border-slate-400 bg-slate-100 text-slate-900 shadow-slate-200";
  }

  if (status === "ModoEconomico") {
    return "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-emerald-100";
  }

  return "border-slate-200 bg-white text-slate-800 shadow-slate-100";
}

function obterAreaCliente(cliente: ClienteSimulado) {
  const zona = (cliente.zonaAtualNome ?? "").toLowerCase();
  const etapa = cliente.etapa.toLowerCase();

  if (zona.includes("entrada") || etapa.includes("entrada")) return "entrada";
  if (zona.includes("bebida") || etapa.includes("bebida")) return "bebidas";
  if (zona.includes("snack") || etapa.includes("snack")) return "snacks";
  if (zona.includes("geladeira") || etapa.includes("geladeira") || etapa.includes("refrigerado")) {
    return "geladeira";
  }
  if (zona.includes("checkout") || etapa.includes("checkout")) return "checkout";
  if (zona.includes("painel")) return "painel";

  return "circulacao";
}

const posicoesClientes: Record<string, { left: number; top: number }> = {
  entrada: { left: 17, top: 13 },
  painel: { left: 82, top: 13 },
  bebidas: { left: 17, top: 43 },
  snacks: { left: 50, top: 43 },
  geladeira: { left: 82, top: 43 },
  circulacao: { left: 22, top: 80 },
  checkout: { left: 80, top: 80 },
};

function calcularPosicaoCliente(cliente: ClienteSimulado, index: number) {
  const area = obterAreaCliente(cliente);
  const base = posicoesClientes[area] ?? posicoesClientes.circulacao;
  const deslocamentoX = ((index % 4) - 1.5) * 4;
  const deslocamentoY = (Math.floor(index / 4) % 3) * 5;

  return {
    left: `${Math.min(92, Math.max(6, base.left + deslocamentoX))}%`,
    top: `${Math.min(90, Math.max(8, base.top + deslocamentoY))}%`,
  };
}

function obterDetalhesZona(zona?: ZonaLoja) {
  if (!zona) return [];

  const detalhes: string[] = [];

  if (zona.tipo === "Prateleira") {
    detalhes.push(`Físico: ${zona.estoqueFisico ?? "-"}`);
    detalhes.push(`Esperado: ${zona.estoqueEsperado ?? "-"}`);

    if (
      zona.estoqueFisico !== null &&
      zona.estoqueFisico !== undefined &&
      zona.estoqueEsperado !== null &&
      zona.estoqueEsperado !== undefined
    ) {
      const divergencia = zona.estoqueEsperado - zona.estoqueFisico;
      if (divergencia > 0) detalhes.push(`Divergência: ${divergencia}`);
    }
  }

  if (zona.tipo === "Geladeira") {
    detalhes.push(`${zona.temperaturaCelsius ?? "-"}°C`);
    detalhes.push(`Estoque: ${zona.estoqueFisico ?? "-"}`);
  }

  if (zona.tipo === "Circulacao") {
    detalhes.push(`${zona.quantidadePessoas} pessoa(s)`);
    if (zona.consumoEnergiaKwh) detalhes.push(`${zona.consumoEnergiaKwh} kWh`);
  }

  if (zona.tipo === "Checkout") {
    detalhes.push(zona.status);
  }

  return detalhes;
}

export function Loja2D({
  zonas,
  atuadores,
  clientes,
  simulacaoAtiva,
}: Loja2DProps) {
  const clientesAtivos = clientes.filter((c) => c.etapa !== "Finalizado");

  function obterAtuadorZona(zonaId?: string) {
    if (!zonaId) return undefined;
    return atuadores.find((atuador) => atuador.zonaId === zonaId);
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Loja 2D operacional
          </h2>
          <p className="text-sm text-slate-500">
            Zonas físicas, clientes, sensores e atuadores em operação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {simulacaoAtiva && (
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {clientesAtivos.length} cliente(s) na loja
          </span>
        </div>
      </div>

      <div className="relative h-[620px] overflow-hidden rounded-[2rem] border border-slate-300 bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_38%,_#eef2ff)] p-4 shadow-inner">
        <div className="absolute left-1/2 top-[23%] h-[61%] w-[1px] -translate-x-1/2 border-l border-dashed border-slate-300" />
        <div className="absolute left-[8%] top-[60%] h-[1px] w-[84%] border-t border-dashed border-slate-300" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
          Área operacional da loja autônoma
        </div>

        {areas.map((area) => {
          const zona = area.encontrarZona(zonas);
          const atuador = obterAtuadorZona(zona?.id);
          const detalhes = obterDetalhesZona(zona);

          return (
            <div
              key={area.chave}
              className={clsx(
                "absolute rounded-3xl border p-4 shadow-lg transition-all duration-500",
                area.className,
                obterClasseStatus(zona?.status),
                zona?.status === "Critico" && "animate-pulse",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{zona?.nome ?? area.titulo}</p>
                  <p className="mt-1 text-xs opacity-70">{zona?.status ?? "Normal"}</p>
                </div>

                <div className="rounded-2xl bg-white/80 p-2 shadow-sm">
                  {area.icone}
                </div>
              </div>

              {detalhes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {detalhes.map((detalhe) => (
                    <span
                      key={detalhe}
                      className="rounded-full bg-white/75 px-2 py-1 text-[11px] font-semibold shadow-sm"
                    >
                      {detalhe}
                    </span>
                  ))}
                </div>
              )}

              {atuador && (
                <div className="mt-3 rounded-2xl bg-white/70 p-2 text-[11px] leading-relaxed shadow-sm">
                  <strong>Atuador:</strong> {atuador.status}
                </div>
              )}

              {zona?.riscoAtual && (
                <p className="mt-2 line-clamp-2 rounded-2xl bg-white/70 p-2 text-[11px] leading-relaxed shadow-sm">
                  {zona.riscoAtual}
                </p>
              )}
            </div>
          );
        })}

        {clientesAtivos.map((cliente, index) => {
          const posicao = calcularPosicaoCliente(cliente, index);

          return (
            <div
              key={cliente.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
              style={posicao}
              title={`${cliente.nome} - ${cliente.status}`}
            >
              <div
                className={clsx(
                  "group relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg",
                  cliente.possuiDivergencia
                    ? "border-red-300 bg-red-500 text-white"
                    : cliente.etapa === "Checkout"
                      ? "border-sky-300 bg-sky-500 text-white"
                      : "border-emerald-300 bg-emerald-500 text-white",
                )}
              >
                {cliente.codigo.replace("C", "")}

                <div className="pointer-events-none absolute left-1/2 top-full mt-2 hidden w-56 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-left text-xs font-normal text-slate-700 shadow-xl group-hover:block">
                  <p className="font-semibold text-slate-900">{cliente.nome}</p>
                  <p className="mt-1">{cliente.status}</p>
                  <p className="mt-1 text-slate-500">Zona: {cliente.zonaAtualNome ?? "-"}</p>
                  <p className="mt-1 text-slate-500">
                    Produtos: {cliente.totalProdutosSelecionados} | R${" "}
                    {cliente.valorCarrinho.toFixed(2)}
                  </p>
                  {cliente.possuiDivergencia && (
                    <p className="mt-2 rounded-xl bg-red-50 p-2 font-semibold text-red-700">
                      Divergência detectada
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
