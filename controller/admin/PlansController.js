import Plans from "../../src/models/planModal.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/UserModel.js";



class PlanController {
    //create plan
    static CreatePlan = async (req, resp) => {
        try {
            const user = req.user;

            const planData = req.body;

            const files = req.files;

            const existingPlanData = await Plans.findOne({ name: planData?.name })
            if (existingPlanData) {
                return handleResponse(400, "Plan Data already exist", {}, resp)
            }

            const plan = new Plans({
                ...planData,
                created_by: user.id,
            })

            if (files && files.featured_image) {
                plan.featured_image = files.featured_image[0].path;
            }

            if (files && files.gallery_image) {
                plan.gallery_image = files.gallery_image.map(file => file.path);
            }

            await plan.save()
            return handleResponse(201, "Plan Created Successfully", {}, resp)

        } catch (err) {

            return handleResponse(500, err.message, {}, resp);
        }
    }

    //get all plan
    static GetAllPlans = async (req, resp) => {
        try {
            const user = req.user;
            const plans = await Plans.find({ deleted_at: null });

            if (plans && plans.length < 1) {
                return handleResponse(200, "No Plan Data Available", { plans }, resp)
            }
            const base_url = `${req.protocol}://${req.get("host")}`;

            for (const key of plans) {
                if (key && key.featured_image) {
                    key.featured_image = `${base_url}/${key.featured_image}`;
                }
                if (key && key.gallery_image) {
                    key.gallery_image = key?.gallery_image.map((image) => `${base_url}/${image}`);
                }
            }
            return handleResponse(200, "All Plan Data", plans, resp)
        } catch (err) {
            console.log("err", err);
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get plan by id
    static GetPlanById = async (req, resp) => {
        try {
            const { id } = req.params;
            const plan = await Plans.findOne({ id, deleted_at: null });

            if (!plan) {
                return handleResponse(404, "Plan Not Found", {}, resp);
            }

            const base_url = `${req.protocol}://${req.get("host")}`;
            if (plan && plan?.featured_image) {
                plan.featured_image = `${base_url}/${plan.featured_image}`;
            }
            if (plan && plan?.gallery_image) {
                plan.gallery_image = plan.gallery_image.map(image => `${base_url}/${image}`);
            }

            return handleResponse(200, "Plan Data", plan, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }

    //update plan
    static UpdatePlan = async (req, resp) => {
        try {
            const { id } = req.params;
            const planData = req.body;
            const files = req.files;

            // Fetch the plan from the database
            let plan = await Plans.findOne({ id, deleted_at: null });
            if (!plan) {
                return handleResponse(404, "Plan Not Found", {}, resp);
            }

            // Clone planData to avoid modifying the original input
            const updatedData = { ...planData };

            // Remove image fields from planData to avoid overwriting them
            delete updatedData.featured_image;
            delete updatedData.gallery_image;

            // Update non-image fields if they are provided and not empty
            Object.keys(updatedData).forEach((key) => {
                if (updatedData[key] !== undefined) {
                    plan[key] = updatedData[key] === "null" ? null : updatedData[key];
                }
            });

            if (files?.featured_image?.length) {
                plan.featured_image = files.featured_image[0].path;
            }

            if (files?.gallery_image?.length) {
                plan.gallery_image = files.gallery_image.map((file) => file.path);
            }

            await plan.save();

            return handleResponse(200, "Plan Updated Successfully", plan, resp);
        } catch (err) {
            console.log("err", err);
            return handleResponse(500, "An error occurred while updating the plan.", {}, resp);
        }
    };


    //delete plan
    static DeletePlan = async (req, resp) => {
        try {
            const { id } = req.params;
            const plan = await Plans.findOne({ id, deleted_at: null });

            if (!plan || plan.deleted_at) {
                return handleResponse(404, "Plan Not Found or Already Deleted", {}, resp);
            }

            plan.deleted_at = new Date();
            await plan.save();
            return handleResponse(200, "Plan Deleted Successfully", {}, resp);
        } catch (err) {
            return handleResponse(500, err.message, {}, resp);
        }
    }


}

export default PlanController
