import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext();

// Default profile structure
const defaultProfile = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  pincode: '',
  dateOfBirth: '',
  age: '',
  gender: '',
  profilePhoto: null,
  lastUpdated: ''
};

export const ProfileProvider = ({ children, user }) => {
  const [profile, setProfile] = useState(() => {
    try {
      // First priority: user data from props (login data)
      if (user && user.email) {
        console.log('Initializing profile from user props:', user);
        const userProfile = {
          fullName: user.fullName || user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          pincode: user.pincode || '',
          dateOfBirth: user.dateOfBirth || '',
          age: user.age || '',
          gender: user.gender || '',
          profilePhoto: user.profilePhoto || null,
          lastUpdated: user.lastUpdated || new Date().toISOString()
        };
        
        // Save user data to localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        return userProfile;
      }
      
      // Second priority: localStorage data
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        console.log('Initializing profile from localStorage');
        return JSON.parse(saved);
      }
      
      // Fallback: default profile
      console.log('Initializing with default profile');
      return defaultProfile;
    } catch (error) {
      console.error('Error loading profile:', error);
      return defaultProfile;
    }
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch profile from backend on mount and when user changes
  useEffect(() => {
    const fetchProfileFromBackend = async () => {
      const token = localStorage.getItem('token');
      if (!token || !user || !user.email || user.userType !== 'user') {
        console.log('Skipping backend fetch: no token or not a user');
        return;
      }

      setIsLoadingProfile(true);
      try {
        const cleanedToken = token.replace(/^"|"$/g, '').trim();
        const response = await fetch('http://127.0.0.1:8000/user/userdashboard/profile/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${cleanedToken}`,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let profileData;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            profileData = await response.json();
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            throw new Error('Invalid response format from server. Please try again.');
          }
        } else {
          // If response is not JSON (e.g., HTML error page), get text
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200));
          throw new Error('Server returned an invalid response. Please try again.');
        }

        if (response.ok) {
          console.log('Profile fetched from backend:', profileData);
          
          // Update profile state with backend data
          setProfile(prevProfile => ({
            ...prevProfile,
            fullName: profileData.fullName || prevProfile.fullName || user.fullName || '',
            email: profileData.email || prevProfile.email || user.email || '',
            phone: profileData.phone || prevProfile.phone || user.phone || '',
            address: profileData.address || prevProfile.address || '',
            city: profileData.city || prevProfile.city || '',
            pincode: profileData.pincode || prevProfile.pincode || '',
            dateOfBirth: profileData.dateOfBirth || prevProfile.dateOfBirth || '',
            age: profileData.age || prevProfile.age || '',
            gender: profileData.gender || prevProfile.gender || '',
            profilePhoto: profileData.profilePhoto || prevProfile.profilePhoto || null,
            lastUpdated: profileData.lastUpdated || new Date().toISOString()
          }));
        } else {
          console.warn('Failed to fetch profile from backend:', response.status);
          // Fallback to localStorage if backend fails
        }
      } catch (error) {
        console.error('Error fetching profile from backend:', error);
        // Fallback to localStorage if network error
        // Don't show error to user, just use localStorage data
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileFromBackend();
  }, [user]);

  // Sync profile to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('userProfile', JSON.stringify(profile));
      console.log('Profile saved to localStorage:', profile.fullName);
    } catch (error) {
      console.error('Error saving profile to localStorage:', error);
    }
  }, [profile]);

  // Update profile when user prop changes (login/logout) - IMMEDIATE UPDATE
  useEffect(() => {
    if (user && user.email) {
      console.log('User data received in ProfileProvider - UPDATING PROFILE:', user);
      setProfile(prevProfile => {
        const updatedProfile = {
          ...prevProfile,
          fullName: user.fullName || user.name || prevProfile.fullName,
          email: user.email || prevProfile.email,
          phone: user.phone || prevProfile.phone,
          address: user.address || prevProfile.address,
          city: user.city || prevProfile.city,
          pincode: user.pincode || prevProfile.pincode,
          dateOfBirth: user.dateOfBirth || prevProfile.dateOfBirth,
          age: user.age || prevProfile.age,
          gender: user.gender || prevProfile.gender,
          profilePhoto: user.profilePhoto || prevProfile.profilePhoto,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('Profile updated from user data:', updatedProfile);
        return updatedProfile;
      });
    }
  }, [user]); // This will trigger immediately when user prop changes

  // Enhanced updateProfile function with backend sync
  const updateProfile = async (newProfileData) => {
    console.log('Updating profile with new data:', newProfileData);
    
    // Update local state first for immediate UI feedback
    setProfile(prevProfile => {
      const updatedProfile = {
        ...prevProfile,
        ...newProfileData,
        lastUpdated: new Date().toISOString()
      };
      
      // Auto-calculate age if dateOfBirth is provided and changed
      if (newProfileData.dateOfBirth && newProfileData.dateOfBirth !== prevProfile.dateOfBirth) {
        const calculatedAge = calculateAge(newProfileData.dateOfBirth);
        updatedProfile.age = calculatedAge.toString();
      }
      
      console.log('Final updated profile:', updatedProfile);
      return updatedProfile;
    });

    // Save to backend
    const token = localStorage.getItem('token');
    if (token && user && user.email && user.userType === 'user') {
      try {
        const cleanedToken = token.replace(/^"|"$/g, '').trim();
        
        // Prepare data for backend (convert camelCase to snake_case where needed)
        const backendData = {
          address: newProfileData.address || '',
          city: newProfileData.city || '',
          pincode: newProfileData.pincode || '',
          dateOfBirth: newProfileData.dateOfBirth || '',
          age: newProfileData.age ? parseInt(newProfileData.age) : null,
          gender: newProfileData.gender || ''
        };

        const response = await fetch('http://127.0.0.1:8000/user/userdashboard/profile/', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${cleanedToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(backendData)
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let savedProfile;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            savedProfile = await response.json();
          } catch (jsonError) {
            console.error('Error parsing JSON response:', jsonError);
            throw new Error('Invalid response format from server. Please try again.');
          }
        } else {
          // If response is not JSON (e.g., HTML error page), get text
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 200));
          throw new Error('Server returned an invalid response. Please try again.');
        }

        if (response.ok) {
          console.log('Profile saved to backend:', savedProfile);
          
          // Update state with backend response to ensure consistency
          setProfile(prevProfile => ({
            ...prevProfile,
            ...savedProfile,
            lastUpdated: savedProfile.lastUpdated || new Date().toISOString()
          }));
        } else {
          // Error response - already parsed as JSON above
          console.error('Failed to save profile to backend:', savedProfile);
          
          // Build detailed error message
          let errorMessage = 'Failed to save profile';
          if (savedProfile.error) {
            errorMessage = savedProfile.error;
          } else if (savedProfile.detail) {
            errorMessage = savedProfile.detail;
          } else if (savedProfile.message) {
            errorMessage = savedProfile.message;
          } else if (savedProfile.errors) {
            // Handle validation errors
            const errorList = Object.entries(savedProfile.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            errorMessage = `Validation errors: ${errorList}`;
          }
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error saving profile to backend:', error);
        // If it's already an Error object, re-throw it; otherwise create a new one
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(error.message || 'An unexpected error occurred while saving profile');
        }
      }
    }
  };

  const updateProfilePhoto = (photoUrl) => {
    console.log('Updating profile photo:', photoUrl);
    setProfile(prevProfile => ({
      ...prevProfile,
      profilePhoto: photoUrl,
      lastUpdated: new Date().toISOString()
    }));
  };

  const removeProfilePhoto = () => {
    console.log('Removing profile photo');
    setProfile(prevProfile => ({
      ...prevProfile,
      profilePhoto: null,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (birthDate) => {
    try {
      const dob = new Date(birthDate);
      const today = new Date();
      
      if (dob > today) {
        return 0;
      }

      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age > 0 ? age : 0;
    } catch (error) {
      console.error('Error calculating age:', error);
      return 0;
    }
  };

  // Clear profile (for logout)
  const clearProfile = () => {
    console.log('Clearing profile data');
    localStorage.removeItem('userProfile');
    setProfile(defaultProfile);
  };

  // Check if profile is complete
  const isProfileComplete = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'pincode', 'dateOfBirth', 'gender'];
    return requiredFields.every(field => profile[field] && profile[field].toString().trim() !== '');
  };

  // Force immediate profile sync (useful after login)
  const forceProfileUpdate = (userData) => {
    console.log('Force updating profile:', userData);
    if (userData) {
      updateProfile(userData);
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile,
      updateProfilePhoto,
      removeProfilePhoto,
      clearProfile,
      isProfileComplete,
      forceProfileUpdate,
      isLoadingProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;