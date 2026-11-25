package com.gencand.gencand_api.repository;
import com.gencand.gencand_api.entity.CandidaturaContato;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
public interface CandidaturaContatoRepository extends JpaRepository<CandidaturaContato,UUID> {
 List<CandidaturaContato> findByCandidaturaIdOrderByContatoNomeAsc(UUID candidaturaId);
 Optional<CandidaturaContato> findByCandidaturaIdAndContatoId(UUID candidaturaId, UUID contatoId);
}
