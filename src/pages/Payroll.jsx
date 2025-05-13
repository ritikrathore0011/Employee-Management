import React from 'react';

export default function PayrollPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payroll & Salary</h1>

      {/* Salary Structure */}
      <section className="mb-6 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Salary Structure</h2>
        <ul className="text-sm space-y-2">
          <li><strong>Basic:</strong> ₹30,000</li>
          <li><strong>HRA:</strong> ₹12,000</li>
          <li><strong>Conveyance:</strong> ₹2,000</li>
          <li><strong>Medical Allowance:</strong> ₹1,500</li>
          <li><strong>Total:</strong> ₹45,500</li>
        </ul>
      </section>

      {/* Deductions & Bonuses */}
      <section className="mb-6 bg-white shadow rounded-xl p-6 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Deductions</h3>
          <ul className="text-sm space-y-2">
            <li>Provident Fund: ₹1,800</li>
            <li>Tax Deducted: ₹3,000</li>
            <li>Leave Without Pay: ₹500</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Bonuses / Allowances</h3>
          <ul className="text-sm space-y-2">
            <li>Performance Bonus: ₹5,000</li>
            <li>Festival Bonus: ₹2,000</li>
          </ul>
        </div>
      </section>

      {/* Payslips */}
      <section className="mb-6 bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Payslips</h2>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Month</th>
              <th className="p-2">Net Salary</th>
              <th className="p-2">Status</th>
              <th className="p-2">Payslip</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-2">March 2025</td>
              <td className="p-2">₹44,000</td>
              <td className="p-2 text-green-600 font-medium">Paid</td>
              <td className="p-2">
                <a href="#" className="text-blue-600 underline">Download PDF</a>
              </td>
            </tr>
            <tr className="border-t">
              <td className="p-2">February 2025</td>
              <td className="p-2">₹43,500</td>
              <td className="p-2 text-green-600 font-medium">Paid</td>
              <td className="p-2">
                <a href="#" className="text-blue-600 underline">Download PDF</a>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
