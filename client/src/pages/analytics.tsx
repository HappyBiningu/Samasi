import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, Area, AreaChart } from "recharts";
import { TrendingUp, DollarSign, FileText, Clock, CheckCircle, AlertCircle, Users, Target, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalyticsOverview {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  averageInvoiceValue: number;
  paymentRate: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface StatusData {
  status: string;
  count: number;
  value: number;
}

interface TimelineData {
  date: string;
  amount: number;
  status: string;
  clientName: string;
  invoiceNumber: string;
}

interface ClientPerformanceData {
  clientName: string;
  totalAmount: number;
  invoiceCount: number;
  paidAmount: number;
  paidCount: number;
  averageInvoice: number;
  paymentRate: number;
}

interface AmountDistributionData {
  range: string;
  count: number;
  value: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const { data: overview, isLoading: overviewLoading } = useQuery<AnalyticsOverview>({
    queryKey: ['/api/analytics/overview'],
    staleTime: 0, // Always refetch to get latest data
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ['/api/analytics/revenue-by-month'],
    staleTime: 0, // Always refetch to get latest data
  });

  const { data: statusData, isLoading: statusLoading } = useQuery<StatusData[]>({
    queryKey: ['/api/analytics/status-breakdown'],
    staleTime: 0, // Always refetch to get latest data
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery<TimelineData[]>({
    queryKey: ['/api/analytics/invoice-timeline'],
    staleTime: 0,
  });

  const { data: clientData, isLoading: clientLoading } = useQuery<ClientPerformanceData[]>({
    queryKey: ['/api/analytics/client-performance'],
    staleTime: 0,
  });

  const { data: distributionData, isLoading: distributionLoading } = useQuery<AmountDistributionData[]>({
    queryKey: ['/api/analytics/amount-distribution'],
    staleTime: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleExport = (type: 'invoices' | 'analytics' | 'clients') => {
    const baseUrl = window.location.origin;
    const exportUrl = `${baseUrl}/api/export/${type}.csv`;
    
    // Create temporary link to trigger download
    const link = document.createElement('a');
    link.href = exportUrl;
    link.download = `${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (overviewLoading || revenueLoading || statusLoading || timelineLoading || clientLoading || distributionLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" data-testid="analytics-dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" data-testid="title-analytics">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('invoices')}
            variant="outline"
            size="sm"
            data-testid="button-export-invoices"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Invoices
          </Button>
          <Button
            onClick={() => handleExport('clients')}
            variant="outline"
            size="sm"
            data-testid="button-export-clients"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Clients
          </Button>
          <Button
            onClick={() => handleExport('analytics')}
            variant="outline"
            size="sm"
            data-testid="button-export-analytics"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-revenue">
              {formatCurrency(overview?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-invoices">
              {overview?.totalInvoices || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-payment-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-payment-rate">
              {overview?.paymentRate ? overview.paymentRate.toFixed(1) : "0"}%
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-avg-invoice">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Invoice Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-invoice">
              {formatCurrency(overview?.averageInvoiceValue || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card data-testid="card-paid-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-paid-invoices">
              {overview?.paidInvoices || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-unpaid-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Unpaid Invoices</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-unpaid-invoices">
              {overview?.unpaidInvoices || 0}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-overdue-invoices">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Overdue Invoices</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-overdue-invoices">
              {overview?.overdueInvoices || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card data-testid="card-revenue-chart">
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
            <CardDescription>Track your revenue trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonth}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  labelFormatter={formatMonth}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-status-chart">
          <CardHeader>
            <CardTitle>Invoice Status Breakdown</CardTitle>
            <CardDescription>Distribution of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card data-testid="card-timeline-chart">
          <CardHeader>
            <CardTitle>Invoice Timeline</CardTitle>
            <CardDescription>Track invoice creation and amounts over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString('en-ZA')}`}
                  formatter={(value: number, name: string, props: any) => [
                    formatCurrency(value),
                    `Invoice ${props.payload.invoiceNumber} - ${props.payload.clientName}`
                  ]}
                />
                <Scatter dataKey="amount" fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-client-performance">
          <CardHeader>
            <CardTitle>Client Performance</CardTitle>
            <CardDescription>Compare client payment rates and amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={clientData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="clientName" />
                <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'Payment Rate') return [`${value.toFixed(1)}%`, name];
                    return [formatCurrency(value), name];
                  }}
                />
                <Bar yAxisId="left" dataKey="totalAmount" fill="#10b981" name="Total Amount" />
                <Bar yAxisId="right" dataKey="paymentRate" fill="#06b6d4" name="Payment Rate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card data-testid="card-amount-distribution">
          <CardHeader>
            <CardTitle>Invoice Amount Distribution</CardTitle>
            <CardDescription>Distribution of invoice amounts by ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Invoice Count']}
                />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="card-business-insights">
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Total Clients</span>
              </div>
              <span className="text-lg font-bold" data-testid="text-total-clients">
                {clientData?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Best Performing Client</span>
              </div>
              <span className="text-lg font-bold" data-testid="text-best-client">
                {clientData && clientData.length > 0 
                  ? clientData.reduce((best, client) => 
                      client.paymentRate > best.paymentRate ? client : best
                    ).clientName
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Highest Value Client</span>
              </div>
              <span className="text-lg font-bold" data-testid="text-highest-value-client">
                {clientData && clientData.length > 0 
                  ? clientData.reduce((highest, client) => 
                      client.totalAmount > highest.totalAmount ? client : highest
                    ).clientName
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}