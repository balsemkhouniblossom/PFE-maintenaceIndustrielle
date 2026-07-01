"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import api from "@/services/api";

export default function VerifyEmailPage() {
    const params = useSearchParams();
    const router = useRouter();
    const routeParams = useParams<{ locale: string }>();
    const locale = routeParams.locale || "en";

    useEffect(() => {
        const token = params.get("token");

        if (!token) return;

        api
            .get(`/auth/verify-email`, {
                params: { token },
            })
            .then(() => {
                router.replace(`/${locale}/auth/login?verified=true`);
            })
            .catch(() => {
                router.replace(`/${locale}/auth/login?verified=false`);
            });
    }, [params, router, locale]);

    return (
        <div style={{ padding: 50 }}>
            <h2>Verifying your email...</h2>
        </div>
    );
}