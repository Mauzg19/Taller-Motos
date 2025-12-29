package com.taller.taller_motos.model;

import jakarta.persistence.*;

@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // can be email or unique username

    @Column(nullable = false)
    private String password;

    private String nombre;
    private String email;
    private String telefono;

    @Enumerated(EnumType.STRING)
    private Role role;

    public Usuario() {}

    public Usuario(String username, String password, String nombre, String email, Role role) {
        this.username = username;
        this.password = password;
        this.nombre = nombre;
        this.email = email;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
