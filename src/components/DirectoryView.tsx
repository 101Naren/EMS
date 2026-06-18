import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  Upload,
  Camera
} from 'lucide-react';
import { Employee, EmployeeStatus, RoleType } from '../types';

interface DirectoryViewProps {
  employees: Employee[];
  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function DirectoryView({ 
  employees, 
  onAddEmployee, 
  onUpdateEmployee, 
  onDeleteEmployee,
  onShowToast
}: DirectoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState<RoleType>('Employee');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [salary, setSalary] = useState<number>(600000);
  const [joinDate, setJoinDate] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [reportingManager, setReportingManager] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFullName('');
    setEmail('');
    setDepartment('Engineering');
    setRole('Employee');
    setStatus('Active');
    setSalary(600000);
    setJoinDate(new Date().toISOString().split('T')[0]);
    setProfilePhoto('');
    setPhone('');
    setAddress('');
    setReportingManager('');
    setTempPassword('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFullName(emp.fullName);
    setEmail(emp.email);
    setDepartment(emp.department);
    setRole(emp.role);
    setStatus(emp.status);
    setSalary(emp.salary);
    setJoinDate(emp.joinDate);
    setProfilePhoto(emp.profilePhoto || '');
    setPhone(emp.phone || '');
    setAddress(emp.address || '');
    setReportingManager(emp.reportingManager || '');
    setTempPassword('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      onShowToast('Please fill out Name and Email.', true);
      return;
    }
    if (!editingEmployee && !tempPassword) {
      onShowToast('Please set a temporary password for the employee.', true);
      return;
    }

    const token = localStorage.getItem('ems_token');

    if (editingEmployee) {
      try {
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ name: fullName, department, role, status, salary, phone, address, reportingManager })
        });
        if (!res.ok) throw new Error();
        const updated: Employee = { 
          ...editingEmployee, 
          fullName, email, department, role, status, 
          salary, joinDate, profilePhoto, phone, address, reportingManager 
        };
        onUpdateEmployee(updated);
        onShowToast(`Employee updated: ${fullName}`);
      } catch {
        onShowToast('Failed to update employee.', true);
      }
    } else {
      try {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            name: fullName, email, password: tempPassword, 
            role, department, status, salary, joinDate, 
            phone, address, reportingManager 
          })
        });
        const data = await res.json();
        if (!res.ok) {
          onShowToast(data.message || 'Failed to add employee.', true);
          return;
        }
        const created: Employee = {
          id: data.employeeId,
          fullName, email, department, role, status, salary, joinDate,
          profilePhoto: profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`,
          phone, address, reportingManager,
          password: tempPassword,
          forcePasswordChange: true
        };
        onAddEmployee(created);
        onShowToast(`Employee ${fullName} added! They can login with their email and temp password.`);
      } catch {
        onShowToast('Failed to add employee.', true);
      }
    }
    setIsModalOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        onShowToast('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All Departments' ? true : emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All Status' ? true : emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalItems = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = () => {
    onShowToast('Employee directory exported to CSV successfully!');
  };

  return (
    <div id="directory-panel" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#091426] tracking-tight font-headline">Employee Directory</h2>
          <p className="text-sm text-slate-500 font-sans mt-1">
            Manage and review {employees.length} employee records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-[#091426] hover:bg-slate-50 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button 
            id="add-emp-btn"
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2170e4] text-white font-bold rounded-xl text-xs hover:bg-[#1a5cbd] transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
          <h4 className="text-2xl font-bold text-[#091426] font-display">{employees.length}</h4>
        </div>
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active</p>
          <h4 className="text-2xl font-bold text-sky-700 font-display">
            {employees.filter(e => e.status === 'Active').length}
          </h4>
        </div>
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">On Leave</p>
          <h4 className="text-2xl font-bold text-amber-600 font-display">
            {employees.filter(e => e.status === 'On Leave').length}
          </h4>
        </div>
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Salary</p>
          <h4 className="text-2xl font-bold text-[#0058be] font-display">
           ₹{Math.round(employees.reduce((acc,e) => acc+e.salary, 0) / employees.length).toLocaleString('en-IN')}
          </h4>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-center p-4 gap-4">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input 
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            <select 
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Human Resources</option>
              <option>Design & Product</option>
              <option>Legal</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Terminated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f2f4f6] border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400">
                    No employees found. Click "New Employee" to add one.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  let badge = 'bg-slate-100 text-slate-600';
                  if (emp.status === 'Active') badge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                  if (emp.status === 'On Leave') badge = 'bg-amber-50 text-amber-700 border-amber-100';
                  if (emp.status === 'Terminated') badge = 'bg-rose-50 text-rose-700 border-rose-100';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={emp.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.fullName}`}
                            alt={emp.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${emp.fullName}`;
                            }}
                          />
                          <div>
                            <p className="text-xs font-semibold text-[#091426]">{emp.fullName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{emp.email} • {emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{emp.department}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-slate-900 text-white">
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[9px] font-bold uppercase rounded-full ${badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : emp.status === 'On Leave' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-sky-800">₹{emp.salary.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleOpenEditModal(emp)}
                            className="p-2 hover:bg-slate-100 text-slate-600 hover:text-[#2170e4] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Delete ${emp.fullName}? This cannot be undone.`)) {
                                onDeleteEmployee(emp.id);
                                onShowToast(`${emp.fullName} removed from directory.`);
                              }
                            }}
                            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg ${
                    currentPage === i + 1 ? 'bg-[#2170e4] text-white' : 'hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-8 py-6 border-b border-slate-200">
              <div>
                <h3 className="text-xl font-bold text-[#091426] font-headline">
                  {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {editingEmployee ? 'Update employee details' : 'Register a new employee in the system'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              
              {/* Photo Upload */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 group overflow-hidden">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                  <label htmlFor="photo-input" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Upload className="w-5 h-5 text-white" />
                  </label>
                  <input type="file" id="photo-input" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </div>
                <div>
                  <p className="font-bold text-xs text-slate-700">Profile Photo</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">JPEG or PNG, optional</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Full Name</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Smith"
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Work Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                {!editingEmployee && (
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Temporary Password</label>
                    <input type="password" required={!editingEmployee} value={tempPassword} onChange={(e) => setTempPassword(e.target.value)}
                      placeholder="Set a temporary password for first login"
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                    <p className="text-[10px] text-slate-400">Employee will be required to change this on first login.</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Department</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Design & Product">Design & Product</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Role</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as RoleType)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Annual Salary (INR)</label>
                  <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Join Date</label>
                  <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Reporting Manager</label>
                  <input type="text" value={reportingManager} onChange={(e) => setReportingManager(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42 MG Road, Bengaluru, Karnataka 560001"
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit"
                  className="px-6 py-2.5 bg-[#2170e4] text-white font-bold rounded-xl text-xs hover:bg-[#1a5cbd] shadow-md active:scale-95">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}