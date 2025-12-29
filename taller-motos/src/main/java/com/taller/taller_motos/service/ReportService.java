package com.taller.taller_motos.service;

import com.taller.taller_motos.repository.RepuestoRepository;
import com.taller.taller_motos.repository.ServicioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private RepuestoRepository repuestoRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    public List<Map<String, Object>> getMostDamagedParts() {
        // Query repuestos, group by nombre, count
        return repuestoRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getNombre(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("part", e.getKey());
                    map.put("count", e.getValue());
                    return map;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getRevenueByService() {
        // Query servicios, group by nombre, sum costoManoObra
        return servicioRepository.findAll().stream()
                .collect(Collectors.groupingBy(s -> s.getNombre(), Collectors.summingDouble(s -> s.getCostoManoObra())))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("service", e.getKey());
                    map.put("revenue", e.getValue());
                    return map;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("revenue"), (Double) a.get("revenue")))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTechnicianEfficiency() {
        // Query servicios, group by tecnico, average tiempoReal / tiempoEstimado
        return servicioRepository.findAll().stream()
                .filter(s -> s.getTecnico() != null && s.getTiempoReal() != null && s.getTiempoEstimado() != null)
                .collect(Collectors.groupingBy(s -> s.getTecnico().getUsername(),
                        Collectors.averagingDouble(s -> (double) s.getTiempoReal() / s.getTiempoEstimado())))
                .entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("technician", e.getKey());
                    map.put("efficiency", e.getValue());
                    return map;
                })
                .sorted((a, b) -> Double.compare((Double) b.get("efficiency"), (Double) a.get("efficiency")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAverageRepairTime() {
        // Average tiempoReal from servicios
        double avg = servicioRepository.findAll().stream()
                .filter(s -> s.getTiempoReal() != null)
                .mapToInt(s -> s.getTiempoReal())
                .average()
                .orElse(0.0);
        return Map.of("averageRepairTime", avg);
    }
}
