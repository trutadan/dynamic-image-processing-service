import { Router } from "express";
import { getImage } from "../controllers/imageController";
import { validateImageRequest } from "../validators/imageValidator";

const router = Router();

router.get('/:filename', validateImageRequest, getImage);

export default router;