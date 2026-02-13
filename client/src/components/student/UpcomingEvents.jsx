import React from "react";
import {
  Clock,
  MapPin,
  Users,
  Tag,
  AlertCircle,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Bell
} from "lucide-react";

const UpcomingEvents = ({ events, eventTypes, priorityOptions, isLeader, onEdit, onDelete }) => {
  
  // Helpers strictly for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateMobile = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6 bg-white rounded-xl shadow">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" />
          Upcoming Deadlines & Events
        </h3>
      </div>
      <div className="p-2 md:p-4">
        {events
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5)
          .map((event) => {
            const eventType = eventTypes.find((type) => type.id === event.type);
            
            return (
              <div
                key={event.id}
                className="mb-3 md:mb-4 p-3 border border-gray-200 rounded-lg hover:border-cyan-200 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${event.color} text-white hidden sm:block`}>
                      {React.cloneElement(eventType?.icon || <Users size={16} />, { size: 16 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            priorityOptions.find((p) => p.id === event.priority)?.color
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
                          <CalendarIcon size={12} />
                          <span className="truncate">
                            {formatDateMobile(event.date)}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatTime(event.date)} ({event.duration} min)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          <span className="truncate">{event.location}</span>
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
                        onClick={() => onEdit(event)}
                        className="p-1 text-gray-400 hover:text-cyan-600"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(event.id)}
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
    </div>
  );
};

export default UpcomingEvents;