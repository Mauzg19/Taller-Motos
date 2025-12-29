package com.taller.taller_motos.repository;

import com.taller.taller_motos.model.AuthorizationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuthorizationRequestRepository extends JpaRepository<AuthorizationRequest, Long> {

    List<AuthorizationRequest> findByOrdenIdAndStatus(Long ordenId, String status);

    List<AuthorizationRequest> findByStatus(String status);
}
