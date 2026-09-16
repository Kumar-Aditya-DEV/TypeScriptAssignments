import { CartItem, FoodItem } from "./types";

// Calculate total price for a single cart item (price * quantity)
export function calculateItemTotal(item: CartItem): number {
    return item.foodItem.price * item.quantity;
}

// Calculate total cost of all items in cart using a standard for...of loop
export function calculateSubtotal(cart: CartItem[]): number {
    let total = 0;
    for (const item of cart) {
        total += calculateItemTotal(item);
    }
    return total;
}

// Add an item to the cart or increase quantity if it's already in the cart
export function addToCart(cart: CartItem[], foodItem: FoodItem, quantity: number): CartItem[] {
    if (quantity <= 0) {
        return cart;
    }

    // Step 1: Check if the item is already in the cart
    for (const item of cart) {
        if (item.foodItem.id === foodItem.id) {
            item.quantity += quantity;
            return cart;
        }
    }

    // Step 2: If item is not in cart, add it as a new entry
    cart.push({
        foodItem: foodItem,
        quantity: quantity
    });

    return cart;
}

// Remove an item from cart using item ID
export function removeFromCart(cart: CartItem[], foodId: number): CartItem[] {
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].foodItem.id === foodId) {
            cart.splice(i, 1);
            break;
        }
    }
    return cart;
}

// Update the quantity of a specific item in the cart
export function updateQuantity(cart: CartItem[], foodId: number, quantity: number): CartItem[] {
    if (quantity <= 0) {
        return removeFromCart(cart, foodId);
    }

    for (const item of cart) {
        if (item.foodItem.id === foodId) {
            item.quantity = quantity;
            break;
        }
    }

    return cart;
}

