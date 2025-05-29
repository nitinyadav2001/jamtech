import * as React from "react";
import {
    LayoutDashboard,
    CircleGauge,
    Merge,
    PlusCircle,
    List,
    Users,
    ContactRound,
    ListChecks,
    Landmark,
    HandCoins,
    PhoneIncoming,
    Contact,
    BookCheck,
    FileBadge2Icon,
    NotebookTextIcon,
    NotebookPenIcon,
    LogOut,
    ChevronRight,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { VersionSwitcher } from "./version-switcher";
import { Link, useNavigate } from "react-router-dom";
import { adminLogOutAPI } from "@/API/adminAPI/adminAuthAPI";
import useAuth from "@/Hook/useAuth";

const data = {
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            url: "/dashboard",
            items: [
                {
                    title: "Dashboard Report",
                    icon: CircleGauge,
                    url: "/dashboard",
                    permission: "view_dashboard",
                },
            ],
        },
        {
            title: "Franchise Management",
            icon: Merge,
            items: [
                {
                    title: "New Franchise",
                    icon: PlusCircle,
                    url: "/dashboard/new/franchise",
                    permission: "create_franchise",
                },
                {
                    title: "Manage Franchise",
                    icon: Merge,
                    url: "/dashboard/franchise/management",
                    permission: "manage_franchise",
                },
            ],
        },
        {
            title: "Course Management",
            icon: BookCheck,
            items: [
                {
                    title: "Add Course",
                    icon: PlusCircle,
                    url: "/dashboard/add/course",
                    permission: "create_course",
                },
                {
                    title: "Manage Course",
                    icon: List,
                    url: "/dashboard/course/management",
                    permission: "manage_courses",
                },
            ],
        },
        {
            title: "Students Management",
            icon: Users,
            items: [
                {
                    title: "Student Registration",
                    icon: ContactRound,
                    url: "/dashboard/student/registration",
                    permission: "register_student",
                },
                {
                    title: "Manage Student",
                    icon: ListChecks,
                    url: "/dashboard/students/management",
                    permission: "manage_students",
                },
            ],
        },
        // {
        //     title: "Fee Management",
        //     icon: Landmark,
        //     items: [
        //         {
        //             title: "Pay Student Fee",
        //             icon: HandCoins,
        //             url: "/dashboard/student/fee",
        //             permission: "manage_fees",
        //         },
        //         {
        //             title: "Payment Receipt",
        //             icon: HandCoins,
        //             url: "/dashboard/student/fee",
        //             permission: "manage_receipt",
        //         },
        //     ],
        // },
        {
            title: "Enquiry Management",
            icon: PhoneIncoming,
            items: [

                {
                    title: "All Enquiries",
                    icon: Contact,
                    url: "/dashboard/enquiry/management",
                    permission: "view_enquiries",
                },
                {
                    title: "Delete Enquiries",
                    icon: Contact,
                    url: "/dashboard/enquiry/management",
                    permission: "delete_enquires",
                },
            ],
        },
        {
            title: "Role & Permissions",
            icon: BookCheck,
            items: [
                {
                    title: "Role Management",
                    icon: FileBadge2Icon,
                    url: "/dashboard/role/management",
                    permission: "manage_certificates",
                },
                {
                    title: "Permission Management",
                    icon: FileBadge2Icon,
                    url: "/dashboard/permission/management",
                    permission: "manage_certificates",
                },
            ],
        },
        // {
        //     title: "Notice Management",
        //     icon: NotebookTextIcon,
        //     items: [
        //         {
        //             title: "Manage Notices",
        //             icon: PlusCircle,
        //             url: "/dashboard/notice/manage",
        //             permission: "manage_notices",
        //         },
        //         {
        //             title: "Manage Notices",
        //             icon: PlusCircle,
        //             url: "/dashboard/notice/manage",
        //             permission: "manage_notices",
        //         },
        //     ],
        // },
        // {
        //     title: "Blog Management",
        //     icon: NotebookPenIcon,
        //     items: [
        //         {
        //             title: "Manage Blog",
        //             icon: PlusCircle,
        //             url: "/dashboard/blog/manage",
        //             permission: "manage_blog",
        //         },
        //         {
        //             title: "Manage Blog",
        //             icon: PlusCircle,
        //             url: "/dashboard/blog/manage",
        //             permission: "manage_blog",
        //         },
        //     ],
        // },
    ],
};

export function AppSidebar(props) {
    const { setUser, user, permissions } = useAuth();
    const navigate = useNavigate();

    const logOut = async () => {
        try {
            const res = await adminLogOutAPI();
            if (res.status === 200) {
                setUser(null);
                navigate("/admin/login");
            } else {
                console.error("Logout failed:", res);
            }
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const hasAccess = (requiredPermission) => {
        if (user?.role?.name === "Admin") return true;
        return user?.permissions?.some((perm) => perm.name === requiredPermission);
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <VersionSwitcher
                    versions={data.versions}
                    defaultVersion={data.versions[0]}
                />
            </SidebarHeader>

            <SidebarContent className="gap-0 p-3">
                {data.navMain
                    .flatMap((item) => {
                        if (item.items?.length === 1) {
                            const [onlyItem] = item.items;
                            return [
                                {
                                    ...item,
                                    ...onlyItem,
                                    permission: onlyItem.permission,
                                    items: undefined,
                                },
                            ];
                        }
                        return [item];
                    })
                    .filter((item) => {
                        if (item.permission) return hasAccess(item.permission);
                        if (item.items?.length) {
                            return item.items.some((sub) => hasAccess(sub.permission));
                        }
                        return true;
                    })
                    .map((item) => {
                        if (item.items?.length > 1) {
                            const visibleSubItems = item.items.filter((sub) =>
                                hasAccess(sub.permission)
                            );
                            if (visibleSubItems.length === 0) return null;

                            return (
                                <Collapsible key={item.title} className="group/collapsible" defaultOpen>
                                    <SidebarGroup>
                                        <SidebarGroupLabel
                                            asChild
                                            className="group/label font-bold text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                        >
                                            <CollapsibleTrigger>
                                                <div className="flex items-center gap-1">
                                                    <item.icon size={20} />
                                                    {item.title}
                                                </div>
                                                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                            </CollapsibleTrigger>
                                        </SidebarGroupLabel>
                                        <CollapsibleContent>
                                            <SidebarGroupContent>
                                                <SidebarMenu>
                                                    {visibleSubItems.map((subItem) => (
                                                        <SidebarMenuItem key={subItem.title}>
                                                            <SidebarMenuButton asChild>
                                                                <div className="flex items-center gap-1 ml-5">
                                                                    <subItem.icon size={20} />
                                                                    <Link to={subItem.url}>{subItem.title}</Link>
                                                                </div>
                                                            </SidebarMenuButton>
                                                        </SidebarMenuItem>
                                                    ))}
                                                </SidebarMenu>
                                            </SidebarGroupContent>
                                        </CollapsibleContent>
                                    </SidebarGroup>
                                </Collapsible>
                            );
                        }

                        return (
                            <SidebarMenu key={item.title}>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <div className="flex items-center gap-1 ml-2">
                                            <item.icon size={20} />
                                            <Link to={item.url}>{item.title}</Link>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        );
                    })}
            </SidebarContent>

            <SidebarHeader>
                <button
                    onClick={logOut}
                    className="flex p-4 px-6 items-center gap-2 leading-none"
                >
                    <LogOut size={20} className="text-red-600" />
                    <span className="font-semibold text-red-600 text-md">Logout</span>
                </button>
            </SidebarHeader>

            <SidebarRail />
        </Sidebar>
    );
}
