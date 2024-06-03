const express = require("express");
const { adminController, simulatorController} = require("../controller");
const router = express.Router();
// const { DashboardController } = require("../controller");

/*User Route*/
router.post('/new-user', adminController.newUser);
router.get('/user-list', adminController.userList);
router.delete('/delete-user', adminController.deleteUser);
router.put('/update-user', adminController.updateUser);
router.put('/update-password', adminController.updatePassword);

/*Simulator Route*/
router.post('/add-simulator', simulatorController.newAddSimulator);
router.post('/add-simulator-topics', simulatorController.newAddSimulatorTopics);
router.get('/simulator-list', simulatorController.simulatorList);
router.get('/simulator-topics-list', simulatorController.simulatorTopicList);
router.get('/simulator-topics-list-data', simulatorController.simulatorTopicListData);
router.delete('/simulator-delete', simulatorController.simulatorDelete);
router.delete('/simulator-topic-delete', simulatorController.simulatorDeleteTopics);
router.put('/simulator-status-update', simulatorController.simulatorStatusUpdate);
router.put('/simulator-update', simulatorController.simulatorUpdate);
router.put('/simulator-topics-update', simulatorController.simulatorUpdateTopics);

module.exports = router;