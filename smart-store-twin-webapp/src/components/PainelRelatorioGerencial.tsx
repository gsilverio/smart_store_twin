import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  ClipboardList,
  FileText,
  PackageCheck,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import type {
  AlertaLoja,
  EventoLinhaDoTempo,
  RelatorioGerencialDia,
  RotinaAutomatica,
} from "../types/gemeoDigital";

interface PainelRelatorioGerencialProps {
  relatorio?: RelatorioGerencialDia | null;
  carregando: boolean;
  onGerarRelatorio: () => void;
  alertas?: AlertaLoja[];
  rotinas?: RotinaAutomatica[];
  eventos?: EventoLinhaDoTempo[];
}

function moeda(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
}

function dataHora(valor?: string | null) {
  if (!valor) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

function CardResumo({
  titulo,
  valor,
  detalhe,
  icone,
  destaque = "slate",
}: {
  titulo: string;
  valor: string;
  detalhe: string;
  icone: React.ReactNode;
  destaque?: "slate" | "emerald" | "red" | "sky" | "amber";
}) {
  const estilos = {
    slate: "border-slate-200 bg-slate-50 text-slate-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
    red: "border-red-200 bg-red-50 text-red-900",
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-2xl border p-4 ${estilos[destaque]}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-70">{titulo}</p>
        <div className="rounded-xl bg-white/70 p-2">{icone}</div>
      </div>
      <strong className="block text-2xl font-bold">{valor}</strong>
      <p className="mt-1 text-sm opacity-75">{detalhe}</p>
    </div>
  );
}

export function PainelRelatorioGerencial({
  relatorio,
  carregando,
  onGerarRelatorio,
  alertas = [],
  rotinas = [],
  eventos = [],
}: PainelRelatorioGerencialProps) {
  const recomendacoesAtivas = relatorio?.recomendacoesCompra
    .filter((item) => item.quantidadeSugerida > 0)
    .slice(0, 4) ?? [];

  const alertasAbertos = alertas.filter((alerta) => alerta.status !== "Resolvido");
  const alertasCriticos = alertasAbertos.filter((alerta) => alerta.severidade === "Critica");
  const rotinasRelevantes = rotinas
    .filter((rotina) => rotina.status !== "Normal" || rotina.acaoExecutada)
    .slice(0, 4);
  const eventosRelevantes = eventos.slice(0, 5);

  const custoReposicao = recomendacoesAtivas.reduce(
    (total, item) => total + item.custoEstimado,
    0,
  );

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Fechamento gerencial</h2>
            <p className="text-sm text-slate-500">
              Resumo do dia com vendas, perdas, energia, ocorrências e recomendações finais.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={carregando}
          onClick={onGerarRelatorio}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60"
        >
          <ClipboardList size={17} />
          Gerar fechamento
        </button>
      </div>

      {!relatorio ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          Inicie a operação live e gere o fechamento para consolidar os indicadores do dia.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                  Diagnóstico do gêmeo digital
                </p>
                <p className="mt-2 text-sm leading-relaxed text-sky-950">{relatorio.diagnostico}</p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-sky-800 shadow-sm">
                Gerado em {dataHora(relatorio.geradoEm)}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
            <CardResumo
              titulo="Receita"
              valor={moeda(relatorio.receitaEstimada)}
              detalhe={`${relatorio.produtosVendidos} produto(s) vendidos`}
              icone={<Wallet size={18} />}
              destaque="emerald"
            />
            <CardResumo
              titulo="Perdas"
              valor={moeda(relatorio.perdaEstimada)}
              detalhe={`${relatorio.produtosPerdidos} produto(s) com perda`}
              icone={<AlertTriangle size={18} />}
              destaque={relatorio.perdaEstimada > 0 ? "red" : "slate"}
            />
            <CardResumo
              titulo="Energia"
              valor={`${relatorio.consumoEnergiaKwh.toFixed(1)} kWh`}
              detalhe={`Custo estimado: ${moeda(relatorio.custoEnergiaEstimado)}`}
              icone={<BatteryCharging size={18} />}
              destaque="sky"
            />
            <CardResumo
              titulo="Economia"
              valor={`${relatorio.economiaEnergiaEstimadaKwh.toFixed(2)} kWh`}
              detalhe="Ajustes automáticos de operação"
              icone={<Zap size={18} />}
              destaque="emerald"
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <TrendingUp size={17} />
                  Balanço da operação
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Produtos retirados</p>
                    <strong className="mt-1 block text-xl text-slate-900">
                      {relatorio.produtosRetirados}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Alertas abertos</p>
                    <strong className="mt-1 block text-xl text-slate-900">
                      {relatorio.alertasAbertos}
                    </strong>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="text-xs text-slate-500">Alertas críticos</p>
                    <strong className="mt-1 block text-xl text-red-700">
                      {relatorio.alertasCriticos}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                  <CheckCircle2 size={17} />
                  Rotinas e ocorrências relevantes
                </div>

                <div className="space-y-2">
                  {rotinasRelevantes.length === 0 && eventosRelevantes.length === 0 ? (
                    <p className="rounded-xl bg-white p-3 text-sm text-slate-500 shadow-sm">
                      Nenhuma ocorrência relevante registrada no período.
                    </p>
                  ) : (
                    <>
                      {rotinasRelevantes.map((rotina) => (
                        <div key={rotina.id} className="rounded-xl bg-white p-3 text-sm shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900">{rotina.nome}</p>
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                              {rotina.status}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            {rotina.resultado ?? rotina.acaoExecutada ?? rotina.descricao}
                          </p>
                        </div>
                      ))}

                      {eventosRelevantes.slice(0, Math.max(0, 5 - rotinasRelevantes.length)).map((evento) => (
                        <div key={evento.id} className="rounded-xl bg-white p-3 text-sm shadow-sm">
                          <p className="font-semibold text-slate-900">{evento.origem ?? "Evento operacional"}</p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{evento.descricao}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
                <ShoppingCart size={17} />
                Recomendações finais
              </div>

              <div className="space-y-3">
                {recomendacoesAtivas.length > 0 ? (
                  <div className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">
                      Repor {recomendacoesAtivas.length} produto(s) prioritário(s)
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Custo estimado de reposição: {moeda(custoReposicao)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {recomendacoesAtivas.map((item) => (
                        <span
                          key={`${item.produto}-${item.categoria}`}
                          className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                        >
                          {item.produto}: {item.quantidadeSugerida} un.
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-emerald-800 shadow-sm">
                    Estoque sem reposição urgente no fechamento atual.
                  </div>
                )}

                {alertasCriticos.length > 0 ? (
                  <div className="rounded-xl border border-red-100 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-red-800">Priorizar alertas críticos</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {alertasCriticos.slice(0, 2).map((alerta) => alerta.titulo).join("; ")}
                    </p>
                  </div>
                ) : alertasAbertos.length > 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-amber-800">Acompanhar alertas pendentes</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {alertasAbertos.length} ocorrência(s) ainda abertas.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-100 bg-white p-3 text-sm text-emerald-800 shadow-sm">
                    Sem alertas pendentes no fechamento.
                  </div>
                )}

                <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Ação recomendada</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Conferir reposição, validar perdas registradas e manter acompanhamento das rotinas automáticas de energia e estoque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
