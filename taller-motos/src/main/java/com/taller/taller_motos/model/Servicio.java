package com.taller.taller_motos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Servicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Integer tiempoEstimado; // in minutes
    private Integer tiempoReal; // in minutes
    private Double costoManoObra = 0.0;

    private Integer garantiaDuracion; // in months
    private LocalDate garantiaInicio;

    private boolean requiereAutorizacion = false;
    private Boolean autorizado = null;

    @Enumerated(EnumType.STRING)
    private EstadoServicio estado = EstadoServicio.PENDIENTE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    @JsonIgnore
    private Usuario tecnico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    @JsonIgnore
    private Orden orden;

    public Servicio() {}

    public Servicio(String nombre, String descripcion, Integer tiempoEstimado, Double costoManoObra) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.tiempoEstimado = tiempoEstimado;
        this.costoManoObra = costoManoObra;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Integer getTiempoEstimado() { return tiempoEstimado; }
    public void setTiempoEstimado(Integer tiempoEstimado) { this.tiempoEstimado = tiempoEstimado; }
    public Integer getTiempoReal() { return tiempoReal; }
    public void setTiempoReal(Integer tiempoReal) { this.tiempoReal = tiempoReal; }
    public Double getCostoManoObra() { return costoManoObra; }
    public void setCostoManoObra(Double costoManoObra) { this.costoManoObra = costoManoObra; }
    public Usuario getTecnico() { return tecnico; }
    public void setTecnico(Usuario tecnico) { this.tecnico = tecnico; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }

    public boolean isRequiereAutorizacion() { return requiereAutorizacion; }
    public void setRequiereAutorizacion(boolean requiereAutorizacion) { this.requiereAutorizacion = requiereAutorizacion; }
    public Boolean getAutorizado() { return autorizado; }
    public void setAutorizado(Boolean autorizado) { this.autorizado = autorizado; }
    public EstadoServicio getEstado() { return estado; }
    public void setEstado(EstadoServicio estado) { this.estado = estado; }

    public Integer getGarantiaDuracion() { return garantiaDuracion; }
    public void setGarantiaDuracion(Integer garantiaDuracion) { this.garantiaDuracion = garantiaDuracion; }

    public LocalDate getGarantiaInicio() { return garantiaInicio; }
    public void setGarantiaInicio(LocalDate garantiaInicio) { this.garantiaInicio = garantiaInicio; }
}

