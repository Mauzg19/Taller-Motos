package com.taller.taller_motos.model;

import jakarta.persistence.*;

@Entity
public class Referido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_referidor_id")
    private Cliente clienteReferidor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_referido_id")
    private Cliente clienteReferido;

    private Integer bonoPuntos; // points bonus for the referrer

    public Referido() {}

    public Referido(Cliente clienteReferidor, Cliente clienteReferido, Integer bonoPuntos) {
        this.clienteReferidor = clienteReferidor;
        this.clienteReferido = clienteReferido;
        this.bonoPuntos = bonoPuntos;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cliente getClienteReferidor() { return clienteReferidor; }
    public void setClienteReferidor(Cliente clienteReferidor) { this.clienteReferidor = clienteReferidor; }
    public Cliente getClienteReferido() { return clienteReferido; }
    public void setClienteReferido(Cliente clienteReferido) { this.clienteReferido = clienteReferido; }
    public Integer getBonoPuntos() { return bonoPuntos; }
    public void setBonoPuntos(Integer bonoPuntos) { this.bonoPuntos = bonoPuntos; }
}
