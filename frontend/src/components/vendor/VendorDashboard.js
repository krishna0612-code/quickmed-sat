import React, { useState, useEffect, useCallback, useRef } from 'react';
import VendorModals from './VendorModals';
import VendorSidebar from './VendorSidebar';
import VendorStockManagement from './VendorStockManagement';
import VendorOrdersManagement from './VendorOrdersManagement';
import VendorPrescriptionVerification from './VendorPrescriptionVerification';
import VendorAnalytics from './VendorAnalytics';
import VendorProfile from './VendorProfile';
import { initialData, user as defaultUser, navigationItems, stockFilters, getOrderTabs } from './VendorData';

const VendorDashboard = ({ user = defaultUser, onLogout }) => {
  const [activePage, setActivePage] = useState('stock');
  const [stockFilter, setStockFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('week');
  
  // State for real-time features
  const [stock, setStock] = useState([]);
  const [orders, setOrders] = useState({ pending: [], ready: [], picked: [], cancelled: [] });
  const [prescriptions, setPrescriptions] = useState([]);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showNotificationsBellModal, setShowNotificationsBellModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', isUser: false }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    category: '',
    quantity: '',
    minStock: '',
    price: '',
    expiryDate: '',
    prescriptionRequired: false,
    supplier: '',
    batchNo: ''
  });

  // Get user from localStorage if not provided as prop
  const getUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    return null;
  };

  // Initialize user profile state - will be populated from API
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    pharmacyName: '',
    licenseNumber: '',
    gstNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    openingTime: '',
    closingTime: ''
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    lowStock: true,
    expiringMedicines: true,
    prescriptionVerification: true,
    orderReady: true,
    soundEnabled: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true
  });

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order ORD-001 from Priya Sharma',
      time: '2 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'prescription',
      title: 'Prescription Uploaded',
      message: 'New prescription from Amit Kumar needs verification',
      time: '5 mins ago',
      read: false
    },
    {
      id: 3,
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Paracetamol 500mg is running low',
      time: '1 hour ago',
      read: false
    }
  ]);

  // Form validation functions
  const validateField = (fieldName, value) => {
    let error = '';
    const stringValue = value ? String(value).trim() : '';
    
    switch (fieldName) {
      case 'phone':
        const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        if (!stringValue) {
          error = 'Phone number is required';
        } else if (!phoneRegex.test(stringValue.replace(/\s/g, ''))) {
          error = 'Please enter a valid Indian phone number';
        }
        break;
        
      case 'pharmacyName':
        if (!stringValue) {
          error = 'Pharmacy name is required';
        } else if (stringValue.length < 2) {
          error = 'Pharmacy name must be at least 2 characters long';
        }
        break;
        
      case 'licenseNumber':
        if (!stringValue) {
          error = 'License number is required';
        } else if (stringValue.length < 5) {
          error = 'License number must be at least 5 characters long';
        }
        break;

      case 'gstNumber':
        const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
        if (!stringValue) {
          error = 'GST number is required';
        } else if (!gstRegex.test(stringValue)) {
          error = 'Please enter a valid GST number';
        }
        break;
        
      case 'address':
        if (!stringValue) {
          error = 'Address is required';
        } else if (stringValue.length < 10) {
          error = 'Address must be at least 10 characters long';
        }
        break;
        
      case 'city':
        const cityRegex = /^[A-Za-z\s]+$/;
        if (!stringValue) {
          error = 'City is required';
        } else if (!cityRegex.test(stringValue)) {
          error = 'City should contain only letters and spaces';
        }
        break;
        
      case 'state':
        const stateRegex = /^[A-Za-z\s]+$/;
        if (!stringValue) {
          error = 'State is required';
        } else if (!stateRegex.test(stringValue)) {
          error = 'State should contain only letters and spaces';
        }
        break;
        
      case 'pincode':
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!stringValue) {
          error = 'Pincode is required';
        } else if (!pincodeRegex.test(stringValue)) {
          error = 'Please enter a valid 6-digit pincode';
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error;
  };

  const validateForm = () => {
    const errors = {};
    
    errors.phone = validateField('phone', userProfile.phone);
    errors.pharmacyName = validateField('pharmacyName', userProfile.pharmacyName);
    errors.licenseNumber = validateField('licenseNumber', userProfile.licenseNumber);
    errors.gstNumber = validateField('gstNumber', userProfile.gstNumber);
    errors.address = validateField('address', userProfile.address);
    errors.city = validateField('city', userProfile.city);
    errors.state = validateField('state', userProfile.state);
    errors.pincode = validateField('pincode', userProfile.pincode);
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  // Fetch vendor profile from API - always fetch on mount
  const fetchVendorProfile = useCallback(async () => {
    console.log('=== fetchVendorProfile called ===');
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    // Always get user from localStorage on refresh (more reliable than prop)
    const currentUser = user || getUserFromStorage();
    console.log('Current user:', currentUser?.email);
    
    if (!token) {
      console.warn('No token found, cannot fetch profile from API');
      // Still set basic user info from localStorage
      if (currentUser) {
        setUserProfile({
          fullName: currentUser.fullName || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          pharmacyName: '',
          licenseNumber: '',
          gstNumber: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          openingTime: '',
          closingTime: ''
        });
      }
      return;
    }
    
    // Verify we have a user before fetching
    if (!currentUser) {
      console.warn('No user data available, cannot fetch profile');
      return;
    }
    
    try {
      console.log('Fetching vendor profile from API...');
      const response = await fetch('http://127.0.0.1:8000/users/vendor-profile/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile fetch response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Profile data received from API:', data);
        
        // Helper function to safely get values (handle null, undefined, empty string)
        const safeValue = (value, fallback = '') => {
          if (value === null || value === undefined) return fallback;
          if (typeof value === 'string' && value.trim() === '') return fallback;
          return value;
        };
        
        const updatedProfile = {
          fullName: safeValue(data.fullName, currentUser?.fullName || ''),
          email: safeValue(data.email, currentUser?.email || ''),
          phone: safeValue(data.phone, currentUser?.phone || ''),
          pharmacyName: safeValue(data.pharmacyName, ''),
          licenseNumber: safeValue(data.licenseNumber, ''),
          gstNumber: safeValue(data.gstNumber, ''),
          address: safeValue(data.address, ''),
          city: safeValue(data.city, ''),
          state: safeValue(data.state, ''),
          pincode: safeValue(data.pincode, ''),
          openingTime: safeValue(data.openingTime, ''),
          closingTime: safeValue(data.closingTime, '')
        };
        
        console.log('Setting profile state with:', updatedProfile);
        setUserProfile(updatedProfile);
        console.log('Profile state updated successfully');
      } else {
        console.error('Profile fetch failed with status:', response.status);
        console.error('Response:', responseText);
        // If profile doesn't exist yet, initialize with user data
        if (currentUser) {
          setUserProfile(prev => ({
            ...prev,
            fullName: currentUser.fullName || prev.fullName || '',
            email: currentUser.email || prev.email || '',
            phone: currentUser.phone || prev.phone || ''
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      // Fallback to user data if API fails
      if (currentUser) {
        setUserProfile(prev => ({
          ...prev,
          fullName: currentUser.fullName || prev.fullName || '',
          email: currentUser.email || prev.email || '',
          phone: currentUser.phone || prev.phone || ''
        }));
      }
    }
  }, [user]);

  // Fetch medicines from API on mount
  const fetchMedicines = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, cannot fetch medicines');
      setStock([]);
      return;
    }

    try {
      const cleanedToken = token.replace(/^"|"$/g, '').trim();
      const response = await fetch('http://127.0.0.1:8000/vendor/medicines/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedToken}`
        }
      });

      if (response.ok) {
        const medicines = await response.json();
        console.log('Medicines fetched from API:', medicines);
        // Convert backend date format (dd-mm-yyyy) to yyyy-mm-dd for HTML date input
        const formattedMedicines = medicines.map(med => ({
          ...med,
          expiryDate: convertDateToInputFormat(med.expiryDate || med.expiry_date || '')
        }));
        setStock(formattedMedicines);
      } else {
        console.error('Failed to fetch medicines:', response.status);
        setStock([]);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setStock([]);
    }
  }, []);

  // Fetch orders from backend
  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, using initial orders');
      setOrders(initialData.orders);
      return;
    }

    try {
      const cleanedToken = token.replace(/^"|"$/g, '').trim();
      console.log('Fetching orders from API...');
      const response = await fetch('http://127.0.0.1:8000/users/orders/vendor/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedToken}`
        }
      });

      console.log('Orders API response status:', response.status);

      if (response.ok) {
        const ordersData = await response.json();
        console.log('Orders fetched from API:', ordersData);
        console.log('Pending orders count:', ordersData.pending?.length || 0);
        
        // Backend returns orders grouped by status
        // Map to frontend format
        const formattedOrders = {
          pending: (ordersData.pending || []).map(order => ({
            id: order.id || order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items || [],
            total: order.total || 0,
            orderTime: order.orderTime || new Date(order.date).toLocaleString(),
            deliveryType: order.deliveryType || 'home',
            address: order.address || '',
            prescriptionRequired: order.prescriptionRequired || false
          })),
          ready: (ordersData.ready || []).map(order => ({
            id: order.id || order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items || [],
            total: order.total || 0,
            orderTime: order.orderTime || new Date(order.date).toLocaleString(),
            deliveryType: order.deliveryType || 'home',
            address: order.address || '',
            prescriptionRequired: order.prescriptionRequired || false
          })),
          picked: (ordersData.picked || []).map(order => ({
            id: order.id || order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items || [],
            total: order.total || 0,
            orderTime: order.orderTime || new Date(order.date).toLocaleString(),
            deliveryType: order.deliveryType || 'home',
            address: order.address || '',
            prescriptionRequired: order.prescriptionRequired || false
          })),
          cancelled: (ordersData.cancelled || []).map(order => ({
            id: order.id || order.orderId,
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            items: order.items || [],
            total: order.total || 0,
            orderTime: order.orderTime || new Date(order.date).toLocaleString(),
            deliveryType: order.deliveryType || 'home',
            address: order.address || '',
            prescriptionRequired: order.prescriptionRequired || false
          }))
        };
        
        console.log('Formatted orders:', formattedOrders);
        setOrders(formattedOrders);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch orders. Status:', response.status, 'Error:', errorText);
        // Fallback to initial orders
        setOrders(initialData.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to initial orders
      setOrders(initialData.orders);
    }
  }, []);

  // Initialize state - fetch medicines and orders from API
  useEffect(() => {
    fetchMedicines();
    fetchOrders();
    setPrescriptions(initialData.prescriptions);
  }, [fetchMedicines, fetchOrders]);

  // Auto-refresh orders every 10 seconds when on orders page
  useEffect(() => {
    if (activePage === 'orders') {
      const interval = setInterval(() => {
        console.log('Auto-refreshing orders...');
        fetchOrders();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [activePage, fetchOrders]);

  // Reset profile when user changes (different vendor logs in)
  // Use a ref to track previous user email to detect changes
  const prevUserEmailRef = useRef(null);
  
  useEffect(() => {
    const currentUserEmail = user?.email || getUserFromStorage()?.email;
    
    // Only reset if user email actually changed
    if (currentUserEmail && currentUserEmail !== prevUserEmailRef.current) {
      console.log('User changed detected! Previous:', prevUserEmailRef.current, 'New:', currentUserEmail);
      prevUserEmailRef.current = currentUserEmail;
      
      // Reset profile to empty state first
      setUserProfile({
        fullName: '',
        email: '',
        phone: '',
        pharmacyName: '',
        licenseNumber: '',
        gstNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        openingTime: '',
        closingTime: ''
      });
      
      // Small delay to ensure state is reset, then fetch new user's profile
      setTimeout(() => {
        fetchVendorProfile();
      }, 200);
    } else if (currentUserEmail) {
      // Update ref even if not changed (first load)
      prevUserEmailRef.current = currentUserEmail;
    }
  }, [user?.email, fetchVendorProfile]);

  // Fetch vendor profile on mount - ALWAYS run on component mount
  useEffect(() => {
    console.log('=== Component mounted, fetching profile ===');
    // Small delay to ensure localStorage is ready
    const timer = setTimeout(() => {
      fetchVendorProfile();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []); // Empty deps - run only on mount

  // Real-time prescription updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1 && prescriptions.length < 5) {
        const newPrescription = {
          id: prescriptions.length + 1,
          orderId: `ORD-00${prescriptions.length + 3}`,
          customerName: 'New Customer',
          doctorName: 'Dr. New',
          uploadedTime: new Date().toLocaleString(),
          status: 'pending',
          medicines: ['New Medicine 250mg', 'Another Medicine 500mg'],
          imageUrl: 'https://via.placeholder.com/400x500?text=New+Prescription'
        };
        setPrescriptions(prev => [...prev, newPrescription]);
        
        if (notificationSettings.prescriptionVerification) {
          showNotification('New Prescription Uploaded', `New prescription received from ${newPrescription.customerName}`);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [prescriptions.length, notificationSettings.prescriptionVerification]);

  // Simulate new order notifications
  useEffect(() => {
    const orderInterval = setInterval(() => {
      if (Math.random() < 0.05 && orders.pending.length < 10) {
        const newOrder = {
          id: `ORD-00${orders.pending.length + orders.ready.length + orders.picked.length + orders.cancelled.length + 1}`,
          customerName: 'New Customer',
          customerPhone: '+91 98765 43299',
          items: [
            { name: 'Paracetamol 500mg', quantity: 1, price: 15 }
          ],
          total: 15,
          orderTime: new Date().toLocaleString(),
          deliveryType: Math.random() > 0.5 ? 'home' : 'pickup',
          address: 'New Address, Sector 62, Noida',
          prescriptionRequired: false
        };
        
        setOrders(prev => ({
          ...prev,
          pending: [...prev.pending, newOrder]
        }));
        
        if (notificationSettings.newOrders) {
          showNotification('New Order Received', `Order ${newOrder.id} from ${newOrder.customerName}`);
        }
      }
    }, 15000);

    return () => clearInterval(orderInterval);
  }, [orders, notificationSettings.newOrders]);

  const formatIndianCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper function to convert dd-mm-yyyy to yyyy-mm-dd (for HTML date input)
  const convertDateToInputFormat = (dateStr) => {
    if (!dateStr) return '';
    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // If in dd-mm-yyyy format, convert to yyyy-mm-dd
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  // Helper function to convert yyyy-mm-dd to dd-mm-yyyy (for display/API)
  const convertDateToDisplayFormat = (dateStr) => {
    if (!dateStr) return '';
    // If in yyyy-mm-dd format, convert to dd-mm-yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    // If already in dd-mm-yyyy format, return as is
    return dateStr;
  };

  // Helper function to format date for display in table (dd-mm-yyyy)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    // If in yyyy-mm-dd format, convert to dd-mm-yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}-${month}-${year}`;
    }
    // If already in dd-mm-yyyy format, return as is
    return dateStr;
  };

  const isLowStock = (medicine) => medicine.quantity <= medicine.minStock;
  
  // Helper to parse date string to Date object (handles both yyyy-mm-dd and dd-mm-yyyy)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Try yyyy-mm-dd format first
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr);
    }
    // Try dd-mm-yyyy format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split('-');
      return new Date(`${year}-${month}-${day}`);
    }
    // Fallback to Date constructor
    return new Date(dateStr);
  };

  const isExpiringSoon = (medicine) => {
    const expiryDate = parseDate(medicine.expiryDate);
    if (!expiryDate || isNaN(expiryDate.getTime())) return false;
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const isExpired = (medicine) => {
    const expiryDate = parseDate(medicine.expiryDate);
    if (!expiryDate || isNaN(expiryDate.getTime())) return false;
    const today = new Date();
    return expiryDate < today;
  };

  // Enhanced search functionality
  const filteredStock = stock.filter(medicine => {
    const matchesSearch = searchTerm === '' || 
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.batchNo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (stockFilter) {
      case 'low':
        return isLowStock(medicine);
      case 'expiring':
        return isExpiringSoon(medicine);
      case 'prescription':
        return medicine.prescriptionRequired;
      default:
        return true;
    }
  });

  // Search handlers
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Chat handlers
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = { id: chatMessages.length + 1, text: newMessage, isUser: true };
      setChatMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = { 
          id: chatMessages.length + 2, 
          text: 'Thank you for your message. Our support team will get back to you shortly.', 
          isUser: false 
        };
        setChatMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const showNotification = (title, message) => {
    console.log(`Notification: ${title} - ${message}`);
    // Add to notifications list
    const newNotification = {
      id: notifications.length + 1,
      type: getNotificationType(title),
      title,
      message,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getNotificationType = (title) => {
    if (title.includes('Order')) return 'order';
    if (title.includes('Prescription')) return 'prescription';
    if (title.includes('Stock') || title.includes('Expiring')) return 'stock';
    return 'system';
  };

  // Medicine Management Functions
  const handleAddMedicine = async () => {
    console.log('=== handleAddMedicine called ===');
    console.log('newMedicine state:', newMedicine);
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      showNotification('Error', 'Please login again');
      return;
    }

    const cleanedToken = token.replace(/^"|"$/g, '').trim();
    console.log('Token cleaned, first 20 chars:', cleanedToken.substring(0, 20) + '...');

    // Validate required fields
    if (!newMedicine.name || !newMedicine.category || !newMedicine.expiryDate) {
      console.error('Missing required fields:', {
        name: !!newMedicine.name,
        category: !!newMedicine.category,
        expiryDate: !!newMedicine.expiryDate
      });
      showNotification('Error', 'Please fill in all required fields');
      return;
    }

    // Prepare medicine data for API
    // Send date in YYYY-MM-DD format (HTML date input already provides this)
    // The backend serializer accepts both YYYY-MM-DD and dd-mm-yyyy, but YYYY-MM-DD is preferred
    let expiryDateValue = newMedicine.expiryDate;
    
    // Ensure date is in YYYY-MM-DD format
    if (expiryDateValue && /^\d{2}-\d{2}-\d{4}$/.test(expiryDateValue)) {
      // If in dd-mm-yyyy format, convert to yyyy-mm-dd
      const [day, month, year] = expiryDateValue.split('-');
      expiryDateValue = `${year}-${month}-${day}`;
    }
    
    console.log('Date format:', { original: newMedicine.expiryDate, final: expiryDateValue });
    
    const medicineData = {
      name: newMedicine.name.trim(),
      category: newMedicine.category.trim(),
      quantity: parseInt(newMedicine.quantity) || 0,
      minStock: parseInt(newMedicine.minStock) || 0,
      price: parseFloat(newMedicine.price) || 0,
      expiryDate: expiryDateValue, // Send in YYYY-MM-DD format
      prescriptionRequired: newMedicine.prescriptionRequired || false,
      supplier: (newMedicine.supplier || '').trim(),
      batchNo: (newMedicine.batchNo || '').trim()
    };

    console.log('Medicine data to send:', medicineData);

    try {
      console.log('Sending POST request to:', 'http://127.0.0.1:8000/vendor/medicines/');
      const response = await fetch('http://127.0.0.1:8000/vendor/medicines/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedToken}`
        },
        body: JSON.stringify(medicineData)
      });

      console.log('Response status:', response.status, response.statusText);

      if (response.ok) {
        const savedMedicine = await response.json();
        console.log('✅ Medicine saved to database:', savedMedicine);
        
        // Convert date format for frontend display
        const formattedMedicine = {
          ...savedMedicine,
          expiryDate: convertDateToInputFormat(savedMedicine.expiryDate)
        };
        
        // Update local state with the saved medicine (includes backend ID)
        setStock(prev => [...prev, formattedMedicine]);
        setShowAddMedicineModal(false);
        setNewMedicine({
          name: '',
          category: '',
          quantity: '',
          minStock: '',
          price: '',
          expiryDate: '',
          prescriptionRequired: false,
          supplier: '',
          batchNo: ''
        });
        
        showNotification('Medicine Added', `${savedMedicine.name} has been added to inventory`);
      } else {
        let errorMessage = 'Failed to add medicine. Please try again.';
        try {
          const errorData = await response.json();
          console.error('❌ Failed to save medicine. Response:', errorData);
          console.error('Response status:', response.status);
          
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          } else if (typeof errorData === 'object') {
            // Check for field-specific errors
            const errorFields = Object.keys(errorData);
            if (errorFields.length > 0) {
              const firstError = errorData[errorFields[0]];
              errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('Raw error response:', responseText);
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        
        console.error('Final error message:', errorMessage);
        showNotification('Error', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error saving medicine:', error);
      const errorMsg = error.message || 'Network error. Please check if the backend server is running.';
      showNotification('Error', errorMsg);
      alert(`Network Error: ${errorMsg}`);
    }
  };

  const handleEditMedicine = (medicine) => {
    // Ensure date is in correct format for HTML input (yyyy-mm-dd)
    const medicineWithFormattedDate = {
      ...medicine,
      expiryDate: convertDateToInputFormat(medicine.expiryDate)
    };
    setEditingMedicine(medicineWithFormattedDate);
    setShowEditStockModal(true);
  };

  const handleUpdateStock = async () => {
    if (!editingMedicine || !editingMedicine.id) {
      showNotification('Error', 'Invalid medicine data');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Error', 'Please login again');
      return;
    }

    const cleanedToken = token.replace(/^"|"$/g, '').trim();

    // Prepare update data
    // Send date in YYYY-MM-DD format (HTML date input already provides this)
    let expiryDateValue = editingMedicine.expiryDate;
    
    // Ensure date is in YYYY-MM-DD format
    if (expiryDateValue && /^\d{2}-\d{2}-\d{4}$/.test(expiryDateValue)) {
      // If in dd-mm-yyyy format, convert to yyyy-mm-dd
      const [day, month, year] = expiryDateValue.split('-');
      expiryDateValue = `${year}-${month}-${day}`;
    }
    
    const updateData = {
      name: editingMedicine.name,
      category: editingMedicine.category,
      quantity: parseInt(editingMedicine.quantity) || 0,
      minStock: parseInt(editingMedicine.minStock) || 0,
      price: parseFloat(editingMedicine.price) || 0,
      expiryDate: expiryDateValue, // Send in YYYY-MM-DD format
      prescriptionRequired: editingMedicine.prescriptionRequired || false,
      supplier: editingMedicine.supplier || '',
      batchNo: editingMedicine.batchNo || ''
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/vendor/medicines/${editingMedicine.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedToken}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedMedicine = await response.json();
        console.log('Medicine updated in database:', updatedMedicine);
        
        // Convert date format for frontend display
        const formattedMedicine = {
          ...updatedMedicine,
          expiryDate: convertDateToInputFormat(updatedMedicine.expiryDate)
        };
        
        // Update local state
        setStock(prev => prev.map(med => 
          med.id === editingMedicine.id ? formattedMedicine : med
        ));
        setShowEditStockModal(false);
        setEditingMedicine(null);
        showNotification('Stock Updated', `${updatedMedicine.name} stock has been updated`);
      } else {
        const errorData = await response.json();
        console.error('Failed to update medicine:', errorData);
        showNotification('Error', errorData.detail || errorData.error || 'Failed to update medicine. Please try again.');
      }
    } catch (error) {
      console.error('Error updating medicine:', error);
      showNotification('Error', 'Network error. Please try again.');
    }
  };

  // Profile Management Functions
  const handleProfileUpdate = async () => {
    console.log('handleProfileUpdate called', userProfile);
    
    // Validate form
    const isValid = validateForm();
    console.log('Form validation result:', isValid, formErrors);
    
    if (!isValid) {
      showNotification('Validation Error', 'Please fix all validation errors before updating');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Error', 'Please login again');
      return;
    }
    
    // Prepare data for API
    const updateData = {
      pharmacyName: userProfile.pharmacyName || '',
      licenseNumber: userProfile.licenseNumber || '',
      gstNumber: userProfile.gstNumber || '',
      address: userProfile.address || '',
      city: userProfile.city || '',
      state: userProfile.state || '',
      pincode: userProfile.pincode || '',
      openingTime: userProfile.openingTime || '',
      closingTime: userProfile.closingTime || ''
    };
    
    console.log('Sending update request:', updateData);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/users/vendor-profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedData = await response.json();
        console.log('Profile updated successfully:', updatedData);
        
        // Helper function to safely get values
        const safeValue = (value, fallback = '') => {
          return (value !== null && value !== undefined && value !== '') ? value : fallback;
        };
        
        // Update userProfile with the response data to ensure consistency
        const updatedProfile = {
          fullName: safeValue(updatedData.fullName, userProfile.fullName || ''),
          email: safeValue(updatedData.email, userProfile.email || ''),
          phone: safeValue(updatedData.phone, userProfile.phone || ''),
          pharmacyName: safeValue(updatedData.pharmacyName, ''),
          licenseNumber: safeValue(updatedData.licenseNumber, ''),
          gstNumber: safeValue(updatedData.gstNumber, ''),
          address: safeValue(updatedData.address, ''),
          city: safeValue(updatedData.city, ''),
          state: safeValue(updatedData.state, ''),
          pincode: safeValue(updatedData.pincode, ''),
          openingTime: safeValue(updatedData.openingTime, ''),
          closingTime: safeValue(updatedData.closingTime, '')
        };
        
        console.log('Setting updated profile:', updatedProfile);
        setUserProfile(updatedProfile);
        setShowProfileModal(false);
        setFormErrors({});
        showNotification('Profile Updated', 'Your profile has been updated successfully');
        
        // Refetch after a short delay to ensure database is updated
        setTimeout(() => {
          console.log('Refetching profile after update...');
          fetchVendorProfile();
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        showNotification('Update Failed', errorData.error || errorData.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Error', 'Failed to update profile. Please try again.');
    }
  };

  // Notification Settings Functions
  const handleSaveNotificationSettings = () => {
    console.log('Notification settings saved:', notificationSettings);
    setShowNotificationsModal(false);
    showNotification('Settings Saved', 'Notification settings updated successfully');
  };

  // Notifications Functions
  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Order Management Functions
  const updateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Error', 'Please login again');
      return false;
    }

    try {
      const cleanedToken = token.replace(/^"|"$/g, '').trim();
      const response = await fetch(`http://127.0.0.1:8000/users/orders/${orderId}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanedToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        console.log('Order status updated successfully, refreshing orders...');
        // Refetch orders to get updated data
        await fetchOrders();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to update order status:', errorData);
        showNotification('Error', errorData.error || 'Failed to update order status');
        return false;
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showNotification('Error', 'Failed to update order status. Please try again.');
      return false;
    }
  };

  const markOrderReady = async (orderId) => {
    const order = orders.pending.find(o => o.id === orderId);
    if (order) {
      const success = await updateOrderStatus(orderId, 'ready');
      if (success) {
        setSelectedOrder(null);
        if (notificationSettings.orderReady) {
          showNotification('Order Ready', `Order ${orderId} is now ready for ${order.deliveryType === 'pickup' ? 'pickup' : 'delivery'}`);
        }
      }
    }
  };

  const markOrderPicked = async (orderId) => {
    const order = orders.ready.find(o => o.id === orderId);
    if (order) {
      const success = await updateOrderStatus(orderId, 'picked');
      if (success) {
        setSelectedOrder(null);
        showNotification('Order Picked', `Order ${orderId} has been marked as picked`);
      }
    }
  };

  const printLabel = (orderId) => {
    alert(`Printing label for order ${orderId}`);
  };

  const cancelOrder = async (orderId) => {
    const order = orders.pending.find(o => o.id === orderId);
    if (order) {
      const success = await updateOrderStatus(orderId, 'cancelled');
      if (success) {
        setSelectedOrder(null);
        showNotification('Order Cancelled', `Order ${orderId} has been cancelled`);
      }
    }
  };

  // Prescription Verification Functions
  const approvePrescription = (prescriptionId) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionId ? { ...p, status: 'approved' } : p
    ));
    
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      const order = orders.pending.find(o => o.id === prescription.orderId);
      if (order) {
        markOrderReady(prescription.orderId);
      }
    }
    
    setSelectedPrescription(null);
  };

  const rejectPrescription = (prescriptionId) => {
    setPrescriptions(prev => prev.map(p => 
      p.id === prescriptionId ? { ...p, status: 'rejected' } : p
    ));
    
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      cancelOrder(prescription.orderId);
    }
    
    setSelectedPrescription(null);
  };

  const messageDoctor = (prescriptionId) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      const message = `Need clarification for prescription ${prescriptionId} for order ${prescription.orderId}`;
      alert(`Messaging Dr. ${prescription.doctorName}: ${message}`);
    }
  };

  // Logout function
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear profile data before logout
    setUserProfile({
      fullName: '',
      email: '',
      phone: '',
      pharmacyName: '',
      licenseNumber: '',
      gstNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      openingTime: '',
      closingTime: ''
    });
    setShowLogoutModal(false);
    // Clear token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    if (onLogout) {
      onLogout();
    }
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Handle vendor click - go directly to profile page
  const handleVendorClick = () => {
    setActivePage('profile');
    setShowMobileMenu(false);
  };

  // Analytics data
  const analyticsData = {
    kpis: {
      ordersToday: 24,
      avgFulfillment: '32 mins',
      splitOrders: 3,
      revenue: 8450
    },
    orderTrends: [
      { day: 'Mon', orders: 18, revenue: 6200 },
      { day: 'Tue', orders: 22, revenue: 7400 },
      { day: 'Wed', orders: 25, revenue: 8100 },
      { day: 'Thu', orders: 20, revenue: 6800 },
      { day: 'Fri', orders: 28, revenue: 9200 },
      { day: 'Sat', orders: 35, revenue: 11500 },
      { day: 'Sun', orders: 30, revenue: 9800 }
    ],
    topLocalities: [
      { area: 'Sector 15', orders: 45 },
      { area: 'Sector 18', orders: 38 },
      { area: 'Sector 62', orders: 32 },
      { area: 'Sector 128', orders: 28 },
      { area: 'Sector 137', orders: 25 }
    ]
  };

  // Get dynamic order tabs based on current orders state
  const orderTabs = getOrderTabs(orders);

  const renderMainContent = () => {
    switch (activePage) {
      case 'stock':
        return (
          <VendorStockManagement
            userProfile={userProfile}
            stockFilter={stockFilter}
            stock={stock}
            searchTerm={searchTerm}
            filteredStock={filteredStock}
            stockFilters={stockFilters}
            formatIndianCurrency={formatIndianCurrency}
            getCurrentGreeting={getCurrentGreeting}
            isLowStock={isLowStock}
            isExpiringSoon={isExpiringSoon}
            isExpired={isExpired}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            handleEditMedicine={handleEditMedicine}
            setShowAddMedicineModal={setShowAddMedicineModal}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            notifications={notifications}
            setStockFilter={setStockFilter}
            formatDateForDisplay={formatDateForDisplay}
          />
        );
      case 'orders':
        return (
          <VendorOrdersManagement
            orderFilter={orderFilter}
            selectedOrder={selectedOrder}
            orders={orders}
            orderTabs={orderTabs}
            formatIndianCurrency={formatIndianCurrency}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            notifications={notifications}
            setSelectedOrder={setSelectedOrder}
            markOrderReady={markOrderReady}
            markOrderPicked={markOrderPicked}
            printLabel={printLabel}
            cancelOrder={cancelOrder}
            setOrderFilter={setOrderFilter}
          />
        );
      case 'prescriptions':
        return (
          <VendorPrescriptionVerification
            selectedPrescription={selectedPrescription}
            prescriptions={prescriptions}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            notifications={notifications}
            setSelectedPrescription={setSelectedPrescription}
            approvePrescription={approvePrescription}
            rejectPrescription={rejectPrescription}
            messageDoctor={messageDoctor}
          />
        );
      case 'analytics':
        return (
          <VendorAnalytics
            analyticsData={analyticsData}
            formatIndianCurrency={formatIndianCurrency}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            notifications={notifications}
          />
        );
      case 'profile':
        return (
          <VendorProfile
            userProfile={userProfile}
            stock={stock}
            orders={orders}
            prescriptions={prescriptions}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            setShowProfileModal={setShowProfileModal}
            notifications={notifications}
          />
        );
      default:
        return (
          <VendorStockManagement
            userProfile={userProfile}
            stockFilter={stockFilter}
            stock={stock}
            searchTerm={searchTerm}
            filteredStock={filteredStock}
            stockFilters={stockFilters}
            formatIndianCurrency={formatIndianCurrency}
            getCurrentGreeting={getCurrentGreeting}
            isLowStock={isLowStock}
            isExpiringSoon={isExpiringSoon}
            isExpired={isExpired}
            handleSearchChange={handleSearchChange}
            handleClearSearch={handleClearSearch}
            handleEditMedicine={handleEditMedicine}
            setShowAddMedicineModal={setShowAddMedicineModal}
            setShowNotificationsBellModal={setShowNotificationsBellModal}
            notifications={notifications}
            setStockFilter={setStockFilter}
            formatDateForDisplay={formatDateForDisplay}
          />
        );
    }
  };

  const modalsProps = {
    showAddMedicineModal,
    setShowAddMedicineModal,
    showEditStockModal,
    setShowEditStockModal,
    showProfileModal,
    setShowProfileModal,
    showNotificationsModal,
    setShowNotificationsModal,
    showNotificationsBellModal,
    setShowNotificationsBellModal,
    showChatModal,
    setShowChatModal,
    showLogoutModal,
    setShowLogoutModal,
    newMedicine,
    setNewMedicine,
    editingMedicine,
    setEditingMedicine,
    userProfile,
    setUserProfile,
    notificationSettings,
    setNotificationSettings,
    notifications,
    chatMessages,
    newMessage,
    setNewMessage,
    formErrors,
    validateField,
    handleAddMedicine,
    handleUpdateStock,
    handleProfileUpdate,
    handleSaveNotificationSettings,
    handleClearAllNotifications,
    handleSendMessage,
    confirmLogout
  };

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  };

  const mobileHeaderStyle = {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7C2A62',
    color: 'white',
    padding: '12px 16px',
    zIndex: 999,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    '@media (max-width: 768px)': {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  };

  const mobileMenuButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  };

  const mobileLogoStyle = {
    textAlign: 'center',
    flex: 1
  };

  const mobileActionsStyle = {
    display: 'flex',
    gap: '8px'
  };

  const notificationBellStyle = {
    position: 'relative',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const notificationBadgeStyle = {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#EF4444',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600'
  };

  const logoStyle = {
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 4px 0',
    color: 'white',
    letterSpacing: '0.5px'
  };

  const vendorTitleStyle = {
    fontSize: '12px',
    opacity: 0.8,
    margin: 0,
    fontWeight: '400'
  };

  const contentStyle = {
    flex: 1,
    marginLeft: '280px',
    padding: '0',
    minHeight: '100vh',
    '@media (max-width: 768px)': {
      marginLeft: '0',
      marginTop: '60px'
    }
  };

  const mobileOverlayStyle = {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
    '@media (max-width: 768px)': {
      display: 'block'
    }
  };

  const chatbotWidgetStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000
  };

  const chatbotWidgetButtonStyle = {
    backgroundColor: '#7C2A62',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    fontSize: '24px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div style={containerStyle}>
      {/* Mobile Header */}
      <div style={mobileHeaderStyle}>
        <button 
          style={mobileMenuButtonStyle}
          onClick={toggleMobileMenu}
        >
          ☰
        </button>
        <div style={mobileLogoStyle}>
          <h1 style={logoStyle}>QUICKMED</h1>
          <p style={vendorTitleStyle}>Vendor Portal</p>
        </div>
        <div style={mobileActionsStyle}>
          <button 
            style={notificationBellStyle}
            onClick={() => setShowNotificationsBellModal(true)}
          >
            🔔
            {notifications.length > 0 && (
              <span style={notificationBadgeStyle}>
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <VendorSidebar
        activePage={activePage}
        setActivePage={setActivePage}
        userProfile={userProfile}
        showMobileMenu={showMobileMenu}
        toggleMobileMenu={toggleMobileMenu}
        handleVendorClick={handleVendorClick}
        handleLogout={handleLogout}
      />

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div style={mobileOverlayStyle} onClick={toggleMobileMenu} />
      )}

      <div style={contentStyle}>
        {renderMainContent()}
      </div>

      {/* Floating Chatbot Widget */}
      <div style={chatbotWidgetStyle}>
        <button 
          style={chatbotWidgetButtonStyle}
          onClick={() => setShowChatModal(true)}
          title="Chat Support"
        >
          💬
        </button>
      </div>

      <VendorModals {...modalsProps} />
    </div>
  );
};

export default VendorDashboard;