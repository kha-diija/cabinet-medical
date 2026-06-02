package com.cabinetmedical.gestioncabinet.service.admin;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // Méthode pour envoyer le mot de passe temporaire par email
    public void sendTemporaryPassword(String toEmail, String tempPwd) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Votre mot de passe temporaire - Cabinet Médical");

        String text = new StringBuilder()
                .append("Bonjour,\n\n")
                .append("Un compte a été créé pour vous sur l'application du cabinet.\n")
                .append("Voici votre mot de passe temporaire qui va etre fonctionnable apres votre paiement  : ").append(tempPwd).append("\n\n")
                .append("Pour votre sécurité, changez ce mot de passe dès votre première connexion.\n\n")
                .append("Cordialement,\nL'équipe du cabinet")
                .toString();

        message.setText(text);
        mailSender.send(message);
    }
    // Dans EmailService.java
    public void sendFacturePaidNotification(String toEmail, Integer factureId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Facture payée - Cabinet Médical");

        String text = new StringBuilder()
                .append("Bonjour,\n\n")
                .append("Votre facture n°").append(factureId).append(" a été marquée comme PAYÉE.\n")
                .append("Merci pour votre règlement.\n\n")
                .append("Cordialement,\nL'équipe du cabinet")
                .toString();

        message.setText(text);
        mailSender.send(message);
    }
    public void sendDemandeRefuseNotification(String toEmail, String commentaire) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Demande de création de compte refusée - Cabinet Médical");

        String text = new StringBuilder()
                .append("Bonjour,\n\n")
                .append("Votre demande de création de cabinet a été refusée.\n")
                .append("Commentaire de l'administration : ").append(commentaire).append("\n\n")
                .append("Cordialement,\nL'équipe du cabinet")
                .toString();

        message.setText(text);
        mailSender.send(message);
    }


}
