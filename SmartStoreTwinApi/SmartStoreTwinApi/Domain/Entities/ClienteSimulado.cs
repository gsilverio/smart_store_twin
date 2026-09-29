namespace SmartStoreTwinApi.Domain.Entities;

public class ClienteSimulado
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Codigo { get; set; } = string.Empty;

    public string Nome { get; set; } = string.Empty;

    public string Etapa { get; set; } = "Entrada";

    public string Status { get; set; } = "Entrando na loja";

    public Guid? ZonaAtualId { get; set; }

    public string? ZonaAtualNome { get; set; }

    public int BebidasSelecionadas { get; set; }

    public int SnacksSelecionados { get; set; }

    public int RefrigeradosSelecionados { get; set; }

    public int TotalProdutosSelecionados => BebidasSelecionadas + SnacksSelecionados + RefrigeradosSelecionados;

    public List<ItemClienteSimulado> Itens { get; set; } = new();

    public decimal ValorCarrinho { get; set; }

    public bool PagamentoConcluido { get; set; }

    public bool PossuiDivergencia { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
