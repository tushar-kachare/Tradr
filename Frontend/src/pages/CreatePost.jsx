import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/postActions";
import { ImagePlus, X, Loader2 } from "lucide-react";

const CreatePost = () => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") navigate("/");
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + media.length > 4) {
      alert("Max 4 files allowed");
      return;
    }

    setMedia((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview((prev) => [...prev, ...previews]);
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && media.length === 0) {
      alert("Post must have content or media");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("content", content);

      media.forEach((file) => {
        formData.append("media", file);
      });

      const res = await createPost(formData);
      console.log(res.data);

      navigate("/");
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[500px] bg-[#0f0f0f] border border-gray-700 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <h2 className="text-xl text-white font-semibold mb-4">Create Post</h2>

      {/* Textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
        className="w-full h-28 bg-[#1a1a1a] p-3 rounded-lg text-white border border-gray-700 outline-none resize-none"
      />

      {/* Media Preview */}
      {preview.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {preview.map((src, index) => {
            const file = media[index];

            return (
              <div key={index} className="relative group">
                {file.type.startsWith("video") ? (
                  <video
                    src={src}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={src}
                    alt="preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-4">
        {/* Upload */}
        <label className="flex items-center gap-2 cursor-pointer text-blue-500 hover:text-blue-400 transition">
          <ImagePlus size={20} />
          <span>Add Media</span>

          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
        </label>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-red-700 rounded-lg hover:bg-red-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
