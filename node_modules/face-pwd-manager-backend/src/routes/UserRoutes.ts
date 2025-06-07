// src/routes/users.ts
import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { UserEmailSchema } from "../schemas/UserSchema";
import { ServiceError } from "../services/ServiceError";
import {
  authenticateWithFace,
  deleteUser,
  getAllUsers,
  getUserById,
  registerUserWithImage,
} from "../services/user.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await getAllUsers());
  })
);

// Get by id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await getUserById(+req.params.id));
  })
);

// Register → email + selfie (supporting both encrypted and unencrypted images)
router.post(
  "/register",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "encryptedImage", maxCount: 1 },
    { name: "originalImage", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Get the encrypted image file if provided
    const encryptedImageFile = files?.encryptedImage?.[0];
    const selfieFile = files?.selfie?.[0];

    // Use the encrypted image file if available, otherwise use the selfie file
    if (encryptedImageFile) {
      // Use the encrypted image file directly
      const virtualFile = {
        ...encryptedImageFile,
        fieldname: "encryptedImage", // Make sure the fieldname is set correctly
      } as Express.Multer.File;
      const user = await registerUserWithImage({ email }, virtualFile);
      res.status(201).json(user);
    } else if (selfieFile) {
      // Use the selfie file if no encrypted image
      const user = await registerUserWithImage({ email }, selfieFile);
      res.status(201).json(user);
    } else {
      // Neither encrypted image nor selfie file provided
      throw ServiceError.validationFailed(
        "No selfie provided for registration. Please capture a photo to create your account."
      );
    }
  })
);

// Login → email + selfie (supporting both encrypted and unencrypted images)
router.post(
  "/login",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "encryptedImage", maxCount: 1 },
    { name: "originalImage", maxCount: 1 },
  ]),
  asyncHandler(async (req, res) => {
    const { email } = UserEmailSchema.parse(req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Get the encrypted image file if provided
    const encryptedImageFile = files?.encryptedImage?.[0];
    const selfieFile = files?.selfie?.[0];

    // Use the encrypted image file if available, otherwise use the selfie file
    if (encryptedImageFile) {
      // Pass the encrypted image file directly to the service
      const virtualFile = {
        ...encryptedImageFile,
        fieldname: "encryptedImage", // Make sure the fieldname is set correctly
      } as Express.Multer.File;
      const result = await authenticateWithFace(email, virtualFile);
      res.json(result);
    } else if (selfieFile) {
      // Use the selfie file if no encrypted image
      const result = await authenticateWithFace(email, selfieFile);
      res.json(result);
    } else {
      // Neither encrypted image nor selfie file provided
      throw ServiceError.validationFailed(
        "No selfie provided for authentication. Please capture a photo to login."
      );
    }
  })
);

// Delete
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await deleteUser(+req.params.id));
  })
);

export default router;
