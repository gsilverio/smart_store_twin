using SmartStoreTwinApi.Domain.Enums;

namespace SmartStoreTwinApi.Domain.Entities;

public class AlertaLoja
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Titulo { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public SeveridadeAlerta Severidade { get; set; }

    public StatusAlerta Status { get; set; } = StatusAlerta.Aberto;

    public Guid? ZonaId { get; set; }

    public string? Recomendacao { get; set; }

    public decimal? ImpactoFinanceiroEstimado { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvidoEm { get; set; }
}
