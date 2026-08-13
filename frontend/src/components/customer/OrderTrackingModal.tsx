import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  PackageCheck,
  Cpu,
  Truck,
  Navigation,
  CheckCircle2,
  MapPin,
  CreditCard,
  Printer,
  Calendar,
  Ban,
  ShieldCheck,
  XCircle,
  Loader2,
  Headset,
  Copy,
  Check,
} from "lucide-react";
import api from "@/lib/api";
import { CancelOrderModal } from "./CancelOrderModal";
import { SupportQueryModal } from "./SupportQueryModal";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onOrderUpdated?: () => void;
}

const STATUS_STEPS = [
  { key: "PROCESSING", label: "Processing", desc: "Inspected & Packed in Voltra Hub", icon: Cpu },
  { key: "IN_TRANSIT", label: "In Transit", desc: "Handed to Express Carrier", icon: Truck },
  { key: "SHIPPED", label: "Out for Delivery", desc: "Rider is near your address", icon: Navigation },
  { key: "DELIVERED", label: "Delivered", desc: "Package delivered safely", icon: CheckCircle2 },
];

export function OrderTrackingModal({ isOpen, onClose, order, onOrderUpdated }: OrderTrackingModalProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedRefundId, setCopiedRefundId] = useState(false);

  if (!isOpen || !order) return null;

  const currentStatus = (order.orderStatus || order.status || "PENDING").toUpperCase();
  const isCancelled = currentStatus === "CANCELLED";

  const refundReq = order.refundRequests?.[0] || order.refundRequest || null;
  const refundIdFormatted = refundReq?.id ? `REFUND-${refundReq.id.slice(0, 8).toUpperCase()}` : "";

  const handleCopyRefundId = () => {
    if (refundIdFormatted) {
      navigator.clipboard.writeText(refundIdFormatted);
      setCopiedRefundId(true);
      setTimeout(() => setCopiedRefundId(false), 2000);
    }
  };

  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
      case "PROCESSING":
        return 0;
      case "IN_TRANSIT":
        return 1;
      case "SHIPPED":
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return 0;
    }
  };

  const activeStepIdx = isCancelled ? -1 : getStepIndex(currentStatus);
  const progressPercent = isCancelled ? 0 : Math.min(100, Math.max(15, ((activeStepIdx + 1) / 4) * 100));

  const items = order.orderItems || [];
  const address = order.shippingAddress;
  const payment = order.payment;

  const subtotal = Number(order.subtotal || order.total || 0);
  const tax = Number(order.tax || (subtotal * 0.08));
  const total = Number(order.total || order.totalAmount || subtotal + tax);

  const handlePrintInvoice = () => {
    window.print();
  };

  const orderNum = order.orderNumber || order.id?.slice(0, 8);
  const orderDateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isRefundApproved = refundReq?.status === "APPROVED";
  const supportInitialMsg = `Hello Voltra Support, I am reaching out regarding my refund request for Order #${orderNum} (Refund ID: ${refundIdFormatted || "N/A"}). Status: ${refundReq?.status || "PENDING"}. Amount: $${total.toFixed(2)}. Please assist me with the refund status.`;

  return (
    <>
      {/* ── CANCEL ORDER POP-UP REASON MODAL ── */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        order={order}
        onSuccess={() => {
          if (onOrderUpdated) onOrderUpdated();
        }}
      />

      {/* ── CUSTOMER SUPPORT CHAT POP-UP MODAL ── */}
      <SupportQueryModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        initialSubject={`Refund Inquiry for Order #${orderNum}`}
        initialCategory="Refund"
        initialOrderId={orderNum}
        initialMessage={supportInitialMsg}
      />

      {/* ── SCREEN POP-UP MODAL (HIDDEN ON PRINT) ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md animate-fadeIn overflow-y-auto print:hidden">
        <div className="relative w-full max-w-3xl my-8 overflow-hidden rounded-3xl border border-white/20 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
          {/* Top Right Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-ink/5 text-ink hover:bg-ink/10 transition"
          >
            <X size={18} />
          </button>

          {/* Modal Header */}
          <div className="border-b border-ink/10 pb-5 pr-10">
            <div className="flex items-center gap-3">
              <h3 className="font-display text-xl md:text-2xl font-bold text-ink">
                Order #{orderNum}
              </h3>
              {isCancelled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-600">
                  <Ban size={13} /> Cancelled
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neon/30 px-3 py-1 text-xs font-bold text-neon-dark">
                  <span className="h-2 w-2 rounded-full bg-neon-dark animate-pulse" />
                  {currentStatus}
                </span>
              )}
            </div>
            <p className="mt-1 flex items-center gap-2 text-xs text-ink-soft">
              <Calendar size={13} /> Placed on {orderDateStr}
            </p>
          </div>

          {/* Animated Order Tracker Progress Bar */}
          {!isCancelled ? (
            <div className="my-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#CCFF00]">
                  Live Package Tracker
                </span>
                <span className="text-xs text-white/60 font-mono">
                  Estimated Delivery: 2-3 Business Days
                </span>
              </div>

              {/* Progress Bar Line */}
              <div className="relative my-6">
                <div className="h-2 w-full rounded-full bg-white/10" />
                <div
                  className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-neon via-[#B8E600] to-emerald-400 transition-all duration-1000 shadow-[0_0_12px_#CCFF00]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Timeline Steps */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center">
                {STATUS_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isPassed = idx <= activeStepIdx;
                  const isCurrent = idx === activeStepIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`grid h-10 w-10 place-items-center rounded-2xl transition-all duration-300 ${
                          isCurrent
                            ? "bg-[#CCFF00] text-ink scale-110 shadow-[0_0_15px_#CCFF00]"
                            : isPassed
                            ? "bg-emerald-500 text-white"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        <StepIcon size={18} />
                      </div>
                      <span
                        className={`mt-2 block text-[11px] font-bold ${
                          isPassed ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="my-6 rounded-2xl bg-rose-500/10 p-5 border border-rose-200/60 text-rose-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/60 pb-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Ban size={16} /> Order Cancelled & Refund Request Active
                </div>
                <span
                  className={`rounded-full px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                    isRefundApproved
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {refundReq?.status || "PENDING"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-800/70 block">Reason</span>
                  <span className="font-semibold">{order.cancellationReason || refundReq?.reason || "Customer Request"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-800/70 block">Refund Amount</span>
                  <span className="font-bold text-sm">${total.toFixed(2)}</span>
                </div>
                {refundIdFormatted && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-rose-800/70 block">Refund ID</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-xs text-ink mt-0.5">
                      <span>{refundIdFormatted}</span>
                      <button
                        type="button"
                        onClick={handleCopyRefundId}
                        className="p-1 rounded-lg bg-white/80 hover:bg-white text-ink shadow-sm transition"
                        title="Copy Refund ID"
                      >
                        {copiedRefundId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                )}
                {refundReq?.description && (
                  <div className="sm:col-span-3">
                    <span className="text-[10px] uppercase font-bold text-rose-800/70 block">DESCRIPTION</span>
                    <span className="text-xs opacity-90">{refundReq.description}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-rose-200/60 text-xs">
                <span className="text-[11px] text-rose-700/80">Need help with your refund?</span>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(true)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 transition flex items-center gap-1.5"
                >
                  <Headset size={14} /> Customer Support
                </button>
              </div>
            </div>
          )}

          {/* Order Items Summary */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft">
              Items in Order ({items.length})
            </h4>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 border border-ink/5"
                >
                  <div>
                    <span className="font-display text-xs font-bold text-ink block">
                      {item.productName || "Voltra Product"}
                    </span>
                    <span className="text-[11px] text-ink-soft">
                      Variant: {item.variantName || "Standard"} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="font-display text-sm font-extrabold text-ink">
                    ${Number(item.totalPrice || item.unitPrice * item.quantity || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 pt-4 border-t border-ink/10 text-xs">
            {/* Shipping Address */}
            <div className="p-4 rounded-2xl bg-white/60 border border-ink/5 space-y-1">
              <div className="flex items-center gap-2 font-bold text-ink mb-1">
                <MapPin size={15} className="text-neon-dark" /> Delivery Address
              </div>
              {address ? (
                <>
                  <p className="font-semibold text-ink">{address.fullName}</p>
                  <p className="text-ink-soft">{address.addressLine1} {address.addressLine2 || ""}</p>
                  <p className="text-ink-soft">{address.city}, {address.state} {address.postalCode}</p>
                  <p className="text-ink-soft font-mono">Phone: {address.phone}</p>
                </>
              ) : (
                <p className="text-ink-soft">Standard Delivery Address</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="p-4 rounded-2xl bg-white/60 border border-ink/5 space-y-2">
              <div className="flex items-center justify-between font-bold text-ink mb-1">
                <div className="flex items-center gap-2">
                  <CreditCard size={15} className="text-neon-dark" /> Payment Info
                </div>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">
                  {payment?.status || "COMPLETED"}
                </span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span className="font-medium text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Express Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between border-t border-ink/5 pt-1.5 font-bold text-sm text-ink">
                <span>Total Paid</span>
                <span className="font-display text-base font-extrabold text-ink">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Action Footer: CANCEL ORDER (LEFT) & PRINT INVOICE (RIGHT) */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-ink/10">
            <div>
              {!isCancelled && currentStatus !== "DELIVERED" ? (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-5 py-2.5 rounded-2xl border border-rose-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center gap-2 transition"
                >
                  <XCircle size={15} /> Cancel Order
                </button>
              ) : isCancelled ? (
                <span className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-700">
                  <XCircle size={15} /> Order Cancelled & Refund Initiated
                </span>
              ) : null}
            </div>

            <button
              onClick={handlePrintInvoice}
              className="btn-neon px-7 py-3 text-xs font-extrabold shadow-lg flex items-center gap-2 rounded-2xl transition hover:scale-105"
            >
              <Printer size={16} /> Print Invoice
            </button>
          </div>
        </div>
      </div>

      {/* ── PRINT-ONLY DEDICATED OFFICIAL VOLTRA CORPORATE TAX INVOICE ── */}
      <div className="hidden print:block fixed inset-0 z-[99999] bg-white text-slate-900 p-8 font-sans leading-relaxed text-xs">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-black text-lime-400 font-black grid place-items-center text-lg">
                ⚡
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                VOLTRA <span className="text-lime-600">.</span>
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 font-medium leading-snug">
              Voltra Technologies Inc.<br />
              100 Innovation Boulevard, Suite 400<br />
              San Francisco, CA 94103 • USA<br />
              Tax Reg / GST: US-894102948
            </p>
          </div>

          <div className="text-right">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              TAX INVOICE
            </h1>
            <p className="mt-1 font-mono text-sm font-bold text-slate-800">
              Invoice #: INVOICE-{orderNum}
            </p>
            <p className="text-slate-500 mt-0.5">Date: {orderDateStr}</p>
            <p className="mt-2 inline-block rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
              PAYMENT STATUS: PAID
            </p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-2 gap-8 my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              BILLED TO / CUSTOMER
            </span>
            <p className="font-bold text-sm text-slate-900">{address?.fullName || "Valued Voltra Customer"}</p>
            <p className="text-slate-600 mt-0.5">{address?.addressLine1} {address?.addressLine2 || ""}</p>
            <p className="text-slate-600">{address?.city}, {address?.state} {address?.postalCode}</p>
            <p className="text-slate-600 font-mono mt-1">Phone: {address?.phone || "N/A"}</p>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              PAYMENT & ORDER SUMMARY
            </span>
            <p className="text-slate-700 font-semibold">Payment Method: Credit Card / Voltra Platinum</p>
            <p className="text-slate-700">Order Reference: #{orderNum}</p>
            <p className="text-slate-700">Fulfilled By: Voltra Express Shipping Logistics</p>
            <p className="text-slate-700 font-semibold mt-1 text-emerald-700">Shipping: FREE Express Delivery</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="my-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-extrabold uppercase text-[10px] tracking-wider bg-slate-100">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3">Variant</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item: any, idx: number) => {
                const uPrice = Number(item.unitPrice || item.price || 0);
                const itemTot = Number(item.totalPrice || uPrice * item.quantity || 0);
                return (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 font-mono font-bold">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {item.productName || "Voltra Product"}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.variantName || "Standard"}
                    </td>
                    <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">${uPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${itemTot.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end my-6">
          <div className="w-72 space-y-2 border-t-2 border-slate-900 pt-4 text-slate-800">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax / GST (8%):</span>
              <span className="font-mono font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Express Shipping:</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-black text-slate-900">
              <span>TOTAL PAID:</span>
              <span className="font-mono">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Corporate Footer & Guarantee */}
        <div className="mt-12 border-t border-slate-300 pt-6 flex justify-between items-end">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck size={16} className="text-lime-600" /> Authorized Official Voltra Invoice
            </div>
            <p className="text-[10px] text-slate-500">
              Thank you for shopping with Voltra. For questions or warranty claims, contact support@voltra.com.
            </p>
          </div>

          <div className="text-right border-t border-dashed border-slate-400 pt-2 w-48">
            <p className="font-script text-sm font-bold italic text-slate-800">Voltra Digital Signature</p>
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Authorized Billing Seal</p>
          </div>
        </div>
      </div>
    </>
  );
}
