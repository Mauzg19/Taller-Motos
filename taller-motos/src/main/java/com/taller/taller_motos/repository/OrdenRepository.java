package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.model.Moto;
import com.taller.taller_motos.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdenRepository extends JpaRepository<Orden, Long> {
    Optional<Orden> findByNumeroOrden(String numeroOrden);
    List<Orden> findByClienteAndMoto(Cliente cliente, Moto moto);
}
