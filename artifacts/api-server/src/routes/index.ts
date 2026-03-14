import { Router, type IRouter } from "express";
import healthRouter from "./health";
import searchRouter from "./search";
import savedRouter from "./saved";

const router: IRouter = Router();

router.use(healthRouter);
router.use(searchRouter);
router.use(savedRouter);

export default router;
