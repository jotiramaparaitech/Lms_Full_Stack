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

  const [projectTitle, setProjectTitle] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [projectPrice, setProjectPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
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

  // ---------------------- PDF States ----------------------
  const [pdfs, setPdfs] = useState([]);
  const [showPdfPopup, setShowPdfPopup] = useState(false);
  const [pdfDetails, setPdfDetails] = useState({
    pdfTitle: "",
    pdfDescription: "",
    pdfUrl: "",
  });

  // ---------------------- Chapter Handling ----------------------
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
      setChapters(chapters.filter((ch) => ch.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapters(
        chapters.map((ch) =>
          ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
        )
      );
    }
  };

  // ---------------------- Lecture Handling ----------------------
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
                ? chapter.chapterContent.slice(-1)[0].lectureOrder + 1
                : 1,
            lectureId: uniqid(),
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

  // ---------------------- PDF Handling ----------------------
  const handlePdf = (action, pdfId) => {
    if (action === "add") {
      setShowPdfPopup(true);
    } else if (action === "remove") {
      setPdfs(pdfs.filter((pdf) => pdf.pdfId !== pdfId));
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

    toast.success("PDF added locally. It will be saved on course submit.");
  };

  // ---------------------- Submit Handler ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!image) return toast.error("Thumbnail Not Selected");
      if (!projectTitle) return toast.error("Please enter project title");

      const token = await getToken();

      const formData = new FormData();

      // Server expects a single `projectData` JSON field plus `image`
      const projectData = {
        projectTitle,
        projectDescription: quillRef.current?.root?.innerHTML || "",
        projectPrice: Number(projectPrice),
        discount: Number(discount),
        isLocked,
        isTrending,
        projectContent: chapters,
        pdfResources: pdfs,
        customDomain,
      };

      formData.append("projectData", JSON.stringify(projectData));
      formData.append("image", image);

      const { data } = await axios.post(
        `${backendUrl}/api/educator/add-project`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Course added successfully!");
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setIsLocked(false);
        setIsTrending(false);
        setImage(null);
        setChapters([]);
        setPdfs([]);
        if (quillRef.current) quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message || "Failed to add course");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while adding the course.");
    }
  };

  // ---------------------- Quill Editor ----------------------
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  // ---------------------- UI ----------------------
  return (
    <div className="min-h-screen w-full flex pt-20 items-start p-6 md:p-10 bg-gradient-to-tr from-[#e6f7f1] via-[#f0f9ff] to-[#e3f2fd]">
      <form
        onSubmit={handleSubmit}
        className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-3xl p-8 md:p-10 w-full max-w-3xl transition-all duration-300 hover:shadow-[0_15px_60px_rgba(0,0,0,0.25)]"
      >
        <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#009688] to-[#03a9f4] drop-shadow-sm mb-8">
          Add New Project
        </h2>

        {/* Title */}
        <div className="flex flex-col mb-5">
          <label className="text-gray-700 font-semibold">Project Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
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
            placeholder="e.g.,Computer/AI/Sales Cloud Projects/Developer / Admin / Einstein Projects"
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
              value={projectPrice}
              onChange={(e) => setProjectPrice(e.target.value)}
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
                alt="preview"
                className="max-h-16 mt-2 rounded-xl shadow-md"
              />
            )}
          </div>
        </div>

        {/* Discount & Flags */}
        <div className="flex flex-wrap items-center gap-6 mb-5">
          <div className="flex flex-col">
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

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <input
                type="checkbox"
                checked={isLocked}
                onChange={(e) => setIsLocked(e.target.checked)}
              />
              Lock Project (show details but disable purchase)
            </label>
            <label className="flex items-center gap-2 text-gray-700 font-semibold">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
              />
              Mark as Trending (show at top)
            </label>
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.chapterId}
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
                      key={lecture.lectureId}
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

        {/* PDFs Section */}
        <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 mb-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-3">
            PDF Resources
          </h3>
          {pdfs.length > 0 ? (
            pdfs.map((pdf, index) => (
              <div
                key={pdf.pdfId}
                className="flex justify-between items-start bg-gradient-to-r from-[#b2dfdb]/80 to-[#b2ebf2]/80 text-gray-800 rounded-xl p-3 mb-3 shadow"
              >
                <div className="flex flex-col w-full">
                  <h4 className="font-semibold">
                    {index + 1}. {pdf.pdfTitle}
                  </h4>
                  {pdf.pdfDescription && (
                    <p className="text-sm mb-2">{pdf.pdfDescription}</p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={pdf.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition"
                    >
                      View Online
                    </a>
                    <a
                      href={pdf.pdfUrl}
                      download
                      className="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600 transition"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>

                <img
                  src={assets.cross_icon}
                  alt="remove"
                  className="cursor-pointer w-5 h-5"
                  onClick={() => handlePdf("remove", pdf.pdfId)}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 mb-3">No PDFs added yet.</p>
          )}

          <div
            className="flex justify-center bg-gradient-to-r from-[#80deea] to-[#a7ffeb] text-gray-800 py-2 rounded-xl cursor-pointer shadow-md hover:scale-105 transition"
            onClick={() => handlePdf("add")}
          >
            + Add PDF
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

      {/* Popup for adding lecture */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] md:w-[400px]">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="Duration (in mins)"
              value={lectureDetails.lectureDuration}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="Video URL"
              value={lectureDetails.lectureUrl}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureUrl: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <label className="flex items-center gap-2 mb-4">
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
              Free Preview
            </label>

            <div className="flex justify-between">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-gradient-to-r from-[#80deea] to-[#81d4fa] text-white px-4 py-2 rounded-md"
                onClick={addLecture}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for adding PDF */}
      {showPdfPopup && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-[90%] md:w-[400px]">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add PDF</h3>

            <input
              type="text"
              placeholder="PDF Title"
              value={pdfDetails.pdfTitle}
              onChange={(e) =>
                setPdfDetails({ ...pdfDetails, pdfTitle: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <textarea
              placeholder="Description"
              value={pdfDetails.pdfDescription}
              onChange={(e) =>
                setPdfDetails({
                  ...pdfDetails,
                  pdfDescription: e.target.value,
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <input
              type="text"
              placeholder="PDF URL"
              value={pdfDetails.pdfUrl}
              onChange={(e) =>
                setPdfDetails({ ...pdfDetails, pdfUrl: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3"
            />

            <div className="flex justify-between">
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded-md"
                onClick={() => setShowPdfPopup(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-gradient-to-r from-[#80deea] to-[#81d4fa] text-white px-4 py-2 rounded-md"
                onClick={addPdf}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourse;
