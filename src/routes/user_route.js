import express from "express";
import { userController } from "../controllers/index.js";
import verify from "../middleware/verify.js";

const router = express.Router();

router.post('/sign-in', userController.signIn);

router.use('/',verify);

router.get('/simulator-topic-list', userController.simulatorTopicsList);
router.get('/simulator-topic-data', userController.simulatorTopicsData);
router.post('/simulator-topic-sub-data', userController.simulatorTopicsSubData);
router.delete('/simulator-reset', userController.simulatorTopicsReset);

router.get('/performance-result',userController.performanceResult);
router.put('/performance-result',userController.performanceResultUpdate);

router.get('/work-sheet',userController.worksheet);
router.put('/work-sheet',userController.worksheetUpdate);

export default router;