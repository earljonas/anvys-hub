import React from 'react';
import { format } from 'date-fns';

const PayslipTemplate = ({ payroll, payslips }) => {
    return (
        <div className="hidden print:block font-sans text-black bg-white">
            {payslips.map((payslip, index) => (
                <div key={payslip.id} className="pdf-page p-8 max-w-[210mm] mx-auto break-after-page min-h-screen relative">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                        <div className="transform -rotate-45 text-9xl font-bold uppercase tracking-widest text-black whitespace-nowrap">
                            Anvy's Hub
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 border-b-2 border-gray-800 pb-4 relative z-10">
                        <h1 className="text-2xl font-bold uppercase tracking-wide">Anvy's Hub</h1>
                        <p className="text-sm text-gray-600">Davao City, Philippines</p>
                        <h2 className="text-xl font-bold mt-4 tracking-widest border-2 border-gray-800 inline-block px-4 py-1">PAYSLIP</h2>
                        <p className="text-sm font-medium mt-2 text-gray-600">
                            Payroll Period: {format(new Date(payroll.start_date), 'MMM dd, yyyy')} - {format(new Date(payroll.end_date), 'MMM dd, yyyy')}
                        </p>
                    </div>

                    {/* Employee Details */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 text-sm relative z-10">
                        <div className="flex">
                            <span className="font-bold w-24">Name:</span>
                            <span className="uppercase">{payslip.user.name}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold w-24">ID No:</span>
                            <span>{String(payslip.user.id).padStart(4, '0')}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold w-24">Department:</span>
                            <span>{payslip.user.employee_profile?.department || 'N/A'}</span>
                        </div>
                        <div className="flex">
                            <span className="font-bold w-24">Position:</span>
                            <span>{payslip.user.employee_profile?.job_title || 'Staff'}</span>
                        </div>
                    </div>

                    {/* Financial Table */}
                    <div className="border border-gray-800 mb-8 relative z-10">
                        {/* Table Header */}
                        <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-800">
                            <div className="p-2 font-bold text-center border-r border-gray-800">EARNINGS</div>
                            <div className="p-2 font-bold text-center">DEDUCTIONS</div>
                        </div>

                        {/* Table Content */}
                        <div className="grid grid-cols-2">
                            {/* Earnings Column */}
                            <div className="border-r border-gray-800 p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Basic Pay ({Number(payslip.hours_worked).toFixed(2)} hrs)</span>
                                    <span>{Number(payslip.gross_pay).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs italic">
                                    <span>Rate: ₱{Number(payslip.user.employee_profile?.hourly_rate || 0).toLocaleString()} / hr</span>
                                </div>
                                {payslip.overtime_pay > 0 && (
                                    <div className="flex justify-between text-blue-800">
                                        <span>Overtime Pay</span>
                                        <span>{Number(payslip.overtime_pay).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                    </div>
                                )}
                                {/* Spacer to fill height if needed */}
                                <div className="h-24"></div>
                                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-auto">
                                    <span>GROSS PAY</span>
                                    <span>{Number(payslip.gross_pay).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}</span>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div className="p-4 space-y-2">
                                {Object.entries(payslip.deductions || {}).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                        <span className="uppercase">{key}</span>
                                        <span className="text-red-700">({Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })})</span>
                                    </div>
                                ))}
                                {(!payslip.deductions || Object.keys(payslip.deductions).length === 0) && (
                                    <div className="text-gray-400 italic text-center text-xs py-4">No Deductions</div>
                                )}
                                {/* Spacer matching Earnings */}
                                <div className={`h-${(!payslip.deductions || Object.keys(payslip.deductions).length === 0) ? '20' : 'auto'}`}></div>
                                <div className="flex justify-between font-bold border-t border-gray-300 pt-2 mt-auto text-red-700">
                                    <span>TOTAL DEDUCTIONS</span>
                                    <span>({(Number(payslip.gross_pay) - Number(payslip.net_pay)).toLocaleString('en-PH', { minimumFractionDigits: 2 })})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay & Footer */}
                    <div className="border-t-2 border-gray-800 pt-4 relative z-10">
                        <div className="flex justify-between items-center mb-12">
                            <div className="text-sm">
                                <p className="font-bold">Received by:</p>
                                <div className="border-b border-black w-64 mt-8"></div>
                                <p className="text-xs text-gray-500 mt-1">Signature over Printed Name / Date</p>
                            </div>
                            <div className="text-right bg-gray-100 p-4 rounded border border-gray-300">
                                <p className="text-xs font-bold uppercase text-gray-500 mb-1">Net Pay</p>
                                <p className="text-3xl font-extrabold text-black">
                                    {Number(payslip.net_pay).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}
                                </p>
                            </div>
                        </div>

                        <p className="text-center text-xs text-gray-400 uppercase tracking-widest">
                            Configured & Generated by Anvy's Hub System
                        </p>
                    </div>
                </div>
            ))}

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white; }
                    .break-after-page { page-break-after: always; }
                }
            `}</style>
        </div>
    );
};

export default PayslipTemplate;
