import React from 'react';
import { Modal } from './Modal';
import { Challan } from '../types';
import { Printer, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PrintChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  challan: Challan | null;
}

export const PrintChallanModal: React.FC<PrintChallanModalProps> = ({ isOpen, onClose, challan }) => {
  if (!challan) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Sales Delivery Challan: ${challan.challanNumber}`} maxWidth="max-w-4xl">
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <div id="printable-challan" className="bg-slate-900 text-slate-100 p-8 rounded-xl border border-slate-800 space-y-6">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-wider">SALES DELIVERY CHALLAN</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Mini ERP + CRM Wholesale Operations</p>
            <p className="text-xs text-slate-500">GSTIN: 36AAACM99991Z8 | Contact: ops@company.com</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-blue-400">{challan.challanNumber}</div>
            <div className="text-xs text-slate-400 mt-1">Date: {new Date(challan.createdAt).toLocaleDateString()}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase">
              {challan.status === 'CONFIRMED' && <span className="text-emerald-400 border-emerald-500/40 bg-emerald-500/10 flex items-center gap-1"><CheckCircle size={12}/> Confirmed</span>}
              {challan.status === 'DRAFT' && <span className="text-amber-400 border-amber-500/40 bg-amber-500/10 flex items-center gap-1"><Clock size={12}/> Draft</span>}
              {challan.status === 'CANCELLED' && <span className="text-red-400 border-red-500/40 bg-red-500/10 flex items-center gap-1"><XCircle size={12}/> Cancelled</span>}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Info */}
        <div className="grid grid-cols-2 gap-6 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500">Delivered To (Customer):</span>
            <h4 className="text-base font-bold text-slate-100 mt-1">{challan.customer?.businessName}</h4>
            <p className="text-sm text-slate-300">Attn: {challan.customer?.name}</p>
            <p className="text-xs text-slate-400 mt-1">{challan.customer?.address}</p>
            <p className="text-xs text-slate-400">Mobile: {challan.customer?.mobile} | Email: {challan.customer?.email}</p>
            {challan.customer?.gstNumber && <p className="text-xs text-blue-400 mt-1 font-mono">GSTIN: {challan.customer.gstNumber}</p>}
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-slate-500">Dispatch Details:</span>
            <p className="text-xs text-slate-300 mt-1">Created By: <strong className="text-slate-100">{challan.createdBy}</strong></p>
            {challan.confirmedAt && (
              <p className="text-xs text-emerald-400 mt-1">Confirmed On: {new Date(challan.confirmedAt).toLocaleString()}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">Mode of Transport: Road Transport / Warehouse Direct Dispatch</p>
          </div>
        </div>

        {/* Products Table */}
        <div>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase font-bold bg-slate-950/60">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Product Description</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Qty</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {challan.items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono text-xs">{item.productSku}</td>
                  <td className="py-3 px-3 font-medium text-slate-100">{item.productName}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">₹{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right font-bold text-blue-400">{item.quantity}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-100">₹{item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary & Totals */}
        <div className="flex justify-between items-end border-t border-slate-800 pt-6">
          <div className="text-xs text-slate-400 space-y-1">
            <p>1. Goods once dispatched with confirmed challan cannot be returned without prior approval.</p>
            <p>2. Subject to local warehouse jurisdiction.</p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 min-w-[240px] text-right space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Line Items:</span>
              <span className="font-bold text-slate-200">{challan.items?.length || 0}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Quantity:</span>
              <span className="font-bold text-slate-200">{challan.totalQuantity} Units</span>
            </div>
            <div className="flex justify-between text-base font-black text-emerald-400 border-t border-slate-800 pt-2">
              <span>Total Valuation:</span>
              <span>₹{challan.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-400">
          <div>
            <div className="h-12 border-b border-dashed border-slate-700 mb-2"></div>
            <p className="font-semibold text-slate-300">Authorized Signatory (Company)</p>
          </div>
          <div>
            <div className="h-12 border-b border-dashed border-slate-700 mb-2"></div>
            <p className="font-semibold text-slate-300">Receiver's Signature & Stamp</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
