# 🏥 MediCore — Système de Gestion de Cabinet Médical

> Plateforme web full-stack de gestion de cabinet médical, développée avec React 19, Spring Boot 3 et PostgreSQL (Supabase).

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=json-web-tokens&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Équipe & Répartition](#-équipe--répartition)
- [Fonctionnalités](#-fonctionnalités)
- [Espace Médecin — Documentation complète](#-espace-médecin--documentation-complète)
- [Architecture & Technologies](#-architecture--technologies)
- [Base de données](#-base-de-données)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Sécurité](#-sécurité)
- [Auteurs](#-auteurs)

---

##  Aperçu

**MediCore** est une application web full-stack dédiée à la gestion complète d'un cabinet médical. Elle centralise les flux de travail entre trois types d'acteurs : **l'administrateur système**, **les médecins** et **les secrétaires**.

La plateforme couvre l'ensemble du cycle de vie d'un cabinet : inscription multi-étapes avec validation, gestion des rendez-vous, dossiers médicaux, ordonnances, facturation, messagerie interne en temps réel et tableaux de bord analytiques par rôle.

---

##  Équipe & Répartition

Ce projet a été réalisé en équipe dans le cadre d'un projet académique à l'**ENSA Khouribga** — Université Sultan Moulay Slimane, sous l'encadrement de **Mme Karoum Bouchra** et **Mme Ennaji Fatima Zohra**.

| Membre | Responsabilité principale |
|--------|--------------------------|
| **Khadija Elkartouch** |  **Espace Médecin** — Développement complet de l'interface et des fonctionnalités du médecin (dashboard, consultations, ordonnances, dossiers médicaux, rendez-vous, messagerie, notifications) |
| Omaima Sabri | Espace Secrétaire |
| Assia Houbbadi | Espace Administrateur |
| Aya El Azzouzi | Architecture backend & authentification |


---

##  Fonctionnalités

###  Authentification & Inscription
- **Inscription multi-étapes** — Formulaire guidé en 4 étapes : informations du cabinet → médecin responsable → secrétaire → confirmation avec signature numérique
- **Connexion sécurisée** — JWT avec gestion des rôles (Admin / Médecin / Secrétaire)
- **Réinitialisation du mot de passe** — Envoi d'un lien de réinitialisation par email (Gmail SMTP)
- **Comptes protégés** — Verrouillage après tentatives échouées (`LoginAttemptService`)

###  Espace Administrateur
- **Tableau de bord** — Statistiques globales : cabinets, médecins, patients, factures
- **Gestion des utilisateurs** — CRUD complet (médecins, secrétaires, admins) avec activation/désactivation
- **Gestion des cabinets** — Validation des demandes de création, consultation et modification des profils de cabinets
- **Gestion des médicaments** — Catalogue de médicaments (ajout, modification, suppression)
- **Gestion des factures** — Vue et gestion des factures à l'échelle du système
- **Demandes de création de cabinet** — Workflow d'approbation/refus avec notifications
- **Alertes et notifications** — Système d'alertes temps réel pour les événements critiques

###  Espace Médecin
- **Tableau de bord** — Statistiques personnalisées : consultations du jour, patients en cours, rendez-vous à venir
- **Gestion des rendez-vous** — Calendrier interactif avec vue journalière/hebdomadaire, ajout et modification
- **Dossiers médicaux** — Création et consultation des dossiers patients avec historique complet
- **Consultations** — Enregistrement des consultations avec antécédents, diagnostics et prescriptions
- **Ordonnances** — Génération et gestion des ordonnances avec liste des médicaments
- **Gestion des patients** — Fiche patient détaillée, historique des visites
- **Messagerie interne** — Chat en temps réel avec la secrétaire (texte, audio, emoji)
- **Notifications** — Alertes pour nouveaux rendez-vous, messages et événements

###  Espace Secrétaire
- **Tableau de bord** — Vue d'ensemble des activités du cabinet
- **Gestion des rendez-vous** — Planification, confirmation et annulation des RDV patients
- **Gestion des patients** — Enregistrement et suivi des patients (formulaire modal détaillé)
- **Gestion des factures** — Création, édition et suivi des factures par patient
- **Messagerie** — Communication en temps réel avec le médecin (texte + messages vocaux)
- **Notifications** — Alertes pour nouveaux messages et activités importantes
- **Paramètres** — Configuration du profil et préférences

### 🌐 Page d'Accueil Publique
- Landing page avec présentation des fonctionnalités, témoignages et CTA d'inscription
- Support multilingue (`LanguageSwitcher`)
- Mode clair/sombre (`ThemeSwitcher`)

---

## 👨‍⚕️ Espace Médecin — Documentation complète

> Cette section documente en détail l'espace médecin, **entièrement conçu et développé par Khadija Elkartouch**. Il couvre 9 modules fonctionnels interconnectés, formant un flux de travail clinique complet de bout en bout.

### Vue d'ensemble

L'espace médecin constitue le cœur opérationnel de la plateforme. Il a été conçu pour optimiser le flux de travail clinique : de la prise en charge initiale du patient jusqu'à la prescription, en passant par la gestion des dossiers médicaux et la communication avec l'équipe administrative. Chaque module respecte des règles métier strictes (cycle de vie des rendez-vous, accès conditionné aux modules sensibles) et intègre des retours visuels immédiats pour le médecin.

### Module 1 — Tableau de bord médical
<img width="480" height="230" alt="image" src="https://github.com/user-attachments/assets/61356a89-5195-4dd9-b143-d4aa67ff8e03" />


Le tableau de bord est le point d'entrée principal après connexion. Il offre une **vue clinique personnalisée en temps réel** avec :

**Indicateurs de performance (KPIs) quotidiens :**
- Nombre de consultations du jour avec comparaison par rapport à la veille
- Répartition nouveaux patients vs contrôles (patients de suivi)
- Nombre de nouveaux patients avec évolution hebdomadaire
- Total des rendez-vous du jour avec ventilation par statut

**Analyse hebdomadaire :**
- Graphique à barres verticales (Recharts) visualisant l'activité des 7 derniers jours
- Valeurs numériques affichées sur chaque barre pour faciliter la lecture
- Aperçu modal des rendez-vous du jour (liste condensée, accès rapide)

**Gestion du flux patients :**
- Section **"Patient en cours"** : affichage des informations du patient actuellement en consultation, avec 3 boutons d'action directs — `Dossier` (accès au dossier médical), `Consulter` (démarrage/reprise de la consultation), `Terminer` (clôture et passage au statut TERMINÉ)
- Section **"Patient suivant"** : visualisation du prochain patient en file d'attente, heure du rendez-vous, type de consultation et âge du patient pour préparer la consultation à venir

---

### Module 2 — Gestion des patients
<img width="598" height="276" alt="image" src="https://github.com/user-attachments/assets/7c8b3a3e-5845-42d7-b80e-89a9ff0f030d" />

Interface de recherche et de consultation de la liste des patients du cabinet.

**Fonctionnalités :**
- Barre de recherche avancée filtrante par **nom**, **prénom** ou **CIN** (Carte d'Identité Nationale)
- Compteur dynamique du nombre de résultats affichés
- Cartes patients avec avatar, informations personnelles (âge, sexe, email, adresse)
- Message contextuel personnalisé lorsqu'aucun résultat ne correspond à la recherche

---

### Module 3 — Gestion des rendez-vous
<img width="533" height="254" alt="image" src="https://github.com/user-attachments/assets/6c90679c-1f01-4d17-b0ca-941b97f81da9" />

Module de visualisation et de gestion de l'agenda médical du praticien.

**Fonctionnalités :**
- **Calendrier interactif mensuel** avec navigation entre les mois
- Deux modes d'affichage :
  - `Aujourd'hui` — chargement automatique des rendez-vous du jour
  - `Par date` — sélection libre d'une date spécifique
- **Statistiques quotidiennes** par statut : Total RDV / Confirmés / En attente / Annulés / Terminés
- Gestion complète du **cycle de vie des rendez-vous** selon le diagramme d'états-transitions : `EN_ATTENTE` → `CONFIRME` → `EN_COURS` → `TERMINE` / `ANNULE`

---

### Module 4 — Module de consultation
<img width="383" height="182" alt="image" src="https://github.com/user-attachments/assets/589af661-fe6d-43e2-830e-07fffb9beb54" />

Cœur de l'activité médicale. Ce module permet l'enregistrement structuré des consultations cliniques avec une logique de contrôle d'accès stricte.

**Contrôle d'accès :**
Un patient doit obligatoirement être au statut `EN_COURS` pour permettre la saisie d'une consultation. Ce mécanisme garantit l'association correcte entre la consultation et le patient, prévient les erreurs de saisie, et respecte le flux de travail médical défini.

**Formulaire de consultation :**
- **Informations générales** : type de consultation (sélection), poids et taille du patient avec calcul automatique de l'IMC
- **Observations cliniques** : zone de saisie libre des symptômes, observations médicales et notes de suivi
- **Actions disponibles** : `Réinitialiser` (effacement sans sauvegarde) et `Enregistrer la consultation` (validation et sauvegarde définitive)

**Historique des consultations :**
- Accessible via le bouton `Historique` depuis le formulaire
- Fenêtre modale affichant la chronologie complète des consultations passées du patient
- Badge de type pour chaque consultation, avec bouton d'expansion pour les détails

---

### Module 5 — Gestion des ordonnances
<img width="392" height="183" alt="image" src="https://github.com/user-attachments/assets/f241479a-35fc-414c-bc17-a2b3d8e40539" />

Module de prescription médicale accessible uniquement après l'enregistrement d'une consultation.

**Contrôle d'accès :**
Le système refuse l'accès dans les cas suivants : absence de patient EN_COURS, patient EN_COURS sans consultation enregistrée, patient avec rendez-vous TERMINÉ ou statut incompatible, tentative de prescription sur une consultation passée. Un message guide explicitement le médecin : *"Vous devez d'abord enregistrer une consultation pour ce patient."*

**Ordonnance médicamenteuse :**
- **Autocomplétion intelligente** depuis la base de données des médicaments du cabinet
- Deux scénarios de prescription : sélection directe d'un médicament existant, ou ajout manuel avec détails complets (forme galénique, dosage, laboratoire, DCI)
- Support **multi-médicaments** : ajout de plusieurs lignes de prescription par ordonnance
- **Génération PDF automatique** de l'ordonnance incluant : logo du cabinet, coordonnées du médecin, liste des médicaments prescrits, date et signature

**Ordonnance d'examens :**
- Interface dédiée à la prescription d'examens complémentaires
- Saisie des examens à réaliser avec indication du caractère urgent ou non
- Ajout de plusieurs examens sur la même ordonnance
- Génération et impression d'ordonnances d'examens distinctes
- Enregistrement automatique dans le dossier médical du patient

---

### Module 6 — Gestion du dossier médical
<img width="392" height="178" alt="image" src="https://github.com/user-attachments/assets/09b3bb43-c33e-4af3-a8ef-8c41bcb2084e" />

Référentiel central des informations de santé du patient. L'accès est conditionné à la présence d'un patient EN_COURS (même mécanisme de contrôle que la consultation).

**Contenu du dossier médical :**
- **Informations d'identification** : nom complet, CIN, date de naissance avec âge calculé, téléphone de contact
- **Antécédents médicaux** : historique des pathologies et traitements
- **Antécédents chirurgicaux** : liste des interventions passées
- **Mode édition** : activation via le bouton `Modifier` pour mise à jour en place

**Cas particulier :** si un patient n'a pas encore de dossier médical, le système affiche une interface permettant au médecin de créer un dossier complet dès la première consultation.

---

### Module 7 — Messagerie interne

Système de communication en temps réel entre le médecin et la secrétaire du cabinet.

**Fonctionnalités :**
- **Trois onglets de navigation** : `Reçus` (messages entrants), `Envoyés` (historique des messages envoyés), `Nouveau` (composition d'un nouveau message)
- **Liste des conversations** avec affichage chronologique : avatar et nom de la secrétaire, aperçu du dernier message, horodatage relatif ou absolu, indicateurs de nouveaux messages ou messages vocaux
- **Zone de conversation détaillée** lors de la sélection d'une conversation
- **Support multimédia** : messages textuels, émojis et **messages audio** (enregistrement vocal intégré)
- Persistance complète des conversations et **synchronisation en temps réel** via le backend

---

### Module 8 — Paramètres et sécurité
<img width="582" height="255" alt="image" src="https://github.com/user-attachments/assets/bb3d76c5-d5d6-424c-85c1-ab5e5c9646a4" />

Interface dédiée à la gestion du compte et à la sécurité des accès du médecin.

**Modification du mot de passe avec validation stricte :**
- Vérification obligatoire de l'ancien mot de passe avant modification
- Confirmation par double saisie pour éviter les erreurs de frappe
- **Validation en temps réel** des 5 critères de sécurité avec indicateurs visuels :
  - Au moins 8 caractères
  - Au moins une lettre majuscule
  - Au moins une lettre minuscule
  - Au moins un chiffre
  - Au moins un caractère spécial
- Barre de progression colorée indiquant la force du mot de passe (Faible / Moyen / Fort)
- Cases à cocher dynamiques (vertes/vides) pour chaque critère
- Soumission bloquée tant que tous les critères ne sont pas satisfaits

---

### Module 9 — Notifications
<img width="553" height="202" alt="image" src="https://github.com/user-attachments/assets/70350935-075d-47b7-b7e9-2a5d086a6850" />

Système de réception des alertes envoyées par la secrétaire, accessible via la barre de navigation.

**Types de notifications reçues :**
- Nouveaux patients enregistrés dans le cabinet
- Patients actuellement en cours de consultation (en salle d'attente)
- Changements de statut des rendez-vous
- Messages urgents de la secrétaire
- Rappels de rendez-vous importants

**Format des notifications :**
- Titre descriptif de l'événement
- Informations essentielles contextuelles
- Horodatage précis

---

### Architecture frontend de l'espace médecin

L'espace médecin adopte une **organisation feature-first**, chaque module étant autonome avec ses propres composants, services et états locaux.

```
frontend/src/medecin/
│
├── pages/
│   ├── Dashboard/              # Tableau de bord (KPIs, graphiques, patient en cours)
│   ├── PatientListPage/        # Liste et recherche des patients
│   ├── RendezVousPage/         # Calendrier interactif des rendez-vous
│   ├── ConsultationPage/       # Formulaire consultation + historique
│   ├── OrdonnancesPage/        # Prescription médicaments & examens + PDF
│   ├── DossierMedicalPage/     # Dossier médical patient (antécédents)
│   ├── Messagerie/             # Chat temps réel (texte + audio + emoji)
│   │   ├── AudioPlayer.jsx     # Lecteur de messages audio
│   │   ├── AudioRecorder.jsx   # Enregistrement vocal
│   │   ├── Avatar.jsx
│   │   └── EmojiPicker.jsx
│   └── Parametres/             # Sécurité & mot de passe
│
├── components/
│   ├── layout/
│   │   ├── Layout/             # Layout général de l'espace médecin
│   │   ├── Navbar/             # Barre de navigation + cloche notifications
│   │   └── Sidebar/            # Menu latéral avec navigation entre modules
│   ├── ConsultationHistoryModal/  # Modal historique des consultations
│   ├── MiniCalendrier/            # Composant calendrier réutilisable
│   └── ProtectedRoute.jsx         # Protection des routes par rôle MEDECIN
│
└── contexts/
    ├── ThemeContext.jsx         # Gestion du mode clair/sombre
    └── themeConstants.jsx      # Variables de thème
```

### Backend dédié à l'espace médecin

```
controller/medecin/
├── ConsultationController.java        # POST /consultation, GET /historique
├── DossierMedicalController.java      # GET/PUT /dossier/{patientId}
├── OrdonnanceController.java          # POST /ordonnance, génération PDF
├── MedecinRendezVousController.java   # GET /rdv, PATCH /rdv/{id}/statut
├── PatientmedController.java          # GET /patients, recherche
├── MedecinMessagerieController.java   # GET/POST /messages
├── NotificationMedController.java     # GET /notifications
└── MMedecinPasswordController.java    # PATCH /password

service/medecin/
├── ConsultationService.java           # Logique consultation + accès conditionné
├── DossierMedicalService.java         # Gestion des dossiers médicaux
├── OrdonnanceService.java             # Prescription + génération PDF ordonnance
├── DashboardService.java              # Calcul des KPIs et statistiques
├── MedecinMessagerieServiceImpl.java  # Messagerie temps réel
└── NotificationMedService.java        # Gestion des alertes médecin
```

### Conformité fonctionnelle

L'espace médecin implémente fidèlement les **9 fonctionnalités principales** définies dans le backlog produit :

| # | Module | Fonctionnalité clé |
|---|--------|--------------------|
| 1 | Dashboard | KPIs quotidiens, graphique hebdomadaire, patient en cours/suivant |
| 2 | Patients | Recherche multi-critères, compteur de résultats, message contextuel |
| 3 | Rendez-vous | Calendrier interactif, statistiques par statut, transitions d'état conformes |
| 4 | Consultation | Accès conditionné `EN_COURS`, formulaire complet, historique modal |
| 5 | Ordonnances | Accès conditionné à une consultation enregistrée, autocomplétion, génération PDF |
| 6 | Dossier médical | Accès conditionné, antécédents médicaux & chirurgicaux, mode édition |
| 7 | Messagerie | Communication temps réel, support multimédia, historique persistant |
| 8 | Paramètres | Changement de mot de passe avec validation stricte en 5 critères |
| 9 | Notifications | Réception des alertes secrétaire via la navbar, horodatage précis |

---

##  Architecture & Technologies

| Couche | Technologie |
|--------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="18"/> Frontend | React 19 (Vite 7) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" width="18"/> Backend | Spring Boot 3.2 (Java) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="18"/> Base de données | PostgreSQL via Supabase |
|  Stockage fichiers | Supabase Storage (documents, logos) |
|  Style | Tailwind CSS 4.x |
|  Auth | JWT (jjwt 0.11.5) + Spring Security |
|  Email | Spring Mail (SMTP Gmail) |
|  Graphiques | Recharts |
|  HTTP Client | Axios |

**Patterns & librairies clés :**
- Architecture **SPA** avec React Router DOM v7 et routes protégées par rôle
- **API RESTful** Spring Boot avec sécurité basée sur les rôles
- **Supabase Storage** pour le stockage des documents médicaux et logos de cabinet
- **Spring Data JPA / Hibernate** avec dialecte PostgreSQL
- **Multer-like** côté Spring (`MultipartFile`) pour les uploads de fichiers
- **PDF generation** via `FacturePdfService` (iText / Apache PDFBox)
- **Lucide React + React Icons** pour les composants visuels

---

##  Base de données

La plateforme utilise **PostgreSQL** hébergé sur **Supabase**, avec Spring Data JPA / Hibernate. Le schéma est géré automatiquement via `ddl-auto=update`.

### Entités principales

| Entité | Description |
|--------|-------------|
| `Utilisateur` | Compte utilisateur avec rôle (ADMIN / MEDECIN / SECRETAIRE), informations personnelles et accès |
| `Cabinet` | Profil du cabinet médical (nom, adresse, logo, médecin responsable) |
| `DemandeCreationCabinet` | Workflow de demande d'ouverture d'un cabinet avec état d'approbation |
| `Patient` | Dossier patient (identité, coordonnées, informations médicales de base) |
| `RendezVous` | Rendez-vous avec statut, date, heure, médecin et patient associés |
| `Consultation` | Compte-rendu de consultation avec anamnèse, diagnostic et actes réalisés |
| `DossierMedical` | Dossier médical complet regroupant l'historique des consultations d'un patient |
| `Ordonnance` | Ordonnances générées avec liste des médicaments et posologies |
| `Facture` | Facturation avec détail des actes, montant et statut de paiement |
| `Medicament` | Catalogue de médicaments avec dénomination, forme et dosage |
| `Messagerie` | Messages entre utilisateurs du cabinet (texte ou fichier audio) |
| `Notification` | Alertes internes (nouveaux RDV, messages, demandes) avec état de lecture |
| `AlerteAdmin` | Alertes spécifiques à l'administrateur système |
| `PasswordResetToken` | Token de réinitialisation de mot de passe avec expiration |

---

## 📁 Structure du projet

```
Gestion-cabinet-/
│
├── pom.xml                                      # Dépendances Maven (Spring Boot 3.2)
│
├── src/main/java/com/cabinetmedical/
│   └── gestioncabinet/
│       ├── GestioncabinetApplication.java       # Point d'entrée Spring Boot
│       │
│       ├── config/                              # Configuration Spring (CORS, Security, Mail)
│       │
│       ├── controller/                          # Contrôleurs REST
│       │   ├── AuthController.java              # Connexion, inscription, refresh token
│       │   ├── InscriptionController.java       # Workflow d'inscription multi-étapes
│       │   ├── PatientController.java           # CRUD patients
│       │   ├── RendezVousController.java        # Gestion des rendez-vous
│       │   ├── FactureController.java           # Facturation
│       │   ├── MessagerieController.java        # Messages (secrétaire ↔ médecin)
│       │   ├── NotificationController.java      # Notifications
│       │   ├── DashboardController.java         # Statistiques globales
│       │   ├── admin/                           # Contrôleurs réservés à l'admin
│       │   │   ├── CabinetController.java
│       │   │   ├── UtilisateurControllerAdmin.java
│       │   │   ├── MedicamentController.java
│       │   │   ├── AdminFactureController.java
│       │   │   └── DemandeCreationCabinetAdminController.java
│       │   └── medecin/                         # Contrôleurs espace médecin
│       │       ├── ConsultationController.java
│       │       ├── DossierMedicalController.java
│       │       ├── OrdonnanceController.java
│       │       ├── MedecinRendezVousController.java
│       │       ├── PatientmedController.java
│       │       ├── MedecinMessagerieController.java
│       │       └── NotificationMedController.java
│       │
│       ├── model/                               # Entités JPA
│       ├── repository/                          # Interfaces Spring Data JPA
│       ├── service/                             # Logique métier
│       │   ├── impl/                            # Implémentations
│       │   ├── admin/                           # Services admin
│       │   └── medecin/                         # Services médecin
│       └── security/                            # JWT Filter, UserDetailsService
│
├── src/main/resources/
│   ├── application.properties                   # Config datasource, mail, Supabase
│   └── application.yaml
│
└── frontend/                                    # React 19 (Vite)
    ├── package.json
    ├── vite.config.js
    ├── routes/
    │   ├── AdminRoutes.jsx
    │   ├── MedecinRoutes.jsx
    │   └── SecretaryRoutes.jsx
    └── src/
        ├── App.jsx                              # Routeur principal
        ├── components/
        │   ├── acceuil/                         # Landing page (Hero, Features, CTA, Footer)
        │   ├── auth/                            # Login, ForgotPassword, ResetPassword
        │   │   └── signup/                      # Inscription multi-étapes (4 steps)
        │   ├── Admin/                           # Espace administrateur
        │   │   ├── pages/                       # Dashboard, UserMgmt, MedecinMgmt...
        │   │   ├── layouts/                     # AdminLayout, Header, Sidebar
        │   │   └── services/                    # Appels API admin (Axios)
        │   ├── pages/secretaire/                # Espace secrétaire
        │   │   ├── SecretaireDashboard.jsx
        │   │   ├── GestionRendezVous.jsx
        │   │   ├── GestionPatients.jsx
        │   │   ├── GestionFactures.jsx
        │   │   └── Messagerie.jsx
        │   └── common/                          # Navbar, Sidebar, LoadingSpinner
        └── medecin/                             # Espace médecin (feature-first)
            ├── pages/
            │   ├── Dashboard/
            │   ├── RendezVousPage/
            │   ├── ConsultationPage/
            │   ├── DossierMedicalPage/
            │   ├── OrdonnancesPage/
            │   ├── PatientListPage/
            │   └── Messagerie/
            ├── components/layout/
            └── contexts/                        # ThemeContext (dark/light)
```

---

##  Installation

### Prérequis

- [Java 17+](https://adoptium.net/)
- [Maven 3.8+](https://maven.apache.org/)
- [Node.js 18+](https://nodejs.org/)
- Un projet [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- Un compte Gmail pour l'envoi d'emails

### Étapes

**1. Cloner le dépôt**
```bash
git clone https://github.com/<votre-repo>/cabinet-medical.git
cd cabinet-medical/Gestion-cabinet-
```

**2. Configurer le backend** *(voir section Configuration ci-dessous)*

**3. Lancer le backend**
```bash
./mvnw spring-boot:run
# ou
mvn spring-boot:run
```
> Le serveur démarre sur `http://localhost:8080`

**4. Installer les dépendances du frontend**
```bash
cd frontend
npm install
```

**5. Lancer le frontend**
```bash
npm run dev
```
> L'application est accessible sur `http://localhost:5173`

---

## 🔧 Configuration

### Backend — `src/main/resources/application.properties`

```properties
# Base de données (Supabase PostgreSQL)
spring.datasource.url=jdbc:postgresql://<host>:6543/postgres?sslmode=require&prepareThreshold=0
spring.datasource.username=<supabase_user>
spring.datasource.password=<supabase_password>
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Serveur
server.port=8080

# Email (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=votre.email@gmail.com
spring.mail.password=votre_mot_de_passe_application

# Supabase Storage
supabase.url=https://<project-ref>.supabase.co
supabase.api.key=<supabase_service_role_key>
supabase.storage.bucket=cabinet-documents-private

# Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```



### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8080
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
```

---

## 🖥️ Utilisation

### Inscription d'un nouveau cabinet

Rendez-vous sur `/register` et complétez les 4 étapes :
1. **Cabinet** — Nom, adresse, spécialité, logo
2. **Médecin** — Informations personnelles et professionnelles du médecin responsable
3. **Secrétaire** — Compte de la secrétaire associée au cabinet
4. **Confirmation** — Signature numérique et validation de la demande

La demande est ensuite examinée et approuvée par un administrateur système.

### Accès aux espaces

| Rôle | URL d'accès |
|------|-------------|
| Administrateur | `/admin/dashboard` |
| Médecin | `/medecin/dashboard` |
| Secrétaire | `/secretaire/dashboard` |

> Les routes sont protégées par rôle (`ProtectedRoute`). Un utilisateur non autorisé est redirigé vers la page de connexion.

---

##  Sécurité

| Mécanisme | Description |
|-----------|-------------|
| **JWT** | Authentification sans état — token signé requis pour chaque requête protégée |
| **Spring Security** | Filtrage par rôle (`ROLE_ADMIN`, `ROLE_MEDECIN`, `ROLE_SECRETAIRE`) sur chaque endpoint |
| **Bcrypt** | Hachage des mots de passe avant persistance en base |
| **HTTPS (Supabase)** | Connexion à la base de données via SSL obligatoire |
| **Supabase RLS** | Row Level Security disponible côté base de données |
| **LoginAttemptService** | Verrouillage de compte après plusieurs tentatives de connexion échouées |
| **PasswordResetToken** | Token à usage unique et expirant pour la réinitialisation de mot de passe |
| **Spring Validation** | Validation des DTOs en entrée via `@Valid` + annotations Bean Validation |
| **CORS** | Configuration explicite des origines autorisées dans Spring Security |

---

##  Auteurs

Projet réalisé en équipe dans le cadre d'un projet académique à l'**ENSA Khouribga** — Université Sultan Moulay Slimane, sous l'encadrement de **Mme Karoum Bouchra** et **Mme Ennaji Fatima Zohra**.

| Membre | Contribution |
|--------|-------------|
| **Khadija Elkartouch** |  Espace Médecin complet (9 modules) |
| Omaima Sabri | Espace Secrétaire |
| Assia Houbbadi | Espace Administrateur |
| Aya El Azzouzi | Architecture backend & authentification |

- **GitHub** : [@kha-diija](https://github.com/kha-diija)

---

<div align="center">
  <sub>Fait avec ❤️ — MediCore &copy; 2025/2026</sub>
</div>
