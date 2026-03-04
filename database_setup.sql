-- PostgreSQL Database Setup for Simulator App
-- Run this script in pgAdmin or psql to create the required databases and tables

-- Create databases
CREATE DATABASE simulator;
CREATE DATABASE simulator_log;

-- Connect to simulator database
\c simulator;

-- Create users table
CREATE TABLE IF NOT EXISTS sm_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create simulator table
CREATE TABLE IF NOT EXISTS sm_simulator (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create simulator data table
CREATE TABLE IF NOT EXISTS sm_simulator_data (
    id SERIAL PRIMARY KEY,
    simulator_id INTEGER REFERENCES sm_simulator(id),
    topic_name VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create simulator user data table
CREATE TABLE IF NOT EXISTS sm_simulator_user_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES sm_users(id),
    simulator_id INTEGER REFERENCES sm_simulator(id),
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create performance sheet table
CREATE TABLE IF NOT EXISTS sm_perfomance_sheet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES sm_users(id),
    simulator_id INTEGER REFERENCES sm_simulator(id),
    score INTEGER,
    performance_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work sheet table
CREATE TABLE IF NOT EXISTS sm_work_sheet (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES sm_users(id),
    simulator_id INTEGER REFERENCES sm_simulator(id),
    worksheet_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connect to simulator_log database
\c simulator_log;

-- Create general log table
CREATE TABLE IF NOT EXISTS general (
    id SERIAL PRIMARY KEY,
    log_type VARCHAR(100),
    log_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON sm_users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON sm_users(username);
CREATE INDEX IF NOT EXISTS idx_simulator_status ON sm_simulator(status);
CREATE INDEX IF NOT EXISTS idx_simulator_data_simulator_id ON sm_simulator_data(simulator_id);
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON sm_simulator_user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_simulator_id ON sm_simulator_user_data(simulator_id);