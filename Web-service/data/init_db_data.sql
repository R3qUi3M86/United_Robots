SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET default_tablespace = '';

SET default_with_oids = false;

---
--- drop tables
---

DROP TABLE IF EXISTS robots;
DROP TABLE IF EXISTS maps;
DROP TABLE IF EXISTS users;
---
--- create tables
---

CREATE TABLE robots (
    robot_id       SERIAL PRIMARY KEY     NOT NULL,
    owner_id       INTEGER                NOT NULL,
    robot_sn       VARCHAR(200)           NOT NULL,
    robot_name     TEXT                   NOT NULL
);

CREATE TABLE maps (
    map_id          SERIAL PRIMARY KEY  NOT NULL,
    map_data    TEXT                NOT NULL
);

CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY  NOT NULL,
    user_name   VARCHAR (200)       NOT NULL,
    user_email  VARCHAR (200)       NOT NULL,
    hashed_pass bytea               NOT NULL
);

---
--- insert data
---

INSERT INTO robots(owner_id, robot_sn, robot_name) VALUES (1, 'SN-001', 'Mr-Handy-MK1');
INSERT INTO robots(owner_id, robot_sn, robot_name) VALUES (1, 'SN-002', 'Terminator-T800');
INSERT INTO robots(owner_id, robot_sn, robot_name) VALUES (1, 'SN-003', 'Annihilator-3000');

INSERT INTO users(user_name, user_email, hashed_pass) VALUES ('abuser', 'guy@fawkes', '$2b$12$TrPMlulL1vUMY3jBf8RGqeB2mTEqBDHy08Z3BtR80W2zdrBLkbT7C');

---
--- add constraints
---

ALTER TABLE ONLY robots
    ADD CONSTRAINT fk_owning_user FOREIGN KEY (owner_id) REFERENCES users(user_id)