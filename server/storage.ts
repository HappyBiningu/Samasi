import { users, invoices, type User, type InsertUser, type Invoice, type InsertInvoice, type BankDetails } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getAllInvoices(): Promise<Invoice[]>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private invoices: Map<number, Invoice>;
  userCurrentId: number;
  invoiceCurrentId: number;

  constructor() {
    this.users = new Map();
    this.invoices = new Map();
    this.userCurrentId = 1;
    this.invoiceCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Invoice methods
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceCurrentId++;
    const now = new Date();
    const invoice: Invoice = { 
      id,
      invoiceNumber: insertInvoice.invoiceNumber,
      invoiceDate: insertInvoice.invoiceDate,
      clientName: insertInvoice.clientName,
      clientRegNumber: insertInvoice.clientRegNumber,
      clientVatNumber: insertInvoice.clientVatNumber,
      lineItems: insertInvoice.lineItems as any, // Type assertion for in-memory storage
      bankDetails: insertInvoice.bankDetails ? (insertInvoice.bankDetails as any) : null,
      subtotal: insertInvoice.subtotal,
      vat: insertInvoice.vat,
      total: insertInvoice.total,
      status: insertInvoice.status || "unpaid",
      lastReminderSent: insertInvoice.lastReminderSent || null,
      reminderCount: insertInvoice.reminderCount || 0,
      dueDate: insertInvoice.dueDate || null,
      createdAt: now 
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort((a, b) => b.id - a.id);
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;

    const updatedInvoice: Invoice = {
      ...existingInvoice,
      ...invoiceUpdate,
      lineItems: invoiceUpdate.lineItems ? (invoiceUpdate.lineItems as any) : existingInvoice.lineItems,
      bankDetails: invoiceUpdate.bankDetails !== undefined ? (invoiceUpdate.bankDetails as any) : existingInvoice.bankDetails
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Invoice methods
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values(insertInvoice as any) // Type assertion for jsonb fields
      .returning();
    return invoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async updateInvoice(id: number, invoiceUpdate: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [invoice] = await db
      .update(invoices)
      .set(invoiceUpdate as any) // Type assertion for jsonb fields
      .where(eq(invoices.id, id))
      .returning();
    return invoice || undefined;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return (result.count || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
