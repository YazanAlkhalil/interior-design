import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { BarChart } from "../components/ui/bar-chart"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { LineChart } from "../components/ui/line-chart"
import { AreaChart } from "../components/ui/area-chart"
import { useEffect, useState } from "react"
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch"



const recentSales = [
    {
      name: "Olivia Martin",
      email: "olivia.martin@email.com",
      amount: "1,999.00",
      avatar: "/avatars/olivia.png"
    },
    {
      name: "Jackson Lee",
      email: "jackson.lee@email.com",
      amount: "39.00",
      avatar: "/avatars/jackson.png"
    },
    // Add more sales data...
  ]
  
  // Add interface for dashboard data
  interface DashboardData {
    total_sales: string;
    active_employees: number;
    active_clients: number;
    monthly_sales: { [key: string]: string };
    monthly_clients: { [key: string]: number };
  }

  export default function Dashboard() {
    const { authFetch } = useAuthenticatedFetch();
    const [dashboardData, setDashboardData] = useState<DashboardData>({
      total_sales: "0",
      active_employees: 0,
      active_clients: 0,
      monthly_sales: {},
      monthly_clients: {}
    });

    const fetchDashboard = async () => {
      try {
        const response = await authFetch('dashboard/');
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      }
    };

    useEffect(() => {
      fetchDashboard();
    }, []);

    // Helper function to format numbers as currency
    const formatCurrency = (amount: string) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(Number(amount));
    };

    // Transform monthly data for charts
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlySalesData = months.map((_month, index) => 
      Number(dashboardData.monthly_sales[index + 1] || 0)
    );
    const monthlyClientsData = months.map((_month, index) => 
      Number(dashboardData.monthly_clients[index + 1] || 0)
    );

    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Jan 20, 2023 - Feb 09, 2023</span>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          {/* <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList> */}

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(dashboardData.total_sales)}</div>
                  <p className="text-xs text-muted-foreground">Current total sales</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.active_employees}</div>
                  <p className="text-xs text-muted-foreground">Current active employees</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.active_clients}</div>
                  <p className="text-xs text-muted-foreground">Current active clients</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground">+201 since last hour</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-8">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart 
                    data={monthlyClientsData} 
                    categories={months}
                  />
                </CardContent>
              </Card>

              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChart 
                    data={monthlySalesData} 
                    categories={months}
                  />
                </CardContent>
              </Card>
            </div>
            
            
            
          </TabsContent>
        </Tabs>
      </div>
    )
  }

