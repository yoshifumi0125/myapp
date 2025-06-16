-- Backup created at 2025-06-01 20:50:49.460849
-- Source: 35.232.151.129/saas1

CREATE DATABASE IF NOT EXISTS `saas1`;
USE `saas1`;

-- Table: customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `plan` varchar(255) DEFAULT NULL,
  `mrr` int DEFAULT NULL,
  `assignee` varchar(255) DEFAULT NULL,
  `initial_fee` int DEFAULT '0',
  `operation_fee` int DEFAULT '0',
  `hours` int DEFAULT '0',
  `region` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `channel` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'active',
  `contract_date` varchar(255) DEFAULT NULL,
  `health_score` int DEFAULT '70',
  `last_login` varchar(255) DEFAULT NULL,
  `support_tickets` int DEFAULT '0',
  `nps_score` int DEFAULT '7',
  `usage_rate` int DEFAULT '50',
  `churn_date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_customers_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Data for customers
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (1, 'テスト会社', 'starter', 30000, '田中太郎', 0, 0, 0, NULL, NULL, NULL, 'active', NULL, 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (3, NULL, NULL, 0, NULL, 0, 0, 0, NULL, NULL, NULL, 'active', NULL, 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (4, NULL, NULL, 0, NULL, 0, 0, 0, NULL, NULL, NULL, 'active', NULL, 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (5, NULL, NULL, 0, NULL, 0, 0, 0, NULL, NULL, NULL, 'active', NULL, 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (6, NULL, NULL, 0, NULL, 0, 0, 0, NULL, NULL, NULL, 'active', NULL, 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (7, '新規テスト会社', 'professional', 50000, '山田花子', 200000, 30000, 25, '関東', 'IT', 'Web検索', 'trial', '2025/05/31', 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (8, 'テスト', 'professional', 0, '', 0, 0, 0, '', '', '', 'trial', '2025/05/31', 70, '2025/05/31', 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (9, 'テスト', 'professional', 0, '', 0, 0, 0, '', '', '', 'trial', '2025/05/31', 70, '2025/05/31', 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (10, 'テスト', 'professional', 0, '', 0, 0, 0, '', '', '', 'active', '2025/05/31', 70, NULL, 0, 7, 50, NULL);
INSERT INTO `customers` (`id`, `name`, `plan`, `mrr`, `assignee`, `initial_fee`, `operation_fee`, `hours`, `region`, `industry`, `channel`, `status`, `contract_date`, `health_score`, `last_login`, `support_tickets`, `nps_score`, `usage_rate`, `churn_date`) VALUES (11, 'テスト永続化会社', 'enterprise', 150000, '山田次郎', 0, 0, 20, '関東', 'IT', 'Web検索', 'active', '2025-05-31', 70, NULL, 0, 7, 50, NULL);

-- Table: messages
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

