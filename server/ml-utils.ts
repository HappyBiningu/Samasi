import { Invoice } from "@shared/schema";

// ML utility functions for data processing and feature engineering
export class MLUtils {
  // Calculate days between two dates
  static daysBetween(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate payment velocity for a client (average days to pay)
  static calculatePaymentVelocity(invoices: Invoice[], clientName: string): number {
    const clientInvoices = invoices.filter(inv => 
      inv.clientName === clientName && inv.status === 'paid'
    );
    
    if (clientInvoices.length === 0) return 0;
    
    const paymentDays = clientInvoices.map(inv => {
      // Assume payment date is 30 days after invoice date for paid invoices
      const invoiceDate = new Date(inv.invoiceDate);
      const estimatedPaymentDate = new Date(invoiceDate);
      estimatedPaymentDate.setDate(estimatedPaymentDate.getDate() + 30);
      return this.daysBetween(inv.invoiceDate, estimatedPaymentDate.toISOString().split('T')[0]);
    });
    
    return paymentDays.reduce((sum, days) => sum + days, 0) / paymentDays.length;
  }

  // Extract features for ML models
  static extractFeatures(invoice: Invoice, allInvoices: Invoice[]) {
    const clientInvoices = allInvoices.filter(inv => inv.clientName === invoice.clientName);
    const clientHistory = clientInvoices.filter(inv => 
      new Date(inv.invoiceDate) < new Date(invoice.invoiceDate)
    );

    return {
      // Invoice features
      amount: invoice.total,
      amountLog: Math.log(invoice.total + 1),
      lineItemCount: invoice.lineItems.length,
      hasVat: invoice.vat > 0,
      
      // Client features
      clientInvoiceCount: clientHistory.length,
      clientTotalRevenue: clientHistory.reduce((sum, inv) => sum + inv.total, 0),
      clientAverageAmount: clientHistory.length > 0 
        ? clientHistory.reduce((sum, inv) => sum + inv.total, 0) / clientHistory.length 
        : 0,
      clientPaymentRate: clientHistory.length > 0
        ? clientHistory.filter(inv => inv.status === 'paid').length / clientHistory.length
        : 0,
      clientPaymentVelocity: this.calculatePaymentVelocity(allInvoices, invoice.clientName),
      
      // Temporal features
      monthOfYear: new Date(invoice.invoiceDate).getMonth() + 1,
      dayOfWeek: new Date(invoice.invoiceDate).getDay(),
      quarterOfYear: Math.floor(new Date(invoice.invoiceDate).getMonth() / 3) + 1,
      
      // Amount percentiles within client history
      amountPercentileForClient: clientHistory.length > 0
        ? this.calculatePercentile(
            clientHistory.map(inv => inv.total).sort((a, b) => a - b),
            invoice.total
          )
        : 50
    };
  }

  // Calculate percentile of a value in a sorted array
  private static calculatePercentile(sortedArray: number[], value: number): number {
    if (sortedArray.length === 0) return 50;
    
    let insertIndex = 0;
    while (insertIndex < sortedArray.length && sortedArray[insertIndex] < value) {
      insertIndex++;
    }
    
    return (insertIndex / sortedArray.length) * 100;
  }

  // Normalize features to 0-1 range
  static normalizeFeatures(features: Record<string, number>, bounds: Record<string, {min: number, max: number}>) {
    const normalized: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(features)) {
      if (bounds[key]) {
        const { min, max } = bounds[key];
        normalized[key] = max > min ? (value - min) / (max - min) : 0;
      } else {
        normalized[key] = value;
      }
    }
    
    return normalized;
  }

  // Calculate feature bounds for normalization
  static calculateFeatureBounds(featureArrays: Record<string, number>[]): Record<string, {min: number, max: number}> {
    const bounds: Record<string, {min: number, max: number}> = {};
    
    if (featureArrays.length === 0) return bounds;
    
    // Get all feature keys
    const allKeys = new Set<string>();
    featureArrays.forEach(features => {
      Object.keys(features).forEach(key => allKeys.add(key));
    });
    
    // Calculate min/max for each feature
    allKeys.forEach(key => {
      const values = featureArrays
        .map(features => features[key])
        .filter(val => typeof val === 'number' && !isNaN(val));
      
      bounds[key] = {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    });
    
    return bounds;
  }
}

// Simple linear regression for predictions
export class SimpleLinearRegression {
  private slope: number = 0;
  private intercept: number = 0;
  private trained: boolean = false;

  train(x: number[], y: number[]) {
    if (x.length !== y.length || x.length === 0) {
      throw new Error('X and Y arrays must have the same non-zero length');
    }

    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const meanX = sumX / n;
    const meanY = sumY / n;

    this.slope = (sumXY - n * meanX * meanY) / (sumXX - n * meanX * meanX);
    this.intercept = meanY - this.slope * meanX;
    this.trained = true;
  }

  predict(x: number): number {
    if (!this.trained) {
      throw new Error('Model must be trained before making predictions');
    }
    return this.slope * x + this.intercept;
  }

  getSlope(): number {
    return this.slope;
  }

  getIntercept(): number {
    return this.intercept;
  }
}

// K-means clustering for client segmentation
export class KMeansClustering {
  private centroids: number[][] = [];
  private k: number;
  private maxIterations: number;

  constructor(k: number = 3, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
  }

  // Simple 2D k-means clustering
  cluster(points: number[][]): number[] {
    if (points.length === 0) return [];
    
    const dimensions = points[0].length;
    
    // Initialize centroids randomly
    this.centroids = [];
    for (let i = 0; i < this.k; i++) {
      const centroid: number[] = [];
      for (let d = 0; d < dimensions; d++) {
        const values = points.map(p => p[d]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        centroid.push(Math.random() * (max - min) + min);
      }
      this.centroids.push(centroid);
    }

    let assignments = new Array(points.length).fill(0);
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Assign points to nearest centroid
      const newAssignments = points.map(point => {
        let minDistance = Infinity;
        let bestCluster = 0;
        
        for (let c = 0; c < this.k; c++) {
          const distance = this.euclideanDistance(point, this.centroids[c]);
          if (distance < minDistance) {
            minDistance = distance;
            bestCluster = c;
          }
        }
        
        return bestCluster;
      });

      // Check for convergence
      if (JSON.stringify(assignments) === JSON.stringify(newAssignments)) {
        break;
      }
      
      assignments = newAssignments;

      // Update centroids
      for (let c = 0; c < this.k; c++) {
        const clusterPoints = points.filter((_, i) => assignments[i] === c);
        if (clusterPoints.length > 0) {
          for (let d = 0; d < dimensions; d++) {
            this.centroids[c][d] = clusterPoints.reduce((sum, p) => sum + p[d], 0) / clusterPoints.length;
          }
        }
      }
    }

    return assignments;
  }

  private euclideanDistance(point1: number[], point2: number[]): number {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  }

  getCentroids(): number[][] {
    return this.centroids;
  }
}