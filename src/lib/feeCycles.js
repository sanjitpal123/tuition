import { format, isValid } from 'date-fns';

/**
 * Calculates a student's billing cycle, due date, and payment status based on their admission date.
 * E.g., if a student joined on 14 August:
 * - 1st Cycle: 14 Aug to 13 Sep (Due: 14 Aug)
 * - 2nd Cycle: 14 Sep to 13 Oct (Due: 14 Sep)
 * Before 14 Sep (e.g. 10 Sep), if month 1 is paid, next fee is not pending until 14 Sep.
 */
export function getStudentBillingCycle(student, feePayments = [], asOfDate = new Date()) {
  if (!student) return null;

  const monthlyFee = Number(student.monthlyFee || student.fees || 0);
  
  // Parse admission date or fallback to student's created date or today
  let admissionDate = student.admissionDate ? new Date(student.admissionDate) : (student.createdAt ? new Date(student.createdAt) : new Date());
  if (!isValid(admissionDate)) {
    admissionDate = new Date();
  }

  const joinDay = admissionDate.getDate(); // e.g. 14
  
  const currentYear = asOfDate.getFullYear();
  const currentMonth = asOfDate.getMonth(); // 0-indexed
  const currentDay = asOfDate.getDate();

  let cycleStartDate;
  let nextDueDate;

  if (currentDay >= joinDay) {
    // Current cycle started this month on joinDay
    cycleStartDate = new Date(currentYear, currentMonth, joinDay);
    nextDueDate = new Date(currentYear, currentMonth + 1, joinDay);
  } else {
    // Current cycle started last month on joinDay
    cycleStartDate = new Date(currentYear, currentMonth - 1, joinDay);
    nextDueDate = new Date(currentYear, currentMonth, joinDay);
  }

  // Calculate total monthly cycles from admission up to current active cycle
  const diffMonths = (cycleStartDate.getFullYear() - admissionDate.getFullYear()) * 12 + 
                     (cycleStartDate.getMonth() - admissionDate.getMonth());
  const totalMonthsPassed = Math.max(1, diffMonths + 1);

  const totalFeeExpectedToDate = totalMonthsPassed * monthlyFee;

  // Filter payments for this student
  const sId = student._id || student.id;
  const studentPayments = feePayments.filter(p => {
    const pStudentId = p.studentId?._id || p.studentId;
    return pStudentId === sId;
  });

  const totalPaidAllTime = studentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Overall balance relative to expected cycles to date
  const balance = totalPaidAllTime - totalFeeExpectedToDate;
  
  let status = 'Paid';
  let badgeVariant = 'success';
  let remainingAmount = 0;
  let extraAmount = 0;

  if (monthlyFee > 0) {
    if (balance < 0) {
      status = 'Pending';
      remainingAmount = Math.abs(balance);
      badgeVariant = 'warning';
    } else if (balance > 0) {
      status = 'Extra';
      extraAmount = balance;
      badgeVariant = 'success';
    } else {
      status = 'Paid';
      badgeVariant = 'success';
    }
  }

  // Calculate the next due date based on payment status:
  // If the current cycle is already Paid or has Extra credit, the next unpaid fee is due for the NEXT cycle!
  // E.g. if cycle 21 Aug - 20 Sep is paid, next fee is due on 21 Oct (for cycle 21 Sep - 20 Oct).
  // If pending, the due date remains for the unpaid cycle (21 Sep).
  let finalNextDueDate;
  let finalCycleStartDate = cycleStartDate;
  let finalCycleEndDate;

  if (monthlyFee > 0) {
    const cyclesPaid = Math.floor(totalPaidAllTime / monthlyFee);
    if (balance >= 0 && totalPaidAllTime > 0) {
      // Current cycle is settled. Next due date is for the upcoming unpaid cycle
      const nextCycleOffset = Math.max(totalMonthsPassed + 1, cyclesPaid + 1);
      finalNextDueDate = new Date(admissionDate.getFullYear(), admissionDate.getMonth() + nextCycleOffset, joinDay);
      
      const activeCoveredCycleStart = new Date(admissionDate.getFullYear(), admissionDate.getMonth() + Math.max(0, cyclesPaid - 1), joinDay);
      const activeCoveredCycleEnd = new Date(admissionDate.getFullYear(), admissionDate.getMonth() + cyclesPaid, joinDay);
      finalCycleStartDate = activeCoveredCycleStart;
      finalCycleEndDate = new Date(activeCoveredCycleEnd.getTime() - 24 * 60 * 60 * 1000);
    } else {
      // Pending balance on current cycle
      finalNextDueDate = nextDueDate;
      finalCycleEndDate = new Date(nextDueDate.getTime() - 24 * 60 * 60 * 1000);
    }
  } else {
    finalNextDueDate = nextDueDate;
    finalCycleEndDate = new Date(nextDueDate.getTime() - 24 * 60 * 60 * 1000);
  }

  // If student joined in future or today is before first cycle due date
  const isNewlyAdmittedBeforeDue = asOfDate < admissionDate;

  return {
    monthlyFee,
    joinDay,
    admissionDate,
    admissionDateFormatted: format(admissionDate, 'dd MMM yyyy'),
    cycleStartDate: finalCycleStartDate,
    cycleStartFormatted: format(finalCycleStartDate, 'dd MMM yyyy'),
    nextDueDate: finalNextDueDate,
    nextDueDateFormatted: format(finalNextDueDate, 'dd MMM yyyy'),
    cycleEndFormatted: format(finalCycleEndDate, 'dd MMM yyyy'),
    totalMonthsPassed,
    totalFeeExpectedToDate,
    totalPaidAllTime,
    balance,
    remainingAmount,
    extraAmount,
    status, // 'Paid' | 'Pending' | 'Extra'
    badgeVariant,
    isNewlyAdmittedBeforeDue,
    studentPayments
  };
}
