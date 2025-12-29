package com.taller.taller_motos.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuthorizationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repuesto_id")
    private Repuesto repuesto;

    public AuthorizationRequest() {}

    public AuthorizationRequest(String message, Orden orden, Repuesto repuesto) {
        this.message = message;
        this.orden = orden;
        this.repuesto = repuesto;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }
    public Repuesto getRepuesto() { return repuesto; }
    public void setRepuesto(Repuesto repuesto) { this.repuesto = repuesto; }
}
