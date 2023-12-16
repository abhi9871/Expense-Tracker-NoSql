const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Enable timestamps for the schema
forgotPasswordSchema.set('timestamps', true);

module.exports = mongoose.model('ForgotPasswordRequests', forgotPasswordSchema);
