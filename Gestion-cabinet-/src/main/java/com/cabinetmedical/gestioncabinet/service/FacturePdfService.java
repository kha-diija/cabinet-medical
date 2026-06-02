package com.cabinetmedical.gestioncabinet.service;

import com.cabinetmedical.gestioncabinet.model.Facture;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class FacturePdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Couleurs
    private static final Color COLOR_PRIMARY = new Color(59, 130, 246);
    private static final Color COLOR_SUCCESS = new Color(16, 185, 129);
    private static final Color COLOR_GRAY_LIGHT = new Color(243, 244, 246);
    private static final Color COLOR_GRAY_MEDIUM = new Color(107, 114, 128);
    private static final Color COLOR_GRAY_DARK = new Color(55, 65, 81);
    private static final Color COLOR_WHITE = Color.WHITE;

    /**
     * Génère un PDF pour une facture donnée
     */
    public byte[] genererPdfFacture(Facture facture) throws DocumentException, IOException {
        log.info("🖨️ Génération du PDF pour la facture {}", facture.getIdFacture());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            // En-tête Cabinet
            addCabinetHeader(document, facture);
            document.add(new Paragraph(" ")); // Espacement

            // Informations Facture
            addFactureInfo(document, facture);
            document.add(new Paragraph(" "));

            // Informations Patient
            addPatientInfo(document, facture);
            document.add(new Paragraph(" "));

            // Tableau Détails
            addDetailsTable(document, facture);
            document.add(new Paragraph(" "));

            // Total
            addTotal(document, facture);
            document.add(new Paragraph(" "));

            // Pied de page
            addFooter(document, facture);

            document.close();

            log.info("✅ PDF généré avec succès pour la facture {}", facture.getIdFacture());

        } catch (DocumentException e) {
            if (document.isOpen()) {
                document.close();
            }
            log.error("❌ Erreur lors de la génération du PDF", e);
            throw e;
        }

        return baos.toByteArray();
    }

    /**
     * Ajoute l'en-tête du cabinet
     */
    private void addCabinetHeader(Document document, Facture facture) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, COLOR_PRIMARY);
        Font subtitleFont = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_GRAY_MEDIUM);

        // Nom du cabinet
        Paragraph title = new Paragraph(facture.getCabinet().getNom(), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        // Spécialité
        if (facture.getCabinet().getSpecialite() != null) {
            Paragraph subtitle = new Paragraph(facture.getCabinet().getSpecialite(), subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            document.add(subtitle);
        }

        // Adresse
        if (facture.getCabinet().getAdresse() != null) {
            Paragraph adresse = new Paragraph(facture.getCabinet().getAdresse(), subtitleFont);
            adresse.setAlignment(Element.ALIGN_CENTER);
            document.add(adresse);
        }

        // Téléphone
        if (facture.getCabinet().getTel() != null) {
            Paragraph tel = new Paragraph("Tél: " + facture.getCabinet().getTel(), subtitleFont);
            tel.setAlignment(Element.ALIGN_CENTER);
            document.add(tel);
        }

        // Ligne de séparation
        document.add(new Paragraph(" "));
        com.lowagie.text.pdf.draw.LineSeparator line =
                new com.lowagie.text.pdf.draw.LineSeparator(1, 100, COLOR_GRAY_LIGHT, Element.ALIGN_CENTER, -2);
        document.add(new Chunk(line));
    }

    /**
     * Ajoute les informations de la facture
     */
    private void addFactureInfo(Document document, Facture facture) throws DocumentException {
        Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD, COLOR_GRAY_DARK);
        Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_GRAY_DARK);

        // Numéro de facture
        Paragraph factureTitle = new Paragraph("FACTURE N° " + facture.getIdFacture(), titleFont);
        factureTitle.setAlignment(Element.ALIGN_RIGHT);
        document.add(factureTitle);

        // Date d'émission
        Paragraph dateEmission = new Paragraph(
                "Date d'émission: " + facture.getDateEmission().format(DATE_FORMATTER),
                normalFont
        );
        dateEmission.setAlignment(Element.ALIGN_RIGHT);
        document.add(dateEmission);

        // Date de paiement (si payée)
        if (facture.getDatePaiement() != null) {
            Paragraph datePaiement = new Paragraph(
                    "Date de paiement: " + facture.getDatePaiement().format(DATE_FORMATTER),
                    normalFont
            );
            datePaiement.setAlignment(Element.ALIGN_RIGHT);
            document.add(datePaiement);
        }
    }

    /**
     * Ajoute les informations du patient
     */
    private void addPatientInfo(Document document, Facture facture) throws DocumentException {
        Font boldFont = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_GRAY_DARK);
        Font normalFont = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_GRAY_DARK);

        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_LEFT);

        // En-tête "PATIENT"
        PdfPCell headerCell = new PdfPCell(new Phrase("PATIENT", boldFont));
        headerCell.setBackgroundColor(COLOR_GRAY_LIGHT);
        headerCell.setPadding(8);
        headerCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(headerCell);

        // Informations du patient
        StringBuilder patientInfo = new StringBuilder();
        patientInfo.append(facture.getPatient().getNom())
                .append(" ")
                .append(facture.getPatient().getPrenom());

        if (facture.getPatient().getCin() != null && !facture.getPatient().getCin().isEmpty()) {
            patientInfo.append("\nCIN: ").append(facture.getPatient().getCin());
        }

        if (facture.getPatient().getTelephone() != null && !facture.getPatient().getTelephone().isEmpty()) {
            patientInfo.append("\nTél: ").append(facture.getPatient().getTelephone());
        }

        if (facture.getPatient().getEmail() != null && !facture.getPatient().getEmail().isEmpty()) {
            patientInfo.append("\nEmail: ").append(facture.getPatient().getEmail());
        }

        PdfPCell infoCell = new PdfPCell(new Phrase(patientInfo.toString(), normalFont));
        infoCell.setPadding(8);
        infoCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(infoCell);

        document.add(table);
    }

    /**
     * Ajoute le tableau des détails
     */
    private void addDetailsTable(Document document, Facture facture) throws DocumentException {
        Font headerFont = new Font(Font.HELVETICA, 11, Font.BOLD, COLOR_WHITE);
        Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_GRAY_DARK);
        Font boldCellFont = new Font(Font.HELVETICA, 10, Font.BOLD, COLOR_GRAY_DARK);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3, 1, 1.5f, 1.5f});

        // En-têtes du tableau
        addTableHeader(table, "Désignation", headerFont, COLOR_PRIMARY);
        addTableHeader(table, "Qté", headerFont, COLOR_PRIMARY);
        addTableHeader(table, "Prix unitaire", headerFont, COLOR_PRIMARY);
        addTableHeader(table, "Total", headerFont, COLOR_PRIMARY);

        // Ligne de consultation
        String designation = "Consultation médicale";
        if (facture.getConsultation() != null &&
                facture.getConsultation().getMotif() != null &&
                !facture.getConsultation().getMotif().isEmpty()) {
            designation += "\n" + facture.getConsultation().getMotif();
        }

        addTableCell(table, designation, cellFont, Element.ALIGN_LEFT);
        addTableCell(table, "1", cellFont, Element.ALIGN_CENTER);
        addTableCell(table, facture.getMontant() + " DH", cellFont, Element.ALIGN_RIGHT);
        addTableCell(table, facture.getMontant() + " DH", boldCellFont, Element.ALIGN_RIGHT);

        document.add(table);
    }

    /**
     * Ajoute le total
     */
    private void addTotal(Document document, Facture facture) throws DocumentException {
        Font totalFont = new Font(Font.HELVETICA, 14, Font.BOLD, COLOR_SUCCESS);
        Font labelFont = new Font(Font.HELVETICA, 12, Font.BOLD, COLOR_GRAY_DARK);
        Font modeFont = new Font(Font.HELVETICA, 10, Font.NORMAL, COLOR_GRAY_DARK);

        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        // Total à payer
        PdfPCell labelCell = new PdfPCell(new Phrase("TOTAL À PAYER", labelFont));
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(8);
        table.addCell(labelCell);

        PdfPCell totalCell = new PdfPCell(new Phrase(facture.getMontant() + " DH", totalFont));
        totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalCell.setBackgroundColor(new Color(239, 246, 255));
        totalCell.setPadding(8);
        totalCell.setBorder(Rectangle.BOX);
        table.addCell(totalCell);

        // Mode de paiement
        PdfPCell modeLabel = new PdfPCell(new Phrase("Mode de paiement:", modeFont));
        modeLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        modeLabel.setBorder(Rectangle.NO_BORDER);
        modeLabel.setPadding(8);
        table.addCell(modeLabel);

        PdfPCell modeValue = new PdfPCell(new Phrase(getModePaiementLabel(facture.getModePaiement()), modeFont));
        modeValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        modeValue.setBorder(Rectangle.NO_BORDER);
        modeValue.setPadding(8);
        table.addCell(modeValue);

        // Statut
        PdfPCell statutLabel = new PdfPCell(new Phrase("Statut:", modeFont));
        statutLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
        statutLabel.setBorder(Rectangle.NO_BORDER);
        statutLabel.setPadding(8);
        table.addCell(statutLabel);

        Font statutFont = new Font(Font.HELVETICA, 10, Font.BOLD, getStatutColor(facture.getStatut()));
        PdfPCell statutValue = new PdfPCell(new Phrase(getStatutLabel(facture.getStatut()), statutFont));
        statutValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        statutValue.setBorder(Rectangle.NO_BORDER);
        statutValue.setPadding(8);
        table.addCell(statutValue);

        document.add(table);
    }

    /**
     * Ajoute le pied de page
     */
    private void addFooter(Document document, Facture facture) throws DocumentException {
        Font footerFont = new Font(Font.HELVETICA, 9, Font.ITALIC, COLOR_GRAY_MEDIUM);

        Paragraph footer = new Paragraph(
                "Cette facture est générée électroniquement et ne nécessite pas de signature.\n" +
                        "Merci de votre confiance.",
                footerFont
        );
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        // Ligne de séparation
        com.lowagie.text.pdf.draw.LineSeparator line =
                new com.lowagie.text.pdf.draw.LineSeparator(0.5f, 100, COLOR_GRAY_LIGHT, Element.ALIGN_CENTER, -2);
        document.add(new Chunk(line));

        // Date de génération
        Paragraph dateGeneration = new Paragraph(
                "Document généré le " + java.time.LocalDate.now().format(DATE_FORMATTER),
                new Font(Font.HELVETICA, 8, Font.NORMAL, COLOR_GRAY_MEDIUM)
        );
        dateGeneration.setAlignment(Element.ALIGN_CENTER);
        document.add(dateGeneration);
    }

    /**
     * Ajoute une cellule d'en-tête au tableau
     */
    private void addTableHeader(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOX);
        table.addCell(cell);
    }

    /**
     * Ajoute une cellule standard au tableau
     */
    private void addTableCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(8);
        cell.setBorder(Rectangle.BOX);
        table.addCell(cell);
    }

    /**
     * Retourne le label du mode de paiement
     */
    private String getModePaiementLabel(Facture.ModePaiement mode) {
        return switch (mode) {
            case ESPECES -> "Espèces";
            case CARTE -> "Carte bancaire";
            case CHEQUE -> "Chèque";
            case ASSURANCE -> "Assurance";
        };
    }

    /**
     * Retourne le label du statut
     */
    private String getStatutLabel(Facture.Statut statut) {
        return switch (statut) {
            case PAYEE -> "PAYÉE";
            case EN_ATTENTE -> "EN ATTENTE";
            case ANNULEE -> "ANNULÉE";
        };
    }

    /**
     * Retourne la couleur associée au statut
     */
    private Color getStatutColor(Facture.Statut statut) {
        return switch (statut) {
            case PAYEE -> COLOR_SUCCESS;
            case EN_ATTENTE -> new Color(245, 158, 11); // Orange
            case ANNULEE -> new Color(239, 68, 68); // Rouge
        };
    }
}