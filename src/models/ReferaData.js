import mongoose from "mongoose";
import SequenceModel from "./SequenceModel.js";


const ReferalSchema = mongoose.Schema(
    {
        id: Number,
        user_id: {
            type: Number,
            ref: mongoose.Schema.Types.Number,
            required: true
        },
        referal_id: {
            type: Number,
            default: null
        },
        order_id: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


ReferalSchema.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("User");
    }
})

async function getNextSequenceValue(modelName) {
    let sequence = await SequenceModel.findOneAndUpdate(
        { modelName: modelName },
        { $inc: { sequenceValue: 1 } },
        { upsert: true, new: true }
    );
    return sequence.sequenceValue;
}

const Referals = mongoose.model("Referals", ReferalSchema)

export default Referals;