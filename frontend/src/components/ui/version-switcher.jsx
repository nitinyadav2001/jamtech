"use client"

import * as React from "react"
import { Check, ChevronsUpDown, CircleUserRound, LayoutDashboard, User } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import useAuth from "@/Hook/useAuth"

export function VersionSwitcher({
    versions,
    defaultVersion,
}) {
    const [selectedVersion, setSelectedVersion] = React.useState(defaultVersion)
    const { user } = useAuth();
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <User className="" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold text-2xl">AIITC NEW ERA</span>
                                {/* <span className="">{selectedVersion}</span> */}
                            </div>
                            {/* <ChevronsUpDown className="ml-auto" /> */}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    {/* <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width]"
                        align="start"
                    >
                        {versions.map((version) => (
                            <DropdownMenuItem
                                key={version}
                                onSelect={() => setSelectedVersion(version)}
                            >
                                v{version}{" "}
                                {version === selectedVersion && <Check className="ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent> */}
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
