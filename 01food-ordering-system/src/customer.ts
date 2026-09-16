import { Customer, GuestCustomer, MemberCustomer, MembershipLevel } from "./types";

// Creates a Guest Customer object
export function createGuestCustomer(id: number, name: string): GuestCustomer {
    return {
        type: "guest",
        id: id,
        name: name
    };
}

// Determines discount percentage based on membership tier: Silver (5%), Gold (10%), Platinum (15%)
export function getMembershipDiscountPercentage(level: MembershipLevel): number {
    if (level === "silver") {
        return 5;
    } else if (level === "gold") {
        return 10;
    } else if (level === "platinum") {
        return 15;
    }
    return 0;
}

// Creates a Member Customer object with calculated discount
export function createMemberCustomer(
    id: number,
    name: string,
    membershipId: string,
    level: MembershipLevel
): MemberCustomer {
    const discount = getMembershipDiscountPercentage(level);
    return {
        type: "member",
        id: id,
        name: name,
        membershipId: membershipId,
        membershipLevel: level,
        discountPercentage: discount
    };
}

