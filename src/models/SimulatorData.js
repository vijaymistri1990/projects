import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SimulatorData = sequelize.define('sm_simulator_data', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    simulator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'sm_simulator',
            key: 'id'
        }
    },
    topic_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT
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
    tableName: 'sm_simulator_data',
    timestamps: false
});

export default SimulatorData;