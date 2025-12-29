package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> getClienteById(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente saveCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void deleteCliente(Long id) {
        clienteRepository.deleteById(id);
    }

    public void archiveCliente(Long id) {
        Optional<Cliente> clienteOpt = clienteRepository.findById(id);
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            cliente.setArchivado(true);
            clienteRepository.save(cliente);
        }
    }

    public void unarchiveCliente(Long id) {
        Optional<Cliente> clienteOpt = clienteRepository.findById(id);
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            cliente.setArchivado(false);
            clienteRepository.save(cliente);
        }
    }

    public Cliente findByEmail(String email) {
        try {
            return clienteRepository.findByEmail(email).orElse(null);
        } catch (Exception e) {
            // If multiple results, return null to indicate not found uniquely
            return null;
        }
    }
}
