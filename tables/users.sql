DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32),
    password CHAR(64),
    message VARCHAR(256),
    total_submissions INT NOT NULL DEFAULT 0,
    recent_submissions INT NOT NULL DEFAULT 0
);
ALTER TABLE `users` ADD UNIQUE (username);
