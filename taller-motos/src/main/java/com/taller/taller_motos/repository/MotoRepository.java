package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.Moto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MotoRepository extends JpaRepository<Moto, Long> {

    Optional<Moto> findByPlaca(String placa);
    List<Moto> findByClienteId(Long clienteId);
}
