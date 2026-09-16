import { Payment } from "./types";

// Validate and process payment based on payment method (Cash, Card, or UPI)
export function processPayment(
    payment: Payment,
    finalAmount: number
): { success: boolean; message: string } {
    // 1. Handle Cash Payment
    if (payment.method === "cash") {
        if (payment.receivedAmount < finalAmount) {
            return {
                success: false,
                message: `Insufficient cash received! Needed ₹${finalAmount}, but got ₹${payment.receivedAmount}.`
            };
        }
        const change = payment.receivedAmount - finalAmount;
        return {
            success: true,
            message: `Cash payment successful. Change returned: ₹${change.toFixed(2)}.`
        };
    }
    
    // 2. Handle Card Payment
    if (payment.method === "card") {
        if (payment.last4Digits.length !== 4) {
            return {
                success: false,
                message: "Invalid card number! Must provide last 4 digits."
            };
        }
        return {
            success: true,
            message: `Card payment of ₹${finalAmount.toFixed(2)} processed successfully (Card ending in ${payment.last4Digits}).`
        };
    }
    
    // 3. Handle UPI Payment
    if (payment.method === "upi") {
        if (!payment.transactionId) {
            return {
                success: false,
                message: "Invalid UPI transaction ID!"
            };
        }
        return {
            success: true,
            message: `UPI payment of ₹${finalAmount.toFixed(2)} completed (Txn ID: ${payment.transactionId}).`
        };
    }

    return {
        success: false,
        message: "Unknown payment method."
    };
}

