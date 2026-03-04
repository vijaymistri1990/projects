import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Simulator = sequelize.define('sm_simulator', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1
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
    tableName: 'sm_simulator',
    timestamps: false
});

export default Simulator;