import express from 'express'
import mongoose from 'mongoose'
import Employee from '../models/Employee.js'

const router = express.Router()
const editableFields = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'department',
  'position',
  'status',
  'employmentType',
  'startDate',
]
const statuses = ['Active', 'On leave', 'Inactive']

function employeeInput(body) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  return Object.fromEntries(editableFields
    .filter((field) => Object.hasOwn(source, field))
    .map((field) => [field, source[field]]))
}

function validateInput(input, partial = false) {
  const requiredFields = ['firstName', 'lastName', 'email', 'department', 'position', 'startDate']
  if (!partial) {
    const missing = requiredFields.filter((field) => !String(input[field] ?? '').trim())
    if (missing.length) {
      const error = new Error(`Required fields: ${missing.join(', ')}`)
      error.status = 400
      throw error
    }
  }

  if (input.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(input.email))) {
    const error = new Error('Enter a valid email address')
    error.status = 400
    throw error
  }
  if (input.status !== undefined && !statuses.includes(input.status)) {
    const error = new Error('Status must be Active, On leave, or Inactive')
    error.status = 400
    throw error
  }
  if (input.employmentType !== undefined && !['Full-time', 'Part-time', 'Contract', 'Intern'].includes(input.employmentType)) {
    const error = new Error('Employment type must be Full-time, Part-time, Contract, or Intern')
    error.status = 400
    throw error
  }
}

function checkId(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('Invalid employee ID')
    error.status = 400
    throw error
  }
}

router.get('/', async (req, res) => {
  const filter = {}
  if (req.query.status && req.query.status !== 'All status') {
    if (!statuses.includes(req.query.status)) {
      return res.status(400).json({ error: 'Invalid status filter' })
    }
    filter.status = req.query.status
  }

  const search = String(req.query.q || '').trim()
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matcher = new RegExp(escaped, 'i')
    filter.$or = ['firstName', 'lastName', 'email', 'department', 'position'].map((field) => ({ [field]: matcher }))
  }

  const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean()
  res.json({ employees })
})

router.get('/:id', async (req, res) => {
  checkId(req.params.id)
  const employee = await Employee.findById(req.params.id).lean()
  if (!employee) return res.status(404).json({ error: 'Employee not found' })
  res.json({ employee })
})

router.post('/', async (req, res) => {
  const input = employeeInput(req.body)
  validateInput(input)
  const employee = await Employee.create(input)
  res.status(201).json({ employee })
})

router.put('/:id', async (req, res) => {
  checkId(req.params.id)
  const input = employeeInput(req.body)
  validateInput(input, true)
  if (!Object.keys(input).length) {
    return res.status(400).json({ error: 'Provide at least one employee field to update' })
  }

  const employee = await Employee.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true,
  })
  if (!employee) return res.status(404).json({ error: 'Employee not found' })
  res.json({ employee })
})

router.delete('/:id', async (req, res) => {
  checkId(req.params.id)
  const employee = await Employee.findByIdAndDelete(req.params.id)
  if (!employee) return res.status(404).json({ error: 'Employee not found' })
  res.json({ message: 'Employee deleted successfully' })
})

export default router
