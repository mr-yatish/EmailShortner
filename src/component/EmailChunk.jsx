import { useState } from 'react';
import * as XLSX from 'xlsx';

function EmailChunk({ setShowEmailChunk }) {
    const [excelData, setExcelData] = useState([]);
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [emailChunks, setEmailChunks] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setExcelData(jsonData);
        };

        reader.readAsArrayBuffer(file);
        setLoading(false)
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const filtered = excelData.filter((row) => row.NAME === name);
        const emails = filtered.map((row) => row.EMAILS).filter(Boolean);

        const chunkSize = parseInt(limit, 10);
        const chunks = [];

        for (let i = 0; i < emails.length; i += chunkSize) {
            chunks.push(emails.slice(i, i + chunkSize));
        }

        setEmailChunks(chunks);
        setName("")
        setLimit("")
        setExcelData("")
    };

    const handleCopy = async (emails, index) => {
        try {
            await navigator.clipboard.writeText(emails.join(', '));
            handleRemoveChunk(index)
            alert('Emails copied to clipboard!');
        } catch (err) {
            alert('Failed to copy emails.');
        }
    };
    const handleRemoveChunk = (index) => {
        const updatedChunks = [...emailChunks];
        updatedChunks.splice(index, 1); // Remove the element at the specified index
        setEmailChunks(updatedChunks);
    };
    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <button onClick={() => setShowEmailChunk(false)} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
                    Back
                </span>
            </button>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Excel Email Chunks</h1>

                <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-6 shadow-lg">
                    <div>
                        <label htmlFor="file" className="block mb-1 font-medium">Upload Excel File</label>
                        <input
                            type="file"
                            id="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => { setLoading(true), handleFileUpload(e) }}
                            className="w-full bg-white text-black p-2 rounded"
                        />
                        {loading && <div className='loader'></div>}
                    </div>
                    <div>
                        <label htmlFor="name" className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white text-black p-2 rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="limit" className="block mb-1 font-medium">Chunk Limit</label>
                        <input
                            type="number"
                            id="limit"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className="w-full bg-white text-black p-2 rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white py-2 rounded font-semibold"
                    >
                        Submit
                    </button>
                </form>

                {emailChunks.length > 0 && (
                    <div className="mt-10 space-y-6">
                        <h2 className="text-xl font-semibold mb-4">Email Chunks</h2>
                        {emailChunks.map((chunk, index) => (
                            <div key={index} className="bg-gray-800 relative max-h-32 overflow-auto p-4 rounded-lg border border-gray-700 shadow">
                                <div className="mb-2 font-medium">Chunk {index + 1} , length : {chunk.length}</div>
                                <div className="text-sm mb-4 break-all text-gray-300">
                                    {chunk.join(', ')}
                                </div>
                                <button
                                    onClick={() => handleCopy(chunk, index)}
                                    className="absolute top-2 cursor-pointer right-2 bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-semibold"
                                >
                                    Copy Emails
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmailChunk;
