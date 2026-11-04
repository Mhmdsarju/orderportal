import type { Request, Response } from "express";
import { Prisma, OrderStatus } from "@prisma/client";
import prisma from "../config/prisma";
import { getUserMe } from "../grpc/userClient";
const validStatuses = Object.values(OrderStatus);
export async function createOrder(req: Request, res: Response): Promise<void> {
  const { item, quantity, price } = req.body as {
    item?: string;
    quantity?: number;
    price?: number;
  };
  if (
    !item?.trim() ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 1 ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    res
      .status(400)
      .json({
        message:
          "Item, positive integer quantity and non-negative price are required",
      });
    return;
  }
  const order = await prisma.order.create({
    data: {
      userId: req.user!.userId,
      item: item.trim(),
      quantity: Number(quantity),
      price: new Prisma.Decimal(Number(price).toFixed(2)),
    },
  });
  res.status(201).json(order);
}
export async function listOrders(req: Request, res: Response): Promise<void> {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}
export async function getOrder(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (order.userId !== req.user!.userId) {
    res.status(403).json({ message: "You do not own this order" });
    return;
  }
  res.json(order);
}
export async function updateOrder(req: Request, res: Response): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  const authorization = req.header("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  let callerRole: string;
  try {
    const caller = await getUserMe(req.user!.userId, token);
    callerRole = caller.role;
  } catch (error) {
    console.error("gRPC caller verification failed:", error);
    res
      .status(503)
      .json({ message: "Unable to verify caller with User Service" });
    return;
  }
  const isOwner = order.userId === req.user!.userId;
  const isAdmin = callerRole === "admin";
  if (!isOwner && !isAdmin) {
    res
      .status(403)
      .json({ message: "Only the owner or an admin can update this order" });
    return;
  }
  const { status } = req.body as { status?: OrderStatus };
  if (!status || !validStatuses.includes(status)) {
    res
      .status(400)
      .json({ message: `Status must be one of: ${validStatuses.join(", ")}` });
    return;
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status },
  });
  res.json(updated);
}
