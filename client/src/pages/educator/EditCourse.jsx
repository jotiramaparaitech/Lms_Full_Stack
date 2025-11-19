import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";
import uniqid from "uniqid";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import Loading from "../../components/student/Loading";

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const { backendUrl, getToken } = useContext(AppContext);

  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState("");
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const [pdfs, setPdfs] = useState([]);
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [pdfDetails, setPdfDetails] = useState({
    pdfTitle: "",
    pdfDescription: "",
    pdfUrl: "",
  });

  const [initialDescription, setInitialDescription] = useState("");

  // Initialize Quill editor
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  // Apply fetched description to editor
  useEffect(() => {
    if (quillRef.current && initialDescription !== null) {
      quillRef.current.root.innerHTML = initialDescription || "";
    }
  }, [initialDescription]);

  const normalizeChapter = (chapter) => ({
    ...chapter,
    collapsed: false,
    chapterContent: Array.isArray(chapter.chapterContent)
      ? chapter.chapterContent.map((lecture) => ({
          ...lecture,
        }))
      : [],
  });

  const fetchCourseData = async () => {
    try {
      setIsFetching(true);
      const token = await getToken();
      const { data } = await axios.get(
        `${backendUrl}/api/educator/course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data.success) {
        toast.error(data.message || "Failed to load course");
        return;
      }

      const course = data.course;
      setCourseTitle(course.courseTitle || "");
      setCustomDomain(course.customDomain || "");
      setCoursePrice(course.coursePrice || 0);
      setDiscount(course.discount || 0);
      setExistingThumbnail(course.courseThumbnail || "");
      setChapters(
        Array.isArray(course.courseContent)
          ? course.courseContent.map((chapter) => normalizeChapter(chapter))
          : []
      );
      setPdfs(course.pdfResources || []);
      setInitialDescription(course.courseDescription || "");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch course details"
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  // --------------- Chapter Handling ---------------
  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title) {
        const lastOrder = chapters.reduce(
          (max, ch) => Math.max(max, ch.chapterOrder || 0),
          0
        );
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder: lastOrder + 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(chapters.filter((ch) => ch.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapters(
        chapters.map((ch) =>
          ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
        )
      );
    }
  };

  // --------------- Lecture Handling ---------------
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            const updatedLectures = [...chapter.chapterContent];
            updatedLectures.splice(lectureIndex, 1);
            return { ...chapter, chapterContent: updatedLectures };
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    if (!lectureDetails.lectureTitle || !lectureDetails.lectureUrl) {
      toast.error("Please fill all lecture fields.");
      return;
    }

    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? (chapter.chapterContent.slice(-1)[0].lectureOrder || 0) + 1
                : 1,
            lectureId: lectureDetails.lectureId || uniqid(),
          };
          return {
            ...chapter,
            chapterContent: [...chapter.chapterContent, newLecture],
          };
        }
        return chapter;
      })
    );

    setShowPopup(false);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
  };

  // --------------- PDF Handling ---------------
  const handlePdf = (action, identifier) => {
    if (action === "add") {
      setShowPdfPopup(true);
    } else if (action === "remove") {
      setPdfs(
        pdfs.filter(
          (pdf, index) =>
            pdf.pdfId !== identifier &&
            pdf._id !== identifier &&
            index !== identifier
        )
      );
    }
  };

  const addPdf = () => {
    if (!pdfDetails.pdfTitle || !pdfDetails.pdfUrl) {
      toast.error("Please fill all PDF fields.");
      return;
    }

    const newPdf = {
      ...pdfDetails,
      pdfId: uniqid(),
    };

    setPdfs([...pdfs, newPdf]);
    setShowPdfPopup(false);
    setPdfDetails({
      pdfTitle: "",
      pdfDescription: "",
      pdfUrl: "",
    });

    toast.success("PDF added locally. It will be saved on update.");
  };

  // --------------- Submit Handler ---------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = await getToken();

      const preparedChapters = chapters.map(
        ({ collapsed, ...restChapter }) => ({
          ...restChapter,
          chapterContent: restChapter.chapterContent.map((lecture) => ({
            ...lecture,
            lectureDuration: Number(lecture.lectureDuration) || 0,
          })),
        })
      );

      const courseData = {
        courseTitle,
        customDomain,
        courseDescription: quillRef.current?.root?.innerHTML || "",
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: preparedChapters,
        pdfResources: pdfs,
        courseThumbnail: existingThumbnail,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.put(
        `${backendUrl}/api/educator/course/${courseId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Course updated successfully!");
        navigate("/educator/my-courses");
      } else {
        toast.error(data.message || "Failed to update course");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong while updating."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) return <Loading />;

  return (
    <div className="min-h-screen w-full flex pt-20 items-start p-6 md:p-10 bg-gradient-to-tr from-[#e6f7f1] via-[#f0f9ff] to-[#e3f2fd]">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-3xl transition-all duration-300 hover:shadow-[0_15px_60px_rgba(0,0,0,0.25)]"
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#009688] to-[#03a9f4] drop-shadow-sm mb-8">
          Edit Project
        </h2>

        {/* Title */}
        <div className="flex flex-col mb-5">
          <label className="text-gray-700 font-semibold">Project Title</label>
          <input
            type="text"
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            placeholder="Enter course title..."
            className="mt-2 bg-white/80 text-gray-800 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80deea] shadow-inner"
            required
          />
        </div>

        {/* Custom Domain */}
        <div className="flex flex-col mb-5">
          <label className="text-gray-700 font-semibold">Custom Domain</label>
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="e.g., Computer/AI Projects"
            required
            className="mt-2 bg-white/80 text-gray-800 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#80deea] shadow-inner"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col mb-5">
          <label className="text-gray-700 font-semibold">
            Project Description
          </label>
          <div
            ref={editorRef}
            className="border border-gray-300 rounded-xl bg-white/80 text-gray-800 p-2 shadow-inner"
          ></div>
        </div>

        {/* Price & Thumbnail */}
        <div className="flex flex-wrap justify-between items-center gap-6 mb-5">
          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">Project Price</label>
            <input
              type="number"
              value={coursePrice}
              onChange={(e) => setCoursePrice(e.target.value)}
              className="mt-2 bg-white/80 text-gray-800 border border-gray-300 rounded-xl px-4 py-2.5 w-32 focus:outline-none focus:ring-2 focus:ring-[#81d4fa] shadow-inner"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-semibold">
              Project Thumbnail
            </label>
            <label
              htmlFor="thumbnailImage"
              className="mt-2 flex items-center gap-3 bg-gradient-to-r from-[#80deea] to-[#81d4fa] text-white px-4 py-2 rounded-xl shadow-md cursor-pointer hover:scale-105 active:scale-95 transition"
            >
              <img src={assets.file_upload_icon} className="w-6 h-6" />
              Upload Image
              <input
                id="thumbnailImage"
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            {(image || existingThumbnail) && (
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : existingThumbnail || undefined
                }
                alt="preview"
                className="max-h-16 mt-2 rounded-xl shadow-md"
              />
            )}
          </div>
        </div>

        {/* Discount */}
        <div className="flex flex-col mb-5">
          <label className="text-gray-700 font-semibold">Discount %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="mt-2 bg-white/80 text-gray-800 border border-gray-300 rounded-xl px-4 py-2.5 w-32 focus:outline-none focus:ring-2 focus:ring-[#80cbc4] shadow-inner"
          />
        </div>

        {/* Chapters */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.chapterId || index}
              className="mb-4 bg-gradient-to-r from-[#b2f2bb]/80 to-[#a7ffeb]/80 text-gray-800 rounded-xl overflow-hidden shadow"
            >
              <div className="flex justify-between items-center p-4 font-semibold">
                <div className="flex items-center gap-3">
                  <img
                    onClick={() => handleChapter("toggle", chapter.chapterId)}
                    src={assets.dropdown_icon}
                    width={16}
                    alt=""
                    className={`cursor-pointer transition-transform ${
                      chapter.collapsed && "-rotate-90"
                    }`}
                  />
                  {index + 1}. {chapter.chapterTitle}
                </div>
                <div className="flex items-center gap-3">
                  <span>{chapter.chapterContent.length} Lectures</span>
                  <img
                    onClick={() => handleChapter("remove", chapter.chapterId)}
                    src={assets.cross_icon}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {!chapter.collapsed && (
                <div className="p-4 bg-white/70 rounded-b-xl">
                  {chapter.chapterContent.map((lecture, i) => (
                    <div
                      key={lecture.lectureId || i}
                      className="flex justify-between items-center bg-white/90 text-gray-700 rounded-md px-3 py-2 mb-2 shadow-sm"
                    >
                      <span>
                        {i + 1}. {lecture.lectureTitle} -{" "}
                        {lecture.lectureDuration} mins -{" "}
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#0288d1] underline"
                        >
                          Link
                        </a>{" "}
                        - {lecture.isPreviewFree ? "Free" : "Paid"}
                      </span>
                      <img
                        onClick={() =>
                          handleLecture("remove", chapter.chapterId, i)
                        }
                        src={assets.cross_icon}
                        className="cursor-pointer"
                      />
                    </div>
                  ))}

                  <div
                    className="bg-gradient-to-r from-[#80deea] to-[#a7ffeb] text-gray-800 py-2 px-4 rounded-lg shadow-md hover:scale-105 cursor-pointer transition"
                    onClick={() => handleLecture("add", chapter.chapterId)}
                  >
                    + Add Lecture
                  </div>
                </div>
              )}
            </div>
          ))}

          <div
            className="flex justify-center bg-gradient-to-r from-[#81d4fa] to-[#a7ffeb] text-gray-800 py-2 rounded-xl cursor-pointer shadow-md hover:scale-105 transition"
            onClick={() => handleChapter("add")}
          >
            + Add Chapter
          </div>
        </div>

        {/* PDFs Section */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            PDF Resources
          </h3>
          {pdfs.length > 0 ? (
            pdfs.map((pdf, index) => (
              <div
                key={pdf.pdfId || pdf._id || index}
                className="flex justify-between items-start bg-gradient-to-r from-[#b2dfdb]/80 to-[#b2ebf2]/80 text-gray-800 rounded-xl p-3 mb-3 shadow"
              >
                <div>
                  <p className="font-semibold">{pdf.pdfTitle}</p>
                  <p className="text-sm">{pdf.pdfDescription}</p>
                  <a
                    href={pdf.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0288d1] underline text-sm"
                  >
                    View PDF
                  </a>
                </div>
                <img
                  onClick={() =>
                    handlePdf("remove", pdf.pdfId || pdf._id || index)
                  }
                  src={assets.cross_icon}
                  className="cursor-pointer"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-sm">
              No PDFs added yet. Use the button below to add one.
            </p>
          )}

          <div
            className="flex justify-center bg-gradient-to-r from-[#a5d6a7] to-[#81c784] text-gray-800 py-2 rounded-xl cursor-pointer shadow-md hover:scale-105 transition mt-3"
            onClick={() => handlePdf("add")}
          >
            + Add PDF
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 min-w-[180px] bg-gradient-to-r from-[#00bcd4] to-[#009688] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/educator/my-courses")}
            className="flex-1 min-w-[140px] border border-[#00bcd4] text-[#00bcd4] py-3 rounded-xl font-semibold hover:bg-[#00bcd4]/10 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Lecture Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Add Lecture
            </h3>
            <input
              type="text"
              placeholder="Lecture Title"
              value={lectureDetails.lectureTitle}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureTitle: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="number"
              placeholder="Duration (mins)"
              value={lectureDetails.lectureDuration}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="text"
              placeholder="Lecture URL"
              value={lectureDetails.lectureUrl}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureUrl: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <input
                type="checkbox"
                checked={lectureDetails.isPreviewFree}
                onChange={(e) =>
                  setLectureDetails({
                    ...lectureDetails,
                    isPreviewFree: e.target.checked,
                  })
                }
              />
              Preview Free
            </label>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addLecture}
                className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Popup */}
      {showPdfPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add PDF</h3>
            <input
              type="text"
              placeholder="PDF Title"
              value={pdfDetails.pdfTitle}
              onChange={(e) =>
                setPdfDetails({ ...pdfDetails, pdfTitle: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="text"
              placeholder="PDF Description"
              value={pdfDetails.pdfDescription}
              onChange={(e) =>
                setPdfDetails({
                  ...pdfDetails,
                  pdfDescription: e.target.value,
                })
              }
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
            <input
              type="text"
              placeholder="PDF URL"
              value={pdfDetails.pdfUrl}
              onChange={(e) =>
                setPdfDetails({ ...pdfDetails, pdfUrl: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowPdfPopup(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addPdf}
                className="px-4 py-2 bg-[#00bcd4] text-white rounded-lg"
              >
                Add PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCourse;
