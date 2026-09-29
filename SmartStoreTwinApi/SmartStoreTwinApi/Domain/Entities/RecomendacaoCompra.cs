namespace SmartStoreTwinApi.Domain.Entities;

public class RecomendacaoCompra
{
    public Guid RelatorioGerencialDiaId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Produto { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public int EstoqueAtual { get; set; }

    public int EstoqueMinimo { get; set; }

    public int QuantidadeSugerida { get; set; }

    public string Motivo { get; set; } = string.Empty;

    public decimal CustoEstimado { get; set; }
}
