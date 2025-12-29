package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Cita;
import com.taller.taller_motos.model.EstadoCita;
import com.taller.taller_motos.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    public List<Cita> getAllCitas() {
        return citaRepository.findAll();
    }

    public Optional<Cita> getCitaById(Long id) {
        return citaRepository.findById(id);
    }

    public Cita saveCita(Cita cita) {
        return citaRepository.save(cita);
    }

    public void deleteCita(Long id) {
        citaRepository.deleteById(id);
    }

    public List<Cita> getCitasByFecha(LocalDate fecha) {
        return citaRepository.findByFecha(fecha);
    }

    public List<Cita> getCitasByEstado(EstadoCita estado) {
        return citaRepository.findByEstado(estado);
    }

    public List<Cita> getCitasByTecnico(Long tecnicoId) {
        return citaRepository.findByTecnicoId(tecnicoId);
    }

    public List<Cita> getAvailableDates(LocalDate startDate, LocalDate endDate) {
        // Assuming available if no cita at that date/time, but for simplicity, return dates with no citas
        List<Cita> citas = citaRepository.findByFechaBetween(startDate, endDate);
        // Logic to find available slots, e.g., 9am-5pm, 1 hour slots
        // For now, return all dates in range minus booked dates
        // This is simplified; in real app, check time slots
        return citas; // Placeholder
    }

    public Cita scheduleCita(Cita cita) {
        // Set default estado to PENDIENTE
        if (cita.getEstado() == null) {
            cita.setEstado(EstadoCita.PENDIENTE);
        }
        return saveCita(cita);
    }

    public void sendReminder(Cita cita) {
        // Logic to send email/SMS reminder
        // For now, just add to recordatorios list
        cita.getRecordatorios().add("Reminder sent at " + LocalTime.now());
        saveCita(cita);
    }
}
