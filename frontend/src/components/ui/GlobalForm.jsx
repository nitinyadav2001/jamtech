import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "./button";
import JoditEditor from "jodit-react";
import useAuth from "@/Hook/useAuth";

const GlobalForm = ({
    fields,
    onSubmit,
    buttonText = "Submit",
    cols = 1,
    lastColumn = 1,
    defaultValues = {}, // for edit
    formId = "form", // for unique localStorage
}) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        reset,
        getValues,
    } = useForm();

    const { user } = useAuth();
    const isAdmin = user?.role?.name === "Admin";
    // Populate default values on edit
    useEffect(() => {
        if (defaultValues && Object.keys(defaultValues).length > 0) {
            reset(defaultValues);
        }
    }, [defaultValues, reset]);

    // Load localStorage draft
    useEffect(() => {
        const savedData = localStorage.getItem(`${formId}Draft`);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach((key) => {
                setValue(key, parsedData[key]);
            });
        }
    }, [formId, setValue]);

    // Save to localStorage
    const saveToLocalStorage = () => {
        const currentData = getValues();
        localStorage.setItem(`${formId}Draft`, JSON.stringify(currentData));
    };

    // Handle form submit
    const handleFormSubmit = (data) => {
        onSubmit(data);
        localStorage.removeItem(`${formId}Draft`);
        // reset();
    };

    return (
        <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
            <div
                className={`grid gap-4 mt-6 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-${cols} lg:grid-cols-${cols} ${fields.length % cols === lastColumn
                    ? '[&>*:last-child]:col-span-full'
                    : ''
                    }`}
            >
                {fields.map((field) => (
                    <div key={field.name} style={{ marginBottom: "0em" }}>
                        <label>
                            {field.label}
                            <br />
                            <Controller
                                name={field.name}
                                control={control}
                                defaultValue={defaultValues?.[field.name] || ""}
                                rules={field.validation || {}}
                                render={({ field: inputField }) => {
                                    switch (field.type) {
                                        case "textarea":
                                            return (
                                                <textarea
                                                    className="border text-sm w-full rounded-md px-2 py-[10px] focus-visible:outline-none focus-visible:ring-1"
                                                    {...inputField}
                                                    placeholder={field.placeholder || ""}
                                                    onBlur={saveToLocalStorage}
                                                />
                                            );
                                        case "select":
                                            return (
                                                <select
                                                    className="border text-sm w-full rounded-md px-2 py-[10px] focus-visible:outline-none focus-visible:ring-1"
                                                    {...inputField}
                                                    onBlur={saveToLocalStorage}
                                                >
                                                    {field.options?.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            );
                                        case "radio":
                                            return (
                                                <div className="flex gap-4" onChange={saveToLocalStorage}>
                                                    {field.options?.map((option) => (
                                                        <label key={option.value}>
                                                            <input
                                                                {...inputField}
                                                                type="radio"
                                                                value={option.value}
                                                                autoComplete="off"
                                                                className="mr-2 focus-visible:outline-none focus-visible:ring-1"
                                                            />
                                                            {option.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            );
                                        case "checkbox":
                                            return (
                                                <div className="flex items-center">
                                                    <input
                                                        {...inputField}
                                                        type="checkbox"
                                                        className="mr-2 focus-visible:outline-none focus-visible:ring-1"
                                                        onChange={(e) => {
                                                            inputField.onChange(e);
                                                            saveToLocalStorage();
                                                        }}
                                                    />
                                                    <span>{field.placeholder || field.label}</span>
                                                </div>
                                            );
                                        case "editor":
                                            return (
                                                <JoditEditor
                                                    value={inputField.value}
                                                    config={{
                                                        readonly: false,
                                                        height: 300,
                                                        buttons: [
                                                            'source', '|',
                                                            'bold', 'italic', 'underline', '|',
                                                            'ul', 'ol', '|',
                                                            'font', 'fontsize', 'brush', 'paragraph', '|',
                                                            'align', '|',
                                                            'undo', 'redo', '|',
                                                            'hr', 'eraser', 'fullsize'
                                                        ],
                                                        uploader: {
                                                            insertImageAsBase64URI: true
                                                        },
                                                        removeButtons: ['about'],
                                                    }}
                                                    onBlur={(newContent) => {
                                                        inputField.onChange(newContent);
                                                        saveToLocalStorage();
                                                    }}
                                                />
                                            );
                                        case "enrollment":
                                            return (
                                                <input
                                                    className="border focus-visible:outline-none focus-visible:ring-1 text-sm w-full rounded-md px-2 py-[10px]"
                                                    {...inputField}
                                                    type="date"
                                                    placeholder={field.placeholder || ""}
                                                    onBlur={saveToLocalStorage}
                                                    max={isAdmin ? undefined : new Date().toISOString().split("T")[0]}
                                                    min={
                                                        isAdmin
                                                            ? undefined
                                                            : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                                                .toISOString()
                                                                .split("T")[0]
                                                    }
                                                    onChange={(e) => {
                                                        const selectedDate = e.target.value;
                                                        inputField.onChange(selectedDate);
                                                    }}
                                                />

                                            );
                                        case "file":
                                            return (
                                                <input
                                                    className="border focus-visible:outline-none focus-visible:ring-1 bg-white text-sm w-full rounded-md px-2 py-[10px]"
                                                    type="file"
                                                    name={field.name}
                                                    onChange={(e) => {
                                                        inputField.onChange(e.target.files[0]);
                                                        saveToLocalStorage();
                                                    }}
                                                />
                                            );


                                        default:
                                            return (
                                                <input
                                                    className="border focus-visible:outline-none focus-visible:ring-1 text-sm w-full rounded-md px-2 py-[10px]"
                                                    {...inputField}
                                                    type={field.type || "text"}
                                                    placeholder={field.placeholder || ""}
                                                    onBlur={saveToLocalStorage}
                                                />
                                            );
                                    }
                                }}
                            />
                        </label>
                        {errors[field.name] && (
                            <p className="text-sm text-red-500">
                                {errors[field.name].message || `${field.label} is invalid`}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <br />
            <div className="flex justify-center">
                <Button className="w-40 bg-cta" type="submit">
                    {buttonText}
                </Button>
            </div>
        </form>
    );
};

export default GlobalForm;
