import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const WorkSheet = sequelize.define('sm_work_sheet', {
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
    month: {
        type: DataTypes.INTEGER
    },
    result: {
        type: DataTypes.STRING(255)
    },
    worksheet_data: {
        type: DataTypes.JSONB
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'sm_work_sheet',
    timestamps: false
});

export default WorkSheet;