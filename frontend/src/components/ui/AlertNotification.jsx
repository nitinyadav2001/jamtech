import { AlertCircle, CheckCircle } from "lucide-react"

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"

export function AlertNotification({ role }) {
    return (
        <Alert variant="success" className="border border-green-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Welcome Back!</AlertTitle>
            <AlertDescription>
                The {role} action has been completed successfully!
            </AlertDescription>
        </Alert>

    )
}
