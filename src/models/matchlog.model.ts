import * as mongoose from 'mongoose'

const matchlogSchema = new mongoose.Schema({
    date: {
        type: Object,
        required: true
    },
    winnerId: {
        type: Number,
        required: true
    },
    winnerWpm: {
        type: Number,
        required: true
    },
    winnerScore: {
        type: Number,
        required: true
    },
    loserId: {
        type: Number,
        required: true
    },
    loserWpm: {
        type: Number,
        required: true
    },
    loserScore: {
        type: Number,
        required: true
    }
})

const MatchLog = mongoose.model('MatchLog', matchlogSchema)

export { MatchLog }
