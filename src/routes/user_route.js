import express from "express";
import { userController } from "../controllers/index.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.post('/sign-in', userController.signIn);

router.get('/simulator-topic-list', verify, userController.simulatorTopicsList);
router.get('/simulator-topic-data', verify, userController.simulatorTopicsData);
router.get('/simulators-with-data', verify, userController.simulatorsWithData);
router.post('/simulator-topic-sub-data', verify, userController.simulatorTopicsSubData);
router.delete('/simulator-reset', verify, userController.simulatorTopicsReset);

router.get('/performance-result', verify, userController.performanceResult);
router.put('/performance-result', verify, userController.performanceResultUpdate);

router.get('/work-sheet', verify, userController.worksheet);
router.put('/work-sheet', verify, userController.worksheetUpdate);

export default router;