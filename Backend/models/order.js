const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Order', orderSchema);

// const { Sequelize } = require('sequelize');
// const sequelize = require('../utils/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true
//     },
//     orderId: Sequelize.STRING,
//     paymentId: Sequelize.STRING,
//     status: {
//         type: Sequelize.ENUM('pending', 'successful', 'failed'),
//         defaultValue: 'pending'
//     }
// })

// module.exports = Order;