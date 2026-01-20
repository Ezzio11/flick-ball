"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

export default function ClarityComponent() {
    useEffect(() => {
        Clarity.init("v4cvpv4e42");
    }, []);

    return null;
}
