package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.model.Role;
import com.taller.taller_motos.model.Usuario;
import com.taller.taller_motos.repository.ClienteRepository;
import com.taller.taller_motos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> getClienteById(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente saveCliente(Cliente cliente) {
        // Si es un cliente nuevo y no tiene usuario, se lo creamos
        if (cliente.getId() == null && cliente.getUsuario() == null) {
            String username = cliente.getEmail();
            // Verificar si el username ya existe para evitar errores
            if (usuarioRepository.findByUsername(username).isEmpty()) {
                Usuario nuevoUsuario = new Usuario();
                nuevoUsuario.setUsername(username);
                nuevoUsuario.setEmail(cliente.getEmail());
                nuevoUsuario.setNombre(cliente.getNombre());
                nuevoUsuario.setTelefono(cliente.getTelefono());
                nuevoUsuario.setRole(Role.CLIENTE);
                
                // Password inicial por defecto: su numero de telefono
                String rawPassword = cliente.getTelefono() != null ? cliente.getTelefono() : "taller123";
                nuevoUsuario.setPassword(passwordEncoder.encode(rawPassword));
                
                cliente.setUsuario(nuevoUsuario);
            }
        }
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
