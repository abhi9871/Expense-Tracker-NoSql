const { Double } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(value) {
                return /^\S+@\S+\.\S+$/.test(value); // Email validation using a regular expression
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                return value.length >= 8 || value.length <= 15; // Password length validation
            },
            message: 'Password must be at least 8 characters long'
        }
    },
    totalExpenses: {
        type: Number,
        default: 0
    },
    isPremiumUser: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);