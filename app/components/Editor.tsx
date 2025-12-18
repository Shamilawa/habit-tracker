"use client";

import { SimpleEditor } from "./tiptap-templates/simple/simple-editor";

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    lastSavedRequestAt?: Date | null;
    isSaving?: boolean;
    onSave?: () => void;
}

export default function Editor(props: EditorProps) {
    return <SimpleEditor {...props} />;
}

