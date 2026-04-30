package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.*;
import com.taller.taller_motos.repository.*;
import com.taller.taller_motos.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private OrdenRepository ordenRepository;

    @Autowired
    private RepuestoRepository repuestoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @GetMapping("/most-damaged-parts")
    public List<Map<String, Object>> getMostDamagedParts() {
        return reportService.getMostDamagedParts();
    }

    @GetMapping("/revenue-by-service")
    public List<Map<String, Object>> getRevenueByService() {
        return reportService.getRevenueByService();
    }

    @GetMapping("/technician-efficiency")
    public List<Map<String, Object>> getTechnicianEfficiency() {
        return reportService.getTechnicianEfficiency();
    }

    @GetMapping("/average-repair-time")
    public Map<String, Object> getAverageRepairTime() {
        return reportService.getAverageRepairTime();
    }

    /**
     * Generate PDF report (simplified - returns text for demo)
     * In production, use iText or Apache PDFBox
     */
    @PostMapping(value = "/generate-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generatePdfReport(@RequestBody Map<String, Object> body) {
        String reportType = (String) body.get("type");
        String startDate = (String) body.get("startDate");
        String endDate = (String) body.get("endDate");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String content = String.format(
            "REPORTE DE TALLER DE MOTOS\n" +
            "========================\n\n" +
            "Tipo: %s\n" +
            "Fecha: %s\n" +
            "Desde: %s\n" +
            "Hasta: %s\n\n" +
            "Este es un reporte de ejemplo. En producci\u00F3n, use iText o Apache PDFBox.\n",
            reportType,
            LocalDate.now().format(DateTimeFormatter.ISO_DATE),
            startDate != null ? startDate : "N/A",
            endDate != null ? endDate : "N/A"
        );
        baos.writeBytes(content.getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "reporte.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
    }

    /**
     * Generate Excel report (simplified - returns CSV for demo)
     * In production, use Apache POI
     */
    @PostMapping(value = "/generate-excel", produces = "application/vnd.ms-excel")
    public ResponseEntity<byte[]> generateExcelReport(@RequestBody Map<String, Object> body) {
        String reportType = (String) body.get("type");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        StringBuilder sb = new StringBuilder();

        sb.append("ID,Numero Orden,Cliente,Moto,Estado,Total,Fecha\n");

        List<Orden> orders = ordenRepository.findAll();
        for (Orden orden : orders) {
            sb.append(orden.getId()).append(",");
            sb.append(orden.getNumeroOrden()).append(",");
            sb.append(orden.getCliente() != null ? orden.getCliente().getNombre() : "N/A").append(",");
            sb.append(orden.getMoto() != null ? orden.getMoto().getMarca() + " " + orden.getMoto().getModelo() : "N/A").append(",");
            sb.append(orden.getEstado()).append(",");
            sb.append(calculateOrderTotal(orden)).append(",");
            sb.append(orden.getCreadoEn() != null ? orden.getCreadoEn().toString() : "N/A").append("\n");
        }

        baos.writeBytes(sb.toString().getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/vnd.ms-excel"));
        headers.setContentDispositionFormData("attachment", "reporte.xls");

        return ResponseEntity.ok()
                .headers(headers)
                .body(baos.toByteArray());
    }

    /**
     * Get comprehensive report data
     */
    @GetMapping("/comprehensive")
    public ResponseEntity<Map<String, Object>> getComprehensiveReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Map<String, Object> report = new HashMap<>();

        List<Orden> allOrders = ordenRepository.findAll();

        if (startDate != null && endDate != null) {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            allOrders = allOrders.stream()
                    .filter(o -> o.getCreadoEn() != null &&
                            !o.getCreadoEn().toLocalDate().isBefore(start) &&
                            !o.getCreadoEn().toLocalDate().isAfter(end))
                    .toList();
        }

        report.put("totalOrders", allOrders.size());
        report.put("totalRevenue", allOrders.stream().mapToDouble(this::calculateOrderTotal).sum());
        report.put("completedOrders", allOrders.stream()
                .filter(o -> o.getEstado() == EstadoOrden.ENTREGADO).count());
        report.put("pendingOrders", allOrders.stream()
                .filter(o -> o.getEstado() != EstadoOrden.ENTREGADO).count());

        Map<String, Long> byStatus = allOrders.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        o -> o.getEstado().name(),
                        java.util.stream.Collectors.counting()));
        report.put("byStatus", byStatus);
        report.put("topServices", reportService.getRevenueByService());

        List<Repuesto> lowStock = repuestoRepository.findAll().stream()
                .filter(r -> r.getStockActual() <= r.getStockMinimo())
                .toList();
        report.put("lowStockAlerts", lowStock.size());

        return ResponseEntity.ok(report);
    }

    /**
     * Get financial report
     */
    @GetMapping("/financial")
    public ResponseEntity<Map<String, Object>> getFinancialReport(
            @RequestParam(required = false) Integer year) {

        int targetYear = year != null ? year : LocalDate.now().getYear();
        Map<String, Object> report = new HashMap<>();

        List<Orden> orders = ordenRepository.findAll().stream()
                .filter(o -> o.getCreadoEn() != null && o.getCreadoEn().getYear() == targetYear)
                .toList();

        double totalRevenue = orders.stream().mapToDouble(this::calculateOrderTotal).sum();
        double totalServicesCost = orders.stream()
                .flatMapToDouble(o -> o.getServicios() != null ?
                        o.getServicios().stream().mapToDouble(s -> s.getCostoManoObra() != null ? s.getCostoManoObra() : 0) :
                        java.util.stream.DoubleStream.empty())
                .sum();
        double totalPartsCost = orders.stream()
                .flatMapToDouble(o -> o.getRepuestos() != null ?
                        o.getRepuestos().stream().mapToDouble(r -> r.getPrecio() != null && r.getCantidad() != null ?
                                r.getPrecio() * r.getCantidad() : 0) :
                        java.util.stream.DoubleStream.empty())
                .sum();

        report.put("year", targetYear);
        report.put("totalRevenue", totalRevenue);
        report.put("servicesRevenue", totalServicesCost);
        report.put("partsRevenue", totalPartsCost);
        report.put("orderCount", orders.size());
        report.put("averageOrderValue", orders.isEmpty() ? 0 : totalRevenue / orders.size());

        List<Map<String, Object>> monthlyData = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            int finalMonth = month;
            List<Orden> monthOrders = orders.stream()
                    .filter(o -> o.getCreadoEn() != null && o.getCreadoEn().getMonthValue() == finalMonth)
                    .toList();
            double monthRevenue = monthOrders.stream().mapToDouble(this::calculateOrderTotal).sum();

            Map<String, Object> monthMap = new HashMap<>();
            monthMap.put("month", month);
            monthMap.put("revenue", monthRevenue);
            monthMap.put("orders", monthOrders.size());
            monthlyData.add(monthMap);
        }
        report.put("monthlyBreakdown", monthlyData);

        return ResponseEntity.ok(report);
    }

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
}
