package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Repuesto;
import com.taller.taller_motos.repository.RepuestoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repuestos")
@CrossOrigin(origins = "*")
public class RepuestoController {

    @Autowired
    private RepuestoRepository repuestoRepository;

    /**
     * Get all spare parts
     */
    @GetMapping
    public List<Repuesto> getAllRepuestos() {
        return repuestoRepository.findAll();
    }

    /**
     * Get spare part by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Repuesto> getRepuestoById(@PathVariable Long id) {
        return repuestoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get low stock items
     */
    @GetMapping("/low-stock")
    public List<Repuesto> getLowStock() {
        return repuestoRepository.findAll().stream()
                .filter(r -> r.getStockActual() <= r.getStockMinimo())
                .collect(Collectors.toList());
    }

    /**
     * Get items by category
     */
    @GetMapping("/categoria/{categoria}")
    public List<Repuesto> getByCategoria(@PathVariable String categoria) {
        return repuestoRepository.findAll().stream()
                .filter(r -> categoria.equalsIgnoreCase(r.getCategoria()))
                .collect(Collectors.toList());
    }

    /**
     * Search spare parts by name
     */
    @GetMapping("/search")
    public List<Repuesto> searchByName(@RequestParam String q) {
        return repuestoRepository.findAll().stream()
                .filter(r -> r.getNombre() != null &&
                        r.getNombre().toLowerCase().contains(q.toLowerCase()))
                .collect(Collectors.toList());
    }

    /**
     * Create new spare part
     */
    @PostMapping
    public ResponseEntity<Repuesto> createRepuesto(@RequestBody Repuesto repuesto) {
        try {
            if (repuesto.getStockActual() == null) {
                repuesto.setStockActual(0);
            }
            if (repuesto.getStockMinimo() == null) {
                repuesto.setStockMinimo(5);
            }
            Repuesto saved = repuestoRepository.save(repuesto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update spare part
     */
    @PutMapping("/{id}")
    public ResponseEntity<Repuesto> updateRepuesto(@PathVariable Long id, @RequestBody Repuesto repuesto) {
        return repuestoRepository.findById(id)
                .map(existing -> {
                    existing.setNombre(repuesto.getNombre());
                    existing.setCantidad(repuesto.getCantidad());
                    existing.setPrecio(repuesto.getPrecio());
                    existing.setCategoria(repuesto.getCategoria());
                    existing.setCodigoInterno(repuesto.getCodigoInterno());
                    existing.setCodigoProveedor(repuesto.getCodigoProveedor());
                    existing.setCostoCompra(repuesto.getCostoCompra());
                    existing.setStockActual(repuesto.getStockActual());
                    existing.setStockMinimo(repuesto.getStockMinimo());
                    existing.setGarantiaDuracion(repuesto.getGarantiaDuracion());
                    existing.setGarantiaInicio(repuesto.getGarantiaInicio());
                    existing.setFotos(repuesto.getFotos());
                    return ResponseEntity.ok(repuestoRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update stock
     */
    @PutMapping("/{id}/stock")
    public ResponseEntity<Repuesto> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return repuestoRepository.findById(id)
                .map(existing -> {
                    Integer newStock = body.get("stockActual");
                    if (newStock != null) {
                        existing.setStockActual(newStock);
                    }
                    return ResponseEntity.ok(repuestoRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete spare part
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRepuesto(@PathVariable Long id) {
        return repuestoRepository.findById(id)
                .map(repuesto -> {
                    repuestoRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get inventory summary
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        Map<String, Object> summary = new HashMap<>();
        List<Repuesto> all = repuestoRepository.findAll();

        summary.put("totalItems", all.size());
        summary.put("totalValue", all.stream()
                .mapToDouble(r -> (r.getCostoCompra() != null ? r.getCostoCompra() : 0) *
                        (r.getStockActual() != null ? r.getStockActual() : 0))
                .sum());
        summary.put("lowStockCount", all.stream()
                .filter(r -> r.getStockActual() <= r.getStockMinimo())
                .count());

        // Group by category
        Map<String, Long> byCategory = all.stream()
                .filter(r -> r.getCategoria() != null)
                .collect(Collectors.groupingBy(Repuesto::getCategoria, Collectors.counting()));
        summary.put("byCategory", byCategory);

        return ResponseEntity.ok(summary);
    }
}
