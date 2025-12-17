import React from "react";

interface IconProps {
    name: string;
    className?: string;
}

export default function Icon({ name, className = "" }: IconProps) {
    return <span className={`material-icons-round ${className}`}>{name}</span>;
}
