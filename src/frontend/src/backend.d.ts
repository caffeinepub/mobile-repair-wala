import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Product {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addToCart(productId: string): Promise<void>;
    clearCart(): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCartContents(): Promise<Array<Product>>;
    removeFromCart(productId: string): Promise<void>;
}
