'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import { resetPassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

type ResetPasswordFormData = {
    password: string;
};

const ResetPasswordForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        defaultValues: { password: '' },
        mode: 'onBlur'
    });

    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Invalid token', { description: 'Missing password reset token.' });
            return;
        }

        try {
            const result = await resetPassword(data.password, token);
            if (result.success) {
                toast.success('Password Reset Successful', {
                    description: 'You can now log in with your new password.'
                });
                router.push('/sign-in');
            } else {
                toast.error('Reset Failed', {
                    description: result.error || 'Failed to reset password'
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Error', {
                description: 'Failed to reset password'
            });
        }
    }

    if (!token) {
        return (
            <div className="text-center space-y-5">
                <h1 className="form-title text-red-500">Invalid Link</h1>
                <p className="text-gray-400">
                    The password reset link is invalid or has expired. Please request a new one.
                </p>
                <Button onClick={() => router.push('/forgot-password')} className="yellow-btn mt-5">
                    Request New Link
                </Button>
            </div>
        );
    }

    return (
        <>
            <h1 className="form-title">Set New Password</h1>
            <p className="text-gray-400 mb-6 text-center text-sm">
                Please enter your new password below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="password"
                    label="New Password"
                    placeholder="Enter your new password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters'
                        }
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn w-full mt-5"
                >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </>
    );
};

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="text-center">Loading...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
