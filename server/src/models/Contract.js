import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['sec-filing', 'internal-memo', 'legal-contract'],
      required: true 
    },
    content: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['public', 'confidential', 'restricted'],
      default: 'confidential'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    contractedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    classification: String,
    aiAnalysis: String
  },
  { timestamps: true }
);

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
