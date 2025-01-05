import mongoose from "mongoose"
import SequenceModel from "./SequenceModel.js"


const GallerySchema = mongoose.Schema(
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


GallerySchema.pre("save", async function (next) {
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

const Gallery = mongoose.model("Gallery", GallerySchema)

export default Gallery;