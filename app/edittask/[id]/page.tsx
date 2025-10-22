"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { firebasedb } from "@/lib/firebaseConfig";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Task = {
  id: string;
  title: string;
  detail: string;
  is_completed: boolean;
  created_at: string;
  update_at: string;
  image_url: string;
};

export default function EditTask() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [task, setTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      const docRef = doc(firebasedb, "task_tb", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error("Task not found");
        return;
      }
      const data = docSnap.data() as Task;
      setTask({ id: docSnap.id, ...data });
      setTitle(data.title);
      setDetail(data.detail);
      setIsCompleted(data.is_completed);
      setImageUrl(data.image_url || "");
    };
    fetchTask();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const updates: Partial<Task> = {
      title,
      detail,
      is_completed: isCompleted,
      update_at: new Date().toISOString(),
    };

    if (imageFile) {
      if (task.image_url) {
        const oldFileName = task.image_url.split("/task_bk/")[1];
        const { error: deleteError } = await supabase.storage
          .from("task_bk")
          .remove([decodeURIComponent(oldFileName)]);
        if (deleteError) {
          alert("Error deleting old image");
          console.error(deleteError.message);
          return;
        }
      }

      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("task_bk")
        .upload(fileName, imageFile);
      if (uploadError) {
        alert("Error uploading image");
        console.error(uploadError.message);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("task_bk")
        .getPublicUrl(fileName);
      if (!urlData || !urlData.publicUrl) {
        alert("Error retrieving image URL");
        return;
      }
      updates.image_url = urlData.publicUrl;
    }

    const docRef = doc(firebasedb, "task_tb", id);
    try {
      await updateDoc(docRef, updates);
      alert("Task updated successfully!");
      router.push("/alltask");
    } catch (error) {
      alert("Error updating task");
      console.error((error as Error).message);
    }
  };

  if (!task) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center w-4/5 mt-10 mx-auto">
      <h1 className="text-3xl font-bold mt-2">Edit Task</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col mt-10 border border-gray-300 p-8 rounded-lg shadow-lg w-full max-w-3xl"
      >
        <div className="flex flex-col mt-3">
          <label className="text-lg font-bold">Task</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
          />
        </div>

        <div className="flex flex-col mt-5">
          <label className="text-lg font-bold">Details</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task details"
            rows={4}
          ></textarea>
        </div>

        <div className="flex flex-col mt-5">
          <label className="text-lg font-bold mb-2">Status</label>
          <select
            value={isCompleted ? "1" : "0"}
            onChange={(e) => setIsCompleted(e.target.value === "1")}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">In Progress</option>
            <option value="1">Completed</option>
          </select>
        </div>

        <div className="flex flex-col mt-5">
          <label className="text-lg font-bold mb-2">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded w-max"
          >
            {imageFile
              ? imageFile.name
              : task.image_url
              ? "Change Image"
              : "Select Image"}
          </label>
          {imageUrl && (
            <div className="mt-3">
              <Image
                src={imageUrl}
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
          Update Task
        </button>
      </form>

      <div className="flex flex-col items-center w-3/4 mt-10 my-20 mx-auto">
        <Link
          href="/alltask"
          className="text-blue-700 font-bold py-1 px-3 mt-5 rounded"
        >
          Go back to the task dashboard
        </Link>
      </div>
    </div>
  );
}
