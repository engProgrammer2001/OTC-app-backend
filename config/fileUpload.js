import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage configuration
const storage = (uploadPath) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueSuffix);
        },
    });

// Create multer upload middleware
const upload = (uploadPath) => multer({ storage: storage(uploadPath) });

// File upload middleware factory
const fileUpload = (uploadPath) => {
    const uploadMiddleware = upload(uploadPath);

    return {
        fields: (fields) => (req, res, next) => {
            uploadMiddleware.fields(fields)(req, res, (err) => {
                if (err) {
                    console.log("Error:", err);
                    return next(err);
                }
                console.log("Uploaded files:", req.files); // Log uploaded files to check field names
                next();
            });
        },
        any: () => (req, res, next) => {
            uploadMiddleware.any()(req, res, (err) => {
                if (err) {
                    console.log("Error:", err);
                    return next(err);
                }
                console.log("Uploaded files:", req.files); // Log uploaded files to check field names
                next();
            });
        },
    };
};


export default fileUpload;
