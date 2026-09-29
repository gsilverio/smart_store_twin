import clsx from "clsx";
import { Boxes, ShoppingCart } from "lucide-react";
import type { ProdutoOperacional } from "../types/gemeoDigital";

interface PainelEstoqueInteligenteProps {
  produtos: ProdutoOperacional[];
}

function obterClasseEstoque(produto: ProdutoOperacional) {
  if (produto.estoqueAtual <= produto.estoqueMinimo) {
    return "border-red-200 bg-red-50 text-red-900";
  }

  if (produto.previsaoRupturaHoras !== null && produto.previsaoRupturaHoras !== undefined && produto.previsaoRupturaHoras <= 4) {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-slate-200 bg-white text-slate-800";
}

export function PainelEstoqueInteligente({ produtos }: PainelEstoqueInteligenteProps) {
  const produtosComCompra = produtos.filter((produto) => produto.sugestaoCompra > 0);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Boxes size={20} className="text-slate-700" />
            <h2 className="text-lg font-semibold text-slate-900">Estoque inteligente</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Produtos operacionais acompanhados pelo gêmeo digital com previsão de ruptura e sugestão de compra.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
          {produtosComCompra.length} sugestão(ões) de compra
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>Produto</span>
          <span>Categoria</span>
          <span>Estoque</span>
          <span>Vendidos</span>
          <span>Perdas</span>
          <span>Ruptura</span>
          <span>Compra sugerida</span>
        </div>

        <div className="divide-y divide-slate-100">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_0.7fr_0.9fr_1fr] items-center gap-2 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-slate-900">{produto.nome}</p>
                <p className="text-xs text-slate-500">{produto.zonaNome}</p>
              </div>

              <span className="text-slate-600">{produto.categoria}</span>

              <span
                className={clsx(
                  "w-fit rounded-full border px-2 py-1 text-xs font-semibold",
                  obterClasseEstoque(produto),
                )}
              >
                {produto.estoqueAtual}/{produto.estoqueMaximo}
              </span>

              <span className="text-slate-700">{produto.vendidosHoje}</span>
              <span className={produto.perdidosHoje > 0 ? "font-semibold text-red-600" : "text-slate-700"}>
                {produto.perdidosHoje}
              </span>

              <span className="text-slate-700">
                {produto.previsaoRupturaHoras !== null && produto.previsaoRupturaHoras !== undefined
                  ? `${produto.previsaoRupturaHoras.toFixed(1)}h`
                  : "-"}
              </span>

              <div>
                {produto.sugestaoCompra > 0 ? (
                  <div className="rounded-xl border border-sky-200 bg-sky-50 p-2 text-xs text-sky-900">
                    <div className="flex items-center gap-1 font-semibold">
                      <ShoppingCart size={13} />
                      Comprar {produto.sugestaoCompra} un.
                    </div>
                    {produto.motivoSugestao && (
                      <p className="mt-1 opacity-80">{produto.motivoSugestao}</p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Sem compra</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
