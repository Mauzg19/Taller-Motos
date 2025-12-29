package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {

    List<Cupon> findByClienteIdAndUsadoFalse(Long clienteId);
}
