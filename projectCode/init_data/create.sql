DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  ikon BOOLEAN DEFAULT FALSE,
  epic BOOLEAN DEFAULT FALSE,
  indy BOOLEAN DEFAULT FALSE,
  mountain_collective BOOLEAN DEFAULT FALSE
  email VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  proficiency VARCHAR(100) NOT NULL,
  pass_id SERIAL FOREIGN KEY references passes(pass_id)
);

DROP TABLE IF EXISTS passes CASCADE;
CREATE TABLE IF NOT EXISTS passes (
  pass_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100)
);

DROP TABLE IF EXISTS locations CASCADE;
CREATE TABLE IF NOT EXISTS locations (
  location_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(100)
);

DROP TABLE IF EXISTS passes_to_locations;
CREATE TABLE IF NOT EXISTS locations (
    pass_id INT,
    location_id INT
);

DROP TABLE IF EXISTS user_to_passes;
CREATE TABLE IF NOT EXISTS locations (
    user_id INT,
    pass_id INT
);