"use client";

import Image from "next/image";
import logo from "./../../assets/images/logo.png";
import { useState, useEffect } from "react";
import { firebasedb } from "@/lib/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

type Task = {
  id: string;
  title: string;
  detail: string;
  is_completed: boolean;
  created_at: string;
  update_at: string;
  image_url: string;
};

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(firebasedb, "task_tb"));
      const taskList: Task[] = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Task[];
      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (task: Task) => {
    const result = await Swal.fire({
      title: `Are you sure you want to delete this task?`,
      html: `<b>Task:</b> ${task.title}<br/><b>Details:</b> ${task.detail}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(firebasedb, "task_tb", task.id));
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        Swal.fire({
          icon: "success",
          title: "Task Deleted Successfully!",
          showConfirmButton: false,
          timer: 1200,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error Occurred",
          text: (error as Error).message,
        });
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/edittask/${id}`);
  };

  return (
    <div className="flex flex-col items-center w-3/4 mt-10 mx-auto">
      <Image src={logo} alt="logo" width={115} height={115} />
      <h1 className="text-2xl font-bold mt-2">Task Manager</h1>
      <h1 className="text-sm">Record all of your tasks!</h1>

      <div className="w-full flex justify-end mt-10">
        <button
          onClick={() => router.push("/addtask")}
          className="cursor-pointer bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
        >
          Add Task
        </button>
      </div>

      <div className="mt-5 overflow-x-auto w-full">
        <table className="min-w-full border text-sm text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Image</th>
              <th className="border p-2">Task</th>
              <th className="border p-2">Details</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Created on</th>
              <th className="border p-2">Last Configuration</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border p-2">
                    {task.image_url ? (
                      <Image
                        src={task.image_url}
                        alt={task.title}
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="border p-2">{task.title}</td>
                  <td className="border p-2">{task.detail}</td>
                  <td
                    className={`border border-black p-2 font-bold ${
                      task.is_completed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {task.is_completed ? "Completed" : "Pending"}
                  </td>
                  <td className="border p-2">
                    {new Date(task.created_at).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {task.update_at
                      ? new Date(task.update_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2 flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(task.id)}
                      className="cursor-pointer text-black py-1 px-3 rounded bg-yellow-500 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task)}
                      className="cursor-pointer text-red-600 py-1 px-3 rounded bg-red-200 hover:bg-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-2">
                  No tasks available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => router.push("/")}
        className="text-blue-700 font-bold py-1 px-3 mt-5 rounded"
      >
        Go back to the starting page
      </button>
    </div>
  );
}
