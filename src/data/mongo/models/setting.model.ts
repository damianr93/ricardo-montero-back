import mongoose from 'mongoose';

// Singleton document holding site-wide configuration editable by the admin.
const settingSchema = new mongoose.Schema({
    minOrderAmount: {
        type: Number,
        default: 0,
        min: [0, 'minOrderAmount cannot be negative'],
    },
}, { timestamps: true });

settingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    }
});

export const SettingModel = mongoose.model('Setting', settingSchema);
