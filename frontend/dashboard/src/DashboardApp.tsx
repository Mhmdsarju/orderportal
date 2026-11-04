import React, { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@orderportal/shared-store";
import { API_BASE_URL } from "@orderportal/shared-store/api";

interface Order {
  id: string;
  item: string;
  quantity: number;
  price: string;
  status: string;
  createdAt: string;
}

interface ApiError {
  message: string;
}

export default function DashboardApp(): React.JSX.Element {
  const token = useSelector(selectToken);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);

  const loadOrders = useCallback(async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await response.json()) as Order[] | ApiError;

      if (!response.ok) {
        throw new Error(
          "message" in data ? data.message : "Unable to load orders",
        );
      }

      setOrders(data as Order[]);
      setError("");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Request failed");
    }
  }, [token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function createOrder(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item, quantity, price }),
      });
      const data = (await response.json()) as ApiError;

      if (!response.ok)
        throw new Error(data.message ?? "Unable to create order");

      setItem("");
      setQuantity(1);
      setPrice(0);
      await loadOrders();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Request failed");
    }
  }

  return (
    <section>
      <h1>Dashboard</h1>
      <p>Your orders</p>

      <form onSubmit={createOrder}>
        <label htmlFor="order-item">Item</label>
        <input
          id="order-item"
          required
          value={item}
          onChange={(event) => setItem(event.target.value)}
        />

        <label htmlFor="order-quantity">Quantity</label>
        <input
          id="order-quantity"
          type="number"
          min="1"
          required
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />

        <label htmlFor="order-price">Unit price</label>
        <input
          id="order-price"
          type="number"
          min="0"
          step="0.01"
          required
          value={price}
          onChange={(event) => setPrice(Number(event.target.value))}
        />

        <button type="submit">Create order</button>
      </form>

      {error && <p className="error">{error}</p>}
      <button type="button" onClick={() => void loadOrders()}>
        Refresh orders
      </button>

      {orders.map((order) => (
        <article className="card" key={order.id}>
          <strong>{order.item}</strong>
          <p>
            Quantity: {order.quantity} · Price: {order.price} · Status:{" "}
            {order.status}
          </p>
          <small>{new Date(order.createdAt).toLocaleString()}</small>
        </article>
      ))}

      {orders.length === 0 && !error && <p>No orders yet.</p>}
    </section>
  );
}
