import React, { useState, useEffect } from 'react';
import { Toast } from '../../../components/errorNotifier';
import { loader } from '../../../components/LoadingSpinner';
import { baseUrl } from '../../../services/setup';
import request from 'superagent';

const InvoicesReport = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    startDate: '',
    endDate: '',
    status: 'all',
    searchQuery: '',
  });

  const [stats, setStats] = useState({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalInvoices: 0,
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [filterOptions, invoices]);

  const fetchInvoices = async () => {
    try {
      loader({ title: "Loading Invoices", text: "please wait..." });
      const response = await request.get(`${baseUrl}/finance/get_invoices.php`);
      const data = response.body;
      setInvoices(data);
      calculateStats(data);
      setLoading(false);
    } catch (error) {
      Toast.fire({
        icon: 'error',
        title: 'Failed to fetch invoices'
      });
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = data.reduce((acc, invoice) => ({
      totalAmount: acc.totalAmount + parseFloat(invoice.amount),
      paidAmount: acc.paidAmount + (invoice.status === 'paid' ? parseFloat(invoice.amount) : 0),
      pendingAmount: acc.pendingAmount + (invoice.status === 'pending' ? parseFloat(invoice.amount) : 0),
      totalInvoices: acc.totalInvoices + 1,
    }), {
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      totalInvoices: 0,
    });

    setStats(stats);
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Date filter
    if (filterOptions.startDate && filterOptions.endDate) {
      filtered = filtered.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        const start = new Date(filterOptions.startDate);
        const end = new Date(filterOptions.endDate);
        return invoiceDate >= start && invoiceDate <= end;
      });
    }

    // Status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.status.toLowerCase() === filterOptions.status.toLowerCase()
      );
    }

    // Search query
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(query) ||
        invoice.student_name.toLowerCase().includes(query) ||
        invoice.description.toLowerCase().includes(query)
      );
    }

    setFilteredInvoices(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'overdue':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Invoices</h6>
              <h3 className="card-text">{stats.totalInvoices}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Total Amount</h6>
              <h3 className="card-text">{formatCurrency(stats.totalAmount)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Paid Amount</h6>
              <h3 className="card-text">{formatCurrency(stats.paidAmount)}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6 className="card-title">Pending Amount</h6>
              <h3 className="card-text">{formatCurrency(stats.pendingAmount)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filterOptions.startDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filterOptions.endDate}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filterOptions.status}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Search</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search invoices..."
                name="searchQuery"
                value={filterOptions.searchQuery}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>{invoice.invoice_number}</td>
                    <td>{invoice.student_name}</td>
                    <td>{new Date(invoice.date).toLocaleDateString()}</td>
                    <td>{invoice.description}</td>
                    <td>{formatCurrency(invoice.amount)}</td>
                    <td>
                      <span className={getStatusBadgeClass(invoice.status)}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => window.print()}
                        >
                          Print
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {/* Add view details handler */}}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicesReport;