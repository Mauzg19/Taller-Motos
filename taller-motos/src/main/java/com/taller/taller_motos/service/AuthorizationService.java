package com.taller.taller_motos.service;

import com.taller.taller_motos.model.AuthorizationRequest;
import com.taller.taller_motos.model.Orden;
import com.taller.taller_motos.model.Repuesto;
import com.taller.taller_motos.repository.AuthorizationRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorizationService {

    private final AuthorizationRequestRepository authorizationRequestRepository;

    public AuthorizationService(AuthorizationRequestRepository authorizationRequestRepository) {
        this.authorizationRequestRepository = authorizationRequestRepository;
    }

    public AuthorizationRequest createAuthorizationRequest(Orden orden, Repuesto repuesto, String message) {
        AuthorizationRequest request = new AuthorizationRequest(message, orden, repuesto);
        return authorizationRequestRepository.save(request);
    }

    public Optional<AuthorizationRequest> findById(Long id) {
        return authorizationRequestRepository.findById(id);
    }

    public List<AuthorizationRequest> findPendingByOrden(Orden orden) {
        if (orden == null || orden.getId() == null) return List.of();
        return authorizationRequestRepository.findByOrdenIdAndStatus(orden.getId(), "PENDING");
    }

    public List<AuthorizationRequest> findAllPending() {
        return authorizationRequestRepository.findByStatus("PENDING");
    }

    public Optional<AuthorizationRequest> acceptAuthorization(Long id) {
        Optional<AuthorizationRequest> opt = authorizationRequestRepository.findById(id);
        if (opt.isPresent()) {
            AuthorizationRequest request = opt.get();
            request.setStatus("ACCEPTED");
            return Optional.of(authorizationRequestRepository.save(request));
        }
        return Optional.empty();
    }

    public Optional<AuthorizationRequest> rejectAuthorization(Long id) {
        Optional<AuthorizationRequest> opt = authorizationRequestRepository.findById(id);
        if (opt.isPresent()) {
            AuthorizationRequest request = opt.get();
            request.setStatus("REJECTED");
            return Optional.of(authorizationRequestRepository.save(request));
        }
        return Optional.empty();
    }
}
