import { DataTypes } from 'sequelize';
import { logSequelize } from '../config/database.js';

const Log = logSequelize.define('general', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    log_type: {
        type: DataTypes.STRING(100)
    },
    log_message: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'general',
    timestamps: false
});

export default Log;