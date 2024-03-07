DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
    id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(63),
    description VARCHAR(255),
    location VARCHAR(63)
);
