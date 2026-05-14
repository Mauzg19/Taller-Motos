package com.taller.taller_motos;

import com.taller.taller_motos.model.*;
import com.taller.taller_motos.service.*;
import com.taller.taller_motos.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataLoader implements CommandLineRunner {

    private final OrdenService ordenService;
    private final ClienteService clienteService;
    private final MotoService motoService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(OrdenService ordenService, ClienteService clienteService, MotoService motoService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.ordenService = ordenService;
        this.clienteService = clienteService;
        this.motoService = motoService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create Cliente 1 (only if doesn't exist)
        Cliente cliente1 = clienteService.findByEmail("juan@example.com");
        if (cliente1 == null) {
            cliente1 = new Cliente("Juan Pérez", "juan@example.com", "555-1234");
            cliente1 = clienteService.saveCliente(cliente1);
        }

        // Create Moto 1 (only if doesn't exist)
        Optional<Moto> moto1Opt = motoService.getMotoByPlaca("ABC-143");
        Moto moto1;
        if (moto1Opt.isEmpty()) {
            moto1 = new Moto("ABC-143", "Yamaha", "FZ-25", 2020, 12000, cliente1);
            moto1 = motoService.saveMoto(moto1);
        } else {
            moto1 = moto1Opt.get();
        }

        // Create Orden 1 (only if doesn't exist for this cliente and moto)
        if (ordenService.findByClienteAndMoto(cliente1, moto1).isEmpty()) {
            Orden o1 = new Orden();
            o1.setCliente(cliente1);
            o1.setMoto(moto1);
            o1.setMotivoIngreso("Falla en arranque");
            o1.setDiagnosticoInicial("Batería baja");
            o1.setEstado(EstadoOrden.DIAGNOSTICO);
            ordenService.create(o1);
        }

        // Create Cliente 2 (only if doesn't exist)
        Cliente cliente2 = clienteService.findByEmail("ana@example.com");
        if (cliente2 == null) {
            cliente2 = new Cliente("Ana García", "ana@example.com", "555-5678");
            cliente2 = clienteService.saveCliente(cliente2);
        }

        // Create Moto 2 (only if doesn't exist)
        Optional<Moto> moto2Opt = motoService.getMotoByPlaca("XYZ-045");
        Moto moto2;
        if (moto2Opt.isEmpty()) {
            moto2 = new Moto("XYZ-045", "Honda", "CBR 150", 2018, 22000, cliente2);
            moto2 = motoService.saveMoto(moto2);
        } else {
            moto2 = moto2Opt.get();
        }

        // Create Orden 2 (only if doesn't exist for this cliente and moto)
        if (ordenService.findByClienteAndMoto(cliente2, moto2).isEmpty()) {
            Orden o2 = new Orden();
            o2.setCliente(cliente2);
            o2.setMoto(moto2);
            o2.setMotivoIngreso("Cambio de aceite y servicios");
            o2.setDiagnosticoInicial("Mantención general");
            o2.setEstado(EstadoOrden.REPARACION);
            ordenService.create(o2);
        }

        // Create sample users (only if they don't exist)
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombre("Administrador");
            admin.setEmail("admin@taller.com");
            admin.setRole(Role.ADMIN);
            usuarioRepository.save(admin);
        }

        if (usuarioRepository.findByUsername("recepcion").isEmpty()) {
            Usuario recepcion = new Usuario();
            recepcion.setUsername("recepcion");
            recepcion.setPassword(passwordEncoder.encode("recepcion123"));
            recepcion.setNombre("Recepción");
            recepcion.setEmail("recepcion@taller.com");
            recepcion.setRole(Role.RECEPCION);
            usuarioRepository.save(recepcion);
        }

        if (usuarioRepository.findByUsername("tecnico").isEmpty()) {
            Usuario tecnico = new Usuario();
            tecnico.setUsername("tecnico");
            tecnico.setPassword(passwordEncoder.encode("tecnico123"));
            tecnico.setNombre("Técnico");
            tecnico.setEmail("tecnico@taller.com");
            tecnico.setRole(Role.TECNICO);
            usuarioRepository.save(tecnico);
        }

        if (usuarioRepository.findByUsername("juan@example.com").isEmpty()) {
            // 1. Crear el Usuario para el login
            Usuario usuarioJuan = new Usuario();
            usuarioJuan.setUsername("juan@example.com");
            usuarioJuan.setPassword(passwordEncoder.encode("cliente123"));
            usuarioJuan.setNombre("Juan Pérez");
            usuarioJuan.setEmail("juan@example.com");
            usuarioJuan.setTelefono("3001234567");
            usuarioJuan.setRole(Role.CLIENTE);
            
            // 2. Crear el Cliente (entidad de negocio)
            Cliente clienteJuan = new Cliente();
            clienteJuan.setNombre("Juan Pérez");
            clienteJuan.setEmail("juan@example.com");
            clienteJuan.setTelefono("3001234567");
            clienteJuan.setPuntos(450);
            
            // 3. Vincularlos
            clienteJuan.setUsuario(usuarioJuan);
            
            // 4. Guardar (Usando el servicio que ya esta inyectado)
            clienteService.saveCliente(clienteJuan);
            
            // 5. Agregarle una moto para que vea algo en su dashboard
            Moto motoJuan = new Moto();
            motoJuan.setMarca("Yamaha");
            motoJuan.setModelo("MT-07");
            motoJuan.setPlaca("ABC-123");
            motoJuan.setAnio(2023);
            motoJuan.setCliente(clienteJuan);
            motoService.saveMoto(motoJuan);
        }
    }
}
