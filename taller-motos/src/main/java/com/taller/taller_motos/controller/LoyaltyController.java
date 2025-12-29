package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.model.Cupon;
import com.taller.taller_motos.model.Referido;
import com.taller.taller_motos.service.ClienteService;
import com.taller.taller_motos.service.CuponService;
import com.taller.taller_motos.service.ReferidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    @Autowired
    private ClienteService clienteService;

    @Autowired
    private CuponService cuponService;

    @Autowired
    private ReferidoService referidoService;

    // Cliente endpoints
    @GetMapping("/clientes")
    public List<Cliente> getAllClientes() {
        return clienteService.getAllClientes();
    }

    @GetMapping("/clientes/{id}")
    public ResponseEntity<Cliente> getClienteById(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteService.getClienteById(id);
        return cliente.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/clientes")
    public Cliente createCliente(@RequestBody Cliente cliente) {
        return clienteService.saveCliente(cliente);
    }

    @PutMapping("/clientes/{id}/puntos")
    public ResponseEntity<Void> addPuntos(@PathVariable Long id, @RequestParam Integer puntos) {
        Optional<Cliente> cliente = clienteService.getClienteById(id);
        if (cliente.isPresent()) {
            cliente.get().setPuntos(cliente.get().getPuntos() + puntos);
            clienteService.saveCliente(cliente.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Cupon endpoints
    @GetMapping("/cupones/{clienteId}")
    public List<Cupon> getCuponesByCliente(@PathVariable Long clienteId) {
        return cuponService.getCuponesByCliente(clienteId);
    }

    @PostMapping("/cupones")
    public Cupon createCupon(@RequestBody Cupon cupon) {
        return cuponService.saveCupon(cupon);
    }

    @PutMapping("/cupones/{id}/usar")
    public ResponseEntity<Void> usarCupon(@PathVariable Long id) {
        Optional<Cupon> cupon = cuponService.getCuponById(id);
        if (cupon.isPresent() && !cupon.get().getUsado()) {
            cupon.get().setUsado(true);
            cuponService.saveCupon(cupon.get());
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // Referido endpoints
    @GetMapping("/referidos/{clienteId}")
    public List<Referido> getReferidosByCliente(@PathVariable Long clienteId) {
        return referidoService.getReferidosByCliente(clienteId);
    }

    @PostMapping("/referidos")
    public Referido createReferido(@RequestBody Referido referido) {
        return referidoService.createReferido(referido.getClienteReferidor(), referido.getClienteReferido(), referido.getBonoPuntos());
    }

    @PutMapping("/clientes/{id}/archive")
    public ResponseEntity<Void> archiveCliente(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteService.getClienteById(id);
        if (cliente.isPresent()) {
            clienteService.archiveCliente(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/clientes/{id}/unarchive")
    public ResponseEntity<Void> unarchiveCliente(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteService.getClienteById(id);
        if (cliente.isPresent()) {
            clienteService.unarchiveCliente(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/clientes/{id}")
    public ResponseEntity<Void> deleteCliente(@PathVariable Long id) {
        Optional<Cliente> cliente = clienteService.getClienteById(id);
        if (cliente.isPresent()) {
            clienteService.deleteCliente(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
