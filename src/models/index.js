import { sequelize, logSequelize } from '../config/database.js';

// Import all models
import User from './User.js';
import Simulator from './Simulator.js';
import SimulatorData from './SimulatorData.js';
import SimulatorUserData from './SimulatorUserData.js';
import PerformanceSheet from './PerformanceSheet.js';
import WorkSheet from './WorkSheet.js';
import Log from './Log.js';

// Define associations
User.hasMany(SimulatorUserData, { foreignKey: 'user_id', as: 'simulatorUserData' });
User.hasMany(PerformanceSheet, { foreignKey: 'user_id', as: 'performanceSheets' });
User.hasMany(WorkSheet, { foreignKey: 'user_id', as: 'workSheets' });

Simulator.hasMany(SimulatorData, { foreignKey: 'simulator_id', as: 'simulatorData' });
Simulator.hasMany(SimulatorUserData, { foreignKey: 'simulator_id', as: 'userSimulatorData' });
Simulator.hasMany(PerformanceSheet, { foreignKey: 'simulator_id', as: 'performanceSheets' });
Simulator.hasMany(WorkSheet, { foreignKey: 'simulator_id', as: 'workSheets' });

SimulatorData.belongsTo(Simulator, { foreignKey: 'simulator_id', as: 'simulator' });

SimulatorUserData.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
SimulatorUserData.belongsTo(Simulator, { foreignKey: 'simulator_id', as: 'simulator' });

PerformanceSheet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PerformanceSheet.belongsTo(Simulator, { foreignKey: 'simulator_id', as: 'simulator' });

WorkSheet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WorkSheet.belongsTo(Simulator, { foreignKey: 'simulator_id', as: 'simulator' });

// Export models and connections
export {
    sequelize,
    logSequelize,
    User,
    Simulator,
    SimulatorData,
    SimulatorUserData,
    PerformanceSheet,
    WorkSheet,
    Log
};