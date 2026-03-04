import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PerformanceSheet = sequelize.define('sm_perfomance_sheet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sm_users',
            key: 'id'
        }
    },
    simulator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sm_simulator',
            key: 'id'
        }
    },
    score: {
        type: DataTypes.INTEGER
    },
    performance_data: {
        type: DataTypes.JSONB
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sm_perfomance_sheet',
    timestamps: false
});

export default PerformanceSheet;