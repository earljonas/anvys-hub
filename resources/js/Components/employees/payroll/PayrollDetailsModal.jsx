import React, { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Printer, CreditCard, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '@/Components/employees/Modal';
import Button from '@/Components/employees/Button';

const PayrollDetailsModal = ({ isOpen, onClose, payroll }) => {
    const { post, processing } = useForm();
    const printRef = useRef();

    if (!isOpen || !payroll) return null;

    const handleMarkAsPaid = () => {
        if (confirm('Are you sure you want to mark this payroll as PAID? This action cannot be undone.')) {
            post(route('admin.payroll.pay', payroll.id), {
                onSuccess: () => onClose()
            });
        }
    };

    const handlePrint = () => {
        // Create a hidden iframe for printing (stays on same page)
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Payslip - ${payroll.employee_name}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                    .payslip-title { font-size: 18px; color: #666; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .info-box { flex: 1; padding: 15px; background: #f5f5f5; border-radius: 8px; margin: 0 5px; }
                    .info-label { font-size: 12px; color: #666; text-transform: uppercase; }
                    .info-value { font-size: 16px; font-weight: bold; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #f5f5f5; font-weight: bold; }
                    .total-row { font-weight: bold; font-size: 18px; background: #e8f5e9; }
                    .total-row td { color: #2e7d32; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">ANVY HUB</div>
                    <div class="payslip-title">Employee Payslip</div>
                </div>
                
                <div class="info-row">
                    <div class="info-box">
                        <div class="info-label">Employee</div>
                        <div class="info-value">${payroll.employee_name}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Pay Period</div>
                        <div class="info-value">${format(new Date(payroll.start_date), 'MMM dd')} - ${format(new Date(payroll.end_date), 'MMM dd, yyyy')}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">Status</div>
                        <div class="info-value">${payroll.status.toUpperCase()}</div>
                    </div>
                </div>

                <table>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                    <tr>
                        <td>Hours Worked</td>
                        <td style="text-align: right;">${Number(payroll.total_hours).toFixed(2)} hrs</td>
                    </tr>
                    <tr>
                        <td>Gross Pay</td>
                        <td style="text-align: right;">₱${Number(payroll.gross_pay).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="color: #d32f2f; padding-left: 20px;">SSS</td>
                        <td style="text-align: right; color: #d32f2f;">-₱${Number(payroll.sss_deduction || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="color: #d32f2f; padding-left: 20px;">PhilHealth</td>
                        <td style="text-align: right; color: #d32f2f;">-₱${Number(payroll.philhealth_deduction || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="color: #d32f2f; padding-left: 20px;">Pag-IBIG</td>
                        <td style="text-align: right; color: #d32f2f;">-₱${Number(payroll.pagibig_deduction || 0).toFixed(2)}</td>
                    </tr>
                    ${Number(payroll.tax_deduction || 0) > 0 ? `
                    <tr>
                        <td style="color: #d32f2f; padding-left: 20px;">Withholding Tax</td>
                        <td style="text-align: right; color: #d32f2f;">-₱${Number(payroll.tax_deduction).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td>NET PAY</td>
                        <td style="text-align: right;">₱${Number(payroll.net_pay).toFixed(2)}</td>
                    </tr>
                </table>

                <div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
                    Generated on ${format(new Date(), 'MMMM dd, yyyy')}
                </div>
            </body>
            </html>
        `);
        doc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        // Remove iframe after printing
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Payroll Details`} maxWidth="max-w-2xl">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-[hsl(var(--muted))]/30 p-4 rounded-xl border border-[hsl(var(--border))]">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Employee</p>
                    <h3 className="text-lg font-bold mt-1 text-[hsl(var(--foreground))]">{payroll.employee_name}</h3>
                </div>
                <div className="bg-[hsl(var(--muted))]/30 p-4 rounded-xl border border-[hsl(var(--border))]">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Period</p>
                    <h3 className="text-sm font-bold mt-1 text-[hsl(var(--foreground))]">
                        {format(new Date(payroll.start_date), 'MMM dd')} - {format(new Date(payroll.end_date), 'MMM dd, yyyy')}
                    </h3>
                </div>
                <div className="bg-[hsl(var(--muted))]/30 p-4 rounded-xl border border-[hsl(var(--border))]">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase">Status</p>
                    <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${payroll.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {payroll.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {payroll.status.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pay Breakdown */}
            <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20">
                    <h3 className="font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                        <FileText size={16} />
                        Pay Breakdown
                    </h3>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]/50">
                        <span className="text-[hsl(var(--muted-foreground))]">Hours Worked</span>
                        <span className="font-medium">{Number(payroll.total_hours).toFixed(2)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[hsl(var(--border))]/50">
                        <span className="text-[hsl(var(--muted-foreground))]">Gross Pay</span>
                        <span className="font-medium">₱{Number(payroll.gross_pay).toFixed(2)}</span>
                    </div>

                    {/* Individual Deductions */}
                    <div className="py-2 border-b border-[hsl(var(--border))]/50">
                        <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase mb-2">Deductions</div>
                        <div className="space-y-1 pl-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">SSS</span>
                                <span className="text-sm font-medium text-red-500">-₱{Number(payroll.sss_deduction || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">PhilHealth</span>
                                <span className="text-sm font-medium text-red-500">-₱{Number(payroll.philhealth_deduction || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[hsl(var(--muted-foreground))]">Pag-IBIG</span>
                                <span className="text-sm font-medium text-red-500">-₱{Number(payroll.pagibig_deduction || 0).toFixed(2)}</span>
                            </div>
                            {Number(payroll.tax_deduction || 0) > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-[hsl(var(--muted-foreground))]">Withholding Tax</span>
                                    <span className="text-sm font-medium text-red-500">-₱{Number(payroll.tax_deduction).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-green-50 -mx-4 px-4 rounded-b-xl">
                        <span className="font-bold text-green-700">Net Pay</span>
                        <span className="text-xl font-bold text-green-700">₱{Number(payroll.net_pay).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-[hsl(var(--border))]">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer size={16} />
                    Print Payslip
                </Button>

                <div className="flex gap-2">
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                    {payroll.status !== 'paid' && (
                        <Button onClick={handleMarkAsPaid} disabled={processing} className="gap-2">
                            <CreditCard size={16} />
                            {processing ? 'Processing...' : 'Mark as Paid'}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PayrollDetailsModal;
