package com.pfa.service_sinistre.kafka;

import com.pfa.service_sinistre.event.SinistreEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class SinistreEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(SinistreEventConsumer.class);

    @KafkaListener(
            topics = "sinistre-events",
            groupId = "sinistre-group",
            properties = {
                    "spring.json.value.default.type=com.pfa.service_sinistre.event.SinistreEvent"
            }
    )
    public void listen(SinistreEvent event) {
        log.info("📩 Kafka RECEIVED: {} - {}", event.getNumeroSinistre(), event.getStatut());
    }
}