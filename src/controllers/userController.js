"use strict";
import common from "common-utils";
import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { handleSuccess, handleError } from "../helper/response_handler.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db_functions from "../helper/db_functions.js";

// Import models
import {
  User,
  Simulator,
  SimulatorData,
  SimulatorUserData,
  PerformanceSheet,
  WorkSheet,
} from "../models/index.js";

const signIn = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  let reqData = req.body;
  try {
    if (common.isRealValue(reqData)) {
      let user_name = reqData.user_name;
      let password = reqData.password;

      // Use Sequelize to find user
      let user_detail = await User.findOne({
        where: { username: user_name },
      });

      if (user_detail) {
        // Encrypt password for comparison (keeping existing logic)
        password = db_functions.getEncryptDecryptData("encrypt", password);

        if (user_detail.password == password) {
          let data = {
            user_name: user_detail.username,
            name: user_detail.name,
            id: user_detail.id,
            user: user_detail.type === "1" ? 1 : 0,
          };
          jwt.sign(
            data,
            config.secret,
            { expiresIn: 1440 * 60 },
            (err, security_token) => {
              if (err) {
                throw err;
              } else {
                res.setHeader(
                  "security_token",
                  Buffer.from(security_token).toString("base64")
                );
                let return_data = {
                  user_data: data,
                  token: Buffer.from(security_token).toString("base64"),
                };
                handleSuccess(
                  statusCode.OK,
                  en.LOGIN_SUCESSFULLY,
                  return_data,
                  res
                );
              }
            }
          );
        } else {
          handleError(statusCode.OK, en.WRONG_PASSWORD, res);
        }
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const simulatorTopicsList = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  let reqData = req.query;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name) &&
      common.isRealValue(reqData)
    ) {
      let limit = parseInt(reqData.limit) || 10;
      let language = reqData.language;
      reqData.page = Number(reqData?.page) > 0 ? reqData.page : 1;
      let offset = (Number(reqData.page) - 1) * limit;

      let where = {
        status: "1",
        locale: language,
      };

      let type = "0";
      if (language == "English(in)") {
        type = "1";
      }

      // Use Sequelize to get user subscription data
      let user_sub_data = await SimulatorUserData.findAll({
        where: {
          user_id: res.locals.user_id,
          type: type,
        },
      });

      // Get simulator data with pagination
      let [simulator_data, total_data] = await Promise.all([
        Simulator.findAll({
          where: where,
          order: [["id", "ASC"]],
          limit: limit,
          offset: offset,
        }),
        Simulator.count({ where: where }),
      ]);

      if (simulator_data.length > 0 && total_data) {
        let start_simulator_id = simulator_data[0]?.id;

        if (user_sub_data.length > 0) {
          let user_sub_id = user_sub_data.map((item) => item.simulator_id);
          let nextSimulator = await Simulator.findOne({
            where: {
              id: { [Op.notIn]: user_sub_id },
              locale: language,
            },
            order: [["id", "ASC"]],
          });
          start_simulator_id = nextSimulator?.id;
        }

        let data = {
          user_data: simulator_data || [],
          total_data: total_data,
          user_sub_data: user_sub_data || [],
          start_simulator_id: start_simulator_id,
        };
        handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const simulatorTopicsData = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  let reqData = req.query;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name) &&
      common.isRealValue(reqData)
    ) {
      let user_id = res.locals.user_id;
      let simulator_id = reqData?.simulator_id;

      // Use Sequelize to get simulator data
      let simulator_data = await Simulator.findOne({
        where: { id: simulator_id },
      });

      // Get all simulator IDs
      let simulator_ids = await Simulator.findAll({
        where: { status: "1" },
        attributes: ["id"],
      });

      let simulator_id_data = simulator_ids.map((item) => item.id);

      // Get simulator topics data
      let simulator_topics_data = await SimulatorData.findAll({
        where: { simulator_id: simulator_id },
      });

      // Get user subscription data
      let user_sub_data = await SimulatorUserData.findAll({
        where: {
          simulator_id: simulator_id,
          user_id: user_id,
        },
      });

      if (simulator_topics_data.length > 0 && simulator_data) {
        let data = {
          simulator_topics_data: simulator_topics_data,
          simulator_data: simulator_data,
          user_sub_data: user_sub_data || [],
          length: simulator_topics_data.length,
          simulator_id_data: simulator_id_data,
        };
        handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, data, res);
      } else {
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const simulatorTopicsSubData = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  let reqData = req.body;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name) &&
      common.isRealValue(reqData)
    ) {
      let user_id = res.locals.user_id;

      // Use Sequelize to create new record
      let insert_simulatior_user_data = await SimulatorUserData.create({
        simulator_id: reqData?.simulator_id,
        user_id: user_id,
        simulator_result: reqData?.simulator_result,
        simulator_comment: reqData?.simulator_comment,
        type: reqData?.type,
        sxs_outcome: reqData?.sxs_outcome,
        nm_outcome: reqData?.nm_outcome,
        data: reqData?.simulator_topic_result, // Using JSONB field
      });

      if (insert_simulatior_user_data) {
        handleSuccess(statusCode.OK, en.DATA_ADD_SUCCESSFULLY, [], res);
      } else {
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const simulatorTopicsReset = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  let reqData = req.body;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name)
    ) {
      let type = reqData.type;
      let user_id = res.locals.user_id;

      // Use Sequelize to delete records
      let delete_user_sub_data = await SimulatorUserData.destroy({
        where: {
          user_id: user_id,
          type: type,
        },
      });

      if (delete_user_sub_data > 0) {
        handleSuccess(statusCode.OK, en.DATA_FETCH_SUCCESSFULLY, [], res);
      } else {
        handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const performanceResult = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name)
    ) {
      let user_id = res.locals.user_id;

      // Use Sequelize to get performance data
      let perfomance_result_data = await PerformanceSheet.findAll({
        where: { user_id: user_id },
        attributes: ["id", "user_id", "score", "performance_data"],
      });

      if (perfomance_result_data.length > 0) {
        handleSuccess(
          statusCode.OK,
          en.DATA_RESET_SUCCESSFULLY,
          perfomance_result_data,
          res
        );
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const performanceResultUpdate = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  try {
    let reqData = req.body;
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(reqData.id) &&
      common.checkValues(reqData.result)
    ) {
      let user_id = res.locals.user_id;

      // Use Sequelize to update performance data
      let [updateCount] = await PerformanceSheet.update(
        {
          performance_data: reqData.result,
          updated_at: new Date(),
        },
        {
          where: {
            user_id: user_id,
            id: reqData.id,
          },
        }
      );

      if (updateCount > 0) {
        handleSuccess(statusCode.OK, en.DATA_UPDATE_SUCCESSFULLY, [], res);
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const worksheet = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  try {
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(res.locals.user_name)
    ) {
      let user_id = res.locals.user_id;

      // Use Sequelize to get worksheet data
      let work_result_data = await WorkSheet.findAll({
        where: { user_id: user_id },
        attributes: ["id", "user_id", "worksheet_data"],
      });

      if (work_result_data.length > 0) {
        handleSuccess(
          statusCode.OK,
          en.DATA_FETCH_SUCCESSFULLY,
          work_result_data,
          res
        );
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

const worksheetUpdate = async (req, res) => {
  let { status_code_config: statusCode, en_message_config: en } = config;
  try {
    let reqData = req.body;
    if (
      common.checkValues(res.locals.user_id) &&
      common.checkValues(reqData.id) &&
      common.checkValues(reqData.result)
    ) {
      let user_id = res.locals.user_id;

      // Use Sequelize to update worksheet data
      let [updateCount] = await WorkSheet.update(
        {
          worksheet_data: reqData.result,
          updated_at: new Date(),
        },
        {
          where: {
            user_id: user_id,
            id: reqData.id,
          },
        }
      );

      if (updateCount > 0) {
        handleSuccess(statusCode.OK, en.DATA_UPDATE_SUCCESSFULLY, [], res);
      } else {
        handleError(statusCode.OK, en.ERROR_NO_DATA_FOUND, res);
      }
    } else {
      handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
    }
  } catch (error) {
    console.log("error==============catch==============>", error);
    handleError(statusCode.BAD_REQUEST, en.ERROR_SOMETHING_WRONG, res);
  }
};

export default {
  signIn,
  simulatorTopicsList,
  simulatorTopicsData,
  simulatorTopicsSubData,
  simulatorTopicsReset,
  performanceResultUpdate,
  performanceResult,
  worksheet,
  worksheetUpdate,
};
