import { BillResult, OrderStatus } from "./types";

// Function to update and return new order status
export function updateOrderStatus(currentStatus: OrderStatus, newStatus: OrderStatus): OrderStatus {
    console.log(`Order status updated from "${currentStatus}" to "${newStatus}".`);
    return newStatus;
}

// Function to display the formatted final order information and receipt
export function printFinalOrder(billResult: BillResult): void {
    if (billResult.status === "error") {
        console.log("\n----------------------------------------");
        console.log("          ORDER ERROR");
        console.log("----------------------------------------");
        console.log(`Error: ${billResult.message}`);
        console.log("----------------------------------------\n");
        return;
    }

    // Type narrowing allows TypeScript to safely access success fields
    console.log("\n========================================");
    console.log("         FINAL ORDER INVOICE            ");
    console.log("========================================");
    console.log(`Order ID    : #${billResult.orderId}`);
    console.log(`Customer    : ${billResult.customer.name} (${billResult.customer.type.toUpperCase()})`);
    
    if (billResult.customer.type === "member") {
        console.log(`Membership  : ${billResult.customer.membershipLevel.toUpperCase()} (ID: ${billResult.customer.membershipId})`);
    }

    console.log("----------------------------------------");
    console.log("ITEMS ORDERED:");
    for (let i = 0; i < billResult.items.length; i++) {
        const item = billResult.items[i];
        const itemTotal = item.foodItem.price * item.quantity;
        console.log(
            ` ${i + 1}. ${item.foodItem.name} x ${item.quantity} @ ₹${item.foodItem.price} = ₹${itemTotal}`
        );
    }

    console.log("----------------------------------------");
    console.log(`Subtotal                 : ₹${billResult.subtotal.toFixed(2)}`);
    if (billResult.membershipDiscount > 0) {
        console.log(`Membership Discount      : -₹${billResult.membershipDiscount.toFixed(2)}`);
    }
    if (billResult.bulkDiscount > 0) {
        console.log(`Bulk Discount (Orders >2k): -₹${billResult.bulkDiscount.toFixed(2)}`);
    }
    console.log(`Total Discount           : -₹${billResult.totalDiscount.toFixed(2)}`);
    console.log(`Subtotal After Discount  : ₹${billResult.subtotalAfterDiscount.toFixed(2)}`);
    console.log(`GST (5%)                 : +₹${billResult.gst.toFixed(2)}`);
    console.log("----------------------------------------");
    console.log(`FINAL PAYABLE AMOUNT     : ₹${billResult.finalAmount.toFixed(2)}`);
    console.log("----------------------------------------");
    console.log(`Payment Method           : ${billResult.payment.method.toUpperCase()}`);
    console.log(`Order Status             : ${billResult.orderStatus.toUpperCase()}`);
    console.log("========================================\n");
}
