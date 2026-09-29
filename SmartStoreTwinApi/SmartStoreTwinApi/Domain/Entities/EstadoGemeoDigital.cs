namespace SmartStoreTwinApi.Domain.Entities;

public class EstadoGemeoDigital
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string NomeLoja { get; set; } = "Loja Autonoma 24h";

    public int SaudeOperacional { get; set; } = 100;

    public int PessoasNaLoja { get; set; }

    public int CapacidadeRecomendada { get; set; } = 12;

    public decimal ConsumoEnergiaTotalKwh { get; set; }

    public decimal PerdaFinanceiraEstimada { get; set; }

    public decimal ReceitaEstimadaHoje { get; set; }

    public int ProdutosVendidosHoje { get; set; }

    public decimal EconomiaEnergiaEstimadaKwh { get; set; }

    public decimal CustoEnergiaEstimadoHoje { get; set; }

    public bool SimulacaoAtiva { get; set; }

    public string PerfilSimulacao { get; set; } = "Operacao normal";

    public decimal MultiplicadorFluxo { get; set; } = 1m;

    public bool FalhaGeladeiraAtiva { get; set; }

    public bool CheckoutIndisponivel { get; set; }

    public bool PicoEnergiaAtivo { get; set; }

    public bool AltaDemandaBebidas { get; set; }

    public bool DivergenciaPagamentosAtiva { get; set; }

    public int TickAtual { get; set; }

    public DateTime? UltimoTickEm { get; set; }

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;

    public List<ZonaLoja> Zonas { get; set; } = new();

    public List<SensorLoja> Sensores { get; set; } = new();

    public List<AtuadorLoja> Atuadores { get; set; } = new();

    public List<AlertaLoja> Alertas { get; set; } = new();

    public List<ProdutoOperacional> ProdutosOperacionais { get; set; } = new();

    public List<LeituraSensorHistorico> LeiturasSensores { get; set; } = new();

    public List<RotinaAutomatica> RotinasAutomaticas { get; set; } = new();

    public RelatorioGerencialDia? RelatorioGerencial { get; set; }

    public List<ClienteSimulado> ClientesSimulados { get; set; } = new();

    public List<EventoLinhaDoTempo> LinhaDoTempo { get; set; } = new();
}
