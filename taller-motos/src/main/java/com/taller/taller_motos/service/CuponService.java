package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Cupon;
import com.taller.taller_motos.repository.CuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.Optional;

@Service
public class CuponService {

    @Autowired
    private CuponRepository cuponRepository;

    public List<Cupon> getAllCupones() {
        return cuponRepository.findAll();
    }

    public Optional<Cupon> getCuponById(Long id) {
        return cuponRepository.findById(id);
    }

    public List<Cupon> getCuponesByCliente(Long clienteId) {
        return cuponRepository.findByClienteIdAndUsadoFalse(clienteId);
    }

    public Cupon saveCupon(Cupon cupon) {
        return cuponRepository.save(cupon);
    }

    public void deleteCupon(Long id) {
        cuponRepository.deleteById(id);
    }

    public Cupon createCuponForCliente(Long clienteId, Double descuento) {
        // Assume ClienteService is injected
        // Cliente cliente = clienteService.getClienteById(clienteId).orElseThrow();
        // Cupon cupon = new Cupon(cliente, descuento, LocalDate.now().plusMonths(6));
        // return saveCupon(cupon);
        return null; // Placeholder
    }
}
