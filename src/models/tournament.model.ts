import * as mongoose from 'mongoose'

const tournamentSchema = new mongoose.Schema({
    date: {
        type: Object,
        required: true
    },
    title: {
        type: String,
        required: true,
        default: "TheTypingMatch Tournament"
    },
    currentRound: {
        type: Number,
        required: false,
        default: 0
    },
    participants: {
        type: Number,
        required: false,
        default: 0
    },
    leaderboard: {
        type: Array,
        required: false,
        default: []
    },
    isOpen: {
        type: Boolean,
        required: false,
        default: true
    }
})

const Tournament = mongoose.model('Tournament', tournamentSchema)

export { Tournament }
