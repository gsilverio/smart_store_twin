namespace SmartStoreTwinApi.Domain.Entities;

public class RotinaAutomatica
{
    public Guid EstadoGemeoDigitalId { get; set; }

    public Guid Id { get; set; } = Guid.NewGuid();

    public string Nome { get; set; } = string.Empty;

    public string Descricao { get; set; } = string.Empty;

    public bool Ativa { get; set; } = true;

    public string Status { get; set; } = "Aguardando dados";

    public string? Resultado { get; set; }

    public string? AcaoExecutada { get; set; }

    public decimal EconomiaEnergiaEstimadaKwh { get; set; }

    public DateTime? UltimaExecucaoEm { get; set; }
}
