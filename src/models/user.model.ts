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
    },
    opponent: {
        type: Object,
        required: false
    },
    pastOpponents: {
        type: Array,
        required: false,
        default: []
    },
    avgWpm: {
        type: Number,
        required: false,
        default: 0
    },
    losses: {
        type: Number,
        required: false,
        default: 0
    },
    rounds: {
        type: Number,
        required: false,
        default: 0
    }
})

const User = mongoose.model('User', userSchema)

export { User }
