package com.taller.taller_motos.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    private Double descuento; // percentage, e.g., 10.0 for 10%
    private LocalDate validoHasta;
    private Boolean usado = false;

    public Cupon() {}

    public Cupon(Cliente cliente, Double descuento, LocalDate validoHasta) {
        this.cliente = cliente;
        this.descuento = descuento;
        this.validoHasta = validoHasta;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public Double getDescuento() { return descuento; }
    public void setDescuento(Double descuento) { this.descuento = descuento; }
    public LocalDate getValidoHasta() { return validoHasta; }
    public void setValidoHasta(LocalDate validoHasta) { this.validoHasta = validoHasta; }
    public Boolean getUsado() { return usado; }
    public void setUsado(Boolean usado) { this.usado = usado; }
}
