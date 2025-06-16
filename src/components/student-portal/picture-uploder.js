import { useEffect, useState, useRef } from "react";
import { Upload } from "lucide-react";
import { Toast } from "../errorNotifier";

const PassportUploader = (props) => {
  const [image, setImage] = useState(props.imageUrl);
  const fileInputRef = useRef(null);

  // Sync with props, but only when different
  useEffect(() => {
    if (props.imageUrl !== image) {
      setImage((prev) => {
        if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return props.imageUrl;
      });
    }
  }, [props.imageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (image && typeof image === "string" && image.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Toast.fire({ icon: "error", title: "Only image files are allowed." });
      return;
    }

    const MAX_SIZE_MB = 1;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      Toast.fire({
        icon: "error",
        title: `File size exceeds ${MAX_SIZE_MB}MB. Please upload a smaller file.`,
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setImage((prev) => {
      if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return imageUrl;
    });

    props.onUpload?.(file);
  };

  const resetUpload = () => {
    setImage((prev) => {
      if (prev && typeof prev === "string" && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    props.onUpload?.(null);
  };

  return (
    <div
      className="passport-container"
      onClick={!props.isPictureUploaded ? resetUpload : undefined}
    >
      {image ? (
        <img src={image} alt="Passport Preview" className="passport-preview" />
      ) : (
        <label htmlFor="passportPhoto" className="passport-upload-label">
          <Upload className="upload-icon" />
          <span style={{ fontSize: "12px" }}>
            Upload Passport Photo (Max: 1MB)
          </span>
        </label>
      )}

      <input
        type="file"
        id="passportPhoto"
        ref={fileInputRef}
        name="photo"
        accept="image/*"
        required
        onChange={handleImageUpload}
        className="hidden-input"
      />
    </div>
  );
};

export default PassportUploader;
