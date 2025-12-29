package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Moto;
import com.taller.taller_motos.repository.MotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MotoService {

    @Autowired
    private MotoRepository motoRepository;

    public List<Moto> getAllMotos() {
        return motoRepository.findAll();
    }

    public Optional<Moto> getMotoById(Long id) {
        return motoRepository.findById(id);
    }

    public Optional<Moto> getMotoByPlaca(String placa) {
        return motoRepository.findByPlaca(placa);
    }

    public List<Moto> getMotosByClienteId(Long clienteId) {
        return motoRepository.findByClienteId(clienteId);
    }

    public Moto saveMoto(Moto moto) {
        return motoRepository.save(moto);
    }

    public void deleteMoto(Long id) {
        motoRepository.deleteById(id);
    }

    public void updateKilometraje(Moto moto, Integer newKilometraje) {
        moto.setKilometraje(newKilometraje);
        saveMoto(moto);
    }
}
