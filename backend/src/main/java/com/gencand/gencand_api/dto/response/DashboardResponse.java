package com.gencand.gencand_api.dto.response;
import java.time.LocalDate;
import java.util.Map;
public record DashboardResponse(long total, Map<String,Long> porStatus, LocalDate inicio, LocalDate fim) {}
