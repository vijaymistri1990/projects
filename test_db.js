import { sequelize } from './src/config/database.js';
import PerformanceSheet from './src/models/PerformanceSheet.js';

async function check() {
  try {
    const data = await PerformanceSheet.findAll();
    console.log("Data total rows:", data.length);
    console.log("Data rows:", JSON.stringify(data, null, 2));

    const [fromQ] = await sequelize.query("SELECT * FROM sm_performance_sheet");
    console.log("Real DB direct:", fromQ.length);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit();
}
check();
