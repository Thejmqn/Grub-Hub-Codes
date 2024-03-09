DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
    id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64),
    description VARCHAR(256),
    location VARCHAR(64)
);
