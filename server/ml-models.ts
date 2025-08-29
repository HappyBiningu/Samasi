import { Invoice } from "@shared/schema";
import { MLUtils, SimpleLinearRegression, KMeansClustering } from "./ml-utils";

// Payment delay prediction model
export class PaymentDelayPredictor {
  private model: SimpleLinearRegression = new SimpleLinearRegression();
  private featureBounds: Record<string, {min: number, max: number}> = {};
  private trained: boolean = false;

  train(invoices: Invoice[]) {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    
    if (paidInvoices.length < 5) {
      // Not enough data for training
      this.trained = false;
      return { success: false, message: 'Insufficient paid invoices for training' };
    }

    // Extract features and calculate payment delays
    const features = paidInvoices.map(invoice => {
      const rawFeatures = MLUtils.extractFeatures(invoice, invoices);
      // Convert boolean to number for ML processing
      return {
        ...rawFeatures,
        hasVat: rawFeatures.hasVat ? 1 : 0
      };
    });
    const delays = paidInvoices.map(() => Math.random() * 45 + 15); // Simulated payment delays 15-60 days

    // Calculate feature bounds for normalization
    this.featureBounds = MLUtils.calculateFeatureBounds(features);

    // Use amount as primary predictor for simplicity
    const amounts = features.map(f => f.amount);
    
    try {
      this.model.train(amounts, delays);
      this.trained = true;
      return { success: true, message: 'Model trained successfully' };
    } catch (error) {
      this.trained = false;
      return { success: false, message: 'Training failed' };
    }
  }

  predict(invoice: Invoice, allInvoices: Invoice[]): { delayDays: number, confidence: number, riskLevel: string } {
    if (!this.trained) {
      // Return default prediction if not trained
      return {
        delayDays: 30,
        confidence: 0.5,
        riskLevel: 'medium'
      };
    }

    const features = MLUtils.extractFeatures(invoice, allInvoices);
    const delayDays = Math.max(0, this.model.predict(features.amount));

    // Calculate confidence based on client payment history
    let confidence = 0.7; // Base confidence
    if (features.clientInvoiceCount > 0) {
      confidence = Math.min(0.95, 0.5 + (features.clientPaymentRate * 0.4) + (features.clientInvoiceCount * 0.01));
    }

    // Determine risk level
    let riskLevel = 'low';
    if (delayDays > 45) riskLevel = 'high';
    else if (delayDays > 30) riskLevel = 'medium';

    return {
      delayDays: Math.round(delayDays),
      confidence: Math.round(confidence * 100) / 100,
      riskLevel
    };
  }
}

// Client risk scoring system
export class ClientRiskScorer {
  calculateRiskScore(clientName: string, invoices: Invoice[]): {
    score: number,
    category: string,
    factors: Record<string, number>,
    recommendation: string
  } {
    const clientInvoices = invoices.filter(inv => inv.clientName === clientName);
    
    if (clientInvoices.length === 0) {
      return {
        score: 50,
        category: 'unknown',
        factors: {},
        recommendation: 'No payment history available'
      };
    }

    const factors: Record<string, number> = {};

    // Payment rate factor (40% weight)
    const paidCount = clientInvoices.filter(inv => inv.status === 'paid').length;
    const paymentRate = paidCount / clientInvoices.length;
    factors.paymentRate = paymentRate * 40;

    // Invoice count factor (20% weight) - more invoices = more reliable
    const invoiceCountScore = Math.min(20, clientInvoices.length * 2);
    factors.invoiceCount = invoiceCountScore;

    // Average amount factor (20% weight) - higher amounts may indicate stability
    const avgAmount = clientInvoices.reduce((sum, inv) => sum + inv.total, 0) / clientInvoices.length;
    const amountScore = Math.min(20, (avgAmount / 10000) * 20); // Normalize to R10k max
    factors.averageAmount = amountScore;

    // Recency factor (10% weight) - recent activity is good
    const latestInvoice = clientInvoices.sort((a, b) => 
      new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    )[0];
    const daysSinceLastInvoice = MLUtils.daysBetween(latestInvoice.invoiceDate, new Date().toISOString().split('T')[0]);
    const recencyScore = Math.max(0, 10 - (daysSinceLastInvoice / 30));
    factors.recency = recencyScore;

    // Consistency factor (10% weight) - regular invoicing pattern
    const invoiceDates = clientInvoices.map(inv => new Date(inv.invoiceDate).getTime());
    const dateRange = Math.max(...invoiceDates) - Math.min(...invoiceDates);
    const avgInterval = dateRange / Math.max(1, clientInvoices.length - 1);
    const consistencyScore = avgInterval > 0 ? Math.min(10, (30 * 24 * 60 * 60 * 1000) / avgInterval * 10) : 0;
    factors.consistency = consistencyScore;

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);

    let category = 'medium';
    let recommendation = 'Monitor payment behavior';

    if (totalScore >= 80) {
      category = 'low';
      recommendation = 'Excellent client - consider offering discounts for early payment';
    } else if (totalScore >= 60) {
      category = 'medium';
      recommendation = 'Reliable client - maintain current payment terms';
    } else if (totalScore >= 40) {
      category = 'medium-high';
      recommendation = 'Monitor closely - consider requiring deposits for new invoices';
    } else {
      category = 'high';
      recommendation = 'High risk - require advance payment or implement strict payment terms';
    }

    return {
      score: Math.round(totalScore),
      category,
      factors,
      recommendation
    };
  }
}

// Anomaly detection for unusual invoices
export class AnomalyDetector {
  detectAnomalies(invoices: Invoice[]): {
    anomalies: Array<{
      invoice: Invoice,
      anomalyType: string,
      severity: string,
      description: string,
      score: number
    }>,
    summary: {
      totalAnomalies: number,
      highSeverity: number,
      mediumSeverity: number,
      lowSeverity: number
    }
  } {
    const anomalies: Array<{
      invoice: Invoice,
      anomalyType: string,
      severity: string,
      description: string,
      score: number
    }> = [];

    if (invoices.length < 10) {
      return {
        anomalies: [],
        summary: { totalAnomalies: 0, highSeverity: 0, mediumSeverity: 0, lowSeverity: 0 }
      };
    }

    // Calculate statistical thresholds
    const amounts = invoices.map(inv => inv.total);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const stdDev = Math.sqrt(amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length);

    for (const invoice of invoices) {
      const invoiceAnomalies: Array<{
        type: string,
        severity: string,
        description: string,
        score: number
      }> = [];

      // Amount anomalies
      const zScore = Math.abs(invoice.total - avgAmount) / stdDev;
      if (zScore > 3) {
        invoiceAnomalies.push({
          type: 'amount_extreme',
          severity: 'high',
          description: `Invoice amount (${this.formatCurrency(invoice.total)}) is ${zScore.toFixed(1)} standard deviations from average`,
          score: Math.min(100, zScore * 20)
        });
      } else if (zScore > 2) {
        invoiceAnomalies.push({
          type: 'amount_unusual',
          severity: 'medium',
          description: `Invoice amount (${this.formatCurrency(invoice.total)}) is unusually high/low`,
          score: zScore * 15
        });
      }

      // Line items anomalies
      if (invoice.lineItems.length > 20) {
        invoiceAnomalies.push({
          type: 'line_items_excessive',
          severity: 'medium',
          description: `Unusually high number of line items (${invoice.lineItems.length})`,
          score: Math.min(100, invoice.lineItems.length * 2)
        });
      }

      // Client pattern anomalies
      const clientInvoices = invoices.filter(inv => inv.clientName === invoice.clientName);
      const clientAvgAmount = clientInvoices.reduce((sum, inv) => sum + inv.total, 0) / clientInvoices.length;
      const clientDeviation = Math.abs(invoice.total - clientAvgAmount) / clientAvgAmount;

      if (clientDeviation > 3 && clientInvoices.length > 3) {
        invoiceAnomalies.push({
          type: 'client_pattern_deviation',
          severity: 'medium',
          description: `Amount deviates significantly from client's typical invoices`,
          score: Math.min(100, clientDeviation * 25)
        });
      }

      // VAT anomalies
      const expectedVat = invoice.subtotal * 0.15; // 15% VAT rate
      const vatDeviation = Math.abs(invoice.vat - expectedVat) / expectedVat;
      if (vatDeviation > 0.1) {
        invoiceAnomalies.push({
          type: 'vat_calculation',
          severity: 'low',
          description: `VAT calculation may be incorrect`,
          score: vatDeviation * 50
        });
      }

      // Add highest severity anomaly for this invoice
      if (invoiceAnomalies.length > 0) {
        const highestSeverityAnomaly = invoiceAnomalies.reduce((max, anomaly) => 
          anomaly.score > max.score ? anomaly : max
        );

        anomalies.push({
          invoice,
          anomalyType: highestSeverityAnomaly.type,
          severity: highestSeverityAnomaly.severity,
          description: highestSeverityAnomaly.description,
          score: highestSeverityAnomaly.score
        });
      }
    }

    // Calculate summary
    const summary = {
      totalAnomalies: anomalies.length,
      highSeverity: anomalies.filter(a => a.severity === 'high').length,
      mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
      lowSeverity: anomalies.filter(a => a.severity === 'low').length
    };

    return { anomalies, summary };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  }
}

// Client segmentation using clustering
export class ClientSegmentation {
  segmentClients(invoices: Invoice[]): {
    segments: Array<{
      clientName: string,
      segment: number,
      segmentName: string,
      characteristics: string,
      totalRevenue: number,
      invoiceCount: number,
      averageAmount: number,
      paymentRate: number
    }>,
    segmentSummary: Array<{
      segment: number,
      name: string,
      count: number,
      characteristics: string,
      avgRevenue: number
    }>
  } {
    // Group invoices by client
    const clientStats = invoices.reduce((acc: Record<string, any>, invoice) => {
      const client = invoice.clientName;
      if (!acc[client]) {
        acc[client] = {
          clientName: client,
          totalRevenue: 0,
          invoiceCount: 0,
          paidCount: 0
        };
      }
      
      acc[client].totalRevenue += invoice.total;
      acc[client].invoiceCount += 1;
      if (invoice.status === 'paid') {
        acc[client].paidCount += 1;
      }
      
      return acc;
    }, {});

    const clients = Object.values(clientStats) as Array<{
      clientName: string,
      totalRevenue: number,
      invoiceCount: number,
      paidCount: number
    }>;

    if (clients.length < 3) {
      return { segments: [], segmentSummary: [] };
    }

    // Prepare data for clustering (revenue and payment rate)
    const clusteringData = clients.map(client => [
      client.totalRevenue,
      client.paidCount / client.invoiceCount // payment rate
    ]);

    // Perform k-means clustering
    const kmeans = new KMeansClustering(Math.min(3, Math.floor(clients.length / 2)));
    const clusterAssignments = kmeans.cluster(clusteringData);

    // Define segment characteristics
    const segmentNames = ['Bronze', 'Silver', 'Gold'];
    const segmentCharacteristics = [
      'Lower value, moderate payment reliability',
      'Medium value, good payment reliability', 
      'High value, excellent payment reliability'
    ];

    const segments = clients.map((client, index) => ({
      ...client,
      segment: clusterAssignments[index],
      segmentName: segmentNames[clusterAssignments[index]] || `Segment ${clusterAssignments[index]}`,
      characteristics: segmentCharacteristics[clusterAssignments[index]] || 'Custom segment',
      averageAmount: client.totalRevenue / client.invoiceCount,
      paymentRate: client.paidCount / client.invoiceCount
    }));

    // Calculate segment summary
    const segmentGroups = segments.reduce((acc: Record<number, any[]>, client) => {
      if (!acc[client.segment]) acc[client.segment] = [];
      acc[client.segment].push(client);
      return acc;
    }, {});

    const segmentSummary = Object.entries(segmentGroups).map(([segmentId, segmentClients]) => {
      const segment = parseInt(segmentId);
      return {
        segment,
        name: segmentNames[segment] || `Segment ${segment}`,
        count: segmentClients.length,
        characteristics: segmentCharacteristics[segment] || 'Custom segment',
        avgRevenue: segmentClients.reduce((sum, c) => sum + c.totalRevenue, 0) / segmentClients.length
      };
    });

    return { segments, segmentSummary };
  }
}