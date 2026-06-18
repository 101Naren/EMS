import { useState } from 'react';
import { 
  FileText, 
  Printer
} from 'lucide-react';
import { Employee, PaymentDetails } from '../types';

interface PayrollAndProfileViewProps {
  employees: Employee[];
  payments: PaymentDetails[];
  onUpdateEmployeeSalary: (id: string, salary: number) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  defaultEmployeeId?: string;
}

export default function PayrollAndProfileView({
  employees,
  payments,
  onUpdateEmployeeSalary,
  onShowToast,
  defaultEmployeeId
}: PayrollAndProfileViewProps) {
  const isEmployeeRestriction = !!defaultEmployeeId;
  const initialEmployeeId = defaultEmployeeId || (employees[0]?.id || '');
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmployeeId);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [activePayslip, setActivePayslip] = useState<PaymentDetails | null>(null);

  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];
  const monthlySalaryInput = currentEmp ? Math.round(currentEmp.salary / 12) : 50000;

  // Indian tax structure
  const tds = Math.round(monthlySalaryInput * 0.10);
  const pf = Math.round(monthlySalaryInput * 0.12);
  const esi = monthlySalaryInput <= 21000 ? Math.round(monthlySalaryInput * 0.0075) : 0;
  const netPayAmount = Math.max(0, monthlySalaryInput - tds - pf - esi);

  const handleSalarySave = (newMonthlyVal: number) => {
    if (isNaN(newMonthlyVal) || newMonthlyVal <= 0) {
      onShowToast('Please enter a valid salary.', true);
      return;
    }
    const annualVal = newMonthlyVal * 12;
    onUpdateEmployeeSalary(currentEmp.id, annualVal);
    onShowToast(`Salary updated for ${currentEmp.fullName}. Annual: ₹${annualVal.toLocaleString('en-IN')}`);
  };

  const handleGenerateInvoice = (payDetails: PaymentDetails) => {
    setActivePayslip(payDetails);
    setIsPayslipModalOpen(true);
  };

  const handleGenerateCurrentPeriodSlip = () => {
    const simulatedSlip: PaymentDetails = {
      id: `current-pay-slip-${currentEmp.id}`,
      employeeId: currentEmp.id,
      paymentDate: new Date().toISOString().split('T')[0],
      referenceId: `#PAY-${Math.floor(1000 + Math.random() * 9000)}-X`,
      type: "Monthly Salary",
      baseSalary: monthlySalaryInput,
      taxFederal: tds,
      taxState: pf,
      benefits: esi,
      netPay: netPayAmount,
      status: "Released",
      payPeriod: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    };
    handleGenerateInvoice(simulatedSlip);
  };

  const currentPayments = payments.filter(p => p.employeeId === selectedEmpId);

  return (
    <div id="payroll-view-container" className="space-y-6 animate-fade-in">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <nav className="text-xs font-bold font-sans text-[#8590a6] uppercase tracking-wider">
          <span>Directory</span>
          <span className="mx-2">/</span>
          <span className="text-[#091426] font-semibold">Employee Profile & Payroll</span>
        </nav>
        {!isEmployeeRestriction && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold font-sans">SELECT EMPLOYEE:</span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-[#091426] outline-none font-bold"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.id})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {currentEmp ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-sm">
              <img
                src={currentEmp.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${currentEmp.fullName}`}
                alt={currentEmp.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentEmp.fullName}`; }}
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1.5">
                  <h3 className="text-2xl font-bold text-primary font-headline tracking-tight">{currentEmp.fullName}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-100 mx-auto sm:mx-0">
                    {currentEmp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-sans font-medium mb-5">{currentEmp.department}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-left">
                  <div>
                    <span className="text-[9px] font-bold text-[#8590a6] uppercase tracking-wider block">Employee ID</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentEmp.id}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[#8590a6] uppercase tracking-wider block">Date Joined</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5 block">{currentEmp.joinDate}</span>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-[9px] font-bold text-[#8590a6] uppercase tracking-wider block">Reporting To</span>
                    <span className="text-sm font-semibold text-[#0058be] font-sans mt-0.5 block">{currentEmp.reportingManager || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#091426] tracking-tight pb-3 border-b border-slate-100 font-headline mb-4">
                  Attendance & Allocations
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Present (This Month)</span>
                    <span className="font-bold text-[#091426]">18 / 22 days</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-2">
                    <span className="text-slate-500">Remaining Leaves</span>
                    <span className="font-bold text-amber-600">12 Days</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onShowToast('Attendance log generated.')}
                className="w-full mt-5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Request Audit Verification
              </button>
            </div>
          </div>

          {/* Payroll Section */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
              <div>
                <h4 className="text-md font-bold text-primary font-headline">Compensation & Deductions</h4>
                <p className="text-[11px] text-[#8590a6] font-sans">Interactive computations for current period disbursement</p>
              </div>
              <button
                onClick={handleGenerateCurrentPeriodSlip}
                className="px-4 py-2 bg-[#2170e4] text-white text-xs font-bold rounded-xl shadow-md tracking-wider hover:bg-[#1a5cbd] transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Current Payslip</span>
              </button>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Monthly Base Salary (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      value={monthlySalaryInput}
                      disabled={isEmployeeRestriction}
                      onChange={(e) => handleSalarySave(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-[#2170e4]"
                    />
                  </div>
                  {!isEmployeeRestriction ? (
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                      Update to recalculate tax automatically.
                    </p>
                  ) : (
                    <p className="text-[10px] text-[#8590a6] font-sans">Restricted to Admin modifications.</p>
                  )}
                </div>

                <div className="lg:col-span-3">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-sans">
                    Computed Deduction & Disbursement Breakdown
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">TDS</span>
                      <h5 className="text-lg font-bold text-rose-600 mt-2">-₹{tds.toLocaleString('en-IN')}</h5>
                      <span className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold mt-1">10% statutory</span>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">PF</span>
                      <h5 className="text-lg font-bold text-rose-600 mt-2">-₹{pf.toLocaleString('en-IN')}</h5>
                      <span className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold mt-1">12% provident fund</span>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-sans">ESI</span>
                      <h5 className="text-lg font-bold text-rose-600 mt-2">-₹{esi.toLocaleString('en-IN')}</h5>
                      <span className="text-[8px] text-slate-400 tracking-wider uppercase font-semibold mt-1">0.75% if ≤ ₹21,000</span>
                    </div>
                    <div className="p-4 bg-[#d8e2ff] text-[#001a42] rounded-xl border border-blue-100 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-[#004395] uppercase font-sans">Net Pay</span>
                      <h5 className="text-lg font-extrabold text-[#001a42] mt-2">₹{netPayAmount.toLocaleString('en-IN')}</h5>
                      <span className="text-[8px] text-[#004395] tracking-wider uppercase font-bold mt-1">Take-home amount</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h5 className="text-sm font-bold text-primary font-headline mb-4">Recent Disbursements History</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150">
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">Payment Period</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">Reference</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">Type</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">Net Disbursed</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase text-right">Payslip</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentPayments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400 font-sans">
                            No payment vouchers registered. Click 'Generate Current Payslip' to create one!
                          </td>
                        </tr>
                      ) : (
                        currentPayments.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{pay.payPeriod}</td>
                            <td className="px-4 py-3.5 text-xs font-mono text-slate-500">{pay.referenceId}</td>
                            <td className="px-4 py-3.5 text-xs font-medium text-slate-600">{pay.type}</td>
                            <td className="px-4 py-3.5 text-xs font-bold text-[#0058be]">₹{pay.netPay.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-bold uppercase rounded">
                                {pay.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => handleGenerateInvoice(pay)}
                                className="text-[#0058be] hover:underline text-xs font-bold cursor-pointer"
                              >
                                View Payslip
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white p-12 text-center text-xs text-slate-400">
          No employee selected. Add an employee first.
        </div>
      )}

      {/* Payslip Modal */}
      {isPayslipModalOpen && activePayslip && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-8 py-4 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-500 font-sans uppercase">Salary Statement Preview</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsPayslipModalOpen(false)}
                  className="px-3 py-1.5 bg-[#091426] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div id="print-sheet-area" className="flex-1 overflow-y-auto p-10 font-sans text-slate-800">
              <div className="flex justify-between items-start pb-6 border-b-2 border-[#091426] mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#091426] font-headline">EMS</h1>
                  <p className="text-[9px] text-[#8590a6] uppercase tracking-wider mt-0.5">Enterprise Management System</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-bold text-slate-700">Salary Statement</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Period: {activePayslip.payPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Employee Details</h4>
                  <p className="font-bold text-[#091426] text-sm">{currentEmp.fullName}</p>
                  <p className="text-slate-500 mt-0.5">ID: {currentEmp.id}</p>
                  <p className="text-slate-500">{currentEmp.email}</p>
                  <p className="text-slate-500">{currentEmp.department}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-1">Disbursement Details</h4>
                  <p className="font-semibold text-slate-700">Ref: {activePayslip.referenceId}</p>
                  <p className="text-slate-500 mt-0.5">Date: {activePayslip.paymentDate}</p>
                  <p className="text-slate-500">Method: Bank Transfer (NEFT)</p>
                  <p className="text-slate-500">Status: <span className="text-emerald-600 font-bold">RELEASED</span></p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#f2f4f6] border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Base Monthly Salary</td>
                      <td className="px-4 py-3 text-right font-bold text-[#091426]">₹{activePayslip.baseSalary.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-500">Deduction: TDS (10%)</td>
                      <td className="px-4 py-3 text-right text-rose-600 font-medium">-₹{activePayslip.taxFederal.toLocaleString('en-IN')}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-slate-500">Deduction: Provident Fund / PF (12%)</td>
                      <td className="px-4 py-3 text-right text-rose-600 font-medium">-₹{activePayslip.taxState.toLocaleString('en-IN')}</td>
                    </tr>
                    {activePayslip.benefits > 0 && (
                      <tr>
                        <td className="px-4 py-3 text-slate-500">Deduction: ESI (0.75%)</td>
                        <td className="px-4 py-3 text-right text-rose-600 font-medium">-₹{activePayslip.benefits.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-sky-50 font-bold border-t border-slate-200 text-[#001a42]">
                      <td className="px-4 py-3 text-sm">Net Take-Home Pay</td>
                      <td className="px-4 py-3 text-right text-base">₹{activePayslip.netPay.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-between items-end pt-12 text-[10px] text-slate-400 font-sans border-t border-slate-100 border-dashed">
                <div>
                  <p className="italic mb-1">HR Administrator</p>
                  <p className="font-bold text-slate-600 uppercase">EMS Admin</p>
                </div>
                <div className="text-right">
                  <p className="italic mb-1">Authentication Token</p>
                  <p className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 inline-block">EMS-{activePayslip.id.toUpperCase()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}