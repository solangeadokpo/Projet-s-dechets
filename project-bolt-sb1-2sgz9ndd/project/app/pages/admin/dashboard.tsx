import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart3,
  Users,
  Map,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  FileText,
  Settings,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCollectors: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalWaste: 0
  });
  const [collections, setCollections] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');
        
      const { count: totalCollectors } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'collector');
        
      const { count: totalRequests } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true });
        
      const { count: pendingRequests } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      const { count: completedRequests } = await supabase
        .from('collection_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Estimate total waste (15kg per completed collection)
      const totalWaste = (completedRequests || 0) * 15;
      
      setStats({
        totalUsers: totalUsers || 0,
        totalCollectors: totalCollectors || 0,
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        completedRequests: completedRequests || 0,
        totalWaste
      });
      
      // Fetch recent collections with user and collector info
      const { data: collectionsData } = await supabase
        .from('collection_requests')
        .select(`
          *,
          users:user_id (full_name, email),
          collectors:collector_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
        
      setCollections(collectionsData || []);
      
      // Fetch collectors with performance stats
      const { data: collectorsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'collector');
        
      // For each collector, count completed collections
      const collectorsWithStats = await Promise.all((collectorsData || []).map(async (collector) => {
        const { count } = await supabase
          .from('collection_requests')
          .select('*', { count: 'exact', head: true })
          .eq('collector_id', collector.id)
          .eq('status', 'completed');
          
        return {
          ...collector,
          completed_collections: count || 0,
          waste_collected: (count || 0) * 15 // 15kg per collection
        };
      }));
      
      setCollectors(collectorsWithStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = (collection) => {
    if (filter === 'all') return true;
    return collection.status === filter;
  };

  const searchCollections = (collection) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (collection.users?.full_name?.toLowerCase().includes(query)) ||
      (collection.collectors?.full_name?.toLowerCase().includes(query)) ||
      (collection.address?.toLowerCase().includes(query))
    );
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'accepted': return <CheckCircle size={16} />;
      case 'in_progress': return <Trash2 size={16} />;
      case 'completed': return <CheckCircle size={16} />;
      case 'canceled': return <AlertTriangle size={16} />;
      default: return null;
    }
  };
  
  const exportData = () => {
    // Function to export data as CSV
    const exportData = collections.map(c => ({
      id: c.id,
      status: c.status,
      date: new Date(c.created_at).toLocaleDateString(),
      user: c.users?.full_name || 'N/A',
      collector: c.collectors?.full_name || 'N/A',
      address: c.address || 'N/A',
      lat: c.latitude,
      lng: c.longitude
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Status,Date,User,Collector,Address,Latitude,Longitude\n" +
      exportData.map(e => Object.values(e).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "collection_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-[#2D4B34] text-white px-6 py-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">EcoCollect Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-[#4CAF50] transition-colors">
              <Settings size={20} />
            </button>
            <div className="flex items-center">
              <span className="font-semibold">Admin</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Sidebar */}
      <div className="flex">
        <aside className="w-64 bg-white shadow-md h-[calc(100vh-64px)] p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-gray-600 uppercase text-xs font-semibold mb-2">Principal</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center space-x-2 text-[#2D4B34] p-2 rounded-lg bg-[#E8F5E9]">
                    <BarChart3 size={20} />
                    <span>Tableau de bord</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-2 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                    <Map size={20} />
                    <span>Carte</span>
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h2 className="text-gray-600 uppercase text-xs font-semibold mb-2">Gestion</h2>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center space-x-2 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                    <Trash2 size={20} />
                    <span>Collectes</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-2 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                    <Users size={20} />
                    <span>Utilisateurs</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center space-x-2 text-gray-700 p-2 rounded-lg hover:bg-gray-100">
                    <FileText size={20} />
                    <span>Rapports</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </aside>
        
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4CAF50]"></div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Utilisateurs</p>
                      <h2 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h2>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users size={24} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500">+{Math.floor(stats.totalUsers * 0.05)} ce mois</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Collecteurs</p>
                      <h2 className="text-3xl font-bold text-gray-800">{stats.totalCollectors}</h2>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Truck size={24} className="text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500">{collectors.filter(c => c.active).length} actifs</span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-sm">Déchets collectés</p>
                      <h2 className="text-3xl font-bold text-gray-800">{stats.totalWaste} kg</h2>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Trash2 size={24} className="text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-500">{Math.round(stats.totalWaste / 1000)} tonnes</span>
                  </div>
                </div>
              </div>
              
              {/* Additional stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 col-span-1">
                  <h3 className="text-gray-700 font-semibold mb-4">État des demandes</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">En attente</span>
                        <span className="text-sm font-medium text-gray-700">{stats.pendingRequests}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${(stats.pendingRequests / stats.totalRequests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">En cours</span>
                        <span className="text-sm font-medium text-gray-700">
                          {stats.totalRequests - stats.pendingRequests - stats.completedRequests}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${((stats.totalRequests - stats.pendingRequests - stats.completedRequests) / stats.totalRequests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Terminées</span>
                        <span className="text-sm font-medium text-gray-700">{stats.completedRequests}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stats.completedRequests / stats.totalRequests) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow col-span-2">
                  <div className="p-6">
                    <h3 className="text-gray-700 font-semibold mb-4">Performance des collecteurs</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collectes</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Déchets</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {collectors.slice(0, 5).map((collector) => (
                            <tr key={collector.id}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                                    {collector.full_name?.[0] || 'U'}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{collector.full_name}</div>
                                    <div className="text-xs text-gray-500">{collector.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {collector.completed_collections}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {collector.waste_collected} kg
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${collector.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {collector.active ? 'Actif' : 'Inactif'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent collections */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="text-gray-700 font-semibold">Demandes récentes</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={fetchDashboardData} 
                        className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={exportData} 
                        className="p-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border-b">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher une demande..."
                          className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter size={16} className="text-gray-500" />
                      <select
                        className="border rounded-lg px-3 py-2"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">Tous</option>
                        <option value="pending">En attente</option>
                        <option value="accepted">Acceptées</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminées</option>
                        <option value="canceled">Annulées</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collecteur</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {collections
                        .filter(filterCollections)
                        .filter(searchCollections)
                        .map((collection) => (
                          <tr key={collection.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              #{collection.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(collection.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {collection.users?.full_name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {collection.collectors?.full_name || 'Non assigné'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {collection.address || `Lat: ${collection.latitude.toFixed(4)}, Lng: ${collection.longitude.toFixed(4)}`}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(collection.status)}`}>
                                  {getStatusIcon(collection.status)}
                                  <span className="ml-1">{collection.status}</span>
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  
                  {collections.filter(filterCollections).filter(searchCollections).length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      Aucune demande trouvée
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}