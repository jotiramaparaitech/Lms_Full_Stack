import User from "../models/User.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import Team from "../models/Team.js";
import TeamMessage from "../models/TeamMessage.js";
import Attendance from "../models/Attendance.js";
import CalendarEvent from "../models/CalendarEvent.js";
import DeviceToken from "../models/DeviceToken.js";
import { TestResult } from "../models/TestResult.js"; // Fixed: Named export
import Ticket from "../models/Ticket.js";
import Todo from "../models/Todo.js";

/**
 * Merges data from an old User ID to a new User ID and deletes the old user.
 * 
 * @param {string} oldUserId - The ID of the duplicate user to be merged.
 * @param {string} newUserId - The ID of the primary user to merge into.
 */
export const mergeUsers = async (oldUserId, newUserId) => {
    if (oldUserId === newUserId) return;

    console.log(`🔄 Merging user ${oldUserId} into ${newUserId}...`);

    try {
        const oldUser = await User.findById(oldUserId);
        if (!oldUser) {
            console.log(`⚠️ Old user ${oldUserId} not found, skipping merge.`);
            return;
        }
        const newUser = await User.findById(newUserId);
        if (!newUser) {
            console.log(`⚠️ New user ${newUserId} not found, skipping merge.`);
            return;
        }

        // 1. Update CourseProgress
        await CourseProgress.updateMany({ userId: oldUserId }, { userId: newUserId });

        // 2. Update Purchase
        await Purchase.updateMany({ userId: oldUserId }, { userId: newUserId });

        // 3. Update Course (enrolledStudents array)
        await Course.updateMany(
            { enrolledStudents: oldUserId },
            { $addToSet: { enrolledStudents: newUserId } }
        );
        await Course.updateMany(
            { enrolledStudents: oldUserId },
            { $pull: { enrolledStudents: oldUserId } }
        );

        // 4. Update Team (members.userId and pendingRequests)
        const teamsWithOldMember = await Team.find({ "members.userId": oldUserId });
        for (const team of teamsWithOldMember) {
            const hasNewMember = team.members.find(m => m.userId === newUserId);
            if (hasNewMember) {
                // Already a member, just remove old one
                await Team.updateOne(
                    { _id: team._id },
                    { $pull: { members: { userId: oldUserId } } }
                );
            } else {
                // Update old member ID to new one
                await Team.updateOne(
                    { _id: team._id, "members.userId": oldUserId },
                    { $set: { "members.$.userId": newUserId } }
                );
            }
        }

        await Team.updateMany(
            { pendingRequests: oldUserId },
            { $addToSet: { pendingRequests: newUserId } }
        );
        await Team.updateMany(
            { pendingRequests: oldUserId },
            { $pull: { pendingRequests: oldUserId } }
        );

        // 5. Update TeamMessage
        await TeamMessage.updateMany({ sender: oldUserId }, { sender: newUserId });

        // 6. Update Attendance (Unique index on studentId, courseId, date, session)
        const oldAttendances = await Attendance.find({ studentId: oldUserId });
        for (const att of oldAttendances) {
            const existing = await Attendance.findOne({
                studentId: newUserId,
                courseId: att.courseId,
                date: att.date,
                session: att.session
            });
            if (existing) {
                // Conflict, just delete old one
                await Attendance.findByIdAndDelete(att._id);
            } else {
                // No conflict, move to new ID
                att.studentId = newUserId;
                await att.save();
            }
        }

        // 7. Update CalendarEvent
        await CalendarEvent.updateMany({ createdBy: oldUserId }, { createdBy: newUserId });

        // 8. Update DeviceToken (Unique index on userId)
        await DeviceToken.deleteMany({ userId: newUserId }); // Keep current login's token or old one? Usually current.
        await DeviceToken.updateMany({ userId: oldUserId }, { userId: newUserId });

        // 9. Update TestResult (studentId)
        await TestResult.updateMany({ studentId: oldUserId }, { studentId: newUserId });

        // 10. Update Ticket
        await Ticket.updateMany({ userId: oldUserId }, { userId: newUserId });

        // 11. Update Todo
        await Todo.updateMany({ userId: oldUserId }, { userId: newUserId });

        // 12. Merge enrolledCourses in User model
        const combinedCourses = [...new Set([...(oldUser.enrolledCourses || []), ...(newUser.enrolledCourses || [])])];
        newUser.enrolledCourses = combinedCourses;

        // Merge assignedProjects if applicable
        const combinedProjects = [...new Set([...(oldUser.assignedProjects || []), ...(newUser.assignedProjects || [])])];
        newUser.assignedProjects = combinedProjects;

        await newUser.save();

        // 13. Delete old user
        await User.findByIdAndDelete(oldUserId);

        console.log(`✅ Successfully merged ${oldUserId} into ${newUserId}`);
    } catch (error) {
        console.error(`❌ Error merging users:`, error);
        throw error;
    }
};
