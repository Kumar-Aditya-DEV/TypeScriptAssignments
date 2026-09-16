import { BillResult, CartItem, Customer, Payment } from "./types";
import { calculateSubtotal } from "./cart";
import { processPayment } from "./payment";

// Detailed breakdown of applied discounts
export interface DiscountBreakdown {
    membershipDiscount: number;
    bulkDiscount: number;
    totalDiscount: number;
}

// Calculate discounts based on customer membership and subtotal amount
export function calculateDiscount(customer: Customer, subtotal: number): DiscountBreakdown {
    let membershipPercentage = 0;

    // Step 1: Member discount check
    if (customer.type === "member") {
        membershipPercentage = customer.discountPercentage;
    }

    const membershipDiscount = (subtotal * membershipPercentage) / 100;

    // Step 2: Additional 5% bulk discount if subtotal exceeds ₹2000
    let bulkDiscount = 0;
    if (subtotal > 2000) {
        bulkDiscount = (subtotal * 5) / 100;
    }

    const totalDiscount = membershipDiscount + bulkDiscount;

    return {
        membershipDiscount: membershipDiscount,
        bulkDiscount: bulkDiscount,
        totalDiscount: totalDiscount
    };
}

// Calculate 5% GST tax on subtotal after applying discounts
export function calculateTax(subtotalAfterDiscount: number): number {
    return (subtotalAfterDiscount * 5) / 100;
}

// Calculate final payable amount (Subtotal after discount + GST)
export function calculateFinalAmount(subtotalAfterDiscount: number, gst: number): number {
    return subtotalAfterDiscount + gst;
}

// Generate the final bill after processing calculations and payment validation
export function generateBill(
    orderId: number,
    customer: Customer,
    items: CartItem[],
    payment: Payment
): BillResult {
    // Check if cart is empty
    if (items.length === 0) {
        return {
            status: "error",
            message: "Cannot generate bill for an empty cart."
        };
    }

    // Step 1: Calculate subtotal
    const subtotal = calculateSubtotal(items);

    // Step 2: Calculate discounts
    const discounts = calculateDiscount(customer, subtotal);
    const subtotalAfterDiscount = subtotal - discounts.totalDiscount;

    // Step 3: Calculate tax (GST 5%)
    const gst = calculateTax(subtotalAfterDiscount);

    // Step 4: Calculate final total
    const finalAmount = calculateFinalAmount(subtotalAfterDiscount, gst);

    // Step 5: Process payment validation
    const paymentResult = processPayment(payment, finalAmount);
    if (!paymentResult.success) {
        return {
            status: "error",
            message: `Payment failed: ${paymentResult.message}`
        };
    }

    // Return bill result
    return {
        status: "success",
        orderId: orderId,
        customer: customer,
        items: items,
        subtotal: subtotal,
        membershipDiscount: discounts.membershipDiscount,
        bulkDiscount: discounts.bulkDiscount,
        totalDiscount: discounts.totalDiscount,
        subtotalAfterDiscount: subtotalAfterDiscount,
        gst: gst,
        finalAmount: finalAmount,
        payment: payment,
        orderStatus: "confirmed"
    };
}

