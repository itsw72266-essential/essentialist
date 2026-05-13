"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading editor…
    </div>
  ),
});

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["link", "blockquote", "code-block"],
  ["clean"],
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Share full details…",
  minHeight = 260,
  readOnly = false,
  className = "",
}) {
  const modules = useMemo(
    () => ({
      toolbar: readOnly ? false : TOOLBAR_OPTIONS,
    }),
    [readOnly]
  );

  return (
    <div
      className={`quill-editor overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
      style={{ minHeight, height: minHeight }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        modules={modules}
        className="h-full"
        style={{ height: "100%" }}
      />
    </div>
  );
}