import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
    unique: true // ✅ BEST PRACTICE: Ensures 1 User = 1 Active Device in DB
  },
  token: {
    type: String,
    required: true
    // ⚠️ REMOVED 'unique: true' to prevent crashes on shared computers
  },
  updatedAt: { // ✅ CHANGED: We track when it was last updated
    type: Date,
    default: Date.now,
    expires: '60d' // TTL: Deletes document if 'updatedAt' is older than 60 days
  }
});

// Optional: Ensure 'updatedAt' updates on every save
deviceTokenSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("DeviceToken", deviceTokenSchema);