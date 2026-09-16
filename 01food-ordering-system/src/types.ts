// Food category options
export type FoodCategory = "pizza" | "burger" | "drink" | "dessert";

// Represents a single menu item
export interface FoodItem {
    id: number;
    name: string;
    category: FoodCategory;
    price: number;
    isAvailable: boolean;
}

// Membership levels for registered customers
export type MembershipLevel = "silver" | "gold" | "platinum";

// Guest customer format
export interface GuestCustomer {
    type: "guest";
    id: number;
    name: string;
}

// Member customer format with membership details
export interface MemberCustomer {
    type: "member";
    id: number;
    name: string;
    membershipId: string;
    discountPercentage: number;
    membershipLevel: MembershipLevel;
}

// Customer can be either Guest or Member
export type Customer = GuestCustomer | MemberCustomer;

// Represents an item added to the shopping cart with its quantity
export type CartItem = {
    foodItem: FoodItem;
    quantity: number;
};

// Possible statuses for an order
export type OrderStatus = "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";

// Payment method structures
export interface CashPayment {
    method: "cash";
    receivedAmount: number;
}

export interface CardPayment {
    method: "card";
    last4Digits: string;
}

export interface UpiPayment {
    method: "upi";
    transactionId: string;
}

// Payment union type
export type Payment = CashPayment | CardPayment | UpiPayment;

// Bill result returned after processing order checkout
export type BillResult =
    | {
          status: "success";
          orderId: number;
          customer: Customer;
          items: CartItem[];
          subtotal: number;
          membershipDiscount: number;
          bulkDiscount: number;
          totalDiscount: number;
          subtotalAfterDiscount: number;
          gst: number;
          finalAmount: number;
          payment: Payment;
          orderStatus: OrderStatus;
      }
    | {
          status: "error";
          message: string;
      };

