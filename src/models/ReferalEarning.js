import mongoose from "mongoose";
import SequenceModel from "./SequenceModel.js";


const ReferalEarningSchema = mongoose.Schema(
    {
        id: Number,
        user_id: {
            type: Number,
            ref: mongoose.Schema.Types.Number,
            required: true
        },
        earning: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


ReferalEarningSchema.pre("save", async function (next) {
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

const ReferalEarning = mongoose.model("ReferalEarning", ReferalEarningSchema)

export default ReferalEarning;