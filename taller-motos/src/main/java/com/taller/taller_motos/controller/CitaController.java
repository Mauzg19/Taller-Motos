package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Cita;
import com.taller.taller_motos.model.EstadoCita;
import com.taller.taller_motos.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitaController {

    @Autowired
    private CitaService citaService;

    /**
     * Get all appointments
     */
    @GetMapping
    public List<Cita> getAllCitas() {
        return citaService.getAllCitas();
    }

    /**
     * Get appointment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Cita> getCitaById(@PathVariable Long id) {
        return citaService.getCitaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get appointments by date
     */
    @GetMapping("/fecha/{fecha}")
    public List<Cita> getCitasByFecha(@PathVariable LocalDate fecha) {
        return citaService.getCitasByFecha(fecha);
    }

    /**
     * Get appointments by status
     */
    @GetMapping("/estado/{estado}")
    public List<Cita> getCitasByEstado(@PathVariable EstadoCita estado) {
        return citaService.getCitasByEstado(estado);
    }

    /**
     * Get appointments by technician
     */
    @GetMapping("/tecnico/{tecnicoId}")
    public List<Cita> getCitasByTecnico(@PathVariable Long tecnicoId) {
        return citaService.getCitasByTecnico(tecnicoId);
    }

    /**
     * Get available dates for scheduling
     */
    @GetMapping("/available")
    public List<Cita> getAvailableDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return citaService.getAvailableDates(startDate, endDate);
    }

    /**
     * Create new appointment
     */
    @PostMapping
    public ResponseEntity<Cita> createCita(@RequestBody Cita cita) {
        try {
            Cita savedCita = citaService.scheduleCita(cita);
            return ResponseEntity.ok(savedCita);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update appointment
     */
    @PutMapping("/{id}")
    public ResponseEntity<Cita> updateCita(@PathVariable Long id, @RequestBody Cita cita) {
        try {
            return citaService.getCitaById(id)
                    .map(existing -> {
                        existing.setFecha(cita.getFecha());
                        existing.setHora(cita.getHora());
                        existing.setCliente(cita.getCliente());
                        existing.setServicio(cita.getServicio());
                        existing.setTecnico(cita.getTecnico());
                        if (cita.getEstado() != null) {
                            existing.setEstado(cita.getEstado());
                        }
                        return ResponseEntity.ok(citaService.saveCita(existing));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update appointment status
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<Cita> updateEstado(@PathVariable Long id, @RequestBody EstadoCita estado) {
        return citaService.getCitaById(id)
                .map(cita -> {
                    cita.setEstado(estado);
                    return ResponseEntity.ok(citaService.saveCita(cita));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete appointment
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCita(@PathVariable Long id) {
        return citaService.getCitaById(id)
                .map(cita -> {
                    citaService.deleteCita(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Send reminder for appointment
     */
    @PostMapping("/{id}/reminder")
    public ResponseEntity<Map<String, Object>> sendReminder(@PathVariable Long id) {
        return citaService.getCitaById(id)
                .map(cita -> {
                    citaService.sendReminder(cita);
                    Map<String, Object> response = new HashMap<>();
                    response.put("success", true);
                    response.put("message", "Recordatorio enviado");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
