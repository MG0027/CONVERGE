import mongoose from "mongoose";

const customerSchema= new mongoose.Schema({
  name:{type: String},
  email:{type: String, unique: true},
  phone:{type: String},
  // age group
  gender:{type: String, enum:['male','female','other'], default:'other'},
  birthdate:{type: Date},
  city:{type: String},
  preferredChannel:{
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    default: 'email'
  },
  totalSpend:{ type: Number,default: 0},
  totalVisits:{type: Number,default:0},
  lastActive:{type: Date}

}, {timestamps: true});

export default mongoose.model('Customer', customerSchema);

