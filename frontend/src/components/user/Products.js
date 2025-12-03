import React, { useState, useMemo } from 'react';

const Products = ({ 
  searchQuery, 
  setSearchQuery, 
  medicines, 
  filteredMedicines, 
  cart, 
  addToCart, 
  updateQuantity, 
  setActiveView,
  isLoadingMedicines = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Color constants
  const colors = {
    primary: '#7C2A62',
    accent: '#F7D9EB',
    white: '#FFFFFF',
    lightGray: '#F5F5F5',
    gray: '#666666',
    darkGray: '#333333',
    success: '#28a745',
    warning: '#ffc107',
    danger: '#dc3545'
  };

  // Styles object with the new color scheme
  const styles = {
    mainContent: {
      padding: '20px',
      backgroundColor: colors.lightGray,
      minHeight: '100vh',
      marginTop: '50px',
      paddingTop: '80px'
    },
    backButton: {
      position: 'fixed',
      top: '80px',
      left: '20px',
      padding: '12px 20px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    welcomeSection: {
      textAlign: 'center',
      marginBottom: '30px',
      padding: '20px 10px',
      backgroundColor: colors.white,
      borderRadius: '15px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      marginTop: '40px'
    },
    welcomeTitle: {
      color: colors.primary,
      fontSize: '2.5rem',
      marginBottom: '20px',
      fontWeight: 'bold'
    },
    welcomeSubtitle: {
      color: colors.gray,
      fontSize: '1.3rem',
      lineHeight: '1.6'
    },
    searchSection: {
      marginBottom: '40px',
      backgroundColor: colors.white,
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '25px',
      gap: '20px'
    },
    searchInput: {
      flex: 0.5,
      padding: '15px 20px',
      border: `2px solid ${colors.accent}`,
      borderRadius: '5px',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
      backgroundColor: colors.white
    },
    healthMessage: {
      flex: 0.7,
      padding: '15px 20px',
      backgroundColor: colors.accent,
      color: colors.primary,
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.5',
      fontWeight: '500',
      textAlign: 'center',
      border: `1px solid ${colors.primary}20`
    },
    categoryFilter: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '15px'
    },
    categoryButton: {
      padding: '12px 24px',
      border: `2px solid ${colors.accent}`,
      backgroundColor: colors.white,
      color: colors.primary,
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '15px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    activeCategoryButton: {
      backgroundColor: colors.primary,
      color: colors.white,
      borderColor: colors.primary
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '25px'
    },
    productCard: {
      backgroundColor: colors.white,
      borderRadius: '5px',
      padding: '25px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: `1px solid ${colors.accent}`,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px', // Fixed minimum height
      position: 'relative'
    },
    productImage: {
      fontSize: '3.5rem',
      textAlign: 'center',
      marginBottom: '20px'
    },
    productInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    productName: {
      color: colors.primary,
      fontSize: '1.3rem',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    productBrand: {
      color: colors.gray,
      fontSize: '1.1rem',
      marginBottom: '12px',
      fontWeight: '500'
    },
    productDescription: {
      color: colors.darkGray,
      fontSize: '0.95rem',
      marginBottom: '18px',
      lineHeight: '1.5'
    },
    productMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    productCategory: {
      backgroundColor: colors.accent,
      color: colors.primary,
      padding: '6px 14px',
      borderRadius: '15px',
      fontSize: '0.85rem',
      fontWeight: '500'
    },
    prescriptionBadge: {
      backgroundColor: colors.warning,
      color: colors.darkGray,
      padding: '6px 10px',
      borderRadius: '10px',
      fontSize: '0.75rem',
      fontWeight: 'bold'
    },

    // FIXED: Bottom section that stays at bottom
    bottomSection: {
      marginTop: 'auto',
      paddingTop: '15px',
      borderTop: `1px solid ${colors.lightGray}`,
      position: 'sticky',
      bottom: '0',
      backgroundColor: colors.white,
      borderRadius: '0 0 12px 12px'
    },
    productPriceSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0'
    },
    productPrice: {
      color: colors.primary,
      fontSize: '1.6rem',
      fontWeight: 'bold'
    },
    addToCartButton: {
      padding: '12px 24px',
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      minWidth: '120px'
    },
    disabledButton: {
      padding: '12px 24px',
      backgroundColor: colors.gray,
      color: colors.white,
      border: 'none',
      borderRadius: '8px',
      cursor: 'not-allowed',
      fontSize: '0.9rem',
      fontWeight: '600',
      opacity: 0.6,
      whiteSpace: 'nowrap',
      minWidth: '120px'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '15px',
      padding: '12px',
      backgroundColor: colors.lightGray,
      borderRadius: '8px',
      width: '100%'
    },
    quantityButton: {
      width: '35px',
      height: '35px',
      border: `2px solid ${colors.primary}`,
      backgroundColor: colors.white,
      color: colors.primary,
      borderRadius: '50%',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      flexShrink: 0
    },
    quantityDisplay: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: colors.primary,
      minWidth: '35px',
      textAlign: 'center',
      flex: 1
    }
  };

  // Map backend medicines to frontend format with enhanced details
  // Use medicines prop from UserDashboard (fetched from backend) instead of static data
  const enhancedMedicines = useMemo(() => {
    if (!medicines || medicines.length === 0) {
      return [];
    }

    // Map backend medicine format to frontend format
    return medicines.map(med => {
      // Generate a brand name from medicine name or use vendor name
      const brandName = med.name.split(' ')[0] || 'Generic';
      
      // Generate description based on category
      const categoryDescriptions = {
        'Pain Relief': 'Effective pain relief for various conditions',
        'Fever & Pain': 'Relief from fever and mild to moderate pain',
        'Vitamins & Supplements': 'Essential vitamins and minerals for health',
        'Antibiotics': 'Broad-spectrum antibiotic for bacterial infections',
        'Medical Equipment': 'Professional medical equipment for home use',
        'Allergy': '24-hour allergy relief without drowsiness',
        'Acid Reducer': 'Proton pump inhibitor for acid reflux',
        'cold': 'Relief from cold symptoms',
        'drug': 'Medication for various conditions',
        'fever': 'Fever reduction and pain relief'
      };
      
      const description = med.description || categoryDescriptions[med.category] || `${med.name} - ${med.category}`;
      
      return {
        id: med.id,
        name: med.name,
        brand: brandName,
        price: parseFloat(med.price) || 0,
        vendor: med.vendor || 'Unknown Vendor',
        vendorId: med.vendorId || null,
        category: med.category || 'General',
        description: description,
        prescriptionRequired: med.prescriptionRequired || false,
        stock: med.quantity || med.stock || 0,
        // Add default values for optional fields
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50
      };
    });
  }, [medicines]);

  // Dynamically generate categories from fetched medicines
  const categories = useMemo(() => {
    const uniqueCategories = new Set(enhancedMedicines.map(medicine => medicine.category));
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [enhancedMedicines]);

  // Filter products based on search query and selected category
  const filteredProducts = useMemo(() => {
    return enhancedMedicines.filter(medicine => {
      const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (medicine.brand && medicine.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           medicine.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (medicine.vendor && medicine.vendor.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [enhancedMedicines, searchQuery, selectedCategory]);

  const addToCartWithNotification = (product) => {
    addToCart(product);
  };

  // Get quantity of product in cart
  const getProductQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle back to home page
  const handleBackToHome = () => {
    setActiveView('home');
  };

  return (
    <div style={styles.mainContent}>
      {/* Back Button */}
      <button 
        style={styles.backButton}
        onClick={handleBackToHome}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colors.accent;
          e.target.style.color = colors.primary;
          e.target.style.transform = 'translateX(-5px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colors.primary;
          e.target.style.color = colors.white;
          e.target.style.transform = 'translateX(0)';
        }}
      >
        ← Back to Home
      </button>

      {/* Header Section */}
      <section style={styles.welcomeSection}>
        <h2 style={styles.welcomeTitle}>Our Medicine Products 💊</h2>
        <p style={styles.welcomeSubtitle}>
          Discover high-quality medicines and healthcare products with detailed information
        </p>
      </section>

      {/* Search and Filter Section */}
      <section style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search medicines, brands, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
          {/* Health Priority Message */}
          <div style={styles.healthMessage}>
            For your safety and well-being, we provide only quality medicines from trusted sources, properly stored for maximum efficacy.
          </div>
        </div>

        <div style={styles.categoryFilter}>
          {categories.map(category => (
            <button
              key={category}
              style={
                selectedCategory === category 
                  ? {...styles.categoryButton, ...styles.activeCategoryButton}
                  : styles.categoryButton
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All Products' : category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section style={styles.productsSection}>
        <div style={styles.productsGrid}>
          {filteredProducts.map(product => {
            const quantityInCart = getProductQuantity(product.id);
            
            return (
              <div key={product.id} style={styles.productCard}>
                <div style={styles.productImage}>
                  {product.image}
                </div>
                
                <div style={styles.productInfo}>
                  <h3 style={styles.productName}>{product.name}</h3>
                  <p style={styles.productBrand}>{product.brand}</p>
                  <p style={styles.productDescription}>{product.description}</p>
                  
                  <div style={styles.productMeta}>
                    <div style={styles.productCategory}>{product.category}</div>
                    {product.prescriptionRequired && (
                      <div style={styles.prescriptionBadge}>Prescription Required</div>
                    )}
                  </div>

                  {/* FIXED: Bottom section that stays at bottom */}
                  <div style={styles.bottomSection}>
                    {/* Add to Cart Button - Only show if product is not in cart */}
                    {quantityInCart === 0 ? (
                      <div style={styles.productPriceSection}>
                        <span style={styles.productPrice}>₹{product.price}</span>
                        <button
                          style={product.stock > 0 ? styles.addToCartButton : styles.disabledButton}
                          onClick={() => product.stock > 0 && addToCartWithNotification(product)}
                          disabled={product.stock === 0}
                          onMouseEnter={(e) => {
                            if (product.stock > 0) {
                              e.target.style.backgroundColor = colors.accent;
                              e.target.style.color = colors.primary;
                              e.target.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (product.stock > 0) {
                              e.target.style.backgroundColor = colors.primary; // FIXED: Changed cards.primary to colors.primary
                              e.target.style.color = colors.white;
                              e.target.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    ) : (
                      /* Quantity Controls - Only show if product is in cart */
                      <div style={styles.quantityControls}>
                        <button
                          style={styles.quantityButton}
                          onClick={() => updateQuantity(product.id, quantityInCart - 1)}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = colors.primary;
                            e.target.style.color = colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = colors.white;
                            e.target.style.color = colors.primary;
                          }}
                        >
                          −
                        </button>
                        <span style={styles.quantityDisplay}>{quantityInCart}</span>
                        <button
                          style={styles.quantityButton}
                          onClick={() => updateQuantity(product.id, quantityInCart + 1)}
                          disabled={quantityInCart >= product.stock}
                          onMouseEnter={(e) => {
                            if (quantityInCart < product.stock) {
                              e.target.style.backgroundColor = colors.primary;
                              e.target.style.color = colors.white;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (quantityInCart < product.stock) {
                              e.target.style.backgroundColor = colors.white;
                              e.target.style.color = colors.primary;
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}; 

export default Products;