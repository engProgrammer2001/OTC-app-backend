import handleResponse from "../../config/http-response.js";
import Gallery from "../../src/models/GalleryModel.js";
import Qr from "../../src/models/QrContModel.js";

class GalleryController {
    // Add a new gallery image
    static AddGallery = async (req, resp) => {
        try {
            const user = req.users;
            const files = req.files;
            console.log("files", files);



            if (files && files.image && files.image.length > 0) {
                const file = files.image[0].path?.replace(/\\/g, "/");

                const newImage = new Gallery({
                    image: file,
                });

                await newImage.save();

                return handleResponse(201, "Gallery Image added successfully", {}, resp);
            } else {
                return handleResponse(400, "No images provided", {}, resp);
            }
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };

    static GetGallery = async (req, resp) => {
        try {
            const base_url = `${req.protocol}://${req.get("host")}`;
            const allGallery = await Gallery.find()
            if (allGallery.length < 1) {
                return handleResponse(200, "No gallery images found", {}, resp);
            }

            for (const key of allGallery) {
                if (key && key?.image) {
                    const isCompete = key?.image?.startsWith("http")
                    if (!isCompete) {
                        key.image = `${base_url}/${key?.image}`
                    }
                }
            }
            return handleResponse(200, "Gallery Fetched Successfully", allGallery, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //delete gallery
    static DeleteGallery = async (req, resp) => {
        try {
            const { id } = req.params;
            const galleryData = await Gallery.findOne({ id: id })

            if (!galleryData) {
                return handleResponse(404, "Gallery Image Not Found", {}, resp)
            }

            await Gallery.deleteOne({ id })
            return handleResponse(200, "Gallery Image deleted successfully", {}, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }





    // ---------------------------------------------


    static AddQr = async (req, resp) => {
        try {
            const user = req.users;
            const files = req.files;



            if (files && files.image && files.image.length > 0) {
                const file = files.image[0].path?.replace(/\\/g, "/");

                const newImage = new Qr({
                    image: file,
                });

                await newImage.save();

                return handleResponse(201, "Gallery Image added successfully", {}, resp);
            } else {
                return handleResponse(400, "No images provided", {}, resp);
            }
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    };

    static GetQr = async (req, resp) => {
        try {
            const base_url = `${req.protocol}://${req.get("host")}`;
            const allGallery = await Qr.find()
            if (allGallery.length < 1) {
                return handleResponse(200, "No gallery images found", {}, resp);
            }

            for (const key of allGallery) {
                if (key && key?.image) {
                    const isCompete = key?.image?.startsWith("http")
                    if (!isCompete) {
                        key.image = `${base_url}/${key?.image}`
                    }
                }
            }
            return handleResponse(200, "Gallery Fetched Successfully", allGallery, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //delete gallery
    static DeleteQr = async (req, resp) => {
        try {
            const { id } = req.params;
            const galleryData = await Qr.findOne({ id: id })

            if (!galleryData) {
                return handleResponse(404, "Gallery Image Not Found", {}, resp)
            }

            await Qr.deleteOne({ id })
            return handleResponse(200, "Gallery Image deleted successfully", {}, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

}

export default GalleryController;
