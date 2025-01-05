import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const QrController = mongoose.Schema(
    {
        id: Number,
        image: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: {},
        toJSON: { getters: true },
        toObject: { getters: true },
    }
)


QrController.pre("save", async function (next) {
    if (!this.id) {
        this.id = await getNextSequenceValue("Order");
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

const Qr = mongoose.model("Qr", QrController)

export default Qr;