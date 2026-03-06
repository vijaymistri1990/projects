'use strict';
import common from 'common-utils';
import config from '../config/config.js';
import { handleSuccess, handleError } from '../helper/response_handler.js';
import ogs from 'open-graph-scraper';
import fs from 'fs';
import { sequelize } from '../config/database.js';
import db_functions from '../helper/db_functions.js';

// Import models
import {
    Simulator,
    SimulatorData
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
            let metadata_link = { error: false, result: null };
            let simulator_type = reqData.simulator_type;
            let meta_video_link = [];
            let image_link = '';
            
            if (simulator_type !== '') {
                if (config.simulator_type_with_meta.includes(parseInt(simulator_type))) {
                    try {
                        let ogsData = await ogs({ url: reqData.link });
                        metadata_link = { error: ogsData.error, result: ogsData.result };
                    } catch (e) {
                        metadata_link = { error: true, result: null };
                    }
                }
                
                if (simulator_type == 4) {
                    if (common.isRealValue(reqData.more_videos)) {
                        let more_videos = reqData.more_videos;
                        if (more_videos.length > 0) {
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta;
                                try {
                                    let ogsData = await ogs({ url: item });
                                    more_videos_meta = { error: ogsData.error, result: ogsData.result };
                                } catch (e) {
                                    more_videos_meta = { error: true, result: null };
                                }
                                return { link: item, video_meta: more_videos_meta?.result };
                            }))
                        }
                    }
                }
                
                if (simulator_type == 5) {
                    image_link = await db_functions.storeImage(reqData.scrb_link.match(/^data:([A-Za-z-+/]+);base64,(.+)$/), res, 'src/assets/simulator_img/');
                }
            }
            
            let metaLink_result = metadata_link?.result || null;
            
            // Check for metadata error only if we tried to fetch it
            if (simulator_type !== '' && config.simulator_type_with_meta.includes(parseInt(simulator_type)) && metadata_link.error) {
                console.log("Warning: Failed to fetch metadata for the link, proceeding without metadata.");
            }
            
            // Build insertData with individual fields (matching the model structure)
            let insertData = {
                simulator_id: reqData?.simulator_id,
                topic_name: reqData?.slider_name || 'Default Topic',
                simulator_type: reqData?.simulator_type,
                location: reqData?.location,
                slider_type: reqData?.slider_type,
                slider_name: reqData?.slider_name,
                slider_result_json: reqData?.slider_result_json,
                final_result_show: reqData?.final_result_show,
                final_result: reqData?.final_result
            };
            
            // Handle different simulator types
            if (simulator_type == 5) {
                insertData.scrb_link = image_link;
            } else if (simulator_type == 4) {
                insertData.youtube_json = meta_video_link;
                insertData.youtube_link_arr = reqData?.more_videos;
            } else if (simulator_type == 2) {
                insertData.link = reqData?.link;
                insertData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
                insertData.question_type = reqData?.question_type;
                insertData.questions_json = reqData?.questions;
            } else if (simulator_type == 3) {
                insertData.link = reqData?.link;
                insertData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
                insertData.link_with_description = reqData?.link_with_description;
            } else {
                // For types 0, 1 and others with metadata
                insertData.link = reqData?.link;
                insertData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
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
            let metadata_link = { error: false, result: null };
            let simulator_type = reqData.simulator_type;
            let meta_video_link = [];
            let image_link = '';
            
            if (simulator_type !== '') {
                if (config.simulator_type_with_meta.includes(parseInt(simulator_type))) {
                    try {
                        let ogsData = await ogs({ url: reqData.link });
                        metadata_link = { error: ogsData.error, result: ogsData.result };
                    } catch (e) {
                        metadata_link = { error: true, result: null };
                    }
                }
                
                if (simulator_type == 4) {
                    if (common.isRealValue(reqData.more_videos)) {
                        let more_videos = reqData.more_videos;
                        if (more_videos.length > 0) {
                            meta_video_link = await Promise.all(more_videos.map(async (item) => {
                                let more_videos_meta;
                                try {
                                    let ogsData = await ogs({ url: item });
                                    more_videos_meta = { error: ogsData.error, result: ogsData.result };
                                } catch (e) {
                                    more_videos_meta = { error: true, result: null };
                                }
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
            
            let metaLink_result = metadata_link?.result || null;
            
            // Build updateData with individual fields (matching the model structure)
            let updateData = {
                topic_name: reqData?.slider_name || 'Updated Topic',
                simulator_type: reqData?.simulator_type,
                location: reqData?.location,
                slider_type: reqData?.slider_type,
                slider_name: reqData?.slider_name,
                slider_result_json: reqData?.slider_result_json,
                final_result_show: reqData?.final_result_show,
                final_result: reqData?.final_result,
                updated_at: new Date()
            };
            
            // Handle different simulator types
            if (simulator_type == 5) {
                updateData.scrb_link = image_link;
                updateData.link = null;
                updateData.link_meta = null;
            } else if (simulator_type == 4) {
                updateData.youtube_json = meta_video_link;
                updateData.youtube_link_arr = reqData?.more_videos;
                updateData.link = null;
                updateData.link_meta = null;
            } else if (simulator_type == 2) {
                updateData.link = reqData?.link;
                updateData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
                updateData.question_type = reqData?.question_type;
                updateData.questions_json = reqData?.questions;
            } else if (simulator_type == 3) {
                updateData.link = reqData?.link;
                updateData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
                updateData.link_with_description = reqData?.link_with_description;
            } else {
                // For types 0, 1 and others with metadata
                updateData.link = reqData?.link;
                updateData.link_meta = metaLink_result ? JSON.stringify(metaLink_result).replace(/'/g, "") : null;
            }
            
            // Use Sequelize to update simulator topic
            let [updateCount] = await SimulatorData.update(
                updateData,
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