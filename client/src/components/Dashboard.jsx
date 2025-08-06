import React from 'react';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { mockDashboardStats, mockInvoices, mockClients } from '../data/mockData';

const Dashboard = () => {
  const stats = mockDashboardStats;
  const recentInvoices = mockInvoices.slice(0, 3);
  const recentClients = mockClients.slice(0, 3);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
          trend="+12% from last month"
        />
        <StatCard
          title="Pending Amount"
          value={`$${stats.pendingAmount.toLocaleString()}`}
          icon={Clock}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Overdue Amount"
          value={`$${stats.overdueAmount.toLocaleString()}`}
          icon={AlertTriangle}
          color="bg-red-100 text-red-600"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="bg-purple-100 text-purple-600"
          trend="+2 this month"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${invoice.total.toLocaleString()}</p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
              View All Invoices
            </button>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Added: {client.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
              View All Clients
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium text-gray-700 group-hover:text-blue-700">Create Invoice</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium text-gray-700 group-hover:text-blue-700">Add Client</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group">
            <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            <span className="font-medium text-gray-700 group-hover:text-blue-700">Mark as Paid</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
