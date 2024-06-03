const config = {
    "MODE": process.env.SERVER,
    "HOST": process.env.HOST,
    "secret": process.env.secret,
    "db_config": {
        "host": process.env.db_host,
        "user": process.env.db_user,
        "password": process.env.db_password,
        "database": process.env.db_database,
        "debug": (process.env.debug == "true"),
        "waitForConnections": (process.env.waitForConnections == "true"),
        "queueLimit": process.env.queueLimit,
        "multipleStatements": (process.env.multipleStatements == "true"),
        "charset": process.env.charset,
        "connectionLimit": 1
    },
    "db_log_config": {
        "host": process.env.log_host,
        "user": process.env.log_user,
        "password": process.env.log_password,
        "database": process.env.log_database,
        "debug": (process.env.debug == "true"),
        "waitForConnections": (process.env.waitForConnections == "true"),
        "queueLimit": process.env.queueLimit,
        "multipleStatements": (process.env.multipleStatements == "true"),
        "charset": process.env.charset
    },
    /* res status code */
    'status_code_config': {
        'OK': 200,
        'CREATED': 201,
        'ACCEPTED': 202,
        'BAD_REQUEST': 400,
        'UNAUTHORIZED': 401,
        'PAYMENT_REQUIRED': 402,
        'FORBIDDEN': 403,
        'NOT_FOUND': 404,
        'UNPROCEESSABLE_ENTITY': 422,
        'INTERNAL_SERVER_ERROR': 500,
        'BAD_GATEWAY': 502
    },
    /* res messages */
    'en_message_config': {
        'ERROR_NO_DATA_FOUND': 'No data found',
        'ERROR_NOT_VALID_TOKEN': 'Not valid token data.',
        'ERROR_SOMETHING_WRONG': 'Something went wrong!',
        'DATA_FETCH_SUCCESSFULLY': 'data fetch successfully!',
        'LOGIN_SUCESSFULLY': 'Login sucessfully!',
        'DATA_ADD_SUCCESSFULLY': 'data add successfully!',
        'DATA_RESET_SUCCESSFULLY': 'data reset successfully!',
        'DATA_UPDATE_SUCCESSFULLY': 'data update successfully!',
        'USER_NAME_ALREADY_EXITS': 'user name already exits!',
        'ERROR_NO_FOUND_TOKEN': 'token not found.',
        'USER_DELETE_SUCCESSFULLY': 'user delete successfully!',
        'SIMULATOR_TOPIC_DELETE_SUCCESSFULLY': 'simulator topic delete successfully!',
        'SIMULATOR_DELETE_SUCCESSFULLY': 'simulator delete successfully!',
        'USER_UPDATE_SUCCESSFULLY': 'user update successfully!',
        'PASSWORD_CHANGE_SUCCESSFULLY': 'password change successfully!',
        'SIMULATOR_UPDATE_SUCCESSFULLY': 'simulator update successfully!',
        'SIMULATOR_STATUS_UPDATE_SUCCESSFULLY': 'simulator status update successfully!',
        'SIMULATOR_TOPICS_UPDATE_SUCCESSFULLY': 'simulator topics update successfully!',
        'PASSWORD_UPDATE_SUCCESSFULLY': 'password update successfully!',
        'PASSWORD_NOT_MATCH': 'password not matched!',
        'WRONG_PASSWORD': 'wrong password!',
    },
    'ALLOWED_IMG_TYPE': ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'],
    "editor_url": process.env.EDITOR_URL,
    "ACTION_ENCRYPT": "encrypt",
    "ACTION_DECRYPT": "decrypt",
    "simulator_type_with_meta" : [0,1,2,3],
    /* TABLE CONSTANTS */
    "TABLE_USERS": 'sm_users',
    "TABLE_SM_SIMULATOR": 'sm_simulator',
    "TABLE_SM_SIMULATOR_TOPICS": 'sm_simulator_data',
    "TABLE_SM_SIMULATOR_USER_DATA": 'sm_simulator_user_data',
    "TABLE_SM_SIMULATOR_PERFOMANCE_SHEET": 'sm_perfomance_sheet',
    "TABLE_SM_SIMULATOR_WORK_SHEET": 'sm_work_sheet',
    /* Logs Tables */
    'TABLE_GENERAL': 'general',
    "APP_PREFIX": process.env.SITE_PREFIX
}
module.exports = config