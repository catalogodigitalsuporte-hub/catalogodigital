
import React, { useState } from 'react'
import { useResellers } from '../hooks/useResellers'
import { Link } from 'react-router-dom'
import * as LucideIcons from 'lucide-react'

const ResellersPage: React.FC = () => {
  const { resellers, loading, updateResellerStatus, deleteReseller } = useResellers()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredResellers = resellers.filter(reseller => {
    const matchesSearch = reseller.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reseller.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || reseller.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (resellerId: string, newStatus: any) => {
    await updateResellerStatus(resellerId, newStatus)
  }

  const handleDelete = async (resellerId: string, businessName: string) => {
    if (confirm(`Are you sure you want to delete ${businessName}? This action cannot be undone.`)) {
      await deleteReseller(resellerId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resellers</h1>
          <p className="text-gray-600">Manage your reseller network and accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <LucideIcons.Plus size={20} />
          <span>Add Reseller</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {resellers.filter(r => r.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {resellers.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Inactive</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {resellers.filter(r => r.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-600">Suspended</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {resellers.filter(r => r.status === 'suspended').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search resellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <LucideIcons.Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resellers List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reseller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResellers.map((reseller) => (
                <tr key={reseller._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <LucideIcons.User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reseller.business_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {reseller.reseller_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reseller.contact_name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <LucideIcons.Mail className="h-3 w-3 mr-1" />
                      {reseller.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <LucideIcons.Phone className="h-3 w-3 mr-1" />
                      {reseller.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={reseller.status}
                      onChange={(e) => handleStatusChange(reseller._id, e.target.value)}
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(reseller.status)}`}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${reseller.total_sales?.toLocaleString() || '0'}</div>
                    <div className="text-gray-500">{reseller.total_orders || 0} orders</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reseller.commission_rate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/resellers/${reseller._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <LucideIcons.Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/resellers/${reseller._id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        <LucideIcons.Edit size={16} />
                      </Link>
                      <a
                        href={reseller.access_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-900"
                      >
                        <LucideIcons.ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(reseller._id, reseller.business_name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <LucideIcons.Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredResellers.length === 0 && (
        <div className="text-center py-12">
          <LucideIcons.User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resellers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new reseller to your network.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <LucideIcons.Plus className="mr-2 h-4 w-4" />
              Add Reseller
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResellersPage
