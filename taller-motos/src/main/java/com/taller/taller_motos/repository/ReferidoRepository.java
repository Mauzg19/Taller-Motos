package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.Referido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReferidoRepository extends JpaRepository<Referido, Long> {
    List<Referido> findByClienteReferidorId(Long clienteReferidorId);
}
