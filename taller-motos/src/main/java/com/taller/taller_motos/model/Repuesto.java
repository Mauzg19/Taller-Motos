package com.taller.taller_motos.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Repuesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Integer cantidad = 1;
    private Double precio = 0.0; // precio al cliente

    private String categoria;
    private String codigoInterno;
    private String codigoProveedor;
    private Double costoCompra = 0.0;
    private Integer stockActual = 0;
    private Integer stockMinimo = 5; // default alert threshold

    private Integer garantiaDuracion; // in months
    private LocalDate garantiaInicio;

    @ElementCollection
    private List<String> fotos = new ArrayList<>(); // URLs or paths to photos/invoices

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;

    public Repuesto() {}

    public Repuesto(String nombre, Integer cantidad, Double precio) {
        this.nombre = nombre;
        this.cantidad = cantidad;
        this.precio = precio;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getCodigoInterno() { return codigoInterno; }
    public void setCodigoInterno(String codigoInterno) { this.codigoInterno = codigoInterno; }
    public String getCodigoProveedor() { return codigoProveedor; }
    public void setCodigoProveedor(String codigoProveedor) { this.codigoProveedor = codigoProveedor; }
    public Double getCostoCompra() { return costoCompra; }
    public void setCostoCompra(Double costoCompra) { this.costoCompra = costoCompra; }
    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    public List<String> getFotos() { return fotos; }
    public void setFotos(List<String> fotos) { this.fotos = fotos; }
    public Orden getOrden() { return orden; }
    public void setOrden(Orden orden) { this.orden = orden; }
    public Integer getGarantiaDuracion() { return garantiaDuracion; }
    public void setGarantiaDuracion(Integer garantiaDuracion) { this.garantiaDuracion = garantiaDuracion; }
    public LocalDate getGarantiaInicio() { return garantiaInicio; }
    public void setGarantiaInicio(LocalDate garantiaInicio) { this.garantiaInicio = garantiaInicio; }
}
