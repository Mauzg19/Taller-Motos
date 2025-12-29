package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.Role;
import com.taller.taller_motos.model.Usuario;
import com.taller.taller_motos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public Map<String, Object> me(Principal principal) {
        if (principal == null) return Map.of();
        Usuario usuario = usuarioRepository.findByUsername(principal.getName()).orElse(null);
        if (usuario == null) return Map.of();
        return Map.of(
                "username", usuario.getUsername(),
                "role", usuario.getRole(),
                "nombre", usuario.getNombre(),
                "email", usuario.getEmail()
        );
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Usuario> listUsers() {
        return usuarioRepository.findAll();
    }

    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPCION')")
    public Usuario createUser(@RequestBody Map<String, String> payload, Principal principal) {
        // Only ADMIN can create arbitrary roles; RECEPCION can only create CLIENTE users
        String username = payload.get("username");
        String password = payload.get("password");
        String nombre = payload.get("nombre");
        String email = payload.get("email");
        String roleStr = payload.get("role");

        Role role = Role.valueOf(roleStr);
        Usuario creator = usuarioRepository.findByUsername(principal.getName()).orElse(null);
        if (creator == null) throw new RuntimeException("No autorizado");
        if (creator.getRole() == Role.RECEPCION && role != Role.CLIENTE) {
            throw new RuntimeException("RECEPCION solo puede crear CLIENTE");
        }

        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setNombre(nombre);
        u.setEmail(email);
        u.setRole(role);
        return usuarioRepository.save(u);
    }
}
