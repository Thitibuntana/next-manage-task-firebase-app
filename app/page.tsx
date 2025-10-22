import Image from "next/image";
import logo from "./../assets/images/logo.png";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="flex flex-col items-center mt-20">
        <Image src={logo} alt="logo" width={200} height={200} />
        <h1 className="text-2xl font-bold mt-10">Task Manager</h1>
        <h1 className="text-sm">Record all of your tasks!</h1>
        <Link
          className="text-xl mt-10 bg-blue-500 hover:bg-blue-700 text-white py-2 px-40 rounded"
          href={"/alltask"}
        >
          Start
        </Link>
      </div>
    </>
  );
}
