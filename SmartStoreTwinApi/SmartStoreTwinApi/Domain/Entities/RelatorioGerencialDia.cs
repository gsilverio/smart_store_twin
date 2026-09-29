namespace SmartStoreTwinApi.Domain.Entities;

public class RelatorioGerencialDia
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public DateTime GeradoEm { get; set; } = DateTime.UtcNow;

    public int ProdutosVendidos { get; set; }

    public int ProdutosRetirados { get; set; }

    public int ProdutosPerdidos { get; set; }

    public decimal ReceitaEstimada { get; set; }

    public decimal PerdaEstimada { get; set; }

    public decimal ConsumoEnergiaKwh { get; set; }

    public decimal CustoEnergiaEstimado { get; set; }

    public decimal EconomiaEnergiaEstimadaKwh { get; set; }

    public int AlertasAbertos { get; set; }

    public int AlertasCriticos { get; set; }

    public string Diagnostico { get; set; } = string.Empty;

    public List<RecomendacaoCompra> RecomendacoesCompra { get; set; } = new();
}
