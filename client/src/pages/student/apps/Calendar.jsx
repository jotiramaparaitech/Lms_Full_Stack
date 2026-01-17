import StudentLayout from "../../../components/student/StudentLayout";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Users,
  Bell,
  Video,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Download,
  Share2,
  Filter,
  Search,
  X,
  Save,
  CalendarDays,
  Tag,
  Megaphone,
  Target,
  FileText,
  BookOpen,
  GraduationCap,
  Briefcase,
  Coffee
} from "lucide-react";

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Project Kickoff Meeting",
      description: "Initial meeting with team members and mentor",
      date: new Date(2026, 0, 17, 10, 0),
      endDate: new Date(2026, 0, 17, 11, 0),
      duration: 60,
      type: "team-meeting",
      color: "bg-blue-500",
      icon: <Users size={16} />,
      team: "React E-commerce Team",
      location: "Zoom Meeting",
      participants: ["John (Mentor)", "Alice", "Bob", "Charlie"],
      reminders: [30, 10], // minutes before
      status: "upcoming",
      priority: "high"
    },
    {
      id: 2,
      title: "UI Design Review",
      description: "Review Figma designs with design team",
      date: new Date(2026, 0, 18, 14, 0),
      endDate: new Date(2026, 0, 18, 15, 30),
      duration: 90,
      type: "review",
      color: "bg-purple-500",
      icon: <FileText size={16} />,
      team: "Design Team",
      location: "Conference Room A",
      participants: ["Design Lead", "Alice", "Bob"],
      reminders: [60, 15],
      status: "upcoming",
      priority: "medium"
    },
    {
      id: 3,
      title: "Code Submission Deadline",
      description: "Phase 1 code submission for review",
      date: new Date(2026, 0, 22, 23, 59),
      endDate: new Date(2026, 0, 22, 23, 59),
      duration: 0,
      type: "deadline",
      color: "bg-red-500",
      icon: <AlertCircle size={16} />,
      team: "React E-commerce Team",
      location: "GitHub Repository",
      participants: ["All Team Members"],
      reminders: [1440, 360, 60], // 1 day, 6 hours, 1 hour
      status: "upcoming",
      priority: "high"
    },
    {
      id: 4,
      title: "Client Demo Presentation",
      description: "Present progress to client stakeholders",
      date: new Date(2026, 0, 25, 11, 0),
      endDate: new Date(2026, 0, 25, 13, 0),
      duration: 120,
      type: "presentation",
      color: "bg-green-500",
      icon: <Megaphone size={16} />,
      team: "All Teams",
      location: "Main Auditorium",
      participants: ["Client", "All Mentors", "All Students"],
      reminders: [1440, 120, 30],
      status: "upcoming",
      priority: "high"
    },
    {
      id: 5,
      title: "Peer Code Review",
      description: "Review each other's code submissions",
      date: new Date(2026, 0, 19, 16, 0),
      endDate: new Date(2026, 0, 19, 17, 0),
      duration: 60,
      type: "review",
      color: "bg-yellow-500",
      icon: <FileText size={16} />,
      team: "React E-commerce Team",
      location: "Pair Programming Room",
      participants: ["Alice", "Bob"],
      reminders: [30],
      status: "upcoming",
      priority: "medium"
    },
  ]);

  // Event types for students
  const eventTypes = [
    {
      id: "team-meeting",
      name: "Team Meeting",
      color: "bg-blue-500",
      icon: <Users size={16} />,
      description: "Team collaboration meeting"
    },
    {
      id: "class",
      name: "Online Class",
      color: "bg-indigo-500",
      icon: <BookOpen size={16} />,
      description: "Live online class session"
    },
    {
      id: "deadline",
      name: "Deadline",
      color: "bg-red-500",
      icon: <AlertCircle size={16} />,
      description: "Submission deadline"
    },
    {
      id: "presentation",
      name: "Presentation",
      color: "bg-green-500",
      icon: <Megaphone size={16} />,
      description: "Project presentation"
    },
    {
      id: "review",
      name: "Code Review",
      color: "bg-purple-500",
      icon: <FileText size={16} />,
      description: "Code review session"
    },
    {
      id: "mentor-session",
      name: "Mentor Session",
      color: "bg-cyan-500",
      icon: <GraduationCap size={16} />,
      description: "1:1 mentor guidance"
    },
    {
      id: "workshop",
      name: "Workshop",
      color: "bg-orange-500",
      icon: <Briefcase size={16} />,
      description: "Skill development workshop"
    },
    {
      id: "social",
      name: "Social Event",
      color: "bg-pink-500",
      icon: <Coffee size={16} />,
      description: "Team social gathering"
    }
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
    { value: 1440, label: "1 day before" }
  ];

  // Priority options
  const priorityOptions = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-800" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { id: "high", name: "High", color: "bg-red-100 text-red-800" }
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
    repeat: "none"
  });

  // Days of the week
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Initialize event form for selected date
  useEffect(() => {
    const defaultDate = new Date(selectedDate);
    defaultDate.setHours(10, 0, 0, 0);
    
    setEventForm(prev => ({
      ...prev,
      date: defaultDate,
      startTime: "10:00",
      endTime: "11:00"
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

  // Get events for selected date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle date click - open event modal
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventForm(prev => ({
      ...prev,
      date: date,
      title: "",
      description: "",
      location: "",
      type: "team-meeting"
    }));
    setShowEventModal(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle reminder change
  const handleReminderChange = (reminderValue) => {
    setEventForm(prev => ({
      ...prev,
      reminders: reminderValue === 0 ? [] : [reminderValue]
    }));
  };

  // Save event
  const handleSaveEvent = () => {
    if (!eventForm.title.trim()) {
      alert("Please enter event title");
      return;
    }

    const [startHour, startMinute] = eventForm.startTime.split(":").map(Number);
    const [endHour, endMinute] = eventForm.endTime.split(":").map(Number);
    
    const startDate = new Date(eventForm.date);
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const endDate = new Date(eventForm.date);
    endDate.setHours(endHour, endMinute, 0, 0);
    
    const duration = (endDate - startDate) / (1000 * 60); // in minutes
    
    const eventType = eventTypes.find(type => type.id === eventForm.type);
    
    const newEvent = {
      id: editingEvent ? editingEvent.id : events.length + 1,
      title: eventForm.title,
      description: eventForm.description,
      date: startDate,
      endDate: endDate,
      duration: duration,
      type: eventForm.type,
      color: eventType?.color || "bg-blue-500",
      icon: eventType?.icon || <Users size={16} />,
      team: eventForm.team || "Your Team",
      location: eventForm.location || "TBD",
      participants: eventForm.participants,
      reminders: eventForm.reminders,
      priority: eventForm.priority,
      status: "upcoming"
    };

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(e => e.id === editingEvent.id ? newEvent : e));
    } else {
      // Add new event
      setEvents([...events, newEvent]);
    }

    // Show confirmation
    alert(`Event "${eventForm.title}" ${editingEvent ? 'updated' : 'added'} successfully!`);
    
    // Set reminder notification
    if (eventForm.reminders.length > 0) {
      const reminderTime = eventForm.reminders[0];
      scheduleReminder(newEvent, reminderTime);
    }

    // Reset form and close modal
    setShowEventModal(false);
    setEditingEvent(null);
    resetEventForm();
  };

  // Schedule reminder notification
  const scheduleReminder = (event, minutesBefore) => {
    const reminderTime = new Date(event.date.getTime() - minutesBefore * 60000);
    const now = new Date();
    
    if (reminderTime > now) {
      const timeUntilReminder = reminderTime - now;
      
      setTimeout(() => {
        if (Notification.permission === "granted") {
          new Notification(`Reminder: ${event.title}`, {
            body: `Starts at ${formatTime(event.date)}`,
            icon: "/favicon.ico"
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then(permission => {
            if (permission === "granted") {
              new Notification(`Reminder: ${event.title}`, {
                body: `Starts at ${formatTime(event.date)}`,
                icon: "/favicon.ico"
              });
            }
          });
        }
      }, timeUntilReminder);
    }
  };

  // Edit event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    
    const eventType = eventTypes.find(type => type.id === event.type);
    
    setEventForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date),
      startTime: formatTime(event.date).replace(" ", ""),
      endTime: formatTime(event.endDate).replace(" ", ""),
      type: event.type,
      location: event.location,
      team: event.team,
      participants: event.participants,
      reminders: event.reminders,
      priority: event.priority,
      customReminder: false,
      customReminderTime: event.reminders[0] || 30,
      repeat: "none"
    });
    
    setShowEventModal(true);
  };

  // Delete event
  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  // Reset event form
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
      repeat: "none"
    });
  };

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Calendar days
  const calendarDays = generateCalendarDays();

  // Get selected event type
  const selectedEventType = eventTypes.find(type => type.id === eventForm.type);

  return (
    <StudentLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Track your project meetings, deadlines, and schedules</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Share2 size={16} />
              <span>Share</span>
            </button>
            <button 
              onClick={() => {
                setEditingEvent(null);
                resetEventForm();
                setShowEventModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow">
              {/* Calendar Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <h2 className="text-xl font-semibold">
                        {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                      </h2>
                      <button 
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                      <button 
                        onClick={() => setViewMode("month")}
                        className={`px-3 py-1 rounded ${viewMode === "month" ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                      >
                        Month
                      </button>
                      <button 
                        onClick={() => setViewMode("week")}
                        className={`px-3 py-1 rounded ${viewMode === "week" ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                      >
                        Week
                      </button>
                      <button 
                        onClick={() => setViewMode("day")}
                        className={`px-3 py-1 rounded ${viewMode === "day" ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                      >
                        Day
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Today: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center font-medium text-gray-500 py-2">
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
                          min-h-32 p-2 border rounded-lg cursor-pointer transition-all
                          ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                          ${day.isToday ? 'border-cyan-500 border-2' : 'border-gray-200'}
                          ${day.isSelected ? 'ring-2 ring-cyan-500' : ''}
                          hover:bg-gray-50
                        `}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`
                            text-sm font-medium
                            ${day.isToday ? 'text-cyan-600' : 
                              day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                          `}>
                            {day.date.getDate()}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>
                        
                        {/* Event Indicators */}
                        <div className="space-y-1 mt-1">
                          {dayEvents.slice(0, 2).map((event) => {
                            const eventType = eventTypes.find(type => type.id === event.type);
                            return (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded truncate ${event.color} text-white flex items-center gap-1`}
                                title={event.title}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditEvent(event);
                                }}
                              >
                                <span className="flex-shrink-0">
                                  {eventType?.icon || <Users size={12} />}
                                </span>
                                <span className="truncate">
                                  {formatTime(event.date)} {event.title}
                                </span>
                              </div>
                            );
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="mt-6 bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <AlertCircle size={20} className="text-red-500" />
                  Upcoming Deadlines & Events
                </h3>
              </div>
              <div className="p-4">
                {events
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((event) => (
                    <div 
                      key={event.id} 
                      className="mb-4 p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${event.color} text-white`}>
                            {eventTypes.find(type => type.id === event.type)?.icon || <Users size={16} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${priorityOptions.find(p => p.id === event.priority)?.color}`}>
                                {event.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-700">
                              <span className="flex items-center gap-1">
                                <CalendarIcon size={14} />
                                {formatDate(event.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {formatTime(event.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Bell size={14} />
                                {event.reminders.length > 0 
                                  ? `${event.reminders[0] >= 60 ? `${event.reminders[0]/60}h` : `${event.reminders[0]}m`} before`
                                  : "No reminder"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
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
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Side - Event Details & Tools */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">
                  {formatDate(selectedDate)}
                </h3>
              </div>
              <div className="p-4">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No events scheduled</p>
                    <button 
                      onClick={() => {
                        setEditingEvent(null);
                        resetEventForm();
                        setShowEventModal(true);
                      }}
                      className="mt-3 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                    >
                      + Add an event
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getEventsForDate(selectedDate).map((event) => {
                      const eventType = eventTypes.find(type => type.id === event.type);
                      return (
                        <div 
                          key={event.id} 
                          className="p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div className={`w-3 h-3 rounded-full mt-1 ${event.color}`}></div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{event.title}</h4>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${priorityOptions.find(p => p.id === event.priority)?.color}`}>
                                    {event.priority}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    {formatTime(event.date)} ({event.duration} min)
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {event.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Tag size={12} />
                                    {eventType?.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
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
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {event.participants.length} participants
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                {event.reminders.map((reminder, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center gap-1"
                                  >
                                    <Bell size={10} />
                                    {reminder >= 60 ? `${reminder/60}h` : `${reminder}m`}
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
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setEventForm(prev => ({ ...prev, type: type.id }));
                        if (!showEventModal) {
                          setShowEventModal(true);
                        }
                      }}
                      className="p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{type.name}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">This Month</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {events.filter(e => 
                        e.date.getMonth() === currentMonth.getMonth() && 
                        e.date.getFullYear() === currentMonth.getFullYear()
                      ).length}
                    </div>
                    <div className="text-sm text-blue-600">Total Events</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {events.filter(e => e.type === "team-meeting").length}
                    </div>
                    <div className="text-sm text-green-600">Meetings</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">
                      {events.filter(e => e.type === "deadline").length}
                    </div>
                    <div className="text-sm text-red-600">Deadlines</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">
                      {events.filter(e => e.type === "class").length}
                    </div>
                    <div className="text-sm text-purple-600">Classes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setEditingEvent(null);
                    resetEventForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Event Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {eventTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setEventForm(prev => ({ ...prev, type: type.id }))}
                        className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 ${
                          eventForm.type === type.id
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          {type.icon}
                        </div>
                        <span className="text-xs font-medium">{type.name}</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.date.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newDate = new Date(e.target.value);
                        newDate.setHours(eventForm.date.getHours(), eventForm.date.getMinutes());
                        setEventForm(prev => ({ ...prev, date: newDate }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Team */}
                <div className="grid grid-cols-2 gap-4">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Priority & Reminder */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {priorityOptions.map((priority) => (
                        <button
                          key={priority.id}
                          type="button"
                          onClick={() => setEventForm(prev => ({ ...prev, priority: priority.id }))}
                          className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                            eventForm.priority === priority.id
                              ? `${priority.color} border-transparent`
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                      onChange={(e) => handleReminderChange(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEventModal(false);
                      setEditingEvent(null);
                      resetEventForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Save size={16} />
                    {editingEvent ? 'Update Event' : 'Save Event'}
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