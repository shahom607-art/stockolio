'use client';

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { forgotPassword } from "@/lib/actions/auth.actions";
import { toast } from "sonner";
import { useState } from "react";

type ForgotPasswordFormData = {
    email: string;
};

const ForgotPassword = () => {
    const [isSuccess, setIsSuccess] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        defaultValues: { email: '' },
        mode: 'onBlur'
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        try {
            const result = await forgotPassword(data.email);
            if (result.success) {
                setIsSuccess(true);
                toast.success('Reset link sent!', {
                    description: 'Check your email for the password reset link.'
                });
            } else {
                toast.error('Failed to send reset link', {
                    description: result.error || 'Something went wrong'
                });
            }
        } catch (e) {
            console.error(e);
            toast.error('Error', {
                description: 'Failed to request password reset'
            });
        }
    }

    if (isSuccess) {
        return (
            <div className="text-center space-y-5">
                <h1 className="form-title">Check Your Email</h1>
                <p className="text-gray-400">
                    We have sent a password reset link to your email address. 
                    Please check your inbox and click the link to continue.
                </p>
                <FooterLink
                    text="Return to "
                    linkText="Sign In"
                    href="/sign-in"
                />
            </div>
        );
    }

    return (
        <>
            <h1 className="form-title">Reset Password</h1>
            <p className="text-gray-400 mb-6 text-center text-sm">
                Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <InputField
                    name="email"
                    label="Email"
                    placeholder="sample@gmail.com"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: 'Email is required',
                        pattern: {
                            value: /^\w+@\w+\.\w+$/,
                            message: 'Enter a valid email address'
                        }
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn w-full mt-5"
                >
                    {isSubmitting ? 'Sending link...' : 'Send Reset Link'}
                </Button>

                <FooterLink
                    text="Remember your password? "
                    linkText="Sign In"
                    href="/sign-in"
                />
            </form>
        </>
    );
};

export default ForgotPassword;
