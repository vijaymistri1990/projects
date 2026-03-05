import express from "express";
import { adminController, simulatorController } from "../controllers/index.js";
import verify from "../middleware/verify.js";

const router = express.Router();

// PUBLIC route — no token required (only works when no admin exists yet)
router.post('/create-admin', adminController.createAdmin);

/*User Route*/
router.post('/new-user', verify, adminController.newUser);
router.get('/user-list', verify, adminController.userList);
router.delete('/delete-user', verify, adminController.deleteUser);
router.put('/update-user', verify, adminController.updateUser);
router.put('/update-password', verify, adminController.updatePassword);

/*Simulator Route*/
router.post('/add-simulator', verify, simulatorController.newAddSimulator);
router.post('/add-simulator-topics', verify, simulatorController.newAddSimulatorTopics);
router.get('/simulator-list', verify, simulatorController.simulatorList);
router.get('/simulator-topics-list', verify, simulatorController.simulatorTopicList);
router.get('/simulator-topics-list-data', verify, simulatorController.simulatorTopicListData);
router.delete('/simulator-delete', verify, simulatorController.simulatorDelete);
router.delete('/simulator-topic-delete', verify, simulatorController.simulatorDeleteTopics);
router.put('/simulator-status-update', verify, simulatorController.simulatorStatusUpdate);
router.put('/simulator-update', verify, simulatorController.simulatorUpdate);
router.put('/simulator-topics-update', verify, simulatorController.simulatorUpdateTopics);

export default router;