import mongoose from 'mongoose';

const projectProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    projectId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: [
    ]
}, { minimize: false });

export const ProjectProgress = mongoose.model('ProjectProgress', projectProgressSchema);
