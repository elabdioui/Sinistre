package com.pfa.service_sinistre.kafka;

import com.pfa.service_sinistre.event.SinistreEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;



    @Service
    public class SinistreEventProducer {

        private static final Logger log = LoggerFactory.getLogger(SinistreEventProducer.class);
        private final KafkaTemplate<String, SinistreEvent> kafkaTemplate;

        public SinistreEventProducer(KafkaTemplate<String, SinistreEvent> kafkaTemplate) {
            this.kafkaTemplate = kafkaTemplate;
        }

        public void send(SinistreEvent event) {
            log.info("📤 Kafka SEND: {} - {}", event.getNumeroSinistre(), event.getStatut());
            kafkaTemplate.send("sinistre-events", event);
        }
    }