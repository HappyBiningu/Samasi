import { users, type User, type InsertUser, type Invoice, type InsertInvoice } from "@shared/schema";

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
      lineItems: invoiceUpdate.lineItems ? (invoiceUpdate.lineItems as any) : existingInvoice.lineItems
    };
    
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

export const storage = new MemStorage();
