import common from "common-utils";
import { Log } from '../models/index.js';

const createLogDb = async (log_type = 'general', log_data = null, query = null) => {
    try {
        let log_message = '';
        
        if (!common.isRealValue(query)) {
            if (log_data) {
                if (typeof log_data === 'object') {
                    log_message = JSON.stringify(log_data);
                } else {
                    log_message = log_data.toString();
                }
            }
        } else {
            log_message = query;
        }
        
        // Use Sequelize to create log entry
        await Log.create({
            log_type: log_type,
            log_message: log_message
        });
        
        return true;
    } catch (error) {
        console.error('Error creating log:', error);
        
        // Fallback logging
        try {
            await Log.create({
                log_type: 'error',
                log_message: `Failed to log: ${JSON.stringify({ log_type, log_data, query, error: error.message })}`
            });
        } catch (fallbackError) {
            console.error('Fallback logging also failed:', fallbackError);
        }
        
        return false;
    }
}

export { createLogDb };