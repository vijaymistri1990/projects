'use strict';
const common = require('common-utils');
const config = require('../config/config');
const { handleSuccess, handleError } = require('../helper/response_handler');
const { db } = require('../helper');
const bcrypt = require('bcryptjs');
const ogs = require('open-graph-scraper');
const fs = require('fs');

const newAddSimulator = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let insertData = {
                query : reqData.query,
                locale : reqData.locale,
                location : reqData.user_location,
                longtitude : reqData.longtitude,
                latitude : reqData.latitude,
                result_show : reqData.result_show,
                result : reqData.result
            }
            let insert_simulator_data = await db.insert(config.TABLE_SM_SIMULATOR,insertData);
            if(insert_simulator_data.affectedRows > 0){
                let data = {
                    id  : insert_simulator_data.insertId
                }
                handleSuccess(statusCode.OK, en.DATA_ADD_SUCCESSFULLY, data, res);
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

const newAddSimulatorTopics = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let metadata_link = {};
            let simulator_type = reqData.simulator_type;
            let meta_video_link = [];
            let image_link = '';
            if(simulator_type !== ''){
                if(config.simulator_type_with_meta.includes(parseInt(simulator_type))){
                    metadata_link = await ogs({ url: reqData.link }).then(({ error, result} = data) => {
                        return { error : error, result : result}
                    });
                }
                if(simulator_type == 4){
                    if(common.isRealValue(reqData.more_videos)){
                        let more_videos = reqData.more_videos;
                        if(more_videos.length > 0){
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta = await ogs({ url: item }).then(({ error, result} = data) => {
                                    return { error : error, result : result}
                                });
                                return { link : item, video_meta : more_videos_meta?.result};
                            }))
                        }
                    }
                }
                if(simulator_type == 5){
                    image_link = await db.storeImage(reqData.scrb_link.match(/^data:([A-Za-z-+/]+);base64,(.+)$/),res,'src/assets/simulator_img/');
                }
            }
            let metaLink_result = JSON.stringify(metadata_link?.result);
            if(metaLink_result){
                metaLink_result = metaLink_result.replace(/'/g, "");
            }
            if(!metadata_link.error){
                let insertData = {
                    simulator_id : reqData?.simulator_id,
                    simulator_type : reqData?.simulator_type,
                    location : reqData.location,
                    link : reqData?.link,
                    link_meta : metaLink_result,
                    slider_type : reqData?.slider_type,
                    slider_name : reqData?.slider_name,
                    slider_result_json : JSON.stringify(reqData?.slider_result_json),
                    final_result_show : reqData?.final_result_show,
                    final_result : reqData?.final_result
                }
                if(simulator_type == 5){
                    delete insertData.link;
                    delete insertData.link_meta;
                    insertData.scrb_link = image_link;
                }
                if(simulator_type == 4){
                    delete insertData.link;
                    delete insertData.link_meta;
                    insertData.youtube_json = JSON.stringify(meta_video_link);
                    insertData. youtube_link_arr = JSON.stringify(reqData?.more_videos);
                }
                if(simulator_type == 2){
                    insertData.question_type = reqData.question_type;
                    insertData.questions_json = JSON.stringify(reqData.questions);
                }
                if(simulator_type == 3){
                    insertData.link_with_description = reqData.link_with_description;
                }
                let insert_simulator_topics = await db.insert(config.TABLE_SM_SIMULATOR_TOPICS,insertData);
                if(insert_simulator_topics.affectedRows > 0){
                    handleSuccess(statusCode.OK, en.DATA_ADD_SUCCESSFULLY, [], res);
                } else {
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
                }
            }else{
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

const simulatorList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        let limit = reqData.limit || 10;
        reqData.page = (Number(reqData?.page) > 0) ? reqData.page : 1;
        let offset = ((Number(reqData.page) - 1) * limit);
        let where = null;
        let [simulator_data, total_data] = await Promise.all([db.selectResults(config.TABLE_SM_SIMULATOR,'*',where,'id',null,limit,offset),db.getTotalData(config.TABLE_SM_SIMULATOR,where)]);
        if (simulator_data.length > 0 && total_data) {
            let data = {
                user_data : simulator_data || [],
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

const simulatorTopicList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        if(common.checkValues(reqData.simulator_id)){
            let simulator_id = reqData.simulator_id;
            let simulator_topic_data = await db.selectResults(config.TABLE_SM_SIMULATOR_TOPICS,'*', {simulator_id : simulator_id});
            if(simulator_topic_data.length > 0){
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, simulator_topic_data, res);
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

const simulatorTopicListData = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        if(common.checkValues(reqData.simulator_id)){
            let simulator_id = reqData.simulator_id;
            let simulator_topic_data = await db.selectedRows(config.TABLE_SM_SIMULATOR_TOPICS,'*', {id : simulator_id});
            if(simulator_topic_data){
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, simulator_topic_data, res);
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

const simulatorDelete = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.checkValues(reqData.simulator_id)) {
            let simulator_id = reqData.simulator_id;
            let delete_simulator = await db.deleteRetNo(config.TABLE_SM_SIMULATOR,`id = ${simulator_id}`);
            let delete_simulator_topics = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_TOPICS,`simulator_id = ${simulator_id}`);
            if (delete_simulator && delete_simulator_topics) {
                handleSuccess(statusCode.OK, en.SIMULATOR_DELETE_SUCCESSFULLY, [], res);
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

const simulatorDeleteTopics = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.checkValues(reqData.simulator_topic_id)) {
            let simulator_topic_id = reqData.simulator_topic_id;
            let delete_simulator_topics = await db.deleteRetNo(config.TABLE_SM_SIMULATOR_TOPICS,`id = ${simulator_topic_id}`);
            if (delete_simulator_topics) {
                handleSuccess(statusCode.OK, en.SIMULATOR_TOPIC_DELETE_SUCCESSFULLY, [], res);
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

const simulatorUpdate = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let simulator_id = reqData.id;
            let update_data = {
                query : reqData.query,
                locale : reqData.locale,
                location : reqData.user_location,
                longtitude : reqData.longtitude,
                latitude : reqData.latitude,
                result : reqData.result,
                result_show : reqData.result_show,
                updated_at : common.date_format('Y-m-d H:i:s')
            };
            let updateSimulator = await db.update(config.TABLE_SM_SIMULATOR,update_data,`id = ${simulator_id}`);
            if(updateSimulator){
                handleSuccess(statusCode.OK, en.SIMULATOR_UPDATE_SUCCESSFULLY, [], res);
            }else{
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

const simulatorStatusUpdate = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let simulator_id = reqData.id;
            let update_data = {
                status : reqData.status
            };
            let updateSimulator = await db.update(config.TABLE_SM_SIMULATOR,update_data,`id = ${simulator_id}`);
            if(updateSimulator){
                handleSuccess(statusCode.OK, en.SIMULATOR_STATUS_UPDATE_SUCCESSFULLY, [], res);
            }else{
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

const simulatorUpdateTopics = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let simulator_topic_id = reqData.id;
            let metadata_link = {};
            let simulator_type = reqData.simulator_type;
            let meta_video_link = [];
            let image_link = '';
            if(simulator_type !== ''){
                if(config.simulator_type_with_meta.includes(parseInt(simulator_type))){
                    metadata_link = await ogs({ url: reqData.link }).then(({ error, result} = data) => {
                        return { error : error, result : result}
                    });
                }
                if(simulator_type == 4){
                    if(common.isRealValue(reqData.more_videos)){
                        let more_videos = reqData.more_videos;
                        if(more_videos.length > 0){
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta = await ogs({ url: item }).then(({ error, result} = data) => {
                                    return { error : error, result : result}
                                });
                                return { link : item, video_meta : more_videos_meta?.result};
                            }))
                        }
                    }
                }

                if(simulator_type == 5){
                    let simulator_topic_data = await db.selectedRows(config.TABLE_SM_SIMULATOR_TOPICS, 'scrb_link,id', {id : simulator_topic_id});
                    if (common.checkValues(reqData.scrb_link) && simulator_topic_data.scrb_link != reqData.scrb_link) {
                        image_link = await db.storeImage(reqData.scrb_link.match(/^data:([A-Za-z-+/]+);base64,(.+)$/), res, 'src/assets/simulator_img/');
                    } else {
                        let image_name = new Date().getTime() + '_' + db.randomNumber(0, 10000);
                        image_link = image_name + '.' + simulator_topic_data.scrb_link.split('.')[1];
                        fs.rename('src/assets/simulator_img/' + simulator_topic_data.scrb_link, 'src/assets/simulator_img/' + image_link, (err) => {
                            if (err) { throw err; }
                        });
                    }
                }

            }
            let metaLink_result = (JSON.stringify(metadata_link?.result));
            if(metaLink_result){
                metaLink_result = metaLink_result.replace(/'/g, "");
            }
            let update_data = {
                simulator_type: reqData?.simulator_type,
                location: reqData?.location,
                link: reqData?.link,
                link_meta: metaLink_result,
                slider_type : reqData?.slider_type,
                slider_name : reqData?.slider_name,
                slider_result_json : JSON.stringify(reqData?.slider_result_json),
                final_result_show : reqData?.final_result_show,
                final_result : reqData?.final_result,
                updated_at: common.date_format('Y-m-d H:i:s')
            };
            if(simulator_type == 5){
                delete update_data.link;
                delete update_data.link_meta;
                update_data.scrb_link = image_link
            }
            if(simulator_type == 4){
                delete update_data.link;
                delete update_data.link_meta;
                update_data.youtube_json = JSON.stringify(meta_video_link)
                update_data.youtube_link_arr = JSON.stringify(reqData?.more_videos);
            }
            if(simulator_type == 2){
                update_data.question_type = reqData.question_type;
                update_data.questions_json = JSON.stringify(reqData.questions);
            }
            if(simulator_type == 3){
                update_data.link_with_description = reqData.link_with_description;
            }
            let updateSimulatorTopics = await db.update(config.TABLE_SM_SIMULATOR_TOPICS,update_data,`id = ${simulator_topic_id} AND simulator_id = ${reqData.simulator_id}`);
            if(updateSimulatorTopics) {
                handleSuccess(statusCode.OK, en.SIMULATOR_TOPICS_UPDATE_SUCCESSFULLY, [], res);
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

module.exports = {
    newAddSimulator,
    newAddSimulatorTopics,
    simulatorList,
    simulatorTopicList,
    simulatorDelete,
    simulatorDeleteTopics,
    simulatorUpdate,
    simulatorUpdateTopics,
    simulatorTopicListData,
    simulatorStatusUpdate
}