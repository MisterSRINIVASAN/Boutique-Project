import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, isAdmin, logout } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [manageStockModal, setManageStockModal] = useState(null);
  const [lookbook, setLookbook] = useState([]);
  const [newLookbookItem, setNewLookbookItem] = useState({ title: '', description: '', image_url: '' });
  
  // Product Upload State
  const [productForm, setProductForm] = useState({
    id: '', name: '', fabric: '', category_id: '', base_description: '', price: 0, images: []
  });
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sizes, setSizes] = useState([
    { size_label: 'S', chest: 38, waist: 32, hip: 38, stock: 10, note: '' }
  ]);
  const [uploadMessage, setUploadMessage] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    } else {
      fetchInventory();
    }
  }, [isAdmin, navigate, token]);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        navigate('/login');
        return;
      }
      const data = await res.json();
      setInventory(data);
      
      const ordersRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(await ordersRes.json());

      const notifRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(await notifRes.json());

      const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const catData = await catRes.json();
      setCategories(catData);
      if (catData.length > 0) {
        setProductForm(prev => ({ ...prev, category_id: catData[0].id }));
      }

      const lbRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/lookbook`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLookbook(await lbRes.json());
    } catch (err) {
      console.error("DEBUG - Data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addSizeRow = () => {
    setSizes([...sizes, { size_label: '', chest: 0, waist: 0, hip: 0, stock: 0, note: '' }]);
  };

  const updateSize = (index, field, value) => {
    const updated = [...sizes];
    updated[index][field] = field === 'size_label' || field === 'note' ? value : Number(value);
    setSizes(updated);
  };

  const handleUploadProduct = async (e) => {
    e.preventDefault();
    setUploadMessage('Processing...');
    try {
      let finalImages = [];
      
      // 1. Upload files if any selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('files', selectedFiles[i]);
        }
        
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(`Image upload failed: ${errData.detail || uploadRes.statusText}`);
        }
        const uploadData = await uploadRes.json();
        finalImages = uploadData.urls;
      }

      // 2. Create product
      const payload = {
        ...productForm,
        images: finalImages,
        sizes: sizes
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(`Product creation failed: ${errData.detail || res.statusText}`);
      }
      setUploadMessage('Product successfully added!');
      setProductForm({ id: '', name: '', fabric: '', category_id: categories[0]?.id || '', base_description: '', price: 0, images: [] });
      setSelectedFiles([]);
      setSizes([{ size_label: 'S', chest: 38, waist: 32, hip: 38, stock: 10, note: '' }]);
      fetchInventory();
    } catch (err) {
      console.error("DEBUG - Upload failed:", err);
      setUploadMessage(err.message);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (productForm.categoryImageFile) {
        const formData = new FormData();
        formData.append('files', productForm.categoryImageFile);
        const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.urls[0];
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name: newCategoryName,
          description: productForm.categoryDescription || null,
          image_url: imageUrl
        })
      });
      if (!res.ok) throw new Error('Failed to add category');
      
      setNewCategoryName('');
      setProductForm({...productForm, categoryDescription: '', categoryImageFile: null});
      
      const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(await catRes.json());
    } catch (err) {
      console.error("DEBUG - Add Category failed:", err);
    }
  };

  const handleMarkDispatched = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/orders/${orderId}/dispatch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: "Dispatched - Out for Delivery" } : o));
      setSelectedOrder(null);
      
      // Also refresh notifications to show the dispatch log
      const notifRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(await notifRes.json());
    } catch (err) {
      console.error("DEBUG - Dispatch failed:", err);
    }
  };

  const handleAddLookbookItem = async (e) => {
    e.preventDefault();
    try {
      // 1. Upload File First
      const formData = new FormData();
      formData.append('files', newLookbookItem.file);
      
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.urls[0];

      // 2. Create Item
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/lookbook`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: newLookbookItem.title,
          description: newLookbookItem.description,
          image_url: imageUrl
        })
      });
      if (!res.ok) throw new Error('Failed to add lookbook item');
      setNewLookbookItem({ title: '', description: '', image_url: '' });
      fetchInventory(); // Re-fetch all
    } catch (err) {
      console.error("DEBUG - Add Lookbook Item failed:", err);
    }
  };

  const handleDeleteLookbookItem = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/lookbook/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete item');
      fetchInventory();
    } catch (err) {
      console.error("DEBUG - Delete Lookbook Item failed:", err);
    }
  };

  const handleManageStock = (sizeId, currentStock, productName, sizeLabel) => {
    setManageStockModal({ sizeId, currentStock, productName, sizeLabel, newStock: currentStock });
  };

  const submitStockUpdate = async () => {
    if (!manageStockModal) return;
    const { sizeId, newStock } = manageStockModal;
    if (!isNaN(newStock) && newStock >= 0) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/inventory/${sizeId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ stock: newStock })
        });
        if (res.ok) {
          setManageStockModal(null);
          fetchInventory();
        } else alert("Failed to update stock");
      } catch(e) { console.error(e) }
    } else {
      alert("Please enter a valid stock number.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-vibrant w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp">
             <button 
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center font-black hover:scale-110 transition-all"
             >✕</button>
             
             <div className="p-10 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start mb-10 border-b border-white pb-8">
                   <div>
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">Dispatch Ticket</p>
                      <h2 className="text-3xl font-serif font-black text-gray-900 tracking-tighter">{selectedOrder.id}</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Status: {selectedOrder.status}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-2xl font-black text-pink-600 tracking-tighter">₹{selectedOrder.total.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Value</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                   <div className="space-y-6">
                      <div className="glass p-6 rounded-3xl">
                         <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Customer Details</h4>
                         <p className="text-sm font-black text-gray-800">{selectedOrder.user_name || 'Guest'}</p>
                         <p className="text-xs text-gray-500 font-medium mt-1">{selectedOrder.user_id}</p>
                         <p className="text-xs font-black text-purple-400 mt-2">📱 {selectedOrder.user_phone || 'Not provided'}</p>
                      </div>
                      <div className="glass p-6 rounded-3xl">
                         <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-4">Shipping Destination</h4>
                         <p className="text-xs font-bold text-gray-600 leading-relaxed italic">"{selectedOrder.address}"</p>
                      </div>
                   </div>

                   <div className="glass p-6 rounded-3xl flex flex-col justify-center text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estimated Dispatch By</p>
                      <p className="text-4xl font-serif font-black text-orange-600 tracking-tight">{selectedOrder.dispatch_date}</p>
                      <button 
                        onClick={() => handleMarkDispatched(selectedOrder.id)}
                        className="mt-8 bg-colorful-gradient text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                      >
                        Mark as Dispatched
                      </button>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Order Line Items</h4>
                   {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/40 p-6 rounded-3xl border border-white">
                         <div className="flex gap-4 items-center">
                            <div className="w-12 h-16 bg-white rounded-xl flex items-center justify-center font-black text-[10px] text-purple-300 shadow-sm border border-purple-50">SKU</div>
                            <div>
                               <p className="text-sm font-black text-gray-800">{item.product_id}</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.quantity} • Size: <span className="text-purple-600">{item.size_label}</span></p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Measurements (C/W/H)</p>
                            <p className="text-xs font-bold text-purple-500 tracking-tighter">{item.chest} / {item.waist} / {item.hip}</p>
                         </div>
                         <div className="text-right pl-8">
                            <p className="text-sm font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Manage Stock Modal */}
      {manageStockModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-vibrant w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp border border-white/40 p-8 text-center">
            <h3 className="text-xl font-serif font-black text-gray-900 tracking-tight mb-2">Manage Stock</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-6">
              {manageStockModal.productName} <br/> <span className="text-purple-600">Size: {manageStockModal.sizeLabel}</span>
            </p>
            
            <div className="mb-8">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">New Quantity</label>
              <input 
                type="number" 
                min="0"
                className="w-32 mx-auto text-center glass border-white/50 rounded-2xl p-4 text-2xl font-black focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                value={manageStockModal.newStock}
                onChange={(e) => setManageStockModal({ ...manageStockModal, newStock: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setManageStockModal(null)}
                className="flex-1 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all font-sans"
              >
                Cancel
              </button>
              <button 
                onClick={submitStockUpdate}
                className="flex-1 bg-colorful-gradient text-white px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all font-sans"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex justify-between items-center glass-vibrant p-6 rounded-[2rem] shadow-2xl animate-fadeIn">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tighter">
            Admin <span className="text-vibrant-gradient">Atelier</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-400 mt-1">Management Console</p>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-pink-600 transition-colors">Storefront</Link>
          <button onClick={handleLogout} className="bg-red-50 text-red-500 hover:bg-red-100 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            Logout
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-2 glass rounded-[2rem] overflow-x-auto no-scrollbar">
        {['inventory', 'orders', 'notifications', 'categories', 'lookbook', 'add-product'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-colorful-gradient text-white shadow-lg scale-105' 
                : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'}`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'inventory' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Detailed Inventory List */}
          <div className="glass-vibrant rounded-[2.5rem] shadow-xl overflow-hidden border border-white/40">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-center border-b border-white">
              <div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Product Inventory</h3>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Full Stock Listing</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-white/80 px-4 py-1 rounded-full text-[10px] font-black text-purple-600 shadow-sm">
                  {inventory.length} SKUs Listed
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/30 text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">
                    <th className="px-8 py-4">ID</th>
                    <th className="px-8 py-4">Product</th>
                    <th className="px-8 py-4">Size</th>
                    <th className="px-8 py-4">Stock</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {inventory.length === 0 ? (
                    <tr><td colSpan="5" className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No active inventory found</td></tr>
                  ) : (
                    inventory.map((item) => (
                      <tr key={item.id} className="hover:bg-white/40 transition-colors group">
                        <td className="px-8 py-4">
                          <span className="text-xs font-black text-purple-600 font-mono">#{item.product_id}</span>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-md">
                              <img 
                                src={item.product?.images?.[0] || 'https://via.placeholder.com/100x140?text=Dress'} 
                                alt={item.product?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-800 leading-tight">{item.product?.name || 'Unknown Product'}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.product?.fabric || 'Boutique Fabric'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-3 py-1 bg-white/60 border border-white/40 rounded-lg text-xs font-black text-purple-600 shadow-sm">{item.size_label}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`text-sm font-black px-3 py-1 rounded-full ${item.stock < 5 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                            {item.stock} In Stock
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button onClick={() => handleManageStock(item.id, item.stock, item.product?.name, item.size_label)} className="bg-white/60 hover:bg-white text-[10px] font-black text-gray-900 border border-white/40 px-4 py-2 rounded-xl uppercase tracking-widest transition-all hover:scale-105 shadow-sm">Manage</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-vibrant rounded-[2.5rem] shadow-xl overflow-hidden border border-white/40">
             <div className="px-8 py-6 bg-gradient-to-r from-orange-50 to-pink-50 flex justify-between items-center border-b border-white">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Vibrant Orders</h3>
                <span className="bg-white/80 px-4 py-1 rounded-full text-[10px] font-black text-orange-600 shadow-sm">{orders.length} Total</span>
             </div>
             <div className="divide-y divide-white/20">
                {orders.length === 0 ? (
                  <div className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Awaiting first boutique order...</div>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-8 hover:bg-white/40 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                           <p className="text-xs font-black text-orange-600 font-mono tracking-widest">{order.id}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{order.user_name || 'Guest'}</p>
                        </div>
                        <div className="flex gap-2">
                           <span className="px-4 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="glass p-4 rounded-2xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                           <p className="text-sm font-bold text-gray-800 truncate">{order.user_id}</p>
                        </div>
                        <div className="glass p-4 rounded-2xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                           <p className="text-sm font-black text-pink-600">₹{order.total.toLocaleString()}</p>
                        </div>
                        <div className="glass p-4 rounded-2xl">
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dispatch Date</p>
                           <p className="text-sm font-bold text-gray-800">{order.dispatch_date}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="bg-orange-50 text-orange-600 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        >
                          View Dispatch Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="glass-vibrant rounded-[2.5rem] shadow-xl overflow-hidden border border-white/40">
             <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center border-b border-white">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Auto-Pulse Logs</h3>
                <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Communication History</p>
             </div>
             <div className="divide-y divide-white/20">
                {notifications.length === 0 ? (
                  <div className="px-8 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No pulse logs available</div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-8 hover:bg-white/40 transition-all flex gap-6">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${notif.type === 'EMAIL' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
                        {notif.type === 'EMAIL' ? '📧' : '📱'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <p className="text-sm font-black text-gray-900 tracking-tight">Sent to: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">{notif.recipient}</span></p>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{notif.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 font-medium italic border-l-2 border-purple-100 pl-4 py-1">"{notif.content}"</p>
                        <p className="text-[10px] text-purple-400 mt-3 font-black uppercase tracking-widest">Ref Case: {notif.order_id}</p>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="glass-vibrant p-8 rounded-[2.5rem] shadow-xl border border-white/40">
            <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Expand Collections</h3>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input 
                required 
                className="glass border-white/50 rounded-2xl p-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all" 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                placeholder="Category Name (e.g. Silk Gowns)"
              />
              <input 
                className="glass border-white/50 rounded-2xl p-4 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all" 
                value={productForm.categoryDescription || ''} 
                onChange={e => setProductForm({...productForm, categoryDescription: e.target.value})} 
                placeholder="Description (Optional)"
              />
              <div className="glass border-white/50 rounded-2xl p-4 flex items-center justify-between">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover Image</p>
                <input 
                  type="file" 
                  onChange={e => setProductForm({...productForm, categoryImageFile: e.target.files[0]})}
                  className="text-[10px] font-black text-pink-600"
                />
              </div>
              <button type="submit" className="md:col-span-1 lg:col-span-3 bg-colorful-gradient text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 shadow-lg transition-all">Add Category</button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No collections established</div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="glass-vibrant rounded-[2rem] shadow-xl overflow-hidden group border border-white/40">
                    <div className="aspect-square overflow-hidden relative bg-gray-100">
                       {cat.image_url ? (
                           <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       ) : (
                           <div className="w-full h-full bg-gradient-to-tr from-pink-100 to-purple-200 flex items-center justify-center text-white font-bold opacity-80">No Cover</div>
                       )}
                       <button 
                        onClick={async () => {
                            if(window.confirm('Are you sure you want to delete this Category?')) {
                                try {
                                  await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/categories/${cat.id}`, {
                                    method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api/admin/categories`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  setCategories(await catRes.json());
                                } catch(e) { console.error(e) }
                            }
                        }}
                        className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                       >✕</button>
                    </div>
                    <div className="p-5 bg-white/40 backdrop-blur-md">
                       <h4 className="font-serif font-black text-gray-900 truncate">{cat.name}</h4>
                       {cat.description && <p className="text-[10px] text-gray-500 mt-1 font-medium truncate">{cat.description}</p>}
                       <span className="text-[10px] text-purple-400 font-black font-mono mt-3 inline-block">ID: {cat.id}</span>
                    </div>
                  </div>
                ))
              )}
          </div>
        </div>
      )}

      {activeTab === 'add-product' && (
        <div className="glass-vibrant p-10 rounded-[3rem] shadow-2xl border border-white/40 animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/20 blur-[100px] rounded-full -z-10"></div>
          <h3 className="text-3xl font-serif font-black text-gray-900 mb-10 tracking-tighter border-b-2 border-dashed border-purple-100 pb-6">Upload <span className="text-vibrant-gradient">Masterpiece</span></h3>
          <form onSubmit={handleUploadProduct} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product SKU/ID</label>
                <input required className="w-full glass border-white/50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none" value={productForm.id} onChange={e => setProductForm({...productForm, id: e.target.value})} placeholder="e.g. P501"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Creation Name</label>
                <input required className="w-full glass border-white/50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} placeholder="e.g. Royal Silk Set"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Boutique Collection</label>
                <select 
                  className="w-full glass border-white/50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none appearance-none cursor-pointer" 
                  value={productForm.category_id} 
                  onChange={e => setProductForm({...productForm, category_id: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Fabric Essence</label>
                <input required className="w-full glass border-white/50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none" value={productForm.fabric} onChange={e => setProductForm({...productForm, fabric: e.target.value})} placeholder="e.g. Pure Muga Silk"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Boutique Pricing (₹)</label>
                <input type="number" required className="w-full glass border-white/50 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Artisan Visuals</label>
                <div className="relative">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="w-full glass border-dashed border-2 border-purple-200 rounded-2xl p-4 text-xs font-black file:hidden cursor-pointer"
                    onChange={e => setSelectedFiles(e.target.files)}
                  />
                  <div className="absolute right-4 top-4 pointer-events-none">
                     <span className="text-purple-400 font-black text-[10px] uppercase tracking-widest">{selectedFiles.length > 0 ? `${selectedFiles.length} Selected` : 'Select Files'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Design Narrative</label>
              <textarea required className="w-full glass border-white/50 rounded-3xl p-6 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none" rows="4" value={productForm.base_description} onChange={e => setProductForm({...productForm, base_description: e.target.value})} placeholder="Describe the craftsmanship and fit details..."></textarea>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
                <h4 className="text-xs font-black text-purple-600 uppercase tracking-[0.2em]">Size & Measurement Matric</h4>
                <button type="button" onClick={addSizeRow} className="bg-white px-6 py-2 rounded-xl text-[10px] font-black text-purple-600 uppercase tracking-widest shadow-sm hover:bg-purple-600 hover:text-white transition-all">+ Add Unit</button>
              </div>
              <div className="space-y-3">
                {sizes.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-2 md:grid-cols-6 gap-3 glass p-6 rounded-3xl items-center border-white/60">
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Label</label><input className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.size_label} onChange={e => updateSize(idx, 'size_label', e.target.value)} placeholder="S/M/L"/></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chest</label><input type="number" className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.chest} onChange={e => updateSize(idx, 'chest', e.target.value)}/></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Waist</label><input type="number" className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.waist} onChange={e => updateSize(idx, 'waist', e.target.value)}/></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hip</label><input type="number" className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.hip} onChange={e => updateSize(idx, 'hip', e.target.value)}/></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Stock</label><input type="number" className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.stock} onChange={e => updateSize(idx, 'stock', e.target.value)}/></div>
                    <div className="space-y-1"><label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Note</label><input className="w-full bg-white/50 border-none p-2 rounded-xl text-xs font-black" value={s.note} onChange={e => updateSize(idx, 'note', e.target.value)} placeholder="Fit note"/></div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-colorful-gradient text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-all group">
               Deploy <span className="group-hover:translate-x-2 transition-transform inline-block">Product</span>
            </button>
            {uploadMessage && <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100"><p className="text-xs font-black text-purple-600 uppercase tracking-widest">{uploadMessage}</p></div>}
          </form>
        </div>
      )}
      {activeTab === 'lookbook' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="glass-vibrant p-8 rounded-[2.5rem] shadow-xl border border-white/40">
            <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Expand Lookbook</h3>
            <form onSubmit={handleAddLookbookItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                required 
                className="glass border-white/50 rounded-2xl p-4 text-xs font-black" 
                value={newLookbookItem.title} 
                onChange={e => setNewLookbookItem({...newLookbookItem, title: e.target.value})} 
                placeholder="Item Title (e.g. Royal Anarkali)"
              />
              <div className="md:col-span-2 glass border-white/50 rounded-2xl p-4 flex items-center justify-between">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Featured Visual</p>
                 <input 
                  type="file" 
                  required 
                  onChange={e => setNewLookbookItem({...newLookbookItem, file: e.target.files[0]})}
                  className="text-[10px] font-black text-pink-600"
                 />
              </div>
              <input 
                required 
                className="md:col-span-3 glass border-white/50 rounded-2xl p-4 text-xs font-black" 
                value={newLookbookItem.description} 
                onChange={e => setNewLookbookItem({...newLookbookItem, description: e.target.value})} 
                placeholder="High-end description for the gallery..."
              />
              <button type="submit" className="md:col-span-3 bg-colorful-gradient text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 shadow-lg transition-all">Upload to Lookbook</button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lookbook.map((item) => (
              <div key={item.id} className="glass-vibrant rounded-[2rem] shadow-xl overflow-hidden group border border-white/40">
                <div className="aspect-[3/4] overflow-hidden relative">
                   <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <button 
                    onClick={() => handleDeleteLookbookItem(item.id)}
                    className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                   >✕</button>
                </div>
                <div className="p-6">
                   <h4 className="font-serif font-black text-gray-900 truncate">{item.title}</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 truncate">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
