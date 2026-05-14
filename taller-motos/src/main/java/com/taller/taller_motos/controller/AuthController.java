package com.taller.taller_motos.controller;

import com.taller.taller_motos.model.*;
import com.taller.taller_motos.repository.UsuarioRepository;
import com.taller.taller_motos.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Autenticar usuario
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // Obtener usuario de la base de datos
            Usuario usuario = usuarioRepository.findByUsername(loginRequest.getUsername()).orElse(null);
            if (usuario == null) {
                return ResponseEntity.status(401).body(null);
            }

            // Generar token JWT
            String token = jwtUtil.generateToken(usuario.getUsername(), usuario.getRole().name());

            // Crear respuesta
            LoginResponse.UserDTO userDTO = LoginResponse.UserDTO.builder()
                    .username(usuario.getUsername())
                    .nombre(usuario.getNombre())
                    .email(usuario.getEmail())
                    .role(usuario.getRole().name())
                    .build();

            LoginResponse response = LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(86400000L) // 24 horas
                    .user(userDTO)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(null);
        }
    }

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
