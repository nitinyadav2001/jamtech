import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "./Login-Form"

// import { LoginForm } from "@/components/login-form"

export default function AdminLogin() {
    return (
        <div className="flex items-center min-h-screen justify-center">
            {/* <div className="grid lg:grid-cols-2">
                <div className="flex flex-col gap-4 p-6 md:p-10">
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xl"> */}
            <LoginForm />
            {/* </div>
                    </div>
                </div> */}
            {/* <div className="relative hidden bg-muted lg:block">
                    <img
                        src="/placeholder.svg"
                        alt="Image"
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div> */}
            {/* </div> */}
        </div >
    )
}
