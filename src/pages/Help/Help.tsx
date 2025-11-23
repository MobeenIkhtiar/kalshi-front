import React, { useState, useRef } from 'react';
import Input from '@components/reusable/Input';
import Textarea from '@components/reusable/Textarea';
import Button from '@components/reusable/Button';
import contactService from '@services/contact.service';

type TabType = 'contact' | 'faq' | 'guides';

const Help: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('contact');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileErrors, setFileErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateFile = (file: File): string | null => {
        // Check file type (images only)
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            return `${file.name} is not a valid image file. Only JPEG, PNG, GIF, and WebP are allowed.`;
        }

        // Check file size (5MB max)
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
            return `${file.name} exceeds 5MB limit.`;
        }

        return null;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newErrors: string[] = [];
            const validFiles: File[] = [];

            // Check total file count
            if (selectedFiles.length + files.length > 5) {
                setFileErrors(['Maximum 5 images allowed']);
                return;
            }

            files.forEach((file) => {
                const error = validateFile(file);
                if (error) {
                    newErrors.push(error);
                } else {
                    validFiles.push(file);
                }
            });

            if (newErrors.length > 0) {
                setFileErrors(newErrors);
            } else {
                setFileErrors([]);
                setSelectedFiles(prev => [...prev, ...validFiles]);
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        const newErrors: string[] = [];
        const validFiles: File[] = [];

        // Check total file count
        if (selectedFiles.length + files.length > 5) {
            setFileErrors(['Maximum 5 images allowed']);
            return;
        }

        files.forEach((file) => {
            const error = validateFile(file);
            if (error) {
                newErrors.push(error);
            } else {
                validFiles.push(file);
            }
        });

        if (newErrors.length > 0) {
            setFileErrors(newErrors);
        } else {
            setFileErrors([]);
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setFileErrors([]);
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        // Validate name
        if (!formData.name || formData.name.trim().length === 0) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Validate email
        if (!formData.email || formData.email.trim().length === 0) {
            newErrors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = 'Invalid email format';
            }
        }

        // Validate message
        if (!formData.message || formData.message.trim().length === 0) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        } else if (formData.message.trim().length > 5000) {
            newErrors.message = 'Message must be less than 5000 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(false);

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);

            // Log form submission details
            console.log('Submitting contact form:', {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                messageLength: formData.message.trim().length,
                filesCount: selectedFiles.length
            });

            // Submit contact form with files
            const response = await contactService.submitContact({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                message: formData.message.trim(),
                files: selectedFiles.length > 0 ? selectedFiles : undefined
            });

            if (response.success) {
                setSubmitSuccess(true);
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    message: ''
                });
                setSelectedFiles([]);
                setFileErrors([]);
                setErrors({});

                // Clear success message after 5 seconds
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 5000);
            } else {
                setSubmitError(response.message || 'Failed to submit contact form');
            }
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            
            // Handle validation errors from backend
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const backendErrors: { [key: string]: string } = {};
                error.response.data.errors.forEach((err: string) => {
                    if (err.toLowerCase().includes('name')) {
                        backendErrors.name = err;
                    } else if (err.toLowerCase().includes('email')) {
                        backendErrors.email = err;
                    } else if (err.toLowerCase().includes('message')) {
                        backendErrors.message = err;
                    }
                });
                setErrors(backendErrors);
            }

            setSubmitError(
                error.response?.data?.message || 
                'Failed to submit contact form. Please try again later.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const cardStyle = {
        background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)',
        borderRadius: '10px',
    };

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-semibold tracking-wider text-white mb-2">Help & Documentation</h1>
                <p className="text-gray-400 text-lg">
                    Find Answers, Guides, And Get AI-Powered Support
                </p>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 mb-6 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-6 py-3 font-medium transition-all duration-200 ${
                        activeTab === 'contact'
                            ? 'bg-gray-900 text-white border-b-2 border-green-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Contact Support
                </button>
                <button
                    onClick={() => setActiveTab('faq')}
                    className={`px-6 py-3 font-medium transition-all duration-200 ${
                        activeTab === 'faq'
                            ? 'bg-gray-900 text-white border-b-2 border-green-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    FAQ's
                </button>
                <button
                    onClick={() => setActiveTab('guides')}
                    className={`px-6 py-3 font-medium transition-all duration-200 ${
                        activeTab === 'guides'
                            ? 'bg-gray-900 text-white border-b-2 border-green-500'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Guides & Tutorials
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'contact' && (
                <div className="p-6 rounded-lg" style={cardStyle}>
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-white mb-2">Contact Support</h2>
                        <p className="text-gray-400">
                            Can't Find What You're Looking For? Send Us A Message
                        </p>
                    </div>

                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <p className="text-green-400 text-sm">
                                Contact form submitted successfully! We will get back to you soon.
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {submitError && (
                        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                            <p className="text-red-400 text-sm">{submitError}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Name and Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Name</label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                    inputClassName={`bg-transparent border placeholder-[#666666] focus:ring-0 focus:border-[rgba(255,255,255,0.3)] ${
                                        errors.name 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-[rgba(255,255,255,0.2)]'
                                    }`}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    inputClassName={`bg-transparent border placeholder-[#666666] focus:ring-0 focus:border-[rgba(255,255,255,0.3)] ${
                                        errors.email 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-[rgba(255,255,255,0.2)]'
                                    }`}
                                    required
                                />
                                {errors.email && (
                                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Message Field */}
                        <div className="mb-4">
                            <label className="block text-gray-400 text-sm mb-2">
                                Message 
                            </label>
                            <Textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Describe Your Issue In Details "
                                rows={6}
                                className={`bg-transparent border placeholder-[#666666] focus:ring-0 focus:border-[rgba(255,255,255,0.3)] ${
                                    errors.message 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-[rgba(255,255,255,0.2)]'
                                }`}
                                required
                            />
                            {errors.message && (
                                <p className="text-red-400 text-xs mt-1">{errors.message}</p>
                            )}
                        </div>

                        {/* File Attachment Section */}
                        <div className="mb-6">
                            <label className="block text-gray-400 text-sm mb-2">
                                Attach Images (Optional) 
                            </label>
                            
                            {/* File Errors */}
                            {fileErrors.length > 0 && (
                                <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    {fileErrors.map((error, index) => (
                                        <p key={index} className="text-red-400 text-xs">{error}</p>
                                    ))}
                                </div>
                            )}

                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-8 text-center cursor-pointer hover:border-[rgba(255,255,255,0.3)] transition-colors"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center">
                                    <svg
                                        className="w-12 h-12 text-gray-400 mb-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    <p className="text-gray-400 text-sm">
                                        Upload Screenshots Or Images To Help Us Understand Your Issue
                                    </p>
                                    <p className="text-gray-500 text-xs mt-2">
                                        Click to browse or drag and drop images here (JPEG, PNG, GIF, WebP)
                                    </p>
                                </div>
                            </div>

                            {/* Selected Files List */}
                            {selectedFiles.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {selectedFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-white text-sm">{file.name}</span>
                                                <span className="text-gray-500 text-xs">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFile(index)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                                Send Support Request
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'faq' && (
                <div className="p-6 rounded-lg" style={cardStyle}>
                    <h2 className="text-2xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
                    <p className="text-gray-400">FAQ content will be displayed here.</p>
                </div>
            )}

            {activeTab === 'guides' && (
                <div className="p-6 rounded-lg" style={cardStyle}>
                    <h2 className="text-2xl font-semibold text-white mb-4">Guides & Tutorials</h2>
                    <p className="text-gray-400">Guides and tutorials content will be displayed here.</p>
                </div>
            )}
        </div>
    );
};

export default Help;
