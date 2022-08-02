const { Schema, model } = require("mongoose")

const Difficulty = new Schema({
    Overall: Number,
    Chordjack: Number,
    Handstream: Number,
    Jack: Number,
    Jumpstream: Number,
    Stamina: Number,
    Stream: Number,
    Technical: Number,
})

const schema = new Schema({
    Difficulties: [ Difficulty ],
    SongMD5Hash: String,
})

module.exports = model("Difficulty", schema, "Difficulties")
