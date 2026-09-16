import { FoodItem } from "./types";

// Initial menu containing at least 8 food items
export const foodMenu: FoodItem[] = [
    { id: 1, name: "Margherita Pizza", category: "pizza", price: 499, isAvailable: true },
    { id: 2, name: "Farmhouse Pizza", category: "pizza", price: 699, isAvailable: true },
    { id: 3, name: "Veg Cheese Burger", category: "burger", price: 199, isAvailable: true },
    { id: 4, name: "Chicken Crispy Burger", category: "burger", price: 299, isAvailable: true },
    { id: 5, name: "Cold Coffee", category: "drink", price: 149, isAvailable: true },
    { id: 6, name: "Fresh Lime Soda", category: "drink", price: 99, isAvailable: true },
    { id: 7, name: "Chocolate Lava Cake", category: "dessert", price: 249, isAvailable: true },
    { id: 8, name: "Vanilla Ice Cream", category: "dessert", price: 120, isAvailable: false }
];

// Returns all available food items
export function getFoodMenu(): FoodItem[] {
    return foodMenu;
}

// Find a food item by its ID using a standard for...of loop
export function findFoodById(id: number): FoodItem | undefined {
    for (const food of foodMenu) {
        if (food.id === id) {
            return food;
        }
    }
    return undefined;
}

// Search food items by name or category using a simple for...of loop
export function searchFoodItems(query: string): FoodItem[] {
    const lowerQuery = query.toLowerCase();
    const results: FoodItem[] = [];

    for (const food of foodMenu) {
        const matchesName = food.name.toLowerCase().includes(lowerQuery);
        const matchesCategory = food.category.toLowerCase().includes(lowerQuery);

        if (matchesName || matchesCategory) {
            results.push(food);
        }
    }

    return results;
}

