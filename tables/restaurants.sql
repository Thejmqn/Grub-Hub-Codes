DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
    id int UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name varchar(63),
    description varchar(255),
    location varchar(63)
);
