'use strict';
const common = require('common-utils');
const config = require('../config/config');
const { handleSuccess, handleError } = require('../helper/response_handler');
const { db } = require('../helper');
const bcrypt = require('bcryptjs');

const newUser = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let checkExistUser = (await db.selectedRows(config.TABLE_USERS,'id',`user_name = '${reqData.user_name}'`)).id;
            if(!(common.checkValues(checkExistUser))){
                reqData.password = db.getEncryptDecryptData('encrypt',reqData.password);
                let insertData = {
                    name : reqData.name,
                    user_name : reqData.user_name,
                    password : reqData.password
                }
                let insert_user = await db.insert(config.TABLE_USERS,insertData);
                let user_id = insert_user?.insertId;
                let insert_data = [`(${user_id},1)`,`(${user_id},2)`,`(${user_id},3)`,`(${user_id},4)`,`(${user_id},5)`,`(${user_id},6)`,`(${user_id},7)`,`(${user_id},8)`,`(${user_id},9)`,`(${user_id},10)`,`(${user_id},11)`,`(${user_id},12)`];
                let inspefomance_data = `INSERT INTO ${config.TABLE_SM_SIMULATOR_PERFOMANCE_SHEET} (user_id,month) VALUES ${insert_data.toString()}`;
                let insertwork_data = `INSERT INTO ${config.TABLE_SM_SIMULATOR_WORK_SHEET} (user_id,month) VALUES ${insert_data.toString()}`;
                await Promise.all([db.query(inspefomance_data),db.query(insertwork_data)]);
                //let insert_perfomance = await db.insert(config.TABLE_SM_SIMULATOR_PERFOMANCE_SHEET,insert_data);
                if(insert_user.affectedRows > 0){
                    handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, [], res);
                } else {
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                }
            }else{
                handleError(statusCode.OK, en.USER_NAME_ALREADY_EXITS, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const userList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        let limit = reqData.limit || 10;
        reqData.page = (Number(reqData?.page) > 0) ? reqData.page : 1;
        let offset = ((Number(reqData.page) - 1) * limit);
        let where = null;
        let [user_data, total_data] = await Promise.all([db.selectResults(config.TABLE_USERS,'*',where,'id',null,limit,offset),db.getTotalData(config.TABLE_USERS,where)]);
        if (user_data.length > 0 && total_data) {
            user_data.map((item) => { item.password = db.getEncryptDecryptData('decrypt',item.password)})
            let data = {
                user_data : user_data || [],
                total_data : total_data
            }
            handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
        }else{
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
    try {
        if (common.isRealValue(reqData)) {
            let user_id = reqData.id;
            let delete_user = await db.deleteRetNo(config.TABLE_USERS,`id = ${user_id}`);
            let delete_simulater_user_data = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_USER_DATA,`user_id = ${user_id}`);
            let delete_perfomance_data  = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_PERFOMANCE_SHEET,`user_id = ${user_id}`);
            let delete_work_data  = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_WORK_SHEET,`user_id = ${user_id}`);
            if (delete_user || delete_user?.affectedRows > 0) {
                handleSuccess(statusCode.OK, en.USER_DELETE_SUCCESSFULLY, [], res);
            }else{
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
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
            let checkExistUser = (await db.selectedRows(config.TABLE_USERS,'*',`id = ${userId}`));
            if(checkExistUser){
                let checkExistuserName = await db.selectResults(config.TABLE_USERS,'id',`user_name = '${reqData.user_name}'`);
                if(!common.isRealValue(checkExistuserName) || checkExistUser.user_name == reqData.user_name){
                    let data = {
                        user_name : reqData.user_name,
                        name : reqData.name,
                        updated_at : common.date_format('Y-m-d H:i:s')
                    }
                    let updateUser = await db.update(config.TABLE_USERS,data,`id = ${userId}`);
                    if(updateUser){
                        handleSuccess(statusCode.OK, en.USER_UPDATE_SUCCESSFULLY, [], res);
                    }else{
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                }else{
                    handleError(statusCode.OK, en.USER_NAME_ALREADY_EXITS, res);
                }
            }else{
                handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
            }
        }else{
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
            if(reqData.password === reqData.confirm_password){
                let checkExistUser = (await db.selectedRows(config.TABLE_USERS,'*',`id = ${userId}`));
                if(checkExistUser){
                    reqData.confirm_password = db.getEncryptDecryptData('encrypt',reqData.confirm_password);
                    let data = {
                        password : reqData.confirm_password,
                        updated_at : common.date_format('Y-m-d H:i:s')
                    }
                    let updateUser = await db.update(config.TABLE_USERS,data,`id = ${userId}`);
                    if(updateUser){
                        handleSuccess(statusCode.OK, en.PASSWORD_CHANGE_SUCCESSFULLY, [], res);
                    }else{
                        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                    }
                }else{
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                }
            }else{
                handleError(statusCode.OK, en.PASSWORD_NOT_MATCH, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

module.exports = {
    newUser,
    userList,
    deleteUser,
    updateUser,
    updatePassword
}