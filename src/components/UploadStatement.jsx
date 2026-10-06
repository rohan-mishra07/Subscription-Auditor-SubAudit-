import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function UploadStatement({ onUploadSuccess }) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles || acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);

      setLoading(true);
      try {
        const response = await axios.post(
          'http://localhost:8080/api/subscriptions/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          (typeof error.response?.data === 'string'
            ? error.response.data
            : null) ||
          error.message ||
          'Upload failed. Please try again.';

        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    disabled: loading,
  });

  return (
    <div className="w-full max-w-xl mx-auto my-8">
      <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Upload Bank Statement
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Drag and drop your PDF bank statement to audit recurring subscriptions automatically.
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-gray-300 hover:border-indigo-400 bg-gray-50/50 hover:bg-indigo-50/20'
          } ${loading ? 'opacity-60 pointer-events-none' : ''}`}
        >
          <input {...getInputProps()} />

          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <svg
                className="animate-spin h-10 w-10 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm font-medium text-indigo-600 animate-pulse">
                Analyzing statement transactions...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-1">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
              </div>
              <div className="text-gray-700 font-medium">
                {isDragActive ? (
                  <span className="text-indigo-600">Drop your PDF file here...</span>
                ) : (
                  <span>
                    Drag & drop your PDF statement here, or{' '}
                    <span className="text-indigo-600 underline font-semibold">browse</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">PDF files only</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
