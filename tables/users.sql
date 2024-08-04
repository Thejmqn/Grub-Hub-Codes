DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(36),
    password CHAR(64),
    message VARCHAR(256),
    total_submissions INT NOT NULL DEFAULT 0,
    recent_submissions INT NOT NULL DEFAULT 0,
    blocked TINYINT(1) DEFAULT 0,
    cookie_user TINYINT(1) DEFAULT 0
);
ALTER TABLE `users` ADD UNIQUE (username);
