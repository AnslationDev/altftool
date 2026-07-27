"use client";
import {
  ArrowLeft,
  Clapperboard,
  Film,
  Globe,
  Image,
  List,
  Sparkle,
  UserCheck,
  UploadCloud,
  UploadIcon,
  Video,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { videoFields } from "./data/VideoFieldData";
import { FormField } from "./data/FormFields";
import Link from "next/link";
import UploadZone from "./utils/UploadZone";
import { createVideoPost, uploadauthorImage, uploadThumbnailImage, uploadVideoFile } from "../expert-video-services/ExpertVideoService";


const AddExpertVideo = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      subTitle: "",
      category: "",
      videoType: "long",
    },
  });



  const STORAGE_KEY="expertVideoDraft"; // For auto-saving drafts in localStorage

  const formDataValues = watch();


  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailError, setThumbnailError] = useState("");

  const [videoPreview, setVideoPreview] = useState(null);
  const [videoError, setVideoError] = useState("");

  const [authorPreview, setAuthorPreview] = useState(null);
  const [authorError, setAuthorError] = useState("");

  // true = local upload, false = URL based
  const [thumbnailUploadingMethod, setThumbnailUploadingMethod] =
    useState(true);
  const [videoUploadingMethod, setVideoUploadingMethod] = useState(true);
  const [authorUploadingMethod, setAuthorUploadingMethod] = useState(true);

  // Register RHF fields once on mount
  useEffect(() => {
    register("thumbnailImg", { required: "Thumbnail image is required" });
    register("videoFile", { required: "Video file is required" });
    register("authorImg", { required: "Author image is required" });
  }, [register]);


  useEffect(()=>{
const savedData=setTimeout(()=>{
localStorage.setItem(STORAGE_KEY,JSON.stringify(formDataValues));
},2000);
return ()=>clearTimeout(savedData);

  },[formDataValues]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        Object.keys(parsed).forEach((key) => {
          setValue(key, parsed[key]);
        });

        console.log("Draft loaded");
      } catch (err) {
        console.error("Failed to load draft", err);
      }
    }
  }, [setValue]);

  // ── Thumbnail
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailError("");

    if (!file.type.startsWith("image/")) {
      setThumbnailError("Please select a JPG, PNG, or WebP file.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setThumbnailError("Image must be under 2MB.");
      e.target.value = "";
      return;
    }

    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    setValue("thumbnailImg", file, { shouldValidate: true });
  };

  const handleDeleteThumbnail = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(null);
    setThumbnailError("");
    setValue("thumbnailImg", null, { shouldValidate: true });
  };

  // ── Video
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError("");

    const validTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!validTypes.includes(file.type)) {
      setVideoError("Please select a valid video file (MP4, MOV, WEBM).");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setVideoError("Video file must be under 500MB.");
      e.target.value = "";
      return;
    }

    if (videoPreview) URL.revokeObjectURL(videoPreview);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setValue("videoFile", file, { shouldValidate: true });
  };

  const handleDeleteVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setVideoError("");
    setValue("videoFile", null, { shouldValidate: true });
  };

  // ── Author
  const handleAuthorImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAuthorError("");

    if (!file.type.startsWith("image/")) {
      setAuthorError("Please select a JPG or PNG file.");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAuthorError("Author image must be under 2MB.");
      e.target.value = "";
      return;
    }

    if (authorPreview) URL.revokeObjectURL(authorPreview);
    const url = URL.createObjectURL(file);
    setAuthorPreview(url);
    setValue("authorImg", file, { shouldValidate: true });
  };

  const handleDeleteAuthor = () => {
    if (authorPreview) URL.revokeObjectURL(authorPreview);
    setAuthorPreview(null);
    setAuthorError("");
    setValue("authorImg", null, { shouldValidate: true });
  };

  const [uploading, setUploading] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [authorProgress, setAuthorProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const onSubmit = async (data) => {
    try {
      setUploading(true);


      const videoId = crypto.randomUUID();
const thumbnailImgId = crypto.randomUUID();
const authorImgId = crypto.randomUUID();

      let thumbnailUrl = data.thumbnailUrl || "";
      let authorImgUrl = data.authorImgUrl || "";
      let videoUrl = data.videoUrl || "";


      // Upload thumbnail
      if (thumbnailUploadingMethod && data.thumbnailImg) {
        thumbnailUrl = await uploadThumbnailImage({
          file: data.thumbnailImg,
          thumbnailImgId: thumbnailImgId,
          onProgress: setThumbnailProgress,
        });
      }

//upload author image
       if (authorUploadingMethod && data.authorImg) {
         authorImgUrl = await uploadauthorImage({
           file: data.authorImg,
           authorImgId: authorImgId,
           onProgress: setThumbnailProgress,
         });
       }
      // Upload video
      if (videoUploadingMethod && data.videoFile) {
        videoUrl = await uploadVideoFile({
          file: data.videoFile,
          videoId: videoId,
          onProgress: setAuthorProgress,
        });
      }


      // Save to Firestore
      await createVideoPost({
        title: data.title,
        subTitle: data.subTitle,
        category: data.cateogry,
        videoType: data.videoType,
        thumbnailUrl,
        videoUrl,
        authorImgUrl,
        authorName: data.authorName,
        description: data.description,

        status: "published",
      });

      alert("Video uploaded successfully!");
      reset();

      // clear previews
      setThumbnailPreview(null);
      setVideoPreview(null);
      setAuthorPreview(null);

      // clear errors
      setThumbnailError("");
      setVideoError("");
      setAuthorError("");

      // clear localStorage
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
      setThumbnailProgress(0);
      setVideoProgress(0);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-lg shadow-2xs bg-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="w-[50%] flex flex-col gap-10">
          <div className="bg-black rounded-full text-white flex items-center gap-1 px-2 py-1.5 text-[14px] w-50">
            <Sparkle className="h-4 w-4" /> Admin · Content Studio
          </div>
        </div>
      </div>

      <form className="relative py-10" onSubmit={handleSubmit(onSubmit)}>
        {/* Page title */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3 text-[20px] font-bold">
            <div className="bg-gray-200 rounded-md shadow-2xs border border-gray-300 h-8 w-8 flex items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-x-1">
              <Link href="/leadtree/expert-videos">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
            </div>
            <h1>Upload Expert Video</h1>
          </div>
          <div className="text-gray-500 text-sm ml-12">
            <p>
              Add a new video or short to your library. Fill in the details
              below.
            </p>
          </div>
        </div>

        {/* Video type toggle */}
        <div className="flex justify-between items-center w-[420px] px-3 py-3 border border-gray-300 shadow-sm rounded-lg gap-2 mt-6">
          <button
            type="button"
            onClick={() => setValue("videoType", "long")}
            className={`flex items-center justify-center gap-2 font-medium w-50 rounded-lg p-2.5 transition-colors duration-200 cursor-pointer ${
              watch("videoType") === "long"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Film className="h-5 w-5" /> Long Video
          </button>

          <button
            type="button"
            onClick={() => setValue("videoType", "short")}
            className={`flex items-center justify-center gap-2 font-medium w-50 rounded-lg p-2.5 transition-colors duration-200 cursor-pointer ${
              watch("videoType") === "short"
                ? "bg-black text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Clapperboard className="h-5 w-5" /> Short Video
          </button>
        </div>

        <div className="min-h-[500px] rounded-lg p-3 border-gray-200 grid lg:grid-cols-1 gap-2 relative top-5">
          <div className="grid gap-5 grid-cols-2">
            {/* ── Basic Info ── */}
            <div className="flex flex-col border border-gray-200 shadow-2xs rounded-md p-2">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <div className="h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md">
                  <List />
                </div>
                <div className="flex flex-col mt-2">
                  <h1 className="font-bold text-[17px]">Basic Info</h1>
                  <p className="text-gray-600 text-sm">
                    Title, category, description and publish date.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5 p-5">
                <div className="flex flex-col gap-3">
                  {videoFields.slice(0, 4).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  ))}
                </div>
                <div>
                  {videoFields.slice(4, 5).map((field) => (
                    <FormField
                      key={field.name}
                      field={field}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Thumbnail ── */}
            <div className="flex flex-col border border-gray-200 shadow-2xs rounded-md p-2">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <div className="h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md">
                  <Image />
                </div>
                <div className="flex flex-col mt-2">
                  <h1 className="font-bold text-[17px]">Thumbnail Info</h1>
                  <p className="text-gray-600 text-sm">
                    Upload a cover image, set alt text and a short caption.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-3 py-5">
                {/* Toggle */}
                <div className="flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailUploadingMethod(true);
                      setValue("thumbnailUrl", "");
                      setThumbnailError("");
                    }}
                    className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                      thumbnailUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                    }`}
                  >
                    Local System Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailUploadingMethod(false);
                      handleDeleteThumbnail();
                    }}
                    className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                      !thumbnailUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                    }`}
                  >
                    URL Based
                  </button>
                </div>

                {/* Content */}
                {thumbnailUploadingMethod ? (
                  // Local upload — UploadZone + extra fields
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center">
                      <UploadZone
                        accept="image/*"
                        preview={thumbnailPreview}
                        onFileChange={handleThumbnailChange}
                        onDelete={handleDeleteThumbnail}
                        placeholder="Drop thumbnail or click to upload"
                        hint="JPG/PNG format, under 2MB"
                        icon={UploadCloud}
                        error={thumbnailError || errors.thumbnailImg?.message}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      {videoFields.slice(5, 7).map((field) => (
                        <FormField
                          key={field.name}
                          field={field}
                          register={register}
                          errors={errors}
                          watch={watch}
                          setValue={setValue}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  // URL based — only fields
                  <div className="flex flex-col gap-3">
                    {videoFields.slice(7, 8).map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Video ── */}
            <div className="flex flex-col border border-gray-200 shadow-2xs rounded-md p-2">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <div className="h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md">
                  <Video />
                </div>
                <div className="flex flex-col mt-2">
                  <h1 className="font-bold text-[17px]">Video Info</h1>
                  <p className="text-gray-600 text-sm">
                    Upload the video file or paste a hosted URL.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-5 px-3 py-5">
                {/* Toggle */}
                <div className="flex items-center justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUploadingMethod(true);
                      setValue("videoUrl", "");
                      setVideoError("");
                    }}
                    className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                      videoUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                    }`}
                  >
                    Local System Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUploadingMethod(false);
                      handleDeleteVideo();
                    }}
                    className={`px-8 py-2 rounded-md text-[13px] font-medium cursor-pointer transition-colors duration-200 ${
                      !videoUploadingMethod
                        ? "bg-black text-white border-0"
                        : "bg-gray-100 text-gray-700 border border-gray-200 shadow-sm"
                    }`}
                  >
                    URL Based
                  </button>
                </div>

                {/* Content */}
                {videoUploadingMethod ? (
                  // Local upload
                  <div className="flex flex-col items-center justify-center gap-3 px-3">
                    <UploadZone
                      accept="video/mp4,video/webm,video/quicktime"
                      preview={videoPreview}
                      onFileChange={handleVideoChange}
                      onDelete={handleDeleteVideo}
                      placeholder="Drop your video or click to upload"
                      hint="MP4, MOV, WEBM (max 500MB)"
                      icon={UploadIcon}
                      error={videoError || errors.videoFile?.message}
                    />
                  </div>
                ) : (
                  // URL based
                  <div className="flex flex-col gap-3">
                    {videoFields.slice(8, 9).map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Author ── */}
            <div className="flex flex-col border border-gray-200 shadow-2xs rounded-md p-2">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                <div className="h-10 w-10 border border-gray-200 flex items-center justify-center rounded-md">
                  <UserCheck />
                </div>
                <div className="flex flex-col mt-2">
                  <h1 className="font-bold text-[17px]">Author Info</h1>
                  <p className="text-gray-600 text-sm">
                    Expert behind the video.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-5 px-3 py-8">
                <div className="grid grid-cols-2 gap-3 px-3">
                  <UploadZone
                    accept="image/*"
                    preview={authorPreview}
                    onFileChange={handleAuthorImageChange}
                    onDelete={handleDeleteAuthor}
                    placeholder="Drop author image or click to upload"
                    hint="JPG, PNG (max 2MB)"
                    shape="circle"
                    error={authorError || errors.authorImg?.message}
                  />
                  <div className="flex flex-col gap-5">
                    {videoFields.slice(9).map((field) => (
                      <FormField
                        key={field.name}
                        field={field}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit buttons */}
        <div className="flex py-5 mt-3 justify-end">
          <div className="flex flex-row gap-3 items-center">
            <button
              type="submit"
              disabled={uploading}
              className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Globe className="h-5 w-5" />
              {uploading ? `Uploading... ${videoProgress}%` : "Upload Video"}
            </button>

            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors duration-200 flex items-center gap-2 cursor-pointer"
              onClick={() => {
                const values = watch();
                localStorage.setItem(STORAGE_KEY, JSON.stringify(values));

              }}
            >
              <Clapperboard className="h-5 w-5" /> Draft Video
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddExpertVideo;
