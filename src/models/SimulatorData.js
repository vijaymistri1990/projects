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
    simulator_type: {
        type: DataTypes.INTEGER
    },
    location: {
        type: DataTypes.INTEGER
    },
    link: {
        type: DataTypes.TEXT
    },
    link_meta: {
        type: DataTypes.TEXT
    },
    question_type: {
        type: DataTypes.STRING(1),
        defaultValue: '0'
    },
    questions_json: {
        type: DataTypes.JSONB
    },
    scrb_link: {
        type: DataTypes.TEXT
    },
    youtube_json: {
        type: DataTypes.JSONB
    },
    youtube_link_arr: {
        type: DataTypes.JSONB
    },
    link_with_description: {
        type: DataTypes.TEXT
    },
    slider_type: {
        type: DataTypes.STRING(1),
        defaultValue: '0'
    },
    slider_name: {
        type: DataTypes.STRING(1),
        defaultValue: '0'
    },
    slider_result_json: {
        type: DataTypes.JSONB
    },
    final_result: {
        type: DataTypes.INTEGER
    },
    final_result_show: {
        type: DataTypes.STRING(1),
        defaultValue: '0'
    },
    topic_name: {
        type: DataTypes.STRING(255),
        allowNull: true
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