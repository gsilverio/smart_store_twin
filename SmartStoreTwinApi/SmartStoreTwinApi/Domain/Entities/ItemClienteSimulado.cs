namespace SmartStoreTwinApi.Domain.Entities;

public class ItemClienteSimulado
{
    public Guid ClienteSimuladoId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProdutoId { get; set; }

    public string ProdutoNome { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public int Quantidade { get; set; } = 1;

    public decimal ValorUnitario { get; set; }

    public decimal ValorTotal => Quantidade * ValorUnitario;
}
