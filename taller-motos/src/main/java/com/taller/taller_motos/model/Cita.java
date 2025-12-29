package com.taller.taller_motos.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Cita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private LocalTime hora;
    private String cliente; // nombre del cliente
    private String servicio; // descripcion del servicio

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tecnico_id")
    private Usuario tecnico;

    @Enumerated(EnumType.STRING)
    private EstadoCita estado = EstadoCita.PENDIENTE;

    @ElementCollection
    private List<String> recordatorios = new ArrayList<>(); // e.g., email, SMS

    public Cita() {}

    public Cita(LocalDate fecha, LocalTime hora, String cliente, String servicio, Usuario tecnico) {
        this.fecha = fecha;
        this.hora = hora;
        this.cliente = cliente;
        this.servicio = servicio;
        this.tecnico = tecnico;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public String getServicio() { return servicio; }
    public void setServicio(String servicio) { this.servicio = servicio; }
    public Usuario getTecnico() { return tecnico; }
    public void setTecnico(Usuario tecnico) { this.tecnico = tecnico; }
    public EstadoCita getEstado() { return estado; }
    public void setEstado(EstadoCita estado) { this.estado = estado; }
    public List<String> getRecordatorios() { return recordatorios; }
    public void setRecordatorios(List<String> recordatorios) { this.recordatorios = recordatorios; }
}
