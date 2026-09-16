import * as readline from "readline";
import { BillResult, CartItem, Customer, MembershipLevel, OrderStatus, Payment } from "./types";
import { findFoodById, getFoodMenu, searchFoodItems } from "./data";
import { createGuestCustomer, createMemberCustomer } from "./customer";
import { addToCart, calculateSubtotal, removeFromCart, updateQuantity } from "./cart";
import { calculateDiscount, calculateFinalAmount, calculateTax, generateBill } from "./billing";
import { printFinalOrder, updateOrderStatus } from "./order";

// Setup Readline Interface for Terminal Input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to prompt user and get input via Promise
function askQuestion(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, (answer: string) => {
            resolve(answer.trim());
        });
    });
}

// Global state for application session
let cart: CartItem[] = [];
let currentCustomer: Customer = createGuestCustomer(1, "Guest Customer");
let lastBillResult: BillResult | null = null;

function getCartItemCount(): number {
    let totalCount = 0;
    for (const item of cart) {
        totalCount += item.quantity;
    }
    return totalCount;
}

// Display Main Menu
function displayMenu(): void {
    console.log("\n=================================");
    console.log("      FOOD ORDERING SYSTEM       ");
    console.log("=================================");
    console.log(`Current Customer: ${currentCustomer.name} (${currentCustomer.type.toUpperCase()})`);
    console.log(`Cart Items: ${getCartItemCount()} items`);
    console.log("---------------------------------");
    console.log("1. View Food Menu");
    console.log("2. Create Customer");
    console.log("3. Add Item to Cart");
    console.log("4. View Cart");
    console.log("5. Update Quantity");
    console.log("6. Remove Item");
    console.log("7. Checkout");
    console.log("8. Change Order Status");
    console.log("9. Search Food Menu (Extra Feature)");
    console.log("10. Exit");
    console.log("=================================\n");
}

// 1. View Menu
function handleViewMenu(): void {
    console.log("\n--- FOOD MENU ---");
    const menu = getFoodMenu();
    for (let i = 0; i < menu.length; i++) {
        const item = menu[i];
        const availability = item.isAvailable ? "Available" : "OUT OF STOCK";
        console.log(`[${item.id}] ${item.name} (${item.category}) - ₹${item.price} [${availability}]`);
    }
}

// 2. Create Customer
async function handleCreateCustomer(): Promise<void> {
    console.log("\n--- CREATE / SELECT CUSTOMER ---");
    console.log("1. Guest Customer");
    console.log("2. Member Customer");
    const choice = await askQuestion("Select Customer Type (1-2): ");

    const name = await askQuestion("Enter Customer Name: ");
    if (!name) {
        console.log("Customer name cannot be empty!");
        return;
    }

    if (choice === "1") {
        currentCustomer = createGuestCustomer(Date.now(), name);
        console.log(`Customer set to Guest: ${currentCustomer.name}`);
    } else if (choice === "2") {
        const memId = await askQuestion("Enter Membership ID (e.g. MEM101): ");
        console.log("Select Membership Level:");
        console.log("1. Silver (5% discount)");
        console.log("2. Gold (10% discount)");
        console.log("3. Platinum (15% discount)");
        const levelChoice = await askQuestion("Choice (1-3): ");

        let level: MembershipLevel = "silver";
        if (levelChoice === "2") level = "gold";
        if (levelChoice === "3") level = "platinum";

        currentCustomer = createMemberCustomer(Date.now(), name, memId || "MEM100", level);
        console.log(
            `Member Created! ${currentCustomer.name} - Level: ${level.toUpperCase()} (${currentCustomer.discountPercentage}% Discount)`
        );
    } else {
        console.log("Invalid selection!");
    }
}

// 3. Add Item to Cart
async function handleAddToCart(): Promise<void> {
    handleViewMenu();
    const idInput = await askQuestion("\nEnter Food Item ID to add: ");
    const foodId = parseInt(idInput);

    if (isNaN(foodId)) {
        console.log("Invalid ID entered!");
        return;
    }

    const foodItem = findFoodById(foodId);
    if (!foodItem) {
        console.log("Food item not found!");
        return;
    }

    if (!foodItem.isAvailable) {
        console.log(`Sorry, ${foodItem.name} is currently out of stock!`);
        return;
    }

    const qtyInput = await askQuestion("Enter Quantity: ");
    const quantity = parseInt(qtyInput);

    if (isNaN(quantity) || quantity <= 0) {
        console.log("Quantity must be a positive number!");
        return;
    }

    cart = addToCart(cart, foodItem, quantity);
    console.log(`Added ${quantity} x ${foodItem.name} to cart.`);
}

// 4. View Cart
function handleViewCart(): void {
    console.log("\n--- YOUR CART ---");
    if (cart.length === 0) {
        console.log("Your cart is empty.");
        return;
    }

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        const itemTotal = item.foodItem.price * item.quantity;
        console.log(
            `${i + 1}. [ID: ${item.foodItem.id}] ${item.foodItem.name} x ${item.quantity} = ₹${itemTotal}`
        );
    }

    const subtotal = calculateSubtotal(cart);
    const discounts = calculateDiscount(currentCustomer, subtotal);
    const subtotalAfterDiscount = subtotal - discounts.totalDiscount;
    const gst = calculateTax(subtotalAfterDiscount);
    const finalAmount = calculateFinalAmount(subtotalAfterDiscount, gst);

    console.log("---------------------------------");
    console.log(`Subtotal                 : ₹${subtotal.toFixed(2)}`);
    console.log(`Estimated Discounts      : -₹${discounts.totalDiscount.toFixed(2)}`);
    console.log(`Estimated GST (5%)       : +₹${gst.toFixed(2)}`);
    console.log(`Estimated Total          : ₹${finalAmount.toFixed(2)}`);
}

// 5. Update Quantity
async function handleUpdateQuantity(): Promise<void> {
    handleViewCart();
    if (cart.length === 0) return;

    const idInput = await askQuestion("\nEnter Food Item ID to update quantity: ");
    const foodId = parseInt(idInput);

    if (isNaN(foodId)) {
        console.log("Invalid Item ID!");
        return;
    }

    const qtyInput = await askQuestion("Enter new Quantity (0 to remove): ");
    const newQty = parseInt(qtyInput);

    if (isNaN(newQty) || newQty < 0) {
        console.log("Invalid quantity entered!");
        return;
    }

    cart = updateQuantity(cart, foodId, newQty);
    console.log("Cart quantity updated.");
}

// 6. Remove Item
async function handleRemoveItem(): Promise<void> {
    handleViewCart();
    if (cart.length === 0) return;

    const idInput = await askQuestion("\nEnter Food Item ID to remove: ");
    const foodId = parseInt(idInput);

    if (isNaN(foodId)) {
        console.log("Invalid Item ID!");
        return;
    }

    cart = removeFromCart(cart, foodId);
    console.log("Item removed from cart.");
}

// 7. Checkout
async function handleCheckout(): Promise<void> {
    if (cart.length === 0) {
        console.log("Cannot checkout with an empty cart!");
        return;
    }

    handleViewCart();

    const subtotal = calculateSubtotal(cart);
    const discounts = calculateDiscount(currentCustomer, subtotal);
    const subtotalAfterDiscount = subtotal - discounts.totalDiscount;
    const gst = calculateTax(subtotalAfterDiscount);
    const finalAmount = calculateFinalAmount(subtotalAfterDiscount, gst);

    console.log(`\nFinal Amount to Pay: ₹${finalAmount.toFixed(2)}`);
    console.log("\nSelect Payment Method:");
    console.log("1. Cash");
    console.log("2. Card");
    console.log("3. UPI");
    const payChoice = await askQuestion("Choice (1-3): ");

    let payment: Payment;

    if (payChoice === "1") {
        const cashInput = await askQuestion(`Enter Cash Amount Received (min ₹${finalAmount.toFixed(2)}): `);
        const amount = parseFloat(cashInput);
        payment = {
            method: "cash",
            receivedAmount: isNaN(amount) ? 0 : amount
        };
    } else if (payChoice === "2") {
        const last4 = await askQuestion("Enter Card Last 4 Digits: ");
        payment = {
            method: "card",
            last4Digits: last4
        };
    } else if (payChoice === "3") {
        const txnId = await askQuestion("Enter UPI Transaction ID: ");
        payment = {
            method: "upi",
            transactionId: txnId
        };
    } else {
        console.log("Invalid payment method selected!");
        return;
    }

    const orderId = Math.floor(Math.random() * 9000) + 1000;
    const billResult = generateBill(orderId, currentCustomer, cart, payment);
    lastBillResult = billResult;

    if (billResult.status === "success") {
        printFinalOrder(billResult);
        cart = []; // Reset cart after successful checkout
    } else {
        console.log(`\nCheckout Failed: ${billResult.message}`);
    }
}

// 8. Change Order Status
async function handleChangeOrderStatus(): Promise<void> {
    if (!lastBillResult || lastBillResult.status === "error") {
        console.log("No active completed order to update status for!");
        return;
    }

    console.log(`Current Order #${lastBillResult.orderId} Status: ${lastBillResult.orderStatus.toUpperCase()}`);
    console.log("Select New Status:");
    console.log("1. confirmed");
    console.log("2. preparing");
    console.log("3. delivered");
    console.log("4. cancelled");
    const choice = await askQuestion("Choice (1-4): ");

    let newStatus: OrderStatus = lastBillResult.orderStatus;
    if (choice === "1") newStatus = "confirmed";
    if (choice === "2") newStatus = "preparing";
    if (choice === "3") newStatus = "delivered";
    if (choice === "4") newStatus = "cancelled";

    lastBillResult.orderStatus = updateOrderStatus(lastBillResult.orderStatus, newStatus);
}

// 9. Search Food Items (Extra Feature)
async function handleSearchFood(): Promise<void> {
    const query = await askQuestion("\nEnter search keyword (name or category like 'pizza', 'drink'): ");
    const results = searchFoodItems(query);

    console.log(`\n--- SEARCH RESULTS FOR "${query}" ---`);
    if (results.length === 0) {
        console.log("No matching food items found.");
        return;
    }

    for (let i = 0; i < results.length; i++) {
        const item = results[i];
        const availability = item.isAvailable ? "Available" : "OUT OF STOCK";
        console.log(`[${item.id}] ${item.name} (${item.category}) - ₹${item.price} [${availability}]`);
    }
}

// Main App Controller Loop
async function main(): Promise<void> {
    let running = true;

    while (running) {
        displayMenu();
        const choice = await askQuestion("Enter menu option (1-10): ");

        switch (choice) {
            case "1":
                handleViewMenu();
                break;
            case "2":
                await handleCreateCustomer();
                break;
            case "3":
                await handleAddToCart();
                break;
            case "4":
                handleViewCart();
                break;
            case "5":
                await handleUpdateQuantity();
                break;
            case "6":
                await handleRemoveItem();
                break;
            case "7":
                await handleCheckout();
                break;
            case "8":
                await handleChangeOrderStatus();
                break;
            case "9":
                await handleSearchFood();
                break;
            case "10":
                console.log("\nThank you for using Food Ordering System! Goodbye.\n");
                running = false;
                rl.close();
                break;
            default:
                console.log("Invalid option! Please enter a number between 1 and 10.");
                break;
        }
    }
}

// Start application
main();
