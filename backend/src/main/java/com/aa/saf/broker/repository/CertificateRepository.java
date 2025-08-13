package com.aa.saf.broker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.aa.saf.broker.model.Certificate;
import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findAllByOrderByIssueDateDesc();
    Optional<Certificate> findByOrderId(Long orderId);
}
