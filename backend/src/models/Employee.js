import mongoose from 'mongoose'

const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 60 },
  lastName: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120, unique: true },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  department: { type: String, required: true, trim: true, maxlength: 80 },
  position: { type: String, required: true, trim: true, maxlength: 100 },
  status: { type: String, enum: ['Active', 'On leave', 'Inactive'], default: 'Active' },
  employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern'], default: 'Full-time' },
  startDate: { type: Date, required: true },
}, { timestamps: true })

export default mongoose.model('Employee', employeeSchema)
