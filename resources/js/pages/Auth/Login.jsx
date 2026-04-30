import Logo from '@/assets/logo-main.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import RightSide from './RightSide';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/login', {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex h-screen w-full overflow-hidden bg-background">
            {/* Left Side - Login Form */}
            <div className="flex w-full items-center justify-center overflow-y-auto px-8 py-12 lg:w-1/2 lg:px-16">
                <div className="w-full max-w-md">
                    {/* Logo & Header */}
                    <div className="mb-10">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-card shadow-lg ring-1 ring-border">
                                <img
                                    src={Logo}
                                    alt="Zaaag Shipping Logo"
                                    className="h-full w-full object-contain p-1"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Zaaag POS
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Accounting System
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                Welcome Back
                            </h2>
                            <p className="text-muted-foreground">
                                Sign in to access your account and manage your
                                POS operations
                            </p>
                        </div>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-foreground"
                            >
                                Email Address
                            </Label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    className="h-12 border-border bg-card pl-12 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                    placeholder="Enter your email"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Password
                                </Label>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    className="h-12 border-border bg-card pr-12 pl-12 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In to Account'
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side - Image/Illustration */}
            <RightSide />
        </div>
    );
}
