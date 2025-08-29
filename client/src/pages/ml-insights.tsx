import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { Brain, TrendingUp, AlertTriangle, Users, Target, Clock, DollarSign, Activity, Shield, Zap } from "lucide-react";

interface MLInsightsSummary {
  summary: {
    totalInvoices: number;
    unpaidInvoices: number;
    avgPredictedDelay: number;
    highRiskClients: number;
    atRiskRevenue: number;
    totalAnomalies: number;
    clientSegments: number;
    modelTrained: boolean;
  };
  recentPredictions: Array<{
    delayDays: number;
    confidence: number;
    riskLevel: string;
  }>;
  topRiskClients: Array<{
    clientName: string;
    score: number;
    category: string;
    recommendation: string;
  }>;
  recentAnomalies: Array<{
    invoice: {
      invoiceNumber: string;
      clientName: string;
      total: number;
    };
    anomalyType: string;
    severity: string;
    description: string;
    score: number;
  }>;
}

interface PaymentPrediction {
  invoiceId: number;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  delayDays: number;
  confidence: number;
  riskLevel: string;
}

interface ClientRiskScore {
  clientName: string;
  score: number;
  category: string;
  factors: Record<string, number>;
  recommendation: string;
}

interface AnomalyDetection {
  anomalies: Array<{
    invoice: {
      invoiceNumber: string;
      clientName: string;
      total: number;
    };
    anomalyType: string;
    severity: string;
    description: string;
    score: number;
  }>;
  summary: {
    totalAnomalies: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
  };
}

interface ClientSegmentation {
  segments: Array<{
    clientName: string;
    segment: number;
    segmentName: string;
    characteristics: string;
    totalRevenue: number;
    invoiceCount: number;
    averageAmount: number;
    paymentRate: number;
  }>;
  segmentSummary: Array<{
    segment: number;
    name: string;
    count: number;
    characteristics: string;
    avgRevenue: number;
  }>;
}

export default function MLInsightsPage() {
  const { data: insights, isLoading: insightsLoading } = useQuery<MLInsightsSummary>({
    queryKey: ['/api/ml/insights-summary'],
  });

  const { data: predictions, isLoading: predictionsLoading } = useQuery<PaymentPrediction[]>({
    queryKey: ['/api/ml/payment-predictions'],
  });

  const { data: riskScores, isLoading: riskLoading } = useQuery<ClientRiskScore[]>({
    queryKey: ['/api/ml/client-risk-scores'],
  });

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery<AnomalyDetection>({
    queryKey: ['/api/ml/anomaly-detection'],
  });

  const { data: segmentation, isLoading: segmentationLoading } = useQuery<ClientSegmentation>({
    queryKey: ['/api/ml/client-segmentation'],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getRiskBadgeColor = (category: string) => {
    switch (category) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium-high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (insightsLoading || predictionsLoading || riskLoading || anomaliesLoading || segmentationLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="ml-insights-loading">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8 animate-spin" />
          <h1 className="text-3xl font-bold">Loading ML Insights...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" data-testid="ml-insights-dashboard">
      <div className="flex items-center space-x-4 mb-6">
        <Brain className="h-10 w-10 text-blue-600" />
        <h1 className="text-3xl font-bold" data-testid="title-ml-insights">Machine Learning Insights</h1>
        {insights?.summary.modelTrained && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            Model Trained
          </Badge>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card data-testid="card-predicted-delay">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Predicted Delay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.summary.avgPredictedDelay || 0} days</div>
            <p className="text-xs text-muted-foreground">
              For {insights?.summary.unpaidInvoices || 0} unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-high-risk-clients">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Clients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.summary.highRiskClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Clients requiring attention
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-at-risk-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(insights?.summary.atRiskRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              High-risk unpaid invoices
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-anomalies">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights?.summary.totalAnomalies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unusual invoice patterns
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" data-testid="tab-predictions">Payment Predictions</TabsTrigger>
          <TabsTrigger value="risk" data-testid="tab-risk">Client Risk</TabsTrigger>
          <TabsTrigger value="anomalies" data-testid="tab-anomalies">Anomalies</TabsTrigger>
          <TabsTrigger value="segmentation" data-testid="tab-segmentation">Segmentation</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" data-testid="content-predictions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Delay Predictions</CardTitle>
                <CardDescription>Predicted payment delays for unpaid invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {predictions && predictions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={predictions.slice(0, 10).map(item => ({
                      ...item,
                      delayDays: isNaN(item.delayDays) ? 0 : item.delayDays,
                      confidence: isNaN(item.confidence) ? 0 : item.confidence * 100
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="invoiceNumber" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'delayDays' ? `${value} days` : `${value}%`,
                          name === 'delayDays' ? 'Predicted Delay' : 'Confidence'
                        ]}
                        labelFormatter={(label) => `Invoice: ${label}`}
                      />
                      <Bar dataKey="delayDays" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No unpaid invoices to predict</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Level Distribution</CardTitle>
                <CardDescription>Distribution of payment risk levels</CardDescription>
              </CardHeader>
              <CardContent>
                {predictions && predictions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          predictions.reduce((acc: Record<string, number>, pred) => {
                            acc[pred.riskLevel] = (acc[pred.riskLevel] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([level, count]) => ({ name: level, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(predictions.reduce((acc: Record<string, number>, pred) => {
                          acc[pred.riskLevel] = (acc[pred.riskLevel] || 0) + 1;
                          return acc;
                        }, {})).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No prediction data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Predictions</CardTitle>
              <CardDescription>Latest payment delay predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions?.slice(0, 5).map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`prediction-${index}`}>
                    <div>
                      <p className="font-medium">{prediction.invoiceNumber}</p>
                      <p className="text-sm text-muted-foreground">{prediction.clientName}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(prediction.amount)}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRiskBadgeColor(prediction.riskLevel)}>
                          {prediction.riskLevel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {prediction.delayDays} days ({Math.round(prediction.confidence * 100)}% confidence)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" data-testid="content-risk">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Risk Distribution</CardTitle>
                <CardDescription>Distribution of client risk categories</CardDescription>
              </CardHeader>
              <CardContent>
                {riskScores && riskScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(
                          riskScores.reduce((acc: Record<string, number>, score) => {
                            acc[score.category] = (acc[score.category] || 0) + 1;
                            return acc;
                          }, {})
                        ).map(([category, count]) => ({ name: category, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.keys(riskScores.reduce((acc: Record<string, number>, score) => {
                          acc[score.category] = (acc[score.category] || 0) + 1;
                          return acc;
                        }, {})).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No risk data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Scores</CardTitle>
                <CardDescription>Client risk scores and factors</CardDescription>
              </CardHeader>
              <CardContent>
                {riskScores && riskScores.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={riskScores.slice(0, 10).map(item => ({
                        ...item,
                        score: isNaN(item.score) ? 0 : item.score
                      }))} 
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="clientName" type="category" width={80} />
                      <Tooltip formatter={(value) => [`${value}`, 'Risk Score']} />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No risk data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Client Risk Assessment</CardTitle>
              <CardDescription>Detailed risk analysis for each client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskScores?.slice(0, 5).map((client, index) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`risk-client-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{client.clientName}</h3>
                      <Badge className={getRiskBadgeColor(client.category)}>
                        {client.category} risk
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Risk Score</span>
                        <span>{client.score}/100</span>
                      </div>
                      <Progress value={client.score} className="mt-1" />
                    </div>
                    <p className="text-sm text-muted-foreground">{client.recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="anomalies" data-testid="content-anomalies">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Severity</CardTitle>
                <CardDescription>Distribution of anomaly severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies && anomalies.summary ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'High', value: anomalies.summary.highSeverity },
                          { name: 'Medium', value: anomalies.summary.mediumSeverity },
                          { name: 'Low', value: anomalies.summary.lowSeverity }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'High', value: anomalies.summary.highSeverity },
                          { name: 'Medium', value: anomalies.summary.mediumSeverity },
                          { name: 'Low', value: anomalies.summary.lowSeverity }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No anomalies detected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anomaly Scores</CardTitle>
                <CardDescription>Anomaly scores by invoice</CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies?.anomalies && anomalies.anomalies.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart data={anomalies.anomalies.slice(0, 20).map(item => ({
                      ...item,
                      score: isNaN(item.score) ? 0 : item.score,
                      'invoice.total': isNaN(item.invoice.total) ? 0 : item.invoice.total
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="invoice.total" />
                      <YAxis dataKey="score" />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'score' ? 'Anomaly Score' : 'Invoice Amount']}
                        labelFormatter={() => 'Invoice Details'}
                      />
                      <Scatter dataKey="score" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No anomalies detected</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>Recent anomalous invoice patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies?.anomalies.slice(0, 5).map((anomaly, index) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`anomaly-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{anomaly.invoice.invoiceNumber}</h3>
                      <Badge className={getSeverityBadgeColor(anomaly.severity)}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {anomaly.invoice.clientName} • {formatCurrency(anomaly.invoice.total)}
                    </p>
                    <p className="text-sm">{anomaly.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Anomaly Score</span>
                        <span>{Math.round(anomaly.score)}/100</span>
                      </div>
                      <Progress value={anomaly.score} className="mt-1 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segmentation" data-testid="content-segmentation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Segments</CardTitle>
                <CardDescription>Automated client segmentation</CardDescription>
              </CardHeader>
              <CardContent>
                {segmentation?.segmentSummary && segmentation.segmentSummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={segmentation.segmentSummary.map(segment => ({
                          name: segment.name,
                          value: segment.count
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentation.segmentSummary.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">Insufficient data for segmentation</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Revenue</CardTitle>
                <CardDescription>Average revenue by client segment</CardDescription>
              </CardHeader>
              <CardContent>
                {segmentation?.segmentSummary && segmentation.segmentSummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={segmentation.segmentSummary.map(item => ({
                      ...item,
                      avgRevenue: isNaN(item.avgRevenue) ? 0 : item.avgRevenue
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Avg Revenue']} />
                      <Bar dataKey="avgRevenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground">No segmentation data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Segment Details</CardTitle>
              <CardDescription>Detailed breakdown of client segments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segmentation?.segmentSummary.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`segment-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{segment.name}</h3>
                      <Badge variant="outline">{segment.count} clients</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{segment.characteristics}</p>
                    <p className="text-sm">Average Revenue: {formatCurrency(segment.avgRevenue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}