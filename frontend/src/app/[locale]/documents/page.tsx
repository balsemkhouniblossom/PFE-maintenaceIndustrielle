"use client";
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiService } from '@/services/api';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    DocumentIcon,
    EyeIcon,
    CloudArrowUpIcon,
    TagIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

import { Dialog } from '@headlessui/react';
import dynamic from "next/dynamic";


interface DocumentType {
    _id: string;
    document_id: string;
    machine_id: any;
    type_document: string;
    file_path: string;
    file_name: string;
    description?: string;
    tags?: string[];
    uploaded_by?: string;
    date_ajout: string;
}

interface Machine {
    _id: string;
    machine_id: string;
}
const PdfViewer = dynamic(() => import("@/app/[locale]/documents/PdfViewer"), {
    ssr: false,
});

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [selectedMachine, setSelectedMachine] = useState('');
    const [uploadMachine, setUploadMachine] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    const [numPages, setNumPages] = useState<number | null>(null);


    const getFileUrl = (path: string) =>
        `http://localhost:3001${path}`;


    useEffect(() => {
        loadData();
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setViewerOpen(false);
        }

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);

    }, []);

    async function loadData() {
        try {
            setLoading(true);

            const [docsRes, machinesRes] = await Promise.all([
                apiService.getDocuments(),
                apiService.getMachines(),
            ]);

            setDocuments(docsRes.data);
            setMachines(machinesRes.data);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        return documents.filter((d) => {
            const matchSearch =
                d.file_name?.toLowerCase().includes(search.toLowerCase()) ||
                d.description?.toLowerCase().includes(search.toLowerCase());

            const matchMachine =
                !selectedMachine || d.machine_id?._id === selectedMachine;

            return matchSearch && matchMachine;
        });
    }, [documents, search, selectedMachine]);

    function addTag() {
        if (tagInput.trim() && !tags.includes(tagInput)) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    }

    function removeTag(tag: string) {
        setTags(tags.filter(t => t !== tag));
    }

    async function handleUpload() {
        if (!file) {
            alert("Please select a PDF file");
            return;
        }

        if (!uploadMachine) {
            alert("Please select a machine");
            return;
        }

        const formData = new FormData();

        formData.append('file', file);
        formData.append('document_id', crypto.randomUUID());
        formData.append('machine_id', uploadMachine);
        formData.append('type_document', 'pdf');
        formData.append('file_name', file.name);
        formData.append('tags', JSON.stringify(tags));

        await apiService.uploadDocument(formData);
        setUploadOpen(false);
        setFile(null);
        setTags([]);

        await loadData();
    }
    if (loading) {
        return (
            <DashboardLayout title="Documents">
                <div className="flex justify-center items-center h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Documents">

            {/* HEADER */}
            <div className="panel mb-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Documents & Manuals</h2>
                        <p className="text-gray-500 text-sm">
                            PDF viewer + machine documentation system
                        </p>
                    </div>

                    <button
                        onClick={() => setUploadOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <CloudArrowUpIcon className="w-5 h-5" />
                        Upload
                    </button>
                </div>

                {/* FILTERS */}
                <div className="mt-4 flex gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input
                            className="input-field pl-9"
                            placeholder="Search documents..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <select
                        className="input-field"
                        value={selectedMachine}
                        onChange={(e) => setSelectedMachine(e.target.value)}
                    >
                        <option value="">All machines</option>
                        {machines.map(m => (
                            <option key={m._id} value={m._id}>
                                {m.machine_id}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* DOCUMENT GRID */}
            <div className="grid grid-cols-3 gap-4">
                {filtered.map(doc => (
                    <div key={doc._id} className="panel hover:shadow-lg transition">

                        <div className="flex justify-between">
                            <DocumentIcon className="w-8 h-8 text-blue-600" />
                            <button
                                onClick={() => {
                                    setSelectedDoc(doc);
                                    setNumPages(null); // reset previous PDF state
                                    setViewerOpen(true); // open modal
                                }}
                                className="text-blue-600"
                            >
                                <EyeIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="font-bold mt-2">{doc.file_name}</h3>

                        <p className="text-sm text-gray-500">
                            {doc.description || 'No description'}
                        </p>

                        {/* TAGS */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags?.map(tag => (
                                <span
                                    key={tag}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1"
                                >
                                    <TagIcon className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="text-xs text-gray-400 mt-2">
                            Machine: {doc.machine_id?.machine_id}
                        </div>
                    </div>
                ))}
            </div>

            {/* ================= UPLOAD MODAL ================= */}
            <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black/40">
                <div className="bg-white p-6 rounded-lg w-[500px]">

                    <h2 className="text-lg font-bold mb-4">Upload Document</h2>

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <select
                        className="input-field w-full mt-3"
                        value={uploadMachine}
                        onChange={(e) => setUploadMachine(e.target.value)}
                    >
                        <option value="">Select Machine</option>

                        {machines.map((m) => (
                            <option key={m._id} value={m._id}>
                                {m.machine_id}
                            </option>
                        ))}
                    </select>
                    {/* TAGS */}
                    <div className="mt-3 flex gap-2">
                        <input
                            className="input-field flex-1"
                            placeholder="Add tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                        />
                        <button onClick={addTag}>Add</button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map(tag => (
                            <span key={tag} className="bg-gray-200 px-2 py-1 rounded flex items-center gap-2">
                                {tag}
                                <XMarkIcon onClick={() => removeTag(tag)} className="w-4 h-4 cursor-pointer" />
                            </span>
                        ))}
                    </div>

                    <button
                        onClick={handleUpload}
                        className="bg-blue-600 text-white w-full mt-4 py-2 rounded"
                    >
                        Upload
                    </button>

                </div>
            </Dialog>

            {/* ================= PDF VIEWER ================= */}
            <Dialog
                open={viewerOpen}
                onClose={() => setViewerOpen(false)}
                className="fixed inset-0 z-[99999]"
            >
                {/* BACKDROP */}
                <div className="fixed inset-0 bg-black/70" />

                {/* CENTER WRAPPER */}
                <div className="fixed inset-0 flex items-center justify-center p-4">

                    {/* MODAL PANEL */}
                    <Dialog.Panel className="bg-white w-full max-w-6xl h-[95vh] rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        {/* HEADER */}
                        <div className="flex justify-between items-center px-4 py-3 border-b">
                            <h2 className="font-semibold text-gray-800">
                                {selectedDoc?.file_name}
                            </h2>

                            <button
                                onClick={() => setViewerOpen(false)}
                                className="text-gray-500 hover:text-red-500 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* PDF BODY */}
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
                            {selectedDoc && (
                                <div className="flex justify-center">
                                    <PdfViewer file={getFileUrl(selectedDoc.file_path)} />
                                </div>
                            )}
                        </div>

                    </Dialog.Panel>
                </div>
            </Dialog>

        </DashboardLayout>
    );
}