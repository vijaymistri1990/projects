'use strict';
import common from 'common-utils';
import config from '../config/config.js';
import { handleSuccess, handleError } from '../helper/response_handler.js';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';
import db_functions from '../helper/db_functions.js';

// Import models
import {
    User,
    Simulator,
    SimulatorUserData,
    PerformanceSheet,
    WorkSheet
} from '../models/index.js';

const newUser = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;

    // Use transaction for data consistency
    const transaction = await sequelize.transaction();

    try {
        if (common.isRealValue(reqData)) {
            // Check if user already exists
            let checkExistUser = await User.findOne({
                where: { username: reqData.user_name },
                attributes: ['id'],
                transaction
            });

            if (!checkExistUser) {
                // Encrypt password
                reqData.password = db_functions.getEncryptDecryptData('encrypt', reqData.password);

                // Create new user - map frontend fields to database fields
                let insert_user = await User.create({
                    username: reqData.user_name,  // Map user_name to username
                    name: reqData.name,  // Add name field
                    email: reqData.email || `${reqData.user_name}@example.com`, // Default email if not provided
                    password: reqData.password,
                    type: reqData.type || '0'  // '0' = normal user, '1' = admin
                }, { transaction });

                let user_id = insert_user.id;

                // Check if any simulators exist before creating performance/worksheet records
                const simulators = await Simulator.findAll({
                    attributes: ['id'],
                    transaction
                });

                // Only create performance and worksheet records if simulators exist
                if (simulators && simulators.length > 0) {
                    // Get the first simulator ID
                    const firstSimulatorId = simulators[0].id;

                    // Create performance sheet records for 12 months
                    let performanceData = [];
                    let worksheetData = [];

                    for (let month = 1; month <= 12; month++) {
                        performanceData.push({
                            user_id: user_id,
                            simulator_id: firstSimulatorId,
                            score: null,
                            performance_data: { month: month }
                        });

                        worksheetData.push({
                            user_id: user_id,
                            simulator_id: firstSimulatorId,
                            worksheet_data: { month: month }
                        });
                    }

                    // Bulk create performance and worksheet records
                    await Promise.all([
                        PerformanceSheet.bulkCreate(performanceData, { transaction }),
                        WorkSheet.bulkCreate(worksheetData, { transaction })
                    ]);
                } else {
                    console.log('No simulators found. Skipping performance sheet and worksheet creation.');
                }

                await transaction.commit();
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, [], res);
            } else {
                await transaction.rollback();
                handleError(statusCode.OK, en.USER_NAME_ALREADY_EXITS, res);
            }
        } else {
            await transaction.rollback();
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        await transaction.rollback();
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const createAdmin = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;

    try {
        // Only allow if NO admin user exists yet (bootstrapping protection)
        let existingAdmin = await User.findOne({ where: { type: '1' } });
        if (existingAdmin) {
            return handleError(statusCode.UNAUTHORIZED, 'Admin already exists. Use the authenticated new-user API.', res);
        }

        if (!reqData.user_name || !reqData.password) {
            return handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }

        // Check if username already taken
        let checkExistUser = await User.findOne({ where: { username: reqData.user_name } });
        if (checkExistUser) {
            return handleError(statusCode.OK, en.USER_NAME_ALREADY_EXITS, res);
        }

        // Encrypt password and create admin user
        let encryptedPassword = db_functions.getEncryptDecryptData('encrypt', reqData.password);
        await User.create({
            username: reqData.user_name,
            email: reqData.email || `${reqData.user_name}@example.com`,
            password: encryptedPassword,
            type: '1'  // Always admin for this bootstrap endpoint
        });

        handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, [], res);
    } catch (error) {
        console.log("error==============catch==============>", error);
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const userList = async (req, res) => {

    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        let limit = parseInt(reqData.limit) || 10;
        reqData.page = (Number(reqData?.page) > 0) ? reqData.page : 1;
        let offset = ((Number(reqData.page) - 1) * limit);

        // Use Sequelize to get user data with pagination
        let [user_data, total_data] = await Promise.all([
            User.findAll({
                order: [['id', 'ASC']],
                limit: limit,
                offset: offset
            }),
            User.count()
        ]);

        if (user_data.length > 0 && total_data) {
            // Decrypt passwords for display (keeping existing logic)
            user_data = user_data.map((item) => {
                let userData = item.toJSON();
                userData.password = db_functions.getEncryptDecryptData('decrypt', userData.password);
                return userData;
            });

            let data = {
                user_data: user_data || [],
                total_data: total_data
            }
            handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
        } else {
            handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const deleteUser = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;

    // Use transaction for data consistency
    const transaction = await sequelize.transaction();

    try {
        if (common.isRealValue(reqData)) {
            let user_id = reqData.id;

            // Delete related data first (foreign key constraints)
            await Promise.all([
                SimulatorUserData.destroy({
                    where: { user_id: user_id },
                    transaction
                }),
                PerformanceSheet.destroy({
                    where: { user_id: user_id },
                    transaction
                }),
                WorkSheet.destroy({
                    where: { user_id: user_id },
                    transaction
                })
            ]);

            // Delete user
            let delete_user = await User.destroy({
                where: { id: user_id },
                transaction
            });

            if (delete_user > 0) {
                await transaction.commit();
                handleSuccess(statusCode.OK, en.USER_DELETE_SUCCESSFULLY, [], res);
            } else {
                await transaction.rollback();
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        } else {
            await transaction.rollback();
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        await transaction.rollback();
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const updateUser = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let userId = reqData.id;

            // Check if user exists
            let checkExistUser = await User.findOne({
                where: { id: userId }
            });

            if (checkExistUser) {
                // Check if username is already taken by another user
                let checkExistuserName = await User.findAll({
                    where: {
                        username: reqData.user_name,
                        id: { [Op.ne]: userId } // Not equal to current user ID
                    }
                });

                if (checkExistuserName.length === 0) {
                    // Update user data
                    let [updateCount] = await User.update(
                        {
                            username: reqData.user_name,
                            name: reqData.name,  // Add name field
                            email: reqData.email || checkExistUser.email, // Keep existing email if not provided
                            ...(reqData.type !== undefined && { type: reqData.type }), // Update type if provided
                            updated_at: new Date()
                        },
                        {
                            where: { id: userId }
                        }
                    );

                    if (updateCount > 0) {
                        handleSuccess(statusCode.OK, en.USER_UPDATE_SUCCESSFULLY, [], res);
                    } else {
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                } else {
                    handleError(statusCode.OK, en.USER_NAME_ALREADY_EXITS, res);
                }
            } else {
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const updatePassword = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let userId = reqData.id;

            if (reqData.password === reqData.confirm_password) {
                // Check if user exists
                let checkExistUser = await User.findOne({
                    where: { id: userId }
                });

                if (checkExistUser) {
                    // Encrypt password
                    reqData.confirm_password = db_functions.getEncryptDecryptData('encrypt', reqData.confirm_password);

                    // Update password
                    let [updateCount] = await User.update(
                        {
                            password: reqData.confirm_password,
                            updated_at: new Date()
                        },
                        {
                            where: { id: userId }
                        }
                    );

                    if (updateCount > 0) {
                        handleSuccess(statusCode.OK, en.PASSWORD_CHANGE_SUCCESSFULLY, [], res);
                    } else {
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                } else {
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                }
            } else {
                handleError(statusCode.OK, en.PASSWORD_NOT_MATCH, res);
            }
        } else {
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

export default {
    createAdmin,
    newUser,
    userList,
    deleteUser,
    updateUser,
    updatePassword
};