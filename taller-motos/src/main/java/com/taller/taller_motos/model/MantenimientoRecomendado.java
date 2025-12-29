package com.taller.taller_motos.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class MantenimientoRecomendado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "moto_id")
    private Moto moto;

    private String descripcion;
    private Integer kilometrajeRecomendado;
    private LocalDate fechaRecomendada;

    public MantenimientoRecomendado() {}

    public MantenimientoRecomendado(Moto moto, String descripcion, Integer kilometrajeRecomendado, LocalDate fechaRecomendada) {
        this.moto = moto;
        this.descripcion = descripcion;
        this.kilometrajeRecomendado = kilometrajeRecomendado;
        this.fechaRecomendada = fechaRecomendada;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Moto getMoto() { return moto; }
    public void setMoto(Moto moto) { this.moto = moto; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getKilometrajeRecomendado() { return kilometrajeRecomendado; }
    public void setKilometrajeRecomendado(Integer kilometrajeRecomendado) { this.kilometrajeRecomendado = kilometrajeRecomendado; }
    public LocalDate getFechaRecomendada() { return fechaRecomendada; }
    public void setFechaRecomendada(LocalDate fechaRecomendada) { this.fechaRecomendada = fechaRecomendada; }
}
