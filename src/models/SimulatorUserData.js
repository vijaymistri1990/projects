import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SimulatorUserData = sequelize.define('sm_simulator_user_data', {
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
    simulator_result: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.INTEGER
    },
    sxs_outcome: {
        type: DataTypes.INTEGER
    },
    nm_outcome: {
        type: DataTypes.INTEGER
    },
    simulator_comment: {
        type: DataTypes.TEXT
    },
    simulator_topic_result: {
        type: DataTypes.TEXT
    },
    data: {
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
    tableName: 'sm_simulator_user_data',
    timestamps: false
});

export default SimulatorUserData;