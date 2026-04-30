'use client';

import React, { useState } from 'react'
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const InputField = ({name, label, placeholder, type ="text", register, error, validation, disabled, value}: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="form-label">
                {label}
            </Label>
            <div className="relative">
                <Input
                    type={isPassword && showPassword ? 'text' : type}
                    id={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn('form-input pr-11', {'opacity-50 cursor-not-allowed': disabled})}
                    {...register(name, validation)}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm  text-red-500">
                    {error.message}
                </p>
            )}
        </div>
    )
}
export default InputField
