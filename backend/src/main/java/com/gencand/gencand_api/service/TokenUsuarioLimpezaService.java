package com.gencand.gencand_api.service;

import com.gencand.gencand_api.repository.TokenUsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class TokenUsuarioLimpezaService {

    private final TokenUsuarioRepository tokenUsuarioRepository;

    @Scheduled(cron = "0 0 3 * * *", zone = "UTC")
    @Transactional
    public void removerTokensExpirados() {
        tokenUsuarioRepository.deleteByExpiraEmBefore(Instant.now());
    }
}
