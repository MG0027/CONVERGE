import mongoose from 'mongoose';

const communicationLogSchema = new mongoose.Schema({
  title: String,
  segment: Object,
  count: Number,
  createdAt: Date, 
  deliveries: [
    {
      customerId: mongoose.Schema.Types.ObjectId,
      status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
      message: String, 
    }
  ]
});

export default mongoose.model('CommunicationLog', communicationLogSchema);
