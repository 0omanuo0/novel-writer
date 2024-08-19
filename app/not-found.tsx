import { redirect } from "next/navigation";


export default function NotFound() {
    // redirect to editor/1
    redirect('/editor/Home');
}