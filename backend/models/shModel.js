import mongoose from 'mongoose';

const SHSchema = new mongoose.Schema(
    {
    maxWeight:  {type: Number},
    shipCharge: {type: Number },
    taxCharge:  {type: Number }
    }
);

const SHCharge = mongoose.model('SHCharge', SHSchema);
export default SHCharge;