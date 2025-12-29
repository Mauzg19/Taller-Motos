package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.EstadoOrden;
import com.taller.taller_motos.model.EstadoServicio;
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
public class OrdersController {

    @Autowired
    private OrdenService ordenService;

    @GetMapping("/api/orders")
    public List<Orden> listAll() {
        return ordenService.listAll();
    }

    @PostMapping("/api/orders")
    public Orden create(@RequestBody Orden orden) {
        return ordenService.create(orden);
    }

    @GetMapping("/api/orders/{id}")
    public Optional<Orden> findById(@PathVariable Long id) {
        return ordenService.findById(id);
    }

    @PutMapping("/api/orders/{id}/status")
    public Optional<Orden> updateEstado(@PathVariable Long id, @RequestBody EstadoOrden estado) {
        return ordenService.updateEstado(id, estado);
    }

    @PostMapping("/api/orders/{orderId}/parts")
    public Optional<Repuesto> addRepuesto(@PathVariable Long orderId, @RequestBody Repuesto repuesto) {
        return ordenService.addRepuesto(orderId, repuesto);
    }

    @PostMapping("/api/orders/{orderId}/services")
    public Optional<Servicio> addServicio(@PathVariable Long orderId, @RequestBody Servicio servicio) {
        return ordenService.addServicio(orderId, servicio);
    }

    @PutMapping("/api/orders/{orderId}/services/{servicioId}/authorize")
    public Optional<Servicio> autorizarServicio(@PathVariable Long orderId, @PathVariable Long servicioId, @RequestParam boolean autorizado) {
        return ordenService.authorizeServicio(orderId, servicioId, autorizado);
    }

    @PutMapping("/api/orders/{orderId}/services/{servicioId}/state")
    public Optional<Servicio> updateServicioEstado(@PathVariable Long orderId, @PathVariable Long servicioId, @RequestBody EstadoServicio estado) {
        return ordenService.updateServicioEstado(orderId, servicioId, estado);
    }

    @GetMapping(value = "/api/orders/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamUpdates(@RequestParam String user, @RequestParam String roles) {
        return ordenService.registerEmitter(user, roles);
    }
}
