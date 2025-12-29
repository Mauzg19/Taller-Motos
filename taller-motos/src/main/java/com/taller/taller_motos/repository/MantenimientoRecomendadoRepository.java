package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.MantenimientoRecomendado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MantenimientoRecomendadoRepository extends JpaRepository<MantenimientoRecomendado, Long> {

    List<MantenimientoRecomendado> findByMotoId(Long motoId);
}
