import mongoose, { Schema } from 'mongoose';


const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
    },

    available: {
        type: Boolean,
        default: false,
    },
    codigo: {
        type: String || Number,
    },
    price: {
        type: Number,
        default: 0
    },
    title: {
        type: String
    },
    description: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    img: {
        type: [String]
    },
});

productSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    }
})

export const ProductModel = mongoose.model('Product', productSchema)