'use strict';
const common = require('common-utils');
const config = require('../config/config');
const jwt = require("jsonwebtoken");
const { handleSuccess, handleError } = require('../helper/response_handler');
const { db } = require('../helper');
const bcrypt = require('bcryptjs');

const signIn = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let user_name = reqData.user_name;
            let password = reqData.password;
            let user_detail = await db.selectedRows(config.TABLE_USERS,'*',`user_name = '${user_name}'`);
            if(user_detail){
                password = db.getEncryptDecryptData('encrypt',password);
                if(user_detail.password == password){
                    let data = {
                        user_name : user_detail.user_name,
                        name : user_detail.name,
                        id : user_detail.id,
                        user : (user_detail.type === '1') ? 1 : 0
                    }
                    jwt.sign(data, config.secret, { expiresIn: 1440 * 60 }, (err, security_token) => {
                        if (err) {
                            throw err;
                        } else {
                            res.setHeader("security_token", Buffer.from(security_token).toString('base64'));
                            let return_data = {
                                user_data: data,
                                token: Buffer.from(security_token).toString('base64')
                            };
                            handleSuccess(statusCode.OK, en.LOGIN_SUCESSFULLY, return_data , res);
                        }
                    }); /* 24 hours */
                }else{
                    handleError(statusCode.OK, en.WRONG_PASSWORD, res);
                }
            }else{
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}
const simulatorTopicsList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name) && common.isRealValue(reqData)){
            let limit = reqData.limit || 10;
            let language = reqData.language;
            reqData.page = (Number(reqData?.page) > 0) ? reqData.page : 1;
            let offset = ((Number(reqData.page) - 1) * limit);
            let where = {
                'status' : '1',
                'locale' : language
            };
            let type = '0';
            if(language == 'English(in)'){
                type = '1';
            }
            let user_sub_data = await db.selectResults(config.TABLE_SM_SIMULATOR_USER_DATA,'*',{user_id : res.locals.user_id,type : type});
            let [simulator_data, total_data] = await Promise.all([db.selectResults(config.TABLE_SM_SIMULATOR,'*',where,'id',null,limit,offset),db.getTotalData(config.TABLE_SM_SIMULATOR,where)]);
            if (simulator_data.length > 0 && total_data ) {
                let start_simulator_id = simulator_data[0]?.id;
                if(user_sub_data.length > 0){
                    let user_sub_id = common.array_column(user_sub_data,'simulator_id');
                    let nextIdQuery = await db.query(`SELECT id FROM ${config.TABLE_SM_SIMULATOR} WHERE id NOT IN (${user_sub_id.toString()}) AND locale = '${language}' LIMIT 1`);
                    start_simulator_id = nextIdQuery[0]?.id;
                }
                let data = {
                    user_data : simulator_data || [],
                    total_data : total_data,
                    user_sub_data : user_sub_data || [],
                    start_simulator_id : start_simulator_id
                }
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
            }else{
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        }

    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const simulatorTopicsData = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name) && common.isRealValue(reqData)){
            let user_id = res.locals.user_id;
            let simulator_id = reqData?.simulator_id;
            let simulator_data = await db.selectedRows(config.TABLE_SM_SIMULATOR,'*', {id : simulator_id});
            let simulator_ids = await db.selectResults(config.TABLE_SM_SIMULATOR,'id', {status : '1'});
            let simulator_id_data = [];
            if(simulator_ids.length){
                simulator_id_data = common.array_column(simulator_ids,'id');
            }
            let simulator_topics_data = await db.selectResults(config.TABLE_SM_SIMULATOR_TOPICS,'*',{simulator_id: simulator_id});
            let user_sub_data = await db.selectResults(config.TABLE_SM_SIMULATOR_USER_DATA,'*',{simulator_id : simulator_id,user_id: user_id});
            if(simulator_topics_data.length > 0 && simulator_data){
                let data = {
                    simulator_topics_data : simulator_topics_data,
                    simulator_data : simulator_data,
                    user_sub_data : user_sub_data || [],
                    length : simulator_topics_data.length,
                    simulator_id_data : simulator_id_data
                };
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
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

const simulatorTopicsSubData = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name) && common.isRealValue(reqData)){
            let user_id = res.locals.user_id;
            let data = {
                simulator_id : reqData?.simulator_id,
                user_id : user_id,
                simulator_result : reqData?.simulator_result,
                simulator_comment : reqData?.simulator_comment,
                type : reqData?.type,
                sxs_outcome : reqData?.sxs_outcome,
                nm_outcome : reqData?.nm_outcome,
                simulator_topic_result : JSON.stringify(reqData?.simulator_topic_result)
            }
            let insert_simulatior_user_data = await db.insert(config.TABLE_SM_SIMULATOR_USER_DATA,data);
            if(insert_simulatior_user_data.affectedRows > 0){
                handleSuccess(statusCode.OK, en.DATA_ADD_SUCCESSFULLY, [], res);
            } else {
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

const simulatorTopicsReset = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name)){
            let type = reqData.type;
            let user_id = res.locals.user_id;
            let delete_user_sub_data = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_USER_DATA,`user_id = ${user_id} AND type = ${type}`);
            if(delete_user_sub_data){
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, [], res);
            } else {
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
const performanceResult = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name)){
            let user_id = res.locals.user_id;
            let perfomance_result_data = await db.selectResults(config.TABLE_SM_SIMULATOR_PERFOMANCE_SHEET,'id,user_id,month,result',`user_id = '${user_id}'`);
            if(perfomance_result_data.length > 0){
                handleSuccess(statusCode.OK, en.DATA_RESET_SUCCESSFULLY, perfomance_result_data, res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}
const performanceResultUpdate = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    try {
        let reqData = req.body;
        if(common.checkValues(res.locals.user_id) && common.checkValues(reqData.id) && common.checkValues(reqData.result)){
            let user_id = res.locals.user_id;
            let data = {
                result : reqData.result,
                updated_at : common.date_format('Y-m-d H:i:s')
            }
            let updatePerfomanceData = await db.update(config.TABLE_SM_SIMULATOR_PERFOMANCE_SHEET,data,{user_id : user_id,id : reqData.id});
            if(updatePerfomanceData){
                handleSuccess(statusCode.OK, en.DATA_UPDATE_SUCCESSFULLY, [], res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}

const worksheet = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    try {
        if(common.checkValues(res.locals.user_id) && common.checkValues(res.locals.user_name)){
            let user_id = res.locals.user_id;
            let work_result_data = await db.selectResults(config.TABLE_SM_SIMULATOR_WORK_SHEET,'id,user_id,month,result',`user_id = '${user_id}'`);
            if(work_result_data.length > 0){
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, work_result_data, res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        }else{
            handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
        }
    } catch (error) {
        console.log("error==============catch==============>", error)
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
}
const worksheetUpdate = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    try {
        let reqData = req.body;
        if(common.checkValues(res.locals.user_id) && common.checkValues(reqData.id) && common.checkValues(reqData.result)){
            let user_id = res.locals.user_id;
            let data = {
                result : reqData.result,
                updated_at : common.date_format('Y-m-d H:i:s')
            }
            let updateWorkData = await db.update(config.TABLE_SM_SIMULATOR_WORK_SHEET,data,{user_id : user_id,id : reqData.id});
            if(updateWorkData){
                handleSuccess(statusCode.OK, en.DATA_UPDATE_SUCCESSFULLY, [], res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
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
    signIn,
    simulatorTopicsList,
    simulatorTopicsData,
    simulatorTopicsSubData,
    simulatorTopicsReset,
    performanceResultUpdate,
    performanceResult,
    worksheet,
    worksheetUpdate
}