import UploadFiles from "../config/fileUpload.js"

const UserData = UploadFiles("public/user/images");
const multipleUserDataUpload = UserData.fields([{ name: "profile_pic" }])
const galleryImageUpload = UserData.fields([{ name: "image" }])

const planData = UploadFiles("public/plans/images");
const multiplePlanDataUpload = planData.fields([
    { name: "featured_image" },
    { name: "gallery_image" },
])




export { multipleUserDataUpload, multiplePlanDataUpload, galleryImageUpload }