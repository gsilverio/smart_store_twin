import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BatteryCharging,
  CircleDollarSign,
  PackageCheck,
  PlayCircle,
  Users,
} from "lucide-react";

import {
  acionarAtuador,
  executarTickSimulacao,
  gerarRelatorioFechamentoDia,
  iniciarSimulacao,
  obterEstadoGemeo,
  pararSimulacao,
  registrarLeituraSensor,
  reiniciarGemeo,
  resolverAlerta,
  simularCenario,
} from "./api/gemeoDigitalApi";

import { ControleSimulacao } from "./components/ControleSimulacao";
import { LinhaDoTempo } from "./components/LinhaDoTempo";
import { Loja2D } from "./components/Loja2D";
import { NavegacaoGemeo, type VisaoGemeo } from "./components/NavegacaoGemeo";
import { PainelAlertas } from "./components/PainelAlertas";
import { PainelAtuadores } from "./components/PainelAtuadores";
import { PainelCenarios } from "./components/PainelCenarios";
import { PainelDiagnostico } from "./components/PainelDiagnostico";
import { PainelEstoqueInteligente } from "./components/PainelEstoqueInteligente";
import { PainelFluxoDadosAmbiente } from "./components/PainelFluxoDadosAmbiente";
import { PainelLeiturasSensores } from "./components/PainelLeiturasSensores";
import { PainelRelatorioGerencial } from "./components/PainelRelatorioGerencial";
import { PainelRotinasAutomaticas } from "./components/PainelRotinasAutomaticas";
import { PainelSensores } from "./components/PainelSensores";
import type { EstadoGemeoDigital } from "./types/gemeoDigital";

function formatarMoeda(valor: number) {
  return `R$ ${valor.toFixed(2)}`;
}

function StatusPill({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function App() {
  const [estado, setEstado] = useState<EstadoGemeoDigital | null>(null);
  const [visaoAtiva, setVisaoAtiva] = useState<VisaoGemeo>("simulacro");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const tickEmAndamento = useRef(false);

  async function executarAcao(
    acao: () => Promise<EstadoGemeoDigital>,
    mensagemErro: string,
  ) {
    try {
      setCarregando(true);
      setErro(null);

      const data = await acao();
      setEstado(data);
    } catch {
      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  function handleSimular(cenario: string) {
    executarAcao(
      () => simularCenario(cenario),
      "Não foi possível simular o cenário selecionado.",
    );
  }

  function handleReiniciar() {
    executarAcao(() => reiniciarGemeo(), "Não foi possível reiniciar o gêmeo digital.");
  }

  function handleAcionarAtuador(atuadorId: string, acao: string) {
    executarAcao(
      () => acionarAtuador(atuadorId, acao),
      "Não foi possível acionar o atuador.",
    );
  }

  function handleResolverAlerta(alertaId: string) {
    executarAcao(
      () => resolverAlerta(alertaId),
      "Não foi possível resolver o alerta.",
    );
  }

  function handleRegistrarLeituraSensor(
    sensorId: string,
    valor: number,
    observacao?: string,
  ) {
    executarAcao(
      () => registrarLeituraSensor(sensorId, valor, observacao),
      "Não foi possível registrar a leitura do sensor.",
    );
  }

  function handleIniciarSimulacao() {
    executarAcao(
      () => iniciarSimulacao(),
      "Não foi possível iniciar a operação live.",
    );
  }

  function handlePararSimulacao() {
    executarAcao(
      () => pararSimulacao(),
      "Não foi possível pausar a operação live.",
    );
  }

  function handleTickManual() {
    executarAcao(
      () => executarTickSimulacao(),
      "Não foi possível avançar o ciclo da loja.",
    );
  }

  function handleGerarRelatorio() {
    executarAcao(
      () => gerarRelatorioFechamentoDia(),
      "Não foi possível gerar o relatório gerencial do dia.",
    );
  }

  useEffect(() => {
    let cancelado = false;

    async function carregarEstadoInicial() {
      try {
        setErro(null);
        const data = await obterEstadoGemeo();

        if (!cancelado) setEstado(data);
      } catch {
        if (!cancelado) {
          setErro("Não foi possível carregar o estado do gêmeo digital.");
        }
      }
    }

    carregarEstadoInicial();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!estado?.simulacaoAtiva) return;

    let cancelado = false;

    const intervalo = window.setInterval(async () => {
      if (tickEmAndamento.current || cancelado || document.hidden) return;

      try {
        tickEmAndamento.current = true;
        const data = await executarTickSimulacao();

        if (!cancelado) setEstado(data);
      } catch {
        if (!cancelado) setErro("A operação live falhou ao avançar um ciclo.");
      } finally {
        tickEmAndamento.current = false;
      }
    }, 2600);

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
    };
  }, [estado?.simulacaoAtiva]);

  if (!estado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-white">Carregando gêmeo digital...</p>
          <p className="mt-2 text-sm text-slate-400">
            Verifique se o backend está rodando.
          </p>
          {erro && (
            <p className="mt-3 rounded-2xl border border-red-900 bg-red-950 p-3 text-sm text-red-200">
              {erro}
            </p>
          )}
        </div>
      </main>
    );
  }

  const alertasAbertos = estado.alertas.filter((alerta) => alerta.status !== "Resolvido");
  const clientesAtivos = estado.clientesSimulados.filter((cliente) => cliente.etapa !== "Finalizado");

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-950 px-4 py-5 text-white md:px-6">
        <div className="mx-auto max-w-[1900px] space-y-5">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
                  Gêmeo Digital Operacional
                </p>
                {estado.simulacaoAtiva ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    <PlayCircle size={14} /> Live no tick #{estado.tickAtual}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                    Operação pausada
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold md:text-3xl">{estado.nomeLoja}</h1>
              <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">
                Loja autônoma monitorada por sensores, estoque inteligente, rotinas automáticas, atuadores e relatório gerencial.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatusPill label="Saúde" value={`${estado.saudeOperacional}%`} icon={<Activity size={18} />} />
              <StatusPill label="Fluxo" value={`${estado.pessoasNaLoja}/${estado.capacidadeRecomendada}`} icon={<Users size={18} />} />
              <StatusPill label="Energia" value={`${estado.consumoEnergiaTotalKwh.toFixed(1)} kWh`} icon={<BatteryCharging size={18} />} />
              <StatusPill label="Perda" value={formatarMoeda(estado.perdaFinanceiraEstimada)} icon={<CircleDollarSign size={18} />} />
              <StatusPill label="Vendas" value={`${estado.produtosVendidosHoje ?? 0}`} icon={<PackageCheck size={18} />} />
              <StatusPill label="Economia" value={`${(estado.economiaEnergiaEstimadaKwh ?? 0).toFixed(2)} kWh`} icon={<BatteryCharging size={18} />} />
            </div>
          </div>

          {erro && (
            <div className="rounded-2xl border border-red-800 bg-red-950/70 p-3 text-sm text-red-200">
              {erro}
            </div>
          )}
        </div>
      </header>

      <NavegacaoGemeo visaoAtiva={visaoAtiva} onAlterarVisao={setVisaoAtiva} />

      <div className="mx-auto max-w-[1900px] p-4 md:p-6">
        {visaoAtiva === "simulacro" && (
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_430px]">
            <div className="space-y-5">
              <Loja2D
                zonas={estado.zonas}
                atuadores={estado.atuadores}
                clientes={estado.clientesSimulados}
                simulacaoAtiva={estado.simulacaoAtiva}
              />

              <ControleSimulacao
                simulacaoAtiva={estado.simulacaoAtiva}
                tickAtual={estado.tickAtual}
                ultimoTickEm={estado.ultimoTickEm}
                clientesAtivos={clientesAtivos.length}
                carregando={carregando}
                onIniciar={handleIniciarSimulacao}
                onParar={handlePararSimulacao}
                onTick={handleTickManual}
                onReiniciar={handleReiniciar}
              />
            </div>

            <aside className="space-y-5 2xl:sticky 2xl:top-6 2xl:h-fit">
              <PainelDiagnostico estado={estado} />
              <PainelCenarios carregando={carregando} onSimular={handleSimular} onReiniciar={handleReiniciar} />
              <PainelAlertas alertas={estado.alertas} carregando={carregando} onResolver={handleResolverAlerta} />
            </aside>
          </section>
        )}

        {visaoAtiva === "fluxo-dados" && (
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="space-y-5">
              <PainelFluxoDadosAmbiente leituras={estado.leiturasSensores ?? []} />
              <PainelLeiturasSensores leituras={estado.leiturasSensores ?? []} />
            </div>

            <aside className="2xl:sticky 2xl:top-6 2xl:h-fit">
              <PainelSensores
                sensores={estado.sensores}
                zonas={estado.zonas}
                carregando={carregando}
                onRegistrarLeitura={handleRegistrarLeituraSensor}
              />
            </aside>
          </section>
        )}

        {visaoAtiva === "estoque" && (
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_430px]">
            <PainelEstoqueInteligente produtos={estado.produtosOperacionais ?? []} />
            <aside className="space-y-5 2xl:sticky 2xl:top-6 2xl:h-fit">
              <PainelDiagnostico estado={estado} />
              <PainelRotinasAutomaticas rotinas={estado.rotinasAutomaticas ?? []} />
            </aside>
          </section>
        )}

        {visaoAtiva === "decisoes" && (
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <div className="space-y-5">
              <PainelRotinasAutomaticas rotinas={estado.rotinasAutomaticas ?? []} />
              <PainelAtuadores atuadores={estado.atuadores} carregando={carregando} onAcionar={handleAcionarAtuador} />
            </div>

            <aside className="space-y-5 2xl:sticky 2xl:top-6 2xl:h-fit">
              <PainelDiagnostico estado={estado} />
              <PainelAlertas alertas={estado.alertas} carregando={carregando} onResolver={handleResolverAlerta} />
            </aside>
          </section>
        )}

        {visaoAtiva === "relatorio" && (
          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_460px]">
            <PainelRelatorioGerencial
              relatorio={estado.relatorioGerencial}
              carregando={carregando}
              onGerarRelatorio={handleGerarRelatorio}
              alertas={estado.alertas}
              rotinas={estado.rotinasAutomaticas ?? []}
              eventos={estado.linhaDoTempo}
            />
            <aside className="2xl:sticky 2xl:top-6 2xl:h-fit">
              <LinhaDoTempo eventos={estado.linhaDoTempo} />
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
