package com.cabinetmedical.gestioncabinet.service.medecin;

import com.cabinetmedical.gestioncabinet.dto.medecin.*;
import com.cabinetmedical.gestioncabinet.model.*;
import com.cabinetmedical.gestioncabinet.repository.medecin.DashboardRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.NotificationMedRepository;
import com.cabinetmedical.gestioncabinet.repository.medecin.PatientEnCoursMedRepository;
import com.cabinetmedical.gestioncabinet.service.mapper.DashboardMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
 import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final DashboardRepository dashboardRepository;
    private final NotificationMedRepository notificationMedRepository;
    private final PatientEnCoursMedRepository patientEnCoursMedRepository;
    private final DashboardMapper dashboardMapper;

    @Transactional(readOnly = true)
    public DashboardDataDTO getDashboardData(Integer medecinId, Integer cabinetId) {
        log.info("=== DEBUT getDashboardData - Medecin: {}, Cabinet: {} ===", medecinId, cabinetId);
         LocalDate today = LocalDate.now();
        //ocalDate today = LocalDate.of(2025, 12, 12); // Forcer pour tester

        DashboardDataDTO dashboardData = new DashboardDataDTO();

        try {
            // 1. Récupérer les statistiques avec nouveaux patients
            DashboardStatsDTO stats = getDashboardStats(medecinId, cabinetId, today);
            dashboardData.setStats(stats);
            log.info("✅ Stats calculées - Nouveaux patients: {}", stats.getNouveauxPatients());

            // 2. Récupérer les rendez-vous du jour
            List<RendezVous> todayRendezVous = dashboardRepository.getTodayAppointments(medecinId, today);
            List<DashboardAppointmentDTO> todayAppointments = dashboardMapper.toAppointmentDTOs(todayRendezVous);
            dashboardData.setTodayAppointments(todayAppointments);
            log.info("✅ Rendez-vous du jour: {}", todayAppointments.size());

            // 3. Récupérer les notifications non lues
            List<Notification> notifications = dashboardRepository.getUnreadNotifications(medecinId);
            List<DashboardNotificationDTO> notificationDTOs = dashboardMapper.toNotificationDTOs(notifications);
            dashboardData.setNotifications(notificationDTOs);
            log.info("✅ Notifications non lues: {}", notificationDTOs.size());

            // 4. Récupérer le patient en cours
            DashboardPatientEnCoursDTO currentPatient = getCurrentPatient(medecinId);
            dashboardData.setCurrentPatient(currentPatient);

            // 5. Récupérer le patient suivant
            DashboardPatientSuivantDTO nextPatient = getNextPatient(medecinId, today);
            dashboardData.setNextPatient(nextPatient);

            // 6. Évolution hebdomadaire

            dashboardData.setConsultationTrend(getConsultationTrend(medecinId, today));
            // 7. Types de consultations
            List<ConsultationTypeDTO> consultationTypes = getConsultationTypesSimplified(medecinId, today);
            dashboardData.setConsultationTypes(consultationTypes);

            // 8. Examens prescrits
            List<ExamStatDTO> examStats = getExamStatsSimplified();
            dashboardData.setExamStats(examStats);

            log.info("=== FIN getDashboardData ===");
            return dashboardData;

        } catch (Exception e) {
            log.error("❌ Erreur dans getDashboardData: ", e);
            throw e;
        }
    }

    private DashboardStatsDTO getDashboardStats(Integer medecinId, Integer cabinetId, LocalDate today) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        try {
            // Statistiques de base
            Integer consultationsToday = dashboardRepository.countConsultationsByMedecinAndDate(medecinId, today);
            Integer nouvellesConsultations = dashboardRepository.countNouvellesConsultations(medecinId, today);
            Integer controles = dashboardRepository.countControles(medecinId, today);
            Integer totalRendezVous = dashboardRepository.countRendezVousByMedecinAndDate(medecinId, today);
            Integer confirmes = dashboardRepository.countConfirmes(medecinId, today);
            Integer enAttente = dashboardRepository.countEnAttente(medecinId, today);
            Integer termines = dashboardRepository.countTermines(medecinId, today);
            Integer annules = dashboardRepository.countAnnules(medecinId, today);

            // ✅ NOUVEAUX PATIENTS - 7 derniers jours
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(7);
            Integer nouveauxPatients = dashboardRepository.countNewPatientsThisWeek(cabinetId, oneWeekAgo);
            log.info("📊 Nouveaux patients cette semaine: {}", nouveauxPatients);

            // Calculer le changement vs hier
            LocalDate yesterday = today.minusDays(1);
            Integer consultationsYesterday = dashboardRepository.countConsultationsByMedecinAndDate(medecinId, yesterday);
            Integer consultationsChange = consultationsToday - (consultationsYesterday != null ? consultationsYesterday : 0);

            // Remplir le DTO avec valeurs null-safe
            stats.setConsultationsToday(consultationsToday != null ? consultationsToday : 0);
            stats.setConsultationsChange(consultationsChange);
            stats.setNouvellesConsultations(nouvellesConsultations != null ? nouvellesConsultations : 0);
            stats.setControles(controles != null ? controles : 0);
            stats.setNouveauxPatients(nouveauxPatients != null ? nouveauxPatients : 0); // ✅ CALCULÉ
            stats.setTotalRendezVous(totalRendezVous != null ? totalRendezVous : 0);
            stats.setConfirmes(confirmes != null ? confirmes : 0);
            stats.setEnAttente(enAttente != null ? enAttente : 0);
            stats.setTermines(termines != null ? termines : 0);
            stats.setAnnules(annules != null ? annules : 0);

            log.info("✅ Stats - Consultations: {}, Nouveaux: {}, Contrôles: {}, Nouveaux patients: {}",
                    consultationsToday, nouvellesConsultations, controles, nouveauxPatients);

        } catch (Exception e) {
            log.error("❌ Erreur dans getDashboardStats: ", e);
            // Valeurs par défaut en cas d'erreur
            stats.setConsultationsToday(0);
            stats.setConsultationsChange(0);
            stats.setNouvellesConsultations(0);
            stats.setControles(0);
            stats.setNouveauxPatients(0);
            stats.setTotalRendezVous(0);
            stats.setConfirmes(0);
            stats.setEnAttente(0);
            stats.setTermines(0);
            stats.setAnnules(0);
        }

        return stats;
    }

    // REMPLACER la méthode getConsultationTrendSimplified par celle-ci dans DashboardService.java

    private List<ConsultationTrendDTO> getConsultationTrend(Integer medecinId, LocalDate today) {
        LocalDate startDate = today.minusDays(6);
        LocalDate endDate = today;
        log.info("📊 Date du jour: {}", today);
        log.info("📊 Date du jour - 6 jours: {}", today.minusDays(6));
        log.info("📊 Récupération tendance consultations du {} au {}", startDate, endDate);
        log.info("📊 Médecin ID: {}", medecinId);

        try {
            // Récupérer les données de la base de données
            List<Object[]> rawData = dashboardRepository.getWeeklyTrend(medecinId);

            log.info("🔍 Données brutes reçues: {} lignes", rawData.size());

            // Log chaque ligne reçue
            for (int i = 0; i < rawData.size(); i++) {
                Object[] row = rawData.get(i);
                log.info("Ligne {}: {}", i, Arrays.toString(row));
            }

            // Mapper les jours anglais vers français
            Map<String, String> dayMapping = new HashMap<>();
            dayMapping.put("Mon", "Lun");
            dayMapping.put("Tue", "Mar");
            dayMapping.put("Wed", "Mer");
            dayMapping.put("Thu", "Jeu");
            dayMapping.put("Fri", "Ven");
            dayMapping.put("Sat", "Sam");
            dayMapping.put("Sun", "Dim");

            // Créer la liste des résultats
            List<ConsultationTrendDTO> trendDTOs = new ArrayList<>();

            for (Object[] row : rawData) {
                if (row.length >= 3) { // Vérifiez que vous avez au moins 3 colonnes
                    String dayEn = (String) row[0];  // "Mon", "Tue", etc.
                    Number countNumber = (Number) row[1];
                    Integer count = countNumber != null ? countNumber.intValue() : 0;
                    java.sql.Date sqlDate = (java.sql.Date) row[2];
                    LocalDate date = sqlDate != null ? sqlDate.toLocalDate() : null;

                    ConsultationTrendDTO dto = new ConsultationTrendDTO();
                    dto.setDay(dayMapping.getOrDefault(dayEn, dayEn));
                    dto.setCount(count);
                    dto.setDate(date);

                    trendDTOs.add(dto);

                    log.info("📅 {} ({}): {} consultations", dto.getDay(), date, count);
                } else {
                    log.warn("Ligne ignorée - nombre de colonnes insuffisant: {}", Arrays.toString(row));
                }
            }

            // Si aucune donnée n'est retournée, créer des données par défaut
            if (trendDTOs.isEmpty()) {
                log.warn("⚠️ Aucune donnée retournée par la requête, création de données par défaut");
                trendDTOs = createDefaultTrendData();
            }

            log.info("✅ Tendance calculée: {} jours avec {} consultations au total",
                    trendDTOs.size(),
                    trendDTOs.stream().mapToInt(ConsultationTrendDTO::getCount).sum());

            return trendDTOs;

        } catch (Exception e) {
            log.error("❌ Erreur dans getConsultationTrend: ", e);
            // Retourner des données par défaut en cas d'erreur
            return createDefaultTrendData();
        }
    }

    private List<ConsultationTrendDTO> createDefaultTrendData() {
        List<ConsultationTrendDTO> defaultData = new ArrayList<>();
        String[] jours = {"Sam", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven"};

        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            ConsultationTrendDTO dto = new ConsultationTrendDTO();
            dto.setDay(jours[i]); // Ajustez l'index selon votre besoin
            dto.setCount(0);
            dto.setDate(date);
            defaultData.add(dto);
        }
        return defaultData;
    }

    private List<ConsultationTypeDTO> getConsultationTypesSimplified(Integer medecinId, LocalDate today) {
        List<ConsultationTypeDTO> typeDTOs = new ArrayList<>();

        ConsultationTypeDTO nouvelle = new ConsultationTypeDTO();
        nouvelle.setType("NOUVELLE");
        nouvelle.setPercentage(60.0);
        nouvelle.setColor("#3b82f6");
        typeDTOs.add(nouvelle);

        ConsultationTypeDTO controle = new ConsultationTypeDTO();
        controle.setType("CONTROLE");
        controle.setPercentage(40.0);
        controle.setColor("#10b981");
        typeDTOs.add(controle);

        return typeDTOs;
    }

    private List<ExamStatDTO> getExamStatsSimplified() {
        List<ExamStatDTO> examDTOs = new ArrayList<>();

        ExamStatDTO exam1 = new ExamStatDTO();
        exam1.setTypeExamen("Radiographie");
        exam1.setCount(5);
        examDTOs.add(exam1);

        ExamStatDTO exam2 = new ExamStatDTO();
        exam2.setTypeExamen("Analyse sanguine");
        exam2.setCount(3);
        examDTOs.add(exam2);

        return examDTOs;
    }

    private DashboardPatientEnCoursDTO getCurrentPatient(Integer medecinId) {
        try {
            LocalDate today = LocalDate.now();
            List<RendezVous> currentPatients = dashboardRepository.getCurrentPatients(medecinId, today);

            if (currentPatients != null && !currentPatients.isEmpty()) {
                // Créer le DTO manuellement
                RendezVous rdv = currentPatients.get(0);
                Patient patient = rdv.getPatient();

                DashboardPatientEnCoursDTO dto = new DashboardPatientEnCoursDTO();
                dto.setId(patient.getId());
                dto.setNom(patient.getNom());
                dto.setPrenom(patient.getPrenom());
                dto.setCin(patient.getCin());
                dto.setDateNaissance(patient.getDateNaissance());
                dto.setNumTel(patient.getNumTel());
                // Ajouter d'autres champs si nécessaire

                return dto;
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du patient en cours: ", e);
        }
        return null;
    }

    @Transactional
    public void completeCurrentPatient(Integer medecinId) {
        try {
            log.info("Terminaison du patient en cours pour le médecin: {}", medecinId);

            LocalDate today = LocalDate.now();

            // 1. Récupérer le rendez-vous EN_COURS
            List<RendezVous> currentPatients = dashboardRepository.getCurrentPatients(medecinId, today);

            log.info("Nombre de rendez-vous EN_COURS trouvés: {}", currentPatients.size());

            if (currentPatients.isEmpty()) {
                log.warn("Aucun patient en cours (EN_COURS) pour le médecin {}", medecinId);
                throw new RuntimeException("Aucun patient en cours");
            }

            RendezVous rendezVous = currentPatients.get(0);

            // 2. Mettre à jour le statut du rendez-vous
            rendezVous.setStatut(RendezVous.Statut.TERMINE);
            dashboardRepository.save(rendezVous);

            log.info("✅ Rendez-vous {} marqué comme TERMINE pour le patient {} {}",
                    rendezVous.getIdRendezVous(),
                    rendezVous.getPatient().getNom(),
                    rendezVous.getPatient().getPrenom());

        } catch (Exception e) {
            log.error("❌ Erreur lors de la terminaison du patient: ", e);
            throw new RuntimeException("Erreur lors de la terminaison du patient", e);
        }
    }

    public void startConsultation(Integer appointmentId) {
        try {
            Optional<RendezVous> rdvOpt = dashboardRepository.findById(appointmentId);
            if (rdvOpt.isPresent()) {
                RendezVous rdv = rdvOpt.get();
                rdv.setStatut(RendezVous.Statut.EN_COURS);
                dashboardRepository.save(rdv);
                log.info("Consultation démarrée pour RDV {}", appointmentId);
            }
        } catch (Exception e) {
            log.error("Erreur startConsultation: ", e);
            throw e;
        }
    }

    private DashboardPatientSuivantDTO getNextPatient(Integer medecinId, LocalDate today) {
        try {
            LocalTime currentTime = LocalTime.now();
            List<RendezVous> nextPatients = dashboardRepository.getNextPatient(medecinId, today, currentTime);
            if (nextPatients != null && !nextPatients.isEmpty()) {
                return dashboardMapper.toPatientSuivantDTO(nextPatients.get(0));
            }
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du patient suivant: ", e);
        }
        return null;
    }

    @Transactional
    public void markNotificationAsRead(Integer notificationId, Integer medecinId) {
        try {
            Optional<Notification> notificationOpt = notificationMedRepository.findById(notificationId);
            if (notificationOpt.isPresent()) {
                Notification notification = notificationOpt.get();
                if (notification.getUtilisateur().getId().equals(medecinId)) {
                    notification.setLu(true);
                    notificationMedRepository.save(notification);
                }
            }
        } catch (Exception e) {
            log.error("Erreur dans markNotificationAsRead: ", e);
        }
    }

    @Transactional
    public void markAllNotificationsAsRead(Integer medecinId) {
        try {
            List<Notification> notifications = dashboardRepository.getUnreadNotifications(medecinId);
            for (Notification notification : notifications) {
                notification.setLu(true);
            }
            notificationMedRepository.saveAll(notifications);
        } catch (Exception e) {
            log.error("Erreur dans markAllNotificationsAsRead: ", e);
        }
    }

    @Transactional
    public void updateAppointmentStatus(Integer appointmentId, String status, Integer medecinId) {
        log.info("Mise à jour du statut du rendez-vous {} à {} pour le médecin {}",
                appointmentId, status, medecinId);
    }
}