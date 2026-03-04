'use strict';
import common from 'common-utils';
import config from '../config/config.js';
import { handleSuccess, handleError } from '../helper/response_handler.js';
import bcrypt from 'bcryptjs';
import ogs from 'open-graph-scraper';
import fs from 'fs';
import { sequelize } from '../config/database.js';
import db_functions from '../helper/db_functions.js';

// Import models
import {
    Simulator,
    SimulatorData,
    SimulatorUserData
} from '../models/index.js';

const newAddSimulator = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            // Use Sequelize to create new simulator
            let insert_simulator_data = await Simulator.create({
                title: reqData.query, // Mapping query to title
                description: reqData.result,
                status: 1,
                // Add other fields as needed based on your table structure
                locale: reqData.locale,
                location: reqData.user_location,
                longtitude: reqData.longtitude,
                latitude: reqData.latitude,
                result_show: reqData.result_show
            });
            
            if (insert_simulator_data) {
                let data = {
                    id: insert_simulator_data.id
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
            
            if (simulator_type !== '') {
                if (config.simulator_type_with_meta.includes(parseInt(simulator_type))) {
                    metadata_link = await ogs({ url: reqData.link }).then(({ error, result } = data) => {
                        return { error: error, result: result }
                    });
                }
                
                if (simulator_type == 4) {
                    if (common.isRealValue(reqData.more_videos)) {
                        let more_videos = reqData.more_videos;
                        if (more_videos.length > 0) {
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta = await ogs({ url: item }).then(({ error, result } = data) => {
                                    return { error: error, result: result }
                                });
                                return { link: item, video_meta: more_videos_meta?.result };
                            }))
                        }
                    }
                }
                
                if (simulator_type == 5) {
                    image_link = await db_functions.storeImage(reqData.scrb_link.match(/^data:([A-Za-z-+/]+);base64,(.+)$/), res, 'src/assets/simulator_img/');
                }
            }
            
            let metaLink_result = JSON.stringify(metadata_link?.result);
            if (metaLink_result) {
                metaLink_result = metaLink_result.replace(/'/g, "");
            }
            
            if (!metadata_link.error) {
                let insertData = {
                    simulator_id: reqData?.simulator_id,
                    topic_name: reqData?.slider_name || 'Default Topic',
                    content: JSON.stringify({
                        simulator_type: reqData?.simulator_type,
                        location: reqData.location,
                        link: reqData?.link,
                        link_meta: metaLink_result,
                        slider_type: reqData?.slider_type,
                        slider_name: reqData?.slider_name,
                        slider_result_json: reqData?.slider_result_json,
                        final_result_show: reqData?.final_result_show,
                        final_result: reqData?.final_result
                    })
                };
                
                if (simulator_type == 5) {
                    let content = JSON.parse(insertData.content);
                    delete content.link;
                    delete content.link_meta;
                    content.scrb_link = image_link;
                    insertData.content = JSON.stringify(content);
                }
                
                if (simulator_type == 4) {
                    let content = JSON.parse(insertData.content);
                    delete content.link;
                    delete content.link_meta;
                    content.youtube_json = meta_video_link;
                    content.youtube_link_arr = reqData?.more_videos;
                    insertData.content = JSON.stringify(content);
                }
                
                if (simulator_type == 2) {
                    let content = JSON.parse(insertData.content);
                    content.question_type = reqData.question_type;
                    content.questions_json = reqData.questions;
                    insertData.content = JSON.stringify(content);
                }
                
                if (simulator_type == 3) {
                    let content = JSON.parse(insertData.content);
                    content.link_with_description = reqData.link_with_description;
                    insertData.content = JSON.stringify(content);
                }
                
                // Use Sequelize to create simulator topic
                let insert_simulator_topics = await SimulatorData.create(insertData);
                
                if (insert_simulator_topics) {
                    handleSuccess(statusCode.OK, en.DATA_ADD_SUCCESSFULLY, [], res);
                } else {
                    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
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

const simulatorList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        let limit = parseInt(reqData.limit) || 10;
        reqData.page = (Number(reqData?.page) > 0) ? reqData.page : 1;
        let offset = ((Number(reqData.page) - 1) * limit);
        
        // Use Sequelize to get simulator data with pagination
        let [simulator_data, total_data] = await Promise.all([
            Simulator.findAll({
                order: [['id', 'ASC']],
                limit: limit,
                offset: offset
            }),
            Simulator.count()
        ]);
        
        if (simulator_data.length > 0 && total_data) {
            let data = {
                user_data: simulator_data || [],
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

const simulatorTopicList = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.query;
    try {
        if (common.checkValues(reqData.simulator_id)) {
            let simulator_id = reqData.simulator_id;
            
            // Use Sequelize to get simulator topic data
            let simulator_topic_data = await SimulatorData.findAll({
                where: { simulator_id: simulator_id }
            });
            
            if (simulator_topic_data.length > 0) {
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, simulator_topic_data, res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        } else {
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
        if (common.checkValues(reqData.simulator_id)) {
            let simulator_id = reqData.simulator_id;
            
            // Use Sequelize to get single simulator topic data
            let simulator_topic_data = await SimulatorData.findOne({
                where: { id: simulator_id }
            });
            
            if (simulator_topic_data) {
                handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, simulator_topic_data, res);
            } else {
                handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
            }
        } else {
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
    
    // Use transaction for data consistency
    const transaction = await sequelize.transaction();
    
    try {
        if (common.checkValues(reqData.simulator_id)) {
            let simulator_id = reqData.simulator_id;
            
            // Delete simulator topics first (foreign key constraint)
            await SimulatorData.destroy({
                where: { simulator_id: simulator_id },
                transaction
            });
            
            // Delete simulator
            let delete_simulator = await Simulator.destroy({
                where: { id: simulator_id },
                transaction
            });
            
            if (delete_simulator > 0) {
                await transaction.commit();
                handleSuccess(statusCode.OK, en.SIMULATOR_DELETE_SUCCESSFULLY, [], res);
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

const simulatorDeleteTopics = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.checkValues(reqData.simulator_topic_id)) {
            let simulator_topic_id = reqData.simulator_topic_id;
            
            // Use Sequelize to delete simulator topic
            let delete_simulator_topics = await SimulatorData.destroy({
                where: { id: simulator_topic_id }
            });
            
            if (delete_simulator_topics > 0) {
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
            
            // Use Sequelize to update simulator
            let [updateCount] = await Simulator.update(
                {
                    title: reqData.query,
                    description: reqData.result,
                    // Add other fields based on your table structure
                    locale: reqData.locale,
                    location: reqData.user_location,
                    longtitude: reqData.longtitude,
                    latitude: reqData.latitude,
                    result_show: reqData.result_show,
                    updated_at: new Date()
                },
                {
                    where: { id: simulator_id }
                }
            );
            
            if (updateCount > 0) {
                handleSuccess(statusCode.OK, en.SIMULATOR_UPDATE_SUCCESSFULLY, [], res);
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

const simulatorStatusUpdate = async (req, res) => {
    let { status_code_config: statusCode, en_message_config: en } = config;
    let reqData = req.body;
    try {
        if (common.isRealValue(reqData)) {
            let simulator_id = reqData.id;
            
            // Use Sequelize to update simulator status
            let [updateCount] = await Simulator.update(
                { status: reqData.status },
                { where: { id: simulator_id } }
            );
            
            if (updateCount > 0) {
                handleSuccess(statusCode.OK, en.SIMULATOR_STATUS_UPDATE_SUCCESSFULLY, [], res);
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
            
            if (simulator_type !== '') {
                if (config.simulator_type_with_meta.includes(parseInt(simulator_type))) {
                    metadata_link = await ogs({ url: reqData.link }).then(({ error, result } = data) => {
                        return { error: error, result: result }
                    });
                }
                
                if (simulator_type == 4) {
                    if (common.isRealValue(reqData.more_videos)) {
                        let more_videos = reqData.more_videos;
                        if (more_videos.length > 0) {
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta = await ogs({ url: item }).then(({ error, result } = data) => {
                                    return { error: error, result: result }
                                });
                                return { link: item, video_meta: more_videos_meta?.result };
                            }))
                        }
                    }
                }
                
                if (simulator_type == 5) {
                    // Get existing simulator topic data
                    let simulator_topic_data = await SimulatorData.findOne({
                        where: { id: simulator_topic_id },
                        attributes: ['content']
                    });
                    
                    if (common.checkValues(reqData.scrb_link) && simulator_topic_data) {
                        let existingContent = JSON.parse(simulator_topic_data.content);
                        
                        if (existingContent.scrb_link != reqData.scrb_link) {
                            image_link = await db_functions.storeImage(reqData.scrb_link.match(/^data:([A-Za-z-+/]+);base64,(.+)$/), res, 'src/assets/simulator_img/');
                        } else {
                            let image_name = new Date().getTime() + '_' + db_functions.randomNumber(0, 10000);
                            image_link = image_name + '.' + existingContent.scrb_link.split('.')[1];
                            fs.rename('src/assets/simulator_img/' + existingContent.scrb_link, 'src/assets/simulator_img/' + image_link, (err) => {
                                if (err) { throw err; }
                            });
                        }
                    }
                }
            }
            
            let metaLink_result = (JSON.stringify(metadata_link?.result));
            if (metaLink_result) {
                metaLink_result = metaLink_result.replace(/'/g, "");
            }
            
            let update_content = {
                simulator_type: reqData?.simulator_type,
                location: reqData?.location,
                link: reqData?.link,
                link_meta: metaLink_result,
                slider_type: reqData?.slider_type,
                slider_name: reqData?.slider_name,
                slider_result_json: reqData?.slider_result_json,
                final_result_show: reqData?.final_result_show,
                final_result: reqData?.final_result
            };
            
            if (simulator_type == 5) {
                delete update_content.link;
                delete update_content.link_meta;
                update_content.scrb_link = image_link;
            }
            
            if (simulator_type == 4) {
                delete update_content.link;
                delete update_content.link_meta;
                update_content.youtube_json = meta_video_link;
                update_content.youtube_link_arr = reqData?.more_videos;
            }
            
            if (simulator_type == 2) {
                update_content.question_type = reqData.question_type;
                update_content.questions_json = reqData.questions;
            }
            
            if (simulator_type == 3) {
                update_content.link_with_description = reqData.link_with_description;
            }
            
            // Use Sequelize to update simulator topic
            let [updateCount] = await SimulatorData.update(
                {
                    topic_name: reqData?.slider_name || 'Updated Topic',
                    content: JSON.stringify(update_content),
                    updated_at: new Date()
                },
                {
                    where: {
                        id: simulator_topic_id,
                        simulator_id: reqData.simulator_id
                    }
                }
            );
            
            if (updateCount > 0) {
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

export default {
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
};