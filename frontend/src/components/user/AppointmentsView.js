import React, { useState, useEffect } from "react";

const AppointmentsView = ({
  appointments,
  filteredAppointments,
  appointmentFilter,
  setAppointmentFilter,
  setActiveView,
  viewAppointmentDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Scroll to top when component mounts or when navigating to this view
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  // Also add scroll to top when filter changes to ensure we're at the top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [appointmentFilter, searchTerm]);

  const BackButton = ({ onClick, text = "Back" }) => (
    <button
      style={{
        padding: "0.5rem 1rem",
        backgroundColor: "transparent",
        color: "#7C2A62",
        border: "1px solid #7C2A62",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "0.9rem",
      }}
      onClick={() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
        setTimeout(() => {
          onClick();
        }, 100);
      }}
      type="button"
    >
      ← {text}
    </button>
  );

  // Handle view details button click
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetails(true);
    // Scroll to top when viewing details
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // Handle back to appointments list
  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedAppointment(null);
  };

  // Filter appointments based on the selected filter and search term
  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply status filter
    if (appointmentFilter !== "all") {
      filtered = appointments.filter((appointment) => {
        const status = appointment.status.toLowerCase();
        const filter = appointmentFilter.toLowerCase();

        switch (filter) {
          case "scheduled":
            return status === "scheduled";
          case "pending":
            return status === "pending";
          case "completed":
            return status === "completed";
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (appointment) =>
          appointment.doctorName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.specialty
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          appointment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Use the filtered appointments
  const displayAppointments = getFilteredAppointments();

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    try {
      // Handle both YYYY-MM-DD format and other formats
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if invalid date
      }

      const options = { year: "numeric", month: "long", day: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };

  // FIXED: Improved time formatting function
  const formatTime = (timeString) => {
    if (!timeString) return "Not set";

    // If the time string looks like a date (contains dashes or is long), try to extract time
    if (timeString.includes("-") || timeString.length > 8) {
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          // Extract time from date object
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
      } catch (error) {
        // If parsing fails, try to extract time from string
        const timeMatch = timeString.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          return timeMatch[1];
        }
      }
      return "Time not set";
    }

    // If it's already a time string, format it nicely
    if (timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "" : "";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minutes} ${ampm}`;
    }

    return timeString; // Return the actual time slot
  };

  // Doctor information data
  const doctorInfo = {
    "Dr. Brahma Gadikoto": {
      specialty: "General Physician",
      experience: "15+ years",
      education: "MBBS, MD - General Medicine",
      languages: "English, Hindi, Telugu",
      rating: "4.8/5",
      about:
        "Specialized in internal medicine and chronic disease management. Provides comprehensive healthcare for adults.",
      clinic: "QuickMed Main Hospital",
      address: "123 Health Street, Medical District, Hyderabad",
      consultationFee: "₹800",
    },
    "Dr. Charitha Kasturi": {
      specialty: "Pediatrician",
      experience: "12+ years",
      education: "MBBS, DCH, MD - Pediatrics",
      languages: "English, Hindi, Tamil",
      rating: "4.9/5",
      about:
        "Expert in child healthcare, vaccination, and growth monitoring. Gentle approach with children.",
      clinic: "QuickMed Children's Wing",
      address: "123 Health Street, Medical District, Hyderabad",
      consultationFee: "₹900",
    },
    "Dr. Rajesh Kumar": {
      specialty: "Cardiologist",
      experience: "18+ years",
      education: "MBBS, DM - Cardiology",
      languages: "English, Hindi",
      rating: "4.7/5",
      about:
        "Interventional cardiologist specializing in heart disease prevention and treatment.",
      clinic: "QuickMed Heart Center",
      address: "123 Health Street, Medical District, Hyderabad",
      consultationFee: "₹1200",
    },
    "Dr. Priya Sharma": {
      specialty: "Dermatologist",
      experience: "10+ years",
      education: "MBBS, MD - Dermatology",
      languages: "English, Hindi, Punjabi",
      rating: "4.8/5",
      about:
        "Skin and hair care specialist with expertise in cosmetic and medical dermatology.",
      clinic: "QuickMed Skin Clinic",
      address: "123 Health Street, Medical District, Hyderabad",
      consultationFee: "₹1000",
    },
    "Dr. Anil Kumar": {
      specialty: "Orthopedic",
      experience: "20+ years",
      education: "MBBS, MS - Orthopedics",
      languages: "English, Hindi, Malayalam",
      rating: "4.6/5",
      about:
        "Joint replacement specialist with extensive experience in sports injuries and trauma.",
      clinic: "QuickMed Bone & Joint Center",
      address: "123 Health Street, Medical District, Hyderabad",
      consultationFee: "₹1100",
    },
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return {
          background: "#E8F5E8",
          color: "#2E7D32",
          border: "1px solid #C8E6C9",
        };
      case "pending":
        return {
          background: "#FFF3E0",
          color: "#EF6C00",
          border: "1px solid #FFE0B2",
        };
      case "completed":
        return {
          background: "#F5F5F5",
          color: "#424242",
          border: "1px solid #E0E0E0",
        };
      default:
        return {
          background: "#F5F5F5",
          color: "#424242",
          border: "1px solid #E0E0E0",
        };
    }
  };

  // Appointment Details Component
  const AppointmentDetails = ({ appointment, onBack }) => {
    const doctor = doctorInfo[appointment.doctorName] || {
      specialty: appointment.specialty,
      experience: "Experienced professional",
      education: "Medical degree",
      languages: "English",
      rating: "4.5/5",
      about: "Qualified medical professional providing excellent care.",
      clinic: "QuickMed Clinic",
      address: "123 Health Street, Medical District",
      consultationFee: "₹500",
    };

    const statusStyle = getStatusColor(appointment.status);

    return (
      <div
        style={{
          marginTop: "120px",
          padding: "0",
          width: "100vw",
          marginLeft: "0",
          marginRight: "0",
          minHeight: "calc(100vh - 120px)",
          overflowX: "hidden",
          backgroundColor: "#F8F9FA",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1.5rem",
            minHeight: "calc(100vh - 120px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <BackButton onClick={onBack} text="Back to Appointments" />
            <div
              style={{
                textAlign: "center",
                flex: 1,
              }}
            >
              <h1
                style={{
                  color: "#7C2A62",
                  fontSize: "2rem",
                  margin: "0 0 0.5rem 0",
                  fontWeight: "700",
                }}
              >
                Appointment Details
              </h1>
              <p
                style={{
                  color: "#666",
                  margin: 0,
                  fontSize: "1rem",
                }}
              >
                Complete information about your appointment
              </p>
            </div>
            <div style={{ width: "140px" }}></div> {/* Spacer for alignment */}
          </div>

          {/* Main Content Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {/* Appointment Card */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "2rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        ...statusStyle,
                      }}
                    >
                      {appointment.status}
                    </span>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        backgroundColor: "#F8F9FA",
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                      }}
                    >
                      ID: {appointment.id}
                    </span>
                  </div>

                  <h2
                    style={{
                      color: "#7C2A62",
                      fontSize: "1.75rem",
                      margin: "0 0 0.5rem 0",
                      fontWeight: "700",
                    }}
                  >
                    {appointment.doctorName}
                  </h2>

                  <p
                    style={{
                      color: "#666",
                      margin: "0 0 1.5rem 0",
                      fontSize: "1.1rem",
                      fontWeight: "500",
                    }}
                  >
                    {doctor.specialty}
                  </p>
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <strong
                    style={{
                      color: "#7C2A62",
                      fontSize: "0.9rem",
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Appointment Date
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {formatDate(appointment.date)}
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <strong
                    style={{
                      color: "#7C2A62",
                      fontSize: "0.9rem",
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Appointment Time
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {formatTime(appointment.time)}
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <strong
                    style={{
                      color: "#7C2A62",
                      fontSize: "0.9rem",
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Consultation Type
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {appointment.consultationType || "In-person"}
                  </p>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <strong
                    style={{
                      color: "#7C2A62",
                      fontSize: "0.9rem",
                      display: "block",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Consultation Fee
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: "600",
                    }}
                  >
                    {doctor.consultationFee}
                  </p>
                </div>
              </div>

              {/* Additional Information */}
              <div
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#F8F9FA",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                }}
              >
                <h4
                  style={{
                    color: "#7C2A62",
                    marginBottom: "1rem",
                    fontSize: "1.1rem",
                  }}
                >
                  Additional Information
                </h4>
                <p
                  style={{
                    color: "#666",
                    margin: 0,
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  {appointment.additionalNotes ||
                    "No additional notes provided for this appointment."}
                </p>
              </div>
            </div>

            {/* Doctor Information */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB",
              }}
            >
              <h3
                style={{
                  color: "#7C2A62",
                  fontSize: "1.5rem",
                  margin: "0 0 1.5rem 0",
                  fontWeight: "700",
                }}
              >
                About Dr. {appointment.doctorName.split("Dr. ")[1]}
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div>
                  <strong style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
                    Experience:
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {doctor.experience}
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
                    Education:
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {doctor.education}
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
                    Languages:
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {doctor.languages}
                  </p>
                </div>
                <div>
                  <strong style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
                    Rating:
                  </strong>
                  <p
                    style={{
                      color: "#333",
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.9rem",
                    }}
                  >
                    {doctor.rating}
                  </p>
                </div>
              </div>

              <div>
                <strong style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
                  About the Doctor:
                </strong>
                <p
                  style={{
                    color: "#666",
                    margin: "0.5rem 0 0 0",
                    fontSize: "0.9rem",
                    lineHeight: "1.6",
                  }}
                >
                  {doctor.about}
                </p>
              </div>
            </div>

            {/* Clinic Information */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "2rem",
                boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
                border: "1px solid #E5E7EB",
              }}
            >
              <h3
                style={{
                  color: "#7C2A62",
                  fontSize: "1.25rem",
                  margin: "0 0 1.5rem 0",
                  fontWeight: "700",
                }}
              >
                Clinic Information
              </h3>

              <div style={{ marginBottom: "1.5rem" }}>
                <strong
                  style={{
                    color: "#7C2A62",
                    fontSize: "0.9rem",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Clinic Name
                </strong>
                <p
                  style={{
                    color: "#333",
                    margin: 0,
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  {doctor.clinic}
                </p>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <strong
                  style={{
                    color: "#7C2A62",
                    fontSize: "0.9rem",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Address
                </strong>
                <p
                  style={{
                    color: "#666",
                    margin: 0,
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                  }}
                >
                  {doctor.address}
                </p>
              </div>

              <div>
                <strong
                  style={{
                    color: "#7C2A62",
                    fontSize: "0.9rem",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Contact
                </strong>
                <p style={{ color: "#666", margin: 0, fontSize: "0.9rem" }}>
                  📞 1-800-QUICK-MED
                  <br />
                  ✉️ info@quickmed.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // If showing details, render the details component
  if (showDetails && selectedAppointment) {
    return (
      <AppointmentDetails
        appointment={selectedAppointment}
        onBack={handleBackToList}
      />
    );
  }

  // Otherwise, render the main appointments list
  return (
    <div
      style={{
        marginTop: "120px",
        padding: "0",
        width: "100vw",
        marginLeft: "0",
        marginRight: "0",
        minHeight: "calc(100vh - 120px)",
        overflowX: "hidden",
        backgroundColor: "#F8F9FA",
      }}
    >
      {/* Main Container with limited width for content */}
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "1.5rem",
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          {/* Left: Dashboard Button */}
          <BackButton
            onClick={() => setActiveView("dashboard")}
            text="Dashboard"
          />

          {/* Center: Title */}
          <div
            style={{
              textAlign: "center",
              flex: 1,
            }}
          >
            <h1
              style={{
                color: "#7C2A62",
                fontSize: "2rem",
                margin: "0 0 0.5rem ",
                marginTop: "1.5rem",
                fontWeight: "700",
              }}
            >
              My Appointments
            </h1>
            <p
              style={{
                color: "#666",
                marginTop: "1.5rem",
                fontSize: "1rem",
              }}
            >
              Quick Care, Better Health
            </p>
          </div>

          {/* Right: Search and Book Appointment */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4rem",
              flexWrap: "wrap",
            }}
          >
            {/* Search Bar */}
            <div
              style={{
                position: "relative",
                minWidth: "320px",
              }}
            >
              <input
                type="text"
                placeholder="Search doctors, specialties, or appointment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  border: "2px solid #E5E7EB",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  width: "100%",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  backgroundColor: "#F9FAFB",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#7C2A62",
                  fontSize: "1rem",
                }}
              >
                🔍
              </span>
            </div>

            {/* Book New Appointment button */}
            <button
              style={{
                padding: "0.75rem 2rem",
                backgroundColor: "#7C2A62",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                whiteSpace: "nowrap",
                minWidth: "180px",
              }}
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  left: 0,
                  behavior: "smooth",
                });
                setTimeout(() => {
                  setActiveView("consultation");
                }, 100);
              }}
              type="button"
            >
              + Book New Appointment
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["all", "scheduled", "pending", "completed"].map((filter) => (
            <button
              key={filter}
              onClick={() => setAppointmentFilter(filter)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor:
                  appointmentFilter === filter ? "#7C2A62" : "white",
                color: appointmentFilter === filter ? "white" : "#7C2A62",
                border: `1px solid ${
                  appointmentFilter === filter ? "#7C2A62" : "#E5E7EB"
                }`,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "600",
                transition: "all 0.3s ease",
                textTransform: "capitalize",
              }}
              type="button"
            >
              {filter === "all" ? "All Appointments" : filter}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            marginBottom: "3rem",
          }}
        >
          {displayAppointments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
              <h3 style={{ color: "#7C2A62", marginBottom: "0.5rem" }}>
                No Appointments Found
              </h3>
              <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                {searchTerm || appointmentFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "You don't have any appointments yet."}
              </p>
              <button
                style={{
                  padding: "0.75rem 2rem",
                  backgroundColor: "#7C2A62",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                }}
                onClick={() => {
                  setSearchTerm("");
                  setAppointmentFilter("all");
                  setActiveView("consultation");
                }}
                type="button"
              >
                Book Your First Appointment
              </button>
            </div>
          ) : (
            displayAppointments.map((appointment, index) => {
              const statusStyle = getStatusColor(appointment.status);
              const doctor = doctorInfo[appointment.doctorName] || {
                specialty: appointment.specialty,
                experience: "Experienced professional",
                education: "Medical degree",
                languages: "English",
                rating: "4.5/5",
                about:
                  "Qualified medical professional providing excellent care.",
              };

              return (
                <div
                  key={appointment.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
                    border: "1px solid #E5E7EB",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 20px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 15px rgba(0,0,0,0.08)";
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "1.5rem",
                      alignItems: "start",
                    }}
                  >
                    {/* Left: Appointment Details */}
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            ...statusStyle,
                          }}
                        >
                          {appointment.status}
                        </span>
                        <span
                          style={{
                            color: "#666",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                          }}
                        >
                          ID: {appointment.id}
                        </span>
                      </div>

                      <h3
                        style={{
                          color: "#7C2A62",
                          fontSize: "1.25rem",
                          margin: "0 0 0.5rem 0",
                          fontWeight: "700",
                        }}
                      >
                        {appointment.doctorName}
                      </h3>

                      <p
                        style={{
                          color: "#666",
                          margin: "0 0 1rem 0",
                          fontSize: "0.9rem",
                        }}
                      >
                        {doctor.specialty} • {doctor.experience} experience •
                        Rating: {doctor.rating}
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "1rem",
                          marginBottom: "1.5rem",
                        }}
                      >
                        <div>
                          <strong
                            style={{ color: "#7C2A62", fontSize: "0.85rem" }}
                          >
                            Date:
                          </strong>
                          <p
                            style={{
                              color: "#333",
                              margin: "0.25rem 0 0 0",
                              fontSize: "0.9rem",
                            }}
                          >
                            {formatDate(appointment.date)}
                          </p>
                        </div>
                        <div>
                          <strong
                            style={{ color: "#7C2A62", fontSize: "0.85rem" }}
                          >
                            Time:
                          </strong>
                          <p
                            style={{
                              color: "#333",
                              margin: "0.25rem 0 0 0",
                              fontSize: "0.9rem",
                            }}
                          >
                            {formatTime(appointment.time)}
                          </p>
                        </div>
                        <div>
                          <strong
                            style={{ color: "#7C2A62", fontSize: "0.85rem" }}
                          >
                            Consultation Type:
                          </strong>
                          <p
                            style={{
                              color: "#333",
                              margin: "0.25rem 0 0 0",
                              fontSize: "0.9rem",
                            }}
                          >
                            {appointment.consultationType || "In-person"}
                          </p>
                        </div>
                      </div>

                      <p
                        style={{
                          color: "#666",
                          fontSize: "0.85rem",
                          lineHeight: "1.5",
                          margin: 0,
                        }}
                      >
                        {doctor.about}
                      </p>
                    </div>

                    {/* Right: Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        minWidth: "140px",
                      }}
                    >
                      <button
                        onClick={() => handleViewDetails(appointment)}
                        style={{
                          padding: "0.6rem 1rem",
                          backgroundColor: "transparent",
                          color: "#7C2A62",
                          border: "1px solid #7C2A62",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#7C2A62";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#7C2A62";
                        }}
                        type="button"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Information */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "1.5rem",
            boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
            border: "1px solid #E5E7EB",
            textAlign: "center",
          }}
        >
          <h4 style={{ color: "#7C2A62", marginBottom: "1rem" }}>Need Help?</h4>
          <p
            style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}
          >
            Contact our support team for assistance with appointments, technical
            issues, or medical queries.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            <span style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
              📞 Support: 1-800-QUICK-MED
            </span>
            <span style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
              ✉️ Email: support@quickmed.com
            </span>
            <span style={{ color: "#7C2A62", fontSize: "0.9rem" }}>
              🕒 Available 24/7
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsView;

// import React, { useState, useEffect } from "react";

// const API_BASE = "http://127.0.0.1:8000/api/doctor";

// const AppointmentsView = ({ setActiveView, viewAppointmentDetails }) => {
//   const [appointments, setAppointments] = useState([]);
//   const [appointmentFilter, setAppointmentFilter] = useState("all");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Get patient ID from localStorage (set during login)
//   const patientId = localStorage.getItem("userId");

//   // Scroll to top when component mounts or when navigating to this view
//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: "smooth",
//     });
//   }, []);

//   // Also add scroll to top when filter changes to ensure we're at the top
//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: "smooth",
//     });
//   }, [appointmentFilter, searchTerm]);

//   // Fetch Appointments for logged in user
//   const fetchAppointments = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${API_BASE}/my-appointments/?patientId=${patientId}`
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch appointments");
//       }
//       const data = await response.json();

//       // Convert status for UI display
//       const formatted = data.map((appt) => {
//         let uiStatus = "Scheduled";
//         if (appt.status === "pending") uiStatus = "Pending";
//         if (appt.status === "cancelled") uiStatus = "Cancelled";
//         if (appt.status === "completed") uiStatus = "Completed";
//         if (appt.status === "upcoming") uiStatus = "Scheduled";

//         return {
//           ...appt,
//           status: uiStatus,
//           // Ensure all required fields are present
//           doctorName: appt.doctorName || "Dr. Unknown",
//           specialty: appt.specialty || "General Physician",
//           date: appt.date || "N/A",
//           time: appt.time || "N/A",
//           type: appt.type || "Consultation",
//           fee: appt.fee || 0,
//         };
//       });

//       setAppointments(formatted);
//     } catch (error) {
//       console.error("Error fetching appointments", error);
//       setError(error.message);
//       // Fallback to mock data if API fails
//       setAppointments(getMockAppointments());
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAppointments();
//   }, []);

//   // Cancel Appointment API
//   const cancelAppointment = async (id) => {
//     if (!window.confirm("Are you sure you want to cancel this appointment?"))
//       return;

//     setLoading(true);
//     try {
//       const response = await fetch(`${API_BASE}/appointments/${id}/cancel/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reason: "User cancelled" }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to cancel appointment");
//       }

//       await fetchAppointments(); // refresh UI
//     } catch (error) {
//       console.error("Error cancelling appointment", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reschedule Appointment API
//   const rescheduleAppointment = async (id, newDate, newTime) => {
//     if (!newDate || !newTime) return;

//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${API_BASE}/appointments/${id}/reschedule/`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             newDate,
//             newTime,
//             reason: "Patient requested reschedule",
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to reschedule appointment");
//       }

//       await fetchAppointments(); // refresh UI
//     } catch (error) {
//       console.error("Error rescheduling appointment", error);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter + search logic
//   const getFilteredAppointments = () => {
//     let filtered = [...appointments];

//     if (appointmentFilter !== "all") {
//       filtered = filtered.filter((appointment) => {
//         const status = appointment.status.toLowerCase();
//         const filter = appointmentFilter.toLowerCase();

//         switch (filter) {
//           case "scheduled":
//             return status === "scheduled";
//           case "pending":
//             return status === "pending";
//           case "rescheduled":
//             return status === "rescheduled";
//           case "cancelled":
//             return status === "cancelled";
//           case "completed":
//             return status === "completed";
//           default:
//             return true;
//         }
//       });
//     }

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter(
//         (appointment) =>
//           appointment.doctorName
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           appointment.specialty
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase()) ||
//           appointment.id
//             .toString()
//             .toLowerCase()
//             .includes(searchTerm.toLowerCase())
//       );
//     }

//     return filtered;
//   };

//   const displayAppointments = getFilteredAppointments();

//   const BackButton = ({ onClick, text = "Back" }) => (
//     <button
//       style={{
//         padding: "0.5rem 1rem",
//         backgroundColor: "transparent",
//         color: "#7C2A62",
//         border: "1px solid #7C2A62",
//         borderRadius: "6px",
//         cursor: "pointer",
//         fontSize: "0.9rem",
//       }}
//       onClick={() => {
//         // Scroll to top first, then navigate
//         window.scrollTo({
//           top: 0,
//           left: 0,
//           behavior: "smooth",
//         });
//         // Small delay to ensure scroll completes before navigation
//         setTimeout(() => {
//           onClick();
//         }, 100);
//       }}
//       type="button"
//     >
//       ← {text}
//     </button>
//   );

//   // Doctor information data
//   const doctorInfo = {
//     "Dr. Brahma Gadikoto": {
//       specialty: "General Physician",
//       experience: "15+ years",
//       education: "MBBS, MD - General Medicine",
//       languages: "English, Hindi, Telugu",
//       rating: "4.8/5",
//       about:
//         "Specialized in internal medicine and chronic disease management. Provides comprehensive healthcare for adults.",
//     },
//     "Dr. Charitha Kasturi": {
//       specialty: "Pediatrician",
//       experience: "12+ years",
//       education: "MBBS, DCH, MD - Pediatrics",
//       languages: "English, Hindi, Tamil",
//       rating: "4.9/5",
//       about:
//         "Expert in child healthcare, vaccination, and growth monitoring. Gentle approach with children.",
//     },
//     "Dr. Rajesh Kumar": {
//       specialty: "Cardiologist",
//       experience: "18+ years",
//       education: "MBBS, DM - Cardiology",
//       languages: "English, Hindi",
//       rating: "4.7/5",
//       about:
//         "Interventional cardiologist specializing in heart disease prevention and treatment.",
//     },
//     "Dr. Priya Sharma": {
//       specialty: "Dermatologist",
//       experience: "10+ years",
//       education: "MBBS, MD - Dermatology",
//       languages: "English, Hindi, Punjabi",
//       rating: "4.8/5",
//       about:
//         "Skin and hair care specialist with expertise in cosmetic and medical dermatology.",
//     },
//     "Dr. Anil Kumar": {
//       specialty: "Orthopedic",
//       experience: "20+ years",
//       education: "MBBS, MS - Orthopedics",
//       languages: "English, Hindi, Malayalam",
//       rating: "4.6/5",
//       about:
//         "Joint replacement specialist with extensive experience in sports injuries and trauma.",
//     },
//   };

//   // Mock data for fallback
//   const getMockAppointments = () => [
//     {
//       id: 1,
//       doctorName: "Dr. Brahma Gadikoto",
//       specialty: "General Physician",
//       date: "2024-01-15",
//       time: "10:00 AM",
//       type: "Consultation",
//       fee: 500,
//       status: "Scheduled",
//     },
//     {
//       id: 2,
//       doctorName: "Dr. Charitha Kasturi",
//       specialty: "Pediatrician",
//       date: "2024-01-16",
//       time: "2:30 PM",
//       type: "Follow-up",
//       fee: 400,
//       status: "Pending",
//     },
//     {
//       id: 3,
//       doctorName: "Dr. Rajesh Kumar",
//       specialty: "Cardiologist",
//       date: "2024-01-14",
//       time: "11:00 AM",
//       type: "Consultation",
//       fee: 800,
//       status: "Completed",
//     },
//   ];

//   return (
//     <div
//       style={{
//         marginTop: "120px",
//         padding: "0",
//         width: "100vw",
//         marginLeft: "0",
//         marginRight: "0",
//         minHeight: "calc(100vh - 120px)",
//         overflowX: "hidden",
//         backgroundColor: "#F8F9FA",
//       }}
//     >
//       {/* Main Container with limited width for content */}
//       <div
//         style={{
//           maxWidth: "1400px",
//           margin: "0 auto",
//           padding: "1.5rem",
//           minHeight: "calc(100vh - 120px)",
//         }}
//       >
//         {/* Header Section */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "2rem",
//             flexWrap: "wrap",
//             gap: "1rem",
//           }}
//         >
//           {/* Left: Dashboard Button */}
//           <BackButton
//             onClick={() => setActiveView("dashboard")}
//             text="Dashboard"
//           />

//           {/* Center: Title */}
//           <div
//             style={{
//               textAlign: "center",
//               flex: 1,
//             }}
//           >
//             <h1
//               style={{
//                 color: "#7C2A62",
//                 fontSize: "2rem",
//                 margin: "0 0 0.5rem 0",
//                 fontWeight: "700",
//               }}
//             >
//               My Appointments
//             </h1>
//             <p
//               style={{
//                 color: "#666",
//                 margin: 0,
//                 fontSize: "1rem",
//               }}
//             >
//               Quick Care, Better Health
//             </p>
//           </div>

//           {/* Right: Search and Book Appointment */}
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "4rem",
//               flexWrap: "wrap",
//             }}
//           >
//             {/* Search Bar */}
//             <div
//               style={{
//                 position: "relative",
//                 minWidth: "320px",
//               }}
//             >
//               <input
//                 type="text"
//                 placeholder="Search doctors, specialties, or appointment ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{
//                   padding: "0.75rem 1rem 0.75rem 2.5rem",
//                   border: "2px solid #E5E7EB",
//                   borderRadius: "8px",
//                   fontSize: "0.9rem",
//                   width: "100%",
//                   outline: "none",
//                   transition: "border-color 0.3s ease",
//                   backgroundColor: "#F9FAFB",
//                 }}
//               />
//               <span
//                 style={{
//                   position: "absolute",
//                   left: "1rem",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   color: "#7C2A62",
//                   fontSize: "1rem",
//                 }}
//               >
//                 🔍
//               </span>
//             </div>

//             {/* Book New Appointment button */}
//             <button
//               style={{
//                 padding: "0.75rem 2rem",
//                 backgroundColor: "#7C2A62",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontSize: "0.9rem",
//                 fontWeight: "600",
//                 whiteSpace: "nowrap",
//                 minWidth: "180px",
//               }}
//               onClick={() => {
//                 // Scroll to top first, then navigate
//                 window.scrollTo({
//                   top: 0,
//                   left: 0,
//                   behavior: "smooth",
//                 });
//                 // Small delay to ensure scroll completes before navigation
//                 setTimeout(() => {
//                   setActiveView("consultation");
//                 }, 100);
//               }}
//               type="button"
//               disabled={loading}
//             >
//               {loading ? "Loading..." : "+ Book New Appointment"}
//             </button>
//           </div>
//         </div>

//         {/* Loading and Error States */}
//         {loading && (
//           <div
//             style={{
//               textAlign: "center",
//               padding: "2rem",
//               backgroundColor: "white",
//               borderRadius: "12px",
//               marginBottom: "2rem",
//               boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
//               border: "1px solid #E5E7EB",
//             }}
//           >
//             <div
//               style={{
//                 display: "inline-block",
//                 width: "40px",
//                 height: "40px",
//                 border: "4px solid #f3f3f3",
//                 borderTop: "4px solid #7C2A62",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite",
//                 marginBottom: "1rem",
//               }}
//             ></div>
//             <p style={{ color: "#666", margin: 0 }}>Loading appointments...</p>
//           </div>
//         )}

//         {error && (
//           <div
//             style={{
//               backgroundColor: "#FEF2F2",
//               border: "1px solid #FECACA",
//               color: "#DC2626",
//               padding: "1rem",
//               borderRadius: "8px",
//               marginBottom: "2rem",
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//             }}
//           >
//             <span>Error: {error}</span>
//             <button
//               onClick={() => setError(null)}
//               style={{
//                 backgroundColor: "transparent",
//                 border: "none",
//                 color: "#DC2626",
//                 cursor: "pointer",
//                 fontSize: "1.2rem",
//               }}
//             >
//               ×
//             </button>
//           </div>
//         )}

//         {/* Medical Consultation Information Section */}
//         <div
//           style={{
//             backgroundColor: "white",
//             borderRadius: "12px",
//             padding: "1.5rem",
//             marginBottom: "2rem",
//             boxShadow: "0 2px 15px rgba(0,0,0,0.08)",
//             border: "1px solid #E5E7EB",
//           }}
//         >
//           <h3
//             style={{
//               color: "#7C2A62",
//               fontSize: "1.25rem",
//               margin: "0 0 1.5rem 0",
//               fontWeight: "700",
//               textAlign: "center",
//             }}
//           >
//             Why Choose QuickMed?
//           </h3>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(2, 1fr)",
//               gap: "1.5rem",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: "1rem",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "2rem",
//                   color: "#7C2A62",
//                   flexShrink: 0,
//                 }}
//               >
//                 👨‍⚕️
//               </div>
//               <div>
//                 <h4
//                   style={{
//                     color: "#7C2A62",
//                     margin: "0 0 0.5rem 0",
//                     fontSize: "1rem",
//                   }}
//                 >
//                   Expert Medical Care
//                 </h4>
//                 <p
//                   style={{
//                     color: "#666",
//                     fontSize: "0.85rem",
//                     margin: 0,
//                     lineHeight: "1.4",
//                   }}
//                 >
//                   Consult with experienced doctors across 15+ specialties. Get
//                   personalized treatment plans and continuous care.
//                 </p>
//               </div>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: "1rem",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "2rem",
//                   color: "#7C2A62",
//                   flexShrink: 0,
//                 }}
//               >
//                 💊
//               </div>
//               <div>
//                 <h4
//                   style={{
//                     color: "#7C2A62",
//                     margin: "0 0 0.5rem 0",
//                     fontSize: "1rem",
//                   }}
//                 >
//                   Digital Prescriptions
//                 </h4>
//                 <p
//                   style={{
//                     color: "#666",
//                     fontSize: "0.85rem",
//                     margin: 0,
//                     lineHeight: "1.4",
//                   }}
//                 >
//                   Receive digital prescriptions instantly. Access your medical
//                   records and treatment history anytime.
//                 </p>
//               </div>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: "1rem",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "2rem",
//                   color: "#7C2A62",
//                   flexShrink: 0,
//                 }}
//               >
//                 🕒
//               </div>
//               <div>
//                 <h4
//                   style={{
//                     color: "#7C2A62",
//                     margin: "0 0 0.5rem 0",
//                     fontSize: "1rem",
//                   }}
//                 >
//                   24/7 Support
//                 </h4>
//                 <p
//                   style={{
//                     color: "#666",
//                     fontSize: "0.85rem",
//                     margin: 0,
//                     lineHeight: "1.4",
//                   }}
//                 >
//                   Our medical team is available round the clock. Emergency
//                   consultations and follow-ups made easy.
//                 </p>
//               </div>
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "flex-start",
//                 gap: "1rem",
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: "2rem",
//                   color: "#7C2A62",
//                   flexShrink: 0,
//                 }}
//               >
//                 📊
//               </div>
//               <div>
//                 <h4
//                   style={{
//                     color: "#7C2A62",
//                     margin: "0 0 0.5rem 0",
//                     fontSize: "1rem",
//                   }}
//                 >
//                   Health Monitoring
//                 </h4>
//                 <p
//                   style={{
//                     color: "#666",
//                     fontSize: "0.85rem",
//                     margin: 0,
//                     lineHeight: "1.4",
//                   }}
//                 >
//                   Track your health progress with our digital tools. Regular
//                   follow-ups and health tips for better outcomes.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Appointments Filter Tabs */}
//         <div
//           style={{
//             display: "flex",
//             gap: "0.5rem",
//             marginBottom: "2rem",
//             flexWrap: "wrap",
//             justifyContent: "center",
//           }}
//         >
//           {[
//             "all",
//             "scheduled",
//             "pending",
//             "rescheduled",
//             "cancelled",
//             "completed",
//           ].map((filter) => (
//             <button
//               key={filter}
//               style={
//                 appointmentFilter === filter
//                   ? {
//                       padding: "0.6rem 1.2rem",
//                       backgroundColor: "#7C2A62",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: "0.85rem",
//                       transition: "all 0.3s ease",
//                       textTransform: "capitalize",
//                       minWidth: "100px",
//                     }
//                   : {
//                       padding: "0.6rem 1.2rem",
//                       backgroundColor: "white",
//                       color: "#7C2A62",
//                       border: "1px solid #7C2A62",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                       fontSize: "0.85rem",
//                       transition: "all 0.3s ease",
//                       textTransform: "capitalize",
//                       minWidth: "100px",
//                     }
//               }
//               onClick={() => setAppointmentFilter(filter)}
//               type="button"
//               disabled={loading}
//             >
//               {filter === "all" ? "All" : filter}
//             </button>
//           ))}
//         </div>

//         {/* Main Content Grid */}
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "2fr 1fr",
//             gap: "2rem",
//             alignItems: "start",
//           }}
//         >
//           {/* Left Side: Appointments List */}
//           <div>
//             {!loading && displayAppointments.length === 0 ? (
//               <div
//                 style={{
//                   textAlign: "center",
//                   padding: "3rem",
//                   backgroundColor: "white",
//                   borderRadius: "15px",
//                   boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
//                   border: "1px solid #E5E7EB",
//                 }}
//               >
//                 <p
//                   style={{
//                     fontSize: "1.2rem",
//                     color: "#666",
//                     marginBottom: "1.5rem",
//                   }}
//                 >
//                   {appointmentFilter === "all" && searchTerm === ""
//                     ? "No appointments scheduled"
//                     : `No ${
//                         appointmentFilter !== "all" ? appointmentFilter : ""
//                       } appointments ${
//                         searchTerm ? `matching "${searchTerm}"` : ""
//                       }`.trim()}
//                 </p>
//                 <button
//                   style={{
//                     padding: "1rem 2rem",
//                     backgroundColor: "#7C2A62",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "8px",
//                     cursor: "pointer",
//                     fontSize: "1rem",
//                     fontWeight: "600",
//                   }}
//                   onClick={() => {
//                     // Scroll to top first, then navigate
//                     window.scrollTo({
//                       top: 0,
//                       left: 0,
//                       behavior: "smooth",
//                     });
//                     // Small delay to ensure scroll completes before navigation
//                     setTimeout(() => {
//                       setActiveView("consultation");
//                     }, 100);
//                   }}
//                   type="button"
//                   disabled={loading}
//                 >
//                   Book Your First Appointment
//                 </button>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "1.5rem",
//                 }}
//               >
//                 {displayAppointments.map((appointment) => (
//                   <div
//                     key={appointment.id}
//                     style={{
//                       backgroundColor: "white",
//                       borderRadius: "12px",
//                       padding: "1.5rem",
//                       boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
//                       border: "1px solid #E5E7EB",
//                       transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = "translateY(-2px)";
//                       e.currentTarget.style.boxShadow =
//                         "0 6px 20px rgba(0,0,0,0.12)";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)";
//                       e.currentTarget.style.boxShadow =
//                         "0 4px 15px rgba(0,0,0,0.08)";
//                     }}
//                   >
//                     {/* Appointment Header */}
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         alignItems: "flex-start",
//                         marginBottom: "1.25rem",
//                         paddingBottom: "1rem",
//                         borderBottom: "2px solid #F3F4F6",
//                       }}
//                     >
//                       <div style={{ flex: 1 }}>
//                         <h3
//                           style={{
//                             margin: "0 0 0.75rem 0",
//                             color: "#7C2A62",
//                             fontSize: "1.1rem",
//                             fontWeight: "700",
//                           }}
//                         >
//                           Appointment #{appointment.id}
//                         </h3>
//                         <p
//                           style={{
//                             margin: "0 0 0.25rem 0",
//                             color: "#1F2937",
//                             fontSize: "1.05rem",
//                             fontWeight: "600",
//                           }}
//                         >
//                           {appointment.doctorName}
//                         </p>
//                         <p
//                           style={{
//                             margin: 0,
//                             color: "#6B7280",
//                             fontSize: "0.9rem",
//                             fontWeight: "500",
//                           }}
//                         >
//                           {appointment.specialty}
//                         </p>
//                       </div>
//                       <div>
//                         <span
//                           style={{
//                             padding: "0.4rem 0.9rem",
//                             borderRadius: "20px",
//                             color: "white",
//                             fontSize: "0.75rem",
//                             fontWeight: "700",
//                             backgroundColor:
//                               appointment.status === "Scheduled"
//                                 ? "#10B981"
//                                 : appointment.status === "Completed"
//                                 ? "#3B82F6"
//                                 : appointment.status === "Cancelled"
//                                 ? "#EF4444"
//                                 : appointment.status === "Rescheduled"
//                                 ? "#F59E0B"
//                                 : appointment.status === "Pending"
//                                 ? "#F59E0B"
//                                 : "#6B7280",
//                           }}
//                         >
//                           {appointment.status.toUpperCase()}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Appointment Details */}
//                     <div
//                       style={{
//                         marginBottom: "1.5rem",
//                       }}
//                     >
//                       {[
//                         { label: "Date", value: appointment.date },
//                         { label: "Time", value: appointment.time },
//                         { label: "Type", value: appointment.type },
//                         { label: "Fee", value: `₹${appointment.fee}` },
//                       ].map((item, index) => (
//                         <div
//                           key={index}
//                           style={{
//                             display: "flex",
//                             justifyContent: "space-between",
//                             alignItems: "center",
//                             padding: "0.6rem 0",
//                             borderBottom: "1px solid #F3F4F6",
//                           }}
//                         >
//                           <span
//                             style={{
//                               color: "#6B7280",
//                               fontSize: "0.85rem",
//                               fontWeight: "500",
//                             }}
//                           >
//                             {item.label}:
//                           </span>
//                           <span
//                             style={{
//                               color:
//                                 item.label === "Fee" ? "#7C2A62" : "#1F2937",
//                               fontSize: "0.85rem",
//                               fontWeight: item.label === "Fee" ? "700" : "600",
//                             }}
//                           >
//                             {item.value}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Action Buttons */}
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "0.75rem",
//                         justifyContent: "flex-end",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       {appointment.status === "Scheduled" && (
//                         <>
//                           <button
//                             style={{
//                               padding: "0.5rem 1rem",
//                               backgroundColor: "#F59E0B",
//                               color: "white",
//                               border: "none",
//                               borderRadius: "6px",
//                               cursor: "pointer",
//                               fontSize: "0.8rem",
//                               fontWeight: "600",
//                             }}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               const newDate = prompt(
//                                 "Enter new date (YYYY-MM-DD):",
//                                 appointment.date
//                               );
//                               const newTime = prompt(
//                                 "Enter new time:",
//                                 appointment.time
//                               );
//                               if (newDate && newTime) {
//                                 rescheduleAppointment(
//                                   appointment.id,
//                                   newDate,
//                                   newTime
//                                 );
//                               }
//                             }}
//                             type="button"
//                             disabled={loading}
//                           >
//                             {loading ? "Rescheduling..." : "Reschedule"}
//                           </button>
//                           <button
//                             style={{
//                               padding: "0.5rem 1rem",
//                               backgroundColor: "#EF4444",
//                               color: "white",
//                               border: "none",
//                               borderRadius: "6px",
//                               cursor: "pointer",
//                               fontSize: "0.8rem",
//                               fontWeight: "600",
//                             }}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               cancelAppointment(appointment.id);
//                             }}
//                             type="button"
//                             disabled={loading}
//                           >
//                             {loading ? "Cancelling..." : "Cancel"}
//                           </button>
//                         </>
//                       )}
//                       {appointment.status === "Pending" && (
//                         <button
//                           style={{
//                             padding: "0.5rem 1rem",
//                             backgroundColor: "#EF4444",
//                             color: "white",
//                             border: "none",
//                             borderRadius: "6px",
//                             cursor: "pointer",
//                             fontSize: "0.8rem",
//                             fontWeight: "600",
//                           }}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             cancelAppointment(appointment.id);
//                           }}
//                           type="button"
//                           disabled={loading}
//                         >
//                           {loading ? "Cancelling..." : "Cancel"}
//                         </button>
//                       )}
//                       <button
//                         style={{
//                           padding: "0.5rem 1rem",
//                           backgroundColor: "transparent",
//                           color: "#7C2A62",
//                           border: "1px solid #7C2A62",
//                           borderRadius: "6px",
//                           cursor: "pointer",
//                           fontSize: "0.8rem",
//                           fontWeight: "600",
//                         }}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           viewAppointmentDetails(appointment);
//                         }}
//                         type="button"
//                         disabled={loading}
//                       >
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Right Side: Doctors Information Sidebar */}
//           <div
//             style={{
//               backgroundColor: "white",
//               borderRadius: "12px",
//               padding: "1.5rem",
//               boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
//               border: "1px solid #E5E7EB",
//               position: "sticky",
//               top: "140px",
//               maxHeight: "calc(100vh - 160px)",
//               overflowY: "auto",
//             }}
//           >
//             <h3
//               style={{
//                 color: "#7C2A62",
//                 fontSize: "1.25rem",
//                 margin: "0 0 1.5rem 0",
//                 fontWeight: "700",
//                 paddingBottom: "0.75rem",
//                 borderBottom: "2px solid #F3F4F6",
//               }}
//             >
//               Our Medical Team
//             </h3>

//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: "1.25rem",
//               }}
//             >
//               {Object.entries(doctorInfo).map(([doctorName, info]) => (
//                 <div
//                   key={doctorName}
//                   style={{
//                     padding: "1rem",
//                     backgroundColor: "#F8F9FA",
//                     borderRadius: "8px",
//                     border: "1px solid #E5E7EB",
//                   }}
//                 >
//                   <h4
//                     style={{
//                       margin: "0 0 0.5rem 0",
//                       color: "#1F2937",
//                       fontSize: "1rem",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {doctorName}
//                   </h4>
//                   <p
//                     style={{
//                       margin: "0 0 0.75rem 0",
//                       color: "#7C2A62",
//                       fontSize: "0.85rem",
//                       fontWeight: "500",
//                     }}
//                   >
//                     {info.specialty}
//                   </p>

//                   <div
//                     style={{
//                       display: "flex",
//                       flexDirection: "column",
//                       gap: "0.4rem",
//                       marginBottom: "0.75rem",
//                     }}
//                   >
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>
//                         Experience:
//                       </span>
//                       <span
//                         style={{
//                           color: "#1F2937",
//                           fontSize: "0.8rem",
//                           fontWeight: "500",
//                         }}
//                       >
//                         {info.experience}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>
//                         Education:
//                       </span>
//                       <span
//                         style={{
//                           color: "#1F2937",
//                           fontSize: "0.8rem",
//                           fontWeight: "500",
//                           textAlign: "right",
//                         }}
//                       >
//                         {info.education}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>
//                         Languages:
//                       </span>
//                       <span
//                         style={{
//                           color: "#1F2937",
//                           fontSize: "0.8rem",
//                           fontWeight: "500",
//                         }}
//                       >
//                         {info.languages}
//                       </span>
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                       }}
//                     >
//                       <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>
//                         Rating:
//                       </span>
//                       <span
//                         style={{
//                           color: "#10B981",
//                           fontSize: "0.8rem",
//                           fontWeight: "600",
//                         }}
//                       >
//                         {info.rating}
//                       </span>
//                     </div>
//                   </div>

//                   <p
//                     style={{
//                       margin: 0,
//                       color: "#6B7280",
//                       fontSize: "0.8rem",
//                       lineHeight: "1.4",
//                       fontStyle: "italic",
//                     }}
//                   >
//                     "{info.about}"
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Quick Stats */}
//             <div
//               style={{
//                 marginTop: "2rem",
//                 padding: "1rem",
//                 backgroundColor: "#7C2A62",
//                 borderRadius: "8px",
//                 color: "white",
//               }}
//             >
//               <h4
//                 style={{
//                   margin: "0 0 0.75rem 0",
//                   fontSize: "1rem",
//                   fontWeight: "600",
//                 }}
//               >
//                 QuickMed Stats
//               </h4>
//               <div
//                 style={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: "0.75rem",
//                   fontSize: "0.8rem",
//                 }}
//               >
//                 <div>
//                   <div style={{ opacity: 0.9 }}>Total Doctors</div>
//                   <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
//                     50+
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ opacity: 0.9 }}>Happy Patients</div>
//                   <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
//                     10,000+
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ opacity: 0.9 }}>Success Rate</div>
//                   <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
//                     98%
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ opacity: 0.9 }}>Availability</div>
//                   <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
//                     24/7
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Add CSS animation for spinner */}
//       <style>
//         {`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}
//       </style>
//     </div>
//   );
// };

// export default AppointmentsView;
