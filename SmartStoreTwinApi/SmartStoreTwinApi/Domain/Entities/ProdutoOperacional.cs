namespace SmartStoreTwinApi.Domain.Entities;

public class ProdutoOperacional
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nome { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public Guid ZonaId { get; set; }

    public string ZonaNome { get; set; } = string.Empty;

    public int EstoqueAtual { get; set; }

    public int EstoqueMinimo { get; set; }

    public int EstoqueMaximo { get; set; }

    public decimal PrecoVenda { get; set; }

    public decimal CustoReposicao { get; set; }

    public int VendidosHoje { get; set; }

    public int RetiradosHoje { get; set; }

    public int PerdidosHoje { get; set; }

    public decimal ReceitaHoje => VendidosHoje * PrecoVenda;

    public decimal PerdaHoje => PerdidosHoje * PrecoVenda;

    public decimal? PrevisaoRupturaHoras { get; set; }

    public int SugestaoCompra { get; set; }

    public string? MotivoSugestao { get; set; }

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
