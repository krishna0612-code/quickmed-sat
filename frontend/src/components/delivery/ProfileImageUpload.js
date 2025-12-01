import React, { useState, useRef } from 'react';

const ProfileImageUpload = ({ currentImage, onImageChange, onCancel }) => {
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const styles = {
    profileImageModal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
    },
    profileImageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f8fafc'
    },
    closeButton: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#6b7280'
    },
    profileImageContent: {
      padding: '24px'
    },
    imagePreviewContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    imagePreview: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '4px solid #7C2A62',
      position: 'relative'
    },
    previewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: '#F7D9EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '48px'
    },
    imageActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    primaryButton: {
      backgroundColor: '#7C2A62',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    dangerButton: {
      backgroundColor: '#EF4444',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    imageTips: {
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    },
    tipText: {
      margin: '4px 0',
      fontSize: '12px',
      color: '#6b7280'
    },
    profileImageFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      backgroundColor: '#f8fafc'
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      color: '#7C2A62',
      border: '1px solid #7C2A62',
      padding: '9px 15px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    successButton: {
      backgroundColor: '#10B981',
      color: 'white',
      border: 'none',
      padding: '10px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      onCancel();
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found');
        return;
      }

      // Create FormData with the actual file
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      const uploadResponse = await fetch('http://127.0.0.1:8000/delivery/profile/image/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        // The backend returns the full URL
        const imageUrl = data.profileImage.startsWith('http') 
          ? data.profileImage 
          : `http://127.0.0.1:8000${data.profileImage}`;
        onImageChange(imageUrl);
        onCancel();
      } else {
        const errorData = await uploadResponse.json();
        alert('Failed to upload image: ' + (errorData.detail || errorData.profile_image?.[0] || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={styles.profileImageModal}>
      <div style={styles.profileImageHeader}>
        <h3>Update Profile Image</h3>
        <button style={styles.closeButton} onClick={onCancel}>✕</button>
      </div>
      
      <div style={styles.profileImageContent}>
        <div style={styles.imagePreviewContainer}>
          <div style={styles.imagePreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" style={styles.previewImage} />
            ) : (
              <div style={styles.placeholderImage}>👤</div>
            )}
          </div>
        </div>

        <div style={styles.imageActions}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <button
            style={styles.primaryButton}
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Choose Image
          </button>
          {previewUrl && (
            <button
              style={styles.dangerButton}
              onClick={handleRemove}
            >
              🗑️ Remove
            </button>
          )}
        </div>

        <div style={styles.imageTips}>
          <p style={styles.tipText}>• Maximum file size: 5MB</p>
          <p style={styles.tipText}>• Supported formats: JPG, PNG, WebP</p>
          <p style={styles.tipText}>• Recommended size: 500x500 pixels</p>
        </div>
      </div>

      <div style={styles.profileImageFooter}>
        <button style={styles.secondaryButton} onClick={onCancel}>
          Cancel
        </button>
        <button style={styles.successButton} onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileImageUpload;