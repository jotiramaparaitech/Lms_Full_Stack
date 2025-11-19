import Course from "../models/Course.js";
import { CourseProgress } from "../models/CourseProgress.js";
import { Purchase } from "../models/Purchase.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// -------------------- Initialize Razorpay --------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ---------------- Get User Data ----------------
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Purchase Course (Razorpay) ----------------
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.auth.userId;

    const courseData = await Course.findById(courseId);
    const userData = await User.findById(userId);

    if (!courseData || !userData) {
      return res.json({ success: false, message: "Data Not Found" });
    }

    // Final price with discount
    const amount =
      courseData.coursePrice -
      (courseData.discount * courseData.coursePrice) / 100;

    // Create purchase entry (initially pending)
    const newPurchase = await Purchase.create({
      courseId,
      userId,
      amount,
      status: "pending",
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // INR to paise
      currency: "INR",
      receipt: `receipt_${newPurchase._id}`,
      notes: {
        purchaseId: newPurchase._id.toString(),
        userId,
        courseId,
      },
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Verify Razorpay Payment ----------------
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({
        success: false,
        message: "Missing payment details",
      });
    }

    // Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Fetch Razorpay order
    const order = await razorpay.orders.fetch(razorpay_order_id);

    const purchaseId = order.notes.purchaseId;
    const userId = order.notes.userId;
    const courseId = order.notes.courseId;

    // Update purchase record
    await Purchase.findByIdAndUpdate(purchaseId, {
      status: "completed",
      paymentId: razorpay_payment_id,
    });

    // Enroll user & course
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    return res.json({
      success: true,
      message: "Payment verified & enrolled successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ---------------- Users Enrolled Courses ----------------
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const userData = await User.findById(userId).populate("enrolledCourses");

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Update User Course Progress ----------------
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: "Lecture Already Completed",
        });
      }

      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
      });
    }

    res.json({ success: true, message: "Progress Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Get User Course Progress ----------------
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({ success: true, progressData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Add User Ratings ----------------
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
    return res.json({ success: false, message: "Invalid Details" });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.json({ success: false, message: "Course not found." });
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({
        success: false,
        message: "User has not purchased this course.",
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();

    return res.json({ success: true, message: "Rating added" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
