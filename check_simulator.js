import './src/config/env.js';
import { sequelize, Simulator, SimulatorData } from './src/models/index.js';

async function checkSimulator() {
    try {
        console.log('Checking database connection...');
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Check all simulators
        console.log('\n=== All Simulators ===');
        const simulators = await Simulator.findAll({
            attributes: ['id', 'query', 'locale', 'status'],
            order: [['id', 'ASC']]
        });
        
        console.log(`Found ${simulators.length} simulators:`);
        simulators.forEach(sim => {
            console.log(`ID: ${sim.id}, Query: "${sim.query}", Locale: ${sim.locale}, Status: ${sim.status}`);
        });

        // Check active simulators
        console.log('\n=== Active Simulators (status = 1) ===');
        const activeSimulators = await Simulator.findAll({
            where: { status: '1' },
            attributes: ['id', 'query', 'locale'],
            order: [['id', 'ASC']]
        });
        
        console.log(`Found ${activeSimulators.length} active simulators:`);
        activeSimulators.forEach(sim => {
            console.log(`ID: ${sim.id}, Query: "${sim.query}", Locale: ${sim.locale}`);
        });

        // Check specific simulator ID 3
        console.log('\n=== Checking Simulator ID 3 ===');
        const simulator3 = await Simulator.findOne({
            where: { id: 3 }
        });
        
        if (simulator3) {
            console.log('Simulator ID 3 found:', simulator3.toJSON());
            
            // Check simulator data for ID 3
            const simulatorData3 = await SimulatorData.findAll({
                where: { simulator_id: 3 }
            });
            console.log(`Simulator ID 3 has ${simulatorData3.length} data entries`);
        } else {
            console.log('Simulator ID 3 NOT FOUND in database');
        }

        // Check first few simulators with data
        console.log('\n=== Simulators with Data ===');
        const simulatorsWithData = await sequelize.query(`
            SELECT s.id, s.query, s.locale, s.status, COUNT(sd.id) as data_count
            FROM sm_simulator s
            LEFT JOIN sm_simulator_data sd ON s.id = sd.simulator_id
            WHERE s.status = '1'
            GROUP BY s.id, s.query, s.locale, s.status
            ORDER BY s.id ASC
            LIMIT 10
        `, { type: sequelize.QueryTypes.SELECT });

        simulatorsWithData.forEach(sim => {
            console.log(`ID: ${sim.id}, Query: "${sim.query}", Data Count: ${sim.data_count}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSimulator();