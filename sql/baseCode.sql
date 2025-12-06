CREATE TABLE IF NOT EXISTS `T_CodeBase` (
  `code` VARCHAR(7) NOT NULL,
  `lang` VARCHAR(4) NOT NULL,
  `code_nm` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`code`, `lang`)
);

CREATE TABLE IF NOT EXISTS T_Language (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(4) NOT NULL,
  `lang` VARCHAR(4) NOT NULL,
  `title_code` VARCHAR(7) NOT NULL,
  `img` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_유파` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_무술` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL,
  `무기_code` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_스킬` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL,
  `무술_id` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_심법` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL,
  `무술_id` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_비결` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL,
  `무술_id` INT NOT NULL
);

CREATE TABLE IF NOT EXISTS `T_장비_세트` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title_code` INT NOT NULL,
  `body_code` INT NOT NULL,
  `img` VARCHAR(255) NOT NULL
);

ALTER TABLE `T_유파` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_유파` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_무술` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_무술` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_무술` ADD FOREIGN KEY (`무기_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_스킬` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_스킬` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_심법` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_심법` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_스킬` ADD FOREIGN KEY (`무술_id`) REFERENCES `T_무술` (`id`);

ALTER TABLE `T_심법` ADD FOREIGN KEY (`무술_id`) REFERENCES `T_무술` (`id`);

ALTER TABLE `T_비결` ADD FOREIGN KEY (`무술_id`) REFERENCES `T_무술` (`id`);

ALTER TABLE `T_비결` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_비결` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_장비_세트` ADD FOREIGN KEY (`title_code`) REFERENCES `T_CodeBase` (`code`);

ALTER TABLE `T_장비_세트` ADD FOREIGN KEY (`body_code`) REFERENCES `T_CodeBase` (`code`);
