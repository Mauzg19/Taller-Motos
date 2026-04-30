package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.EstadoOrden;
import com.taller.taller_motos.model.Repuesto;
import com.taller.taller_motos.model.Servicio;
import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.service.OrdenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    @Autowired
    private OrdenService ordenService;

    @GetMapping
    public List<Orden> listAll() {
        return ordenService.listAll();
    }

    @PostMapping
    public Orden create(@RequestBody Orden orden) {
        return ordenService.create(orden);
    }

    @GetMapping("/{id}")
    public Optional<Orden> findById(@PathVariable Long id) {
        return ordenService.findById(id);
    }

    @PutMapping("/{id}/status")
    public Optional<Orden> updateEstado(@PathVariable Long id, @RequestBody EstadoOrden estado) {
        return ordenService.updateEstado(id, estado);
    }

    @PostMapping("/{orderId}/repuestos")
    public Optional<Repuesto> addRepuesto(@PathVariable Long orderId, @RequestBody Repuesto repuesto) {
        return ordenService.addRepuesto(orderId, repuesto);
    }

    @PostMapping("/{orderId}/servicios")
    public Optional<Servicio> addServicio(@PathVariable Long orderId, @RequestBody Servicio servicio) {
        return ordenService.addServicio(orderId, servicio);
    }

    @PutMapping("/{orderId}/servicios/{servicioId}/autorizar")
    public Optional<Servicio> autorizarServicio(@PathVariable Long orderId, @PathVariable Long servicioId, @RequestParam boolean autorizado) {
        return ordenService.authorizeServicio(orderId, servicioId, autorizado);
    }

    @PutMapping("/repuestos/autorizar/{authRequestId}")
    public Optional<Repuesto> autorizarRepuesto(@PathVariable Long authRequestId, @RequestParam boolean autorizado) {
        return ordenService.authorizeRepuesto(authRequestId, autorizado);
    }

    @PutMapping("/{orderId}/servicios/{servicioId}/estado")
    public Optional<Servicio> updateServicioEstado(@PathVariable Long orderId, @PathVariable Long servicioId, @RequestBody com.taller.taller_motos.model.EstadoServicio estado) {
        return ordenService.updateServicioEstado(orderId, servicioId, estado);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamUpdates(@RequestParam String user, @RequestParam String roles) {
        return ordenService.registerEmitter(user, roles);
    }

    @GetMapping("/numero/{numeroOrden}")
    public Optional<Orden> findByNumeroOrden(@PathVariable String numeroOrden) {
        return ordenService.findByNumeroOrden(numeroOrden);
    }

    @GetMapping("/{id}/historial")
    public List<String> getHistorial(@PathVariable Long id) {
        return ordenService.getHistorialActualizaciones(id);
    }

    @GetMapping(value = "/client-stream/{numeroOrden}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamForClient(@PathVariable String numeroOrden) {
        return ordenService.registerClientEmitter(numeroOrden);
    }
}
