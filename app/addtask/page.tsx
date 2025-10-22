"use client";

import Image from "next/image";
import logo from "./../../assets/images/logo.png";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { firebasedb } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";
import Swal from "sweetalert2";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [title, setTitle] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [is_completed, setIsCompleted] = useState<boolean>(false);
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setImageFile(selectedFile);
      setPreviewFile(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title) {
      alert("Please enter a task title.");
      return;
    }

    let uploadedImageUrl: string | null = null;

    if (image_file) {
      const fileName = `${Date.now()}-${image_file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from("task_bk")
        .upload(fileName, image_file);

      if (uploadError) {
        console.error("Image upload error:", uploadError.message);
        alert("Failed to upload image.");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("task_bk")
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        console.error("Error retrieving image URL: publicUrl not found");
        alert("Failed to retrieve image URL.");
        return;
      }

      uploadedImageUrl = urlData.publicUrl;
    }

    try {
      await addDoc(collection(firebasedb, "task_tb"), {
        title,
        detail,
        is_completed,
        image_url: uploadedImageUrl,
        created_at: new Date().toISOString(),
        update_at: new Date().toISOString(),
      });

      alert("Task uploaded successfully!");
      setTitle("");
      setDetail("");
      setIsCompleted(false);
      setImageFile(null);
      setPreviewFile("");
    } catch (error) {
      console.error("DB insert error:", (error as Error).message);
      alert("Failed to save task.");
    }
  };

  return (
    <main>
      <div className="flex flex-col w-10/12 mx-auto">
        <div className="flex flex-col items-center w-3/4 mt-10 mx-auto">
          <Image src={logo} alt="logo" width={115} height={115} />
          <h1 className="text-2xl font-bold mt-2">Task Manager</h1>
          <h1 className="text-sm">Record all of your tasks!</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col mt-10 border border-gray-300 p-5 rounded shadow-md"
        >
          <h1 className="text-xl font-bold mb-5">Add new task!</h1>

          <div className="flex flex-col mt-3">
            <label className="text-lg font-bold">Task</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task title"
            />
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold">Details</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task details"
              rows={4}
            ></textarea>
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold mb-2">Status</label>
            <select
              value={is_completed ? "1" : "0"}
              onChange={(e) => setIsCompleted(e.target.value === "1")}
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">In Progress</option>
              <option value="1">Completed</option>
            </select>
          </div>

          <div className="flex flex-col mt-5">
            <label className="text-lg font-bold mb-2">Upload Image</label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded w-max"
            >
              {image_file ? image_file.name : "Select Image"}
            </label>
            {preview_file && (
              <div className="mt-3">
                <Image
                  src={preview_file}
                  alt="Preview"
                  width={150}
                  height={150}
                  className="rounded border"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow"
          >
            Upload Task
          </button>
        </form>

        <div className="flex flex-col items-center w-3/4 mt-10 my-20 mx-auto">
          <Link
            href={`/alltask`}
            className="text-blue-700 font-bold py-1 px-3 mt-5 rounded"
          >
            Go back to the task dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
