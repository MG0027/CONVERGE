import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
customerId: {type: mongoose.Schema.Types.ObjectId, ref:'Customer', required :true},
amount:{type: Number, required:true},
discountUsed:{type:String},
paymentMethod: {
  type: String,
  enum: ['card', 'upi', 'cod', 'wallet'],
  default: 'card'
},
items: [{
  name: String,
  quantity: Number,
  price: Number,
}],
channel: {
  type: String,
  enum: ['web', 'mobile', 'store'],
  default: 'web'
},
//paymentStatus
orderStatus: {
  type: String,
  enum: ['placed', 'delivered', 'cancelled'],
  default: 'placed'
},
shippingAddress: {
  line1: String,
  city: String,
  state: String,
  zip: String,
},
//delivery date
orderDate: { type: Date, default: Date.now }
}, { timestamps: true });


export default mongoose.model('Order', orderSchema);