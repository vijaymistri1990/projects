import './src/config/env.js';
import { sequelize, Simulator, SimulatorData } from './src/models/index.js';

async function cleanupDatabase() {
    try {
        console.log('Starting database cleanup...');
        await sequelize.authenticate();
        console.log('Database connected successfully.\n');

        // Get all simulators with their data count
        console.log('=== Analyzing all simulators ===');
        const simulatorAnalysis = await sequelize.query(`
            SELECT 
                s.id, 
                s.query, 
                s.locale, 
                s.status,
                COUNT(sd.id) as data_count,
                CASE 
                    WHEN COUNT(sd.id) = 0 THEN 'NO_DATA'
                    WHEN COUNT(sd.id) < 5 THEN 'INSUFFICIENT_DATA'
                    ELSE 'GOOD_DATA'
                END as data_quality
            FROM sm_simulator s
            LEFT JOIN sm_simulator_data sd ON s.id = sd.simulator_id
            GROUP BY s.id, s.query, s.locale, s.status
            ORDER BY s.id ASC
        `, { type: sequelize.QueryTypes.SELECT });

        console.log('Simulator Analysis:');
        console.log('ID\tQuery\t\t\t\tData Count\tQuality\tStatus');
        console.log(''.padEnd(80, '-'));
        
        let toDelete = [];
        let toKeep = [];
        
        simulatorAnalysis.forEach(sim => {
            const query = sim.query.length > 30 ? sim.query.substring(0, 30) + '...' : sim.query;
            console.log(`${sim.id}\t${query.padEnd(35)}\t${sim.data_count}\t\t${sim.data_quality}\t${sim.status}`);
            
            // Mark for deletion if no data or insufficient data
            if (sim.data_quality === 'NO_DATA' || sim.data_quality === 'INSUFFICIENT_DATA') {
                toDelete.push(sim);
            } else {
                toKeep.push(sim);
            }
        });

        console.log('\n=== Summary ===');
        console.log(`Total simulators: ${simulatorAnalysis.length}`);
        console.log(`Simulators to keep (good data): ${toKeep.length}`);
        console.log(`Simulators to delete (no/insufficient data): ${toDelete.length}`);

        if (toDelete.length > 0) {
            console.log('\n=== Simulators to be DELETED ===');
            toDelete.forEach(sim => {
                console.log(`ID ${sim.id}: "${sim.query}" (${sim.data_count} data entries)`);
            });

            console.log('\n=== Simulators to be KEPT ===');
            toKeep.forEach(sim => {
                console.log(`ID ${sim.id}: "${sim.query}" (${sim.data_count} data entries)`);
            });

            // Ask for confirmation (in a real scenario, you'd want user input)
            console.log('\n=== PROCEEDING WITH CLEANUP ===');
            console.log('This will permanently delete simulators with insufficient data...');

            // Start transaction for safe deletion
            const transaction = await sequelize.transaction();

            try {
                let deletedCount = 0;

                for (const sim of toDelete) {
                    console.log(`Deleting simulator ID ${sim.id}: "${sim.query}"`);
                    
                    // First delete any related simulator_data entries
                    const dataDeleted = await SimulatorData.destroy({
                        where: { simulator_id: sim.id },
                        transaction
                    });
                    
                    // Then delete the simulator itself
                    const simDeleted = await Simulator.destroy({
                        where: { id: sim.id },
                        transaction
                    });
                    
                    if (simDeleted > 0) {
                        deletedCount++;
                        console.log(`✓ Deleted simulator ${sim.id} and ${dataDeleted} related data entries`);
                    }
                }

                // Commit the transaction
                await transaction.commit();
                
                console.log(`\n✅ Cleanup completed successfully!`);
                console.log(`📊 Deleted ${deletedCount} simulators`);
                console.log(`📊 Kept ${toKeep.length} simulators with good data`);

                // Show final state
                console.log('\n=== Final Database State ===');
                const finalSimulators = await Simulator.findAll({
                    attributes: ['id', 'query', 'locale', 'status'],
                    order: [['id', 'ASC']]
                });

                console.log(`Remaining simulators: ${finalSimulators.length}`);
                finalSimulators.forEach(sim => {
                    console.log(`ID ${sim.id}: "${sim.query}" (${sim.locale})`);
                });

            } catch (error) {
                // Rollback on error
                await transaction.rollback();
                console.error('❌ Error during cleanup, rolled back changes:', error);
            }

        } else {
            console.log('\n✅ No simulators need to be deleted. All simulators have sufficient data.');
        }

    } catch (error) {
        console.error('❌ Database cleanup failed:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Database connection closed.');
    }
}

// Add a safety check
console.log('⚠️  DATABASE CLEANUP TOOL ⚠️');
console.log('This will permanently delete simulators with insufficient data.');
console.log('Make sure you have a database backup before proceeding.\n');

cleanupDatabase();