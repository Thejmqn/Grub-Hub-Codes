DROP TABLE IF EXISTS `codes`;
CREATE TABLE `codes` (
    id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    code SMALLINT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    restauraunt_id TINYINT UNSIGNED NOT NULL,
    submission_time DATETIME
);
ALTER TABLE `codes` ADD FOREIGN KEY (restauraunt_id) REFERENCES restaurants(id);
ALTER TABLE `codes` ADD FOREIGN KEY (user_id) REFERENCES users(id);
