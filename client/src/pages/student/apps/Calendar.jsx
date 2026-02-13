import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import StudentLayout from "../../../components/student/StudentLayout";
// 👇 Import the new component
import UpcomingEvents from "../../../components/student/UpcomingEvents"; 
import {
  Calendar as CalendarIcon,
  ChevronDown, // Add this
  Check,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Tag,
  Megaphone,
  FileText,
  BookOpen,
  GraduationCap,
  Coffee,
  Menu,
  Save,
  X
} from "lucide-react";

const Calendar = () => {
  const { backendUrl, getToken } = useContext(AppContext);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ✅ Backend events & Teams
  const [events, setEvents] = useState([]);
  const [allTeams, setAllTeams] = useState([]); // Stores list of teams for dropdown

  // ✅ Leader control
  const [teamId, setTeamId] = useState(null);
  const [isLeader, setIsLeader] = useState(false);

  // Event types for students
  const eventTypes = [
    {
      id: "team-meeting",
      name: "Team Meeting",
      color: "bg-blue-500",
      icon: <Users size={16} />,
      description: "Team collaboration meeting",
    },
    {
      id: "class",
      name: "Online Meeting",
      color: "bg-indigo-500",
      icon: <BookOpen size={16} />,
      description: "Live online class session",
    },
    {
      id: "deadline",
      name: "Deadline",
      color: "bg-red-500",
      icon: <AlertCircle size={16} />,
      description: "Submission deadline",
    },
    {
      id: "presentation",
      name: "Presentation",
      color: "bg-green-500",
      icon: <Megaphone size={16} />,
      description: "Project presentation",
    },
    {
      id: "review",
      name: "Code Review",
      color: "bg-purple-500",
      icon: <FileText size={16} />,
      description: "Code review session",
    },
    {
      id: "mentor-session",
      name: "Team Leader Session",
      color: "bg-cyan-500",
      icon: <GraduationCap size={16} />,
      description: "1:1 mentor guidance",
    },
    {
      id: "social",
      name: "Social Event",
      color: "bg-pink-500",
      icon: <Coffee size={16} />,
      description: "Team social gathering",
    },
  ];

  // Reminder options (in minutes)
  const reminderOptions = [
    { value: 0, label: "None" },
    { value: 5, label: "5 minutes before" },
    { value: 10, label: "10 minutes before" },
    { value: 15, label: "15 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 120, label: "2 hours before" },
    { value: 360, label: "6 hours before" },
    { value: 1440, label: "1 day before" },
  ];

  // Priority options
  const priorityOptions = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { id: "high", name: "High", color: "bg-red-100 text-red-800" },
  ];

  // Form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: selectedDate,
    startTime: "10:00",
    endTime: "11:00",
    type: "team-meeting",
    location: "",
    team: "",
    participants: [],
    reminders: [30],
    priority: "medium",
    customReminder: false,
    customReminderTime: 30,
    repeat: "none",
  });

  // Days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Initialize event form for selected date
  useEffect(() => {
    const defaultDate = new Date(selectedDate);
    defaultDate.setHours(10, 0, 0, 0);

    setEventForm((prev) => ({
      ...prev,
      date: defaultDate,
      startTime: "10:00",
      endTime: "11:00",
    }));
  }, [selectedDate]);

  // Get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Previous month's days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month's days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear(),
        isSelected:
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear(),
      });
    }

    // Next month's days
    const totalCells = 42; // 6 weeks * 7 days
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  };

  // ✅ Get events for selected date
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for mobile
  const formatDateMobile = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (!isLeader) return;

    setEventForm((prev) => ({
      ...prev,
      date: date,
      title: "",
      description: "",
      location: "",
      type: "team-meeting",
    }));
    setShowEventModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReminderChange = (reminderValue) => {
    setEventForm((prev) => ({
      ...prev,
      reminders: reminderValue === 0 ? [] : [reminderValue],
    }));
  };

  const scheduleReminder = (event, minutesBefore) => {
    const reminderTime = new Date(event.date.getTime() - minutesBefore * 60000);
    const now = new Date();

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime - now;

      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Reminder: ${event.title}`, {
            body: `Starts at ${formatTime(event.date)}`,
            icon: "/favicon.ico",
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(`Reminder: ${event.title}`, {
                body: `Starts at ${formatTime(event.date)}`,
                icon: "/favicon.ico",
              });
            }
          });
        }
      }, timeUntilReminder);
    }
  };

  // ✅ Fetch team events with Dropdown Logic (UPDATED)
  const fetchTeamEvents = async (selectedTeamId = null) => {
    try {
      const token = await getToken();
      
      // ✅ Pass teamId as query param if selected
      const query = selectedTeamId ? `?teamId=${selectedTeamId}` : "";

      const res = await axios.get(
        `${backendUrl}/api/calendar-event/my-team-events${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setTeamId(res.data.teamId || null);
        setIsLeader(Boolean(res.data.isLeader));
        
        // ✅ Save all teams for the dropdown
        setAllTeams(res.data.teams || []); 

        const serverEvents = res.data.events || [];

        const mapped = serverEvents.map((e) => {
          const start = new Date(e.startDate);
          const end = new Date(e.endDate);
          const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
          const typeMeta = eventTypes.find((t) => t.id === e.type);

          return {
            id: e._id,
            title: e.title,
            description: e.description || "",
            date: start,
            endDate: end,
            duration,
            type: e.type || "team-meeting",
            color: typeMeta?.color || "bg-blue-500",
            icon: typeMeta?.icon || <Users size={16} />,
            team: "Your Team",
            location: e.location || "TBD",
            participants: [],
            reminders: e.reminders || [],
            priority: e.priority || "medium",
            status: "upcoming",
          };
        });

        setEvents(mapped);

        mapped.forEach((ev) => {
          if (ev.reminders?.length > 0) {
            scheduleReminder(ev, ev.reminders[0]);
          }
        });
      } else {
        toast.error(res.data.message || "Failed to load calendar events");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load calendar events");
    }
  };

  useEffect(() => {
    fetchTeamEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveEvent = async () => {
    try {
      if (!isLeader) {
        toast.error("Only team leader can add/update events");
        return;
      }
      if (!teamId) {
        toast.error("Team not found");
        return;
      }
      if (!eventForm.title.trim()) {
        toast.error("Please enter event title");
        return;
      }

      const token = await getToken();
      if (!token) {
        toast.error("Login required");
        return;
      }

      const [startHour, startMinute] = eventForm.startTime.split(":").map(Number);
      const [endHour, endMinute] = eventForm.endTime.split(":").map(Number);

      const startDate = new Date(eventForm.date);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(eventForm.date);
      endDate.setHours(endHour, endMinute, 0, 0);

      if (endDate < startDate) {
        toast.error("End time must be after start time");
        return;
      }

      const payload = {
        teamId,
        title: eventForm.title,
        description: eventForm.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        type: eventForm.type,
        location: eventForm.location,
        reminders: eventForm.reminders,
        priority: eventForm.priority,
      };

      let res;
      if (editingEvent) {
        res = await axios.put(
          `${backendUrl}/api/calendar-event/update/${editingEvent.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${backendUrl}/api/calendar-event/create`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (res.data.success) {
        toast.success(res.data.message || "Saved");
        setShowEventModal(false);
        setEditingEvent(null);
        resetEventForm();
        fetchTeamEvents(teamId);
      } else {
        toast.error(res.data.message || "Failed to save event");
      }
    } catch (error) {
      console.error("❌ [handleSaveEvent] Error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to save event");
    }
  };

  const handleEditEvent = (event) => {
    if (!isLeader) return;
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      startTime: event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(" ", ""),
      endTime: event.endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).replace(" ", ""),
      type: event.type,
      location: event.location,
      team: event.team,
      participants: event.participants,
      reminders: event.reminders,
      priority: event.priority,
      customReminder: false,
      customReminderTime: event.reminders[0] || 30,
      repeat: "none",
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      if (!isLeader) {
        toast.error("Only team leader can delete events");
        return;
      }
      if (!window.confirm("Are you sure you want to delete this event?")) return;

      const token = await getToken();
      const res = await axios.delete(
        `${backendUrl}/api/calendar-event/delete/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Event deleted");
        fetchTeamEvents(teamId);
      } else {
        toast.error(res.data.message || "Failed to delete event");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const resetEventForm = () => {
    const defaultDate = new Date(selectedDate);
    defaultDate.setHours(10, 0, 0, 0);
    setEventForm({
      title: "",
      description: "",
      date: defaultDate,
      startTime: "10:00",
      endTime: "11:00",
      type: "team-meeting",
      location: "",
      team: "",
      participants: [],
      reminders: [30],
      priority: "medium",
      customReminder: false,
      customReminderTime: 30,
      repeat: "none",
    });
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const calendarDays = generateCalendarDays();

  return (
    <StudentLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header with Dropdown Logic */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between md:justify-start w-full md:w-auto">
            
            {/* ✅ DYNAMIC TEAM SELECTOR UI */}
            <div className="flex flex-col relative z-20"> {/* Added z-20 for stacking context */}
              {allTeams && allTeams.length > 1 ? (
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    Calendar
                  </h1>
                  
                  <div className="hidden md:block h-6 w-px bg-gray-300"></div>

                  {/* CUSTOM DROPDOWN COMPONENT */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center justify-between gap-3 bg-white border border-gray-200 hover:border-cyan-500 text-gray-700 text-sm md:text-base font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-sm min-w-[220px]"
                    >
                      <span className="truncate">
                        {allTeams.find(t => t._id === teamId)?.name || "Select Team"}
                      </span>
                      <ChevronDown 
                        size={18} 
                        className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                      />
                    </button>

                    {/* The Custom List */}
                    {isDropdownOpen && (
                      <>
                        {/* Invisible backdrop to close when clicking outside */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setIsDropdownOpen(false)}
                        ></div>
                        
                        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                          {allTeams.map((t) => (
                            <button
                              key={t._id}
                              onClick={() => {
                                fetchTeamEvents(t._id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm md:text-base hover:bg-cyan-50 transition-colors flex items-center justify-between group ${
                                teamId === t._id ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-700"
                              }`}
                            >
                              <span className="truncate">{t.name}</span>
                              {teamId === t._id && (
                                <Check size={16} className="text-cyan-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                    {allTeams && allTeams.length > 0 ? allTeams[0].name : "Calendar"}
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">
                    Track your project meetings, deadlines, and schedules
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
          </div>

          <div
            className={`flex-col md:flex-row items-center gap-3 ${
              mobileMenuOpen ? "flex" : "hidden md:flex"
            }`}
          >
            {/* ✅ Only Leader can add */}
            {isLeader && (
              <button
                onClick={() => {
                  setEditingEvent(null);
                  resetEventForm();
                  setShowEventModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 w-full md:w-auto justify-center"
              >
                <Plus size={16} />
                <span>Add Event</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Calendar & Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Calendar Card */}
            <div className="bg-white rounded-xl shadow">
              {/* Calendar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-lg md:text-xl font-semibold min-w-[180px] text-center">
                        {months[currentMonth.getMonth()]}{" "}
                        {currentMonth.getFullYear()}
                      </h2>
                      <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                      Today: {formatDateMobile(new Date())}
                    </div>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-2 md:p-4">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs md:text-sm font-medium text-gray-500 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    return (
                      <div
                        key={index}
                        onClick={() => handleDateClick(day.date)}
                        className={`
                          min-h-16 md:min-h-24 p-1 md:p-2 border rounded-lg cursor-pointer transition-all text-xs md:text-sm
                          ${day.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                          ${
                            day.isToday
                              ? "border-cyan-500 border-2"
                              : "border-gray-200"
                          }
                          ${day.isSelected ? "ring-1 md:ring-2 ring-cyan-500" : ""}
                          hover:bg-gray-50
                        `}
                      >
                        <div className="flex justify-between items-start mb-0 md:mb-1">
                          <span
                            className={`
                            font-medium
                            ${
                              day.isToday
                                ? "text-cyan-600"
                                : day.isCurrentMonth
                                ? "text-gray-900"
                                : "text-gray-400"
                            }
                          `}
                          >
                            {day.date.getDate()}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="hidden md:inline text-xs bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded-full">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {/* Event Indicators */}
                        <div className="space-y-0.5 mt-0.5 md:mt-1">
                          {dayEvents
                            .slice(0, viewMode === "month" ? 1 : 2)
                            .map((event) => {
                              const eventType = eventTypes.find(
                                (type) => type.id === event.type
                              );
                              return (
                                <div
                                  key={event.id}
                                  className={`text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded truncate ${event.color} text-white`}
                                  title={event.title}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isLeader) handleEditEvent(event);
                                  }}
                                >
                                  <div className="hidden md:flex items-center gap-1">
                                    <span className="flex-shrink-0">
                                      {eventType?.icon || <Users size={10} />}
                                    </span>
                                    <span className="truncate">
                                      {formatTime(event.date)} {event.title}
                                    </span>
                                  </div>
                                  <div className="md:hidden text-center">•</div>
                                </div>
                              );
                            })}
                          {dayEvents.length >
                            (viewMode === "month" ? 1 : 2) && (
                            <div className="text-xs text-gray-500 text-center">
                              +
                              {dayEvents.length -
                                (viewMode === "month" ? 1 : 2)}{" "}
                              more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ✅ Upcoming Events Component - MOVED HERE */}
            <UpcomingEvents 
              events={events} 
              eventTypes={eventTypes} 
              priorityOptions={priorityOptions} 
              isLeader={isLeader} 
              onEdit={handleEditEvent} 
              onDelete={handleDeleteEvent} 
            />
          </div>

          {/* Right Side - Event Details & Tools */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {formatDateMobile(selectedDate)}
                </h3>
              </div>
              <div className="p-4">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-gray-500">
                    <CalendarIcon
                      size={36}
                      className="mx-auto mb-2 md:mb-3 text-gray-300"
                    />
                    <p className="text-sm md:text-base">No events scheduled</p>

                    {/* ✅ Only Leader can add */}
                    {isLeader && (
                      <button
                        onClick={() => {
                          setEditingEvent(null);
                          resetEventForm();
                          setShowEventModal(true);
                        }}
                        className="mt-2 md:mt-3 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                      >
                        + Add an event
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    {getEventsForDate(selectedDate).map((event) => {
                      const eventType = eventTypes.find(
                        (type) => type.id === event.type
                      );
                      return (
                        <div
                          key={event.id}
                          className="p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className={`w-3 h-3 rounded-full mt-1 ${event.color} flex-shrink-0`}
                              ></div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <h4 className="font-semibold truncate">
                                    {event.title}
                                  </h4>
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      priorityOptions.find(
                                        (p) => p.id === event.priority
                                      )?.color
                                    } self-start sm:self-center`}
                                  >
                                    {event.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {event.description}
                                </p>
                                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(event.date)} ({event.duration}{" "}
                                    min)
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span className="truncate">
                                      {event.location}
                                    </span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {eventType?.name}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* ✅ Only Leader can edit/delete */}
                            {isLeader && (
                              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditEvent(event)}
                                  className="p-1 text-gray-400 hover:text-cyan-600"
                                  title="Edit"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {event.participants.length} participants
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {event.reminders.map((reminder, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                                  >
                                    <Bell size={10} />
                                    {reminder >= 60
                                      ? `${reminder / 60}h`
                                      : `${reminder}m`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Event Types */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Event Types</h3>
              </div>
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 md:gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        if (!isLeader) return;
                        setEventForm((prev) => ({ ...prev, type: type.id }));
                        if (!showEventModal) {
                          setShowEventModal(true);
                        }
                      }}
                      className="p-2 md:p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 md:p-2 rounded-lg ${type.color} text-white`}
                        >
                          {React.cloneElement(type.icon, { size: 14 })}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {type.name}
                          </div>
                          <div className="text-xs text-gray-500 hidden md:block">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {!isLeader && (
                  <p className="text-xs text-gray-500 mt-3">
                    Only team leader can add or edit events.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">This Month</h3>
              </div>
              <div className="p-3 md:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 md:gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-blue-700">
                      {
                        events.filter(
                          (e) =>
                            e.date.getMonth() === currentMonth.getMonth() &&
                            e.date.getFullYear() === currentMonth.getFullYear()
                        ).length
                      }
                    </div>
                    <div className="text-sm text-blue-600">Total Events</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-green-700">
                      {events.filter((e) => e.type === "team-meeting").length}
                    </div>
                    <div className="text-sm text-green-600">Meetings</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-red-700">
                      {events.filter((e) => e.type === "deadline").length}
                    </div>
                    <div className="text-sm text-red-600">Deadlines</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl md:text-2xl font-bold text-purple-700">
                      {events.filter((e) => e.type === "class").length}
                    </div>
                    <div className="text-sm text-purple-600">Classes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal (Leader only) */}
      {showEventModal && isLeader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    resetEventForm();
                  }}
                  className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Event Type Selection - FIXED GRID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {eventTypes.slice(0, 4).map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setEventForm((prev) => ({ ...prev, type: type.id }))
                        }
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 h-full min-h-[80px] ${
                          eventForm.type === type.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${type.color} text-white`}
                        >
                          {React.cloneElement(type.icon, { size: 16 })}
                        </div>
                        <span className="text-xs font-medium text-center">
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {eventTypes.slice(4, 7).map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() =>
                          setEventForm((prev) => ({ ...prev, type: type.id }))
                        }
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 h-full min-h-[80px] ${
                          eventForm.type === type.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${type.color} text-white`}
                        >
                          {React.cloneElement(type.icon, { size: 16 })}
                        </div>
                        <span className="text-xs font-medium text-center">
                          {type.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Title & Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={eventForm.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date.toISOString().split("T")[0]}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(
                          eventForm.date.getHours(),
                          eventForm.date.getMinutes()
                        );
                        setEventForm((prev) => ({ ...prev, date: newDate }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={eventForm.startTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventForm.endTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={eventForm.location}
                      onChange={handleInputChange}
                      placeholder="Zoom, Room, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team/Group
                    </label>
                    <input
                      type="text"
                      name="team"
                      value={eventForm.team}
                      onChange={handleInputChange}
                      placeholder="Team name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                {/* Priority & Reminder */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {priorityOptions.map((priority) => (
                        <button
                          key={priority.id}
                          type="button"
                          onClick={() =>
                            setEventForm((prev) => ({
                              ...prev,
                              priority: priority.id,
                            }))
                          }
                          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                            eventForm.priority === priority.id
                              ? `${priority.color} border-transparent`
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {priority.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder
                    </label>
                    <select
                      value={eventForm.reminders[0] || 0}
                      onChange={(e) =>
                        handleReminderChange(parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm md:text-base"
                    >
                      {reminderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      resetEventForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base order-1 sm:order-2"
                  >
                    <Save size={16} />
                    {editingEvent ? "Update Event" : "Save Event"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default Calendar;