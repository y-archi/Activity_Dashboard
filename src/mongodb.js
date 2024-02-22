const mongoose = require("mongoose")

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
        }
    ]
}, {
    timestamps: true
});

module.exports  = new mongoose.model("User", LogInSchema)
