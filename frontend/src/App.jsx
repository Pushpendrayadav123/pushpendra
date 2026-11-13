import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const emptyEmployee = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  status: 'Active',
  employmentType: 'Full-time',
  startDate: '',
}

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
  people: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  down: <path d="m7 10 5 5 5-5" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92z" />,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  arrow: <><path d="M5 12h14M12 5l7 7-7 7" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.64 9a7 7 0 0 1 11.55-2.6L20 12M4 12l2.81 5.6A7 7 0 0 0 18.36 15" /></>,
}

function Icon({ name, size = 20 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  )
}

function getInitials(employee) {
  return `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase()
}

function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

function Eyebrow({ children }) {
  return <p className="mb-2 text-[9px] font-bold tracking-[1.15px] text-[#9293a2]">{children}</p>
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'border-transparent bg-[#6859d9] text-white shadow-sm hover:bg-[#594bc6]',
    secondary: 'border-[#e6e5ec] bg-white text-[#565867] hover:bg-[#f8f7fb]',
    danger: 'border-[#e6e5ec] bg-white text-[#b5524d] hover:bg-[#fff8f7]',
  }
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 text-[11px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-70 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function IconButton({ label, children, className = '', ...props }) {
  return (
    <button
      aria-label={label}
      className={`grid size-8 shrink-0 place-items-center rounded-md text-[#848694] hover:bg-[#f4f2ff] hover:text-[#5e51c8] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

function RefreshButton({ loading, onClick }) {
  return (
    <button
      type="button"
      aria-label="Refresh employees"
      title="Refresh employees"
      disabled={loading}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-[#848694] hover:bg-[#f4f2ff] hover:text-[#5e51c8] disabled:cursor-wait disabled:opacity-50"
    >
      <Icon name="refresh" size={15} />
    </button>
  )
}

function Avatar({ children, className = '' }) {
  return (
    <div className={`grid size-[34px] shrink-0 place-items-center rounded-full bg-[#e7e2ff] text-[11px] font-bold text-[#624fc9] ${className}`}>
      {children}
    </div>
  )
}

function StatusBadge({ status }) {
  const colors = {
    Active: 'bg-[#eaf8f1] text-[#21946a]',
    'On leave': 'bg-[#fff6e8] text-[#bd7d26]',
    Inactive: 'bg-[#f0f0f3] text-[#777987]',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium ${colors[status] || colors.Inactive}`}>
      <i className="size-[5px] rounded-full bg-current" />
      {status}
    </span>
  )
}

function StatCard({ title, value, caption, icon, tone }) {
  const tones = {
    purple: 'bg-[#f0edff] text-[#6c5bd7]',
    green: 'bg-[#e9f8f1] text-[#23986e]',
    orange: 'bg-[#fff4e8] text-[#db9955]',
  }
  return (
    <article className="min-h-[120px] rounded-lg border border-[#ececf2] bg-white p-4 sm:p-[18px] min-[1500px]:min-h-[132px]">
      <div className="flex items-center justify-between gap-1 text-[10px] font-medium text-[#777987] sm:text-[11px]">
        <span>{title}</span>
        <span className={`grid size-[26px] shrink-0 place-items-center rounded-md sm:size-[30px] ${tones[tone]}`}>
          {icon === 'live' ? <span className="size-[7px] rounded-full bg-[#30b982] shadow-[0_0_0_3px_#30b98220]" /> : <Icon name={icon} size={19} />}
        </span>
      </div>
      <strong className="mt-1 block text-[22px] font-bold leading-tight tracking-tight text-[#252739] sm:text-[25px]">{value}</strong>
      <p className="mt-1 text-[9px] text-[#9a9ba7] sm:text-[10px]">{caption}</p>
    </article>
  )
}

function EmployeeForm({ employee, onClose, onSave }) {
  const [values, setValues] = useState(employee || emptyEmployee)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function update(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await onSave(values)
    } catch (saveError) {
      setError(saveError.message)
      setSaving(false)
    }
  }

  const inputClasses = 'h-9 w-full rounded-md border border-[#e7e6ed] bg-white px-2.5 text-[11px] font-normal text-[#353647] outline-none placeholder:text-[#b0b1bc] focus:border-[#8b7ee8] focus:ring-2 focus:ring-[#7668db14]'
  const labelClasses = 'grid gap-1.5 text-[10px] font-semibold text-[#555766]'

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-[#20203370] p-5 backdrop-blur-sm max-[540px]:items-end max-[540px]:p-0" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-[520px] rounded-[11px] border border-[#ecebf2] bg-white p-6 shadow-2xl max-[540px]:max-h-[92vh] max-[540px]:overflow-y-auto max-[540px]:rounded-b-none max-[540px]:px-[17px] max-[540px]:py-5" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
        <div className="mb-5 flex justify-between">
          <div>
            <Eyebrow>{employee ? 'EMPLOYEE RECORD' : 'NEW TEAM MEMBER'}</Eyebrow>
            <h2 id="employee-form-title" className="text-[19px] font-semibold tracking-tight text-[#242638]">{employee ? 'Edit employee' : 'Add employee'}</h2>
            <p className="mt-1.5 text-[11px] text-[#898b98]">Fill in the details below to {employee ? 'update this' : 'create a new'} employee record.</p>
          </div>
          <IconButton label="Close dialog" className="-mr-1 -mt-1" onClick={onClose}><Icon name="close" /></IconButton>
        </div>
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 max-[540px]:gap-x-2">
            <label className={labelClasses}>First name<input className={inputClasses} name="firstName" value={values.firstName} onChange={update} placeholder="e.g. Olivia" required maxLength="60" /></label>
            <label className={labelClasses}>Last name<input className={inputClasses} name="lastName" value={values.lastName} onChange={update} placeholder="e.g. Rhye" required maxLength="60" /></label>
            <label className={`${labelClasses} col-span-2`}>Work email<input className={inputClasses} type="email" name="email" value={values.email} onChange={update} placeholder="name@company.com" required maxLength="120" /></label>
            <label className={labelClasses}>Phone number<input className={inputClasses} type="tel" name="phone" value={values.phone} onChange={update} placeholder="+1 (555) 000-0000" maxLength="30" /></label>
            <label className={labelClasses}>Department<input className={inputClasses} name="department" value={values.department} onChange={update} placeholder="e.g. Design" required maxLength="80" /></label>
            <label className={`${labelClasses} col-span-2`}>Job title<input className={inputClasses} name="position" value={values.position} onChange={update} placeholder="e.g. Product Designer" required maxLength="100" /></label>
            <label className={labelClasses}>Status<select className={inputClasses} name="status" value={values.status} onChange={update}><option>Active</option><option>On leave</option><option>Inactive</option></select></label>
            <label className={labelClasses}>Employment type<select className={inputClasses} name="employmentType" value={values.employmentType} onChange={update}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option></select></label>
            <label className={`${labelClasses} col-span-2`}>Start date<input className={inputClasses} type="date" name="startDate" value={values.startDate ? values.startDate.slice(0, 10) : ''} onChange={update} required /></label>
          </div>
          {error && <p className="mt-3 text-[10px] text-[#b1443f]" role="alert">{error}</p>}
          <div className="mt-5 flex justify-end gap-2 border-t border-[#f0eff4] pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : employee ? 'Save changes' : 'Add employee'}</Button>
          </div>
        </form>
      </section>
    </div>
  )
}

function EmployeeDetails({ employee, onClose, onEdit, onDelete }) {
  const details = [
    { label: 'Work email', value: employee.email, icon: 'mail' },
    { label: 'Phone', value: employee.phone || 'Not provided', icon: 'phone' },
    { label: 'Employment', value: employee.employmentType, icon: 'briefcase' },
    { label: 'Start date', value: formatDate(employee.startDate), icon: 'calendar' },
  ]

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto bg-[#20203370] p-5 backdrop-blur-sm max-[540px]:items-end max-[540px]:p-0" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-[420px] overflow-hidden rounded-[11px] border border-[#ecebf2] bg-white shadow-2xl max-[540px]:max-h-[90vh] max-[540px]:rounded-b-none" role="dialog" aria-modal="true" aria-labelledby="employee-detail-title">
        <div className="relative flex flex-col items-center border-b border-[#f0eff4] bg-gradient-to-b from-[#f8f7ff] to-white px-5 pb-6 pt-[30px]">
          <IconButton label="Close details" className="absolute right-3 top-3" onClick={onClose}><Icon name="close" /></IconButton>
          <div className="mb-3 grid size-[62px] place-items-center rounded-full border-[3px] border-white bg-[#e9e4ff] text-lg font-bold text-[#6451cb] shadow-sm">{getInitials(employee)}</div>
          <h2 id="employee-detail-title" className="text-[17px] font-semibold text-[#292b3c]">{employee.firstName} {employee.lastName}</h2>
          <p className="mb-2 mt-1 text-[10px] text-[#888a98]">{employee.position} · {employee.department}</p>
          <StatusBadge status={employee.status} />
        </div>
        <div className="px-[22px] py-5">
          <Eyebrow>EMPLOYEE INFORMATION</Eyebrow>
          <div>
            {details.map(({ label, value, icon }) => (
              <div key={label} className="flex min-h-[42px] items-center justify-between gap-2 border-b border-[#f1f0f5]">
                <span className="inline-flex items-center gap-2 text-[10px] text-[#898b98]"><Icon name={icon} size={17} />{label}</span>
                <strong className="truncate text-[10px] font-medium text-[#444657]">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between">
            <Button variant="danger" onClick={() => onDelete(employee)}>Delete</Button>
            <Button onClick={() => onEdit(employee)}>Edit employee</Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function EmployeeRow({ employee, onSelect }) {
  return (
    <tr onClick={() => onSelect(employee)} className="cursor-pointer transition-colors hover:bg-[#fbfaff] max-[540px]:relative max-[540px]:grid max-[540px]:min-h-[104px] max-[540px]:grid-cols-[1fr_auto] max-[540px]:gap-x-1 max-[540px]:gap-y-2 max-[540px]:border-b max-[540px]:border-[#f1f0f5] max-[540px]:px-3 max-[540px]:py-3">
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#5e6070] min-[1500px]:h-[69px] max-[540px]:col-span-2 max-[540px]:h-auto max-[540px]:border-0 max-[540px]:p-0">
        <div className="flex items-center gap-2.5 max-[540px]:gap-2">
          <div className="grid size-[33px] shrink-0 place-items-center rounded-full bg-[#ece8ff] text-[10px] font-bold text-[#6856c8]">{getInitials(employee)}</div>
          <div className="min-w-0">
            <strong className="block text-[10px] font-semibold text-[#303244]">{employee.firstName} {employee.lastName}</strong>
            <span className="mt-1 block text-[9px] text-[#999aa6]">{employee.email}</span>
          </div>
        </div>
      </td>
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#5e6070] min-[1500px]:h-[69px] max-[540px]:h-auto max-[540px]:border-0 max-[540px]:p-0">
        <strong className="block text-[10px] font-medium text-[#303244]">{employee.department}</strong>
        <span className="mt-1 block text-[9px] text-[#999aa6]">{employee.position}</span>
      </td>
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#5e6070] min-[1500px]:h-[69px] max-[540px]:row-start-2 max-[540px]:h-auto max-[540px]:self-center max-[540px]:border-0 max-[540px]:p-0">
        <StatusBadge status={employee.status} />
      </td>
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#707281] min-[1500px]:h-[69px] max-[540px]:h-auto max-[540px]:border-0 max-[540px]:p-0 max-[540px]:text-[9px] max-[540px]:text-[#888a98]"><span className="hidden max-[540px]:inline">Type: </span>{employee.employmentType}</td>
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#707281] min-[1500px]:h-[69px] max-[540px]:h-auto max-[540px]:border-0 max-[540px]:p-0 max-[540px]:text-[9px] max-[540px]:text-[#888a98]"><span className="hidden max-[540px]:inline">Started: </span>{formatDate(employee.startDate)}</td>
      <td className="h-[62px] border-b border-[#f1f0f5] px-3 py-2 text-[10px] text-[#5e6070] min-[1500px]:h-[69px] max-[540px]:absolute max-[540px]:right-2 max-[540px]:top-2 max-[540px]:h-auto max-[540px]:border-0 max-[540px]:p-0">
        <IconButton label={`View ${employee.firstName} ${employee.lastName}`} className="ml-auto" onClick={(event) => { event.stopPropagation(); onSelect(employee) }}><Icon name="dots" /></IconButton>
      </td>
    </tr>
  )
}

function App() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All status')
  const [formEmployee, setFormEmployee] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [notice, setNotice] = useState('')

  async function loadEmployees() {
    setLoading(true)
    setLoadError('')
    try {
      const data = await request('/employees')
      setEmployees(data.employees)
    } catch (error) {
      setLoadError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    let retryTimer
    let retryCount = 0
    const retryDelays = [1000, 2000, 4000, 8000, 10000, 10000]

    async function fetchEmployees() {
      try {
        const data = await request('/employees')
        if (!Array.isArray(data.employees)) throw new Error('The server returned an invalid employee list')
        if (!active) return
        setEmployees(data.employees)
        setLoadError('')
      } catch (error) {
        if (!active) return
        setLoadError(error.message)
        if (retryCount < retryDelays.length) {
          retryTimer = window.setTimeout(fetchEmployees, retryDelays[retryCount])
          retryCount += 1
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchEmployees()
    return () => {
      active = false
      window.clearTimeout(retryTimer)
    }
  }, [])

  const filteredEmployees = useMemo(() => employees.filter((employee) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [
      employee.firstName, employee.lastName, employee.email, employee.position, employee.department,
    ].some((value) => value?.toLowerCase().includes(query))
    return matchesSearch && (statusFilter === 'All status' || employee.status === statusFilter)
  }), [employees, search, statusFilter])

  const activeCount = employees.filter((employee) => employee.status === 'Active').length
  const departmentsCount = new Set(employees.map((employee) => employee.department)).size

  async function saveEmployee(values) {
    const isEditing = Boolean(formEmployee)
    const path = isEditing ? `/employees/${formEmployee._id}` : '/employees'
    const saved = await request(path, {
      method: isEditing ? 'PUT' : 'POST',
      body: JSON.stringify(values),
    })
    setEmployees((current) => isEditing
      ? current.map((employee) => employee._id === saved.employee._id ? saved.employee : employee)
      : [saved.employee, ...current])
    setFormOpen(false)
    setFormEmployee(null)
    setSelectedEmployee(null)
    setNotice(isEditing ? 'Employee updated successfully.' : 'Employee added successfully.')
    window.setTimeout(() => setNotice(''), 3500)
  }

  function openForm(employee = null) {
    setSelectedEmployee(null)
    setFormEmployee(employee ? {
      ...employee,
      startDate: employee.startDate ? new Date(employee.startDate).toISOString().slice(0, 10) : '',
    } : null)
    setFormOpen(true)
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}'s employee record? This cannot be undone.`)) return
    try {
      await request(`/employees/${employee._id}`, { method: 'DELETE' })
      setEmployees((current) => current.filter((item) => item._id !== employee._id))
      setSelectedEmployee(null)
      setNotice('Employee record deleted.')
      window.setTimeout(() => setNotice(''), 3500)
    } catch (error) {
      setNotice(error.message)
      window.setTimeout(() => setNotice(''), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#202335]">
      <aside className="fixed inset-y-0 left-0 z-[3] flex w-[248px] flex-col border-r border-[#ececf2] bg-white px-[17px] pb-[18px] pt-[27px] max-lg:w-[208px] max-md:sticky max-md:inset-auto max-md:h-auto max-md:w-full max-md:flex-row max-md:items-center max-md:justify-between max-md:border-r-0 max-md:border-b max-md:px-4 max-md:py-[11px] max-[540px]:px-3 max-[540px]:py-2.5">
        <a className="flex items-center gap-2.5 px-2.5 text-[23px] font-extrabold tracking-[-1.2px] text-[#202335] max-md:px-0 max-[540px]:gap-2 max-[540px]:text-lg" href="#" aria-label="Forma home">
          <span className="grid size-[31px] place-items-center rounded-[10px] bg-[#6758dc] text-[23px] font-bold italic leading-none text-white max-md:size-7 max-[540px]:size-[25px] max-[540px]:rounded-lg max-[540px]:text-[19px]">f</span>
          <span>forma<span className="text-[#7765ed]">.</span></span>
        </a>
        <p className="mb-3 ml-2.5 mt-[42px] text-[10px] font-bold tracking-[1.1px] text-[#a0a1ae] max-md:hidden">WORKSPACE</p>
        <nav className="grid gap-[5px] max-md:flex max-md:gap-1" aria-label="Main navigation">
          <a className="flex min-h-[42px] items-center gap-3 rounded-md px-[11px] text-[13px] font-medium text-[#6f7180] hover:bg-[#f8f7fc] max-md:min-h-[35px] max-md:gap-1.5 max-md:px-2 max-md:text-[11px] max-[540px]:gap-1 max-[540px]:px-[7px] max-[540px]:text-[10px]" href="#overview"><Icon name="grid" /> Overview</a>
          <a className="flex min-h-[42px] items-center gap-3 rounded-md bg-[#f2f0ff] px-[11px] text-[13px] font-semibold text-[#6152cf] max-md:min-h-[35px] max-md:gap-1.5 max-md:px-2 max-md:text-[11px] max-[540px]:gap-1 max-[540px]:px-[7px] max-[540px]:text-[10px]" href="#employees"><Icon name="people" /> Employees <span className="ml-auto rounded bg-[#e8e5ff] px-[7px] py-0.5 text-[10px] text-[#6455d4] max-[540px]:px-[5px]">{employees.length}</span></a>
        </nav>
        <div className="mt-auto max-md:hidden">
          <div className="rounded-lg border border-[#eeedf4] p-[15px]">
            <span className="mb-3 grid size-[23px] place-items-center rounded-md bg-[#f1efff] text-xs font-bold text-[#6858db]">?</span>
            <strong className="block text-xs">Need a hand?</strong>
            <p className="mb-3 mt-1 text-[11px] text-[#898b99]">Our team is here to help you.</p>
            <a className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6758d9]" href="mailto:support@forma.example">Get support <Icon name="arrow" size={15} /></a>
          </div>
          <div className="mt-4 flex items-center gap-2.5 border-t border-[#f0eff4] px-[3px] pt-3">
            <Avatar>JD</Avatar>
            <div><strong className="block text-[11px]">Jordan Davis</strong><span className="mt-0.5 block text-[10px] text-[#9293a0]">Administrator</span></div>
            <IconButton label="Profile options" className="ml-auto"><Icon name="dots" /></IconButton>
          </div>
        </div>
      </aside>

      <main className="ml-[248px] min-h-screen max-lg:ml-[208px] max-md:ml-0" id="overview">
        <header className="flex h-[65px] items-center justify-between border-b border-[#edecf2] bg-white px-[43px] max-lg:px-[25px] max-md:h-[49px] max-md:px-[17px]">
          <div className="text-xs text-[#9293a0] max-[540px]:text-[10px]">Workspace <span className="px-2 text-[#c4c4ce]">/</span> <strong className="font-semibold text-[#303244]">Employees</strong></div>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 text-[11px] text-[#767887] max-[540px]:hidden"><Icon name="calendar" size={16} />{new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())}</span>
            <Avatar className="size-[30px] text-[10px]">JD</Avatar>
          </div>
        </header>

        <div className="mx-auto max-w-[1320px] px-[43px] pb-[22px] pt-[39px] max-lg:px-[25px] max-md:px-[17px] max-md:pb-5 max-md:pt-7 max-[540px]:px-[13px] max-[540px]:pb-4 max-[540px]:pt-[23px]" id="employees">
          <div className="mb-[27px] flex items-center justify-between max-[540px]:mb-[18px] max-[540px]:items-end max-[540px]:gap-2">
            <div>
              <Eyebrow>PEOPLE &amp; CULTURE</Eyebrow>
              <h1 className="text-[27px] font-bold tracking-tight text-[#202335] max-[540px]:text-[23px]">Employees</h1>
              <p className="mt-1.5 text-xs text-[#888a98] max-[540px]:max-w-[190px] max-[540px]:text-[10px]">Manage your people, all in one place.</p>
            </div>
            <Button className="min-h-[39px] px-3.5 max-[540px]:min-h-[35px] max-[540px]:gap-1 max-[540px]:px-2 max-[540px]:text-[10px]" onClick={() => openForm()}><Icon name="plus" size={19} /> Add employee</Button>
          </div>

          <section className="mb-[23px] grid grid-cols-3 gap-[15px] max-[540px]:mb-3.5 max-[540px]:gap-2" aria-label="Employee summary">
            <StatCard title="Total employees" value={employees.length} caption="People in your workspace" icon="people" tone="purple" />
            <StatCard title="Active employees" value={activeCount} caption={employees.length ? `${Math.round(activeCount / employees.length * 100)}% of your team` : 'No team members yet'} icon="live" tone="green" />
            <StatCard title="Departments" value={departmentsCount} caption="Across your organization" icon="briefcase" tone="orange" />
          </section>

          <section className="overflow-hidden rounded-lg border border-[#eaeaf0] bg-white">
            <div className="flex items-center justify-between px-[19px] pb-4 pt-5 max-[540px]:px-3 max-[540px]:pb-3 max-[540px]:pt-[15px]">
              <div><h2 className="text-[13px] font-semibold text-[#282a3a] max-[540px]:text-xs">All employees</h2><p className="mt-1 text-[10px] text-[#999aa6] max-[540px]:max-w-[190px] max-[540px]:text-[9px]">A directory of everyone on your team.</p></div>
              <div className="flex items-center gap-1.5">
                <span className="rounded border border-[#eeedf3] px-2 py-1 text-[10px] text-[#757684] max-[540px]:px-1.5 max-[540px]:text-[9px]">{employees.length} {employees.length === 1 ? 'employee' : 'employees'}</span>
                <RefreshButton loading={loading} onClick={loadEmployees} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-[19px] pb-[13px] max-[540px]:px-3 max-[540px]:pb-[11px]">
              <label className="flex h-[34px] w-full max-w-[295px] items-center gap-2 rounded-md border border-[#e9e9ef] px-2 text-[#a3a4b0] focus-within:border-[#9b91ed] focus-within:ring-2 focus-within:ring-[#7668db14] max-[540px]:h-8 max-[540px]:gap-1 max-[540px]:px-[7px]">
                <Icon name="search" size={19} />
                <input className="w-full min-w-0 border-0 bg-transparent text-[10px] text-[#363747] outline-none placeholder:text-[#a5a6b0] max-[540px]:text-[9px]" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." aria-label="Search employees" />
                <kbd className="rounded border border-[#eeedf2] px-1 py-0.5 text-[9px] text-[#aaaab4] max-[540px]:hidden">⌘ K</kbd>
              </label>
              <label className="relative flex h-[34px] w-[115px] shrink-0 items-center rounded-md border border-[#e9e9ef] text-[#707281] max-[540px]:h-8 max-[540px]:w-[101px]">
                <select className="h-full w-full appearance-none bg-transparent px-2.5 pr-7 text-[10px] outline-none" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option>All status</option><option>Active</option><option>On leave</option><option>Inactive</option></select>
                <span className="pointer-events-none absolute right-2"><Icon name="down" size={16} /></span>
              </label>
            </div>

            {loadError && <div className="mx-[19px] mb-3 flex items-center justify-between gap-3 rounded-md border border-[#f2d9d8] bg-[#fff8f7] p-3 max-[540px]:mx-3 max-[540px]:items-start"><div><strong className="mb-1 block text-[11px] text-[#a3443e]">Couldn't load employees</strong><span className="block text-[10px] text-[#9a7774]">{loadError}. Check that the backend and MongoDB are running.</span></div><Button variant="secondary" className="shrink-0" onClick={loadEmployees}>Try again</Button></div>}

            <div className="overflow-x-auto max-[540px]:overflow-visible">
              <table className="w-full border-collapse text-left max-[540px]:block">
                <thead className="bg-[#fafafd] max-[540px]:hidden">
                  <tr>
                    {['EMPLOYEE', 'DEPARTMENT', 'STATUS', 'EMPLOYMENT', 'START DATE', ''].map((heading) => <th key={heading} className="h-[35px] border-y border-[#f0eff4] px-3 text-[8px] font-bold tracking-[.45px] text-[#999aa7] first:pl-[19px] last:pr-3">{heading || <span className="sr-only">Actions</span>}</th>)}
                  </tr>
                </thead>
                <tbody className="max-[540px]:block">
                  {loading && <tr className="max-[540px]:block"><td colSpan="6" className="h-[180px] border-b border-[#f1f0f5] text-center text-[11px] text-[#8d8e9b] max-[540px]:flex max-[540px]:items-center max-[540px]:justify-center"><span className="mr-2 inline-block size-[15px] animate-spin rounded-full border-2 border-[#e7e4f9] border-t-[#705fe0]" />Loading employees...</td></tr>}
                  {!loading && !loadError && filteredEmployees.map((employee) => <EmployeeRow key={employee._id} employee={employee} onSelect={setSelectedEmployee} />)}
                  {!loading && !loadError && filteredEmployees.length === 0 && (
                    <tr className="max-[540px]:block">
                      <td colSpan="6" className="border-b border-[#f1f0f5]">
                        <div className="flex min-h-[245px] flex-col items-center justify-center px-6 py-6 text-center max-[540px]:min-h-[210px]">
                          <div className="mb-3 grid size-[45px] place-items-center rounded-xl bg-[#f0edff] text-[#6959d8]"><Icon name="people" size={24} /></div>
                          <strong className="text-xs text-[#343546]">{employees.length ? 'No matching employees' : 'Your team starts here'}</strong>
                          <p className="mb-3 mt-1.5 max-w-[300px] text-[10px] leading-relaxed text-[#9394a0]">{employees.length ? 'Try adjusting your search or status filter.' : 'Add your first employee to start building your team directory.'}</p>
                          {!employees.length && <Button className="min-h-[34px]" onClick={() => openForm()}><Icon name="plus" size={18} /> Add your first employee</Button>}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex min-h-[39px] items-center justify-between px-[19px] text-[9px] text-[#999aa6] max-[540px]:px-3 max-[540px]:text-[8px]">
              <span>Showing <strong className="font-semibold text-[#555766]">{filteredEmployees.length}</strong> of <strong className="font-semibold text-[#555766]">{employees.length}</strong> employees</span>
              <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#30b982] shadow-[0_0_0_3px_#30b98220]" />Data synced</span>
            </div>
          </section>
          <footer className="mt-4 flex justify-between text-[9px] text-[#a0a1ac]"><span>© 2025 Forma HR</span><span className="text-[#b1b2bc]">Built for better teams.</span></footer>
        </div>
      </main>
      {notice && <div className="fixed bottom-5 right-[22px] z-20 max-w-[calc(100vw-32px)] rounded-md border border-[#e8e6f0] bg-white px-4 py-3 text-[11px] text-[#343546] shadow-lg" role="status">{notice}</div>}
      {formOpen && <EmployeeForm employee={formEmployee} onClose={() => { setFormOpen(false); setFormEmployee(null) }} onSave={saveEmployee} />}
      {selectedEmployee && <EmployeeDetails employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} onEdit={openForm} onDelete={deleteEmployee} />}
    </div>
  )
}

export default App
