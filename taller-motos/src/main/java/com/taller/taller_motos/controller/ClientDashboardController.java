package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.service.OrdenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/client")
public class ClientDashboardController {

    @Autowired
    private OrdenService ordenService;

    @GetMapping("/dashboard/{numeroOrden}")
    public Map<String, Object> getDashboardData(@PathVariable String numeroOrden) {
        Optional<Orden> ordenOpt = ordenService.findByNumeroOrden(numeroOrden);

        if (ordenOpt.isEmpty()) {
            throw new RuntimeException("Orden no encontrada");
        }

        Orden orden = ordenOpt.get();
        Map<String, Object> dashboard = new HashMap<>();

        // Estado actual de la moto (barra de progreso)
        dashboard.put("estado", orden.getEstado());
        dashboard.put("progreso", calcularProgreso(orden));

        // Tiempo estimado restante
        dashboard.put("tiempoEstimadoRestante", calcularTiempoRestante(orden));

        // Técnico asignado (por ahora null, se puede agregar después)
        dashboard.put("tecnicoAsignado", null);

        // Historial de actualizaciones
        dashboard.put("historialActualizaciones", ordenService.getHistorialActualizaciones(orden.getId()));

        // Repuestos agregados con precios
        dashboard.put("repuestos", orden.getRepuestos());

        // Mano de obra
        dashboard.put("manoDeObra", calcularManoDeObra(orden));

        // Total acumulado
        dashboard.put("totalAcumulado", calcularTotal(orden));

        // Información básica
        dashboard.put("numeroOrden", orden.getNumeroOrden());
        dashboard.put("moto", orden.getMoto());
        dashboard.put("cliente", orden.getCliente());

        return dashboard;
    }

    @GetMapping(value = "/dashboard/stream/{numeroOrden}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamDashboardUpdates(@PathVariable String numeroOrden) {
        return ordenService.registerClientEmitter(numeroOrden);
    }

    private int calcularProgreso(Orden orden) {
        // Lógica simple de progreso basado en estado
        switch (orden.getEstado()) {
            case DIAGNOSTICO: return 10;
            case AUTORIZACION_PENDIENTE: return 25;
            case REPARACION: return 50;
            case ESPERANDO_REPUESTOS: return 60;
            case LISTO_PARA_ENTREGAR: return 90;
            case ENTREGADO: return 100;
            default: return 0;
        }
    }

    private String calcularTiempoRestante(Orden orden) {
        // Lógica simple - se puede mejorar con datos reales
        switch (orden.getEstado()) {
            case DIAGNOSTICO: return "2 horas";
            case REPARACION: return "4 horas";
            case ESPERANDO_REPUESTOS: return "Esperando repuestos";
            case LISTO_PARA_ENTREGAR: return "Listo para recoger";
            case ENTREGADO: return "Completado";
            default: return "Desconocido";
        }
    }

    private double calcularManoDeObra(Orden orden) {
        return orden.getServicios().stream()
                .mapToDouble(servicio -> servicio.getCostoManoObra() != null ? servicio.getCostoManoObra() : 0)
                .sum();
    }

    private double calcularTotal(Orden orden) {
        double repuestos = orden.getRepuestos().stream()
                .mapToDouble(repuesto -> repuesto.getPrecio() != null ? repuesto.getPrecio() : 0)
                .sum();
        double manoObra = calcularManoDeObra(orden);
        return repuestos + manoObra;
    }
}
