"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import Icon from "./ui/Icon";
import { cn } from "../../lib/utils"; // Assuming utils exists, if not I'll handle it. I saw utils dir.

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    editable?: boolean;
    lastSavedRequestAt?: Date | null;
    isSaving?: boolean;
    onSave?: () => void;
}

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    icon,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: string;
    title: string;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "p-1.5 rounded-md transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800",
            isActive && "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white",
            disabled && "opacity-50 cursor-not-allowed"
        )}
        title={title}
        type="button"
    >
        <Icon name={icon} className="text-xl" />
    </button>
);

const Separator = () => (
    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
);

export default function Editor({
    content,
    onChange,
    editable = true,
    lastSavedRequestAt,
    isSaving,
    onSave,
}: EditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: "Write something...",
            }),
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
            },
        },
    });

    // Update content if it changes externally
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // We use a simple check here. For a production app with collaborative editing
            // or complex cursor management, we might need Y.js or smarter diffing.
            // Since we key-remount on date change, this primarily handles initial async load.
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    return (
        <div className="flex flex-col h-full border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark shadow-sm">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive("bold")}
                        icon="format_bold"
                        title="Bold"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive("italic")}
                        icon="format_italic"
                        title="Italic"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive("underline")}
                        icon="format_underlined"
                        title="Underline"
                    />

                    <Separator />

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive("bulletList")}
                        icon="format_list_bulleted"
                        title="Bullet List"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive("orderedList")}
                        icon="format_list_numbered"
                        title="Ordered List"
                    />
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive("taskList")}
                        icon="check_box"
                        title="Task List"
                    />

                    <Separator />

                    <MenuButton
                        onClick={setLink}
                        isActive={editor.isActive("link")}
                        icon="link"
                        title="Link"
                    />
                    {/* Placeholder for Image - to match screenshot loosely without functionality yet */}
                    <MenuButton
                        onClick={() => { }}
                        disabled={true}
                        icon="image"
                        title="Image (Coming soon)"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mr-2">
                        {isSaving ? (
                            <span>Saving...</span>
                        ) : lastSavedRequestAt ? (
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="hidden sm:inline">Saved</span>
                            </div>
                        ) : null}
                    </div>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                            "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200",
                            isSaving && "opacity-70 cursor-wait"
                        )}
                    >
                        <Icon name="save" className="text-sm" />
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-8 cursor-text" onClick={() => editor.chain().focus().run()}>
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
