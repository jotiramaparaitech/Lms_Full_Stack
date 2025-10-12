import React, { useContext, useEffect, useRef, useState } from "react";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import Quill from "quill";
import uniqid from "uniqid";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AddCourse = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const { backendUrl, getToken } = useContext(AppContext);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });

  const handleChapter = (action, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title,
          chapterContent: [],
          collapsed: false,
          chapterOrder:
            chapters.length > 0 ? chapters.slice(-1)[0].chapterOrder + 1 : 1,
        };
        setChapters([...chapters, newChapter]);
      }
    } else if (action === "remove") {
      setChapters(
        chapters.filter((chapter) => chapter.chapterId !== chapterId)
      );
    } else if (action === "toggle") {
      setChapters(
        chapters.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, collapsed: !chapter.collapsed }
            : chapter
        )
      );
    }
  };

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters(
        chapters.map((chapter) => {
          if (chapter.chapterId === chapterId) {
            chapter.chapterContent.splice(lectureIndex, 1);
          }
          return chapter;
        })
      );
    }
  };

  const addLecture = () => {
    setChapters(
      chapters.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            ...lectureDetails,
            lectureOrder:
              chapter.chapterContent.length > 0
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
          };
          chapter.chapterContent.push(newLecture);
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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!image) return toast.error("Thumbnail Not Selected");

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", image);

      const token = await getToken();

      const { data } = await axios.post(
        backendUrl + "/api/educator/add-course",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        quillRef.current.root.innerHTML = "";
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
      });
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex pt-50px items-start p-6 md:p-10 bg-gradient-to-tr from-[#e6f7f1] via-[#f0f9ff] to-[#e3f2fd]">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-3xl transition-all duration-300 hover:shadow-[0_15px_60px_rgba(0,0,0,0.25)]"
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#009688] to-[#03a9f4] drop-shadow-sm mb-8">
          Add New Project
        </h2>

        {/* Course Title */}
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
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt=""
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

        {/* Chapters Section */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
          {chapters.map((chapter, chapterIndex) => (
            <div
              key={chapterIndex}
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
                  {chapterIndex + 1}. {chapter.chapterTitle}
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
                      key={i}
                      className="flex justify-between items-center bg-white/90 text-gray-700 rounded-md px-3 py-2 mb-2 shadow-sm"
                    >
                      <span>
                        {i + 1}. {lecture.lectureTitle} -{" "}
                        {lecture.lectureDuration} mins -{" "}
                        <a
                          href={lecture.lectureUrl}
                          target="_blank"
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

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#80cbc4] to-[#81d4fa] text-gray-800 font-bold rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition"
        >
          ✅ Add Project
        </button>
      </form>
    </div>
  );
};

export default AddCourse;
