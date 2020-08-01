import * as mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    date: {
        type: Object,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    typeRacerLink: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema)

export { User }
