const mongoose = require("mongoose");

const healthTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },
    publishDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("HealthTip", healthTipSchema);
