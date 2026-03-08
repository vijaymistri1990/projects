import 'dotenv/config';
import { sequelize } from './src/config/database.js';
import PerformanceSheet from './src/models/PerformanceSheet.js';
import User from './src/models/User.js';
import Simulator from './src/models/Simulator.js';

async function seed() {
  try {
    console.log("Starting DB seed...");
    // Find at least one user and simulator to map the relations
    const users = await User.findAll({ limit: 1 });
    const simulators = await Simulator.findAll({ limit: 1 });

    if (!users.length || !simulators.length) {
      console.log('Need at least one user and simulator in the database to link performance records.');
      process.exit(1);
    }

    // You indicated using the system. Since we do not know the exact user ID you're logged in with,
    // let's just use a specific user if known or create records for all top 3 users just in case.
    const topUsers = await User.findAll({ limit: 3 });
    const simulatorId = simulators[0].id;

    let totalCreated = 0;
    for (const u of topUsers) {
      for (let month = 1; month <= 6; month++) {
        await PerformanceSheet.create({
          user_id: u.id,
          simulator_id: simulatorId,
          month: month,
          result: `Pass`,
          score: 80 + month,
          performance_data: { test: true, iteration: month }
        });
        totalCreated++;
      }
    }

    console.log(`Successfully inserted ${totalCreated} performance records.`);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

seed();
