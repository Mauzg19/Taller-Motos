package com.taller.taller_motos.service;

import com.taller.taller_motos.model.Cliente;
import com.taller.taller_motos.model.Referido;
import com.taller.taller_motos.repository.ReferidoRepository;
import com.taller.taller_motos.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReferidoService {

    @Autowired
    private ReferidoRepository referidoRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    public List<Referido> getReferidosByCliente(Long clienteId) {
        return referidoRepository.findByClienteReferidorId(clienteId);
    }

    public Referido createReferido(Cliente referidor, Cliente referido, Integer bonoPuntos) {
        Referido referidoEntity = new Referido(referidor, referido, bonoPuntos);
        return referidoRepository.save(referidoEntity);
    }

    @Transactional
    public void awardReferralBonus(Referido referido) {
        Cliente referidor = referido.getClienteReferidor();
        referidor.setPuntos(referidor.getPuntos() + referido.getBonoPuntos());
        clienteRepository.save(referidor);
    }
}
