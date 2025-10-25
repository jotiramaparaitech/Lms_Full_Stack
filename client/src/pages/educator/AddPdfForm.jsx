import React, { useState } from "react";
import axios from "axios";

const AddPdfForm = ({ courseId, token }) => {
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfDescription, setPdfDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Uploading PDF...");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/course/${courseId}/add-pdf`,
        {
          pdfTitle,
          pdfDescription,
          pdfUrl,
          allowDownload,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setMessage("✅ PDF added successfully!");
        setPdfTitle("");
        setPdfDescription("");
        setPdfUrl("");
      } else {
        setMessage("⚠️ Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error uploading PDF");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">📘 Add PDF Resource</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="PDF Title"
          value={pdfTitle}
          onChange={(e) => setPdfTitle(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />

        <textarea
          placeholder="PDF Description"
          value={pdfDescription}
          onChange={(e) => setPdfDescription(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        ></textarea>

        <input
          type="text"
          placeholder="PDF URL (Direct link)"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          required
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={allowDownload}
            onChange={(e) => setAllowDownload(e.target.checked)}
          />
          <span>Allow Download</span>
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
        >
          Upload PDF
        </button>
      </form>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};

export default AddPdfForm;
