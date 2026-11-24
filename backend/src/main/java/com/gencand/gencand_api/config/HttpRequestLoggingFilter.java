package com.gencand.gencand_api.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Registra metadados das requisicoes HTTP sem expor corpos, credenciais ou tokens.
 * A ativacao e controlada pelo perfil de ambiente.
 */
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger ACCESS_LOG = LoggerFactory.getLogger("HTTP_ACCESS");
    private static final String REQUEST_ID_HEADER = "X-Request-Id";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String requestId = UUID.randomUUID().toString();
        response.setHeader(REQUEST_ID_HEADER, requestId);
        long startedAt = System.nanoTime();
        Exception requestException = null;

        try {
            filterChain.doFilter(request, response);
        } catch (ServletException | IOException | RuntimeException exception) {
            requestException = exception;
            throw exception;
        } finally {
            long durationMs = (System.nanoTime() - startedAt) / 1_000_000;
            int status = requestException != null && response.getStatus() < 500
                    ? 500 : response.getStatus();
            String method = sanitize(request.getMethod());
            String path = sanitize(request.getRequestURI());
            String userId = authenticatedUserId();

            String message = "requestId={} method={} path={} status={} durationMs={} userId={}";

            if (status >= 500 || requestException != null) {
                ACCESS_LOG.error(message + " exception={}",
                        requestId, method, path, status, durationMs, userId,
                        requestException == null ? "none" : requestException.getClass().getSimpleName());
            } else if (status >= 400) {
                ACCESS_LOG.warn(message,
                        requestId, method, path, status, durationMs, userId);
            } else {
                ACCESS_LOG.info(message,
                        requestId, method, path, status, durationMs, userId);
            }
        }
    }

    private String authenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuthentication
                && authentication.isAuthenticated()) {
            return sanitize(jwtAuthentication.getToken().getSubject());
        }
        return "anonymous";
    }

    private String sanitize(String value) {
        if (value == null) {
            return "unknown";
        }
        return value.replace('\r', '_').replace('\n', '_').replace('\t', '_');
    }
}
