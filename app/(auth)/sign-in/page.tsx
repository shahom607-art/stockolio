'use client';

import { useForm } from "react-hook-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import {signInWithEmail, signUpWithEmail} from "@/lib/actions/auth.actions";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

type SignInFormData = {
    email: string;
    password: string;
};

const SignIn = () => {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: '',
            password: '',
        },
        mode: 'onBlur'
    });

    const onSubmit= async (data: SignInFormData) =>  {
        try {
            const result = await signInWithEmail(data);
            if(result.success) router.push('/')
        } catch (e) {
            console.error(e);
            toast.error('Sign In Failed',{
                description: e instanceof Error ? e.message: 'Failed to Sign In'
            })
        }
    }

    return (
        <>
            <h1 className="form-title">Welcome Back</h1>

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

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
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
                
                <div className="flex justify-end -mt-2">
                    <Link href="/forgot-password" className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">
                        Forgot Password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn w-full mt-5"
                >
                    {isSubmitting ? 'Signing you in...' : 'Sign In'}
                </Button>

                <FooterLink
                    text="Don't have an account? "
                    linkText="Sign Up"
                    href="/sign-up"
                />

            </form>
        </>
    );
};

export default SignIn;