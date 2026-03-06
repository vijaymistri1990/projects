import './src/config/env.js';
import { sequelize, Simulator, SimulatorData } from './src/models/index.js';

async function testWorkingSimulators() {
    try {
        console.log('Testing working simulators after cleanup...\n');
        await sequelize.authenticate();

        // Get first few simulators with data
        const workingSimulators = await sequelize.query(`
            SELECT s.id, s.query, s.locale, s.status, COUNT(sd.id) as data_count
            FROM sm_simulator s
            INNER JOIN sm_simulator_data sd ON s.id = sd.simulator_id
            WHERE s.status = '1'
            GROUP BY s.id, s.query, s.locale, s.status
            HAVING COUNT(sd.id) >= 5
            ORDER BY s.id ASC
            LIMIT 5
        `, { type: sequelize.QueryTypes.SELECT });

        console.log('✅ Working simulators (recommended for testing):');
        console.log('ID\tQuery\t\t\t\tData Count\tLocale');
        console.log(''.padEnd(70, '-'));
        
        workingSimulators.forEach(sim => {
            const query = sim.query.length > 30 ? sim.query.substring(0, 30) + '...' : sim.query;
            console.log(`${sim.id}\t${query.padEnd(35)}\t${sim.data_count}\t\t${sim.locale}`);
        });

        if (workingSimulators.length > 0) {
            const firstSim = workingSimulators[0];
            console.log(`\n🎯 Recommended simulator for testing: ID ${firstSim.id}`);
            console.log(`   Query: "${firstSim.query}"`);
            console.log(`   URL: http://localhost:3000/simulator/${firstSim.id}`);
            console.log(`   API: http://localhost:4000/api/simulator-topic-data?simulator_id=${firstSim.id}`);
        }

        // Check if the problematic simulator ID 3 is gone
        const sim3 = await Simulator.findOne({ where: { id: 3 } });
        if (!sim3) {
            console.log('\n✅ Confirmed: Problematic simulator ID 3 has been removed');
        }

        console.log('\n📊 Database cleanup statistics:');
        const totalSims = await Simulator.count();
        const activeSims = await Simulator.count({ where: { status: '1' } });
        const simsWithData = await sequelize.query(`
            SELECT COUNT(DISTINCT s.id) as count
            FROM sm_simulator s
            INNER JOIN sm_simulator_data sd ON s.id = sd.simulator_id
            WHERE s.status = '1'
        `, { type: sequelize.QueryTypes.SELECT });

        console.log(`Total simulators: ${totalSims}`);
        console.log(`Active simulators: ${activeSims}`);
        console.log(`Simulators with data: ${simsWithData[0].count}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

testWorkingSimulators();