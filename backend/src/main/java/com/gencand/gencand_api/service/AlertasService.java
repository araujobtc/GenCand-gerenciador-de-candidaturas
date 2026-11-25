package com.gencand.gencand_api.service;

import com.gencand.gencand_api.entity.Candidatura;
import com.gencand.gencand_api.entity.Usuario;
import com.gencand.gencand_api.repository.CandidaturaRepository;
import com.gencand.gencand_api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AlertasService {
    private static final Logger log = LoggerFactory.getLogger(AlertasService.class);
    private static final ZoneId BRASILIA = ZoneId.of("America/Sao_Paulo");
    private static final Set<String> EM_ANDAMENTO = Set.of(
        "CANDIDATADA", "ATIVIDADE_PENDENTE", "ATIVIDADE_REALIZADA",
        "ENTREVISTADA", "AGUARDANDO_RESULTADO"
    );
    private final UsuarioRepository usuarios;
    private final CandidaturaRepository candidaturas;
    private final BrevoEmailService emailService;

    @Scheduled(cron = "0 0 9 * * *", zone = "America/Sao_Paulo")
    public void enviarResumosDiarios() {
        LocalDate hoje = LocalDate.now(BRASILIA);
        String dia = switch (hoje.getDayOfWeek()) {
            case MONDAY -> "SEGUNDA"; case TUESDAY -> "TERCA"; case WEDNESDAY -> "QUARTA";
            case THURSDAY -> "QUINTA"; case FRIDAY -> "SEXTA"; case SATURDAY -> "SABADO"; case SUNDAY -> "DOMINGO";
        };
        for (Usuario usuario : usuarios.findAll()) {
            String frequencia = usuario.getFreqEmail();
            if (frequencia == null || frequencia.equals("DESATIVADA")) continue;
            if (frequencia.equals("SEMANAL") && !dia.equals(usuario.getDiaSemanaResumo())) continue;
            try {
                List<Candidatura> lista = candidaturas.findByUsuarioIdAndOculta(
                    usuario.getId(), false, PageRequest.of(0, 1000)).getContent();
                List<Candidatura> semStatus = lista.stream().filter(c -> c.getStatus() == null).toList();
                int diasLimite = usuario.getDiasParaParada() == null ? 7 : usuario.getDiasParaParada();
                List<Candidatura> paradas = lista.stream()
                    .filter(c -> c.getStatus() != null && EM_ANDAMENTO.contains(c.getStatus()))
                    .filter(c -> c.getDataAtualizacao() != null &&
                        !c.getDataAtualizacao().atZone(BRASILIA).toLocalDate().isAfter(hoje.minusDays(diasLimite)))
                    .toList();
                if (semStatus.isEmpty() && paradas.isEmpty()) continue;
                emailService.enviarResumoAlertas(usuario.getEmail(), montarHtml(semStatus, paradas, hoje));
            } catch (Exception e) {
                log.error("Falha ao gerar resumo de alertas para usuário {}.", usuario.getId(), e);
            }
        }
    }

    private String montarHtml(List<Candidatura> semStatus, List<Candidatura> paradas, LocalDate hoje) {
        StringBuilder html = new StringBuilder("<h2>Seu resumo de candidaturas</h2><p>")
            .append(hoje).append("</p>");
        if (!semStatus.isEmpty()) {
            html.append("<h3>Candidaturas sem status</h3><ul>");
            semStatus.forEach(c -> html.append("<li>").append(escapar(c.getTitulo())).append(" — ")
                .append(escapar(c.getEmpresa())).append("</li>"));
            html.append("</ul>");
        }
        if (!paradas.isEmpty()) {
            html.append("<h3>Candidaturas sem atualização recente</h3><ul>");
            paradas.forEach(c -> html.append("<li>").append(escapar(c.getTitulo())).append(" — ")
                .append(escapar(c.getEmpresa())).append("</li>"));
            html.append("</ul>");
        }
        return html.append("<p>Acesse o GenCand para atualizar suas candidaturas.</p>").toString();
    }

    private String escapar(String valor) {
        if (valor == null) return "";
        return valor.replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}
