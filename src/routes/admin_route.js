import express from "express";
import { adminController, simulatorController } from "../controllers/index.js";
import verify from "../middleware/verify.js";

const router = express.Router();

// PUBLIC route — no token required (only works when no admin exists yet)
router.post('/create-admin', adminController.createAdmin);

// Apply token verification to all admin routes below
router.use('/', verify);

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

export default router;