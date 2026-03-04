import dotenv from 'dotenv';
import { sequelize, logSequelize } from '../models/index.js';

// Load environment variables
dotenv.config();

async function migrate() {
    try {
        console.log('Starting database migration...');
        
        // Test connections
        await sequelize.authenticate();
        console.log('✓ Main database connection established');
        
        await logSequelize.authenticate();
        console.log('✓ Log database connection established');
        
        // Sync all models (creates tables if they don't exist)
        await sequelize.sync({ force: false, alter: true });
        console.log('✓ Main database models synchronized');
        
        await logSequelize.sync({ force: false, alter: true });
        console.log('✓ Log database models synchronized');
        
        console.log('✅ Database migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database migration failed:', error);
        process.exit(1);
    }
}

migrate();