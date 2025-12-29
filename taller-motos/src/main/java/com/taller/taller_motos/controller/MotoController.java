package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Moto;
import com.taller.taller_motos.service.MotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/motos")
public class MotoController {

    @Autowired
    private MotoService motoService;

    @GetMapping
    public List<Moto> getAllMotos() {
        return motoService.getAllMotos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Moto> getMotoById(@PathVariable Long id) {
        Optional<Moto> moto = motoService.getMotoById(id);
        return moto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/placa/{placa}")
    public ResponseEntity<Moto> getMotoByPlaca(@PathVariable String placa) {
        Optional<Moto> moto = motoService.getMotoByPlaca(placa);
        return moto.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public List<Moto> getMotosByCliente(@PathVariable Long clienteId) {
        return motoService.getMotosByClienteId(clienteId);
    }

    @PostMapping
    public Moto createMoto(@RequestBody Moto moto) {
        return motoService.saveMoto(moto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Moto> updateMoto(@PathVariable Long id, @RequestBody Moto motoDetails) {
        Optional<Moto> moto = motoService.getMotoById(id);
        if (moto.isPresent()) {
            motoDetails.setId(id);
            return ResponseEntity.ok(motoService.saveMoto(motoDetails));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMoto(@PathVariable Long id) {
        if (motoService.getMotoById(id).isPresent()) {
            motoService.deleteMoto(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
