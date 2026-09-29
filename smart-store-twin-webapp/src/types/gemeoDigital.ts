export type StatusZona =
  | "Normal"
  | "Atencao"
  | "Critico"
  | "Bloqueado"
  | "Manutencao"
  | "ModoEconomico";

export type TipoZona =
  | "Entrada"
  | "Prateleira"
  | "Geladeira"
  | "Checkout"
  | "Circulacao"
  | "PainelDigital";

export type SeveridadeAlerta = "Baixa" | "Media" | "Alta" | "Critica";

export type StatusAlerta = "Aberto" | "EmAnalise" | "Resolvido";

export interface ZonaLoja {
  id: string;
  nome: string;
  tipo: TipoZona;
  status: StatusZona;
  estoqueEsperado?: number | null;
  estoqueFisico?: number | null;
  temperaturaCelsius?: number | null;
  consumoEnergiaKwh?: number | null;
  quantidadePessoas: number;
  riscoAtual?: string | null;
  atualizadoEm: string;
}

export interface SensorLoja {
  id: string;
  nome: string;
  tipo: string;
  zonaId: string;
  ativo: boolean;
  confiabilidadePercentual: number;
  ultimaLeituraEm: string;
}

export interface AtuadorLoja {
  id: string;
  nome: string;
  tipo: string;
  zonaId: string;
  status: string;
  ultimaAcao?: string | null;
  ultimaAcaoEm?: string | null;
}

export interface AlertaLoja {
  id: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeAlerta;
  status: StatusAlerta;
  zonaId?: string | null;
  recomendacao?: string | null;
  impactoFinanceiroEstimado?: number | null;
  criadoEm: string;
  resolvidoEm?: string | null;
}

export interface EventoLinhaDoTempo {
  id: string;
  tipo: string;
  descricao: string;
  origem?: string | null;
  criadoEm: string;
}

export interface ItemClienteSimulado {
  produtoId: string;
  produtoNome: string;
  categoria: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface ClienteSimulado {
  id: string;
  codigo: string;
  nome: string;
  etapa: string;
  status: string;
  zonaAtualId?: string | null;
  zonaAtualNome?: string | null;
  bebidasSelecionadas: number;
  snacksSelecionados: number;
  refrigeradosSelecionados: number;
  totalProdutosSelecionados: number;
  itens: ItemClienteSimulado[];
  valorCarrinho: number;
  pagamentoConcluido: boolean;
  possuiDivergencia: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ProdutoOperacional {
  id: string;
  nome: string;
  categoria: string;
  zonaId: string;
  zonaNome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  precoVenda: number;
  custoReposicao: number;
  vendidosHoje: number;
  retiradosHoje: number;
  perdidosHoje: number;
  receitaHoje: number;
  perdaHoje: number;
  previsaoRupturaHoras?: number | null;
  sugestaoCompra: number;
  motivoSugestao?: string | null;
  atualizadoEm: string;
}

export interface LeituraSensorHistorico {
  id: string;
  sensorId: string;
  sensorNome: string;
  tipoSensor: string;
  zonaId: string;
  zonaNome: string;
  valor: number;
  unidade: string;
  observacao?: string | null;
  criadoEm: string;
}

export interface RotinaAutomatica {
  id: string;
  nome: string;
  descricao: string;
  ativa: boolean;
  status: string;
  resultado?: string | null;
  acaoExecutada?: string | null;
  economiaEnergiaEstimadaKwh: number;
  ultimaExecucaoEm?: string | null;
}

export interface RecomendacaoCompra {
  produto: string;
  categoria: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  quantidadeSugerida: number;
  motivo: string;
  custoEstimado: number;
}

export interface RelatorioGerencialDia {
  id: string;
  geradoEm: string;
  produtosVendidos: number;
  produtosRetirados: number;
  produtosPerdidos: number;
  receitaEstimada: number;
  perdaEstimada: number;
  consumoEnergiaKwh: number;
  custoEnergiaEstimado: number;
  economiaEnergiaEstimadaKwh: number;
  alertasAbertos: number;
  alertasCriticos: number;
  diagnostico: string;
  recomendacoesCompra: RecomendacaoCompra[];
}

export interface EstadoGemeoDigital {
  id: string;
  nomeLoja: string;
  saudeOperacional: number;
  pessoasNaLoja: number;
  capacidadeRecomendada: number;
  consumoEnergiaTotalKwh: number;
  perdaFinanceiraEstimada: number;
  receitaEstimadaHoje: number;
  produtosVendidosHoje: number;
  economiaEnergiaEstimadaKwh: number;
  custoEnergiaEstimadoHoje: number;
  simulacaoAtiva: boolean;
  tickAtual: number;
  ultimoTickEm?: string | null;
  atualizadoEm: string;
  zonas: ZonaLoja[];
  sensores: SensorLoja[];
  atuadores: AtuadorLoja[];
  alertas: AlertaLoja[];
  produtosOperacionais: ProdutoOperacional[];
  leiturasSensores: LeituraSensorHistorico[];
  rotinasAutomaticas: RotinaAutomatica[];
  relatorioGerencial?: RelatorioGerencialDia | null;
  clientesSimulados: ClienteSimulado[];
  linhaDoTempo: EventoLinhaDoTempo[];
}
