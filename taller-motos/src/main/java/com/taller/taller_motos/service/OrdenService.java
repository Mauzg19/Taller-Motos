package com.taller.taller_motos.service;

import com.taller.taller_motos.model.AuthorizationRequest;
import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.model.EstadoOrden;
import com.taller.taller_motos.model.EstadoServicio;
import com.taller.taller_motos.model.Moto;
import com.taller.taller_motos.model.Repuesto;
import com.taller.taller_motos.model.Servicio;
import com.taller.taller_motos.model.Role;
import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.repository.OrdenRepository;
import com.taller.taller_motos.service.AuthorizationService;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final List<EmitterHolder> emitters = new ArrayList<>();
    private final List<ClientEmitterHolder> clientEmitters = new ArrayList<>();

    private final NotificationService notificationService;
    private final AuthorizationService authorizationService;

    public OrdenService(OrdenRepository ordenRepository, NotificationService notificationService, AuthorizationService authorizationService) {
        this.ordenRepository = ordenRepository;
        this.notificationService = notificationService;
        this.authorizationService = authorizationService;
    }

    public List<Orden> listAll() {
        return ordenRepository.findAll();
    }

    public Orden create(Orden orden) {
        if (orden.getNumeroOrden() == null || orden.getNumeroOrden().isEmpty()) {
            orden.setNumeroOrden(UUID.randomUUID().toString());
        }
        var saved = ordenRepository.save(orden);
        sendUpdate(saved);
        // Notify customer that the bike has entered the workshop
        try { notificationService.notifyOrderReceived(saved); } catch (Exception ignored) {}
        return saved;
    }

    public List<Orden> findByClienteAndMoto(Cliente cliente, Moto moto) {
        return ordenRepository.findByClienteAndMoto(cliente, moto);
    }

    public Optional<Orden> findById(Long id) {
        return ordenRepository.findById(id);
    }

    public Optional<Orden> findByNumeroOrden(String numeroOrden) {
        return ordenRepository.findByNumeroOrden(numeroOrden);
    }

    public Optional<Orden> updateEstado(Long id, EstadoOrden estado) {
        Optional<Orden> o = ordenRepository.findById(id);
        if (o.isPresent()) {
            Orden orden = o.get();
            EstadoOrden previousEstado = orden.getEstado();
            orden.setEstado(estado);
            var saved = ordenRepository.save(orden);
            // Award points if order is completed (ENTREGADO)
            if (estado == EstadoOrden.ENTREGADO && previousEstado != EstadoOrden.ENTREGADO) {
                int puntos = calculatePuntos(saved);
                if (saved.getCliente() != null) {
                    saved.getCliente().setPuntos(saved.getCliente().getPuntos() + puntos);
                    saved.setPuntosOtorgados(puntos);
                    ordenRepository.save(saved);
                }
                double total = calculateTotalCost(saved);
                try { notificationService.notifyOrderCompleted(saved, total); } catch (Exception ignored) {}
                broadcastNotification("Orden finalizada. Costo total: " + total, saved.getCliente() != null ? saved.getCliente().getEmail() : null, Role.CLIENTE);
            }
            sendUpdate(saved);
            return Optional.of(saved);
        }
        return Optional.empty();
    }

    public SseEmitter registerEmitter(String username, String rolesCsv) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        EmitterHolder holder = new EmitterHolder(emitter, username, rolesCsv);
        emitters.add(holder);
        emitter.onTimeout(() -> emitters.remove(holder));
        emitter.onCompletion(() -> emitters.remove(holder));
        return emitter;
    }

    public Optional<Repuesto> addRepuesto(Long orderId, Repuesto repuesto) {
        Optional<Orden> o = ordenRepository.findById(orderId);
        if (o.isPresent()) {
            Orden orden = o.get();
            // Check warranty if present
            if (repuesto.getGarantiaInicio() != null && repuesto.getGarantiaDuracion() != null) {
                LocalDate warrantyEnd = repuesto.getGarantiaInicio().plusMonths(repuesto.getGarantiaDuracion());
                if (LocalDate.now().isAfter(warrantyEnd)) {
                    // Warranty expired, perhaps log or notify
                    // For now, just proceed
                }
            }
            // Check if authorization is needed for repuesto (e.g., price > 100)
            boolean requiresAuth = repuesto.getPrecio() != null && repuesto.getPrecio() > 100.0;
            if (requiresAuth) {
                String message = String.format("Se necesita autorización para cambiar el repuesto '%s' por valor de $%.2f", repuesto.getNombre(), repuesto.getPrecio());
                AuthorizationRequest authRequest = authorizationService.createAuthorizationRequest(orden, repuesto, message);
                try {
                    notificationService.notifyAuthorizationNeededRepuesto(orden, repuesto, authRequest.getId());
                    broadcastNotification(message, orden.getCliente() != null ? orden.getCliente().getEmail() : null, Role.CLIENTE);
                } catch (Exception ignored) {}
                // Do not add repuesto yet, wait for authorization
                return Optional.empty();
            } else {
                orden.addRepuesto(repuesto);
                Orden saved = ordenRepository.save(orden);
                sendUpdate(saved);
                // notify client that a part was added
                try { notificationService.notifyRepuestoAdded(saved, repuesto); broadcastNotification("Repuesto agregado: " + repuesto.getNombre(), saved.getCliente() != null ? saved.getCliente().getEmail() : null, Role.CLIENTE); } catch (Exception ignored) {}
                return Optional.of(repuesto);
            }
        }
        return Optional.empty();
    }

    public Optional<Servicio> addServicio(Long orderId, Servicio servicio) {
        Optional<Orden> o = ordenRepository.findById(orderId);
        if (o.isPresent()) {
            Orden orden = o.get();
            orden.addServicio(servicio);
            Orden saved = ordenRepository.save(orden);
            sendUpdate(saved);
            // if service requires authorization, notify client
            try {
                if (servicio.isRequiereAutorizacion() && (servicio.getAutorizado() == null || !servicio.getAutorizado())) {
                    notificationService.notifyAuthorizationNeeded(saved, servicio);
                    broadcastNotification("Se requiere autorización para el servicio: " + servicio.getNombre(), saved.getCliente() != null ? saved.getCliente().getEmail() : null, Role.CLIENTE);
                } else {
                    notificationService.notifyServicioUpdated(saved, servicio);
                    broadcastNotification("Servicio agregado: " + servicio.getNombre(), saved.getCliente() != null ? saved.getCliente().getEmail() : null, Role.CLIENTE);
                }
            } catch (Exception ignored) {}
            return Optional.of(servicio);
        }
        return Optional.empty();
    }

    private int calculatePuntos(Orden orden) {
        // Simple calculation: 10 points per service + 5 per part (null-safe)
        int serviciosCount = orden.getServicios() != null ? orden.getServicios().size() : 0;
        int repuestosCount = orden.getRepuestos() != null ? orden.getRepuestos().size() : 0;
        return serviciosCount * 10 + repuestosCount * 5;
    }

    private void sendUpdate(Orden orden) {
        List<EmitterHolder> deadEmitters = new ArrayList<>();
        for (EmitterHolder holder : emitters) {
            try {
                // roles that can receive all updates
                if (holder.hasAnyRole(Role.ADMIN, Role.RECEPCION, Role.TECNICO)) {
                    holder.emitter.send(SseEmitter.event().name("orden-update").data(orden));
                } else if (holder.hasRole(Role.CLIENTE)) {
                    if (orden.getCliente() != null && holder.username != null && holder.username.equalsIgnoreCase(orden.getCliente().getEmail())) {
                        holder.emitter.send(SseEmitter.event().name("orden-update").data(orden));
                    }
                }
            } catch (IOException e) {
                deadEmitters.add(holder);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public void broadcastNotification(String message, String usernameFilter, Role roleFilter) {
        List<EmitterHolder> deadEmitters = new ArrayList<>();
        for (EmitterHolder holder : emitters) {
            try {
                boolean send = false;
                if (roleFilter != null && holder.hasRole(roleFilter)) send = true;
                if (usernameFilter != null && holder.username != null && holder.username.equalsIgnoreCase(usernameFilter)) send = true;
                // if neither filter provided, send to all
                if (roleFilter == null && usernameFilter == null) send = true;
                if (send) holder.emitter.send(SseEmitter.event().name("notification").data(message));
            } catch (IOException e) {
                deadEmitters.add(holder);
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public Optional<Servicio> authorizeServicio(Long orderId, Long servicioId, boolean autorizado) {
        Optional<Orden> o = ordenRepository.findById(orderId);
        if (o.isPresent()) {
            Orden orden = o.get();
            for (Servicio s : orden.getServicios()) {
                if (s.getId() != null && s.getId().equals(servicioId)) {
                    s.setAutorizado(autorizado);
                    Orden saved = ordenRepository.save(orden);
                    sendUpdate(saved);
                    try { notificationService.notifyServicioUpdated(saved, s); } catch (Exception ignored) {}
                    broadcastNotification("Servicio autorizado: " + s.getNombre(), orden.getCliente() != null ? orden.getCliente().getEmail() : null, Role.CLIENTE);
                    return Optional.of(s);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Servicio> updateServicioEstado(Long orderId, Long servicioId, EstadoServicio estado) {
        Optional<Orden> o = ordenRepository.findById(orderId);
        if (o.isPresent()) {
            Orden orden = o.get();
            for (Servicio s : orden.getServicios()) {
                if (s.getId() != null && s.getId().equals(servicioId)) {
                    s.setEstado(estado);
                    Orden saved = ordenRepository.save(orden);
                    sendUpdate(saved);
                    try { notificationService.notifyServicioUpdated(saved, s); } catch (Exception ignored) {}
                    broadcastNotification("Estado del servicio '" + s.getNombre() + "' actualizado a " + estado, orden.getCliente() != null ? orden.getCliente().getEmail() : null, Role.CLIENTE);
                    return Optional.of(s);
                }
            }
        }
        return Optional.empty();
    }

    public Optional<Repuesto> authorizeRepuesto(Long authRequestId, boolean autorizado) {
        Optional<AuthorizationRequest> optAuth = authorizationService.findById(authRequestId);
        if (optAuth.isPresent()) {
            AuthorizationRequest authRequest = optAuth.get();
            if (autorizado) {
                authorizationService.acceptAuthorization(authRequestId);
                // Now add the repuesto to the order
                if (authRequest.getOrden() == null || authRequest.getOrden().getId() == null) return Optional.empty();
                Optional<Orden> o = ordenRepository.findById(authRequest.getOrden().getId());
                if (o.isPresent()) {
                    Orden orden = o.get();
                    orden.addRepuesto(authRequest.getRepuesto());
                    Orden saved = ordenRepository.save(orden);
                    sendUpdate(saved);
                    try { notificationService.notifyRepuestoAdded(saved, authRequest.getRepuesto()); } catch (Exception ignored) {}
                    broadcastNotification("Repuesto autorizado y agregado: " + authRequest.getRepuesto().getNombre(), orden.getCliente() != null ? orden.getCliente().getEmail() : null, Role.CLIENTE);
                    return Optional.of(authRequest.getRepuesto());
                }
            } else {
                authorizationService.rejectAuthorization(authRequestId);
                broadcastNotification("Repuesto rechazado: " + authRequest.getRepuesto().getNombre(), authRequest.getOrden() != null && authRequest.getOrden().getCliente() != null ? authRequest.getOrden().getCliente().getEmail() : null, Role.CLIENTE);
            }
        }
        return Optional.empty();
    }

    private double calculateTotalCost(Orden orden) {
        double total = 0.0;
        if (orden.getServicios() != null) {
            for (Servicio s : orden.getServicios()) {
                if (s.getCostoManoObra() != null) total += s.getCostoManoObra();
            }
        }
        if (orden.getRepuestos() != null) {
            for (Repuesto r : orden.getRepuestos()) {
                if (r.getPrecio() != null && r.getCantidad() != null) total += r.getPrecio() * r.getCantidad();
            }
        }
        return total;
    }

    public List<String> getHistorialActualizaciones(Long ordenId) {
        // Simple implementation - in a real app this would be stored in a separate table
        // For now, return a basic list of updates
        List<String> historial = new ArrayList<>();
        historial.add("Orden creada: " + java.time.LocalDateTime.now());
        historial.add("Diagnóstico inicial completado");
        return historial;
    }

    public SseEmitter registerClientEmitter(String numeroOrden) {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        ClientEmitterHolder holder = new ClientEmitterHolder(emitter, numeroOrden);
        clientEmitters.add(holder);
        emitter.onTimeout(() -> clientEmitters.remove(holder));
        emitter.onCompletion(() -> clientEmitters.remove(holder));
        return emitter;
    }

    private static class EmitterHolder {
        private final SseEmitter emitter;
        private final String username;
        private final List<Role> roles = new ArrayList<>();

        public EmitterHolder(SseEmitter emitter, String username, String rolesCsv) {
            this.emitter = emitter;
            this.username = username;
            if (rolesCsv != null && !rolesCsv.isEmpty()) {
                for (String r : rolesCsv.split(",")) {
                    try {
                        roles.add(Role.valueOf(r.trim()));
                    } catch (Exception ignored) {}
                }
            }
        }

        public boolean hasRole(Role r) {
            return roles.contains(r);
        }

        public boolean hasAnyRole(Role... rs) {
            for (Role r : rs) if (roles.contains(r)) return true;
            return false;
        }
    }

    private static class ClientEmitterHolder {
        private final SseEmitter emitter;
        private final String numeroOrden;

        public ClientEmitterHolder(SseEmitter emitter, String numeroOrden) {
            this.emitter = emitter;
            this.numeroOrden = numeroOrden;
        }

        public SseEmitter getEmitter() {
            return emitter;
        }

        public String getNumeroOrden() {
            return numeroOrden;
        }
    }
}
