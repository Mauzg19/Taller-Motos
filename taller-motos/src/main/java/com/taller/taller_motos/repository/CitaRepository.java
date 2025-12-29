package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.Cita;
import com.taller.taller_motos.model.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByFecha(LocalDate fecha);

    List<Cita> findByEstado(EstadoCita estado);

    List<Cita> findByTecnicoId(Long tecnicoId);

    List<Cita> findByFechaBetween(LocalDate startDate, LocalDate endDate);
}
