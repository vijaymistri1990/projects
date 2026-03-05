import 'dotenv/config';
import { sequelize } from './src/config/database.js';
import PerformanceSheet from './src/models/PerformanceSheet.js';

const data = [
    [1, 4, 1, '12', '2023-04-22 12:33:43', '2023-04-22 12:34:24'],
    [2, 4, 2, '24', '2023-04-22 12:33:43', '2023-04-22 12:34:28'],
    [3, 4, 3, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [4, 4, 4, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [5, 4, 5, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [6, 4, 6, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [7, 4, 7, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [8, 4, 8, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [9, 4, 9, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [10, 4, 10, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [11, 4, 11, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43'],
    [12, 4, 12, null, '2023-04-22 12:33:43', '2023-04-22 12:33:43']
];

async function insertData() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        for (const row of data) {
            const [id, user_id, simulator_id, monthRaw, created_at, updated_at] = row;
            const month = monthRaw ? parseInt(monthRaw) : null;

            // we do not insert id to avoid conflict with existing sequences, 
            // but to be safe we can use findOrCreate by user_id and simulator_id
            await PerformanceSheet.findOrCreate({
                where: { user_id, simulator_id },
                defaults: {
                    user_id,
                    simulator_id,
                    month,
                    created_at: new Date(created_at)
                }
            });
        }
        console.log('Data processed successfully.');
    } catch (error) {
        console.error('Unable to process data:', error);
    } finally {
        await sequelize.close();
    }
}

insertData();
