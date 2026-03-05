import 'dotenv/config';
import { sequelize } from './src/config/database.js';

async function check() {
    try {
        const [users] = await sequelize.query('SELECT id, name, type FROM sm_users');
        const [sims] = await sequelize.query('SELECT id, title FROM sm_simulator');
        console.log('Users:', users);
        console.log('Simulators:', sims);
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}
check();
