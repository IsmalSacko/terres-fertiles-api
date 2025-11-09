-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost
-- Généré le : mar. 03 juin 2025 à 22:17
-- Version du serveur : 9.3.0
-- Version de PHP : 8.1.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `terres_fertiles`
--

-- --------------------------------------------------------

--
-- Structure de la table `analyse_laboratoire`
--
-- create database terres_fertiles;
-- use terres_fertiles;
CREATE TABLE `analyse_laboratoire` (
  `id` bigint NOT NULL,
  `laboratoire` varchar(255) NOT NULL,
  `code_rapport` varchar(100) NOT NULL,
  `date_reception` date NOT NULL,
  `date_analyse` date NOT NULL,
  `profondeur_prelevement` varchar(100) DEFAULT NULL,
  `localisation_echantillon` varchar(255) DEFAULT NULL,
  `ph_eau` decimal(5,2) DEFAULT NULL,
  `ph_kcl` decimal(5,2) DEFAULT NULL,
  `calcaire_total` decimal(6,2) DEFAULT NULL,
  `calcaire_actif` decimal(6,2) DEFAULT NULL,
  `conductivite` decimal(6,2) DEFAULT NULL,
  `matiere_organique` decimal(6,2) DEFAULT NULL,
  `azote_total` decimal(5,3) DEFAULT NULL,
  `c_n` decimal(5,2) DEFAULT NULL,
  `cec` decimal(6,2) DEFAULT NULL,
  `saturation` decimal(5,2) DEFAULT NULL,
  `argile` decimal(5,2) DEFAULT NULL,
  `limons_fins` decimal(5,2) DEFAULT NULL,
  `limons_grossiers` decimal(5,2) DEFAULT NULL,
  `sables_fins` decimal(5,2) DEFAULT NULL,
  `sables_grossiers` decimal(5,2) DEFAULT NULL,
  `calcium` decimal(6,2) DEFAULT NULL,
  `magnesium` decimal(6,2) DEFAULT NULL,
  `potassium` decimal(6,2) DEFAULT NULL,
  `phosphore` decimal(6,2) DEFAULT NULL,
  `fer` decimal(6,2) DEFAULT NULL,
  `cuivre` decimal(6,2) DEFAULT NULL,
  `zinc` decimal(6,2) DEFAULT NULL,
  `manganese` decimal(6,2) DEFAULT NULL,
  `densite_apparente` decimal(5,2) DEFAULT NULL,
  `porosite_totale` decimal(5,2) DEFAULT NULL,
  `porosite_drainage` decimal(5,2) DEFAULT NULL,
  `eau_capillaire` decimal(5,2) DEFAULT NULL,
  `permeabilite` decimal(6,2) DEFAULT NULL,
  `iam` decimal(5,2) DEFAULT NULL,
  `refus_gravier_2mm` decimal(5,2) DEFAULT NULL,
  `commentaires` longtext,
  `produit_id` bigint NOT NULL,
  `fichier_pdf` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `analyse_laboratoire`
--

INSERT INTO `analyse_laboratoire` (`id`, `laboratoire`, `code_rapport`, `date_reception`, `date_analyse`, `profondeur_prelevement`, `localisation_echantillon`, `ph_eau`, `ph_kcl`, `calcaire_total`, `calcaire_actif`, `conductivite`, `matiere_organique`, `azote_total`, `c_n`, `cec`, `saturation`, `argile`, `limons_fins`, `limons_grossiers`, `sables_fins`, `sables_grossiers`, `calcium`, `magnesium`, `potassium`, `phosphore`, `fer`, `cuivre`, `zinc`, `manganese`, `densite_apparente`, `porosite_totale`, `porosite_drainage`, `eau_capillaire`, `permeabilite`, `iam`, `refus_gravier_2mm`, `commentaires`, `produit_id`, `fichier_pdf`) VALUES
(1, 'LABOSOL', 'N° 021_19 SUBSTRAT ROUGE', '2025-05-05', '2025-05-04', NULL, NULL, 8.02, 7.52, 185.74, 42.50, 0.12, 41.97, 2.430, 10.03, 83.72, 102.00, 4.00, 8.00, 26.00, 26.00, 5.00, 10.26, 0.12, 0.11, NULL, 51.80, 2.88, 4.73, NULL, NULL, NULL, NULL, NULL, NULL, 13.00, NULL, '', 1, ''),
(15, 'Labosol', 'N° 021_19 SUBSTRAT ROUGE', '2025-05-23', '2025-05-23', NULL, NULL, 0.06, NULL, 254.18, NULL, NULL, 0.31, 8.200, NULL, 98.00, 103.56, NULL, NULL, NULL, NULL, NULL, 125.00, 0.16, 0.16, 0.22, 15.50, 20.00, 4.19, 1.80, NULL, NULL, NULL, NULL, NULL, NULL, 2.00, NULL, 1, '');

-- --------------------------------------------------------

--
-- Structure de la table `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `authtoken_token`
--

INSERT INTO `authtoken_token` (`key`, `created`, `user_id`) VALUES
('41a2afb448a0cb02ccde1b35b5a0ee8b390148b8', '2025-05-20 07:39:14.059721', 4),
('6e8f6b682ece906546ebf14cd7646b47e2d64239', '2025-05-19 10:17:56.063465', 1),
('96076c84077b0406ecc569a18be04ceaffe1db32', '2025-05-20 00:42:23.091873', 3);

-- --------------------------------------------------------

--
-- Structure de la table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add Token', 6, 'add_token'),
(22, 'Can change Token', 6, 'change_token'),
(23, 'Can delete Token', 6, 'delete_token'),
(24, 'Can view Token', 6, 'view_token'),
(25, 'Can add Token', 7, 'add_tokenproxy'),
(26, 'Can change Token', 7, 'change_tokenproxy'),
(27, 'Can delete Token', 7, 'delete_tokenproxy'),
(28, 'Can view Token', 7, 'view_tokenproxy'),
(29, 'Can add Chantier', 8, 'add_chantier'),
(30, 'Can change Chantier', 8, 'change_chantier'),
(31, 'Can delete Chantier', 8, 'delete_chantier'),
(32, 'Can view Chantier', 8, 'view_chantier'),
(33, 'Can add Utilisateur', 9, 'add_customuser'),
(34, 'Can change Utilisateur', 9, 'change_customuser'),
(35, 'Can delete Utilisateur', 9, 'delete_customuser'),
(36, 'Can view Utilisateur', 9, 'view_customuser'),
(37, 'Can add Compost', 10, 'add_compost'),
(38, 'Can change Compost', 10, 'change_compost'),
(39, 'Can delete Compost', 10, 'delete_compost'),
(40, 'Can view Compost', 10, 'view_compost'),
(41, 'Can add Gisement', 11, 'add_gisement'),
(42, 'Can change Gisement', 11, 'change_gisement'),
(43, 'Can delete Gisement', 11, 'delete_gisement'),
(44, 'Can view Gisement', 11, 'view_gisement'),
(45, 'Can add Mélange', 12, 'add_melange'),
(46, 'Can change Mélange', 12, 'change_melange'),
(47, 'Can delete Mélange', 12, 'delete_melange'),
(48, 'Can view Mélange', 12, 'view_melange'),
(49, 'Can add Produit de vente', 13, 'add_produitvente'),
(50, 'Can change Produit de vente', 13, 'change_produitvente'),
(51, 'Can delete Produit de vente', 13, 'delete_produitvente'),
(52, 'Can view Produit de vente', 13, 'view_produitvente'),
(53, 'Can add Document technique', 14, 'add_documenttechnique'),
(54, 'Can change Document technique', 14, 'change_documenttechnique'),
(55, 'Can delete Document technique', 14, 'delete_documenttechnique'),
(56, 'Can view Document technique', 14, 'view_documenttechnique'),
(57, 'Can add Analyse de laboratoire', 15, 'add_analyselaboratoire'),
(58, 'Can change Analyse de laboratoire', 15, 'change_analyselaboratoire'),
(59, 'Can delete Analyse de laboratoire', 15, 'delete_analyselaboratoire'),
(60, 'Can view Analyse de laboratoire', 15, 'view_analyselaboratoire'),
(61, 'Can add document gisement', 16, 'add_documentgisement'),
(62, 'Can change document gisement', 16, 'change_documentgisement'),
(63, 'Can delete document gisement', 16, 'delete_documentgisement'),
(64, 'Can view document gisement', 16, 'view_documentgisement');

-- --------------------------------------------------------

--
-- Structure de la table `chantier`
--

CREATE TABLE `chantier` (
  `id` bigint NOT NULL,
  `nom` varchar(255) NOT NULL,
  `maitre_ouvrage` varchar(255) NOT NULL,
  `entreprise_terrassement` varchar(255) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `chantier`
--

INSERT INTO `chantier` (`id`, `nom`, `maitre_ouvrage`, `entreprise_terrassement`, `localisation`, `latitude`, `longitude`) VALUES
(2, 'Lyon 8', 'Ville de Lyon', 'Lyon Terrassement Services', 'Lyon', 49.9752, 2.22551),
(3, 'Fatom', 'Oullins', 'SNCF', 'Oullins', 45.686791, 4.930078);

-- --------------------------------------------------------

--
-- Structure de la table `compost`
--

CREATE TABLE `compost` (
  `id` bigint NOT NULL,
  `fournisseur` varchar(255) NOT NULL,
  `date_reception` date NOT NULL,
  `volume` decimal(10,2) NOT NULL,
  `type_compost` varchar(100) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `chantier_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint UNSIGNED NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` bigint NOT NULL
) ;

--
-- Déchargement des données de la table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2025-05-19 11:06:41.124897', '1', 'Chantier - Parc Lyon Sud', 1, '[{\"added\": {}}]', 8, 1),
(2, '2025-05-19 12:08:51.152721', '1', 'Chantier - Parc Lyon Sud', 2, '[]', 8, 1),
(3, '2025-05-20 00:41:39.153021', '2', 'terres fertiles (Client)', 3, '', 9, 1),
(4, '2025-05-20 10:16:57.175795', '1', 'Gisement - Lyon sud', 1, '[{\"added\": {}}]', 11, 1),
(5, '2025-05-20 14:16:44.333577', '2', 'Chantier - Lyon 8', 1, '[{\"added\": {}}]', 8, 1),
(6, '2025-05-21 09:17:56.040956', '1', 'Mélange LYON-2025-MEL-001', 1, '[{\"added\": {}}]', 12, 1),
(7, '2025-05-21 09:23:10.580737', '1', 'Produit LYON-2025-VENTE-001', 1, '[{\"added\": {}}]', 13, 1),
(8, '2025-05-21 10:30:52.209038', '1', 'Analyse du 2025-05-04 - LABOSOL', 1, '[{\"added\": {}}]', 15, 1),
(9, '2025-05-21 11:01:04.654228', '2', 'Analyse du 2025-05-04 - LABOSOL', 1, '[{\"added\": {}}]', 15, 1),
(10, '2025-05-21 11:01:38.835288', '2', 'Analyse du 2025-05-04 - LABOSOL', 3, '', 15, 1),
(11, '2025-05-27 09:34:33.491908', '4', 'Gisement - Lyon sud', 1, '[{\"added\": {}}]', 11, 1),
(12, '2025-05-27 09:36:34.974684', '1', '25LYONSUD_01.pdf', 1, '[{\"added\": {}}]', 16, 1),
(13, '2025-05-27 09:38:53.061663', '1', '25LYONSUD_02.pdf', 2, '[{\"changed\": {\"fields\": [\"Nom fichier\"]}}]', 16, 1),
(14, '2025-05-27 09:39:12.859673', '1', '25LYONSUD_02.pdf', 2, '[]', 16, 1),
(15, '2025-05-27 09:39:23.491783', '2', '25LYONSUD_02.pdf', 1, '[{\"added\": {}}]', 16, 1),
(16, '2025-05-27 09:41:12.663081', '3', '25LYONSUD_03.pdf', 1, '[{\"added\": {}}]', 16, 1),
(17, '2025-05-27 09:44:50.563093', '4', '25LYONSUD_04.pdf', 1, '[{\"added\": {}}]', 16, 1),
(18, '2025-05-27 09:46:34.853581', '5', '25LYONSUD_05.pdf', 1, '[{\"added\": {}}]', 16, 1),
(19, '2025-05-27 09:46:56.618966', '5', '25LYONSUD_05.pdf', 3, '', 16, 1),
(20, '2025-05-27 09:46:56.618998', '4', '25LYONSUD_04.pdf', 3, '', 16, 1),
(21, '2025-05-27 09:46:56.619017', '3', '25LYONSUD_03.pdf', 3, '', 16, 1),
(22, '2025-05-27 09:46:56.619033', '2', '25LYONSUD_02.pdf', 3, '', 16, 1),
(23, '2025-05-27 09:46:56.619047', '1', '25LYONSUD_02.pdf', 3, '', 16, 1),
(24, '2025-05-27 09:49:11.606663', '6', '25_LYONSUD_01.pdf', 1, '[{\"added\": {}}]', 16, 1),
(25, '2025-05-28 15:26:01.606403', '7', '25_BRON_01.pdf', 1, '[{\"added\": {}}]', 16, 1),
(26, '2025-05-28 15:26:28.149025', '8', '25_OULLINS_01.pdf', 1, '[{\"added\": {}}]', 16, 1);

-- --------------------------------------------------------

--
-- Structure de la table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(6, 'authtoken', 'token'),
(7, 'authtoken', 'tokenproxy'),
(4, 'contenttypes', 'contenttype'),
(15, 'core', 'analyselaboratoire'),
(8, 'core', 'chantier'),
(10, 'core', 'compost'),
(9, 'core', 'customuser'),
(16, 'core', 'documentgisement'),
(14, 'core', 'documenttechnique'),
(11, 'core', 'gisement'),
(12, 'core', 'melange'),
(13, 'core', 'produitvente'),
(5, 'sessions', 'session');

-- --------------------------------------------------------

--
-- Structure de la table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-05-19 10:11:36.805494'),
(2, 'contenttypes', '0002_remove_content_type_name', '2025-05-19 10:11:36.833456'),
(3, 'auth', '0001_initial', '2025-05-19 10:11:36.905029'),
(4, 'auth', '0002_alter_permission_name_max_length', '2025-05-19 10:11:36.923669'),
(5, 'auth', '0003_alter_user_email_max_length', '2025-05-19 10:11:36.928587'),
(6, 'auth', '0004_alter_user_username_opts', '2025-05-19 10:11:36.932497'),
(7, 'auth', '0005_alter_user_last_login_null', '2025-05-19 10:11:36.936398'),
(8, 'auth', '0006_require_contenttypes_0002', '2025-05-19 10:11:36.937305'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2025-05-19 10:11:36.942404'),
(10, 'auth', '0008_alter_user_username_max_length', '2025-05-19 10:11:36.946182'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2025-05-19 10:11:36.950284'),
(12, 'auth', '0010_alter_group_name_max_length', '2025-05-19 10:11:36.961455'),
(13, 'auth', '0011_update_proxy_permissions', '2025-05-19 10:11:36.965554'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2025-05-19 10:11:36.969065'),
(15, 'core', '0001_initial', '2025-05-19 10:11:37.241753'),
(16, 'admin', '0001_initial', '2025-05-19 10:11:37.367249'),
(17, 'admin', '0002_logentry_remove_auto_add', '2025-05-19 10:11:37.374170'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2025-05-19 10:11:37.381423'),
(19, 'authtoken', '0001_initial', '2025-05-19 10:11:37.408032'),
(20, 'authtoken', '0002_auto_20160226_1747', '2025-05-19 10:11:37.431453'),
(21, 'authtoken', '0003_tokenproxy', '2025-05-19 10:11:37.432981'),
(22, 'authtoken', '0004_alter_tokenproxy_options', '2025-05-19 10:11:37.436719'),
(23, 'sessions', '0001_initial', '2025-05-19 10:11:37.450391'),
(24, 'core', '0002_alter_analyselaboratoire_table_alter_chantier_table_and_more', '2025-05-19 10:16:51.145426'),
(25, 'core', '0003_analyselaboratoire_fichier_pdf', '2025-05-21 10:41:33.791382'),
(26, 'core', '0004_alter_analyselaboratoire_fichier_pdf', '2025-05-21 10:48:41.032677'),
(27, 'core', '0005_documentgisement', '2025-05-27 08:57:36.781157'),
(28, 'core', '0006_gisement_type_de_sol', '2025-05-27 09:18:39.112133'),
(29, 'core', '0007_alter_documentgisement_nom_fichier', '2025-05-27 09:36:19.939693');

-- --------------------------------------------------------

--
-- Structure de la table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('r19semcmq0vxynym69eaenzduk0vuqgs', '.eJxVjLEOAiEQRP-F2hA4yCKW9n4DWdhFTg0kx11l_He55Aptpph5894i4LaWsHVewkziIrQ4_XYR05PrPtAD673J1Oq6zFHuiDzWLm-N-HU92D9BwV7GO5qcrNZkCTQqYAdgFFEGDwpVPLtsPKk8hNqxt0yKPfM0wQjgHMXnC_DYOME:1uHBG4:H3PAH6kGdgzqXrf895SvZIRVTzKmBCbAJHJO-pQjYSA', '2025-06-03 00:55:04.750255');

-- --------------------------------------------------------

--
-- Structure de la table `document_gisement`
--

CREATE TABLE `document_gisement` (
  `id` bigint NOT NULL,
  `nom_fichier` varchar(255) DEFAULT NULL,
  `fichier` varchar(100) DEFAULT NULL,
  `date_ajout` datetime(6) NOT NULL,
  `gisement_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `document_gisement`
--

INSERT INTO `document_gisement` (`id`, `nom_fichier`, `fichier`, `date_ajout`, `gisement_id`) VALUES
(7, '25_BRON_01.pdf', 'documents/gisements/6/25BRON_01.pdf', '2025-05-28 15:26:01.604859', 6),
(8, '25_OULLINS_01.pdf', 'documents/gisements/5/25OULLINS_01.pdf', '2025-05-28 15:26:28.148443', 5);

-- --------------------------------------------------------

--
-- Structure de la table `document_technique`
--

CREATE TABLE `document_technique` (
  `id` bigint NOT NULL,
  `nom_fichier` varchar(255) NOT NULL,
  `fichier` varchar(100) NOT NULL,
  `type_document` varchar(100) NOT NULL,
  `date_ajout` date NOT NULL,
  `produit_id` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `gisement`
--

CREATE TABLE `gisement` (
  `id` bigint NOT NULL,
  `commune` varchar(100) NOT NULL,
  `periode_terrassement` varchar(100) NOT NULL,
  `volume_terrasse` decimal(10,2) NOT NULL,
  `materiau` varchar(255) NOT NULL,
  `localisation` varchar(255) NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `chantier_id` bigint NOT NULL,
  `type_de_sol` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `gisement`
--

INSERT INTO `gisement` (`id`, `commune`, `periode_terrassement`, `volume_terrasse`, `materiau`, `localisation`, `latitude`, `longitude`, `chantier_id`, `type_de_sol`) VALUES
(4, 'Lyon sud', '2024-2025', 1.00, 'Terre', 'Lyon', 45.7007, 4.8226, 3, 'limon'),
(5, 'Oullins', 'Mars-2025', 345.00, 'Terre', 'Oullins', NULL, NULL, 3, 'caillouteux'),
(6, 'Bron', 'Mars-2025', 768.00, 'Cailloux', 'Bron', NULL, NULL, 2, 'limon'),
(7, 'Oullins', 'Mars-2025', 887.87, 'Terre', 'Oullins', 0.000039, NULL, 3, 'limon');

-- --------------------------------------------------------

--
-- Structure de la table `melange`
--

CREATE TABLE `melange` (
  `id` bigint NOT NULL,
  `reference_produit` varchar(100) NOT NULL,
  `site_stockage` varchar(255) NOT NULL,
  `fournisseur` varchar(255) NOT NULL,
  `couverture_vegetale` varchar(100) DEFAULT NULL,
  `periode_melange` varchar(100) NOT NULL,
  `date_semis` date DEFAULT NULL,
  `references_analyses` longtext,
  `chantier_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `melange`
--

INSERT INTO `melange` (`id`, `reference_produit`, `site_stockage`, `fournisseur`, `couverture_vegetale`, `periode_melange`, `date_semis`, `references_analyses`, `chantier_id`) VALUES
(1, 'LYON-2025-MEL-001', 'Site Lyon 8', 'blabla', NULL, 'Javvier 2025', NULL, '', 2);

-- --------------------------------------------------------

--
-- Structure de la table `produit_vente`
--

CREATE TABLE `produit_vente` (
  `id` bigint NOT NULL,
  `reference_produit` varchar(100) NOT NULL,
  `fournisseur` varchar(255) NOT NULL,
  `nom_site` varchar(255) NOT NULL,
  `volume_initial` decimal(10,2) NOT NULL,
  `volume_disponible` decimal(10,2) NOT NULL,
  `date_disponibilite` date NOT NULL,
  `commentaires_analyses` longtext,
  `volume_vendu` decimal(10,2) DEFAULT NULL,
  `acheteur` varchar(255) DEFAULT NULL,
  `date_achat` date DEFAULT NULL,
  `periode_destockage` varchar(100) DEFAULT NULL,
  `localisation_projet` varchar(255) DEFAULT NULL,
  `chantier_id` bigint DEFAULT NULL,
  `melange_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `produit_vente`
--

INSERT INTO `produit_vente` (`id`, `reference_produit`, `fournisseur`, `nom_site`, `volume_initial`, `volume_disponible`, `date_disponibilite`, `commentaires_analyses`, `volume_vendu`, `acheteur`, `date_achat`, `periode_destockage`, `localisation_projet`, `chantier_id`, `melange_id`) VALUES
(1, 'LYON-2025-VENTE-001', 'blabla', 'tonneur rouge', 200.00, 150.00, '2025-05-25', '', NULL, NULL, '2025-05-28', NULL, NULL, 2, 1);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur`
--

CREATE TABLE `utilisateur` (
  `id` bigint NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(20) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `siret_number` varchar(14) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone_number` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `utilisateur`
--

INSERT INTO `utilisateur` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `company_name`, `siret_number`, `address`, `city`, `postal_code`, `country`, `phone_number`) VALUES
(1, 'pbkdf2_sha256$1000000$bHmVGmmoESGXHeZpGqochz$Zdpnk1PWJEjeYFTT4bYADDuIl0EeqoGWR6SWf8wlVxg=', '2025-05-22 12:12:19.383930', 1, 'terresfertiles', '', '', 'terresfertiles@gmail.com', 1, 1, '2025-05-19 10:17:55.569240', 'exploitant', 'terres fertiles', '', NULL, NULL, NULL, NULL, NULL),
(3, 'pbkdf2_sha256$1000000$Gu2MjfAhH5gs1XpKMR0kpi$oqTNqSN/F+yuBPScg6/zCy9iFdboXeBSVrY8MNgNR9I=', NULL, 0, 'sackogaye', '', '', 'i.sacko@univ-lyon2.fr', 0, 1, '2025-05-20 00:42:22.583796', 'exploitant', 'sackola', '12345678900012', NULL, NULL, NULL, NULL, NULL),
(4, 'pbkdf2_sha256$1000000$R9wNDkMLK1ZUk5ey2ou50T$eVOG/jNf/pXRm2oiPYnBuabKxjZmX7NMZUMLJDdNpbs=', NULL, 0, 'pierre', '', '', 'pierre.terresfertiles@gmail.com', 0, 1, '2025-05-20 07:39:13.558036', 'entreprise', 'Terres fertiles', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur_groups`
--

CREATE TABLE `utilisateur_groups` (
  `id` bigint NOT NULL,
  `customuser_id` bigint NOT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `utilisateur_user_permissions`
--

CREATE TABLE `utilisateur_user_permissions` (
  `id` bigint NOT NULL,
  `customuser_id` bigint NOT NULL,
  `permission_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `analyse_laboratoire`
--
ALTER TABLE `analyse_laboratoire`
  ADD PRIMARY KEY (`id`),
  ADD KEY `core_analyselaborato_produit_id_74dc0ac8_fk_core_prod` (`produit_id`);

--
-- Index pour la table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Index pour la table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Index pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Index pour la table `chantier`
--
ALTER TABLE `chantier`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `compost`
--
ALTER TABLE `compost`
  ADD PRIMARY KEY (`id`),
  ADD KEY `core_compost_chantier_id_d8ca117b_fk_core_chantier_id` (`chantier_id`);

--
-- Index pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_core_customuser_id` (`user_id`);

--
-- Index pour la table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Index pour la table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Index pour la table `document_gisement`
--
ALTER TABLE `document_gisement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_gisement_gisement_id_79829249_fk_gisement_id` (`gisement_id`);

--
-- Index pour la table `document_technique`
--
ALTER TABLE `document_technique`
  ADD PRIMARY KEY (`id`),
  ADD KEY `core_documenttechniq_produit_id_b023df70_fk_core_prod` (`produit_id`);

--
-- Index pour la table `gisement`
--
ALTER TABLE `gisement`
  ADD PRIMARY KEY (`id`),
  ADD KEY `core_gisement_chantier_id_77bec000_fk_core_chantier_id` (`chantier_id`);

--
-- Index pour la table `melange`
--
ALTER TABLE `melange`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_produit` (`reference_produit`),
  ADD KEY `core_melange_chantier_id_5b4960b3_fk_core_chantier_id` (`chantier_id`);

--
-- Index pour la table `produit_vente`
--
ALTER TABLE `produit_vente`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_produit` (`reference_produit`),
  ADD UNIQUE KEY `melange_id` (`melange_id`),
  ADD KEY `core_produitvente_chantier_id_499aea30_fk_core_chantier_id` (`chantier_id`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `siret_number` (`siret_number`);

--
-- Index pour la table `utilisateur_groups`
--
ALTER TABLE `utilisateur_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `core_customuser_groups_customuser_id_group_id_7990e9c6_uniq` (`customuser_id`,`group_id`),
  ADD KEY `core_customuser_groups_group_id_301aeff4_fk_auth_group_id` (`group_id`);

--
-- Index pour la table `utilisateur_user_permissions`
--
ALTER TABLE `utilisateur_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `core_customuser_user_per_customuser_id_permission_49ea742a_uniq` (`customuser_id`,`permission_id`),
  ADD KEY `core_customuser_user_permission_id_80ceaab9_fk_auth_perm` (`permission_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `analyse_laboratoire`
--
ALTER TABLE `analyse_laboratoire`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT pour la table `chantier`
--
ALTER TABLE `chantier`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `compost`
--
ALTER TABLE `compost`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `document_gisement`
--
ALTER TABLE `document_gisement`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `document_technique`
--
ALTER TABLE `document_technique`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `gisement`
--
ALTER TABLE `gisement`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `melange`
--
ALTER TABLE `melange`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `produit_vente`
--
ALTER TABLE `produit_vente`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `utilisateur_groups`
--
ALTER TABLE `utilisateur_groups`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `utilisateur_user_permissions`
--
ALTER TABLE `utilisateur_user_permissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `analyse_laboratoire`
--
ALTER TABLE `analyse_laboratoire`
  ADD CONSTRAINT `core_analyselaborato_produit_id_74dc0ac8_fk_core_prod` FOREIGN KEY (`produit_id`) REFERENCES `produit_vente` (`id`);

--
-- Contraintes pour la table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_core_customuser_id` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Contraintes pour la table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Contraintes pour la table `compost`
--
ALTER TABLE `compost`
  ADD CONSTRAINT `core_compost_chantier_id_d8ca117b_fk_core_chantier_id` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`);

--
-- Contraintes pour la table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_core_customuser_id` FOREIGN KEY (`user_id`) REFERENCES `utilisateur` (`id`);

--
-- Contraintes pour la table `document_gisement`
--
ALTER TABLE `document_gisement`
  ADD CONSTRAINT `document_gisement_gisement_id_79829249_fk_gisement_id` FOREIGN KEY (`gisement_id`) REFERENCES `gisement` (`id`);

--
-- Contraintes pour la table `document_technique`
--
ALTER TABLE `document_technique`
  ADD CONSTRAINT `core_documenttechniq_produit_id_b023df70_fk_core_prod` FOREIGN KEY (`produit_id`) REFERENCES `produit_vente` (`id`);

--
-- Contraintes pour la table `gisement`
--
ALTER TABLE `gisement`
  ADD CONSTRAINT `core_gisement_chantier_id_77bec000_fk_core_chantier_id` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`);

--
-- Contraintes pour la table `melange`
--
ALTER TABLE `melange`
  ADD CONSTRAINT `core_melange_chantier_id_5b4960b3_fk_core_chantier_id` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`);

--
-- Contraintes pour la table `produit_vente`
--
ALTER TABLE `produit_vente`
  ADD CONSTRAINT `core_produitvente_chantier_id_499aea30_fk_core_chantier_id` FOREIGN KEY (`chantier_id`) REFERENCES `chantier` (`id`),
  ADD CONSTRAINT `core_produitvente_melange_id_7459010c_fk_core_melange_id` FOREIGN KEY (`melange_id`) REFERENCES `melange` (`id`);

--
-- Contraintes pour la table `utilisateur_groups`
--
ALTER TABLE `utilisateur_groups`
  ADD CONSTRAINT `core_customuser_grou_customuser_id_976bc4d7_fk_core_cust` FOREIGN KEY (`customuser_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `core_customuser_groups_group_id_301aeff4_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Contraintes pour la table `utilisateur_user_permissions`
--
ALTER TABLE `utilisateur_user_permissions`
  ADD CONSTRAINT `core_customuser_user_customuser_id_ebd2ce6c_fk_core_cust` FOREIGN KEY (`customuser_id`) REFERENCES `utilisateur` (`id`),
  ADD CONSTRAINT `core_customuser_user_permission_id_80ceaab9_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
