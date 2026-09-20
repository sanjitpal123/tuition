import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import {
  ArrowLeft,
  Search,
  Phone,
  MessageCircle,
  IndianRupee,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Users,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { CollectPaymentModal } from "../components/fees/CollectPaymentModal";

function getInitials(name) {
  if (!name) return "ST";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function OverdueStudents() {
  const navigate = useNavigate();
  const { unpaidStudents, batches, recordFeePayment } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [collectingStudent, setCollectingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter overdue students
  const filteredOverdue = useMemo(() => {
    if (!Array.isArray(unpaidStudents)) return [];

    return unpaidStudents.filter((student) => {
      const nameMatch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone?.includes(searchTerm) ||
        student.parentName?.toLowerCase().includes(searchTerm.toLowerCase());

      let batchName = "General";
      if (student.batchId) {
        batchName =
          typeof student.batchId === "object"
            ? student.batchId.name
            : student.batchName || "General";
      }

      const batchMatch =
        selectedBatch === "All" || batchName === selectedBatch;

      return nameMatch && batchMatch;
    });
  }, [unpaidStudents, searchTerm, selectedBatch]);

  // Total pending amount calculation
  const totalOverdueAmount = useMemo(() => {
    return filteredOverdue.reduce((sum, s) => {
      const pending =
        s.feeStatus?.pendingAmount ||
        s.feeStatus?.balance ||
        s.monthlyFee ||
        s.fees ||
        0;
      return sum + Math.abs(pending);
    }, 0);
  }, [filteredOverdue]);

  const handleCollectSubmit = async (paymentData) => {
    setIsSubmitting(true);
    try {
      await recordFeePayment({
        ...paymentData,
        batchId: collectingStudent?.batchId?._id || collectingStudent?.batchId || paymentData.batchId,
        month: paymentData.month || selectedMonth || new Date().toISOString().slice(0, 7)
      });
      setCollectingStudent(null);
    } catch (err) {
      console.error("Failed to record payment", err);
      alert("Failed to record payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWhatsAppLink = (student, pendingAmount) => {
    const rawPhone = student.parentPhone || student.phone;
    if (!rawPhone) return "#";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const message = encodeURIComponent(
      `Hello ${student.parentName || student.name}, this is a gentle reminder regarding the overdue tuition fee for ${student.name}. The pending balance is ₹${pendingAmount}. Kindly settle it at your earliest convenience. Thank you!`
    );
    return `https://wa.me/${formattedPhone}?text=${message}`;
  };

  return (
    <div className="min-h-screen pb-24 pt-1 px-3 sm:px-6 max-w-4xl mx-auto space-y-4 font-sans select-none">
      {/* App Top Bar */}
      <div className="flex items-center justify-between gap-3 py-1">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/fees")}
            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-all active:scale-95 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-700/50"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Overdue Defaulters
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {unpaidStudents?.length || 0}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Students with unpaid multi-cycle dues
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/fees")}
          className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/60 dark:border-zinc-700/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Fee Records</span>
        </button>
      </div>

      {/* Hero Stat Banner (Mobile Glass Card) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/70 via-zinc-900 to-zinc-950 border border-rose-500/30 p-4 sm:p-5 shadow-xl shadow-rose-950/30">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400/90">
                Total Overdue Defaulter Dues
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight mt-0.5">
                ₹{totalOverdueAmount.toLocaleString("en-IN")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-500/20 text-xs">
            <div className="bg-zinc-900/80 rounded-xl px-3 py-1.5 border border-zinc-800 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold text-zinc-200">
                {filteredOverdue.length} Student{filteredOverdue.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by student, parent name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 shadow-sm transition-all"
        />
      </div>

      {/* Batch Filter Horizontal Scrollable Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedBatch("All")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
            selectedBatch === "All"
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
              : "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          All Batches
        </button>
        {batches?.map((b) => (
          <button
            type="button"
            key={b._id || b.id}
            onClick={() => setSelectedBatch(b.name)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 active:scale-95 ${
              selectedBatch === b.name
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md"
                : "bg-zinc-100 dark:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Defaulter Student List */}
      {filteredOverdue.length === 0 ? (
        <div className="p-10 text-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 my-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-heading font-bold text-zinc-900 dark:text-white">
            No Overdue Defaulters
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            {searchTerm || selectedBatch !== "All"
              ? "No overdue students matched your active filters."
              : "All student tuition fee balances are up to date."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOverdue.map((student) => {
            const studentId = student._id || student.id;
            const overdueMonths =
              student.feeStatus?.overdueMonths ||
              (student.feeStatus?.status === "Overdue" ? 1 : 0);

            const pendingAmount = Math.abs(
              student.feeStatus?.pendingAmount ||
                student.feeStatus?.balance ||
                student.fees ||
                0
            );

            const monthlyFee = student.fees || student.feeStatus?.monthlyFee || 0;
            const batchName =
              typeof student.batchId === "object"
                ? student.batchId?.name
                : student.batchName || "General";

            const whatsappUrl = getWhatsAppLink(student, pendingAmount);
            const parentContact = student.parentPhone || student.phone;

            return (
              <div
                key={studentId}
                className="bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-rose-500/25 dark:border-rose-500/20 p-4 shadow-md shadow-black/5 dark:shadow-black/30 transition-all hover:border-rose-500/40 space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    onClick={() => navigate(`/students/${studentId}`)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1"
                  >
                    <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 font-heading font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {getInitials(student.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-sm font-heading font-bold text-zinc-900 dark:text-white truncate group-hover:text-rose-500 transition-colors">
                          {student.name}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          {overdueMonths > 0
                            ? `${overdueMonths} Month${overdueMonths > 1 ? "s" : ""} Overdue`
                            : "Overdue"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium truncate">
                        {batchName} · Fee: ₹{monthlyFee}/mo
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/students/${studentId}`)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex-shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount & Parent Dues Row */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200/60 dark:border-zinc-700/40 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      Total Overdue Dues
                    </span>
                    <p className="text-lg font-heading font-black text-rose-600 dark:text-rose-400">
                      ₹{pendingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>

                  {student.parentName && (
                    <div className="text-right min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                        Parent Contact
                      </span>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">
                        {student.parentName}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile Touch Bar Actions */}
                <div className="flex items-center gap-2 pt-0.5">
                  {/* Collect Fee Button */}
                  <button
                    type="button"
                    onClick={() => setCollectingStudent(student)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition-all text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Collect Fee</span>
                  </button>

                  {/* WhatsApp Reminder Button */}
                  {parentContact && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-500" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  {/* Call Button */}
                  {parentContact && (
                    <a
                      href={`tel:${parentContact}`}
                      className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 flex items-center justify-center flex-shrink-0 border border-zinc-200/60 dark:border-zinc-700/50"
                      title="Call Parent"
                    >
                      <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Collect Fee Modal */}
      {collectingStudent && (
        <CollectPaymentModal
          student={collectingStudent}
          onClose={() => setCollectingStudent(null)}
          onConfirm={handleCollectSubmit}
          onSubmit={handleCollectSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
