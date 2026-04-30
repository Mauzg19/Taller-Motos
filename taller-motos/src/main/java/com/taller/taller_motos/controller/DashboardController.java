package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.*;
import com.taller.taller_motos.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private RepuestoRepository repuestoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    /**
     * Get general statistics for dashboard
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Total orders
        long totalOrdenes = ordenRepository.count();
        stats.put("totalOrdenes", totalOrdenes);

        // Active orders (not delivered)
        long ordenesActivas = ordenRepository.findAll().stream()
                .filter(o -> o.getEstado() != EstadoOrden.ENTREGADO)
                .count();
        stats.put("ordenesActivas", ordenesActivas);

        // Completed orders
        long ordenesCompletadas = ordenRepository.findAll().stream()
                .filter(o -> o.getEstado() == EstadoOrden.ENTREGADO)
                .count();
        stats.put("ordenesCompletadas", ordenesCompletadas);

        // Monthly revenue (simplified calculation)
        double ingresosMes = ordenRepository.findAll().stream()
                .filter(o -> o.getCreadoEn() != null &&
                        o.getCreadoEn().getMonthValue() == LocalDate.now().getMonthValue())
                .mapToDouble(this::calculateOrderTotal)
                .sum();
        stats.put("ingresosMes", ingresosMes);

        // Total clients
        long totalClientes = clienteRepository.count();
        stats.put("totalClientes", totalClientes);

        // Pending appointments
        long citasPendientes = citaRepository.findAll().stream()
                .filter(c -> c.getEstado() == EstadoCita.PENDIENTE)
                .count();
        stats.put("citasPendientes", citasPendientes);

        // Low stock items
        long lowStockItems = repuestoRepository.findAll().stream()
                .filter(r -> r.getStockActual() <= r.getStockMinimo())
                .count();
        stats.put("lowStockItems", lowStockItems);

        return ResponseEntity.ok(stats);
    }

    /**
     * Get orders grouped by status
     */
    @GetMapping("/orders-by-status")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByStatus() {
        List<Orden> allOrders = ordenRepository.findAll();

        Map<EstadoOrden, Long> grouped = allOrders.stream()
                .collect(Collectors.groupingBy(Orden::getEstado, Collectors.counting()));

        List<Map<String, Object>> result = grouped.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("status", entry.getKey().name());
                    map.put("count", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get revenue by month for the current year
     */
    @GetMapping("/revenue-by-month")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByMonth() {
        int currentYear = LocalDate.now().getYear();
        List<Map<String, Object>> result = new ArrayList<>();

        String[] monthNames = {"Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};

        for (int month = 1; month <= 12; month++) {
            final int finalMonth = month;
            double revenue = ordenRepository.findAll().stream()
                    .filter(o -> o.getCreadoEn() != null &&
                            o.getCreadoEn().getYear() == currentYear &&
                            o.getCreadoEn().getMonthValue() == finalMonth)
                    .mapToDouble(this::calculateOrderTotal)
                    .sum();

            if (revenue > 0 || month <= LocalDate.now().getMonthValue()) {
                Map<String, Object> map = new HashMap<>();
                map.put("name", monthNames[month - 1]);
                map.put("ingresos", revenue);
                result.add(map);
            }
        }

        return ResponseEntity.ok(result);
    }

    /**
     * Get top services by revenue
     */
    @GetMapping("/top-services")
    public ResponseEntity<List<Map<String, Object>>> getTopServices() {
        List<Servicio> allServices = servicioRepository.findAll();

        Map<String, Double> serviceRevenue = allServices.stream()
                .filter(s -> s.getNombre() != null && s.getCostoManoObra() != null)
                .collect(Collectors.groupingBy(
                        Servicio::getNombre,
                        Collectors.summingDouble(Servicio::getCostoManoObra)
                ));

        List<Map<String, Object>> result = serviceRevenue.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", entry.getKey());
                    map.put("revenue", entry.getValue());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get recent orders
     */
    @GetMapping("/recent-orders")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders() {
        List<Orden> allOrders = ordenRepository.findAll();

        List<Map<String, Object>> result = allOrders.stream()
                .sorted((a, b) -> {
                    if (a.getCreadoEn() == null) return 1;
                    if (b.getCreadoEn() == null) return -1;
                    return b.getCreadoEn().compareTo(a.getCreadoEn());
                })
                .limit(10)
                .map(this::orderToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Get inventory summary
     */
    @GetMapping("/inventory-summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        Map<String, Object> summary = new HashMap<>();

        List<Repuesto> allParts = repuestoRepository.findAll();

        summary.put("totalItems", allParts.size());
        summary.put("totalValue", allParts.stream()
                .mapToDouble(r -> (r.getCostoCompra() != null ? r.getCostoCompra() : 0) *
                        (r.getStockActual() != null ? r.getStockActual() : 0))
                .sum());
        summary.put("lowStockItems", allParts.stream()
                .filter(r -> r.getStockActual() <= r.getStockMinimo())
                .count());

        // Group by category
        Map<String, Long> byCategory = allParts.stream()
                .filter(r -> r.getCategoria() != null)
                .collect(Collectors.groupingBy(Repuesto::getCategoria, Collectors.counting()));

        summary.put("categories", byCategory);

        return ResponseEntity.ok(summary);
    }

    /**
     * Get appointments for calendar
     */
    @GetMapping("/appointments")
    public ResponseEntity<List<Map<String, Object>>> getAppointments(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<Cita> allAppointments = citaRepository.findAll();

        List<Map<String, Object>> result = allAppointments.stream()
                .map(this::appointmentToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    // Helper methods

    private double calculateOrderTotal(Orden orden) {
        double total = 0.0;

        if (orden.getServicios() != null) {
            for (Servicio s : orden.getServicios()) {
                if (s.getCostoManoObra() != null) {
                    total += s.getCostoManoObra();
                }
            }
        }

        if (orden.getRepuestos() != null) {
            for (Repuesto r : orden.getRepuestos()) {
                if (r.getPrecio() != null && r.getCantidad() != null) {
                    total += r.getPrecio() * r.getCantidad();
                }
            }
        }

        return total;
    }

    private Map<String, Object> orderToMap(Orden orden) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", orden.getId());
        map.put("numeroOrden", orden.getNumeroOrden());
        map.put("estado", orden.getEstado().name());
        map.put("cliente", orden.getCliente() != null ? orden.getCliente().getNombre() : "N/A");
        map.put("moto", orden.getMoto() != null ?
                orden.getMoto().getMarca() + " " + orden.getMoto().getModelo() : "N/A");
        map.put("fecha", orden.getCreadoEn() != null ?
                orden.getCreadoEn().toString() : null);
        map.put("total", calculateOrderTotal(orden));
        return map;
    }

    private Map<String, Object> appointmentToMap(Cita cita) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", cita.getId());
        map.put("fecha", cita.getFecha() != null ? cita.getFecha().toString() : null);
        map.put("hora", cita.getHora() != null ? cita.getHora().toString() : null);
        map.put("cliente", cita.getCliente());
        map.put("servicio", cita.getServicio());
        map.put("tecnico", cita.getTecnico() != null ? cita.getTecnico().getUsername() : "No asignado");
        map.put("estado", cita.getEstado() != null ? cita.getEstado().name() : "PENDIENTE");
        return map;
    }
}
