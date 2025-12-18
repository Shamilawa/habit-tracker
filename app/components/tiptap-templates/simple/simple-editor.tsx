// @ts-nocheck
"use client"

import { useEffect, useRef, useState } from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection } from "@tiptap/extensions"
import { Placeholder } from "@tiptap/extension-placeholder"

// --- UI Primitives ---
import { Button } from "@/app/components/tiptap-ui-primitive/button"
import { Spacer } from "@/app/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/app/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/app/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/app/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/app/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/app/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/app/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/app/components/tiptap-node/list-node/list-node.scss"
import "@/app/components/tiptap-node/image-node/image-node.scss"
import "@/app/components/tiptap-node/heading-node/heading-node.scss"
import "@/app/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/app/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/app/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/app/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/app/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/app/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from "@/app/components/tiptap-ui/color-highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/app/components/tiptap-ui/link-popover"
import { MarkButton } from "@/app/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/app/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/app/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/app/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/app/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/app/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { useWindowSize } from "@/hooks/use-window-size"
import { useCursorVisibility } from "@/hooks/use-cursor-visibility"

// --- Components ---


// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

// --- Styles ---
import "@/app/components/tiptap-templates/simple/simple-editor.scss"

// --- Icons --- (Adding Icon from app/components/ui/Icon)
import Icon from "@/app/components/ui/Icon";

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
  lastSavedRequestAt?: Date | null;
  isSaving?: boolean;
  onSave?: () => void;
}

const MainToolbarContent = ({
  onHighlighterClick,
  onLinkClick,
  isMobile,
  onSave,
  isSaving,
  lastSavedRequestAt,
}: {
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  lastSavedRequestAt?: Date | null;
}) => {
  return (
    <>
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} portal={isMobile} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <div className="flex items-center gap-2 px-2">
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
          <Button onClick={onSave} disabled={isSaving || !onSave} size="sm">
            <Icon name="save" className="text-sm mr-1" />
            Save
          </Button>
        </div>
      </ToolbarGroup>

    </>
  );
}

const MobileToolbarContent = ({
  type,
  onBack
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
)

export function SimpleEditor({
  content,
  onChange,
  editable = true,
  lastSavedRequestAt,
  isSaving,
  onSave,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = useState("main")
  const toolbarRef = useRef(null)

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      Placeholder.configure({
        placeholder: "Add a note for today, Especially event or something memorable. This will help you look back in the future",
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content,
  })

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                bottom: `calc(100% - ${height - rect.y}px)`,
              }
              : {}),
          }}>
          {mobileView === "main" ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView("highlighter")}
              onLinkClick={() => setMobileView("link")}
              isMobile={isMobile}
              onSave={onSave}
              isSaving={isSaving}
              lastSavedRequestAt={lastSavedRequestAt}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === "highlighter" ? "highlighter" : "link"}
              onBack={() => setMobileView("main")} />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}
