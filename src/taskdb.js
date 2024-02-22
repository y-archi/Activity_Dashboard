const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});
 
module.exports = new mongoose.model("Task", taskSchema)
